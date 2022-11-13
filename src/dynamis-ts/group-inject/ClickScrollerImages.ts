import { getPxOVwByValue } from '@/utils/'
import BaseStore from '@/components/utils/BaseStore'
import { COMPONENT_TYPES } from '@/const/'
import { getCompIdByParam } from '@/utils/'

interface IClickScrollerImages {
  images: string[] | IInteractionItem[],
  texts: string[],
  moveDistance: number,
  height: number,
  imgWidth: number
}

export default class ClickScrollerImages extends BaseStore {
  private injectJsClassObj: null | IClickScrollerImages
  private componentBtns: IComponent[]
  private pageBtnTopCompData: null | IComponent
  private pageBtnTop: null | HTMLElement
  private pageBtnBottomCompData: null | IComponent
  private pageBtnBottom: null | HTMLElement
  private images: string[] | IInteractionItem[]
  private texts: string[]
  private blankCompData: null | IComponent
  private ulEl: null | HTMLUListElement
  private dayNumber: number
  private activeIndex: number
  private liLength: number
  private moveDistance: number
  private touchStartY: number

  constructor(item: IComponent) {
    super(item)
    //子类覆盖
    this.injectJsClassObj = null
    this.componentBtns = []
    this.pageBtnTopCompData = null
    this.pageBtnTop = null
    this.pageBtnBottomCompData = null
    this.pageBtnBottom = null
    this.images = []
    this.texts = []
    this.blankCompData = null
    this.ulEl = null
    this.dayNumber = 0
    this.activeIndex = 0
    this.liLength = 0
    this.moveDistance = 0
    this.touchStartY = 0

  }

  start() {
    //子类覆盖
    if (this.item.interactionData && this.item.interactionData.injectJsClassObj) {
      this.injectJsClassObj = this.item.interactionData.injectJsClassObj
      if (this.injectJsClassObj!.images) {
        this.images = this.injectJsClassObj!.images
      }
      if (this.injectJsClassObj!.texts) {
        this.texts = this.injectJsClassObj!.texts
      }
      if (this.injectJsClassObj!.moveDistance) {
        this.moveDistance = this.injectJsClassObj!.moveDistance
      }
    }
    _.forEach(this.components, (compData) => {
      if (compData.cid == COMPONENT_TYPES.wb_img) {
        if (compData.commonAttr.name == "top") {
          this.pageBtnTopCompData = compData
          this.pageBtnTop = compData.interactionData.vueContainer.$refs.dom.$el
          this.onBtnTopClick = this.onBtnTopClick.bind(this)
          this.pageBtnTop!.addEventListener("click", this.onBtnTopClick)
        } else if (compData.commonAttr.name == "bottom") {
          this.pageBtnBottomCompData = compData
          this.pageBtnBottom = compData.interactionData.vueContainer.$refs.dom.$el
          this.onBtnBottomClick = this.onBtnBottomClick.bind(this)
          this.pageBtnBottom?.addEventListener("click", this.onBtnBottomClick)
        }
      } else if (compData.cid == COMPONENT_TYPES.wb_bg) {
        this.blankCompData = compData
      }
    })
    let relateCompId = getCompIdByParam(this.item.commonAttr.relateAttrCompId)
    if (relateCompId && this.componentMap[relateCompId].interactionData) {
      this.images = this.componentMap[relateCompId].interactionData.lists
    }
    if (this.images.length > 0) {
      this.liLength = this.images.length
      this.addImageDom()
    } else if (this.texts.length > 0) {
      this.liLength = this.texts.length
      this.addTextDom()
    }
    this.onTouchStart = this.onTouchStart.bind(this)
    this.onTouchMove = this.onTouchMove.bind(this)
    document.documentElement.addEventListener("touchstart", this.onTouchStart)
    document.documentElement.addEventListener("touchmove", this.onTouchMove)
  }

  onTouchStart(e) {
    e.stopPropagation()
    this.touchStartY = (e.touches ? e.touches[0].pageY : e.pageY)
  }

  onTouchMove(e) {
    e.stopPropagation()
    let touchY = (e.touches ? e.touches[0].pageY : e.pageY)
    let touchOffsetY = touchY - this.touchStartY
    if (Math.abs(touchOffsetY) > this.moveDistance) {
      this.touchStartY = touchY
      let mark
      if (touchOffsetY > 0) {
        mark = -1
      } else {
        mark = 1
      }
      this.adjustDay(mark)
    }
  }

  addImageDom() {
    this.createImageClass()
    let ulEl = this.ulEl = document.createElement("ul")
    let blankDom = document.getElementById(this.blankCompData!.id)!
    blankDom.appendChild(ulEl)
    const d = new Date()
    this.dayNumber = d.getMonth() == 1 ? d.getDate() - 1 : 0
    this.activeIndex = this.dayNumber
    const rotate = -360 / this.liLength
    this.images.forEach((imgItem, idx) => {
      const liEl = document.createElement("li")
      liEl.style.setProperty("--day_idx", idx)
      liEl.innerHTML = `<img src=${imgItem.url}>`
      ulEl.append(liEl)
    })
    ulEl.style.setProperty("--rotateDegrees", rotate.toString())

    this.adjustDay(0)
  }

