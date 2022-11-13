import BaseStore from '@/components/utils/BaseStore'
import { EventBus, isJSON } from '@/utils/'
import { COMPONENT_TYPES, ANIMATE_TRIGGER_TYPE_MAP } from '@/const/'
import { isPostWbEventOrCommonEvents } from '@/components/events/post-event'
import { playGsapPathAnimate } from './gsap-path-animate'
import { playGsapAnimate } from './gsap-animate'


export default class CssGsapAnimate extends BaseStore {
  private $el: any
  private clearIndex: number = 0
  private loadImgCb?: number
  private gsap_: any
  private loadCount = 0
  private loadedCount = 0
  constructor(item: IComponent) {
    super(item)
    this.$el = this.item.vueInjectContainer.$el
    this.addAnimateListener()
  }
  
  public loadImgPlayAnimate() {
    this.resetAniStatus()
    if(this.item.cid == COMPONENT_TYPES.wb_img) {
      this.loadImgCb = window.setInterval(() => {
        if(this.item.interactionData.isLoaded && this.item.vueInjectContainer) {
          this.$el = this.item.vueInjectContainer.$el
          this.playAnimateOrGsap()
          window.clearInterval(this.loadImgCb)
        }
      }, this.siteInfo.reloadTime)
    } else if(this.item.cid == COMPONENT_TYPES.group_component) {
      this.loadCount = 0
      _.forEach(this.item.components, (compData: IComponent) => {
        if(compData.cid == COMPONENT_TYPES.wb_img) {
          this.loadCount++
        }
      })
      if(this.loadCount > 0) {
        this.loadImgCb = window.setInterval(() => {
          this.loadedCount = 0
          _.forEach(this.item.components, (compData: IComponent) => {
            if(compData.cid == COMPONENT_TYPES.wb_img) {
              if(compData.interactionData.isLoaded) {
                this.loadedCount++
                if(this.loadedCount >= this.loadCount) {
                  this.$el = this.item.vueInjectContainer.$el
                  this.playAnimateOrGsap()
                  window.clearInterval(this.loadImgCb)
                }
              }
            }
          })
        })
      }
    } else {
      this.playAnimateOrGsap()
    }
  }
  public playAnimateOrGsap() {
    if(this.item.animate.isGsap) {
      this.playCompGsap()
    } else {
      this.playCssAnimate()
    }
    if(this.item.animate.triggerType == ANIMATE_TRIGGER_TYPE_MAP.click) {
      isPostWbEventOrCommonEvents({ item: this.item, loadEvent: null})
    }
  }
  private playCssAnimate(id?: string) {
    if(id && this.item.id == id){
      this.playAnimate()
    } else {
      this.playAnimate()
    }
  }
  private playAnimate() {
    this.clearIndex = 0
    let index = this.item.animate.playAnimateIndex
    let animateStyle: any = this.$el.style
    if (this.item.animate.isPlayAll) {
      let animationName = ""
      _.forEach(this.item.animate.animates, (item: ICssAnimation, index: number) => {
        if(index == 0) {
          this.setAniData(item)
          animationName = item.classStr
        } else {
          animationName += "," + item.classStr
          animateStyle.animationName = animationName
          animateStyle.animationDuration += "," + item.duration + 's'
          animateStyle.animationDelay += "," + item.delay + 's'
          let repeat: string | number = item.repeat
          if(repeat >= 99) {
            repeat = "infinite"
          }
          animateStyle.animationIterationCount += "," + repeat
          animateStyle.animationPlayState = ""
        }
      })
    } else if (index >= 0) {
      let item = this.item.animate.animates[index]
      if (item && item.isPlaying) {
        this.setAniData(item)
        animateStyle.animationName = item.classStr
        animateStyle.animationPlayState = item.isPlaying ? "" : "paused"
      } else {
        this.resetAniStatus()
      }
    } else {
      this.resetAniStatus()
    }
  }
  private playCompGsap() {
    if(this.gsap_) {
      this.gsap_.restart()
      this.gsap_.play()
    } else {
      const componentData: IComponent = this.item
      const gsapOptionStr = componentData.animate.gsap.options
      if(gsapOptionStr && isJSON(gsapOptionStr)) {
        this.gsap_ = playGsapAnimate(componentData, this.$el, gsapOptionStr)
      } else if (componentData.animate.isPathAnimate) {
        this.gsap_ = playGsapPathAnimate(componentData, this.$el)
      }
    }
  }
  
  // private pauseCompGsap() {
  //   if(this.gsap_){
  //     this.gsap_.pause()
  //   }
  // }
  private addAnimateEvent() {
    this.clearAnimates = this.clearAnimates.bind(this)
    this.$el.removeEventListener("animationend", this.clearAnimates)
    this.$el.removeEventListener("webkitAnimationEnd", this.clearAnimates)
    this.$el.addEventListener("animationend", this.clearAnimates)
    this.$el.addEventListener("webkitAnimationEnd", this.clearAnimates)
  }
  private addAnimateListener() {
    this.addAnimateEvent()
    this.onPlayAnimate = this.onPlayAnimate.bind(this)
  }
  private removeAnimateListener() {
    this.$el.removeEventListener("animationend", this.clearAnimates)
    this.$el.removeEventListener("webkitAnimationEnd", this.clearAnimates)
  }
  public onPlayAnimate() {
    this.addAnimateEvent()
    this.playAnimate()
  }
  private resetAniStatus() {
    let aniLen = this.item.animate.animates.length
    if(aniLen > 0 && this.clearIndex >= aniLen) {
      let animateStyle = this.$el.style
      animateStyle.animationName = ""
      animateStyle.animationDuration = ""
      animateStyle.animationDelay = ""
      animateStyle.animationIterationCount = ""
      animateStyle.animationPlayState = "paused"
      // animateStyle.visibility = "visible"
      this.clearIndex = -1
    }
  }
  private setAniData(item: ICssAnimation){
    let repeat: string | number = item.repeat
    if(repeat >= 99) {
      repeat = "infinite"
    }
    let animateStyle = this.$el.style
    animateStyle.animationName = item.classStr
    animateStyle.animationDuration = item.duration + 's'
    animateStyle.animationDelay = item.delay + 's'
    animateStyle.animationIterationCount = repeat
    animateStyle.animationPlayState = ""
  }
  private clearAnimates() {
    // if (this.isH5Edit) {
    //   let params = { index: this.item.animate.playAnimateIndex, item: { isPlaying: false } }
    //   this.updateAnimateByIndex(params)
    // }
    this.clearIndex++
    if(this.item.animate) {
      this.resetAniStatus()
      if(!this.isH5Edit && this.item.events.animate) {
        isPostWbEventOrCommonEvents({ item: this.item, loadEvent: null })
      }
    }
    if(this.item.animate.isGsap) {
      if(this.gsap_) {
        this.gsap_.pause()
      }
    }
  }
  public destroy() {
    this.removeAnimateListener()
    if(this.gsap_) {
      this.gsap_.kill()
      window.gsap.killTweensOf(this.$el)
    }
  }
}