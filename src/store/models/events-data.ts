import { EVENT_HOVER_TYPES } from '@/const'

const EVENT_TYPES = {
  control:[
    {type: "showOrHide", index: 0, mouseBehavior: "click", isHover:false, comps:[
      {name:"TextareaNormal", lable:"响应行为", attrs:{value:''}}
    ]},
    {type: "layer", index: 0, mouseBehavior: "click", isHover:false, comps:[
      {name:"DropdownNormal", lable:"触发弹层", attrs:{value:1}},
      {name:"TextareaNormal", lable:"组件ids用,分隔", attrs:{value:""}},
      {name:"TextareaNormal", lable:"随机弹层", attrs:{value:''}},
      {name:"TextareaNormal", lable:"关联弹层", attrs:{value:''}},
    ]},
    {type: "layerClose", index: 0, mouseBehavior: "click", isHover:false, comps:[
      {name:"InputNormal", lable:"关闭弹层", attrs:{value:""}}
    ]},
    {type: "rotate3d", index: 0, eventComType:"add-event-rotate3d", mouseBehavior: "click", isHover:false, comps:[
      // {name:"DropdownNormal", lable:"触发弹层", attrs:{value:0}},
      // {name:"DropdownNormal", lable:"触发页面", attrs:{value:0}},
      // {name:"InputNormal", lable:"跳转外链", attrs:{value:""}},
      {name:"InputNormal", lable:"提供数据给关联id", attrs:{value:""}},
      {name:"SwitchNormal", lable:"播放动画", attrs:{value:true}},
      {name:"SwitchNormal", lable:"获取组件提供数据", attrs:{value:false}},
      {name:"TextareaNormal", lable:"自定义数据", attrs:{value:''}}
    ]},
    {type: "interactionData", index: 0, eventComType:"add-event-interaction-data", mouseBehavior: "data", isHover:false, comps:[
      {name:"TextareaNormal", lable:"自定义数据", attrs:{value:''}},
      {name:"InputNormal", lable:"关联组件id", attrs:{value:''}}
    ]},
    {type: "compareInComps", index: 0, mouseBehavior: "click", isHover:false, comps:[
      {name:"TextareaNormal", lable:"组件参数", attrs:{value:''}}
    ]},
    {type: "frontEvents", index: 0, eventComType:"add-event-front-events", mouseBehavior: "click", isHover:false, comps:[
      {name:"DropdownNormal", lable:"事件类型", attrs:{value:'', isBreak: false, isCommonFrontEvents: false}},
      {name:"TextareaNormal", lable:"事件参数", attrs:{value:'', relateCompId:'', rules:'', imgs:'', weiboCompId:'', weixinCompId:''}},
    ]},
    {type: "saveImg", index: 0, eventComType:"add-event-save-img", mouseBehavior: "click", isHover:false, comps:[
      {name:"InputNormal", lable:"发博组件id", attrs:{value:""}},
      {name:"InputNormal", lable:"截图容器id", attrs:{value:"", hiddenCompIds:''}},
      {name:"InputNormal", lable:"替换图片组件id", attrs:{value:"", isUploadImgToServer:false,}},
      {name:"DropdownNormal", lable:"截图类型", attrs:{value:"jpeg", quality:0.8}},
    ]},
    {type: "openPush", index: 0, mouseBehavior: "click", isHover:false, comps:[
      {name:"DropdownNormal", lable:"发博类型", attrs:{value:0}},
      {name:"TextareaNormal", lable:"发博框预设内容", attrs:{value:""}},
      {name:"InputNormal", lable:"发博关联id", attrs:{value:""}},
      {name:"InputNormal", lable:"追加属性", attrs:{value:""}},
      {name:"SwitchNormal", lable:"跳转自身", attrs:{value:false}},
    ]},
    // {type: "shake", index: 0, mouseBehavior: "click", isHover:false, comps:[
    //   {name:"InputNormal", lable:"触发关联事件", attrs:{value:''}}, 
    //   {name:"DropdownNormal", lable:"触发弹层", attrs:{value:0}},
    //   {name:"DropdownNormal", lable:"触发页面", attrs:{value:0}},
    //   {name:"InputNormal", lable:"跳转外链", attrs:{value:""}}
    // ]},
    // {type: "scanQRCode", index: 0, mouseBehavior: "click", isHover:false, comps:[
    //   {name:"InputNormal", lable:"扫一扫参数", attrs:{value:""}}
    // ]},
    {type: "animate", index: 0, mouseBehavior: "click", isHover:false, comps:[
      {name:"InputNormal", lable:"动画参数", attrs:{value:""}}
    ]},
    {type: "checkWeibo", index: 0, mouseBehavior: "click", isHover:false, comps:[
      {name:"DropdownNormal", lable:"触发弹层", attrs:{value:""}},
      {name:"InputNormal", lable:"需要登录微博", attrs:{value:""}},
      {name:"DropdownNormal", lable:"触发页面", attrs:{value:""}},
    ]},
    
  ],
  link: [
    {type: "link", index: 0, eventComType:"add-event-link", mouseBehavior: "click", isHover:false, comps:[
      {name:"InputNormal", lable:"网页链接", attrs:{value:""}},
      {name:"InputNormal", lable:"微博跳转", attrs:{value:""}},
      {name:"InputNormal", lable:"跳转key", attrs:{value:""}},
      {name:"SwitchNormal", lable:"自动跳转", attrs:{value:false,delayTime:0}}
    ]},
    // {type: "dial", index: 0, mouseBehavior: "click", isHover:false, comps:[
    //   {name:"InputNormal", lable:"拨打电话", attrs:{value:"15910586266"}}
    // ]},
    {type: "anchor", index: 0, mouseBehavior: "click", isHover:false, comps:[
      {name:"DropdownNormal", lable:"页面跳转", attrs:{value:""}},
      {name:"InputNormal", lable:"随机页面", attrs:{value:''}},
      {name:"TextareaNormal", lable:"关联页面", attrs:{value:''}},
    ]},
    // {type: "email", index: 0, mouseBehavior: "click", isHover:false, comps:[
    //   {name:"InputNormal", lable:"邮箱", attrs:{value:"xxx@sina.com"}}
    // ]},
    // {type: "share", index: 0, mouseBehavior: "click", isHover:false, comps:[
    //   {name:"InputNormal", lable:"分享参数", attrs:{value:"share"}}
    // ]},
  ],
  wb: [
    {type: "submit", index: 0, eventComType:"add-event-submit", mouseBehavior: "click", controlId: 'submit', isHover:false, comps:[
      {name:"InputNormal", lable:"提示参数", attrs:{value:""}},
      {name:"InputNormal", lable:"多选关联id", attrs:{value:""}},
      {name:"TextareaNormal", lable:"自定义参数（如表单打组组件id）", attrs:{value:""}}
    ]},
    {type: "smsVerification", index: 0, mouseBehavior: "click", controlId: 'smsVerification', isHover:false, comps:[{name:"InputNormal", lable:"验证关联id", attrs:{value:""}}]},
    {type: "vote", index: 0, isInitComp: true, eventComType:"add-event-vote", controlId: '1001', mouseBehavior: "click", isHover:false, comps:[{name:"InputNormal", lable:"提示参数", attrs:{value:""}}]},
    {type: "number", index: 0, isInitComp: true, eventComType:"add-event-number", controlId: '1002', mouseBehavior: "click", isHover:false, comps:[
      {name:"InputNormal", lable:"提示参数", attrs:{value:""}},
      // {name:"DropdownNormal", lable:"没有机会触发弹层", attrs:{value:0}},
      // {name:"InputNormal", lable:"前端触发参数", attrs:{value:""}},
    ]},
    {type: "push", index: 0, eventComType:"add-event-push", controlId: '1004', mouseBehavior: "click", isHover:false, comps:[{name:"InputNormal", lable:"提示参数", attrs:{value:""}}]},
    {type: "repost", index: 0, eventComType:"add-event-repost", controlId: '1003', mouseBehavior: "click", isHover:false, comps:[{name:"InputNormal", lable:"提示参数", attrs:{value:""}}]},
    {type: "praise", index: 0, eventComType:"add-event-praise", controlId: '1006', mouseBehavior: "click", isHover:false, comps:[{name:"InputNormal", lable:"提示参数", attrs:{value:""}}]},
    {type: "follow", index: 0, eventComType:"add-event-follow", controlId: '1007', mouseBehavior: "click", isHover:false, comps:[{name:"InputNormal", lable:"提示参数", attrs:{value:""}}]},
    {type: "isFollow", index: 0, isInitComp: true, eventComType:"", controlId: 'isFollow', isHover:false, comps:[{name:"InputNormal", lable:"提示参数", attrs:{value:""}},{name:"InputNormal", lable:"关注uid", attrs:{value:""}}]},

    {type: "reposts", index: 0, isInitComp: true, eventComType:"add-event-reposts", controlId: '1010', isHover:false, comps:[{name:"InputNormal", lable:"提示参数", attrs:{value:""}}]},
    {type: "user", index: 0, eventComType:"add-event-user", controlId: '1013', mouseBehavior: "data", isInitComp: true, isHover:false, comps:[{name:"InputNormal", lable:"提示参数", attrs:{value:""}}]},
    {type: "rankFriend", index: 0, eventComType:"add-event-rank-friend", isInitComp: true, controlId: '1011', isHover:false, comps:[{name:"InputNormal", lable:"提示参数", attrs:{value:""}}]},
    {type: "generalNum", index: 0, eventComType:"add-event-general-num", isInitComp: true, controlId: '1016', isHover:false, comps:[{name:"InputNormal", lable:"提示参数", attrs:{value:""}}]},
    {type: "judgeRightWrong", index: 0, eventComType:"add-event-judge-right-wrong", isInitComp: true, controlId: '1012', isHover:false, comps:[{name:"InputNormal", lable:"提示参数", attrs:{value:""}}]},

    {type: "activityInfo", index: 0, eventComType:"add-event-activity-info", controlId: '1014', isHover:false, comps:[{name:"InputNormal", lable:"提示参数", attrs:{value:""}}]},

    {type: "general", index: 0, eventComType:"add-event-general", controlId: '1015', mouseBehavior: "click", isHover:false, comps:[{name:"InputNormal", lable:"提示参数", attrs:{value:""}}]},

    {type: "lottery", index: 0, eventComType:"add-event-lottery", controlId: '1009', mouseBehavior: "click", isHover:false, comps:[{name:"InputNormal", lable:"提示参数", attrs:{value:""}}]},
    {type: "packet", index: 0, eventComType:"add-event-packet", controlId: '1008', mouseBehavior: "click", isHover:false, comps:[{name:"InputNormal", lable:"提示参数", attrs:{value:""}}]},
    {type: "msg", index: 0, eventComType:"add-event-msg", controlId: '1005', mouseBehavior: "click", isHover:false, comps:[{name:"InputNormal", lable:"提示参数", attrs:{value:""}}]},

    {type: "statisticData", index: 0, controlId: '1017', isInitComp: true, isHover:false, 
      comps:[
        {name:"DropdownNormal", lable:"统计参数类型", attrs:{value:""}},
        {name:"TextareaNormal", lable:"显示隐藏组件", attrs:{value:""}},
        {name:"TextareaNormal", lable:"组件数据", attrs:{value:""}},
      ]},
    {type: "numberDayExists", index: 0, eventComType:"add-event-number-day-exists", controlId: '1018', isInitComp: true, isHover:false, comps:[{name:"InputNormal", lable:"提示参数", attrs:{value:""}}]},
    {type: "timer", index: 0, eventComType: "add-event-timer", controlId: 'timer', mouseBehavior: "load", isHover:false, comps:[{name:"InputNormal", lable:"提示参数", attrs:{value:""}}]},
    // {type: "site", index: 0, eventComType:"add-event-site", controlId: 'site', mouseBehavior: "click", isHover:false, comps:[{name:"InputNormal", lable:"站点数据", attrs:{value:""}}]},
    // {type: "customUser", index: 0, eventComType:"add-event-customUser", controlId: 'customUser', mouseBehavior: "click", isHover:false, comps:[{name:"InputNormal", lable:"自定义用户", attrs:{value:""}}]},
  ],
}

const getEventTypesMap = () => {
  let EVENT_TYPES_MAP_ = {}
  _.forEach(EVENT_TYPES, (items: IEvent[]) => {
   _.forEach(items, (event: IEvent) => {
    EVENT_TYPES_MAP_[event.type] = event
   })
  })
  return EVENT_TYPES_MAP_
}
let EVENT_TYPES_MAP = getEventTypesMap()

const ANIMATE_EVENT = EVENT_TYPES_MAP[EVENT_HOVER_TYPES.animate]
const USER_EVENT = EVENT_TYPES_MAP[EVENT_HOVER_TYPES.user]
const SAVE_IMG_EVENT = EVENT_TYPES_MAP[EVENT_HOVER_TYPES.saveImg]

export {
  ANIMATE_EVENT,
  EVENT_TYPES_MAP,
  EVENT_TYPES,
  USER_EVENT,
  SAVE_IMG_EVENT
}