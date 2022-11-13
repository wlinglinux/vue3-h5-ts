import { defineStore, acceptHMRUpdate } from 'pinia'
import { ShareInteractionData, BindData, ShareData, StaticData, FrontData } from '@/store/models/interaction'
import { useSiteStore } from '@/store/site'
import { getCompIdByParam, EventBus } from '@/utils/'
import { useControlsStore } from '@/store/controls'

export const useInteractionStore = defineStore('interaction', {
  state: (): IInteraction => {
    return {
      recoverCompMap: {},               //恢复组件显示，隐藏组件数据
      visibleComponents: {},            //事件成功或失败后需要显示的组件ids,
      frontData: new FrontData(),       //截图 上传 获取 pid存储在这个数据中，在打开发博框的时候取出这里的数据，为打开发博框提供数据 {pics:{thumbnail: original_pic,original: original_pic, pid: pic_id,}}
      formValueMap: {},                 //存储表单组件的当前选中的值，通过id来替换文本与组件相关的值，还有item.link，提交的时候可以跳转链接
      frontSelectScoreFormValues: { scoreFormValues: {}, scoreFormItems: {} }, //,//表单计分组件存储选择的答案
      statisticData: new StaticData(),                //统计数据 绑定字段 年度微博数据中会传过来一些微博用户数据（如发博，点赞数等），我们将这些数据存储到这个字段中，会遍历替换文本中的key
      shareData: new ShareData(),       //动态图片和动态文本共享数据 抽奖礼品的信息 列表中字段值
      bindData: new BindData(),         //绑定数据
      shareInteractionData: new ShareInteractionData(), //前端事件需要的数据都存储在这里进行数据共享和修改
      coverPageCropCompAttr: {},        //存储当前页面的截图组件id，打开页面的时候清除存储的组件id的url字段值
      canvasImgComponentMap: {},        //存储当前页面的截图组件id，发博后清除pics字段值
    }
  },
  getters: {

  },
  actions: {
    addNeedRecoverCompId(componentData: IComponent){
      if(!this.recoverCompMap[componentData.id]) {
        this.recoverCompMap[componentData.id] = _.cloneDeep(componentData.commonAttr)
      }
    },
    updateShareData(data: IShareData) {
      let isNull = true
      _.forEach(data, (value: string) => {
        if(value) isNull = false
      })
      if(isNull) return
      let shareData = this.shareData
      _.forEach(shareData, (value: string, key: string) => {
        if(_.isArray(value)) {
          shareData[key] = []
        }else{
          shareData[key] = ''
        }
      })
      _.merge(shareData, data)
    },
    resetVisibleComponents() {
      const useSite = useSiteStore()
      let commonAttr = { isVisible: false }
      _.forEach(this.visibleComponents, (compId: string) => {
      let componentData = useSite.componentMap[compId]
        if(componentData && componentData.id == compId){
          _.merge(componentData.commonAttr, commonAttr)
        }
      })
    },
    updateComponentVisible({id, commonAttr}: {id: string, commonAttr: any}) {
      const useSite = useSiteStore()
      this.visibleComponents[id] = id
      const componentData = useSite.componentMap[id]
      if(componentData) {
        _.merge(componentData.commonAttr, commonAttr)
      }
    },
    updateFrontData({id, data}: {id:string, data: any}){
      this.frontData[id] = data
    },
    updatePushPicItem({id, controlId, picItem, fileName}: {id: string, controlId: string, picItem: any, fileName?: string}){
      const useControls = useControlsStore()
      const useSite = useSiteStore()
      
      const baseControl: IBaseControl = useControls.controls[id][controlId] as IBaseControl
      const pushControlData: IPushControl = baseControl.data as IPushControl
      const elements = pushControlData.elements
      const compData = useSite.componentMap[id]
      const relateCompId = getCompIdByParam(pushControlData.relateCompId)
      const relateCompData = useSite.componentMap[relateCompId]
      let itemIndex = 0
      if((baseControl.data as IPushControl).isGetOther){
        if(relateCompId && relateCompData && relateCompData.commonAttr.itemIndex >= 0){
          itemIndex = relateCompData.commonAttr.itemIndex
        }
      }else{
        //其他动作赋的值 比如发博设置的pushIndex 或者是这个组件的3d旋转设置的
        itemIndex = compData.commonAttr.pushIndex || compData.commonAttr.itemIndex || 0
      }
      //有可能是-1，需要重置下值
      if(itemIndex < 0){
        itemIndex = 0
      }
      if(fileName) {
        let data: any = useControls.controls[id][controlId].data
        if(!data.fileNamePics) { data.fileNamePics = {} }
        data.fileNamePics[fileName] = picItem
      }
      elements[itemIndex].pics.push(picItem)
    },
    updatePageCropRecoverUrl({id, pageId}: {id: string, pageId: number}){
      if(this.coverPageCropCompAttr[pageId]) {
        const arr = this.coverPageCropCompAttr[pageId]
        if(arr.indexOf(id) == -1) {
          arr.push(id)
        }
      } else {
        this.coverPageCropCompAttr[pageId] = [id]
      }
    },
    updateFormValueMap(data: any) {
      const useSite = useSiteStore()

      if(!this.formValueMap[data.id]) {
        this.formValueMap[data.id] = { value: '' }
      }
      if(!_.isEqual(this.formValueMap[data.id], data)){
        useSite.siteInfo.formIsSubmit = true
      }
      this.formValueMap[data.id] = {
        ...data,
      };
    },
    updateBindData({key, value}: {key: string, value: any}){
      this.bindData[key] = value
      EventBus.$emit("refreshDynamicData")
    },
    updateInteractionData(data: any){
      _.merge(this.shareInteractionData, data)
    },
    resetInteractionData(){
      this.shareInteractionData = new ShareInteractionData()
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useInteractionStore, import.meta.hot))
}
