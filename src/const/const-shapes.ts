
const SHAPE_TYPES = [
  'down','works','template','creation','statistics','collection','filter','search','home','qr',
  'offline','publish','amount','shut','next','arrow','link','help','previous','views',
  'indication','save','sort','management','visitors','withdraw','edit','closed','font-reduction',
  'increase','share','straw','copy','preview','upload','notselected','delete',
  'timing','my-template','selected','page-template','addition','left','font-increase','right',
  'centered','underline','italic','arrow-left','play','plus','locking','bold','unlock',
  'selection','crop','count','input','preview1','video-group','music','sharing','contact','rules',
  'submit','multiple','post','verification','customizeicon','menu','random','plugin-timing',
  'player','message','review','picking','mobile','attention','thumbs','qr-code','mailbox','phone',
  'arrow-down','layer-closed','image','arrow-up','date','wall','list','download','vote','love',
  'banner','red-envelope','like','prompt-correct','drop-down','clear','forwarding',
  'lottery','empty','picture-group','plugin-statistics','map','video','flower','click','view',
  'single-page','multiple-page','multiple-page-hover','single-page-hover',
  'move','scan-code','video1','keyboard','minus','juxing','plugin','text','form','media','close'
]
const SVG_ANIMATE_PLAY_TYPE = [
  {name:'延迟', value: 'delayed' },
  {name:'同步', value: 'sync' },
  {name:'顺序', value: 'oneByOne' },
  {name:'所有路径异步', value: 'scenario' },
  {name:'依次同步', value: 'scenario-sync' },
]
const SVG_ANIMATE_START_TYPE = [
  {name:'出现', value: 'inViewport' },
  {name:'手动', value: 'manual' },
  {name:'自动', value: 'autostart' },
]

const SVG_ANIMATE_EASE_TYPE = [
  {name:'线性', value: 'LINEAR' },
  {name:'缓动', value: 'EASE' },
  {name:'进入缓动', value: 'EASE_IN' },
  {name:'移除缓动', value: 'EASE_OUT' },
  {name:'弹跳缓动', value: 'EASE_OUT_BOUNCE' },
]

const SVG_LIST = [
  "https://static.hd.xxx.com/upload/biz/94/1.svg",
  "https://static.hd.xxx.com/upload/biz/94/2.svg",
  "https://static.hd.xxx.com/upload/biz/94/5.svg",
  "https://static.hd.xxx.com/upload/biz/94/4.svg",
  "https://static.hd.xxx.com/upload/biz/94/7.svg",
  "https://static.hd.xxx.com/upload/biz/94/6.svg",
  "https://static.hd.xxx.com/upload/biz/94/10.svg",
  "https://static.hd.xxx.com/upload/biz/94/11.svg",
]

