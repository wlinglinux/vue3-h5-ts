import { useSiteStore } from '@/store/site'
import { useInteractionStore } from '@/store/interaction'
import BaseStore from '@/components/utils/BaseStore'
import { EventBus, getCompIdByParam } from '@/utils/'
import { COMPONENT_TYPES } from '@/const/'
import { getSpritesheetStyle } from '@/components/utils/styles'

//2531 ClickGetCard 1535 ClickChangeText GetChangeText  图片雪碧图
// currentStep: 3, duration: 0, height: 18, width: 12, steps: 10, url: "https://static.hd.xxx.com/upload/biz/26/84414762_1372.png"

export default class ClickGetCard extends BaseStore {
  private cardMap: {}
  private itemIndex: any
  constructor(item: IComponent) {
    super(item)
    //子类覆盖
    this.cardMap = {}//{0:1,1:1}
    this.itemIndex = item.commonAttr.itemIndex
  }

  start() {
    this.refreshDraw = this.refreshDraw.bind(this)
    EventBus.$on('refreshDraw', this.refreshDraw)
    this.refreshDraw()
  }
  refreshDraw() {
    const useSite = useSiteStore()
    let relateCompId = getCompIdByParam(this.commonAttr.relateAttrCompId)
    if (!relateCompId) {
      return
    }
    const useInteraction = useInteractionStore()
    const cardMap = useInteraction.shareInteractionData.card
    _.forEach(this.components, (compData: IComponent) => {
      if (compData.cid == COMPONENT_TYPES.wb_img) {
        //值小于0变灰
        const commonAttr = { filter: { isGrayscale: false, grayscale: 5 } }
        if (cardMap[this.itemIndex + 1] <= 0) {
          commonAttr.filter.isGrayscale = true
        } else {
          commonAttr.filter.isGrayscale = false
        }
        useSite.updateComponentAttr({
          id: compData.id,
          commonAttr,
        })
        // EventBus.$emit('refreshImgStyles', { id: compData.id })
      } else if (compData.cid == COMPONENT_TYPES.wb_text) {
        const commonAttr = { text: String(cardMap[parseInt(this.itemIndex) + 1]) }
        useSite.updateComponentAttr({
          id: compData.id,
          commonAttr,
        })
        EventBus.$emit('reUpdateTextValue')
      } else if(compData.cid == COMPONENT_TYPES.wb_bg) {
        if (compData.interactionData && compData.interactionData.spriteSheetObj) {
          const spriteSheetObj: ISpriteSheet = compData.interactionData.spriteSheetObj
          spriteSheetObj.currentStep = cardMap[this.itemIndex + 1]
          const spriteSheetStyles = getSpritesheetStyle(spriteSheetObj)
          const $el = compData.interactionData.vueContainer.$el
          for(let key in spriteSheetStyles) {
            if(spriteSheetStyles[key]) {
              $el.style[key] = spriteSheetStyles[key]
            }
          }
        }
      } else if(compData.cid == COMPONENT_TYPES.wb_btn) {
         const commonAttr = { isDisabled: true }
         if (cardMap[parseInt(this.itemIndex) + 1] <= 0) {
           commonAttr.isDisabled = true
         } else {
           commonAttr.isDisabled = false
         }
        useSite.updateComponentAttr({
          id: compData.id,
          commonAttr,
        })
        EventBus.$emit('btnStatus', { isDisabled: commonAttr.isDisabled, compId: compData.id })
        let el = compData.interactionData.vueContainer.$refs.dom.$el
        this.onBtnClick = this.onBtnClick.bind(this)
        el.addEventListener("click", this.onBtnClick)
      }
    })
    this.refreshDrawBtn()
  }

  refreshDrawBtn() {
    let compData = this.componentMap[this.item.id]
    let btnCompId = compData.interactionData.btnCompId
    if (btnCompId) {
      let btnCompData = this.componentMap[btnCompId]
      let count = 0
      _.forEach(this.cardMap, (value) => {
        if (value > 0) {
          count++
        }
      })
      const commonAttr = { filter: { isGrayscale: false, grayscale: 5 } }
      let isGrey = true
      if (count < _.size(this.cardMap)) {
        commonAttr.filter.isGrayscale = true
        isGrey = true
      } else {
        commonAttr.filter.isGrayscale = false
        isGrey = false
      }
      _.merge(btnCompData.commonAttr, commonAttr)
      if (btnCompData.cid == COMPONENT_TYPES.wb_img) {
        EventBus.$emit('refreshImgStyles', { id: btnCompId })
      } else {
        EventBus.$emit('btnStatus', { isGrey, compId: btnCompId })
      }
    }
  }

  onBtnClick(e){
    e.stopPropagation()
    const bg = e.currentTarget
    const compId = bg.dataset.id
    const compData = this.componentMap[compId]
    if(!compData.commonAttr.isDisabled){
      EventBus.$emit('itemClick', { id: compId })
    }
  }

  destroy() {
    super.destroy()
    EventBus.$off('refreshDraw', this.refreshDraw)
    _.forEach(this.components, (compData: IComponent) => {
      if(compData.cid == COMPONENT_TYPES.wb_btn){
        let el = compData.interactionData.vueContainer.$refs.dom.$el
        el.removeEventListener("click", this.onBtnClick)
      }
    })
  }
}