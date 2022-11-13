import BaseStore from '@/components/utils/BaseStore';
import { COMPONENT_TYPES } from '@/const';
import { EventBus } from '@/utils/'
import { windowWidth } from 'vant/lib/utils';

interface IGridLottery {
  rules: any,
  speed: number,
  baseTimes: number,
  leastSpeed: number,
  forbidCompId: string
  failIndex: string
}

export default class GridLottery extends BaseStore {
  private index: number
  private speed: number
  private timeOut: any
  private resultIndex: number
  private times: number
  private baseTimes: number
  private isClick: boolean
  private domItems: any[]
  private length : number
  private lotteryDom: HTMLElement | null
  private lotteryItem: IComponent | null
  private leastSpeed: number
  private forbidCompId: string = ''
  private failIndex: string = ''
  constructor(item: IComponent) {
    super(item);

    this.index = 0
    this.speed = 120
    this.timeOut = null
    this.resultIndex = -1
    this.times = 0
    this.isClick = false
    this.baseTimes = 0
    this.domItems = []
    this.length = 0
    this.lotteryDom = null
    this.lotteryItem = null
    this.leastSpeed = 20
  }

  start() {
    this.onInit()
    let injectJsClassObj = this.item.interactionData.injectJsClassObj as IGridLottery
    if(injectJsClassObj.baseTimes){
      this.baseTimes = injectJsClassObj.baseTimes || _.random(80,120)
    } 
    if(injectJsClassObj.leastSpeed) this.leastSpeed = injectJsClassObj.leastSpeed || 20
    if(injectJsClassObj.forbidCompId) this.forbidCompId = injectJsClassObj.forbidCompId
    if(injectJsClassObj.failIndex) this.failIndex = injectJsClassObj.failIndex
    this.onInitData()
  }
  // 初始化操作
  onInit(){
    this.components.forEach(item =>{
      if(item.cid == COMPONENT_TYPES.wb_btn){
        this.domItems.push(item)
      }else if(item.cid == COMPONENT_TYPES.wb_img){
        this.lotteryDom = item.vueInjectContainer.$el
        this.lotteryItem = item
      }
    })
    // 根据索引进行排序
    this.domItems = _.sortBy(this.domItems, item =>  _.parseInt(item.commonAttr.itemIndex)) 
    this.length = this.domItems.length - 1
    this.onLotteryClick = this.onLotteryClick.bind(this)
    this.lotteryDom?.addEventListener('click',this.onLotteryClick)
  }
  onInitData(){
    this.resultIndex = -1
    this.isClick = false
    this.timeOut = null
    this.times = 0
    let injectJsClassObj = this.item.interactionData.injectJsClassObj as IGridLottery
    if(injectJsClassObj.speed){
      this.speed = injectJsClassObj.speed ||  120
    }
  }
  onLotteryClick(e){
    if(!this.isClick){
      this.isClick = true
      this.onShowAnimate()
      this.siteStore.updateComponentAttr({id: this.forbidCompId, commonAttr:{ isVisible: true}})
      let waitResult = window.setInterval(()=>{
        // 判断抽奖是否成功了
        let data = this.lotteryItem!.eventShare.communicationData
        if(data.code != -1){
          const lotteryData: ILottery = data.data as ILottery
          if(lotteryData && lotteryData.gift_name){
            if(this.lotteryItem!.eventShare.lotteryIndex > -1){
              this.resultIndex = this.lotteryItem!.eventShare.lotteryIndex
            }
          }else{
            let failIndexArr =  this.failIndex.split(',')
            if(failIndexArr.length > 0 ){
              let index = _.random(0,failIndexArr.length -1 )
              this.resultIndex = parseInt(failIndexArr[index])
            }
          }
          window.clearInterval(waitResult)
        }
      })
    }
  }
  onShowAnimate(){
    this.times ++
    if(this.index > this.length) this.index = 0
    _.forEach(this.domItems, item =>{
      EventBus.$emit('btnStatus', { isSelected: false, compId: item.id })
    })
    EventBus.$emit('btnStatus', { isSelected: true, compId: this.domItems[this.index].id })
    if(this.resultIndex > -1 && this.index === this.resultIndex && this.times > this.baseTimes+8 ){
      window.clearTimeout(this.timeOut)
      this.onInitData()
      this.siteStore.updateComponentAttr({id: this.forbidCompId, commonAttr:{ isVisible: false}})
      this.lotteryItem!.eventShare.lotteryIndex = -1
    }else{
      this.index += 1
      if( this.times < this.baseTimes ){
        this.speed -= 5
      }else{
        this.speed += 25
      }
      if(this.speed < this.leastSpeed) this.speed = this.leastSpeed
      this.timeOut = window.setTimeout(this.onShowAnimate.bind(this),this.speed)
    }
  }

  destroy() {
    super.destroy();
  }
}