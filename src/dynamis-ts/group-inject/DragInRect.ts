import { COMMON_WID_HEI,COMPONENT_TYPES } from '@/const/'
import { EventBus } from '@/utils/'
import BaseStore from '@/components/utils/BaseStore'


interface IPoint{
  x: number,
  y: number
}

interface IProgressEmit{
  [progress: string]: {
    hiddenCompIds: string,
    displayCompIds: string
  }
}

export default class DragInRect extends BaseStore {
  private touchPosition: { touchX: number ,touchY: number } 
  private raduisR: number
  private keyPoints: IPoint[]
  private hiddenComps: IComponent[]
  private hiddenIndexs: number[]
  private currentIndex: number
  private svgItem: IComponent | null
  private keyPointsLength: number
  private defaultRaduis: number
  private wIndexs: number[]
  private wLengthList: number[]
  private total: number
  private progress: number
  private isHalfEvent: boolean
  private progressEmit: IProgressEmit | null
  private emitVivusProress: any
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
    this.defaultRaduis = 20
    this.wIndexs = []
    this.wLengthList = []
    this.total = 0
    this.progress = 0
    this.isHalfEvent = true
    this.progressEmit = null
  }

  start() {
    _.forEach(this.components, (component) => {
      if (component.cid == COMPONENT_TYPES.wb_svg_icon) {
        this.svgItem = component
      } else if (component.conAttr.width < 50 && component.conAttr.height < 50) {
        this.hiddenComps.push(component)
        component.commonAttr.isVisible = false
        this.raduisR = component.conAttr.width / 2 / COMMON_WID_HEI.adaptiveScale
      }
    })

    let isVisibles = this.item.interactionData.injectJsClassObj.isVisibles
    if (isVisibles) {
      _.forEach(isVisibles, (id) => {
        let comp = _.find(this.hiddenComps, function (item) { return item.id == id })
        comp.commonAttr.isVisible = true
      })
    }

    this.progressEmit = this.item.interactionData.injectJsClassObj.progressEmit
    if (this.svgItem!.commonAttr.isDrag) {
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
      this.wIndexs = this.item.interactionData.injectJsClassObj.wIndexs || [0, 2, 3, 5]
      _.sortBy(this.hiddenComps, item => _.parseInt(item.itemIndex))
      _.forEach(this.hiddenComps, (component, index) => {
        const itemLeft = component.conAttr.left / COMMON_WID_HEI.adaptiveScale
        const itemTop = component.conAttr.top / COMMON_WID_HEI.adaptiveScale
        this.keyPoints.push({ x: left + itemLeft + raduis, y: top + itemTop + raduis })
        if (this.wIndexs.indexOf(index) > -1) {
          this.wLengthList.push(this.item.conAttr.width / COMMON_WID_HEI.adaptiveScale / 2)
        } else {
          this.wLengthList.push(this.item.conAttr.height / COMMON_WID_HEI.adaptiveScale)
        }
      })
      this.hiddenIndexs = []
      this.currentIndex = -1
      this.keyPointsLength = this.keyPoints.length
      this.total = _.sum(this.wLengthList.slice(0, this.wLengthList.length))
    }
  }

  onTouchStart(e) {
    const touchPosition = this.touchPosition
    touchPosition.touchX = (e.touches ? e.touches[0].pageX : e.pageX)
    touchPosition.touchY = (e.touches ? e.touches[0].pageY : e.pageY)
    EventBus.$emit("resetVivus")
    let touch = {
      x: touchPosition.touchX,
      y: touchPosition.touchY,
    }
    if (this.computePointIsInCircle(touch, this.keyPoints[0])) {
      document.documentElement.addEventListener("touchmove", this.onTouchMove)
    }

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
      let pp = 0
      if (this.wIndexs.indexOf(this.currentIndex) > -1) {
        pp = Math.abs(touchX - touchPosition.touchX)
      } else {
        pp = Math.abs(touchY - touchPosition.touchY)
      }
      let progress = 0
      if (this.currentIndex > 0) {
        progress = (pp + _.sum(this.wLengthList.slice(0, this.currentIndex))) / this.total
      } else {
        progress = pp / this.total
      }

      this.progress = progress
      this.emitVivusProress(progress)

      let hiddenCompIds, displayCompIds
      if (progress >= 0.98) {
        progress = 1
        document.documentElement.removeEventListener("touchstart", this.onTouchStart)
        document.documentElement.removeEventListener("touchmove", this.onTouchMove)
        document.documentElement.removeEventListener("touchend", this.onTouchEnd)
        EventBus.$emit("setVivusProress", progress)
        let delayTime = this.item.interactionData && this.item.interactionData.injectJsClassObj.delayTime
        if (!delayTime) delayTime = 0.5
        let svgItemId = this.svgItem!.id
        let itemIndex = this.svgItem!.commonAttr.itemIndex
        window.setTimeout(() => {
          EventBus.$emit("itemClick", { id: svgItemId, index: itemIndex })
        }, delayTime * 1000)
      } else if (progress > 0.5 && this.isHalfEvent) {
        this.isHalfEvent = false
      }

      let keys = Object.keys(this.progressEmit!) 
      for(let i =0 ; i< keys.length ;i ++){
        if(progress >= Number(keys[i])){
          hiddenCompIds = this.progressEmit![keys[i]].hiddenCompIds
          displayCompIds = this.progressEmit![keys[i]].displayCompIds
          break
        }
      }
      if (hiddenCompIds) {
        hiddenCompIds = hiddenCompIds.split(',')
        _.forEach(hiddenCompIds, id => {
          let comp = this.componentMap[id]
          comp.commonAttr.isVisible = false
        })
      }
      if (displayCompIds) {
        displayCompIds = displayCompIds.split(',')
        _.forEach(displayCompIds, id => {
          let comp = this.componentMap[id]
          comp.commonAttr.isVisible = true
        })
      }
    }
  }
  onTouchEnd() {
    this.isHalfEvent = true
    this.currentIndex = -1
    while (this.hiddenIndexs.length > 0) {
      this.hiddenIndexs.pop()
    }
    if (this.progress < 1) {
      EventBus.$emit("resetVivus")
      this.initHidden()
    }
    this.progress = 0
    document.documentElement.removeEventListener("touchmove", this.onTouchMove)
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

  initHidden() {
    // 初始化隐藏组件
    let initHiddenCompIds = this.item.interactionData.injectJsClassObj.initHiddenCompIds
    if (initHiddenCompIds) {
      initHiddenCompIds = initHiddenCompIds.split(',')
      _.forEach(initHiddenCompIds, id => {
        let comp = this.componentMap[id]
        comp.commonAttr.isVisible = false
      })
    }
  }

  destroy() {
    super.destroy()
    this.touchPosition = {touchX: 0,touchY : 0}
    this.raduisR = 0
    this.keyPoints = []
    this.hiddenComps = []
    this.hiddenIndexs = []
    this.currentIndex = -1
    this.progressEmit= null
    if (this.svgItem!.commonAttr.isDrag) {
      document.documentElement.removeEventListener("touchstart", this.onTouchStart)
      document.documentElement.removeEventListener("touchmove", this.onTouchMove)
      document.documentElement.removeEventListener( "touchend", this.onTouchEnd)
    }
    this.svgItem = null
  }
}
