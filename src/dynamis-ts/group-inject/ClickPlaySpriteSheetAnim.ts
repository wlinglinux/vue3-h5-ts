import { COMMON_WID_HEI } from '@/const/'
import BaseStore from '@/components/utils/BaseStore'
import { EventBus, getPxOVwByValue } from '@/utils/'

// {"gsap":{"ease":"power4.out","duration":0.6,"difDuration":0.1,"replaceImgUrl":"https://static.hd.xxx.com/upload/biz/26/35770728_1566.png"}}
// {"selectedObj":{"compId":"58af9b9f-69c7-45e8-b44d-861263d4cb0c","offsetX":8,"offsetY":16,"duration":0.6,isIndex:true}}

interface ISelectedObj {
  compId: string,
  offsetX: number,
  offsetY: number,
  isIndex: boolean,
  duration: number
}

export default class ClickPlaySpriteSheetAnim extends BaseStore {
  private gsap: IGsapItemAttr & { difDuration: number } | null
  private selectedObj: null | ISelectedObj
  private imgComponents: IComponent[]
  private setIntervalCompCb: number = -1
  constructor(item: IComponent) {
    super(item)
    //子类覆盖
    this.gsap = null//duration difDuration ease
    this.selectedObj = null//compId offsetX offetY
    this.imgComponents = []
    this.setIntervalCompCb = 0
  }

  start() {
    this.gsap = this.item.interactionData.injectJsClassObj.gsap
    this.selectedObj = this.item.interactionData.injectJsClassObj.selectedObj
    if (this.selectedObj) {
      this.siteStore.updateComponentAttr({
        id: this.selectedObj!.compId,
        commonAttr: {
          isVisible: false
        }
      })
    }

    this.onPlayGroupSpriteSheetAnim = this.onPlayGroupSpriteSheetAnim.bind(this)
    EventBus.$on("playGroupSpriteSheetAnim", this.onPlayGroupSpriteSheetAnim)
  }

  onPlayGroupSpriteSheetAnim({ item }) {
    let arr: number[] = []
    let index = 0
    _.forEach(this.components, (compData) => {
      if (this.selectedObj && compData.id == this.selectedObj.compId) {
        //将选中状态图片除去
      } else {
        arr.push(index)
        this.imgComponents.push(compData)
        index++
      }
    })
    if (!(this.selectedObj && this.selectedObj.isIndex)) {
      arr = _.shuffle(arr)
    }
    if (this.gsap) {
      this.playGsapAnim(arr, item)
    } else {
      this.moveSelectedComp(arr, item)
    }
  }

  playGsapAnim(arr, item) {
    let duration = this.gsap!.duration
    const ease = this.gsap!.ease
    const replaceImgUrl = this.gsap!.replaceImgUrl
    let length = this.components.length - 1
    _.forEach(this.components, (compData: IComponent, index: number) => {
      const dom = compData.interactionData.vueContainer.$el
      if (index == length) {
        window.gsap.to(dom, {
          scale: 0, opacity: 0, duration: duration / 2, ease, onComplete: () => {
            _.forEach(this.components, (compData: IComponent, i: number) => {
              this.siteStore.updateComponentAttr({
                id: compData.id,
                commonAttr: { url: replaceImgUrl },
              })

              const dom = compData.interactionData.vueContainer.$el
              if (i == length) {
                window.gsap.fromTo(dom, { scale: 0.5, opacity: 0.5 }, { duration: duration / 2, ease, scale: 1, opacity: 1, onComplete: () => { this.moveDom(arr, item) } })
              } else {
                window.gsap.fromTo(dom, { scale: 0.5, opacity: 0.5 }, { duration: duration / 2, ease, scale: 1, opacity: 1 })
              }
            })
          }
        })
      } else {
        window.gsap.to(dom, { scale: 0, opacity: 0, duration: duration / 2, ease })
      }
    })
  }

