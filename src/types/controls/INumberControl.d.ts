declare interface INumberControl extends IGeneralNumberControl {
  base: number,                 // 基数
  day_default: number,          // 每天缺省增加计数值
  day_limit: number,            // 每天限制计数
  groupKey: string,             // 计数组
  isUid: boolean,               // 个人行为
  num: number,
  // dayNum?: number,                // 前端保留刷新按钮状态
  onceGrowValue: number,        // 每次增加或减少计数值
  progress: number,             // 进度
  syn_com_id: string,           // 触发计数关联id
  total: number,                // 目标总人数
  total_limit: number,          // 限制总计数
  vipOnceGrowValue: number, // vip每次增加或减少计数值
  [key: string]: any
}