  addTextDom() {
    this.createTextClass()
    let ulEl = this.ulEl = document.createElement("ul")
    let blankDom = document.getElementById(this.blankCompData!.id)!
    blankDom.appendChild(ulEl)
    const d = new Date()
    this.dayNumber = d.getMonth() == 1 ? d.getDate() - 1 : 0
    this.activeIndex = this.dayNumber
    const rotate = -360 / this.liLength
    this.texts.forEach((holiday, idx) => {
      const liEl = document.createElement("li")
      liEl.style.setProperty("--day_idx", idx.toString())
      liEl.innerHTML = `<time datetime="2022-02-${idx + 1}">${idx + 1
        }</time><span>${holiday}</span>`
      ulEl.append(liEl)
    })
    ulEl.style.setProperty("--rotateDegrees", rotate.toString())

    this.adjustDay(0)
  }

  adjustDay(nr) {
    this.dayNumber += nr
    this.ulEl!.style.setProperty("--currentDay", this.dayNumber.toString())

    const activeEl = document.querySelector("li.active")
    if (activeEl) activeEl.classList.remove("active")

    this.activeIndex = (this.activeIndex + nr + this.liLength) % this.liLength
    const newActiveEl = document.querySelector(`li:nth-child(${this.activeIndex + 1})`)!
    // document.body.style.backgroundColor = window.getComputedStyle(
    //   newActiveEl
    // ).backgroundColor
    newActiveEl.classList.add("active")
  }

  onBtnTopClick(e) {
    e.stopPropagation()
    this.adjustDay(-1)
  }

  onBtnBottomClick(e) {
    e.stopPropagation()
    this.adjustDay(1)
  }

  createImageClass() {
    let cssText = `
      ul {
        list-style: none
        width: 100%
        height: 100%
        position: relative
        perspective: 900px
        transform-style: preserve-3d
      }
      ul > li {
        position: absolute
        left: 50%
        top: calc(50% - 1.2rem)
        --rotateX: calc(
          1deg * var(--rotateDegrees) * calc(var(--day_idx) - var(--currentDay))
        )
        transform: rotateX(var(--rotateX)) translateZ(190px) translateX(-50%)
          scale(var(--scale, 1))
        --hue: calc(var(--rotateDegrees) * var(--day_idx))
        background-color: hsl(var(--hue), 50%, var(--lightness, 50%))
        width: 70%
        color: white
        display: grid
        align-items: center
        justify-items: center 
        height: ${this.injectJsClassObj!.height}rem
        transition: transform 500ms ease, background-color 500ms ease
      }
      
      ul > li.active {
        --lightness: 30%
        --scale: 1.1
      }
      li > img {
        width: ${getPxOVwByValue(this.injectJsClassObj!.imgWidth)}
        height: auto
      }
    `
    this.loadStyleString(cssText)
  }
  loadStyleString(cssText: string) {
    throw new Error('Method not implemented.')
  }

  createTextClass() {
    let cssText = `
      ul {
        list-style: none
        width: 100%
        height: 100%
        position: relative
        perspective: 900px
        transform-style: preserve-3d
      }
      ul > li {
        position: absolute
        left: 50%
        top: calc(50% - 1.2rem)
        --rotateX: calc(
          1deg * var(--rotateDegrees) * calc(var(--day_idx) - var(--currentDay))
        )
        transform: rotateX(var(--rotateX)) translateZ(190px) translateX(-50%)
          scale(var(--scale, 1))
        --hue: calc(var(--rotateDegrees) * var(--day_idx))
        background-color: hsl(var(--hue), 50%, var(--lightness, 50%))
        width: 70%
        color: white
        display: grid
        grid-template-columns: 2.5rem auto
        height: ${this.injectJsClassObj!.height}rem
        transition: transform 500ms ease, background-color 500ms ease
      }
      
      ul > li.active {
        --lightness: 30%
        --scale: 1.1
      }
      ul > li > * {
        display: grid
        align-items: center
      }
      li > time {
        text-align: center
      }
      li > span {
        padding-inline-start: 0.5rem
        color: white
      }
    `
    this.loadStyleString(cssText)
  }

  removeEventsListener() {
    document.documentElement.removeEventListener("touchstart", this.onTouchStart)
    document.documentElement.removeEventListener("touchmove", this.onTouchMove)
    this.pageBtnTop!.removeEventListener("click", this.onBtnTopClick)
    this.pageBtnBottom!.removeEventListener("click", this.onBtnBottomClick)
  }

  destroy() {
    super.destroy()
    //子类覆盖
    this.injectJsClassObj = null
    this.componentBtns = []
    this.pageBtnTopCompData = null
    this.pageBtnTop = null
    this.pageBtnBottomCompData = null
    this.pageBtnBottom = null
    this.images = []
    this.texts = []
    this.blankCompData = null
    this.ulEl = null
    this.dayNumber = 0
    this.activeIndex = 0
    this.moveDistance = 0
    this.touchStartY = 0

    this.removeEventsListener()
  }
}