  moveDom(arr, item) {
    const matchIndexArr = _.chunk(arr, 2)
    let duration = this.gsap!.duration
    const ease = this.gsap!.ease
    _.forEach(matchIndexArr, (arr) => {
      if (arr.length == 2) {
        const oneCompData = this.components[arr[0]]
        const oneDom = this.components[arr[0]].interactionData.vueContainer.$el
        const twoCompData = this.components[arr[1]]
        const twoDom = this.components[arr[1]].interactionData.vueContainer.$el

        const oneOffsetX = (oneCompData.conAttr.left - twoCompData.conAttr.left) / COMMON_WID_HEI.adaptiveScale
        const oneOffsetY = (oneCompData.conAttr.top - twoCompData.conAttr.top) / COMMON_WID_HEI.adaptiveScale
        const twoOffsetX = (twoCompData.conAttr.left - oneCompData.conAttr.left) / COMMON_WID_HEI.adaptiveScale
        const twoOffsetY = (twoCompData.conAttr.top - oneCompData.conAttr.top) / COMMON_WID_HEI.adaptiveScale

        window.gsap.to(oneDom, { x: twoOffsetX, y: twoOffsetY, duration, ease })
        duration += this.gsap!.difDuration
        window.gsap.to(twoDom, { x: oneOffsetX, y: oneOffsetY, duration, ease })
        duration += this.gsap!.difDuration
      } else {
        const remainCompData = this.components[arr[0]]
        const remainDom = remainCompData.interactionData.vueContainer.$el

        const differenceArr = _.difference(this.components, [remainCompData])
        const randomCompData = differenceArr[_.random(0, differenceArr.length - 1)]

        const offsetX = (randomCompData.conAttr.left - remainCompData.conAttr.left) / COMMON_WID_HEI.adaptiveScale
        const offsetY = (randomCompData.conAttr.top - remainCompData.conAttr.top) / COMMON_WID_HEI.adaptiveScale

        window.gsap.to(remainDom, {
          x: offsetX, y: offsetY, duration: this.gsap!.duration / 2, ease, onComplete: () => {
            window.gsap.to(remainDom, { x: 0, y: 0, duration: this.gsap!.duration / 2, ease })
            // remainDom.style.transform = "translate3d(0,0,0)"
          }
        })
      }
    })

    window.setTimeout(() => {
      // _.forEach(this.components, (compData) => {
      //   const dom = compData.interactionData.vueContainer.$el
      //   dom.style.transform = "translate3d(0,0,0) scale(0,0)"
      //   dom.style.transform = ""
      // })
      this.complete(item)
    }, duration * 1000)
  }

  moveSelectedComp(arr, item) {
    this.siteStore.updateComponentAttr({
      id: this.selectedObj!.compId,
      commonAttr: {
        isVisible: true
      }
    })

    let index = 0
    let count = 0
    const len = this.imgComponents.length
    let totalCount = len + _.random(0, len)
    const selectCompData = this.componentMap[this.selectedObj!.compId]
    this.setIntervalCompCb = window.setInterval(() => {
      const targetCompData = this.imgComponents[arr[index]]
      const conAttr = {
        left: (targetCompData.conAttr.left - this.selectedObj!.offsetX),
        top: (targetCompData.conAttr.top - this.selectedObj!.offsetY),
      }
      this.siteStore.updateComponentConAttr({
        id: selectCompData.id,
        conAttr,
      })

      if (count >= totalCount) {
        window.clearInterval(this.setIntervalCompCb)
        this.siteStore.updateComponentAttr({
          id: this.selectedObj!.compId,
          commonAttr: {
            isVisible: false
          }
        })
        this.complete(item)
      }
      index++
      count++
      index = index % len
    }, this.selectedObj!.duration * 1000)
  }

  complete(item: IComponent) {
    this.shareInteractionData.isEmit = false
    EventBus.$emit("itemClick", { id: item.id, index: 0, e: null, isPost: true })
    const popId = this.item.interactionData.injectJsClassObj.popId
    if (popId && popId > 0) {
      this.showPop(popId)
    }
  }
  showPop(popId: any) {
    throw new Error('Method not implemented.')
  }

  destroy() {
    super.destroy()
    EventBus.$off("playGroupSpriteSheetAnim", this.onPlayGroupSpriteSheetAnim)
    this.gsap = null//duration difDuration ease
    this.selectedObj = null//compId offsetX offetY
    this.imgComponents = []
    if (this.setIntervalCompCb) {
      window.clearInterval(this.setIntervalCompCb)
    }
  }
}
