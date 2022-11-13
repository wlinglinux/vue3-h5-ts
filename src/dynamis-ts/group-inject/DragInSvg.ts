import { COMMON_WID_HEI, COMPONENT_TYPES } from '@/const'
import { EventBus } from '@/utils/'
import BaseStore from '@/components/utils/BaseStore'

interface IPoint {
  x: number,
  y: number
}

export default class DragInSvg extends BaseStore {
  private touchPosition: { touchX: number, touchY: number }
  private raduisR: number
  private keyPoints: IPoint[]
  private hiddenComps: IComponent[]
  private hiddenIndexs: number[]
  private currentIndex: number
  private svgItem: IComponent | null
  private keyPointsLength: number
  private defaultRaduis: number
  private isHorizontal: boolean
  private progressCompId: string
  private isShowProgress: boolean
  private showProgress: number
  private emitVivusProress: any
  private progress: number
  constructor(item: IComponent) {
    super(item)
    //子类覆盖
    this.touchPosition = { touchX: 0, touchY: 0 }
    this.raduisR = 40 / COMMON_WID_HEI.adaptiveScale
    this.keyPoints = []
    this.hiddenComps = []
    this.hiddenIndexs = []
    this.currentIndex = -1
    this.svgItem = null
    this.keyPointsLength = 0
    this.defaultRaduis = 16
    this.isHorizontal = false
    this.isShowProgress = false
    this.showProgress = 0
    this.progress = 0
    this.progressCompId = ''
  }

  start() {
    _.forEach(this.components, (component) => {
      if (component.cid == COMPONENT_TYPES.wb_svg_icon) {
        this.svgItem = component
        if (this.svgItem!.conAttr.width > this.svgItem!.conAttr.height * 2) {
          this.isHorizontal = true
        }
      } else if (component.conAttr.width < 150 && component.conAttr.height < 150) {
        this.hiddenComps.push(component)
        component.commonAttr.isVisible = false
        this.raduisR = component.conAttr.width / 2 / COMMON_WID_HEI.adaptiveScale
      }
    })

    let isVisibles = this.item.interactionData && this.item.interactionData.injectJsClassObj.isVisibles
    _.forEach(isVisibles, (index: number) => {
      this.hiddenComps[index].commonAttr.isVisible = true
    })

    if (this.svgItem!.commonAttr.isDrag) {
      let progressCompId = this.progressCompId = this.item.interactionData && this.item.interactionData.injectJsClassObj.progressCompId
      const progressCompData = progressCompId && this.componentMap[progressCompId]
      if (progressCompData) {
        this.isShowProgress = true
        if (this.isHorizontal) {
          this.showProgress = (this.svgItem!.conAttr.width - progressCompData.conAttr.width) / this.svgItem!.conAttr.width
        } else {
          this.showProgress = (this.svgItem!.conAttr.height - progressCompData.conAttr.height) / this.svgItem!.conAttr.height
        }
      }
      this.onTouchStart = this.onTouchStart.bind(this)
      this.onTouchMove = this.onTouchMove.bind(this)
      this.onTouchEnd = this.onTouchEnd.bind(this)
      document.documentElement.addEventListener("touchstart", this.onTouchStart)
      document.documentElement.addEventListener("touchend", this.onTouchEnd)

      this.emitVivusProress = _.throttle((progress) => {
        EventBus.$emit("setVivusProress", progress)
      }, 50)
      const raduis = this.raduisR
      const left = this.item.conAttr.left / COMMON_WID_HEI.adaptiveScale
      const top = this.item.conAttr.top / COMMON_WID_HEI.adaptiveScale
      this.keyPoints = []
      _.forEach(this.hiddenComps, (component) => {
        const itemLeft = component.conAttr.left / COMMON_WID_HEI.adaptiveScale
        const itemTop = component.conAttr.top / COMMON_WID_HEI.adaptiveScale
        this.keyPoints.push({ x: left + itemLeft + raduis, y: top + itemTop + raduis })
      })
      this.hiddenIndexs = []
      this.currentIndex = -1
      this.keyPointsLength = this.keyPoints.length

      // let raduisR = this.raduisR
      // if(raduisR < this.defaultRaduis){
      //   raduisR = this.defaultRaduis
      // }
      // _.forEach(this.keyPoints, (p) => {
      //   let div = document.createElement("div")
      //   div.style.backgroundColor = "red"
      //   div.style.width = raduisR*2 + "px"
      //   div.style.height = raduisR*2 + "px"
      //   div.style.zIndex = 100
      //   div.style.position = "absolute"
      //   div.style.left = p.x + "px"
      //   div.style.top = p.y + "px"
      //   document.body.appendChild(div)
      // })
    }
  }

  onTouchStart(e) {
    const touchPosition = this.touchPosition
    touchPosition.touchX = (e.touches ? e.touches[0].pageX : e.pageX)
    touchPosition.touchY = (e.touches ? e.touches[0].pageY : e.pageY)
    EventBus.$emit("resetVivus")
      // if(this.computePointIsInCircle(touchPosition, this.keyPoints[0])) {
    document.documentElement.addEventListener("touchmove", this.onTouchMove)
    // }

    const jumpUrl = "svg-drag-" + this.item.index
    const comType = "dragstart"
    const wModule = "drag"
    this.onPostStatics({ e, comType, wModule,  jumpUrl })
  }

