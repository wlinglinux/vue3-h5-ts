import { getMapByArr } from '@/utils/'

const LIST_TYPE = [
  { name: "通用列表", value: "1", key: "commonList" },
  { name: "滚动条", value: "2", key: "scroll" },
  { name: "翻页", value: "3", key: "carousel" },
  { name: "3d旋转", value: "4", key: "rotate" },
  { name: "点击显示隐藏", value: "5", key: "relative" },
]
const LIST_TYPE_MAP = getMapByArr(LIST_TYPE)


const PAGE_MODE_TYPES = [
  { name: "上下翻页", value: 1, key: "top_down" },
  { name: "左右翻页", value: 2, key: "left_right" },
]
const PAGE_MODE_MAP = getMapByArr(PAGE_MODE_TYPES)


const SWIPER_EFFCE = [
  { name: '位移切换', value: 'slide' },
  { name: '淡入', value: 'fade' },
  { name: '方块', value: 'cube' },
  { name: '3d流', value: 'coverflow' },
  { name: '3d翻转', value: 'flip' },
]

const SCROLLBER_TYPE = [
  { name: '黑色系', value: 'black' },
  { name: '白色系', value: 'white' },
  { name: '灰色系', value: 'lightgrey' },
  { name: '橄榄绿', value: 'olive' },
  { name: '巧克力色', value: 'chocolate' },
  { name: '珊瑚色', value: 'coral' },
  { name: '深红色', value: 'crimson' },
  { name: '西红柿色', value: 'tomato' },
  { name: '红色系', value: 'red' },
  { name: '橙色系', value: 'orange' },
  { name: '黄色系', value: 'yellow' },
  { name: '绿色系', value: 'green' },
  { name: '青色系', value: 'aqua' },
  { name: '蓝色系', value: 'blue' },
  { name: '紫色系', value: 'purple' },
  { name: '柠檬', value: 'lemon' },
  { name: '雾霾蓝', value: 'hazeblue' },
  { name: '山水棕', value: 'landscape' },
]

const SCROLLBER_TYPE_MAP = getMapByArr(SCROLLBER_TYPE)

const PLACEHOLDER_COLOR_TYPE = [
  { name: '深灰', value: 'darkgray' },
  { name: '浅灰色', value: 'gainsboro' },
  { name: '幽灵白', value: 'ghostwhite' },
  { name: '银色', value: 'silver' },
  { name: '烟白色', value: 'whitesmoke' },
  { name: '爱丽丝蓝', value: 'aliceblue' },
  { name: '紫色系', value: 'purple' },
]

const CAROUSEL_TYPES = [
  { name: '默认', value: '0', key: 'default' },
  { name: '一次显示多个滑块', value: '1', key: 'slidesPerView' },
]
const CAROUSEL_TYPES_MAP = getMapByArr(CAROUSEL_TYPES)

const CAROUSEL_POSITION_TYPE = [
  { name: '中部', value: '0', key: 'center' },
  { name: '上部', value: '1', key: 'top' },
]
const CAROUSEL_POSITION_TYPE_MAP = getMapByArr(CAROUSEL_POSITION_TYPE)

const COLUMN_NUM = [
  {name: "自适应", value:0},
  {name: "1列", value:1},
  {name: "2列", value:2},
  {name: "3列", value:3},
  {name: "4列", value:4},
  {name: "5列", value:5},
  {name: "6列", value:6},
]
const LINE_NUM = [
  {name: "0行", value:0},
  {name: "1行", value:1},
  {name: "2行", value:2},
  {name: "3行", value:3},
  {name: "4行", value:4},
  {name: "5行", value:5},
  {name: "6行", value:6},
  {name: "7行", value:7},
  {name: "8行", value:8},
  {name: "9行", value:9},
  {name: "10行", value:10},
]
const RESIZE_TYPE = [
  { name:'拉伸', value: 3, key: 'stretch' },
  { name:'等比最小', value: 1, key: 'min' },
  { name:'等比最大', value: 2, key: 'max' },
]
const RESIZE_TYPE_MAP = getMapByArr(RESIZE_TYPE)

const CAROUSEL_COLOR_TYPES = [
  { name: '白色系', value: 'white' },
  { name: '黑色系', value: 'black' },
  { name: '峰会金色系', value: 'gold' },
  // { name: '红色系', value: 'red' },
  // { name: '橙色系', value: 'orange' },
  // { name: '黄色系', value: 'yellow' },
  // { name: '绿色系', value: 'green' },
  // { name: '青色系', value: 'aqua' },
  // { name: '蓝色系', value: 'blue' },
  // { name: '紫色系', value: 'purple' },
]

const TIMER_PATTERN = [
  { value: 1, name: '时分秒' },
  { value: 2, name: '天时分秒' },
  { value: 3, name: '00:00:00' },
]
const TIMER_PATTERN_MAP = {
  hour: {value: 1, format: "HH 时 mm 分 ss 秒"},
  day: {value: 2, format: "DD 天 HH 时 mm 分 ss 秒"},
  hourTimeStr: {value: 3, format: "HH:mm:ss"},
  secondStr: {value: 4, format: "ss"},
}