const SVG_D_LIST = [
  {name:"500服务器错误", value:"https://static.hd.xxx.com/upload/biz/94/500服务器错误.svg"},
  {name:"404", value:"https://static.hd.xxx.com/upload/biz/94/404.svg"},
  {name:"加载失败", value:"https://static.hd.xxx.com/upload/biz/94/加载失败.svg"},
  
  {name:"节气1", value:"https://static.hd.xxx.com/upload/biz/94/节气1.svg"},
  {name:"节气1", value:"https://static.hd.xxx.com/upload/biz/94/节气2.svg"},
  {name:"节气2", value:"https://static.hd.xxx.com/upload/biz/94/节气3.svg"},
  {name:"节气4", value:"https://static.hd.xxx.com/upload/biz/94/节气4.svg"},
  {name:"节气5", value:"https://static.hd.xxx.com/upload/biz/94/节气5.svg"},
  {name:"节气6", value:"https://static.hd.xxx.com/upload/biz/94/节气6.svg"},
  {name:"节气7", value:"https://static.hd.xxx.com/upload/biz/94/节气7.svg"},
  {name:"节气8", value:"https://static.hd.xxx.com/upload/biz/94/节气8.svg"},
  {name:"节气9", value:"https://static.hd.xxx.com/upload/biz/94/节气9.svg"},
  {name:"节气10", value:"https://static.hd.xxx.com/upload/biz/94/节气10.svg"},
  {name:"节气11", value:"https://static.hd.xxx.com/upload/biz/94/节气11.svg"},
  {name:"节气12", value:"https://static.hd.xxx.com/upload/biz/94/节气12.svg"},

  {name:"火锅", value:"https://static.hd.xxx.com/upload/biz/94/火锅.svg"},
  {name:"冰淇淋", value:"https://static.hd.xxx.com/upload/biz/94/冰淇淋.svg"},
  {name:"鞭炮", value:"https://static.hd.xxx.com/upload/biz/94/鞭炮.svg"},
  {name:"啤酒", value:"https://static.hd.xxx.com/upload/biz/94/啤酒.svg"},
  
  {name:"奋斗不息", value:"https://static.hd.xxx.com/upload/biz/94/奋斗不息.svg"},
  {name:"理财", value:"https://static.hd.xxx.com/upload/biz/94/理财.svg"},
  {name:"努力赚钱", value:"https://static.hd.xxx.com/upload/biz/94/努力赚钱.svg"},
  {name:"签到", value:"https://static.hd.xxx.com/upload/biz/94/签到.svg"},
  {name:"一夜暴富", value:"https://static.hd.xxx.com/upload/biz/94/一夜暴富.svg"},
  
  {name:"只吃不胖", value:"https://static.hd.xxx.com/upload/biz/94/只吃不胖.svg"},
  {name:"减肥", value:"https://static.hd.xxx.com/upload/biz/94/减肥.svg"},
  {name:"墨镜", value:"https://static.hd.xxx.com/upload/biz/94/墨镜.svg"},
  {name:"可爱的我", value:"https://static.hd.xxx.com/upload/biz/94/可爱的我.svg"},
  {name:"时尚小公主的我", value:"https://static.hd.xxx.com/upload/biz/94/时尚小公主的我.svg"},

  {name:"猫咪", value:"https://static.hd.xxx.com/upload/biz/94/猫咪.svg"},
  {name:"生肖牛", value:"https://static.hd.xxx.com/upload/biz/94/生肖牛.svg"},
  {name:"小牛送福", value:"https://static.hd.xxx.com/upload/biz/94/小牛送福.svg"},
  {name:"睡觉的猫", value:"https://static.hd.xxx.com/upload/biz/94/睡觉的猫.svg"},
  {name:"桃朵朵开", value:"https://static.hd.xxx.com/upload/biz/94/桃朵朵开.svg"},

  {name:"卡片", value:"https://static.hd.xxx.com/upload/biz/94/1.svg"},
  {name:"葫芦福字", value:"https://static.hd.xxx.com/upload/biz/94/2.svg"},
  {name:"灯笼", value:"https://static.hd.xxx.com/upload/biz/94/5.svg"},
  {name:"富鱼", value:"https://static.hd.xxx.com/upload/biz/94/4.svg"},
  {name:"礼品盒", value:"https://static.hd.xxx.com/upload/biz/94/7.svg"},
  {name:"云闪电", value:"https://static.hd.xxx.com/upload/biz/94/6.svg"},
  {name:"月亮", value:"https://static.hd.xxx.com/upload/biz/94/10.svg"},
  {name:"钱币", value:"https://static.hd.xxx.com/upload/biz/94/11.svg"},
  {name:"投票比赛", value:"https://static.hd.xxx.com/upload/biz/94/投票比赛-01.svg"},
  {name:"图片上传", value:"https://static.hd.xxx.com/upload/biz/94/图片上传-01.svg"},
  {name:"现金券", value:"https://static.hd.xxx.com/upload/biz/94/现金券-01.svg"},
  {name:"花灯", value:"https://static.hd.xxx.com/upload/biz/94/资源 1.svg"},
  {name:"烟花", value:"https://static.hd.xxx.com/upload/biz/94/资源 2.svg"},
  {name:"灯笼运", value:"https://static.hd.xxx.com/upload/biz/94/资源 8.svg"},
]

export {
  SHAPE_TYPES,
  SVG_ANIMATE_PLAY_TYPE,
  SVG_ANIMATE_START_TYPE,
  SVG_ANIMATE_EASE_TYPE,
  SVG_LIST,
  SVG_D_LIST
}

