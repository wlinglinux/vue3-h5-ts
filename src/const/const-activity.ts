import { getMapByArr } from '@/utils/'

const TABLE_ITEM_TYPE = [
  { name: '省份排序', value: 'area'}
]
const TABLE_ITEM_TYPE_MAP = getMapByArr(TABLE_ITEM_TYPE)

// { name:'gaobai', value:'gaobai' }, // init activity
const GENERAL_TYPES = [
  { name:'无', value:'' },
  { name:'报名-关注超话', value:'info' },//feact activity
  { name:'报名-普通方式', value:'tree' },//feact activity
  { name:'报名-发号方式', value:'randbm' }, //feact activity
  { name:'抽奖+表单提交', value:'lotteryForm' },//feact activity
  { name:'表单计分答案', value:'scoreForm' },//feact activity 王者荣耀
  { name:'选择省份', value:'area' },//init feact 
  { name:'拼图猜谜游戏', value:'puzzle' },//init feact
  { name:'领取卡片', value:'draw' },//init feact
  { name:'元气植物', value:'baoming' },//feact activity
]
const GENERAL_INIT_TYPES = [
  { name:'无', value:'' },
  { name:'报名-关注超话', value:'info' },//init
  { name:'100条数据', value:'wz_rank' },//init
  { name:'省份排序', value:'arearank' },//init
  { name:'拼图猜谜游戏', value:'puzzle' },//init feact
  { name:'领取卡片', value:'draw' },//init feact
  { name:'表单三条数据', value:'formrandlist' },//init 
  { name:'选择省份', value:'area' },//init  
  { name:'抽奖+表单提交', value:'lotteryForm' },//init activity
  { name:'王者抽奖次数', value:'wz_sraffletimes' },//init
]
const GENERAL_ACTIVITY_TYPES = [
  { name:'无', value:'' },
  { name:'报名-关注超话', value:'info' }, //feact activity
  { name:'报名-普通方式', value:'tree' }, //feact activity
  { name:'报名-发号方式', value:'randbm' }, //feact activity
  { name:'抽奖+表单提交', value:'lotteryForm' },//feact activity
  { name:'表单计分答案', value:'scoreForm' },//feact activity 王者荣耀
  { name:'元气植物', value:'baoming' },//feact activity
]
// const GENERAL_TYPES_MAP = getMapByArr(GENERAL_TYPES)
const GENERAL_TYPES_MAP = {
  info: 'info',
  tree: 'tree',
  randbm: 'randbm',
  lotteryForm: 'lotteryForm', //这个没有触发事件
  scoreForm: 'scoreForm', //这个没有触发事件
  area: 'area',
  puzzle: 'puzzle',
  draw: 'draw',
  baoming: 'baoming',
}
// const GENERAL_INIT_TYPES_MAP = getMapByArr(GENERAL_INIT_TYPES)
const GENERAL_INIT_TYPES_MAP = {
  info: 'info',
  wzSraffletimes: 'wz_sraffletimes',
  wzRank: 'wz_rank',
  area: 'area',
  arearank: 'arearank',
  puzzle: 'puzzle',
  draw: 'draw',
  formrandlist: 'formrandlist',
  lotteryForm: 'lotteryForm' //这里应该是 活动信息里的但是初始化也需要这个事件来初初始话返回的奖品信息
}
// const GENERAL_ACTIVITY_TYPES_MAP = getMapByArr(GENERAL_ACTIVITY_TYPES)
const GENERAL_ACTIVITY_TYPES_MAP = {
  info: 'info',
  tree: 'tree',
  randbm: 'randbm',
  lotteryForm: 'lotteryForm',
  scoreForm: 'scoreForm',
  baoming: 'baoming',
}

// 999抗疫日记   get_hfive_data_excavate_packing
// 微博平台uid年度汇总数据接口  get_year_report_pasture_plan
// 小米全量uid     get_user_register_days
// 小米关注雷军粉丝包   get_xiaomi_interact
const STATISTIC_DATA_TYPES_MAP = {
  // reportPasturePlan: "get_year_report_pasture_plan",
  // dataBag: "get_hfive_data_excavate_packing",
  // aes: "aes",
  // pk: "pk",
  // xiaomi10Days: "get_user_register_days",
  // xiaomi10Interact: "get_xiaomi_interact",
  // huawei: "get_weibodata_huawei_activity_uid_fanslist",
  // weibo2020: "get_weibo_year_summary",
  weibo2021vote: "get_weibo_year_lottery",
  weiboTime: "get_weibo_timeline_2021"
}
const STATISTIC_DATA_TYPES = [
  // { name: "牧场计划", value: "get_year_report_pasture_plan" },
  // { name: "数据包", value: "get_hfive_data_excavate_packing" },
  // { name: "加密条形码", value: "aes" },
  // { name: "用户参与PK", value: "pk" },
  // { name: "小米10周年注册天数", value: "get_user_register_days" },
  // { name: "小米10周年互动", value: "get_xiaomi_interact" },
  // { name: "华为关注余承东", value: "get_weibodata_huawei_activity_uid_fanslist" },
  // { name: "微博2020年度数据", value: "get_weibo_year_summary" },
  { name: "微博2021年度抽奖数据", value: "get_weibo_year_lottery" },
  { name: "微博时光轴", value: "get_weibo_timeline_2021" },
]

const FRIEND_RANK_TYPES = [
  { name:'好友列表', value:0, key: 'friends' },
  { name:'好友排行榜', value:1, key: 'rank' },
]

const FRIEND_RANK_TYPES_MAP = getMapByArr(FRIEND_RANK_TYPES)
// const FRIEND_RANK_TYPES_MAP = {
//   friends: 0,
//   rank: 1,
// }
export {
  STATISTIC_DATA_TYPES_MAP,
  TABLE_ITEM_TYPE,
  TABLE_ITEM_TYPE_MAP,
  FRIEND_RANK_TYPES,
  FRIEND_RANK_TYPES_MAP,
  GENERAL_TYPES_MAP,
  GENERAL_INIT_TYPES_MAP,
  GENERAL_ACTIVITY_TYPES_MAP,
  STATISTIC_DATA_TYPES,
  GENERAL_TYPES,
  GENERAL_INIT_TYPES,
  GENERAL_ACTIVITY_TYPES,
}