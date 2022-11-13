import BaseStore from '@/components/utils/BaseStore'
import { EventBus, } from '@/utils/'
import { COMPONENT_TYPES } from '@/const/'
interface IClickPuzzle {
  puzzle: number[],
  relateCompId: string
}

export default class ClickPuzzle extends BaseStore {
  private injectJsClassObj: IClickPuzzle | null
  private componentBtns: IComponent[]
  private isPosted: boolean
  constructor(item: IComponent) {
    super(item)
    //子类覆盖
    this.injectJsClassObj = null
    this.isPosted = false
    this.componentBtns = []
  }

  start() {
    //子类覆盖
    if (this.item.interactionData && this.item.interactionData.injectJsClassObj) {
      this.injectJsClassObj = this.item.interactionData.injectJsClassObj

      _.forEach(this.components, (compData: IComponent) => {
        if (compData.cid == COMPONENT_TYPES.wb_btn) {
          this.componentBtns.push(compData)
        }
      })
      this.componentBtns = _.sortBy(this.componentBtns, (compData: IComponent) => {
        return compData.commonAttr.itemIndex
      })

      this.addClickEvent()

      EventBus.$on('refreshPuzzle', () => {
        this.isPosted = true
        this.refreshPuzzle()
      })
      this.refreshPuzzle()
    }
  }

  addClickEvent() {
    _.forEach(this.componentBtns, (compData: IComponent) => {
      if (compData.cid == COMPONENT_TYPES.wb_btn) {
        const btn = compData.interactionData.vueContainer.$refs.dom.$el
        this.onBtnClick = this.onBtnClick.bind(this)
        btn.addEventListener("click", this.onBtnClick)
      }
    })
  }

  onBtnClick(e) {
    e.stopPropagation()
    let btn = e.currentTarget
    let compId = btn.parentElement.id
    let compData = this.componentMap[compId]

    let injectJsClassObj = this.injectJsClassObj
    let relateCompId = injectJsClassObj!.relateCompId//触发组件事件id
    let puzzle = this.item.interactionData.puzzle
    puzzle[compData.commonAttr.itemIndex] = 1
    this.interactionStore.updateInteractionData({ puzzle })
    EventBus.$emit("itemClick", { id: relateCompId, index: compData.commonAttr.itemIndex })
  }

  refreshPuzzle() {
    let puzzle = this.item.interactionData.puzzle
    //刷新 点击按钮
    let isDisabled = true
    let itemIndex = 0
    let btnUrls = this.item.injectJsClassObj.urls.split(',')
    let btnUrl = ''
    _.forEach(this.componentBtns, (btnCompData) => {
      btnUrl = ''
      itemIndex = parseInt(btnCompData.commonAttr.itemIndex)
      if (puzzle[itemIndex] > 0) {
        isDisabled = false
        if (puzzle[itemIndex] > 1) {
          btnUrl = btnUrls[itemIndex]
          btnCompData.selectedBgUrl = btnUrl
          btnCompData.commonAttr.backgroundColor = "red"
          // this.store.commit("updateComponentAttr", {
          //   id: btnCompData.id,
          //   selectedBgUrl: btnUrl
          // })
        }
      } else {
        isDisabled = true
      }
      EventBus.$emit('btnStatus', { isDisabled, compId: btnCompData.id })
    })
  }


  destroy() {
    super.destroy()
    //子类覆盖
    this.injectJsClassObj = null
    _.forEach(this.componentBtns, (compData) => {
      if (compData.cid == COMPONENT_TYPES.wb_btn) {
        let btn = compData.interactionData.vueContainer.$refs.dom.$el
        btn.removeEventListener("click", this.onBtnClick)
      }
    })
    this.componentBtns = []
  }
}
