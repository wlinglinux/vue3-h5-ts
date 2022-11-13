import BaseStore from '@/components/utils/BaseStore'
import { EventBus, isHasOwnProperty } from '@/utils/'
import { postShowPop } from '@/components/events/result-event'

interface IGridLottery {
  time: number,
  times: number,
  clickCompId: string,
  thanksIndex: number
}

export default class GridLotteryImg extends BaseStore {
  private animateIndex: number = -1
  private animateAttenuationIndex: number = -1
  private injectJsClassObj: IGridLottery = { time: 3, times: 2, clickCompId: "", thanksIndex: 0 }
  private sortCompDatas: any[] | any = []
  private intervalCb: number = -1
  private timeoutCb: number = -1
  private lotteryIndex: number = -1
  constructor(item: IComponent) {
    super(item)
  }

  start() {
    const injectJsClassObj = this.item.interactionData.injectJsClassObj as IGridLottery
    if(!injectJsClassObj) return
    _.merge(this.injectJsClassObj, injectJsClassObj)
    if(this.injectJsClassObj.times < 2) this.injectJsClassObj.times = 2
    if(this.injectJsClassObj.time < 3) this.injectJsClassObj.time = 3
    this.onInit()
  }

  // 初始化操作
  onInit() {
    // 根据索引进行排序
    const sortCompDatas = _.sortBy(this.components, (item: IComponent) => _.parseInt(item.commonAttr.itemIndex)) 
    this.sortCompDatas = sortCompDatas
    this.onDisplayDom()
    this.onStopSlotMachine = this.onStopSlotMachine.bind(this)
    EventBus.$on("stopSlotMachine", this.onStopSlotMachine)
    this.onSlotMachine = this.onSlotMachine.bind(this)
    EventBus.$on("slotMachine", this.onSlotMachine)

  }
  
  onStopSlotMachine(lotteryIndex: number) {
    this.lotteryIndex = lotteryIndex
  }

  onDisplayDom(index: number = -1) {
    _.forEach(this.sortCompDatas, (item: IComponent) => {
      // this.sortDomPoint.push({ x: item.conStyles.left, y: item.conStyles.top})
      this.siteStore.updateComponentAttr({id: item.id, commonAttr: { isVisible: false }})
    })
    if(index >= 0) {
      const displayDomCompData = this.sortCompDatas[index]
      this.siteStore.updateComponentAttr({id: displayDomCompData.id, commonAttr: { isVisible: true }})
    }
  }

  onSlotMachine() {
    const len = this.components.length
    const moveNum = len*this.injectJsClassObj.times
    const milliseconds = _.parseInt(this.injectJsClassObj.time * 1000/moveNum)
    this.animateIndex = 0
    this.intervalCb = window.setInterval(() => {
      this.onDisplayDom(this.animateIndex%len)
      if(this.animateIndex >= moveNum) {
        window.clearInterval(this.intervalCb)
        this.animateAttenuationIndex = 0
        // this.animateIndex = 0
        this.speedAttenuation()
      }
      this.animateIndex++
    }, milliseconds)
  }
  // t = 0 - 动画从0s开始 
  // b = 200 - 对象 x 坐标的起始位置为200 
  // c = 300 - 对象必须向右移动 300，到500 结束 
  // d = 1 - 对象用 1 秒时间来完成从 200 到 500 的移动
  easeOutCubic (t: number, b: number, c: number, d: number) { 
    return c * ((t = t / d - 1) * t * t + 1) + b
  }

  speedAttenuation() {
    let lotteryIndex = this.lotteryIndex
    if(lotteryIndex == -1) {
      lotteryIndex = this.injectJsClassObj.thanksIndex
    }
    const len = this.components.length
    const moveNum = len * (this.injectJsClassObj.times-2) + lotteryIndex
    this.onDisplayDom(this.animateIndex%len)
    if(moveNum == this.animateAttenuationIndex && moveNum == 0) {
      this.onDelayShowPostPop()
    } else {
      const allTime = this.injectJsClassObj.time * 1000
      //获取300到800的一个衰减数值
      const milliseconds = _.parseInt(this.injectJsClassObj.time/2 * 1000/moveNum)
      const time = _.parseInt(this.easeOutCubic(this.animateAttenuationIndex * milliseconds, 300, 500, allTime))
      this.timeoutCb = window.setTimeout(() => {
        this.speedAttenuation()
        this.animateIndex++
        this.animateAttenuationIndex++
        if(this.animateAttenuationIndex >= moveNum) {
          window.setTimeout(this.onDelayShowPostPop.bind(this), 500)
          window.clearTimeout(this.timeoutCb)
        }
      }, time)
    }
  }

  onDelayShowPostPop () {
    const clickDomCompData = this.siteStore.componentMap[this.injectJsClassObj.clickCompId]
    const eventShare = clickDomCompData.eventShare
    if(eventShare.delayShowPopParams) {
      postShowPop(eventShare.delayShowPopParams)
      delete eventShare.delayShowPopParams
    }
  }

  destroy() {
    super.destroy()
    EventBus.$off("stopSlotMachine", this.onStopSlotMachine)
    EventBus.$off("slotMachine", this.onSlotMachine)
    this.animateIndex = 0
    this.animateAttenuationIndex = 0
    this.intervalCb = -1
    this.timeoutCb = -1
    this.lotteryIndex = 0
  }
}