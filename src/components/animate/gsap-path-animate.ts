import { EventBus, isHasOwnProperty } from '@/utils/'
import {  COMMON_WID_HEI } from '@/const/'


function playGsapPathAnimate(componentData: IComponent, $el: HTMLDivElement) {
  // 点击的时候实现高级动画内容 设置了路径的
  const path: IGsapPath = componentData.animate.path
  const gsapAttr: IGsapAttr = componentData.animate.gsap
  const attrs: IGsapPathItemAttr[] = JSON.parse(path.attrs)
  const repeat: number = gsapAttr.repeat
  const durations = gsapAttr.durations.split(",")
  const defaultDuration = durations[0]
  const conAttr = componentData.commonAttr
  let ease = 'power3.inOut'
  if(gsapAttr.ease){
    if(gsapAttr.ease === 'none'){
      ease = gsapAttr.ease
    }else{
      ease = gsapAttr.ease + '.' + gsapAttr.easeInOut
    }
  }

  const tl = window.gsap.timeline({
    repeat: repeat,
    yoyo: gsapAttr.yoyo,
    defaults: { duration: defaultDuration, ease: ease },
    onComplete: () => {
      if(gsapAttr.isOnComplete) {
        EventBus.$emit("itemClick", {id: componentData.id, index: -1})
      }
    }
  })
  _.forEach(attrs, (attr: any, index: number) => {
    const duration = parseInt(durations[index])
    const xx: number = Math.abs(attr.x - conAttr.left) < 5 ? 0 : attr.x/COMMON_WID_HEI.adaptiveScale
    const yy: number = componentData.interactionData.isInGroup || Math.abs(attr.y - conAttr.top) < 5 ? 0 : attr.y/COMMON_WID_HEI.adaptiveScale
    tl.to($el, {
      duration: duration ? duration : defaultDuration,
      opacity: isHasOwnProperty(attr, 'opacity') ? attr.opacity : 1,
      scale: isHasOwnProperty(attr, 'scale') ? attr.scale : 1,
      rotate: isHasOwnProperty(attr, 'rotate') ? attr.rotate : 0,
      x: xx,
      y: yy,
    })
  })
  return tl
}

export {
  playGsapPathAnimate
}