import { COMMON_WID_HEI } from '@/const'
import { EventBus, isHasOwnProperty } from '@/utils'
import BaseStore from '@/components/utils/BaseStore'
import { isPostWbEventOrCommonEvents } from '@/components/events/post-event'
interface IPoint {
  x: number,
  y: number
}
export default class TwistedEgg extends BaseStore {
  private className: string
  private ball: HTMLElement[]
  private position: Array<IPoint[]>
  private gsap: IGsapItemAttr | null
  constructor(item: IComponent) {
    super(item)
    //子类覆盖
    this.className = "twisted-egg"
    this.ball = []
    this.position = []
    this.gsap = null
  }

  start() {
    if (window.MotionPathPlugin) {
      window.gsap.registerPlugin(window.MotionPathPlugin)
    }
    // 扭蛋机 2276
    // {
    //   "bgCompId": "2fc49569-0a98-47cf-be89-de7726b90f2c",
    //   "pathNum":4
    //   "gsap": {
    //     "isBezier": true,
    //     "time": 2,
    //     "duration": 1,
    //     "repeat": 2
    //   }
    // }
    let bgCompId = this.item.interactionData && this.item.interactionData.injectJsClassObj.bgCompId
    this.gsap = this.item.interactionData && this.item.interactionData.injectJsClassObj.gsap
    let num = this.item.interactionData && this.item.interactionData.injectJsClassObj.pathNum || 4
    let width = this.componentMap[bgCompId].conAttr.width / 2

    _.forEach(this.components, (component) => {
      if (component.conAttr.width < this.componentMap[bgCompId].conAttr.width) {
        let dom = document.getElementById(component.id)!
        dom.classList.add(this.className)
        let path: IPoint[] = []
        let radio = component.conAttr.width / 2
        let r = width - radio
        for (let i = 0; i < num; i++) {
          let deg = _.random(0, 360)
          let x = r * Math.sin(deg) + r
          let y = r * Math.cos(deg) + r
          let xLoc, yLoc
          xLoc = (x - component.conAttr.left) / COMMON_WID_HEI.adaptiveScale
          yLoc = (y - component.conAttr.top) / COMMON_WID_HEI.adaptiveScale
          path.push({
            x: xLoc,
            y: yLoc
          })
        }
        this.position.push(path)
        this.ball.push(dom)
      }
    })
    this.clickStart = this.clickStart.bind(this)
    this.stopFun = this.stopFun.bind(this)
    EventBus.$on("twistedEgg", this.clickStart)
  }
  clickStart() {
    let ease = isHasOwnProperty(this.gsap, "ease") ? this.gsap!.ease : 'none'
    let repeat = isHasOwnProperty(this.gsap, "repeat") ? this.gsap!.repeat : 1
    this.playAnim('.' + this.className, 1, ease, repeat)
  }
  playAnim(className, duration, ease, repeat) {
    let this_ = this
    let gsap = window.gsap
    gsap.to(className, {
      ease,
      yoyo: true,
      repeat,
      duration,
      motionPath: {
        path: function (index) {
          return this_.position[index]
        },
        autoRotate: false,
        curviness: 0,
      },
      onComplete: function () {
        this_.stopFun()
      }
    })
  }

  stopFun() {
    window.gsap.to('.' + this.className, {
      x: 0,
      y: 0,
      onComplete: function () {
        isPostWbEventOrCommonEvents({ item: this.item , loadEvent: null})
      }
    })
  }
  destroy() {
    super.destroy()
    EventBus.$off("twistedEgg", this.clickStart)
    this.ball = []
  }
}
