import BaseStore from '@/components/utils/BaseStore'
import { isPostWbEventOrCommonEvents } from '@/components/events/post-event'
import { getCompIdByParam, isHasOwnProperty, EventBus, randomUploadFileName, getValueFromXml } from '@/utils/'
import { COMPONENT_TYPES, CONTROL_TYPES, SAVE_IMG_DATA_TYPES, EVENT_HOVER_TYPES } from '@/const/'
import { onPostStatics } from '@/service/statics'
import { showAlert } from '@/components/utils/'
import { useInteractionStore } from '@/store/interaction'
import { useUploadStore } from '@/store/upload'
import crc32 from '@/components/utils/crc/crc32'

const RECURSION_SEARCH_COMP_CIDS = [
  COMPONENT_TYPES.wb_camera,
  COMPONENT_TYPES.wb_scroll_container,
  COMPONENT_TYPES.wb_threes
]

const fileUploadUrl = 'https://sinastorage.com/file.hd.xxx.com/'
const fileUploadS3Url_ = 'https://picupload.xxx.com/interface/upload.php'

class SaveImgEvent extends BaseStore {
  private hiddenDoms: HTMLElement[]
  private timeOut: number
  private needCanvasCompData: IComponent | null
  private saveImgType: string
  private saveImgQuality: number
  private saveImgBgColor: string | null = null
  private fileName = ''

  constructor(item: IComponent, event?: IEvent) {
    super(item)
    this.item = item
    this.hiddenDoms = []
    this.timeOut = 20
    this.needCanvasCompData = null //截打组组件中是都有相机组件和滚动容器组件，有的话触发事件isStartHtml2canvas这个显示对应dom
    this.saveImgType = SAVE_IMG_DATA_TYPES[0].value
    this.saveImgQuality = 0.8
    
    if(event) {
      this.excute(event)
    }
  }

  excute(event: IEvent){
    if(event.comps[3]) {
      this.saveImgType = event.comps[3].attrs.value
      this.saveImgQuality = event.comps[3].attrs.quality
      if(this.saveImgType == SAVE_IMG_DATA_TYPES[0].value) {
        this.saveImgBgColor = '#ffffff'
      }
    }

    // 截图 默认如果什么参数都没有传就是截取整个页面，传了截图容器id，就会截取截图容器id内的内容，
    // 如果传了替换图片组件id，那么截取后canvas的图片会填充到这个组件中
    const pushCompId = getCompIdByParam(event.comps[0].attrs.value)
    const cropCompId = getCompIdByParam(event.comps[1].attrs.value)
    const hiddenCompIdsStr = event.comps[1].attrs.hiddenCompIds
    const hiddenCompIds = hiddenCompIdsStr ? JSON.parse(hiddenCompIdsStr) : []
    const repalceImgId = getCompIdByParam(event.comps[2].attrs.value)
    const isUploadImgToServer = isHasOwnProperty(event.comps[2].attrs, 'isUploadImgToServer') ? event.comps[2].attrs.isUploadImgToServer : true
    let canvasCon: HTMLElement | null  = null
    let cropUploadImgUrl = null
    if(cropCompId || repalceImgId){
      let cropCompData: IComponent
      if(cropCompId){
        cropCompData = this.componentMap[cropCompId]
        if(cropCompData){
          let needCropCompData = recursionSearchCropCompData(cropCompData)
          if(needCropCompData) {
            this.needCanvasCompData = needCropCompData
          }
        }
        canvasCon = document.getElementById(cropCompId)!
      }
      if(!canvasCon){
        window.scrollTo({top: 0, left: 0, behavior: 'auto'})
      }
      if(repalceImgId && !isUploadImgToServer){
        this.canvasImgInLocal({canvasCon, cropCompId, repalceImgId, hiddenCompIds})
      }else{
        if(cropCompId && cropCompData!.cid == COMPONENT_TYPES.wb_camera){
          //没有打开相册执行下面的事件 直接发博
          cropUploadImgUrl = cropCompData!.commonAttr.cropUploadImgUrl
          if(!cropUploadImgUrl) {
            isPostWbEventOrCommonEvents({ item: this.item ,loadEvent: null})
          } else {
            this.canvasImgOrUploadToServer({ canvasCon, cropCompId, repalceImgId, hiddenCompIds, pushCompId })
          }
        }else{
          this.canvasImgOrUploadToServer({ canvasCon, cropCompId, repalceImgId, hiddenCompIds, pushCompId })
        }
      }
    }else{
      this.canvasImgOrUploadToServer({ canvasCon, cropCompId, repalceImgId, hiddenCompIds, pushCompId })
    }
  }

