import { EventBus, isHasOwnProperty } from '@/utils'
import { COMMON_WID_HEI } from '@/const'
import BaseStore from '@/components/utils/BaseStore'

export default class SvgRandomCircleBg extends BaseStore {
  constructor(item: IComponent) {
    super(item)
    //子类覆盖
  }
  // 2558
  // {"svg":true,"backgroundColor":"#85cff4","strokeWidth":16,"opacity":0.4,"radius":50,"minRadius":10}
  start() {
    const injectJsClassObj =  this.item.interactionData && this.item.interactionData.injectJsClassObj
    const SVG = window.SVG
    const width = COMMON_WID_HEI.clientWidth
    const height = COMMON_WID_HEI.clientHeight
    const { random } = Math
    const compId = '#' + this.item.components[0].id
    const svgDom = SVG().addTo(compId).size(width, height)
    if(isHasOwnProperty(injectJsClassObj, 'backgroundColor')) {
      svgDom.style(compId, { backgroundColor: injectJsClassObj.backgroundColor })
    }
    const strokeWidth = injectJsClassObj.strokeWidth || 16
    const opacity = injectJsClassObj.opacity || 0.4
    const radius = injectJsClassObj.radius || 50
    const minRadius = injectJsClassObj.minRadius || 10
    // canvas.text('Mouse over any circle!')
    //   .font('size', 20)
    //   .move(30, 30)
    //   .fill('white')
    for (let i = 0; i < 20; ++i) {
      const fillColor = SVG.Color.random()
      svgDom
        .circle(minRadius + random() * radius)
        .fill(fillColor)
        .stroke({
          width: strokeWidth,
          color: fillColor,
          opacity: opacity
        })
        .center(random() * width, random() * height)
    }
    const list = svgDom.find('circle')
    const animationRunners = list.animate(new SVG.Spring(1000, 20))
    animationRunners.each((circleAnim: any) => {
      circleAnim.center(random() * width, random() * height)
    })
    // list.on('mousemove', (e: any) => {
    //   animationRunners.each((circleAnim: any) => {
    //     circleAnim.center(random() * width, random() * height)
    //   })
    // })
  }

  destroy() {
    super.destroy()
  }
}