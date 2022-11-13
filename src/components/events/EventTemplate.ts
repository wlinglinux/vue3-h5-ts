import CssGsapAnimate from '@/components/animate/CssGsapAnimate'
import BaseStore from '@/components/utils/BaseStore'
import { getCompIdByParam, isHasOwnProperty, EventBus } from '@/utils/'
import { FRONT_EVENTS, EVENT_HOVER_TYPES, MOUSE_BEHAVIOR_TYPE, COMPONENT_TYPES, ANIMATE_TRIGGER_TYPE_MAP, PAGE_TYPE } from '@/const/'
import { onInitEvent } from '@/components/events/init-event'
import { onLoadEvent } from '@/components/events/load-event'
import { onEvent } from '@/components/events/click-event'
import { isPostWbEventOrCommonEvents } from '@/components/events/post-event'
import { EventShare } from '@/store/models/Event'
import { resetSubmitStatus } from '@/components/utils/'
import { useSiteStore } from '@/store/site'

export default class EventTemplate extends BaseStore {
  public eventShare: IEventShare = new EventShare()

  constructor(item: IComponent, pageId: number, popId: number) {
    super(item)

    item.eventShare = this.eventShare
    item.eventShare.pageId = pageId
    item.eventShare.popId = popId
    
    this.initEventsFun()
    onInitEvent(item)

    if(_.size(this.eventShare.loadEvents) > 0) {
      this.onReloadLoadEvent = this.onReloadLoadEvent.bind(this)
      EventBus.$on("reloadLoadEvent", this.onReloadLoadEvent)
    }
    this.updateLoadEventNum()
    this.onItemPropagationClick = this.onItemPropagationClick.bind(this)
    this.onReloadOrPostInitEvent = this.onReloadOrPostInitEvent.bind(this)
    EventBus.$on("itemClick", this.onItemPropagationClick)
    EventBus.$on("reloadInitEvent", this.onReloadOrPostInitEvent)

    this.onShowPage = this.onShowPage.bind(this)
    EventBus.$on("showPage", this.onShowPage)
    EventBus.$on("showSwiperPage", this.onShowPage)
  }

  public updateLoadEventNum() {
    const popId = this.item.eventShare.popId
    const useSite = this.siteStore
    if(popId > 0) {
      const popCompLoadNum = useSite.siteInfo.popCompLoadNum - 1
      this.siteStore.updatePopReloadData(popCompLoadNum)
    } else {
      const compLoadNum = useSite.siteInfo.compLoadNum - 1
      this.siteStore.updateReloadData(compLoadNum)
    }
  }

  private initEventsFun() {
    let events: IEventMap = this.item.events
    if(!events || _.size(events) <= 0){
      return
    }
    let tempArr: IEvent[] = []
    let tempActionWbArr: IEvent[] = []
    _.forEach(events, (event: IEvent) => {
      //3d旋转只用作数据处理
      if(!isHasOwnProperty(event, "mouseBehavior") || event.mouseBehavior != MOUSE_BEHAVIOR_TYPE.data) {
        tempArr.push(event)
        if(event.controlId && event.controlId.length > 0 && isHasOwnProperty(event, "mouseBehavior")){
          tempActionWbArr.push(event)
        }
      }
    })
    tempArr = _.sortBy(tempArr, (event: IEvent) => { return event.index })
    let sortedActionWbEvents: IEvent[] = _.sortBy(tempActionWbArr, function(event: IEvent) { return event.index })

    if(sortedActionWbEvents.length > 0){
      this.eventShare.mainControlId = sortedActionWbEvents[0].controlId
    }

    _.forEach(tempArr, (event: IEvent) => {
      if(event.isInitComp){
        this.eventShare.initEvents.push(event)
      }
      if(event.mouseBehavior == MOUSE_BEHAVIOR_TYPE.click) {
        if(event.controlId && event.controlId.length > 0) {
          this.eventShare.wbEvents.push(event)
          this.eventShare.wbTypes.push(event.type)
        }else{
          if(FRONT_EVENTS.indexOf(event.type) != -1 || event.comps[0].attrs.isCommonFrontEvents){
            this.eventShare.commonFrontEvents.push(event)
          }else{
            this.eventShare.commonEvents.push(event)
          }
        }
      }
      if(event.mouseBehavior == MOUSE_BEHAVIOR_TYPE.load) {
        if(event.type == EVENT_HOVER_TYPES.shake || event.type == EVENT_HOVER_TYPES.activityInfo) {
          // ShakeEvent.shakeEvent.initShakeData({item:this.item, event})
          // ShakeEvent.shakeEvent.initShake()
        } else {
          if(FRONT_EVENTS.indexOf(event.type) != -1 || event.comps[0].attrs.isCommonFrontEvents) {
            this.eventShare.commonFrontEvents.push(event)
          }
          this.eventShare.loadEvents.push(event)

          if(event.controlId && event.controlId.length > 0) {
            this.eventShare.wbTypes.push(event.type)
          }
        }
      }
    })
  }
  //之前的css动画是style样式触发,重构后改为事件触发,如果有自动类型动画在加载事件中添加动画事件
  public initCssAnimate() {
    const animate: IAnimation = this.item.animate
    const isCssAnimate = animate && animate.animates.length > 0 ? true : false
    if(isCssAnimate || animate && animate.isGsap) {
      this.item.eventShare.cssGsapAnimate = new CssGsapAnimate(this.item)
      this.onShowPage()
      
    }
  }
 

