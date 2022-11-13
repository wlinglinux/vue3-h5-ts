import { getSpritesheetStyle } from '@/components/utils/styles'
import BaseStore from '@/components/utils/BaseStore'
import { COMPONENT_TYPES } from '@/const/'
import { EventBus } from '@/utils/'
export default class ClickChangeText extends BaseStore {
  private sortComponents: null
  constructor(item: IComponent) {
    super(item)
    //子类覆盖
    this.sortComponents = null
  }

  start() {
    this.sortComponents = _.sortBy(this.components, (compData) => {
      return compData.commonAttr.itemIndex
    })

    this.addClickEvent()
    this.initImgSritesheet()
  }

  initImgSritesheet() {
    //事喜大火红
    // .万.乐.事 .利 .吉 .喜 .大 .如 .安 .平 .心 .想 .意  .成 .火  .盈  .红 .财 .门
    //  0  1  2  3   4   5  6   7  8   9  10  11  12  13  14   15  16  17  18
    let randomSteps = [0, 1, 2, 2, 3, 4, 5, 5, 6, 6, 7, 8, 9, 10, 11, 12, 13, 14, 14, 15, 16, 16, 17, 18]
    randomSteps = _.shuffle(randomSteps)
    _.forEach(this.sortComponents, (compData: IComponent, index: number) => {
      const spriteSheetObj: ISpriteSheet = compData.interactionData.spriteSheetObj
      spriteSheetObj.currentStep = randomSteps[index]
      const spriteSheetStyles = getSpritesheetStyle(spriteSheetObj)
      const $el = compData.interactionData.vueContainer.$el
      for(let key in spriteSheetStyles) {
        if(spriteSheetStyles[key]) {
          $el.style[key] = spriteSheetStyles[key]
        }
      }
    })
  }

  addClickEvent() {
    _.forEach(this.components, (compData: IComponent) => {
      if (compData.cid == COMPONENT_TYPES.wb_bg) {
        const bg = compData.interactionData.vueContainer.$refs.dom.$el
        this.onBgClick = this.onBgClick.bind(this)
        bg.addEventListener("click", this.onBgClick)
      }
    })
  }

  onBgClick(e: any) {
    e.stopPropagation()
    const bg = e.currentTarget
    const compId = bg.dataset.id
    const compData = this.componentMap[compId]
    const spriteSheetObj = compData.interactionData.spriteSheetObj
    EventBus.$emit('changeText', { currentStep: spriteSheetObj.currentStep })
  }

  destroy() {
    super.destroy()

    _.forEach(this.components, (compData: IComponent) => {
      if (compData.cid == COMPONENT_TYPES.wb_process) {
        //待处理
      } else if (compData.cid == COMPONENT_TYPES.wb_bg) {
        const bg = compData.interactionData.vueContainer.$refs.dom.$el
        bg.removeEventListener("click", this.onBgClick)
      }
    })
  }
}
