import { useInteractionStore } from '@/store/interaction'
import { useSiteStore } from '@/store/site'
import { useControlsStore } from '@/store/controls'
import { useActivityStore } from '@/store/activity'
import { showToast, showPop, showPage } from './index'
import { INJECT_IN_GROUPS , COMPONENT_TYPES} from '@/const'
import { postStatics } from '@/service/statics'
import { getMousePos } from  '@/utils/'

export default class BaseStore {
  protected item: IComponent
  protected commonAttr: ICommonAttr
  protected components: IComponent[]
  protected filterComponents: IComponent[]
  public setIntervalCb: number   

  constructor(item: IComponent) {
    this.item = item
    this.commonAttr = item.commonAttr
    this.components = item.components
    this.filterComponents = []
    this.setIntervalCb = -1
    
    const useSite = useSiteStore()
    if(useSite.isH5Edit) {
      return
    }

    let length = 0
    _.forEach(this.components, (compData: IComponent) => {
      if(INJECT_IN_GROUPS.indexOf(compData.cid) != -1) {
        length++
      }
    })

    // 在这里执行
    this.setIntervalCb = window.setInterval(() => {
      let count = 0
      _.forEach(this.components, (compData: IComponent) => {
        if(compData.interactionData.vueContainer) {
          count++
        }
      })
      if(count != 0 && count >= length) {
        window.clearInterval(this.setIntervalCb!)
        this.start()
      }
    }, this.siteInfo.reloadTime)
  }

  protected get siteStore() {
    return useSiteStore()
  }
  protected get isH5Edit() {
    return useSiteStore().isH5Edit
  }
  protected get siteInfo() {
    return useSiteStore().siteInfo
  }
  protected get siteAttrs() {
    return useSiteStore().attrs
  }
  protected get componentMap() {
    return useSiteStore().componentMap
  }
  protected get getCurrentPage() {
    return useSiteStore().getCurrentPage
  }
  protected get pages() {
    return useSiteStore().pages
  }
  protected get pageIndex() {
    return useSiteStore().pageIndex
  }
  protected get pops() {
    return useSiteStore().pops
  }
  protected get popIndex() {
    return useSiteStore().popIndex
  }

  protected get interactionStore() {
    return useInteractionStore()
  }
  protected get shareInteractionData() {
    return useInteractionStore().shareInteractionData
  }
  protected get formValueMap() {
    return useInteractionStore().formValueMap
  }

  protected get controlsStore() {
    return useControlsStore()
  }

  protected get controls() {
    return useControlsStore().controls
  }

  protected get acctivityStore() {
    return useActivityStore()
  }

  protected get activityInfo() {
    return useActivityStore().activityInfo
  }

  protected get popId() {
    return this.item.eventShare.popId
  }

  protected get pageId() {
    return this.item.eventShare.pageId
  }

  public initFilterComponents(cid: number) {
    this.filterComponents = [];
    _.forEach(this.item.components, (compData: IComponent) => {
      if (compData.cid == cid) {
        this.filterComponents.push(compData)
      }
    })
  }

  public onPostStatics({ e, comType, wModule, jumpUrl }) {
    if (this.isH5Edit) {
      return
    }
    const xy: any = getMousePos(e || this.item.eventShare.e)
    let comId: string = ''
    if (this.item) {
      comId = this.item.id
    }
    postStatics({
      comType, comId, wModule, pageIndex: "group-component", apiType: "",
      apiUri: '', params: '', jumpUrl, clickSequence: "", mouseX: xy.x, mouseY: xy.y
    })
  }

  public start(){}

  public showToast(msg: string) {
    showToast(msg)
  }

  public showPop(popId: number) {
    showPop(popId)
  }

  public showPage(pageId: number) {
    showPage(pageId, this.item)
  }

  public destroy() {
  }
}