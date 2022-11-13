type MouseBehaviorType = 'click' | 'load' | 'data'
type CompType = 'InputNormal' | 'TextareaNormal' | 'DropdownNormal'

declare interface IEvent {
  type: string                      //事件的类型 如showOrHide saveImg
  index: number                     //事件的索引值，事件的执行顺序
  eventComType: string              //事件编辑组件名字 如add-event-submit add-event-vote
  mouseBehavior: MouseBehaviorType
  controlId: string
  isHover?: boolean
  comps: IEventItem[]
  isInitComp: boolean

  isPost?: boolean
}

declare interface IEventItem {
  name: CompType                    //InputNormal
  lable: string                     //参数名字
  attrs: IEventItemAttrs            //自定义参数
}

declare interface IEventItemAttrs {
  value: string                             //默认自定义参数值
  delayTime?: number                       //页面跳转事件 自动跳转延迟时间
  [key: string]: any
}

declare interface IEventShare {
  initEvents: IEvent[]
  loadEvents: IEvent[]
  commonFrontEvents: IEvent[]
  wbEvents: IEvent[]
  commonEvents: IEvent[]
  wbTypes: string[]

  mainControlId: string
  pageId: number
  popId: number

  isPost: boolean
  isClick: boolean
  eventIndex: number
  lotteryIndex: number
  
  delayShowPopParams?: any

  //load
  loadImgNum: number
  loadedImgNum: number
  loadEventCb?: number
  loadEventPageCb?: number

  //event
  showPageCb?: number
  showPopCb?: number

  e: any
  isSuccess: boolean
  communicationData: ICommunicationData
  isEventPostFail: boolean

  cssGsapAnimate?: CssGsapAnimate
  isEmitInitEvent?: boolean
}

declare interface IEventAttr{
  resultType: number, 
  eventType: string,
  successPanelId: number, 
  failPanelId: number, 
  successCompId: string, 
  failCompId: string, 
  link: string, 
  isBreak: boolean,
  isBreakResult: boolean,  //主事件后不立即显示结果提示，在对应事件中触发
  isEmitLoadEvent: boolean,
  isEmitInitEvent: boolean,

  isNoActEventResult: boolean,
  params: string //  结果属性-错误码属性配置
}
