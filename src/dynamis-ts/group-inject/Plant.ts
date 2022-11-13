import { EventBus,getCompIdByParam } from '@/utils'
import { CONTROL_TYPES ,COMPONENT_TYPES} from  '@/const'
import BaseStore from '@/components/utils/BaseStore'


export default class Plant extends BaseStore {
  private progress: number
  private total: number
  private relateAttrCompId: string
  private relateAttrCompData: null | IComponent
  private lottery: null | IComponent
  private lotteryId: string
  private currenTotal: number
  private tree: null | IComponent
  private treeList: IInteractionItem[]
  private pushData: null | IComponent
  private rules: any
  private pushId: any
  private hiddenId: string = ''
  constructor(item: IComponent) {
    super(item)
    //子类覆盖
    this.progress = 0
    this.total = 0
    this.relateAttrCompId = ''
    this.relateAttrCompData = null

    // 抽奖图片
    this.lottery = null
    this.lotteryId = ''
    this.currenTotal = 0
    // 树图片
    this.tree = null
    this.treeList = []

    this.pushData = null

  }

  start() {
    this.relateAttrCompId = getCompIdByParam(this.item.commonAttr.relateAttrCompId)
    this.relateAttrCompData = this.componentMap[this.relateAttrCompId]

    this.rules = this.item.interactionData.injectJsClassObj.rules
    this.total = this.item.interactionData.injectJsClassObj.total
    this.pushId = this.item.interactionData.injectJsClassObj.pushId
    if(this.pushId){
      this.pushData = this.componentMap[this.pushId]
    }
    this.refresh = this.refresh.bind(this)
    // 数据更新但是才会进行刷新
    EventBus.$off("refreshDynamicData", this.refresh)
    EventBus.$on("refreshDynamicData", this.refresh)

    this.addClickEvent()
    this.refresh()
  }

  refresh(){
    if(this.relateAttrCompId && this.treeList.length > 0){
      let data = this.controls[this.relateAttrCompId][CONTROL_TYPES.wb_number].data as INumberControl
      this.currenTotal = data.num
      // 判断规则
      let length = this.rules.length - 1
      while(length >= 0){
        if(this.currenTotal >= this.rules[length]){
          // 切换图片 设置发博索引
          this.tree!.interactionData.vueContainer.$refs.dom.$el.src = this.treeList[length].url
          this.siteStore.updateComponentAttr({ id: this.pushId, commonAttr: { itemIndex : length } })
          break
        }
        length --
      }
      if( this.lotteryId){
        if(this.currenTotal >= this.total){
          let data =  this.controls[this.lotteryId!][CONTROL_TYPES.wb_lottery].data as ILotteryControl
          const lotteryTotalLimit = data.lotteryTotalLimit // 可以抽奖总次数
          // 获取的时候 和抽奖的时候
          let relateAttrCompId = getCompIdByParam(this.lottery!.commonAttr.relateAttrCompId)
          let dataNum = this.controls[relateAttrCompId][CONTROL_TYPES.wb_number].data as INumberControl
          const num = dataNum.num
          if(num >= lotteryTotalLimit){
            EventBus.$emit("btnStatus", { isGrey: true, compId:this.lotteryId })
          }else{
            EventBus.$emit("btnStatus", { isGrey: false, compId:this.lotteryId })
          }
        }else{
          EventBus.$emit("btnStatus", { isGrey: true, compId: this.lotteryId })
        }
      }
    }
  }


  addClickEvent(){
    _.forEach(this.components, (compData: IComponent) => {
      if (compData.cid == COMPONENT_TYPES.wb_btn) {
        // 抽奖按钮
        const btn = compData.interactionData.vueContainer.$refs.dom.$el
        this.lotteryId = compData.id
        this.lottery = compData
        this.onBtnClick = this.onBtnClick.bind(this)
        btn.addEventListener("click", this.onBtnClick)
      }else if(compData.cid == COMPONENT_TYPES.wb_img) {
        this.tree = compData
        this.treeList = compData.interactionData.lists || []
      }
    })
  }

  onBtnClick(e){
    // 是否执行操作
    if(this.lotteryId && this.currenTotal >= this.total ){
      EventBus.$emit("itemClick", {id: this.lotteryId})
    }
    e.stopPropagation()
  }
  destroy(){
    super.destroy()
    this.progress = 0
    this.total = 0
    this.relateAttrCompId = ''
    this.relateAttrCompData = null
    this.lottery = null
    this.lotteryId = ''
    this.tree = null
    this.treeList = []
    this.hiddenId = ''
    EventBus.$off("refreshDynamicData", this.refresh)
  }
}

