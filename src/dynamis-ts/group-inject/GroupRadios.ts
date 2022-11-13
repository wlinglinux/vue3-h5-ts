import { COMPONENT_TYPES } from '@/const'
import { getPxOVwByValue,getCompIdByParam } from '@/utils'
import BaseStore from '@/components/utils/BaseStore'

export default class GroupRadios extends BaseStore {
  private selectedCompId: string
  private offsetX: number
  private offsetY: number
  constructor(item: IComponent) {
    super(item)
    //子类覆盖
    this.selectedCompId = ""
    this.offsetX = 0
    this.offsetY = 0
  }

  start() {
    // {"selectedCompId":"c26e0b31-8c11-4d36-9e7b-ee7552046d4c","offsetX":-10,"offsetY":-10}
    const RadiosObj =  this.item.interactionData && this.item.interactionData.injectJsClassObj
    if (RadiosObj) {
      this.selectedCompId = RadiosObj.selectedCompId
      this.offsetX = RadiosObj.offsetX
      this.offsetY = RadiosObj.offsetY
    }
    this.addClickEvent()
    this.siteStore.updateComponentAttr({
      id: this.selectedCompId,
      commonAttr: {
        isVisible: false
      }
    })
  }

  addClickEvent() {
    _.forEach(this.components, (compData: IComponent) => {
      if (compData.cid == COMPONENT_TYPES.wb_img && compData.id != this.selectedCompId) {
        const img = compData.interactionData.vueContainer.$refs.dom.$el
        this.onImgClick = this.onImgClick.bind(this)
        img.addEventListener("click", this.onImgClick)
      }
    })
  }

  onImgClick(e: any) {
    e.stopPropagation()

    this.siteStore.updateComponentAttr({
      id: this.selectedCompId,
      commonAttr: {
        isVisible: true
      }
    })

    let img = e.currentTarget
    let compId = img.dataset.id
    let compData = this.componentMap[compId]
    let relateEventCompId = getCompIdByParam(compData.commonAttr.relateEventCompId)
    if(relateEventCompId){
      this.configureRelateCompInfo(e, relateEventCompId, compData)
    }
  }

  configureRelateCompInfo(e, relateEventCompId, compData) {
    let relateCompData = this.componentMap[relateEventCompId]
    //页面中的图片选中状态，点击按钮的时候触发选中项的事件 1471
    let event: IEvent
    let relateIdStr = ""
    let relateCompId = ""
    //标题的图片 改变当前标题图片url 根据当前选中选项
    if(relateCompData.events.rotate3d && relateCompData.events.rotate3d.mouseBehavior == 'data'){
      event = relateCompData.events.rotate3d
      //关联组件
      relateIdStr = event.comps[0].attrs.value
      if(relateIdStr){
        relateCompId = getCompIdByParam(relateIdStr)
        if(relateCompId){
          this.siteStore.updateComponentAttr({id: relateCompId, commonAttr: { url: relateCompData.lists[compData.commonAttr.itemIndex].url }})
        }
      }
    }
    //改变 需要打开的页面 需要显示的url
    if(relateCompData.events.interactionData){
      event = relateCompData.events.interactionData
      relateIdStr = event.comps[1].attrs.value
      if(relateIdStr){
        relateCompId = getCompIdByParam(relateIdStr)
        if(relateCompId){
          let interactionItem: any
          if(relateCompData.interactionData.isDimension){
            let lists = relateCompData.interactionData.dimensionLists![compData.commonAttr.itemIndex]
            let randomIndex = _.random(0, lists.length-1)
            interactionItem = lists[randomIndex]
          }else{
            interactionItem = relateCompData.lists[compData.commonAttr.itemIndex]
          }
          this.siteStore.updateComponentAttr({id: relateCompId, commonAttr: { url: interactionItem.url }})
        }
      }
    }
    //给关联组件的 弹层事件 提供参数
    this.interactionStore.updateFormValueMap({ id: relateEventCompId, value: compData.commonAttr.itemIndex })

    //更新选择图片位置根据 当前点击的图片位置
    const conAttr = compData.conAttr
    this.siteStore.updateComponentConAttr({
      id: this.selectedCompId,
      conAttr: { left: (conAttr.left + this.offsetX), top: (conAttr.top + this.offsetY) }
    })

    // const jumpUrl = 'group_radio_' + compData.commonAttr.itemIndex
    // const comType = "click"
    // const wModule = "jump"
    // this.onPostStatics({ e, comType, wModule,  jumpUrl })
  }

  destroy(){
    super.destroy()

    _.forEach(this.components, (compData) => {
      if (compData.cid == COMPONENT_TYPES.wb_img && compData.id != this.selectedCompId) {
        let img = compData.interactionData.vueContainer.$refs.dom.$el
        img.removeEventListener("click", this.onImgClick)
      }
    })
    this.selectedCompId = ""
    this.offsetX = 0
    this.offsetY = 0
  }
}
