import BaseStore from '@/components/utils/BaseStore'
import { createApp, defineComponent, h } from 'vue'
import { isArray } from '@vue/shared'
import { COMPONENT_TYPES, } from '@/const/'
import { isHasOwnProperty } from '@/utils/'
import { COMMON_WID_HEI } from '@/const/'
// {
//   "content":[
//     "zhangsang",
//     "这是文字弹幕内容",
//     "这里也是文字的弹幕内容",
//   ],
//   "textSize":20,
//   "imgHeight": 20,
//   "duration": 10,
//    “num”:5,
//    "fontColor": 0000
// } 站点 2314

interface IClickRedBagRain {
  textSize: number,
  imgHeight: number,
  duration: number,
  num: number,
  content: string[],
  fontColor: string
}

export default class  extends BaseStore {
  private injectJsClassObj: null | IClickRedBagRain
  private num: number
  private count: number
  private className: string
  private className_: string
  private fontFamily: string
  private time: number
  private content: any
  constructor(item: IComponent) {
    super(item)
    //子类覆盖

    this.injectJsClassObj = null
    this.num = 0
    this.count = 0
    this.className = "barrage"
    this.className_ = "barrage-b"
    this.fontFamily = ''
    this.time = 0
  }

  start() {
    this.injectJsClassObj = JSON.parse(this.item.commonAttr.injectJsClassParams)
    this.injectJsClassObj!.textSize = this.injectJsClassObj!.textSize || 20
    this.injectJsClassObj!.duration = this.injectJsClassObj!.duration || 10
    this.num = this.injectJsClassObj!.num || 5
    _.forEach(this.components, item => {
      if (item.cid == COMPONENT_TYPES.wb_text && item.commonAttr.customFontStyle) {
        let arr = item.commonAttr.customFontStyle.split(",")
        this.fontFamily = arr[0]
      }
    })
    let comp
    if (isHasOwnProperty(this.injectJsClassObj, "content")) {
      this.content = this.injectJsClassObj!.content
      comp = createApp(this.getDom())
    }
    comp.mount("#" + this.item.id)
    this.initBarrage()
  }

  getImgDom(url, className, i) {
    let randomTop = (this.item.conAttr.height - this.injectJsClassObj!.imgHeight) / COMMON_WID_HEI.adaptiveScale
    let left = this.item.conAttr.width / COMMON_WID_HEI.adaptiveScale
    let height = this.injectJsClassObj!.imgHeight / COMMON_WID_HEI.adaptiveScale
    let everyHeight = randomTop / this.content.length

    let style = {
      position: "absolute",
      top: (everyHeight * i) + 'px',
      left: left + 'px',
      height: height + 'px'
    }
    const ImgComp = defineComponent({
      render() {
        return h('img', { src: url, class: [className, "barrage-item"], style })
      }
    })
    return ImgComp
  }

  getTextDom(text, className, i) {
    let color
    let fontColor = this.injectJsClassObj!.fontColor
    let fontSize = this.injectJsClassObj!.textSize
    let left = this.item.conAttr.width / COMMON_WID_HEI.adaptiveScale
    if (isArray(fontColor)) {
      let length = fontColor.length
      let index = _.random(0, length - 1)
      color = fontColor[index]
    } else {
      color = fontColor || 'black'
    }

    if (isArray(fontSize)) {
      let length = fontSize.length
      let index = _.random(0, length - 1)
      fontSize = fontSize[index] / COMMON_WID_HEI.adaptiveScale
    } else {
      fontSize = fontSize / COMMON_WID_HEI.adaptiveScale
    }
    let randomTop = (this.item.conAttr.height - fontSize) / COMMON_WID_HEI.adaptiveScale
    let everyHeight = randomTop / this.num

    let style = {
      position: "absolute",
      top: (everyHeight * i) + 'px',
      left: left + 'px',
      fontSize: fontSize + 'px',
      whiteSpace: "nowrap",
      color,
      fontFamily: this.fontFamily
    }
    const TextComp = defineComponent({
      render() {
        return h('span', { class: [className, 'barrage-item'], style }, text)
      }
    })
    return TextComp
  }

  getDom() {
    let children: any = []
    let count = this.content.length
    let comp, j

    this.time = (count / 2) / this.num
    if ((count / 2) % this.num != 0) {
      this.time += 1
    }

    for (j = 0; j < Math.ceil(count / 2); j++) {
      if (this.content[j].match(/\.(jpeg|jpg|gif|png)$/)) {
        comp = this.getImgDom(this.content[j], this.className + '-' + Math.floor(j / this.num), j % this.num)
      } else {
        comp = this.getTextDom(this.content[j], this.className + '-' + Math.floor(j / this.num), j % this.num)
      }
      children.push(h(comp))
    }


    for (let i = 0; i < Math.floor(count / 2); i++) {
      if (this.content[i].match(/\.(jpeg|jpg|gif|png)$/)) {
        comp = this.getImgDom(this.content[i + j], this.className_ + '-' + Math.floor(i / this.num), i % this.num)
      } else {
        comp = this.getTextDom(this.content[i + j], this.className_ + '-' + Math.floor(i / this.num), i % this.num)
      }
      children.push(h(comp))
    }

    const TextsComp = defineComponent({
      render() {
        return h('div', {
          style: {
            height: 'inherit',
            position: 'relative',
            overflow: 'hidden'
          }
        }, children)
      }
    })
    return TextsComp
  }
  initBarrage() {
    // 循环执行
    this.playAnim('.' + this.className + '-' + 0, 0, this.className)
    if (this.num > 1) {
      window.setTimeout(() => {
        this.playAnim('.' + this.className_ + '-' + 0, 0, this.className_)
      }, this.injectJsClassObj!.duration * 1000 / 2)
    }
  }

  playAnim(className, i = 0, realName) {
    let this_ = this
    window.gsap.to(className, {
      x: function (index) {
        let items = document.querySelectorAll(className)
        let left = - (this_.item.conAttr.width / COMMON_WID_HEI.adaptiveScale) - items[index].clientWidth
        return left
      },
      duration: this.injectJsClassObj!.duration,
      ease: "none",
      yoyo: false,
      stagger: this.injectJsClassObj!.duration / this.num,
      onComplete: function () {
        this_.onFinished(realName, i)
        let nextIndex = i + 1
        if (nextIndex >= this_.time) {
          this_.playAnim('.' + realName + '-' + 0, 0, realName)
        } else {
          this_.playAnim('.' + realName + '-' + nextIndex, nextIndex, realName)
        }
      }
    })
  }

  onFinished(className, i) {
    window.gsap.to('.' + className + '-' + i, {
      x: 0,
      y: 0,
      duration: 0,
      delay: 0,
    })
  }

  destroy() {
    super.destroy()
    this.className = ""
    this.className_ = ""
    this.count = 0
    this.num = 0
    this.injectJsClassObj = null
    this.fontFamily = ''
    let doms = document.getElementsByClassName("barrage-item")
    _.forEach(doms, (dom) => {
      window.gsap.killTweensOf(dom)
    })
  }
}
