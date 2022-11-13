import { EventBus, isJSON, isHasOwnProperty } from '@/utils/'
import { showPage, showPop, resetSubmitStatus, onEventLink } from '@/components/utils/'
import { useSiteStore } from '@/store/site'
import { useLoadsStore } from '@/store/loads'
import { useInteractionStore } from '@/store/interaction'
import { FRONT_EVENTS, EVENT_HOVER_TYPES, COMPONENT_TYPES } from '@/const/'
import { isPostWbEventOrCommonEvents } from '@/components/events/post-event'
import { openPushEvent, rotate3dEvent, interactionDataEvent, interactionEvent, compareInCompsEvent, showOrHiddenEvent, SaveImgEvent } from '@/components/events/fronts/'

function onFrontEvents({ item, events}: { item: IComponent, events?: IEvent[]}) {
  //添加的普通事件 并行执行
  const frontCommonEvents_ = events
  let commonEvents: IEvent[] = frontCommonEvents_ ? frontCommonEvents_ : item.eventShare.commonEvents
  let isContinue: boolean = false
  for(let i = 0, len = commonEvents.length; i < len; i++) {
    isContinue = frontEvent({ item, event: commonEvents[i] })
    if(!isContinue) {
      break
    }
  }
  if(frontCommonEvents_) {
    if(isContinue) {
      isPostWbEventOrCommonEvents({ item, loadEvent: null })
    }
  } else {
    resetSubmitStatus(item.eventShare)
  }
  item.eventShare.isEventPostFail = false
}

function frontEvent({ item, event }: {item: IComponent, event: IEvent}) {
  const loadsStore = useLoadsStore()
  const useSite = useSiteStore()
  const isLoadJsObj = loadsStore.isLoadJsObj
  const eventShare = item.eventShare
  let popId: number
  let pageId: number
  let isContinue: boolean = true
  switch (event.type) {
    case EVENT_HOVER_TYPES.animate:
      if(isHasOwnProperty(item.interactionData, 'isSelected') && item.interactionData.isSelected) {
        eventShare.cssGsapAnimate.playAnimateOrGsap()
      } else {
        eventShare.cssGsapAnimate.clearAnimates()
      }
      break
    case EVENT_HOVER_TYPES.openPush:
      openPushEvent(item, event)
      break
    case EVENT_HOVER_TYPES.layerClose:
      EventBus.$emit("closePop")
      break
    case EVENT_HOVER_TYPES.link:
      if(event.comps[3] && event.comps[3].attrs.delayTime) {
        const delayTime: number = event.comps[3].attrs.delayTime ? event.comps[3].attrs.delayTime : 0
        if(delayTime) {
          window.setTimeout(() => {
            onEventLink(event, item)
          }, delayTime*1000)
        }
      } else {
        onEventLink(event, item)
      }
      break
    case EVENT_HOVER_TYPES.rotate3d:
      rotate3dEvent(item, event)
      isContinue = false
      break
    case EVENT_HOVER_TYPES.interactionData:
      interactionDataEvent(item, event)
      break
    case EVENT_HOVER_TYPES.compareInComps:
      isContinue = compareInCompsEvent(item, event)
      if(isContinue){
        //继续执行
      } else {
        resetSubmitStatus(eventShare)
      }
      break
    case EVENT_HOVER_TYPES.frontEvents:
      isContinue = interactionEvent(item, event)
      break
    case EVENT_HOVER_TYPES.showOrHide:
      showOrHiddenEvent(item, event)
      break
    case EVENT_HOVER_TYPES.layer:
      // popId = event.attrs.value.replace(/[^0-9]/ig, "") - 1
      popId = _.parseInt(event.comps[0].attrs.value)
      // 将表单中的数据传递到弹层中的动态文本或是动态图片中
      if (event.comps[1]) {
        showPopSetShareData(event.comps[1].attrs.value)
      }
      //随机弹层，设置弹层中的组件数据 1743 悦木之源
      if (!popId) {
        if(event.comps[2] && event.comps[2].attrs.value){
          randomPop(event.comps[2].attrs.value)
        }else if(event.comps[3] && event.comps[3].attrs.value){
          relateCompPop(event.comps[3].attrs.value)
        }
      } else {
        showPop(popId)
      }
      break
    case EVENT_HOVER_TYPES.anchor:
      pageId = _.parseInt(event.comps[0].attrs.value)
      if(pageId) {
        showPage(pageId, item)
      } else if (event.comps[1].attrs.value || event.comps[2].attrs.value){
        let pageStr = event.comps[1].attrs.value
        let relatePageStr = event.comps[2].attrs.value
        if(relatePageStr && isJSON(relatePageStr)){
          //{"pages":[2,3,4,5,6],"relateCompId":"0c6a26d1-b303-48d7-a0d9-cb86e5ea474c"}
          pageId = relateCompPage(relatePageStr)
        } else if(pageStr){
          // 2,3,4,5,6 站点 2067
          pageId = randomPage(pageStr)
        }
        if(pageId) {
          showPage(pageId, item)
        }
      }
      break
    case EVENT_HOVER_TYPES.checkWeibo:
      if (useSite.userInfo.uid) {
        pageId = _.parseInt(event.comps[2].attrs.value)
        if(pageId) {
          showPage(pageId, item)
        }
      } else {
        isContinue = false
        resetSubmitStatus(eventShare)
        popId = _.parseInt(event.comps[0].attrs.value)
        if(popId) {
          showPop(popId)
        }else if(event.comps[1].attrs.value == 'login') {
          EventBus.$emit('login')
        }
      }
      break
    case EVENT_HOVER_TYPES.saveImg:
      if(isLoadJsObj.isMoveable) {
        EventBus.$emit("exportSVG")
      }
      new SaveImgEvent(item, event)
      isContinue = false
      break
    default:
      break
  }
  return isContinue
}