  canvasImgInLocal({ canvasCon, cropCompId, repalceImgId, hiddenCompIds }) {
    const el = canvasCon ? canvasCon : document.getElementById("jianye-container")
    this.onHiddenDoms(canvasCon, el, hiddenCompIds)
    let cropCompData: any
    if(cropCompId) {
      cropCompData = this.componentMap[cropCompId]
    }
    this.onDisplayDoms(el, cropCompData)
    window.setTimeout(() => {
      const canvases = document.getElementsByTagName('canvas')
      window.html2canvas(el, {
        backgroundColor: this.saveImgBgColor,//设置图片背景为透明
        useCORS: true,
        async: true,
        logging: false,
        ignoreElements: (element: any) => {
          if(_.indexOf(canvases, element, 0) != -1) { return true }
        }
      }).then((canvas: any) => {
        this.onRecoverDoms(cropCompData)
        const canResultBase64 = this.getBase64ByType(canvas, this.saveImgType)
        const url = canResultBase64
        this.onSaveSuccessCb(repalceImgId, url)
        isPostWbEventOrCommonEvents({ item: this.item, loadEvent: null})
      })
    }, this.timeOut)
  }

  getBase64ByType(canvas: any, saveImgType: string) {
    if(this.saveImgType == SAVE_IMG_DATA_TYPES[0].value) {
      return canvas.toDataURL('image/' + saveImgType, Number(this.saveImgQuality))
    } else {
      return canvas.toDataURL()
    }
  }

  canvasImgOrUploadToServer({ canvasCon, cropCompId, repalceImgId, hiddenCompIds, pushCompId }) {
    let el = canvasCon ? canvasCon : document.getElementById("jianye-container")

    this.onHiddenDoms(canvasCon, el, hiddenCompIds)
    let cropCompData: any,repalceImgData:any
    if(cropCompId) {
      cropCompData = this.componentMap[cropCompId]
    }
    if(repalceImgId){
      repalceImgData = this.componentMap[repalceImgId]
    }
    this.onDisplayDoms(el, cropCompData)
    const this_ = this
    window.setTimeout(() => {
      const canvases = document.getElementsByTagName('canvas')
      window.html2canvas(el, {
        backgroundColor: this.saveImgBgColor,//设置图片背景为透明
        useCORS: true,
        async: true,
        logging: false,
        ignoreElements: (element: any) => {
          if(_.indexOf(canvases, element, 0) != -1) { return true }
        }
      }).then((canvas: any) => {
        this_.onRecoverDoms(cropCompData)
        const canResultBase64 = this.getBase64ByType(canvas, this.saveImgType)
        canvas.toBlob((blobObj: any) => {
          if(pushCompId || this_.item.events[EVENT_HOVER_TYPES.push] || this_.item.events[EVENT_HOVER_TYPES.openPush]) {
            this.setUploadParams(blobObj, canResultBase64, pushCompId, repalceImgId)
          }else if(this_.item.events[EVENT_HOVER_TYPES.submit] || repalceImgData.commonAttr.isForm) {
            this.setSaveUploadParams(blobObj, repalceImgId)
          }else {
            // if(isWeibo()){
              // this_.setSaveUploadParams(blobObj, repalceImgId);
            // }else{
              this.onSaveSuccessCb(repalceImgId, canResultBase64);
            // }
            isPostWbEventOrCommonEvents({ item: this.item, loadEvent: null})
          }
        }, 'image/' + this.saveImgType, Number(this.saveImgQuality))

      })
    }, this.timeOut)
  }
  onHiddenDoms(canvasCon: any, el: any, hiddenCompIds: string[]) {
    let hiddenDoms = this.hiddenDoms
    while(hiddenDoms.length > 0) {
      hiddenDoms.pop()
    }
    if(!canvasCon && hiddenCompIds){
      _.forEach(hiddenCompIds, (compId: string) => {
        let dom = document.getElementById(compId)!
        dom.style.display = "none"
        hiddenDoms.push(dom)
      })
    }
    //处理动画效果截图有问题的bug
    const lis = el.querySelectorAll('.swiper-li')
    _.forEach(lis, (li: any) => {
      li.classList.toggle("animate__fadeIn")
      li.classList.toggle("animate__animated")
    });
  }

