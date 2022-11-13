import { showToast, openLinkBySelfUrl } from '@/components/utils/'
import { useSiteStore } from '@/store/site'
import { useControlsStore } from '@/store/controls'
import { useInteractionStore } from '@/store/interaction'
import { getCompIdByParam, replaceStr, isWeibo, EventBus } from '@/utils/'
import { POST_API_MAP } from '@/service/api'
import { CONTROL_TYPES } from '@/const/'
import AxiosService from '@/service/axios'
import { onPostStatics, API_VERSION } from '@/service/statics'

function openPushEvent(item: IComponent, event: IEvent) {
  const useInteraction = useInteractionStore()
  const useSite = useSiteStore()
  // const eventShare = item.eventShare

  let pics: any[] = []
  let jumpUrl_: string
  let isWeibo_: boolean
  let pic_ids: string = ''
  //发布类型:文字(0),选图(1),拍照(2),POI(3),长微博(4),话题(6),选视频(9)
  const type: string = event.comps[0].attrs.value
  let text: string = replaceStr(useInteraction.formValueMap, event.comps[1].attrs.value || '')
  //获取从其他交互中传入或者是设置的值
  const relateCompId: string = getCompIdByParam(event.comps[2].attrs.value)
  const pushData = getPicsAndTextByEvent(item, relateCompId)
  const additionalData = event.comps[3] && event.comps[3].attrs.value 
  const isJumpSelf = event.comps[4] && Boolean(event.comps[4].attrs.value) || false

  if(pushData.pics) {
    pics = pushData.pics
  }
  if(pushData.text) {
    text = pushData.text
  }

  jumpUrl_ = ''
  isWeibo_ = isWeibo()
  if (isWeibo_) {
    jumpUrl_ = 'sinaweibo://compose?'
  } else {
    jumpUrl_ = 'https://m.weibo.cn/compose?'
  }
  jumpUrl_ += 'content_type=' + type + '&content=' + encodeURIComponent(text)
  if(additionalData && additionalData.length > 0) {
    jumpUrl_ += additionalData
  }
  if (pics && pics.length > 0) {
    jumpUrl_ += '&pics=' + encodeURIComponent(JSON.stringify(pics))
    //自动发博
    if(!isWeibo_) {
      let pic_ids_: string[] = []
      _.forEach(pics, (picItem: IPushItemPic) => {
        if(picItem.pid) pic_ids_.push(picItem.pid)
      })
      pic_ids = pic_ids_.join()
      postPush(item, text, pic_ids, item.id)
      return
    }
  } else {
    //发博是否公开
    if(!useSite.attrs.push_visible) {
      jumpUrl_ += "&grouptype=2"
    } else {
      jumpUrl_ += "&grouptype=0"
    }
  }
  if(isJumpSelf){
    window.location.href  = jumpUrl_
  }else{
    openLinkBySelfUrl(jumpUrl_)
  }

  if(isWeibo_) {
    const comType = "click"
    const wModule = "openPush"
    onPostStatics({ item, e: item.eventShare.e, comType, wModule, jumpUrl: jumpUrl_, params: text, apiUri: ''});
  }
}
function getPicsAndTextByEvent(item: IComponent, relateCompId: string) {
  const useSite = useSiteStore()
  const useControls = useControlsStore()
  const useInteraction = useInteractionStore()

  //打开相册中设置的数据
  let text: string = ''
  let pics: IPushItemPic[] = []
  //在截图中保存的 数据
  if(useInteraction.frontData[item.id]) {
    pics = useInteraction.frontData[item.id].pics
    if(useInteraction.frontData[item.id].text) {
      text = useInteraction.frontData[item.id].text
    }
  }
  if(relateCompId && relateCompId.length > 0) {
    // 存在 关联组件id
    const relatePushBaseControl = useControls.controls[relateCompId][CONTROL_TYPES.wb_push]
    // wb_push 事件
    if(relatePushBaseControl) {
      const pushControlData = relatePushBaseControl.data as IPushControl
      if(pushControlData) {
        let elements = pushControlData.elements
        let itemIndex: number = 0
        let relateAttrCompId = getCompIdByParam(item.commonAttr.relateAttrCompId)
        if(relateAttrCompId && relateAttrCompId.length > 0) {
          const relateAttrCompData = useSite.componentMap[relateAttrCompId]
          if(relateAttrCompData.lists && relateAttrCompData.lists.length > 0) {
            const vote_id: number = relateAttrCompData.lists[item.commonAttr.itemIndex].voteId as number
            itemIndex = vote_id - 1
          }
        } else {
          itemIndex = item.commonAttr.itemIndex >= 0 ? item.commonAttr.itemIndex : 0
        }
        pics = elements[itemIndex].pics
        text = elements[itemIndex].text
        let pics_: any[] = []
        _.forEach(pics, (pic: IPushItemPic) => {
          pics_.push({
            thumbnail: pic.pic_url,
            original: pic.pic_url,
            pid: pic.pic_id,
          })
        })
        pics = pics_
      }
    }
    // 获取发博图片数组
  }
  return { pics, text }
}

async function postPush(item: IComponent,text: string, pic_ids: string, compId: string) {
  const useSite = useSiteStore()

  let url: string = POST_API_MAP.push
  let params: any = { text, pic_ids }
  params.site_id = useSite.siteInfo.id
  params.com_id = compId
  let { data } = await AxiosService.post(url, params)
  if(data.code != 0) {
    if (data.code == "900010") {
      nextTick(function () {
        EventBus.$emit('login')
      })
    }else{
      showToast(data.msg)
    }
  }else{
    showToast(data.msg)
  }
  let comType = "click"
  let apiUri = API_VERSION + url
  let wModule = "push"
  onPostStatics({ item, e: item.eventShare.e, comType, wModule, jumpUrl: '', params: { pic_ids }, apiUri })
}

export {
  openPushEvent
}