import { getMapByArr } from '@/utils/'

const  CANVAS_MC_CLASSNAME_TYPES = [
  { name: '点击消失', value: 'ClickDisappear' },
  // { name: '滑动拉链', value: 'SlideZipper' },
  { name: '逐帧动画', value: 'FrameAnim' },
]

const CANVAS_MC_CLASSNAME_TYPES_MAP = getMapByArr(CANVAS_MC_CLASSNAME_TYPES)

const CREATEJS_CONSTS = {
  "0": {type: "mc", x: 0, y: 0, id: "EB16422FE7F54516A47CF6317F053D14", className: "VideoAnimate"},
  // "1": {type: "Football", x: 0, y: 0, id: "66F3283332C4460CBEC33A387212B713", className: "Football"},
  // "1": {type: "DragFurniture", x: 0, y: 0, id: "33C6AF66DA0946AEA213001E0F661081", className: "DragFurniture", isVector: false},
  // "2": {type: "mc", x: 0, y: 0, id: "944BBB847A6C41C481E3ED2C925796F7", className: "MacOpenDoor", isVector: false},
  // "3": {type: "mc", x: 0, y: 0, id: "C443E09900DC49C6AF1D353FEE69FDAA", className: "MacShopOne", isVector: false},
  // "4": {type: "mc", x: 0, y: 0, id: "930ADE46F8B84F718DCC062B40158B3E", className: "MacShopTwo", isVector: false},
  // "5": {type: "mc", x: 0, y: 0, id: "5AD0F64475F8449FA312A45F18C2AF75", className: "MacShopThree", isVector: false},
  // "6": {type: "mc", x: 0, y: 0, id: "757AC1FF5B644E98A905A43173A8C550", className: "MacShopFour", isVector: false},
  // "7": {type: "mc", x: 0, y: 0, id: "C2A4ED342C6A43A28540DB15CCD65F9A", className: "UnfoldTriangleAnimate", isVector: false},
  // "8": {type: "JdQixiFestival", x: 0, y: 0, id: "E1460967B70C445D836752536FA05F2B", className: "JdQixiFestival"},
  "9": {type: "FoodMap", x: 0, y: 0, id: "1D308DC164924FB3B41E39BD289E9987", className: "FoodMap"},
}

const CANVAS_MC_TYPES = [
  // { name: '大象动画', value: 0 },
  // { name: '拖拽装修', value: 1 },
  // { name: '开门动画', value: 2 },
  // { name: 'mac商品1', value: 3 },
  // { name: 'mac商品2', value: 4 },
  // { name: 'mac商品3', value: 5 },
  // { name: 'mac商品4', value: 6 },
  // { name: '展开三角动画', value: 7 },
  { name: '动画', value: 0 },
  // { name: '足球', value: 1 },
  // { name: '京东七夕', value: 8 },
  { name: '美食地图', value: 9, key: 'foodMap' },
  { name: '自定义', value: 101, key: 'custom' },
]

const CANVAS_MC_TYPES_MAP = getMapByArr(CANVAS_MC_TYPES)

const PAPER_TYPES = [
  { name: "随机绘制", value: 0, key: 'freedomDraw' },
  { name: "绘制颜色块", value: 1, key: 'drawColors' },
  { name: "绘制月亮", value: 1, key: 'drawMoon' },
]

const PAPER_TYPE_MAP = getMapByArr(PAPER_TYPES)
const THREE_LOAD_TYPES = [
  { name: "gltf格式", value: "gltf" },
]
export {
  CANVAS_MC_CLASSNAME_TYPES,
  CANVAS_MC_CLASSNAME_TYPES_MAP,
  CANVAS_MC_TYPES_MAP,
  CANVAS_MC_TYPES,
  THREE_LOAD_TYPES,
  PAPER_TYPES,
  PAPER_TYPE_MAP,
  CREATEJS_CONSTS,
}