const SAVE_IMG_DATA_TYPES = [
  { name: "jpeg", value: "jpeg" },
  { name: "png", value: "png" },
]

const CALENDER_TYPE = [
  { name: "当前月", value: 0, key: "currentMonth" },
  { name: "选择日期", value: 1, key: "selectedDate" },
]
const CALENDER_TYPE_MAP = getMapByArr(CALENDER_TYPE)

const GLOBAL_POST_TYPES = [
  { name:'关注', value: 'isFollow' },
  { name:'发博带图', value: 'isPushImg' },
  { name:'发博', value: 'isPush' },
]
const GLOBAL_POST_TYPES_MAP = getMapByArr(GLOBAL_POST_TYPES)
const PROCESS_ITEM_TYPES = [
  { name: '横向进度条', value: 'wb-item-process'},
  { name: '垂直进度条', value: 'wb-item-process-vertical'},
]
const RADIO_CHECKBOX_SHAPE_TYPES = [
  { name:'圆形', value:"round" },
  { name:'方形', value:"square" },
]
const RADIO_CHECKBOX_TYPE = [
  {name: "按钮选中框", value: 1, key: "btnSelectedFrame" },
  {name: "按钮", value: 2, key: "btn" },
  {name: "选中框", value: 3, key: "selectedFrame" },
]
const RADIO_CHECKBOX_TYPE_MAP = getMapByArr(RADIO_CHECKBOX_TYPE)

const INPUT_USER_TYPES = [
  {name: '姓名', value: 'name'},
  {name: '等级', value: 'level'},
]
const INPUT_USER_TYPES_MAP = getMapByArr(INPUT_USER_TYPES)

const COLUMN_PERCENT = {
  0: "auto",
  1: '100%',
  2: '50%',
  3: '33.33%',
  4: '25%',
  5: '20%',
  6: '16.6%',
}
const IMG_FILL_TYPE = [
  { name: "无", value: '' },
  { name: "宽高最大", value: 'cover' },
  { name: "宽高最小", value: 'contain' },
  { name: "拉伸", value: 'fill' },
]
const TIMER_TYPES = [
  { name: '倒计时', value: 1, key: 'countdownTime' },
  { name: '正计时', value: 2, key: 'positiveTime' },
  { name: '活动同步计时', value: 3, key: 'activityCountdownTime' },
  { name: '倒计数', value: 4, key: 'countdown' },
  { name: '活动开始结束对比', value: 5, key: 'activityStartEndTime' },
]
const TIMER_TYPES_MAP = getMapByArr(TIMER_TYPES)

const COMMON_ITEM_TYPES = [
  { name: '投票', value: 'wb-item-qsds-vote', key: 'vote' },
  { name: '图文', value: 'wb-item-common', key: 'common' },
]
const COMMON_ITEM_TYPE_MAP = getMapByArr(COMMON_ITEM_TYPES)
// const FOLLOW_TYPES = [
//   { name: '用户', value: '', key: 'uid' },
//   { name: '超话', value: 'chaohua', key: 'chaohua' },
// ]
// const FOLLOW_TYPES_MAP = getMapByArr(FOLLOW_TYPES)

export {
  LIST_TYPE,
  LIST_TYPE_MAP,
  PAGE_MODE_TYPES,
  PAGE_MODE_MAP,
  SWIPER_EFFCE,
  SCROLLBER_TYPE,
  SCROLLBER_TYPE_MAP,
  PLACEHOLDER_COLOR_TYPE,
  CAROUSEL_TYPES,
  CAROUSEL_TYPES_MAP,
  CAROUSEL_POSITION_TYPE, 
  CAROUSEL_POSITION_TYPE_MAP,
  COLUMN_NUM,
  LINE_NUM,
  RESIZE_TYPE,
  RESIZE_TYPE_MAP,
  CAROUSEL_COLOR_TYPES,
  TIMER_PATTERN,
  TIMER_PATTERN_MAP,
  SAVE_IMG_DATA_TYPES,
  CALENDER_TYPE,
  CALENDER_TYPE_MAP,
  GLOBAL_POST_TYPES,
  GLOBAL_POST_TYPES_MAP,
  PROCESS_ITEM_TYPES,
  RADIO_CHECKBOX_SHAPE_TYPES,
  RADIO_CHECKBOX_TYPE,
  RADIO_CHECKBOX_TYPE_MAP,
  INPUT_USER_TYPES,
  INPUT_USER_TYPES_MAP,
  COLUMN_PERCENT,
  TIMER_TYPES,
  TIMER_TYPES_MAP,
  COMMON_ITEM_TYPES,
  COMMON_ITEM_TYPE_MAP,
  IMG_FILL_TYPE,
}

