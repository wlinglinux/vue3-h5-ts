import { onFrontEvents } from '@/components/events/front-event'
import { useSiteStore } from '@/store/site'
import { useInteractionStore } from '@/store/interaction'
import { showToast } from '@/components/utils/'
import { resetSubmitStatus } from '@/components/utils/'
import { postWbEvent } from '@/components/events/post-event'
import { onPostStatics } from '@/service/statics'
import { isHasOwnProperty, getCompIdByParam, EventBus } from '@/utils/'

function onEvent(item: IComponent) {
  const eventShare = item.eventShare
  eventShare.isSuccess = false
  eventShare.communicationData = { msg: "", code: -1, data: {} }
  const jumpUrl = "click"
  const comType = "click"
  const wModule = "click"
  onPostStatics({ item, e: eventShare && eventShare.e, comType, wModule,  jumpUrl, params: '', apiUri: '' })
  
  const useSite = useSiteStore()
  const useInteraction = useInteractionStore()
  // if(!this.siteInfo.md.isMobile && isHasOwnProperty(this.siteAttrs, "isPcInteraction") && !this.siteAttrs.isPcInteraction) {
  //   this.showToast('亲，请扫描旁边的二维码在移动端查看哦！')
  //   return
  // }
  // const autoPlayAudioCompId = useInteraction.shareInteractionData.autoPlayAudioCompId
  // if(autoPlayAudioCompId) {
  //   useInteraction.shareInteractionData.autoPlayAudioCompId = ''
  //   autoPlayAudio(useSite.componentMap[autoPlayAudioCompId])
  // }
  if (eventShare.commonFrontEvents.length > 0) {
    eventShare.isClick = false
    onFrontEvents({ item, events: eventShare.commonFrontEvents })
  } else if (eventShare.wbEvents.length > 0 && eventShare.wbEvents[eventShare.eventIndex]) {
    if (useSite.siteInfo.isTemplate) {
      showToast('亲，模板只供查看页面哦！！！')
      resetSubmitStatus(item.eventShare)
      return
    }
    if (useSite.attrs.isOffline) {
      showToast('亲，活动已下线了哦！！！')
      resetSubmitStatus(item.eventShare)
      return
    }
    //倒计时提示
    // if (this.wbTime < 0) {
    //   this.showToast("活动还未开始！！请耐心等待")
    //   return
    // }
    eventShare.isClick = false
    postWbEvent({ item: item, loadEvent: null })
  } else {
    eventShare.isClick = false
    if(eventShare.commonEvents.length <= 0) {
      const eventAttr = item.eventAttr
      if(eventAttr && isHasOwnProperty(eventAttr, "isEmitInitEvent") && eventAttr.isEmitInitEvent) {
        EventBus.$emit("reloadInitEvent", { pageIndex: eventShare.pageId-1, popIndex: eventShare.popId-1 })
      }
      resetSubmitStatus(item.eventShare)
    } else {
      onFrontEvents({ item })
    }
  }
}

// function autoPlayAudio(item: IComponent) {
//   const relateEventCompId = getCompIdByParam(item.commonAttr.relateEventCompId)
//   if(relateEventCompId) {
//     EventBus.$emit("itemClick", {id: relateEventCompId, index: item.commonAttr.itemIndex, isReset: false})
//   }
// }

export {
  onEvent
}