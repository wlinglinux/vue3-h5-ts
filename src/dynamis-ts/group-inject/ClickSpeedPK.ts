import { EventBus, getCompIdByParam } from '@/utils/'
import BaseStore from '@/components/utils/BaseStore'
import { CONTROL_TYPES, COMPONENT_TYPES } from '@/const'

export default class ClickSpeedPK extends BaseStore {
  private clickCount: number
  private durationTime: number
  private clickTotal: number
  private isStartTime: boolean
  private isCompleteClick: boolean
  private setTimeoutCb: number | null
  constructor(item: IComponent) {
    super(item)
    //子类覆盖
    this.clickCount = 0
    this.durationTime = 3//持续时间10秒
    this.clickTotal = 6//10秒超过10次就计数，赢得这次胜利
    this.isStartTime = true
    this.isCompleteClick = false//处理成功的函数是否执行过
    this.setTimeoutCb = null
  }

  start() {
    //{"time":5,"count":15,"triggerRelateCompId":"d441361a-d1ab-43db-b44b-7fcebc3000c9","successPopId":3,"failPopId":4} time 持续时间 count 在规定的时间内点击大于等于就计数，赢得这次胜利
    this.durationTime = this.item.interactionData.injectJsClassObj.time
    this.clickTotal = this.item.interactionData.injectJsClassObj.count

    this.initFilterComponents(COMPONENT_TYPES.wb_bg)
    this.addClickEvent()
  }

  addClickEvent() {
    let dom: any
    _.forEach(this.filterComponents, (compData: IComponent) => {
      if (compData.cid == COMPONENT_TYPES.wb_btn || compData.cid == COMPONENT_TYPES.wb_bg) {
        dom = compData.interactionData.vueContainer.$refs.dom.$el
        this.onBtnClick = this.onBtnClick.bind(this)
        dom.addEventListener("click", this.onBtnClick)
      }
    })
  }

  onBtnClick(e) {
    e.stopPropagation()
    if (this.isCompleteClick) {
      return
    }
    let btn = e.currentTarget
    let compId = btn.parentElement.id
    let compData = this.componentMap[compId]
    let btnVueClass = compData.interactionData.vueContainer

    let relateCompId = getCompIdByParam(btnVueClass.commonAttr.relateEventCompId || btnVueClass.commonAttr.relateCompId)
    let numberItemData
    if (relateCompId) {
      numberItemData = this.getVariableItemByRelateCompId(relateCompId, CONTROL_TYPES.wb_number)
      compData = this.componentMap[relateCompId]
    } else {
      numberItemData = btnVueClass.numberItemData
    }

    // numberItemData.num = 1

    if (numberItemData && numberItemData.num > 0) {
      if (this.isStartTime) {
        EventBus.$emit("playImgBounceAnim", { isPlay: true })

        this.setTimeoutCb = window.setTimeout(() => {
          this.result(compData.id)
        }, this.durationTime * 1000)
        this.isStartTime = false
      }

      this.clickCount++
      let percent = parseInt((this.clickCount / this.clickTotal * 100).toString())
      if (percent >= 100) {
        percent = 100
      }
      EventBus.$emit("clickAddProcess", percent)
      if (this.clickCount >= this.clickTotal) {
        this.result(compData.id)
      }
    } else {
      let injectJsClassObj = this.item.interactionData.injectJsClassObj
      let popId = injectJsClassObj.notEnough
      if (popId) {
        this.showPop(popId)
      }
      return
    }

    const jumpUrl = 'pk'
    const comType = "click"
    const wModule = "jump"
    this.onPostStatics({ e, comType, wModule,  jumpUrl })
  }

  result(minusCompId) {
    if (this.isCompleteClick) {
      return
    } else {
      this.isCompleteClick = true
    }
    //每点击一次就减一次计数
    EventBus.$emit("itemClick", { id: minusCompId, index: 0, e: null })

    window.clearTimeout(this.setTimeoutCb!)
    EventBus.$emit("playImgBounceAnim", { isPlay: false })


    //在规定的时间内赢得了胜利，那么就记录一次数据
    let popId = -1
    let injectJsClassObj = this.item.interactionData.injectJsClassObj
    if (this.clickCount >= this.clickTotal) {
      let triggerRelateCompId = injectJsClassObj.triggerRelateCompId
      popId = injectJsClassObj.successPopId
      //成功触发计数排名
      EventBus.$emit("itemClick", { id: triggerRelateCompId, index: 0, e: null })
    } else {
      EventBus.$emit("clickAddProcess", 0)
      popId = injectJsClassObj.failPopId
    }
    if (popId) {
      this.showPop(popId)
    }

    this.isCompleteClick = false
    this.isStartTime = true
    this.clickCount = 0
    EventBus.$emit("clickAddProcess", 0)
  }

  getVariableItemByRelateCompId(relateCompId, eventType) {
    let itemControls = this.controls[relateCompId]
    let relateCompData = this.componentMap[relateCompId]
    let data = itemControls[eventType].data as INumberControl
    if (data.elements) {
      return data.elements[relateCompData.itemIndex]
    } else {
      return itemControls[eventType].data
    }
  }

  destroy() {
    super.destroy()

    this.isCompleteClick = false
    this.clickCount = 0
    this.isStartTime = true
    _.forEach(this.filterComponents, (compData) => {
      if (compData.cid == COMPONENT_TYPES.wb_process) {
        //待处理
      } else if (compData.cid == COMPONENT_TYPES.wb_btn) {
        let btn = compData.interactionData.vueContainer.$refs.dom.$el
        btn.removeEventListener("click", this.onBtnClick)
      }
    })
    if (this.setTimeoutCb) {
      window.clearTimeout(this.setTimeoutCb)
    }
  }

}