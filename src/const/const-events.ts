import { getMapByArr } from '@/utils/'

const EVENT_TYPE_MAP = {
  showOrHide: 'showOrHide',
  layer: 'layer',
  layerClose: 'layerClose',
  saveImg: 'saveImg',

}

const EVENT_HOVER_TYPES = {
  showOrHide: 'showOrHide',
  layer: 'layer',
  layerClose: 'layerClose',
  saveImg: 'saveImg',
  openPush: 'openPush',
  rotate3d: 'rotate3d',
  interactionData: 'interactionData',
  compareInComps: 'compareInComps',
  frontEvents: 'frontEvents',
  shake: 'shake',
  scanQRCode: 'scanQRCode',
  animate: 'animate',
  checkWeibo: 'checkWeibo',
  link: 'link',
  dial: 'dial',
  anchor: 'anchor',
  email: 'email',
  share: 'share',
  submit: 'submit',
  smsVerification: 'smsVerification',
  vote: 'vote',
  number: 'number',
  push: 'push',
  repost: 'repost',
  praise: 'praise',
  follow: 'follow',
  isFollow: 'isFollow',
  reposts: 'reposts',
  user: 'user',
  rankFriend: 'rankFriend',
  generalNum: 'generalNum',
  judgeRightWrong: 'judgeRightWrong',
  activityInfo: 'activityInfo',
  general: 'general',
  lottery: 'lottery',
  packet: 'packet',
  msg: 'msg',
  statisticData: 'statisticData',
  numberDayExists: 'numberDayExists',
  numberExists: 'numberExists',
  getData: 'getData',
  anchorInPage: 'anchorInPage',
  timer: 'timer',
  site: 'site',
  customUser: 'customUser',
}
const MOUSE_BEHAVIOR_TYPE = {
  click: 'click',
  load: 'load',
  data: 'data',
}

const FRONT_EVENTS = [
  EVENT_HOVER_TYPES.compareInComps,
  EVENT_HOVER_TYPES.rotate3d,
  EVENT_HOVER_TYPES.saveImg,
  EVENT_HOVER_TYPES.shake,
  EVENT_HOVER_TYPES.animate,
  EVENT_HOVER_TYPES.checkWeibo
]

const EVENTS_RESULTS_TYPES_MAP = {
  page: 5,
  pop: 1,
  component: 2,
  jump: 3,
  noTips: 4,
}
const FRONT_EVENT_TYPES = [
  { name: "切换幻灯片", value: 1, key: "swiper" },
  { name: "截图中添加贴纸", value: 2, key: "urlToCanvas" },
  { name: "随机页面或滑动翻页", value: 3, key: "randomOpenPage" },
  { name: "微博微信区别显示", value: 4, key: "weiboWeixin" },
  { name: "视频禁音", value: 5, key: "videoMute" },
  { name: "视频播放声音", value: 9, key: "videoPlayAudio" },
  { name: "播放视频", value: 6, key: "playVideo" },
  { name: "切换视频", value: 21, key: "switchVideo" },
  { name: "改变关联组件数据", value: 7, key: "changeRelateCompData" },
  { name: "打开相册", value: 8, key: "openCamera" },
  { name: "旋转相册图片", value: 22, key: "rotateCameraImg" },
  { name: "移除打开相册图片", value: 15, key: "removeCamera" },
  { name: "老虎机", value: 10, key: "slotMachine" },
  { name: "文本输入添加截图隐藏组件id", value: 11, key: "textChangeAddHiddenId" },
  { name: "删除雪碧图文字", value: 12, key: "removeSpriteSheetText" },
  { name: "确认雪碧图文字", value: 13, key: "confirmSpriteSheetText" },
  { name: "播放雪碧图动画", value: 14 , key: "playSpriteSheetAnim"},
  { name: "幻灯片上一页", value: 16, key: "swiperPre" },
  { name: "幻灯片下一页", value: 17, key: "swiperNext" },
  { name: "播放音乐", value: 18, key: "playAudio" },
  { name: "暂停音乐", value: 19, key: "pauseAudio" },
  { name: "抓娃娃机", value: 20, key: "graspDoll"},
  { name: "复制文本", value: 23, key: "copyText" },
  { name: "随机文本", value: 24, key: "randomText" },
  { name: "导出SVG", value: 25, key: "exportSVG" },
  { name: "扭蛋机", value: 26, key: "twistedEgg" },
  { name: "传递数据", value: 27, key: "passData" },
  { name: "翻动下一页", value: 28, key: "turnBook" },
  { name: "开始倒计时", value: 29, key: "startTimer" },
  { name: "清除paper画布", value: 30, key: "clearPaper"  },
  { name: "切换音频", value: 31, key: "switchAudio" },
  { name: "切换滚动容器", value: 32, key: "switchScroll" },
  { name: "更新组件数据", value: 33, key: "uploadCompData" },
  { name: "模拟计数", value: 34, key: "simulationNumber" },
  { name: "随机页面上一页", value: 35, key: "randomOpenPagePre" },
  { name: "重置按钮状态", value: 36, key: "resetBtnStatus" },
  { name: "随机问题", value: 37, key: "randomQuestions" }
]
const FRONT_EVENT_TYPE_MAPS = getMapByArr(FRONT_EVENT_TYPES)

export {
  EVENT_TYPE_MAP,
  EVENT_HOVER_TYPES,
  MOUSE_BEHAVIOR_TYPE,
  FRONT_EVENTS,
  EVENTS_RESULTS_TYPES_MAP,
  FRONT_EVENT_TYPE_MAPS,
  FRONT_EVENT_TYPES,
}