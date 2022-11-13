import { EventBus, isHasOwnProperty } from '@/utils'
import { COMMON_WID_HEI } from '@/const'
import BaseStore from '@/components/utils/BaseStore'

export default class SvgFlashStarBg extends BaseStore {
  constructor(item: IComponent) {
    super(item)
    //子类覆盖
  }
  // 2558
  // {"svg":true,"backgroundColor":"#85cff4","fillColor":"yellow","twinkleColor":"#f3eccf"}
  start() {
    const injectJsClassObj =  this.item.interactionData && this.item.interactionData.injectJsClassObj
    const SVG = window.SVG
    const width = COMMON_WID_HEI.clientWidth
    const height = COMMON_WID_HEI.clientHeight
    const compId = '#' + this.item.components[0].id
    const svgDom = SVG().addTo(compId).size(width, height)
    if(isHasOwnProperty(injectJsClassObj, 'backgroundColor')) {
      svgDom.style(compId, { backgroundColor: injectJsClassObj.backgroundColor })
    }
    const fillColor = injectJsClassObj.fillColor || 'yellow'
    const twinkleColor = injectJsClassObj.twinkleColor || '#f3eccf'
    window.setInterval(() => {
      if (Math.random() < 0.7) {
        window.setTimeout(() => {
          createStar()
        }, Math.random() * 1000)
      }
    }, 100)
    
    const createStar = () => {
      const x = Math.random() * width
      const y = Math.random() * height
      const size = Math.random() * 15
      svgDom.circle(size)
        .fill(fillColor)
        .center(x, y)
        .opacity(0)
        .animate(2000)
        .opacity(1)
        .delay(500)
        .after(function () {
          twinkle(x, y, size)
          //@ts-ignore
          this.element().remove()
        })
    }
    const twinkle = (x: number, y: number, size: number) => {
      svgDom.polygon([0, 0, 10, 2, 12, 12, 14, 2, 24, 0, 14, -2, 12, -12, 10, -2])
        .fill(twinkleColor)
        .center(x, y)
        .scale(size/10, x, y)
        .animate(1000)
        .scale(size/3, x, y)
        .opacity(0)
        .after(function () {
          //@ts-ignore
          this.element().remove()
        })
    }
  }

  destroy() {
    super.destroy()
  }
}