  onDisplayDoms(el: any, cropCompData: any) {
    if(cropCompData) {
      if(this.needCanvasCompData) {
        EventBus.$emit("isStartHtml2canvas", { isStart: true, compId: this.needCanvasCompData.id})
      }
    }
  }

  onRecoverDoms(cropCompData: IComponent) {
    const hiddenDoms = this.hiddenDoms
    _.forEach(hiddenDoms, (dom: any) => {
      dom.style.display = "block"
    })
    if(cropCompData) {
      if(this.needCanvasCompData) {
        EventBus.$emit("isStartHtml2canvas", { isStart: false, compId: this.needCanvasCompData.id})
      }
    }
  }

  setSaveUploadParams(blobObj: Blob, repalceImgId: string, cbs?: Function, sbf?: Function) {
    const useUpload = useUploadStore()
    let picType = SAVE_IMG_DATA_TYPES[0].value
    if(this.saveImgType != SAVE_IMG_DATA_TYPES[0].value) {
      picType = SAVE_IMG_DATA_TYPES[1].value
    }
    const filename =  randomUploadFileName(this.siteStore.siteInfo.id) + picType
    const fileUploadData = _.cloneDeep(useUpload.fileUploadData)
    fileUploadData.key += filename
  
    const option = {
      action: fileUploadUrl,
      onSuccess: (response: any) => {
        let url = getValueFromXml(response)
        url = _.replace(url, 'http', 'https')
        url = _.replace(url, 'file', 'static')
        url = _.replace(url, '.s3.sinaapp.com', '')

        this.item.commonAttr.cropUploadImgUrl = url
        if(cbs) {
          cbs(url)
        } else {
          this.onSaveSuccessCb(repalceImgId, url)
          isPostWbEventOrCommonEvents({ item: this.item, loadEvent: null })
        }
      },
      onError: (e: any) => {
        console.log(e)
        if(sbf) {
          sbf()
        }
      },
      data: fileUploadData,
      fileKey: "file",
      file: blobObj,
    }
    upload(option)
  }