function showPopSetShareData(compIds: string) {
  const useSite = useSiteStore()
  const useInteraction = useInteractionStore()
  let content = ''
  let url = ''
  if (compIds && compIds.length > 0) {
    let arr = compIds.split(",")
    _.forEach(arr, (compId: string) => {
      let relateCompId = compId
      if (relateCompId) {
        let componentData = useSite.componentMap[relateCompId]
        if (componentData.cid == COMPONENT_TYPES.wb_input) {
          content = useInteraction.formValueMap[relateCompId] && useInteraction.formValueMap[relateCompId].value
        } else if (componentData.cid == COMPONENT_TYPES.wb_img) {
          //页面中的动态图片，在弹层的动态图片中显示
          url = componentData.commonAttr.url
        } else if (componentData.cid == COMPONENT_TYPES.wb_radio) {
          url = useInteraction.formValueMap[relateCompId] && useInteraction.formValueMap[relateCompId].item.url
        }
      }
    })
    if (content && content.length > 0 || url && url.length > 0) {
      let shareData = { url }
      useInteraction.updateShareData(shareData)
    }
  }
}

function relateCompPage(pageStr: string): number {
  const useInteraction = useInteractionStore()
  const useSite = useSiteStore()

  const relateCompPageObj = JSON.parse(pageStr)
  const relateCompId = relateCompPageObj.relateCompId
  const pages = relateCompPageObj.pages
  //王者荣耀首页
  let relateComp = useSite.componentMap[relateCompId]
  let pageId = 0
  if(relateComp && relateComp.events && relateComp.events.follow){
    let isFllow  =  useSite.globalIsPost && useSite.globalIsPost.isFollowClickMap[relateCompId]
    pageId = isFllow ? relateCompPageObj.pages[1] : relateCompPageObj.pages[0]
  }else{
    const pageIndex = useInteraction.formValueMap[relateCompId].value
    pageId = pages[pageIndex]
  }
  return pageId
}


function randomPage(pageStr: string): number {
  const pages = pageStr.split(',')
  const randomIndex = _.random(0, pages.length-1)
  const pageId = parseInt(pages[randomIndex])
  return pageId
}

// {"pops":[2,3,4,5,6],"relateCompId":"fe607779-adc7-434a-87ff-c78af5fc7a8c"} 
// 根据关联组件来触发对应的弹层 站点1743
// {"rules":[3,50,100],"pops":[1,2,3], "key":""}
function relateCompPop(data: any){
  const useInteraction = useInteractionStore()
  if(isJSON(data)){
    const relateCompPopObj = JSON.parse(data);
    const relateCompId = relateCompPopObj.relateCompId;
    const pops = relateCompPopObj.pops;
    let popId = 0;
    let popIndex: string | number = 0
    if(relateCompId){
      popIndex = useInteraction.formValueMap[relateCompId].value;
    }else if(relateCompPopObj.key && relateCompPopObj.rules){
      const  rules = relateCompPopObj.rules
      let value = useInteraction.bindData[relateCompPopObj.key] || 0
      for(let i = 0; i < rules.length ;i++ ){
        if(value <= rules[i]){
          popIndex = i
          break
        }
      }
    } 
    popId = pops[popIndex]
    showPop(popId);
  }
}


function randomPop(data: any){
  // {"allRange":[0,20],"range":["1,20","0"],"popId":[4,3]} 站点
  if(isJSON(data)) {
    const randPopObj = JSON.parse(data)
    const ranges = randPopObj.range
    const allRanges = randPopObj.allRange
    const popIds = randPopObj.popId
    if(allRanges && allRanges.length > 0 && ranges && ranges.length > 0) {
      const random = _.random(allRanges[0], allRanges[1])
      if(random == ranges[1]) {
        showPop(popIds[1])
      } else {
        showPop(popIds[0])
      }
    } else if(allRanges && allRanges.length > 0) {
      const random = _.random(allRanges[0], allRanges[1])
      showPop(popIds[random])
    }
  }
}

export {
  frontEvent,
  onFrontEvents
}