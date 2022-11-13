import { COMPONENT_TYPES } from '@/const/'
import { getCompIdByParam, EventBus, isHasOwnProperty } from '@/utils/'
import BaseStore from '@/components/utils/BaseStore'
import { useSiteStore } from '@/store/site'
import { useInteractionStore } from '@/store/interaction'

interface IMenuByBtns {
  relateIds?: string
  isDefaultSelectedItemIndex?: boolean,
  defaultSelectedItemIndex?: number,
  isRecord?: boolean,
  constNum?: number,
  need?: boolean //表单为必须提交
}

export default class MenuByBtns extends BaseStore {
  private componentBtns: IComponent[] | null
  private relateEventCompId: string | null
  private relateComps: IComponent[]
  private relateAttrComp: IComponent | null
  private cb: null | number
  constructor(item: IComponent) {
    super(item)
    //子类覆盖
    this.item = item
    this.componentBtns = []
    this.relateEventCompId = null
    this.relateComps = []
    this.relateAttrComp = null
    this.cb = null
  }

  start() {
    // EventBus.$emit("btnStatus", { isSelected: false })
    const useInteraction = useInteractionStore()
    const useSite = useSiteStore()

    _.forEach(this.item.components, (compData: IComponent) => {
      if (compData.cid == COMPONENT_TYPES.wb_btn) {
        this.componentBtns!.push(compData)
      }
    })
    this.componentBtns = _.sortBy(this.componentBtns, (compData: IComponent) => {
      return _.parseInt(compData.commonAttr.itemIndex)
    })
    this.relateEventCompId = this.commonAttr.relateEventCompId
    let relateAttrCompId = getCompIdByParam(this.commonAttr.relateAttrCompId)
    if (relateAttrCompId) {
      this.relateAttrComp = this.componentMap[relateAttrCompId]
    }
    this.addClickEvent()
    let injectJsClassObj = this.item.interactionData.injectJsClassObj as IMenuByBtns
    // 站点2517 问题页返回上一页的时候 反显之前选中的数据
    if(useInteraction.shareInteractionData && useInteraction.shareInteractionData.isReturnBack) {
      const defaultSelectedItemIndex = this.getSelectedItemIndex()
      if(defaultSelectedItemIndex >= 0) {
        if(!injectJsClassObj) {
          injectJsClassObj = { isDefaultSelectedItemIndex: true, defaultSelectedItemIndex }
        } else {
          _.merge(injectJsClassObj, { isDefaultSelectedItemIndex: true, defaultSelectedItemIndex})
        }
      }
    }
    if (injectJsClassObj) {
      //{"isDefaultSelectedItemIndex":true,"defaultSelectedItemIndex":0, need:true}
      if(isHasOwnProperty(injectJsClassObj, 'need') && injectJsClassObj.need){
        this.item.commonAttr.need = injectJsClassObj.need
      }
      const relateIds = injectJsClassObj.relateIds && injectJsClassObj.relateIds.split(',')
      if (relateIds) {
        _.forEach(relateIds, (relateId: string) => {
          let comp = this.componentMap[relateId]
          this.relateComps.push(comp)
        })
      }
      let isDefaultSelectedItemIndex = injectJsClassObj.isDefaultSelectedItemIndex
      if (isDefaultSelectedItemIndex || useInteraction.shareData && useInteraction.shareData.currPeriod) {
        let defaultSelectedItemIndex = 0
        let isRecord = injectJsClassObj.isRecord
        let constNum = injectJsClassObj.constNum || 10
        if (injectJsClassObj.defaultSelectedItemIndex! >= 0) {
          if (isRecord) {
            defaultSelectedItemIndex = this.item.commonAttr.itemIndex >= 0 ? this.item.commonAttr.itemIndex : injectJsClassObj.defaultSelectedItemIndex!
          } else {
            defaultSelectedItemIndex = injectJsClassObj.defaultSelectedItemIndex!
          }
        }
        if(useInteraction.shareData && (useInteraction.shareData.currPeriod! > -1)){
          defaultSelectedItemIndex = useInteraction.shareData.currPeriod! - 1
        }
        const defaultSelectedCompData = this.componentBtns![defaultSelectedItemIndex]
        const compId = defaultSelectedCompData.id
        EventBus.$emit("btnStatus", { isSelected: true, compId })
        useInteraction.updateFormValueMap({ id: this.item.id, value: defaultSelectedCompData.commonAttr.itemIndex, text: defaultSelectedCompData.commonAttr.title })
        useSite.updateComponentAttr({ id: this.item.id, commonAttr: { itemIndex: defaultSelectedCompData.commonAttr.itemIndex } })
        if (this.componentMap[compId].events.frontEvents) {
          const relateCompId = getCompIdByParam(this.componentMap[compId].events.frontEvents.comps[1].attrs.relateCompId)
          if (relateCompId) {
            this.cb = window.setInterval(() => {
              if (this.componentMap[relateCompId].isCreated) {
                EventBus.$emit("itemClick", { id: compId, index: defaultSelectedItemIndex })
                window.clearInterval(this.cb!)
              }
            }, this.siteInfo.reloadTime)
          }
        }
        this.changeRelateComp(defaultSelectedItemIndex)
        if (isRecord) {
          let groupEle = document.getElementById(this.item.id)
          let defaultELe = document.getElementById(compId)
          if (defaultELe!.offsetTop >= groupEle!.clientHeight - constNum) {
            groupEle!.scrollTo({ top: defaultELe!.offsetTop, behavior: 'smooth' })
          }
        }
      } else {
        useInteraction.updateFormValueMap({ id: this.item.id, value: -1 })
      }
    } else {
      useInteraction.updateFormValueMap({ id: this.item.id, value: -1 })
    }
  }

