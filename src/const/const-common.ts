import { getMapByArr } from '@/utils/'

enum PAGE_TYPE {
  single = 1,  // 多页单页
  long = 2,  // 多页长页
}

enum PAGE_POP_TYPE {
  page = 1,
  pop = 2,
}

const PAGINATION_TYPE = [
  { name: '无', value: 0, key: 'none' },
  { name: '分页器', value: 1, key: 'dot' },
  { name: '分页器左右按钮', value: 2, key: 'btns' },
  { name: '分页器按钮都可见', value: 3, key: 'dotAndBtns' },
]

const PAGINATION_TYPE_MAP = getMapByArr(PAGINATION_TYPE)

enum H5_TYPE {
  mobile = 1,
  pc =  2,
  canvas = 3,
  card =  4,
}

enum BG_POSITION_REPEAT_TYPES_MAP {
  centerTop = 1,
  contain = 5,
  width = 6,
  centerBottom = 2,
  repeatY = 3,
  whole = 4,
}

enum POSITION_TYPE {
  no = 0,
  top = 1,
  bottom = 2,
  left = 3,
  right = 4,
  leftTop = 5,
  rightTop = 6,
  leftBottom = 7,
  rightBottom = 8,
  center = 9,
}

const COMMON_WIDTH = 750
const COMMON_HEIGHT = 1334

const COMMON_WID_HEI = {
  width: COMMON_WIDTH,
  height: COMMON_HEIGHT,
  designScale: 2,
  adaptiveScale: 2,
  clientWidth: document.documentElement.clientWidth || document.body.clientWidth,
  clientHeight: document.documentElement.clientHeight || document.body.clientHeight,
}

const MOBILE_WID_HEI = {
  width: COMMON_WIDTH,
  height: COMMON_HEIGHT,
  designScale: 2,
  adaptiveScale: 2,
  clientWidth: document.documentElement.clientWidth || document.body.clientWidth,
  clientHeight: document.documentElement.clientHeight || document.body.clientHeight,
  leftWidth: 200,
  rightWidth: 300,
}

const PC_WID_HEI = {
  width: 800,
  height: document.documentElement.clientHeight - 100,
  designScale: 1,
  adaptiveScale: 1,
  minWidth: 800,
}

const CANVAS_WID_HEI = {
  width: document.documentElement.clientWidth,
  height: document.documentElement.clientHeight - 100,
  designScale: 1,
  adaptiveScale: 1,
  minWidth: document.documentElement.clientWidth,
}
// @ts-ignore
const BASE_ASSETS_URL = process.env.NODE_ENV === "production" ?  "https://static.hd.xxx.com/jye/fe-web/" : "/"
const SITE_DEFAULT_BG = 'https://static.hd.xxx.com/jye/fe-web/images/edit-bg.jpg'
const DEFAULT_MEDIAS = {
  img: BASE_ASSETS_URL + 'images/default-img.png',
  video: BASE_ASSETS_URL + 'videos/default-video.mp4',
  icon: BASE_ASSETS_URL + 'images/default-icon.png',
  qrcode: BASE_ASSETS_URL + 'images/default-qrcode.png',
  mp3: BASE_ASSETS_URL + 'images/default-mp3.mp3',
}

export { 
  PAGE_TYPE, 
  PAGE_POP_TYPE, 
  H5_TYPE, 
  COMMON_WID_HEI, 
  MOBILE_WID_HEI,
  PC_WID_HEI,
  CANVAS_WID_HEI,
  BG_POSITION_REPEAT_TYPES_MAP ,
  POSITION_TYPE,
  PAGINATION_TYPE,
  PAGINATION_TYPE_MAP,
  DEFAULT_MEDIAS,
  COMMON_WIDTH,
  COMMON_HEIGHT,
  SITE_DEFAULT_BG,
}