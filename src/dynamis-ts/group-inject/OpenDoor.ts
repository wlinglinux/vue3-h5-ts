import { EventBus, isHasOwnProperty } from '@/utils'
import { COMMON_WID_HEI } from '@/const'
import BaseStore from '@/components/utils/BaseStore'

export default class OpenDoor extends BaseStore {
  private setIntervalImgCb: number | null
  constructor(item: IComponent) {
    super(item)
    //子类覆盖
    // let xx = {"gsap":{"dd290055-2147-4c63-b9fe-ee32a5adfc9e":{"toLeft":-375,"duration":2,"pageId":2,"ease":"sine"},"7e0dccf4-f641-4678-96fe-1c2e6c40e5d9":{"toRight":375,"duration":2,"ease":"sine"}}}
    this.setIntervalImgCb = null
  }
  start() {
    this.setIntervalImgCb = window.setInterval(() => {
      let loadNum = 0
      const length = this.components.length
      _.forEach(this.components, (compData) => {
        let compId = compData.id
        let dom = document.getElementById(compId)
        if (compData.interactionData.isLoaded) {
          loadNum++
        }
        if (dom && loadNum >= length) {
          window.clearInterval(this.setIntervalImgCb!)
          this.gsapPlay()
        }
      })
    }, this.siteInfo.reloadTime)
  }

  gsapPlay() {
    let gsap = window.gsap
    const compsGsapObj = this.item.interactionData.injectJsClassObj.gsap
    _.forEach(this.item.components, (compData) => {
      let groupInObj = compsGsapObj[compData.id]
      if (groupInObj) {
        if (isHasOwnProperty(groupInObj, "toLeft") || isHasOwnProperty(groupInObj, "toRight")) {
          let moveX = groupInObj.toLeft || groupInObj.toRight
          moveX = moveX / COMMON_WID_HEI.adaptiveScale
          let aniDom = document.getElementById(compData.id)
          gsap.to(aniDom, {
            duration: groupInObj.duration ? groupInObj.duration : 2,
            repeat: 0,
            x: moveX,
            ease: groupInObj.ease ? groupInObj.ease + ".out" : "none",
            onComplete: () => {
              let pageId = parseInt(groupInObj.pageId)
              let popId = parseInt(groupInObj.popId)
              if (pageId && pageId > 0) {
                this.showPage(pageId)
              } else if (popId && popId > 0) {
                this.showPop(pageId)
              } else if (groupInObj.autoClose) {
                EventBus.$emit("closePop")
              }
            }
          })
        }
      }
    })
  }
}