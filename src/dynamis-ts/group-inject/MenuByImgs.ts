import { EventBus } from '@/utils/'
import BaseStore from '@/components/utils/BaseStore'
import { COMPONENT_TYPES } from '@/const/'

interface IMenuByImgs {
  currentCompId: string
  selectedCompId: string
  offsetX: number
  menuMap: IMenuMap
}
interface IMenuMap {
  [id: string]: string
}
export default class MenuByImgs extends BaseStore {
  private menuMap: null | IMenuMap
  private currentCompId: string
  private selectedCompId: string
  private offsetX: number
  constructor(item: IComponent) {
    super(item)
    //子类覆盖
    this.item = item
    this.menuMap = null //图片组件id: 打组显示组件id
    this.currentCompId = ""
    this.selectedCompId = ""
    this.offsetX = 0
  }

  start() {
    // {"menuMap":{"e295610c-453a-425e-a056-44b876a0144e":"0ddb451b-b2e8-40c5-ace3-0c3cd416a3a5","b897cfa5-0cf7-4126-9f6e-c2c672707b17":"e192ee53-8b52-479d-b96e-99db6dec5092"},"currentCompId":"e295610c-453a-425e-a056-44b876a0144e","selectedCompId":"188ae5ae-37ad-493c-b9a1-aeb8f2e00867","offsetX":20}
    const menuMapObj = this.item.interactionData.injectJsClassObj as IMenuByImgs
    if (menuMapObj) {
      this.currentCompId = menuMapObj.currentCompId
      if(menuMapObj.selectedCompId) {
        this.selectedCompId = menuMapObj.selectedCompId
      }
      this.offsetX = menuMapObj.offsetX
      this.menuMap = menuMapObj.menuMap
    }

    this.hiddenGroups()
    const displayCompId = this.menuMap![this.currentCompId]
    const compData = this.componentMap[this.currentCompId]
    if (compData.cid == COMPONENT_TYPES.wb_btn) {
      EventBus.$emit("btnStatus", { isSelected: false })
    }
    this.tabDisplayGroupByCompId(this.currentCompId, displayCompId)
    this.addClickEvent()
  }

  hiddenGroups() {
    _.forEach(this.menuMap, (compId: string) => {
      let groupCompData = this.componentMap[compId]
      this.siteStore.updateComponentAttr({
        id: groupCompData.id,
        commonAttr: {
          isVisible: false
        }
      })
    })
  }

  addClickEvent() {
    _.forEach(this.components, (compData: IComponent) => {
      if (compData.cid == COMPONENT_TYPES.wb_btn || compData.cid == COMPONENT_TYPES.wb_img) {
        const el: any = compData.interactionData.vueContainer.$refs.dom.$el
        this.onImgClick = this.onImgClick.bind(this)
        el.addEventListener("click", this.onImgClick)
      }
    })
  }

  onImgClick(e: any) {
    e.stopPropagation()
    const img: any = e.currentTarget
    const compId = img.dataset.id
    const compData = this.componentMap[compId]
    this.hiddenGroups()
    if (compData && compData.cid == COMPONENT_TYPES.wb_btn) {
      EventBus.$emit("btnStatus", { isSelected: false })
      EventBus.$emit("btnStatus", { isSelected: true, compId })
    }
    //需要显示打组组件
    const displayCompId = this.menuMap![compId]
    this.tabDisplayGroupByCompId(compId, displayCompId)

    //触发懒加载 加载 图片
    // document.documentElement.scrollTop = document.documentElement.scrollTop + 10
    // document.documentElement.scrollTop = document.documentElement.scrollTop - 10
    // const jumpUrl = 'menu_' + itemIndex
    // const comType = "click"
    // const wModule = "jump"
    // this.onPostStatics({ e, comType, wModule,  jumpUrl })
  }

  tabDisplayGroupByCompId(tabCompId: string, displayCompId: string) {
    const tabCompData = this.componentMap[tabCompId]
    if (this.selectedCompId) {
      this.siteStore.updateComponentConAttr({
        id: this.selectedCompId,
        conAttr: { left: (tabCompData.conAttr.left - this.offsetX) } 
      })
    } 
    this.siteStore.updateComponentAttr({
      id: displayCompId,
      commonAttr: {
        isVisible: true
      }
    })
  }

  destroy() {
    super.destroy()
    _.forEach(this.components, (compData: IComponent) => {
      if (compData.cid == COMPONENT_TYPES.wb_img) {
        let img = compData.interactionData.vueContainer.$refs.dom.$el
        img.removeEventListener("click", this.onImgClick)
      }
    })
  }
}