  onTouchMove(e) {
    let touchPosition = this.touchPosition
    if (this.currentIndex != -1) {
      touchPosition.touchX = this.keyPoints[this.currentIndex].x
      touchPosition.touchY = this.keyPoints[this.currentIndex].y
    }
    const touchX = (e.touches ? e.touches[0].pageX : e.pageX)
    const touchY = (e.touches ? e.touches[0].pageY : e.pageY)

    const currentTouchPosition = { x: touchX, y: touchY }
    let isPush = false
    _.forEach(this.keyPoints, (circle, index) => {
      //这个代码必须匹配index和length才能push，如0，0和1，1，保证第一个是起点位置
      if (this.computePointIsInCircle(currentTouchPosition, circle)) {
        if (this.hiddenIndexs.indexOf(index) == -1) {
          if (this.hiddenIndexs.length == index) {
            isPush = true
          } else {
            isPush = false
          }
          if (isPush) {
            this.hiddenIndexs.push(index)
            if (index > this.currentIndex) {
              this.currentIndex = index % this.keyPointsLength
              // this.hiddenComps[this.currentIndex].commonAttr.isVisible = false
              // this.hiddenComps[(this.currentIndex+1)%this.keyPointsLength].commonAttr.isVisible = true
              touchPosition.touchX = this.keyPoints[this.currentIndex].x
              touchPosition.touchY = this.keyPoints[this.currentIndex].y
            }
          }
        }
      }
    })
    if (this.currentIndex != -1) {
      let progress = this.currentIndex * (1 / this.keyPointsLength)
      let pp = 0
      if (this.currentIndex % 2 == 0 && this.keyPointsLength == 4 || this.isHorizontal) {
        pp = Math.abs(touchX - touchPosition.touchX) / Math.abs(this.keyPoints[(this.currentIndex + 1) % this.keyPointsLength].x - this.keyPoints[this.currentIndex].x - this.raduisR * 2)
      } else {
        pp = Math.abs(touchY - touchPosition.touchY) / Math.abs(this.keyPoints[(this.currentIndex + 1) % this.keyPointsLength].y - this.keyPoints[this.currentIndex].y - this.raduisR * 2)
      }
      if (this.keyPointsLength == 4) {
        progress += pp / this.keyPointsLength
      } else {
        progress += pp
      }

      if (this.isShowProgress) {
        if (progress > this.showProgress) {
          EventBus.$emit("itemClick", { id: this.progressCompId, index: 0 })
        }
      }
      if (progress > 0.98) {
        progress = 1
        document.documentElement.removeEventListener("touchstart", this.onTouchStart)
        document.documentElement.removeEventListener("touchmove", this.onTouchMove)
        EventBus.$emit("setVivusProress", progress)
        let delayTime = this.item.interactionData && this.item.interactionData.injectJsClassObj.delayTime
        if (!delayTime) delayTime = 0.5
        let svgItemId = this.svgItem!.id
        let itemIndex = this.svgItem!.commonAttr.itemIndex
        window.setTimeout(() => {
          EventBus.$emit("itemClick", { id: svgItemId, index: itemIndex })
        }, delayTime * 1000)
      } else {
        this.emitVivusProress(progress)
      }
      this.progress = progress
      // if(this.siteAttrs.isDisplayDebuggerText){
      //   EventBus.$emit("displayDebuggerInfo", { text: "index: " + this.hiddenIndexs.toString() +  "progress: " + progress})
      // }
    }
  }

  onTouchEnd() {
    this.currentIndex = -1
    while (this.hiddenIndexs.length > 0) {
      this.hiddenIndexs.pop()
    }
    if (this.progress < 1) {
      EventBus.$emit("resetVivus")
    }
    // _.forEach(this.hiddenComps, (comp) => {
    //   comp.commonAttr.isVisible = false
    // })
    document.documentElement.removeEventListener("touchmove", this.onTouchMove)
    // this.hiddenComps[0].commonAttr.isVisible = true
  }

  computePointIsInCircle(p, circle) {
    //求点到圆心的距离，用到了勾股定理
    const offsetX = p.x - circle.x
    const offsetY = p.y - circle.y
    var dis = Math.sqrt(offsetX * offsetX + offsetY * offsetY)//Math.sqrt()求平方跟
    let raduisR = this.raduisR
    if (raduisR < this.defaultRaduis) {
      raduisR = this.defaultRaduis
    }
    if (dis <= raduisR) {
      return true
    }
    return false
  }

  destroy() {
    super.destroy()
    this.touchPosition = { touchX: 0, touchY: 0 }
    this.raduisR = 0
    this.keyPoints = []
    this.hiddenComps = []
    this.hiddenIndexs = []
    this.currentIndex = -1
    this.progressCompId = ''
    this.isShowProgress = false
    this.showProgress = 0
    if (this.svgItem!.commonAttr.isDrag) {
      document.documentElement.removeEventListener("touchstart", this.onTouchStart)
      document.documentElement.removeEventListener("touchmove", this.onTouchMove)
      document.documentElement.removeEventListener("touchend", this.onTouchEnd)
    }
    this.svgItem = null
  }
}