  setUploadParams(blobObj: Blob, base64: string, pushCompId: string, repalceImgId: string, fileName?: string, scb?: Function, fcb?: Function) {
    if(fileName) {
      this.fileName = fileName
    }
    const userInfo: IUserInfo = this.siteStore.userInfo
    const unit8Array = base64ToUInt8Array(base64)
    const url = fileUploadS3Url_ + "?ent=miniblog&appid=" + this.siteAttrs.wb_appkey + "&uid=" + userInfo.uid + "&file_source=67&cs=" + crc32(unit8Array, null)
    // let reader = new FileReader()
    // reader.onload = function() {
    let option = {
      action: url,
      onSuccess: (response: any) => {
        if (!response.ret) {
          showAlert(response.errno)
          return
        }
        const data = response.pic
        const pic_id = data.pid
        const original_pic = this.getImgURL(pic_id, 'large')
        //将截图上传的图片存在saveImg事件的组件上，不更新UI，不需要commit
        this.item.commonAttr.cropUploadImgUrl = original_pic;
  
        const jumpUrl = "upload"
        const comType = "onload"
        const wModule = "upload"
        onPostStatics({ item: this.item, e: this.item.eventShare.e ,comType, wModule, jumpUrl, params: '', apiUri: '' })
  
        if (repalceImgId) {
          this.onSaveSuccessCb( repalceImgId, original_pic)
        }
        const isPost = fileName ? false : true
        this.onSuccessCb(pic_id, original_pic, pushCompId, isPost)
        if(scb) {
          scb(original_pic)
        }
      },
      onError: (err) => {
        showAlert(err)
        if(fcb) {
          fcb()
        }
      },
      type: 'image',
      data: blobObj,
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" }
    }
    upload(option)
    // }
    // reader.readAsArrayBuffer(blobObj)
  }
  getImgURL(pid: string, type: string, https?: boolean): string {
    var url: string
    if (typeof(type) == "undefined") type = 'bmiddle'
    if (typeof(https) == "undefined") https = false
    if (pid[9] == 'w' || (pid[9] == 'y' && pid.length >= 32)) {
      var zone = (crc32(pid, null) & 3) + 1
      var ext = (pid[21] == 'g') ? 'gif' : 'jpg'
      if (https) {
        url = pid[9] == 'w' ? 'https://ww' + zone + '.sinaimg.cn/' + type + '/' + pid + '.' + ext :
          'https://wx' + zone + '.sinaimg.cn/' + type + '/' + pid + '.' + ext
      } else {
        url = pid[9] == 'w' ? 'http://ww' + zone + '.sinaimg.cn/' + type + '/' + pid + '.' + ext :
          'http://wx' + zone + '.sinaimg.cn/' + type + '/' + pid + '.' + ext
      }
    } else {
      var zone = (parseInt(pid.substr(-2, 2), 16) & 0xf) + 1
      if (https) {
        url = 'https://ss' + zone + '.sinaimg.cn/' + type + '/' + pid + '&690'
      } else {
        url = 'http://ss' + zone + '.sinaimg.cn/' + type + '/' + pid + '&690'
      }
    }
    return url
  }
  onSuccessCb(pic_id: string, original_pic: string, pushCompId: string, isPost: boolean = true) {
    const useInteraction = this.interactionStore
    const canvasImgComponentMap = useInteraction.canvasImgComponentMap
    const fileName = this.fileName
    if (pushCompId) {
      canvasImgComponentMap[pushCompId] = pushCompId
      let picItem = { pic_id, pic_url: original_pic }
      useInteraction.updatePushPicItem({ id: pushCompId, controlId: CONTROL_TYPES.wb_push, picItem, fileName })
    } else if (this.item.events[EVENT_HOVER_TYPES.push]) {
      canvasImgComponentMap[pushCompId] = pushCompId
      let picItem = { pic_id, pic_url: original_pic }
      useInteraction.updatePushPicItem({ id: this.item.id, controlId: CONTROL_TYPES.wb_push, picItem, fileName })
    } else if (this.item.events[EVENT_HOVER_TYPES.openPush]) {
      let cameraItem = {
        thumbnail: original_pic,
        original: original_pic,
        pid: pic_id,
      }
      let pics = [cameraItem]
      useInteraction.updateFrontData({ id: this.item.id, data: { pics } })
    }
    //从camara过来的，需要发事件继续执行组件剩余的事件
    if(isPost) {
      isPostWbEventOrCommonEvents({ item: this.item, loadEvent: null })
    }
  }
  
  onSaveSuccessCb(repalceImgId: string, url: string) {
    const useInteraction = useInteractionStore()
    const pageIndex = this.siteStore.pageIndex
  
    useInteraction.updatePageCropRecoverUrl({ id: repalceImgId, pageId: pageIndex + 1 })
    if (repalceImgId && repalceImgId.length > 0) {
      this.siteStore.updateComponentAttrUrl({ id: repalceImgId, commonAttr: { url } })
      const compData = this.componentMap[repalceImgId]
      if (compData && compData.commonAttr.isForm) {
        // 站点2476 图片作为表单数据被提交
        useInteraction.updateFormValueMap({
          id: repalceImgId,
          url,
        })
      }
    }
  }

