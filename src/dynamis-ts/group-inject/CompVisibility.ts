
import { EventBus } from '@/utils/'
import { COMPONENT_TYPES, EVENT_HOVER_TYPES } from '@/const/'
import BaseStore from '@/components/utils/BaseStore'

export default class CompVisibility extends BaseStore {
  private imgs: IComponent[]
  private timeObj: ItimeObj | null
  constructor(item: IComponent) {
    super(item)
    //子类覆盖
    this.imgs = []
    this.timeObj = null
  }

  start() {
    const components_ = _.filter(this.components, (compData: IComponent) => { return compData.cid == COMPONENT_TYPES.wb_img })
    let imgs = _.sortBy(components_, (compData: IComponent) => { return compData.conAttr.top })
    let svgAnimateIndex = -1
    let injectJsClassObj = this.item.interactionData.injectJsClassObj
    let type = injectJsClassObj.type
    let timeObj = this.siteStore.timeObj!

    _.forEach(imgs, (compData: IComponent, index: number) => {
      if (compData.events[EVENT_HOVER_TYPES.interactionData]) {
        const eventItem = compData.events[EVENT_HOVER_TYPES.interactionData]
        const timeStr = eventItem.comps[0].attrs.value && JSON.parse(eventItem.comps[0].attrs.value).time
        if (timeStr) {
          const time = new Date(timeStr).getTime()
          let now = 0
          if (timeObj.serverTime) {
            now = new Date(timeObj.serverTime).getTime()
          } else {
            now = new Date().getTime()
          }

          if (type == "grey") {
            if (now - time >= 0) {
              compData.commonAttr.filter.isGrayscale = false
              compData.commonAttr.filter.grayscale = 0
              svgAnimateIndex = index
            } else {
              compData.commonAttr.filter.isGrayscale = true
              compData.commonAttr.filter.grayscale = 1
            }
          } else if (type == "visible") {
            let isVisible = true
            if (now - time >= 0) {
              isVisible = false
            }
            this.siteStore.updateComponentAttr({
              id: compData.id,
              commonAttr: { isVisible },
            })
          }
        }
      }
    })
    EventBus.$emit("svgPathAnimate", svgAnimateIndex)
  }

  destroy() {
    super.destroy()
    this.imgs = []
    this.timeObj = null
  }
}
