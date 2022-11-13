import { SCROLLBER_TYPE, PLACEHOLDER_COLOR_TYPE, DEFAULT_MEDIAS, RESIZE_TYPE,
  PAGINATION_TYPE, CAROUSEL_COLOR_TYPES, CAROUSEL_TYPES, TIMER_PATTERN, COMMON_WIDTH, COMMON_HEIGHT,
  SAVE_IMG_DATA_TYPES, CALENDER_TYPE_MAP, GLOBAL_POST_TYPES, TABLE_ITEM_TYPE, 
  BG_POSITION_REPEAT_TYPES_MAP, LIST_TYPE_MAP, PROCESS_ITEM_TYPES, LINE_NUM,
  RADIO_CHECKBOX_SHAPE_TYPES, RADIO_CHECKBOX_TYPE, PAPER_TYPE_MAP, CANVAS_MC_TYPES, THREE_LOAD_TYPES,
  GSAP_EASE_TYPES_MAP, GSAP_EASE_INOUT_TYPES_MAP, ANIMATE_TRIGGER_TYPE_MAP,
  SVG_ANIMATE_PLAY_TYPE, SVG_ANIMATE_EASE_TYPE, SVG_ANIMATE_START_TYPE
} from '@/const/'

//[{"x":1,"y":1,"alpha":1,"scale":1},{"x":-836,"y":-220,"alpha":0.5}]
export const PathAnimate = {
  path: {
    type: 'none',//仅适用于当路径是一个对象数组x / y属性，锚,两个控制点,锚,两个控制点,锚等尽可能多的迭代
    isPathBezier: false,
    curviness: 1,//弯曲程度控制点个数
    autoRotate: false,//自动贴合路径旋转
    attrs: '',//[{"x":1,"y":1,"alpha":1,"scale":1},{"x":-836,"y":-220,"alpha":0.5}], 坐标是相对于组件的坐标
  },
  gsap: {
    durations: '1',
    repeat: -1,
    yoyo: false,
    ease: GSAP_EASE_TYPES_MAP.none, 
    easeInOut: GSAP_EASE_INOUT_TYPES_MAP.inOut,
    isOnComplete: null,
    onCompleteParams: '',
    options: '',
  }
}

export const ADD_COMP_ATTR = {
  commonAttr: {
    positionType: 0, 
    relateAttrCompId: '', 
    relateEventCompId:'', 
    itemIndex: -1,
    isBottom: false, 
    isRight: false, 
    isVisible: true,
    opacity: 1,
    isPageFixed: false,
  },
  animate: {
    triggerType: ANIMATE_TRIGGER_TYPE_MAP.auto,
    isPlayAll: false,
    playAnimateIndex: -1,
    animates: [],
    isPathAnimate: false,
    isGsap: false,
  },
  conStyles: {position:'absolute',width:0,height:0,top:0,left:0,zIndex:0},
  conAttr: {top:0,left:0,zIndex:0},
  events: {},
}

