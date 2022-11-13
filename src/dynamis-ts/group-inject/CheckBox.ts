import { useInteractionStore } from '@/store/interaction';
import { isHasOwnProperty } from '@/utils/';
import { EventBus, getCompIdByParam } from '@/utils'
import { COMPONENT_TYPES } from '@/const'
import BaseStore from '@/components/utils/BaseStore'


//打组多选 2129&pageId=13 普通组件
interface ICheckBox {
  indexType: number,
  need: false,
  min: number,
  max: number,
  msg: string,
  emitCompId: string,
  listCompId: string
}

export default class CheckBox extends BaseStore {
  private injectJsClassObj: null | ICheckBox
  private selecteds: number[]
  private relateAttrCompId: string
  private relateAttrComp: null | IComponent
  private componentBtns: IComponent[]
  private emitCompId: string
  private selectIndexList: number[]
  private lists: any[]
  private listComp: IComponent | null
  constructor(item: IComponent) {
    super(item)
    this.injectJsClassObj = null
    this.selecteds = []  // 被选中的数据
    this.relateAttrCompId = ''
    this.relateAttrComp = null
    this.componentBtns = []
    this.emitCompId = ''
    // 多选： 选中做多出现的索引值作为发博索引，最多选中的
    this.selectIndexList = [] // 选中的索引数据 
    this.lists = []
    this.listComp = null
  }

  start() {
    // EventBus.$emit("btnStatus", { isSelected: false })
    _.forEach(this.components, (compData: IComponent) => {
      if (compData.cid == COMPONENT_TYPES.wb_btn) {
        this.componentBtns.push(compData)
      }
    })
    this.componentBtns = _.sortBy(this.componentBtns, (compData: IComponent) => {
      return compData.commonAttr.itemIndex
    })
    

    this.injectJsClassObj = this.item.interactionData.injectJsClassObj
    this.relateAttrCompId = getCompIdByParam(this.commonAttr.relateAttrCompId)
    if (this.relateAttrCompId) {
      this.relateAttrComp = this.componentMap[this.relateAttrCompId]
      this.lists = this.relateAttrComp.interactionData.lists
    }else{
      _.forEach(this.componentBtns, (compData: IComponent) => {
        this.lists.push({ text: compData.commonAttr.title })
      })
    }
    let indexType = this.injectJsClassObj!.indexType
    if (indexType) {
      this.selectIndexList = _.fill(Array(indexType), 0)
    }
    this.emitCompId = this.injectJsClassObj!.emitCompId
    let listCompId = this.injectJsClassObj!.listCompId
    if(listCompId){
      this.listComp = this.componentMap[listCompId]
    }
    if (isHasOwnProperty(this.injectJsClassObj, 'need') && this.injectJsClassObj!.need) {
      // 作为表单数据的时候
      this.commonAttr.need = this.injectJsClassObj!.need
      this.commonAttr.min = this.injectJsClassObj!.min
      this.commonAttr.max = this.injectJsClassObj!.max
      const useInteraction = useInteractionStore()
      useInteraction.updateFormValueMap({ id: this.item.id, selecteds: []  })
    }
    this.addClickEvent()
  }

  addClickEvent() {
    _.forEach(this.componentBtns, (compData: IComponent) => {
      if (compData.cid == COMPONENT_TYPES.wb_btn) {
        const btn = compData.interactionData.vueContainer.$refs.dom.$el
        this.onBtnClick = this.onBtnClick.bind(this)
        btn.addEventListener("click", this.onBtnClick)
      }
    })
    if (this.emitCompId) {
      const emitComp = this.componentMap[this.emitCompId]
      const dom = emitComp.interactionData.vueContainer.$refs.dom.$el
      if (dom) {
        this.onEmitClick = this.onEmitClick.bind(this)
        dom.addEventListener("click", this.onEmitClick)
      }
    }
  }

  onBtnClick(e: any) {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    const btn = e.currentTarget
    const compId = btn.dataset.id
    const compData = this.componentMap[compId]
    const index = _.parseInt(compData.commonAttr.itemIndex)
    const isSelected = compData.interactionData.isSelected
    const isForm = this.commonAttr.need

    const index_ = this.selecteds.indexOf(index + 1)
    if (!isSelected) {
      if (index_ == -1) {
        if (!this.onCheckbox()) return
        this.selecteds.push(index + 1)
        EventBus.$emit("btnStatus", { isSelected: true, compId })
      }
    } else {
      if (index_ != -1) {
        this.selecteds.splice(index_, 1)
        EventBus.$emit("btnStatus", { isSelected: false, compId })
      }
    }
    if(isForm) {
      this.interactionStore.updateFormValueMap({ id: this.item.id, selecteds: this.selecteds, lists: this.lists })
    }
    this.siteStore.updateComponentAttr({ id: this.item.id, commonAttr: { itemIndex: index } })
    const relateEventCompId = getCompIdByParam(this.commonAttr.relateEventCompId)
    if (relateEventCompId) {
      this.siteStore.updateComponentAttr({ id: relateEventCompId, commonAttr: { itemIndex: index } })
    }
    // 王者荣耀，修改列表数据，这部分看下如何分割出来
    if(this.listComp && this.listComp.cid == COMPONENT_TYPES.wb_common_list){
      let resultList : any= []
      _.forEach(this.selecteds ,id => {
        let item = this.lists[id-1]
        resultList.push(item)
      });
      this.listComp.lists = resultList
    }
  }

  onEmitClick(e: any) {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    const relateEventCompId = getCompIdByParam(this.commonAttr.relateEventCompId)
    if (relateEventCompId) {
      const relateEventComp = this.componentMap[relateEventCompId]
      _.forEach(this.selecteds, (index: number) => {
        EventBus.$emit("itemClick", { id: relateEventCompId , index: index - 1})
        if(relateEventComp.interactionData.lists) {
          //更新 选中索引属性
        }
      })
    }
  }

  // 点击完成数据校验
  onCheckbox() {
    const checkboxNum = this.selecteds.length+1
    const max = this.injectJsClassObj!.max
    let msg = this.injectJsClassObj!.msg
    const min = this.injectJsClassObj!.min
    if (max && checkboxNum > max || min && checkboxNum < min) {
      msg = msg ? msg : '多选数量不对！'
      this.showToast(msg)
      return false
    }
    return true
  }

  destroy() {
    super.destroy()
    _.forEach(this.componentBtns, (compData: IComponent) => {
      if (compData.cid == COMPONENT_TYPES.wb_btn) {
        const btn = compData.interactionData.vueContainer.$refs.dom.$el
        btn.removeEventListener("click", this.onBtnClick)
      }
    })
    this.selecteds = []  // 被选中的数据
    this.relateAttrCompId = ''
    this.relateAttrComp = null
    this.componentBtns = []
    this.emitCompId = ''
    this.selectIndexList = [] // 选中的索引数据 
  }
}
