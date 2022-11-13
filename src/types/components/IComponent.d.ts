declare interface IComponent extends IGroup {
  id: string
  cid: number
  type: string
  title: string
  conAttr: IConAttr
  conStyles: IConStyles | any
  styles?: ICompStyles | any
  commonAttr: ICommonAttr
  animate: IAnimation           // 组件绑定的动画数据
  events: IEventMap
  eventAttr: IEventAttr
  oriEvents?: IEvent[]
  lists: IListItem[]
  btn?: IComponent
  interactionData: IInteractionData
  eventShare: IEventShare
  vueInjectContainer: any
  [key: string]: any
}

declare interface IConAttr {
  position: string
  width: number
  height: number
  height_: number
  top: number
  left: number
  zIndex: number
  realTop: number
  [key: string]: any
}

declare interface ICommonAttr {
  positionType: number 
  relateAttrCompId: string 
  relateEventCompId: string 
  itemIndex: number
  isBottom: boolean 
  isRight: boolean 
  isVisible: boolean
  isPageFixed: boolean
  isFullScreen: boolean
  [key: string]: any
}

declare interface IEventMap {
  [index: string]: IEvent
}



declare interface IInteractionData {
  isDimension?: boolean
  lists: IInteractionItem[]
  dimensionLists?: IInteractionItem[][]
  injectJsClassObj?: any

  vueContainer: any                   //打组基础组件 img btn bg 几个中存储在打组注入类中使用
  groupCompId?: string               // 组件的上级组件Id 移动端动态添加字段
  isInGroupCarousel?: boolean         // 组件是否是打组 移动端动态添加字段
  isInGroup?: boolean

  spriteSheetObj?: any
  groupInjectClassName?: string
  rotateSetTimeoutCb?: number

  pk?: IPK | any                       //{"oppositeNumberCompId":"bc29a11c-ee91-4c61-8bce-3a4b99500b34"}
  card?: any                      //{"card":{"1":0,"2":0,"3":0,"4":0,"5":0},"btnCompId":""}
  puzzle?: any                    //{"puzzle":{"row":6,"col":4},"matchLength":5}
  swiperIndex?: number            // 前端触发事件swiper
  randomPageIds?: number[]         // 
  randomPageIndex?: number
  btnCompId?: string
  puzzle?: any 
  matchLength?: number                   //{"puzzle":{"row":6,"col":4},"matchLength":5}

  signDay?: number                //日历组件 签到天数对比 {"signDay":1,"btnCompId":"05c6a3f2-3f7d-40c6-b286-2512c6aa98e0"}
  lottery?: any
  
  isLoaded?: boolean   //图片加载完成状态
  isSelected?: boolean   //图片点击状态
  isEmit?: boolean // ClickPlaySpriteSheetAnim
  isOpenCamera?: boolean
  // [key: string]: any
}
declare interface IInteractionItem {
  url: string,                  //posterUrl
  selectedUrl: string,
  text: string
  params: string               //videoUrl 2341
}

declare interface IPK {
  oppositeNumberCompId: string
  [key: string]: any
}

declare interface IGroupInteractionItem extends IInteractionItem {
  audio: string
  video: string
  poster: string
  link: string
}

declare interface IVideoItem extends IListItem {
  time: string, 
  popId: string, 
  compId:string
}

declare interface IBtnStatus {
  compId?: string,
  isGrey?: false,
  isSelected: false
}