  getSelectedItemIndex(){
    const useInteraction = useInteractionStore()
    let itemIndex = -1
    let clickCompIdMap = useInteraction.shareInteractionData.clickCompIdMap
    let itemValues: any = clickCompIdMap.get(this.item.id)
    if (this.relateEventCompId && itemValues) {
      this.relateEventCompId = getCompIdByParam(this.relateEventCompId)
      const compData = this.componentMap[this.relateEventCompId!]
      _.forEach(compData.interactionData.lists, (item: any, index: number)=>{
        _.merge(item, JSON.parse(item.params))
        if(itemValues.relateType == item.relateType) {
          itemIndex = index
        }
      })
    }
    return itemIndex
  }


  addClickEvent() {
    _.forEach(this.componentBtns, (compData: IComponent) => {
      if (compData.cid == COMPONENT_TYPES.wb_btn) {
        const btn = compData.interactionData.vueContainer.$refs.dom.$el
        this.onBtnClick = this.onBtnClick.bind(this)
        btn.addEventListener("click",this.onBtnClick)
      }
    })
  }

  onBtnClick(e: any) {
    e.stopPropagation()
    const useInteraction = useInteractionStore()
    const useSite = useSiteStore()
    const btn = e.currentTarget
    const compId = btn.parentElement.id
    const compData = this.componentMap[compId]
    _.forEach(this.components, component =>{
      EventBus.$emit("btnStatus", { isSelected: false, compId:component.id})
    })
    EventBus.$emit("btnStatus", { isSelected: true, compId })
    const itemIndex = compData.commonAttr.itemIndex
    useInteraction.updateFormValueMap({ id: this.item.id, value: itemIndex, text: compData.commonAttr.title })
    useSite.updateComponentAttr({ id: this.item.id, commonAttr: { itemIndex } })
    //2422 拖拽按钮组需要发送这个按钮的事件
    if(compData && compData.eventShare && (compData.eventShare.commonEvents.length > 0 || compData.eventShare.commonFrontEvents.length > 0 || compData.eventShare.wbEvents.length > 0)) {
      EventBus.$emit("itemClick", { id: compId, index: itemIndex })
    }
    if(compData.commonAttr.relateEventCompId){
      const relateEventCompId = getCompIdByParam(compData.commonAttr.relateEventCompId)
      EventBus.$emit("itemClick", { id: relateEventCompId, index: itemIndex })
    }
    if (this.relateEventCompId) {
      this.relateEventCompId = getCompIdByParam(this.relateEventCompId)
      const compData = this.componentMap[this.relateEventCompId!]
      const relateId = compData.events.interactionData.comps[1].attrs.value
      if (relateId) {
        // 更新动态文本数据， 站点2462 现在是如何区分这个数据比较好呢
        EventBus.$emit("itemClick", { id: this.relateEventCompId , index: itemIndex });
        EventBus.$emit("refreshDynamicData")
      } else {
        this.onRadio(compData, itemIndex)
      }
    }
    this.changeRelateComp(itemIndex)
  }

  onRadio(compData: IComponent, index: number) {
    const useInteraction = useInteractionStore()

    // 任意单选位置操作
    let list = compData.interactionData.lists[index]
    _.merge(list, JSON.parse(list.params))
    let interactionData_ = _.cloneDeep(useInteraction.shareInteractionData)
    interactionData_.clickCompIdMap.set(this.item.id, list)
    useInteraction.updateInteractionData(interactionData_)
    // 直接点击下一步操作
    if (interactionData_.isEmitClick) {
      EventBus.$emit("itemClick", { id: compData.id, index })
    }
  }


  changeRelateComp(itemIndex: number) {
    const useSite = useSiteStore()

    if (this.relateAttrComp) {
      if (this.relateComps && this.relateComps.length > 0) {
        if (this.relateAttrComp.interactionData) {
          let lists = this.relateAttrComp.interactionData.lists
          _.forEach(this.relateComps, (comp: IComponent) => {
            if (comp.cid === COMPONENT_TYPES.wb_img) {
              let url = lists[itemIndex].url
              useSite.updateComponentAttr({ id: comp.id, commonAttr: { url } })
            } else if (comp.cid === COMPONENT_TYPES.wb_text) {
              let text = lists[itemIndex].text
              const useSite = useSiteStore()
              useSite.updateComponentAttr({ id: comp.id, commonAttr: { text } })
            }
            EventBus.$emit("refreshDynamicData")
          })
        }
      }
    }
  }

  destroy() {
    super.destroy()
    _.forEach(this.componentBtns, (compData: IComponent) => {
      if (compData.cid == COMPONENT_TYPES.wb_btn) {
        EventBus.$emit("btnStatus", { isSelected: false ,compId: compData.id})
        let btn = compData.interactionData.vueContainer.$refs.dom.$el
        btn.removeEventListener("click", this.onBtnClick)
      }
    })
    this.componentBtns = []
    this.relateEventCompId = null
    this.relateComps = []
    this.relateAttrComp = null
    this.cb = null
  }
}
