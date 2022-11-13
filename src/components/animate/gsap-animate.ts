import { isHasOwnProperty } from '@/utils/'
import {  COMMON_WID_HEI } from '@/const/'


function playGsapAnimate(componentData: IComponent, $el: HTMLDivElement, gsapOptionStr: string) {
  const gsapAttr = componentData.animate.gsap
  const gsapOption = JSON.parse(gsapOptionStr)
  if(isHasOwnProperty(gsapOption, 'keyframes')) {
    if(isHasOwnProperty(gsapOption.keyframes, 'x')) {
      gsapOption.keyframes.x = getXY(gsapOption.keyframes.x)
    }
    if(isHasOwnProperty(gsapOption.keyframes, 'y')) {
      gsapOption.keyframes.y = getXY(gsapOption.keyframes.y)
    }
    const tl = window.gsap.to($el, gsapOption)
    tl.play()
    return tl
  } else {
    gsapOption.ease = gsapAttr.ease
    gsapOption.yoyo = gsapAttr.yoyo
    gsapOption.repeat = gsapAttr.repeat
    gsapOption.duration = isHasOwnProperty(gsapOption, 'duration') ? gsapOption.duration: parseFloat(gsapAttr.durations);
    if(isHasOwnProperty(gsapOption, 'x')) { 
      gsapOption.x = gsapOption.x/COMMON_WID_HEI.adaptiveScale
    }
    if(isHasOwnProperty(gsapOption, 'y')) { 
      gsapOption.y = gsapOption.y/COMMON_WID_HEI.adaptiveScale
    }
    const tl = window.gsap.to($el, gsapOption)
    return tl
  }
}

function getXY(arr: number[]) {
  const positionArr: number[] = []
  _.forEach(arr, (value: number) => {
    positionArr.push(value/COMMON_WID_HEI.adaptiveScale)
  })
  return positionArr
}

export {
  playGsapAnimate
}

