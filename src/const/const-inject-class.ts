import { getMapByArr } from '@/utils/'
//站点id 1383（ClickGetCard）1471（OpenDoor）1572（ClickSpeedPK, ImgBounceAnim）
// 1535(ClickChangeText, GetChangeText) 1565 MenuByBtns 1822 MenuByImgs 1566(1879ClickPlaySpriteSheetAnim) 1039(CompVisibility)
//1723 DragInSvg 1471 GroupRadios 1911 ClickSignDay 1913 ClickGetNumberAnim LotteryTurnTable 1822 ClickPuzzle
const INJECT_GROUP_CLASS_NAMES = [
  { name: '无', value: ''},
  { name: '领取卡片', value: 'ClickGetCard'},
  { name: '开门动画', value: 'OpenDoor'},
  { name: '进度条PK动画', value: 'ClickSpeedPK'},
  { name: '点击文本键盘', value: 'ClickChangeText'},
  { name: '获取点击文本键盘文字', value: 'GetChangeText'},
  { name: '图片组菜单', value: 'MenuByImgs'},
  { name: '单选组', value: 'GroupRadios'},
  { name: '按钮组菜单', value: 'MenuByBtns'},
  { name: '雪碧图动画', value: 'ClickPlaySpriteSheetAnim'},
  { name: '图片跳动动画', value: 'ImgBounceAnim'},
  { name: '组件可见', value: 'CompVisibility'},
  { name: '根据svg图形画路径', value: 'DragInSvg'},
  { name: '根据img图形画路径', value: 'DragInImg'},
  { name: '根据矩形svg图形画路径', value: 'DragInRect'},
  { name: '顺序出现', value: 'AppearInSequenceAnim'},
  { name: '签到', value: 'ClickSignDay'},
  { name: '红包雨', value: 'ClickRedBagRain'},
  { name: '粒子动画', value: 'ParticleCartoon'},
  { name: '扭蛋机', value: 'TwistedEggMatter'},
  { name: '扭蛋机2', value: 'TwistedEgg'},
  { name: '单选背景渐变', value: 'RadioImg'},
  { name: '弹幕', value: 'Barrage'},
  { name: '元气植物', value: 'Plant'},
  { name: '滚动图片', value: 'ClickScrollerImages'},
  { name: '按钮多选', value: 'CheckBox'},
  { name: '随机圆背景', value: 'SvgRandomCircleBg'},
  { name: '星星闪烁背景', value: 'SvgFlashStarBg'},
  { name: '随机选中', value: 'RandomSelected'},
  { name: '九宫格抽奖', value: 'GridLottery'},
  { name: '九宫格抽奖图片', value: 'GridLotteryImg'},
]
const INJECT_GROUP_CLASS_NAME_MAP = getMapByArr(INJECT_GROUP_CLASS_NAMES)

//1273
const INJECT_PIXI_CLASS_NAMES = [
  { name: '圆形拖拽清单', value: 'DragIconInCircle'},
  { name: '随机背景', value: 'DynamicBackground'},
  { name: '旋转图片', value: 'DragRotateImage'},
  { name: '掉落获取积分', value: 'DropGetPoints' },
  { name: '绘制月亮', value: 'DrawMoon' },
]
const INJECT_PIXI_CLASS_NAME = getMapByArr(INJECT_PIXI_CLASS_NAMES)
//1273
const INJECT_THREE_CLASS_NAMES = [
  { name: '圆形不规则图案', value: 'CircleIrregularPattern'},
  { name: '星系旋转', value: 'GalaxyAnimate'},
  { name: '更换材质', value: 'ChangeMaterial'},
  { name: '模型提示', value: 'ModelTips'},
  { name: '展示全景图', value: 'DisplayPanorama'},
]
const INJECT_THREE_CLASS_NAME = getMapByArr(INJECT_THREE_CLASS_NAMES)

const INJECT_PHASER_CLASS_NAMES = [
  { name: '消除类游戏', value: 'EliminateGame'},
]
const INJECT_PHASER_CLASS_NAME = getMapByArr(INJECT_PHASER_CLASS_NAMES)


export {
  INJECT_GROUP_CLASS_NAMES,
  INJECT_GROUP_CLASS_NAME_MAP,
  INJECT_PIXI_CLASS_NAMES,
  INJECT_PIXI_CLASS_NAME,
  INJECT_THREE_CLASS_NAMES,
  INJECT_THREE_CLASS_NAME,
  INJECT_PHASER_CLASS_NAMES,
  INJECT_PHASER_CLASS_NAME,
}

