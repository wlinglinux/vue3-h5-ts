import { COMPONENT_TYPES, COMMON_WID_HEI } from '@/const/'
import { createApp, defineComponent, h } from 'vue'
import BaseStore from '@/components/utils/BaseStore'
import { getPxOVwByValue, EventBus } from '@/utils'

// gsap.set(dots, {
// 	backgroundColor: "random([#663399,#84d100,#cc9900,#0066cc,#993333])",
//   scale: "random(0.4, 1)",
// 	x:400,
// 	y:300
// })

// // create the physics2D animation
// let tween = gsap.to(dots, {
// 		duration: 2.5,
// 		physics2D: {
// 			velocity: "random(200, 650)",
// 			angle: "random(250, 290)",
// 			gravity: 500
// 		},
// 		delay: "random(0, 2.5)"
// 	})


export default class ClickRedBagRain extends BaseStore {
  private gsap: null | IGsapItemAttr & { imgCount: number, imgWidth: number }
  private positionArr: number[]
  private offsetWidths: number[]
  private className: string
  private className_: string
  constructor(item: IComponent) {
    super(item)
    //子类覆盖
    // {"gsap":{"imgWidth":142,"duration":3,"imgCount":10}}
    this.gsap = null
    this.positionArr = []
    this.offsetWidths = []
    this.className = "red-bag-rain"
    this.className_ = "red-bag-rain-b"

  }

  start() {
    this.gsap = this.item.interactionData.injectJsClassObj.gsap
    this.initFilterComponents(COMPONENT_TYPES.wb_img)
    const url = this.filterComponents[0].commonAttr.url
    const comp = createApp(this.getImgsDom(url))
    comp.mount("#" + this.item.id)
    this.initRedBadRain()
  }

  getImgDom(url: string, className: string) {
    const style = {
      position: "absolute",
      top: 0,
      left: 0,
      width: getPxOVwByValue(this.filterComponents[0].conAttr.width)
    }
    const filterComponents = this.filterComponents
    const ImgComp = defineComponent({
      methods: {
        onRedBad() {
          EventBus.$emit("itemClick", { id: filterComponents[0].id, index: 0 })
          const doms = document.getElementsByClassName("red-bag-rain-common")
          _.forEach(doms, (dom: HTMLImageElement) => {
            window.gsap.killTweensOf(dom)
          })
        }
      },
      render() {
        return h('img', { src: url, onClick: this.onRedBad, class: [className, "red-bag-rain-common"], style })
      }
    })
    return ImgComp
  }

  getImgsDom(url: string) {
    const children: any = []
    const imgCount = this.gsap!.imgCount
    let ImgComp: any
    for (let i = 0; i < imgCount; i++) {
      ImgComp = this.getImgDom(url, this.className)
      children.push(h(ImgComp))
    }
    for (let i = 0; i < imgCount; i++) {
      ImgComp = this.getImgDom(url, this.className_)
      children.push(h(ImgComp))
    }

    const ImgsComp = defineComponent({
      // setup () {
      //   return { 
      //     count: 0
      //   }
      // },
      // methods: {
      //   increment() {
      //     this.count++
      //   }
      // },
      render() {
        return h('div', {}, children)
      }
    })
    return ImgsComp
  }

  initRedBadRain() {
    const positionArr = this.positionArr
    const imgCount = this.gsap!.imgCount
    const imgWidth = this.gsap!.imgWidth / COMMON_WID_HEI.adaptiveScale
    const duration = this.gsap!.duration
    const ease = this.gsap!.ease
    const offsetWidths = this.offsetWidths
    // let clientWidth = COMMON_WID_HEI.clientWidth
    let j = 1
    for (let i = 0; i < imgCount; i++) {
      positionArr.push(0)
      if (i % 3 == 0) {
        offsetWidths.push(imgWidth * j)
        j++
      }
    }
    this.playAnim('.' + this.className, 0, duration, ease)
    this.playAnim('.' + this.className_, duration, duration, ease)
  }

  playAnim(className: string, delay: number, duration: number, ease: any) {
    const this_ = this
    const offsetWidths = this.offsetWidths
    const gsap = window.gsap
    const positionArr = this.positionArr
    const imgCount = this.gsap!.imgCount
    //random([0,30,45,60,90,120,135,150,165,180,210,225,240,255,270,285,300,315,330,345,360])
    gsap.to(className, {
      duration: 0,
      rotation: "random([0,15,30,-15,-30])",
      x: function (index: number) {
        return positionArr[index]
      },
      y: 0
    })
    gsap.to(className, {
      x: function (index: number) {
        const random_ = gsap.utils.random([0, 1])
        let xx = 0
        if (random_ == 0) {
          xx = positionArr[index] - gsap.utils.random(offsetWidths)
        } else {
          xx = positionArr[index] + gsap.utils.random(offsetWidths)
        }
        return xx
      },
      y: COMMON_WID_HEI.clientHeight * 2,
      duration,
      stagger: duration / imgCount,
      delay: delay,
      ease: ease ? ease : "none",
      onComplete: function () {
        this_.playAnim(className, 0, duration, ease)
      }
    })
  }

  destroy() {
    super.destroy()
    this.gsap = null
    this.positionArr = []
    this.offsetWidths = []
    this.className = ""
    this.className_ = ""
    const doms = document.getElementsByClassName("red-bag-rain-common")
    _.forEach(doms, (dom: HTMLImageElement) => {
      window.gsap.killTweensOf(dom)
    })
  }
}