  private onShowPage() {
    const animate: IAnimation = this.item.animate
    if(animate && animate.triggerType == ANIMATE_TRIGGER_TYPE_MAP.auto) {
      const useSite = this.siteStore
      const pageIndex = useSite.pageIndex
      const popIndex = useSite.popIndex
      if(pageIndex >= 0 && this.pageId == (pageIndex+1) || popIndex >= 0 && this.popId == (popIndex+1)) {
        this.item.eventShare.cssGsapAnimate && this.item.eventShare.cssGsapAnimate.loadImgPlayAnimate()
      }
    }
  }

  public onTemplateClick(e: Event) {
    if (this.isH5Edit || !this.eventShare.isClick) {
      return
    }
    //前端点击事件关联组件，直接触发关联组件事件
    const relateEventCompId = getCompIdByParam(this.commonAttr.relateEventCompId)
    this.item.eventShare.e = e
    if(relateEventCompId && relateEventCompId.length > 0) {
      this.relateCompEvent(relateEventCompId)
    } else {
      onEvent(this.item)
    }
  }

  private relateCompEvent(relateEventCompId: string) {
    const useSite = useSiteStore()
    let relateComp: IComponent = useSite.componentMap[relateEventCompId]
    let itemIndex: number = relateComp.commonAttr.itemIndex
    if(relateComp.cid != COMPONENT_TYPES.wb_calendar){ // 如果是日历组件的话就保持原有的itemIndex索引值
      itemIndex = this.commonAttr.itemIndex
    }
    // 按钮置灰的时候不可以同时触发关联组件数据
    if(this.item.cid == COMPONENT_TYPES.wb_btn && this.item.commonAttr.isGrey){
    }else{
      EventBus.$emit("itemClick", {id: relateEventCompId, index: itemIndex, isReset: false})
    }
    window.setTimeout( () => {
      onEvent(this.item)
    }, this.siteInfo.reloadTime*2)
  }

  private onItemPropagationClick({ id, index, isPost, e, isReset = true }: { id: string, index: number, isPost: boolean, e: Event, isReset?: boolean }) {
    if(this.item.id == id) {
      //如果关联组件是btn那么刷新按钮状态
      if(_.keys(this.item.events).length > 0) {
        if(this.item.cid == COMPONENT_TYPES.wb_btn) {
          EventBus.$emit("allBtnStatus", { isSelected: !this.item.interactionData.isSelected, compId: this.item.id })
        }else if(this.item.cid == COMPONENT_TYPES.wb_img) {
          this.item.interactionData.isSelected = !this.item.interactionData.isSelected
        }
      }
      this.commonAttr.itemIndex = index
      if(isReset) {
        resetSubmitStatus(this.item.eventShare)
      }
      if(isPost) {
        isPostWbEventOrCommonEvents({ item: this.item,loadEvent: null })
      } else {
        onEvent(this.item)
      }

      // 触发关联事件的关联事件
      const relateEventCompId = getCompIdByParam(this.commonAttr.relateEventCompId)
      this.item.eventShare.e = e
      if(relateEventCompId && relateEventCompId.length > 0) {
        this.relateCompEvent(relateEventCompId)
      } 
    }
  }

  private onReloadLoadEvent({ popIndex, pageIndex }: { popIndex: number, pageIndex: number }) {
    const useStore = this.siteStore
    //页面
    if(useStore.popIndex <= 0 && useStore.pageIndex == pageIndex) {
      onLoadEvent(this.item)
    }
    //弹层
    if(useStore.popIndex > 0 && useStore.popIndex == popIndex) {
      onLoadEvent(this.item)
    }
  }
  private onReloadOrPostInitEvent({ popIndex, pageIndex }: { popIndex: number, pageIndex: number }) {
    //页面
    const useStore = this.siteStore
    if(useStore.popIndex <= 0 && useStore.pageIndex == pageIndex) {
      onInitEvent(this.item)
    }
    //弹层
    if(useStore.popIndex > 0 && useStore.popIndex == popIndex) {
      onInitEvent(this.item)
    }
  }

  public destroy() {
    // @ts-ignore
    // delete this.item.eventShare
    EventBus.$off("itemClick", this.onItemPropagationClick)
    EventBus.$off("reloadInitEvent", this.onReloadOrPostInitEvent)
    EventBus.$off("reloadLoadEvent", this.onReloadLoadEvent)
    EventBus.$off("showPage", this.onShowPage)
  }
}