import { useSiteStore } from '@/store/site'
import { useControlsStore } from '@/store/controls'
import { H5_TYPE, PAGE_TYPE } from '@/const/'
import { EVENT_TYPES } from '@/store/models/events-data'
import { EventBus } from '@/utils/'

import { Toast } from 'vant'
import { Dialog } from 'vant'

function showPage(pageId: number, item?: IComponent) {
  const useSite = useSiteStore()
  const pages = useSite.pages
  const pageIndex: number = pageId - 1
  if(!pages[pageIndex]) {
    return
  }
  if (useSite.popIndex >= 0) {
    EventBus.$emit('closePop')
  }
  useSite.updatePageIndex(pageIndex)
  EventBus.$emit('pauseVideo', { pageId })
  EventBus.$emit('playOrPauseAudio', { isPlay: false })
  if(item) {
    EventBus.$emit('showPage', pageId)
  }
}

function showPop(popId: number) {
  const useSite = useSiteStore()
  const pops = useSite.pops
  const popIndex = popId - 1
  if(!pops[popIndex]){
    return
  }
  useSite.updatePopIndex(popIndex)
  EventBus.$emit('showPop', popIndex)
}

function showToast(msg: string) {
  if(_.trim(msg)) {
    Toast(msg)
  }
}

function showAlert(msg: string) {
  if(_.trim(msg)) {
    Dialog.alert({
      title: '',
      message: msg,
    });
  }
}

function isWbEvent({controlId, type}): boolean {
  let isWbEvent = false
  const events = EVENT_TYPES.wb
  _.forEach(events, (event_: IEvent) => {
    if(event_.controlId == controlId && event_.type == type) {
      isWbEvent = true
    }
  })
  return isWbEvent
}

function resetSubmitStatus(eventShare: IEventShare) {
  eventShare.isClick = true
  eventShare.eventIndex = 0
  eventShare.isPost = true
  eventShare.isClick = true
}

function getItemBaseControl(id: string, controlId: string): IBaseControl {
  const useControls = useControlsStore()
  return useControls.controls[id] && useControls.controls[id][controlId]
}
// 动态加载css脚本
function loadStyleString(cssText: string) {
  const style: any = document.createElement("style")
  style.type = "text/css"
  try {
      // firefox、safari、chrome和Opera
      style.appendChild(document.createTextNode(cssText))
  } catch(ex) {
      // IE早期的浏览器 ,需要使用style元素的stylesheet属性的cssText属性
      style.styleSheet.cssText = cssText
  }
  document.getElementsByTagName("head")[0].appendChild(style)
}


export {
  showPage,
  showPop,
  showToast,
  showAlert,
  isWbEvent,
  resetSubmitStatus,
  getItemBaseControl,
  loadStyleString,
}
export{
  isWbList,
  getWbListByItem,
  getListByItem,
  getWbListOrListByItem,
  getItemIndex,
  getCheckboxStr,
} from './list-item'

export{
  getCompStyle,
  getListItemConStyle,
  itemStyle,
  imgStyle,
  fontStyle,
  btnStyle,
  getTextStyle,
  processBorderStyle,
  convertCss,
  setNewMarginPadding,
  setNewPadding,
  setNewMargin,
} from './styles'


export{
  getSwiperPreStyle,
  getSwiperNextStyle,
  initHorizontalSwiper,
} from './carousel'


export{
  getDataKeyValue,
  getItemDataByCompData,
  getNumberControlData,
  getAttrByCustom,
  getBlogText
} from './data-drive'


export {
  onEventLink,
  openLinkBySelfUrl,
  onJump,
  onMidJump,
  getLink,
} from './jump-link'