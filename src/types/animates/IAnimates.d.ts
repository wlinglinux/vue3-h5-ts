
declare interface IAnimation {
  triggerType: number | string                   // ANIMATE_TRIGGER_TYPE_MAP.auto,
  isPlayAll: boolean
  playAnimateIndex: number
  isPathAnimate: boolean
  isGsap: boolean
  animates: ICssAnimation[]
  gsap: IGsapAttr
  path: IGsapPath
}

declare interface ICssAnimation {
  name: string
  duration: number 
  delay: number
  repeat: number
  sequence: number
  opacity: number
  classStr: string
  isPlaying: boolean
}

declare interface IAnimationStyle {
  animationName: string,
  animationDuration: string,
  animationTimingFunction: string,
  animationDelay: string,
  animationIterationCount: string | number,
  animationDirection: string, //alternate
  animationPlayState: string,
}

declare interface IGsapAttr {
  durations: string
  repeat: number
  yoyo: boolean
  ease: string                  //GSAP_EASE_TYPES_MAP.none, power3
  easeInOut: string            //GSAP_EASE_INOUT_TYPES_MAP.inOut,
  isOnComplete: null           //function
  onCompleteParams: string
  options: string
  repeat: boolean
}

declare interface IGsapItemAttr {
  x: number
  y: number
  alpha: number
  scale: number
  delay: number
  duration: number
  yoyo: boolean
  [key: string]: number | string
}
  
declare interface IGsapPath {
  type: string                          //'none',//仅适用于当路径是一个对象数组x / y属性，锚,两个控制点,锚,两个控制点,锚等尽可能多的迭代
  isPathBezier: boolean
  curviness: number                    //弯曲程度控制点个数
  autoRotate: boolean                  //自动贴合路径旋转
  attrs: string                        //[{"x":1,"y":1,"alpha":1,"scale":1},{"x":-836,"y":-220,"alpha":0.5}], 坐标是相对于组件的坐标
}

declare interface IGsapPathItemAttr {
  x: number
  y: number
  alpha: number
  scale: number
  [key: string]: number | string
}