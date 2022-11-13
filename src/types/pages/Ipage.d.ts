declare interface IPage extends IGroup {
  type: number
  attrs: IPageAttrs
  styles: IPageStyles
  isActive?: boolean                    //当前页面是否被激活
  isReloadEvent?: boolean
  isForm?: boolean
  isDisplayTextScroller?: boolean
  isAdjustPageHeight?: boolean
  // [key: string]: any
}

declare interface IGroup {
  id: string
  components: IComponent[]
}

declare interface IPageAttrs {
  width: number
  height: number
  // isGradient?: boolean
  // gradientAngle?: number
  // gradients?: string
  bgUrl: string
  backgroundColor: string
  bgPositionRepeatType: number
  isAutoClose: boolean
  delayTime: number
  isPopUseSiteBg: boolean
}

declare interface IPageStyles {
  width: string
  height: string
  backgroundColor: string                          //"rgba(255, 255, 255, 0)",
  backgroundImage: string                          //"url()",
  backgroundSize: string                           //'cover',
  backgroundPosition: string                      //'center center',
  backgroundRepeat: string                        //'no-repeat',
  margin?: string
}
declare interface IConStyles {
  position: string
  width: string
  height: string
  left: string
  top: string
  zIndex: number                    //'no-repeat',
  [key: string]: any
}

declare interface ICompStyles {
  width: string
  height: string
  [key: string]: any
}
