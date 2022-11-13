import { EventBus,isHasOwnProperty } from '@/utils'
import { COMPONENT_TYPES,COMMON_WID_HEI } from '@/const'
import BaseStore from '@/components/utils/BaseStore'

export default class ImgBounceAnim extends BaseStore {
  private gsap: IGsapItemAttr | null
  private gsaps: IGsapItemAttr[]
  private selectedObj: any
  private imgComponents: IComponent[]
  constructor(item: IComponent) {
    super(item)
    //子类覆盖
    this.gsap = null//duration difDuration ease
    this.gsaps = []
    this.imgComponents = []
  }

  start() {
    if(window.MotionPathPlugin){
      window.gsap.registerPlugin(window.MotionPathPlugin)
    }
    this.gsap = this.item.interactionData.injectJsClassObj.gsap
    
    this.initFilterComponents(COMPONENT_TYPES.wb_img)

    if(this.item.interactionData.injectJsClassObj.isLoad){
      this.playGsapAnim()
    }else{
      EventBus.$on("playImgBounceAnim", ({ isPlay }) => {
        if(isPlay){
          this.playGsapAnim()
        }else{
          this.stopGsapAnim()
        }
      })
    }
  }

  playGsapAnim(){
    if(this.gsaps.length > 0){
      _.forEach(this.gsaps, (gsap_) => {
        gsap_.restart()
      })
      return
    }
    let y = isHasOwnProperty(this.gsap, "y") ? this.gsap!.y/COMMON_WID_HEI.adaptiveScale : 0
    let x = isHasOwnProperty(this.gsap, "x") ? this.gsap!.x/COMMON_WID_HEI.adaptiveScale : 0
    let ease = isHasOwnProperty(this.gsap, "ease") ? this.gsap!.ease : "none"
    let yoyo = isHasOwnProperty(this.gsap, "yoyo") ? this.gsap!.yoyo : false
    let repeat = isHasOwnProperty(this.gsap, "repeat") ? this.gsap!.repeat : 0
    let duration = isHasOwnProperty(this.gsap, "duration") ? this.gsap!.duration : 0.5
    let scale = isHasOwnProperty(this.gsap, "scale") ? this.gsap!.scale : 1
    let alpha = isHasOwnProperty(this.gsap, "alpha") ? this.gsap!.alpha : 1
    let positions: any = isHasOwnProperty(this.gsap, "positions") ? this.gsap!.positions : []
    let isBezier = isHasOwnProperty(this.gsap, "isBezier") ? this.gsap!.isBezier : false


    let doms: HTMLElement[] = []
    _.forEach(this.filterComponents, (compData) => {
      const dom = compData.interactionData.vueContainer.$el
      dom.style.transform = ""
      doms.push(dom)
    })
    let positions_:any = []
    let x_ = 0
    let y_ = 0
    let startPosition
    let currentPosition_
    startPosition = positions[0]
    for(let i = 1;i < positions.length; i++){
      currentPosition_ = positions[i]

      x_ = (currentPosition_[0] - startPosition[0])/COMMON_WID_HEI.adaptiveScale
      y_ = (currentPosition_[1] - startPosition[1])/COMMON_WID_HEI.adaptiveScale

      positions_.push({ x: x_, y: y_, scale, alpha })
    }

    let gsap_
    if(isBezier){
      gsap_ = window.gsap.to(doms, { yoyo, ease, repeat, duration,
        motionPath: {
          path: positions_,
          autoRotate: false,
          curviness: 1,
        }, 
      })
    }else{
      gsap_ = window.gsap.to(doms, { x, y, scale, alpha, yoyo, ease, repeat, duration })
    }
    this.gsaps.push(gsap_)
  }

  stopGsapAnim(){
    _.forEach(this.filterComponents, (compData: IComponent) => {
      const dom = compData.interactionData.vueContainer.$el
      dom.style.transform = ""
    })
    _.forEach(this.gsaps, (gsap_) => {
      gsap_.pause()
      gsap_.reversed(false).progress(0)
    })
    // let gsap_
    // while(this.gsaps.length > 0){
    //   gsap_ = this.gsaps.pop()
    //   gsap_.pause()
    // }
  }

  destroy(){
    super.destroy()
    // EventBus.$off("playGroupSpriteSheetAnim", this.onPlayGroupSpriteSheetAnimBind)

    this.gsap = null//duration difDuration ease
    this.selectedObj = null//compId offsetX offetY
    this.imgComponents = []

    // _.forEach(this.doms, (dom) => {
    //   window.gsap.killTweensOf(dom)
    // })
  }
}