export const ComponentTypesDefaultDom =  {
  1: {
    id: -1,
    cid: 1,
    type: 'wb-text',
    name: 'WbText',
    title: '文本',
    tabName: 'text',
    conAttr: {width:36, height:20},
    commonAttr: {
      fontFamily: '默认字体', fontSize: 28, color: 'rgba(0, 0, 0, 1)', fontWeight: 0, textAlign: 'center', textDecoration: 'none', fontStyle: 'normal', lineHeight: 1.2, letterSpacing: 1, 
      text: '', namePrefix: '', nameSuffix: '', limitTextNum: 1000, nameNum: 0,
      padding: '', backgroundColor: 'rgba(0, 0, 0, 0)',
      isRandom: false, isHtml: false, isSeparator: false, divideNumber: '', isPLable: false, 
      isVertical: false, isDisplayY: false, scrollbarType: SCROLLBER_TYPE[0].value, 
      isDynamic: false, isEdit: false, dataKey: '', tableName: '', need: false, isShowNeed: true, 
      borderStyle: 'none', borderRadius: 0, borderSize: 0, borderColor:'rgba(0, 0, 0, 0)',
      customFontStyle: '', placeholder: '', placeholerColor: PLACEHOLDER_COLOR_TYPE[0].value, 
    },
  },
  2: {
    id: -1,
    cid: 2,
    type: 'wb-img',
    name: 'WbImg',
    title: '图片',
    tabName: 'img',
    conAttr: {width:100, height:100},
    commonAttr: { 
      url: '', name: '', backgroundColor: 'rgba(0, 0, 0, 0)',
      isFullScreen: false, objectFit: '', padding: '0 0 0 0',
      borderStyle: 'none', borderRadius: 0, borderSize: 0, borderColor:'rgba(0, 0, 0, 0)',
      isDynamic: false, dataKey: '', isSaveImg: false, isForm: false, tableName: '', need: false,
    },
  },
  3: {
    id: -1,
    cid: 3,
    type: 'wb-audio',
    name: 'WbAudio',
    title: '音频',
    tabName: 'audio',
    conAttr: {width:80, height:80},
    commonAttr: { 
      url: '', name: '', artist: '', link:'', lrc: '', cover: '', theme: 'transparent', params: '', 
      isFiexed: false, isMini: false, isAutoPlay: false, volume: 1, isDisplayControls: false
    },
  },
  4: {
    id: -1,
    cid: 4,
    type: 'wb-video',
    name: 'WbVideo',
    title: '视频',
    tabName: 'video',
    conAttr: {width:100, height:100},
    lists: [
      {time: '', popId: '', compId: ''},
    ],
    commonAttr: { 
      url: DEFAULT_MEDIAS.video, poster: DEFAULT_MEDIAS.img, link: '', alt: '',
      isAutoPlay: false, isMute: false, isPreload: true,  isLoop: false, 
      isDisplayControls: false, playBtnColor: '#fff',  
      isAddTimeSection: false, isPauseInTimeSection: false, 
      isFullScreen: false, resizeType: RESIZE_TYPE[0].value, 
      popId: 0, pageId: 0, compId: '', 
    },
  },
  11: {
    id: -1,
    cid: 11,
    type: 'wb-imgs',
    name: 'WbImgs',
    title: '图片组',
    tabName: 'imgs',
    lists: [{
      name: '',
      url: DEFAULT_MEDIAS.img,
      link: '',
      schema: '',
    }],
    conAttr: {width:100, height:100},
    commonAttr: {
      paginationType: PAGINATION_TYPE[0].value, effect: 'slide', effectParams: '',
      paginationColorType: CAROUSEL_COLOR_TYPES[0].value,
      carouselType: CAROUSEL_TYPES[0].value, slideNum: 1, slideSpace: 0, isLoop: true,
      autoTurnPage: false, turnPageTime: 2,
      preBtnUrl: '', nextBtnUrl:'', swiperBtnWidth: '', swiperBtnHeight: '',
      isOtherBtnTrigger: false, 
    }
  },
  14: {
    id: -1,
    cid: 14,
    type: 'wb-timer',
    name: 'WbTimer',
    title: '计时属性',
    tabName: 'timer',
    conAttr: {width:260, height:28},
    commonAttr: { 
      fontFamily: '默认字体',fontSize: 28, color: '#fff', pattern: TIMER_PATTERN[0].value, 
    },
  },
  18: {
    id: -1,
    cid: 18,
    type: 'wb-menu',
    name: 'WbMenu',
    title: '菜单栏',
    tabName: 'menu',
    lists:[
      {url:'', icon: '', title:'组合', eventType:'', value:'', bgUrl: '', selectedBgUrl:''},
      {url:'', icon: '', title:'地图', eventType:'', value:'', bgUrl: '', selectedBgUrl:''},
      {url:'', icon: '', title:'自定义', eventType:'', value:'', bgUrl: '', selectedBgUrl:''},
    ],
    conAttr: {width:COMMON_WIDTH/2, height:80, left:0, top:0},
    commonAttr: {
      tabIndex: 0, 
      fontFamily: '默认字体', fontSize: 28, color: '#fff', selectedColor: '#ff0', backgroundColor: 'rgba(0, 0, 0, 0)', seletedBgColor: '', 
      width: 'inherit', height: 100, borderRadius: 1, margin: '4 4 4 4', padding: '4 4 4 4',
      heightEffectParams: ''
    },
  },
  20: {
    id: -1,
    cid: 20,
    type: 'wb-camera',
    name: 'WbCamera',
    title: '打开相机',
    tabName: 'camera',
    conAttr: {width:200, height:300},
    commonAttr: {
      canvasColor: '#e6e6e6', quality: 2, isAutoOpen: false,
      isCutImage: false, cropFrameUrl: '', cropFrameLineUrl: '', cutImageWidth: 452,
      isPlaceholderImg: false, placeholderUrl: '', placeholder: '请打开相册', placeholderFontSize: 14, placeholderColor: '#000', 
      initialImage: '', zoomSpeed: 3, fSizeLimit: 0,
      isShowRemoveButton: true, removeButtonColor:'rgba(0, 0, 0, 1)', delButtonSize: 26,
      isShowLoading: true, loadingColor: 'rgba(96, 96, 96, 1)', loadingSize: 50,
      borderStyle: 'solid', borderRadius: 1, borderSize: 1, borderColor:'rgba(0, 0, 0, 1)',
      isPoster: false, isPostInitialImg: false, saveImgType: SAVE_IMG_DATA_TYPES[0].value, saveImgQuality: 0.8
    },
  },
  21: {
    id: -1,
    cid: 21,
    type: 'wb-turn-book',
    name: 'WbTurnBook',
    title: '翻书动画',
    tabName: 'turnBook',
    lists:[
      { url: '', title:'' }
    ],
    conAttr: {width:COMMON_WIDTH/2, height:COMMON_HEIGHT/2 },
    commonAttr: { 
      isFullScreen: false, pageId: 0, popId: 0, resizeType: RESIZE_TYPE[0].value 
    }
  },
  22:{
    id: -1,
    cid: 22,
    type: 'wb-scroll-container',
    name: 'WbScrollContainer',
    title: '滚动容器',
    tabName: 'scrollContainer',
    lists:[
      { url: '', selectUrl: '', resultUrl: '', link: '', position: '' }
    ],
    conAttr: {width:COMMON_WIDTH/2, height:COMMON_HEIGHT/2 },
    commonAttr: {
      isFullScreen: false, innerHtml: '', url:'', 
      isVertical: true, isTouchMove: false, bubbleUrl: '', effectUrl: '', 
      cropUrls: '', cropUrlsHeight: '', cropUrlsOffset: '',
      bgUrl: '', bgWidth: 0, bgHeight: 0, width: 0, height: 0, 
      slidesPerView: 4.5, imgRelateCompId:'', speed: 1, isUnSelect: false,
      scrollbarType: SCROLLBER_TYPE[0].value, customFontStyle: '', padding: ''
    }
  },
  23:{
    id: -1,
    cid: 23,
    type: 'wb-moveable',
    name: 'WbMoveable',
    title: '拖动交互',
    tabName: 'moveable',
    conAttr: {width:COMMON_WIDTH/2, height:COMMON_HEIGHT/2},
    commonAttr: { 
      isFullScreen: false, cornerColor: '#127BFF', borderColor: '#127BFF'
    }
  },
  24: {
    id: -1,
    cid: 24,
    type: 'wb-calendar',
    name: 'WbCalendar',
    title: '日历',
    tabName: 'calendar',
    conAttr: {width:COMMON_WIDTH, height:COMMON_HEIGHT/2 },
    lists: [{voteId:1}],
    commonAttr: { 
      fontFamily: '默认字体', fontSize: 28,
      calendarType: CALENDER_TYPE_MAP.currentMonth, minDate: '2012/2/1', maxDate: '2012/2/31', 
      backgroundColor: '#f2f2f2', selectedBgColor: 'transparent', 
      color: '#000', selectedColor: '#cf8910', 
      selectedBorderColor: '#2E8B57', selectedBorderUrl: '', 
    }
  },
  64: {
    id: -1,
    cid: 64,
    type: 'wb-common-list',
    name: 'wbCommonList',
    title: '通用列表',
    tabName:'lists',
    lists: [
      {
        title: '',
        url: 'https://static.hd.xxx.com/upload/biz/1/496675.jpg',
        text: '匠心炼造绝美好物，精致生活更有仪式感',
        link: '',
      }
    ],
    conAttr: {width:COMMON_WIDTH, height:COMMON_HEIGHT/2},
    commonAttr: {
      fontFamily: '默认字体', fontSize: 24, color: '#fff', lineHeight: 1.3,
      textAlign: 'left', textDecoration: 'none', fontStyle: 'normal', fontWeight: '',
      columnNum: 2, lineNum: LINE_NUM[1].value,
      width: 0, height: 0, backgroundColor: 'rgba(0, 0, 0, 0)', bgUrl: '',
      margin: '4 4 4 4', padding: '4 4 4 4', 
      borderStyle: 'none', borderRadius: 0, borderSize: 0, borderColor:'rgba(0, 0, 0, 0)',
      isSort: false, isShiftInArr: false,
      itemType: 'wb-item-common'
    },
  },
  65: {
    id: -1,
    cid: 65,
    type: 'wb-is-post-event',
    name: 'WbIsPostEvent',
    title: '全局发送',
    tabName: 'postEvent',
    conAttr: {width:100, height:20 },
    commonAttr: { 
      fontFamily: '默认字体', fontSize: 28, color: '#fff', text:'关注', interfaceType: GLOBAL_POST_TYPES[0].value, isWeiboPost: false,
      borderColor: '#f2f2f2', backgroundColor: 'rgba(0, 0, 0, 0)', 
      selectedCheckboxUrl: '', checkboxUrl:'',
    },
  },
  70: {
    id: -1,
    cid: 70,
    type: 'wb-slot-machine',
    name: 'WbSlotMachine',
    title: '老虎机',
    tabName: 'slotMachine',
    conAttr: {width:COMMON_WIDTH/2, height:COMMON_HEIGHT/4},
    lists: [
      { url: 'https://static.hd.xxx.com/upload/biz/26/17413571_2344.png' }
    ],
    commonAttr: { spinsTime: 1.5, animateTime: 1, pauseTime: 2 },
  },
  100: {
    id: -1,
    cid: 100,
    type: 'wb-input',
    name: 'WbInput',
    title: '输入框',
    tabName: 'input',
    conAttr: {width:242, height:46 },
    commonAttr: { 
      fontFamily: '默认字体', fontSize: 28, color: '#fff',
      customFontStyle: '', padding: '8 8 8 8',
      isAuto: false, userAttr: '', limitTextNum: 20, 
      borderStyle: 'none', borderRadius: 0, borderSize: 0, borderColor:'rgba(0, 0, 0, 0)',
      tableName:'' , need: false, isShowNeed: true, name: 'other', 
      placeholder: '提示文本', placeholerColor: PLACEHOLDER_COLOR_TYPE[0].value,
    },
  },
  101: {
    id: -1,
    cid: 101,
    type: 'wb-btn',
    name: 'WbBtn',
    title: '按钮样式',
    tabName: 'submit',
    conAttr: {width:242, height:46},
    commonAttr: { 
      title: '提交',
      fontFamily: '默认字体', fontSize: 28,
      fontWeight: 200, textAlign: 'center', textDecoration: 'none', fontStyle: 'normal', lineHeight: 1.6, letterSpacing: 1, 
      bgUrl: "", selectedBgUrl: "", 
      color: 'rgba(255, 255, 255, 1)', selectedColor: '', 
      backgroundColor: 'rgba(18, 123, 255, 1)', selectedBgColor: '', 
      margin: '', padding: '', width: 0, height: 0,
      borderStyle: 'none', borderRadius: 0, borderSize: 0, borderColor:'rgba(0, 0, 0, 0)',
      isSelected: false, isDisabled: false, isGrey: false, 
      customFontStyle: ''
    },
  },
  104: {
    id: -1,
    cid: 104,
    type: 'wb-radio',
    name: 'WbRadio',
    title: '单选菜单',
    tabName: 'radioCheckbox',
    lists: [
      {
        id:'', text:'单选一',url:'', link:'', jumpUrl:'', pageId:''
      }
    ],
    conAttr: {width:COMMON_WIDTH/2, height:80 },
    commonAttr: {  
      itemType: RADIO_CHECKBOX_TYPE[0].value, isRightIcon: false,
      isColumn: true, columnNum: 3, padding: '', margin: '', 
      borderStyle: 'none', borderRadius: 0, borderSize: 0, borderColor:'rgba(0, 0, 0, 0)',
      fontFamily: '默认字体', fontSize: 24, customFontStyle: '', lineHeight: 1.3, letterSpacing: 1, 
      itemStyles: { backgroundColor: '#0055b0', color: '#fff', bgUrl: '', url:'' },
      selectedStyles: { backgroundColor: '#0055b0', color: '#fff', bgUrl: '', url: '' },
      isNotForm: false, 
      tableName: '',  title: '', need: true,
      shape: RADIO_CHECKBOX_SHAPE_TYPES[0].value,
    },
  },
  105: {
    id: -1,
    cid: 105,
    type: 'wb-checkbox',
    name: 'WbCheckbox',
    title: '多选菜单',
    tabName: 'radioCheckbox',
    lists: [
      {id:'', text: '多选一', url:'', jumpUrl:''}
    ],
    conAttr: {width:COMMON_WIDTH/2, height:100 },
    commonAttr: { 
      itemType: RADIO_CHECKBOX_TYPE[0].value,
      isColumn: true, columnNum: 3, padding: '', margin: '',
      borderStyle: 'none', borderRadius: 0, borderSize: 0, borderColor:'rgba(0, 0, 0, 0)',
      fontFamily: '默认字体', fontSize: 24, customFontStyle: '', lineHeight: 1.3, letterSpacing: 1, 
      itemStyles: { backgroundColor: '#0055b0', color: '#fff', bgUrl: '', url: '' },
      selectedStyles: { backgroundColor: '#0055b0', color: '#fff', bgUrl: '', url: ''},
      tableName: '', title: '', need: true, min:0, max:4, link: '',
      shape: RADIO_CHECKBOX_SHAPE_TYPES[1].value,
    },
  },
  106: {
    id: -1,
    cid: 106,
    type: 'wb-dropdown',
    name: 'WbDropdown',
    title: '下拉属性',
    tabName: 'dropdown',
    lists: [{id:'', text:''}],
    conAttr: {width:COMMON_WIDTH/2, height:46 },
    commonAttr: { 
      need: true, title: '', placeholder: '请选择', placeholerColor: '', tableName:'', 
      fontFamily: '默认字体', fontSize: 28, color: '#fff', lineHeight: 1.2, letterSpacing: 1.2,
      isCustomData: false, customData: '', customDataFirstKey:'' , isDefaultSelected: false
    },
  },
  108:{
    id: -1,
    cid: 108,
    type: 'wb-address',
    name: 'WbAddress',
    title: '地址',
    tabName: 'address',
    conAttr: {width:375, height:50},
    commonAttr: { 
      fontFamily: '默认字体', fontSize: 24, color: '#fff', tableName: '', placeholder: '', arrowBtnColor: 'transparent',
    },
  },
  115: {
    id: -1,
    cid: 115,
    type: "wb-svg-icon",
    name: "WbSvgIcon",
    title: 'svg图标',
    tabName: 'svgIcon',
    conAttr: { width:250, height:250},
    commonAttr: { 
      isDrag: true, isSvga: false, svgaUrl: '', url: '', 
      type: SVG_ANIMATE_PLAY_TYPE[0].value, 
      start: SVG_ANIMATE_START_TYPE[0].value,
      pathTimingFunction: SVG_ANIMATE_EASE_TYPE[0].value,
      animTimingFunction: SVG_ANIMATE_EASE_TYPE[0].value, duration: 600, delay: 10, dashGap: 20, strokeWidth: 16, reverseStack: false,
      color: 'rgba(0, 0, 0, 0)', backgroundColor: 'rgba(0, 0, 0, 0)'
    },
  },
  117:{
    id: -1,
    cid: 117,
    type: 'wb-switch',
    name: 'WbSwitch',
    title: '开关',
    tabName: 'switch',
    conAttr: {width:50, height:50 },
    commonAttr: { 
      fontSize: 24, tableName: '', need: false
    },
  },
  116:{
    id: -1,
    cid: 116,
    type: 'wb-upload',
    name: 'WbUpload',
    title: '上传文件',
    tabName: 'upload',
    conAttr: {width:120, height:120 },
    commonAttr: { 
      tableName: '', need: true, isDisplayDeleteBtn: true, imgUrl: '',
      uploadCount: 1, uploadLimitSize: 2, saveImgType: SAVE_IMG_DATA_TYPES[0].value, saveImgQuality: 0.8 
    },
  },
  110:{
    id: -1,
    cid: 110,
    type: 'wb-process',
    name: 'WbProcess',
    title: '进度条',
    tabName: 'process',
    conAttr: {width:COMMON_WIDTH/3, height: 24 },
    commonAttr: { 
      fontFamily: '默认字体', fontSize: 28, color: '#fff',
      itemType: PROCESS_ITEM_TYPES[0].value, 
      barColor: '#fff', url:'', barUrl: '', barPointUrl: '', 
      isLoadAssets: false, pageId: '', delayTime: 0,
      borderStyle: 'none', borderRadius: 0, borderSize: 0, borderColor:'rgba(0, 0, 0, 0)', 
      backgroundColor: 'rgba(218,233,251,0.8)', 
      isDisplayPercent: false, percentStr: '已有$num$人参与', percentStyle: '',
      padding: '', isSeparator: false, 
    },
  },
  120:{
    id: -1,
    cid: 120,
    type: 'wb-bg',
    name: 'WbBg',
    title: '背景',
    tabName: 'bg',
    conAttr: {width:COMMON_WIDTH/2, height:COMMON_HEIGHT/4 },
    commonAttr: { 
      isFullScreen: false, bgUrl:'', bgPositionRepeatType: BG_POSITION_REPEAT_TYPES_MAP.centerTop,
      backgroundColor: 'rgba(0, 0, 0, 0)', isTouchmove: false, isBlank: false,
      borderStyle: 'none', borderRadius: 0, borderSize: 0, borderColor:'rgba(0, 0, 0, 0)',  
      spriteSheetParams: '', 
    },
  },
  306: {
    id: -1,
    cid: 306,
    type: "wb-mc",
    name: "WbMc",
    title: '动画',
    tabName: 'mc',
    conAttr: { width:COMMON_WIDTH/2, height:COMMON_HEIGHT/4 },
    commonAttr: { 
      itemType: CANVAS_MC_TYPES[0].value, customClassName: '', injectJsClassParams: '', defaultPicUrl: '',  
      isFullScreen: false, resizeType: RESIZE_TYPE[0].value, designWidth: 750, designHeight: 1334, 
      isCustomFont: false, isCreatejs: false, loadJsUrl: ''
    },
  },
  400: {
    id: -1,
    cid: 400,
    type: "wb-paper",
    name: "WbPaper",
    title: '矢量画板',
    tabName: 'paper',
    conAttr: { width:COMMON_WIDTH/2, height:COMMON_HEIGHT/2 },
    commonAttr: { 
      isFullScreen: false, designWidth: 750, designHeight: 1334, 
      itemType: PAPER_TYPE_MAP.freedomDraw, 
      injectJsClass: '', injectJsClassParams: '{"strokeColor":"black","simplifySegment":10,"fillColor":"black"}'
    },
  },
  500: {
    id: -1,
    cid: 500,
    type: 'group-component',
    name: 'GroupComponent',
    title: '打组组件',
    tabName: 'groupComp',
    conAttr: {width:COMMON_WIDTH, height:COMMON_HEIGHT, realTop:0, otherCompHeight:0 },
    components: [],
    commonAttr: { 
      isFullScreen: false, backgroundColor: 'rgba(0, 0, 0, 0)', bgUrl: '', isPercent: false, 
      injectJsClass: '', injectJsClassParams: '', spriteSheetParams:'', isGroupGsap: false,
      isDisplayY: false, scrollbarType: SCROLLBER_TYPE[0].value,
    },
  },
  501: {
    id: -1,
    cid: 501,
    type: 'group-carousel',
    name: 'GroupCarousel',
    title: '打组列表',
    tabName: 'groupCarousel',
    conAttr: {width:COMMON_WIDTH, height:COMMON_HEIGHT},
    components: [],
    commonAttr: { 
      listType: LIST_TYPE_MAP.commonList, height: 128, columnNum: 0, heightCompId: '', listLen: '',
    },
  },
  1000: {
    id: -1,
    cid: 1000,
    type: "wb-phasers",
    name: "WbPhasers",
    title: '游戏',
    tabName: 'phaser',
    conAttr: { width:COMMON_WIDTH/2, height:COMMON_HEIGHT/2 },
    commonAttr: { 
      isVisible: true, isFullScreen: false, resizeType: RESIZE_TYPE[0].value,
      designWidth: COMMON_WIDTH, designHeight: COMMON_HEIGHT, injectJsClass: '', injectJsClassParams: '',
    },
  },
  2004: {
    id: -1,
    cid: 2004,
    type: "wb-pixis",
    name: "WbPixis",
    title: '交互动画',
    tabName: 'pixis',
    conAttr: { width:COMMON_WIDTH/2, height:COMMON_HEIGHT/2 },
    commonAttr: {
      isVisible: true, isFullScreen: false, resizeType: RESIZE_TYPE[0].value,
      designWidth: COMMON_WIDTH, designHeight: COMMON_HEIGHT, injectJsClass: '', injectJsClassParams: '',
    },
  },
  5001: {
    id: -1,
    cid: 5001,
    type: "wb-panorama",
    name: "WbPanorama",
    title: '全景图',
    tabName: 'panorama',
    conAttr: { width:COMMON_WIDTH/2, height:COMMON_HEIGHT/2 },
    commonAttr: {
      isFullScreen: true, resizeType: RESIZE_TYPE[0].value,
      scene: { backgroundColor: "transparant", },
      camera: { fov: 75, near: 1, far: 1000, position: "0,0,0" },
      light: {
        hemi: { skyColor: "#ddeeff", groundColor: "#0f0e0d", intensity: 5 },
        directional: {color: "#ffffff", intensity: 0.5 },
        position: "0, 0, 0"
      },
      itemType: THREE_LOAD_TYPES[0].value, url: 'https://static.hd.xxx.com/upload/biz/1/203116.jpg', data:''
    },
  },
  5002: {
    id: -1,
    cid: 5002,
    type: "wb-threes",
    name: "WbThrees",
    title: '3d',
    tabName: 'threes',
    conAttr: { width:COMMON_WIDTH/2, height:COMMON_HEIGHT/2 },
    commonAttr: {
      isFullScreen: false, resizeType: RESIZE_TYPE[0].value,
      designWidth: COMMON_WIDTH/2, designHeight: COMMON_HEIGHT/2, injectJsClass: '', injectJsClassParams: '',
      camera: { fov: 75, near: 0.1, far: 1000, position: "0,0,0" },
      render: {}
    },
  },
}