  base64ToBlob(dataurl: any) {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
  }
  
  fileToBlob(dataURL: any, suffix: string, cbs: Function, cbf: Function) {
    this.saveImgType = suffix
    let blob = dataURLToBlob(dataURL)
    this.setSaveUploadParams(blob, '', cbs, cbf)
  }
  
  destroy(){
    super.destroy();
  }
}

//递归检索是否有相机组件和滚动容器组件
function recursionSearchCropCompData(componentData_: IComponent): null | IComponent {
  let components = componentData_.components
  if (RECURSION_SEARCH_COMP_CIDS.indexOf(componentData_.cid) !== -1) {
    return componentData_
  } else if (components && components.length > 0) {
    return recursionSearchCropCompData_(components)
  }
  return null
}

function recursionSearchCropCompData_(components: IComponent[]): IComponent | null {
  let componentData_: IComponent
  for (let i = 0, len = components.length; i < len; i++) {
    componentData_ = components[i]
    if (RECURSION_SEARCH_COMP_CIDS.indexOf(componentData_.cid) !== -1) {
      return componentData_
    } else if (componentData_.components && componentData_.components.length > 0) {
      return recursionSearchCropCompData_(componentData_.components)
    }
  }
  return null
}

function base64ToUInt8Array(base64) {
  let BASE64_MARKER = 'base64,'
  let raw
  let parts
  parts = base64.split(BASE64_MARKER)
  raw = window.atob(parts[1])
  let rawLength = raw.length
  var uInt8Array = new Uint8Array(rawLength)
  for (var i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i)
  }
  return uInt8Array
}


function dataURLToBlob(dataURL: any) {
  let BASE64_MARKER = ';base64,'
  let raw
  let contentType
  let parts
  if (dataURL.indexOf(BASE64_MARKER) == -1) {
    parts = dataURL.split(',')
    contentType = parts[0].split(':')[1]
    raw = decodeURIComponent(parts[1])

    return new Blob([raw], { type: contentType })
  }
  parts = dataURL.split(BASE64_MARKER);
  contentType = parts[0].split(':')[1];
  raw = window.atob(parts[1]);
  let rawLength = raw.length;
  var uInt8Array = new Uint8Array(rawLength);
  for (var i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return new Blob([uInt8Array], { type: contentType });
}
function upload(option: any): XMLHttpRequest{
  var xhr = new XMLHttpRequest()
  if (option.withCredentials) {
    xhr.withCredentials = true
  }
  var action = option.action
  let type = option.type ? option.type : 'formdata'
  let data
  if (type == 'image') {
    data = option.data
  } else {
    var formData = new FormData()
    if (option.data) {
      Object.keys(option.data).forEach((key) => {
        formData.append(key, option.data[key])
      })
    }
    formData.append(option.fileKey, option.file)
    data = formData
  }
  xhr.onerror = (e) => {
    option.onError(e)
  }
  xhr.onload = () => {
    if (xhr.status < 200 || xhr.status >= 300) {
      return option.onError(getError(action, option, xhr))
    }
    option.onSuccess(getBody(xhr))
  }
  xhr.open('post', action, true)
  var headers = option.headers || {}
  for (var key in headers) {
    if (isHasOwnProperty(headers, key) && headers[key] !== null) {
      xhr.setRequestHeader(key, headers[key])
    }
  }
  xhr.send(data)
  return xhr
}

function getError(action: string, option: any, xhr: XMLHttpRequest): any {
  let msg;
  if (xhr.response) {
    msg = '' + (xhr.response.error || xhr.response);
  } else if (xhr.responseText) {
    msg = '' + xhr.responseText;
  } else {
    msg = 'fail to post ' + action + ' ' + xhr.status;
  }
  let err: any = new Error(msg);
  err.status = xhr.status;
  err.method = 'post';
  err.url = action;
  return err;
}

function getBody(xhr: XMLHttpRequest): any {
  let text = xhr.responseText || xhr.response;
  if (!text) {
    return text;
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
}


export {
  SaveImgEvent,
}