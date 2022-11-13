
declare interface ILotteryControl extends IBaseListControl{ 
  day_limit: number,            // 每人每天次数
  edate: string,                // 截止时间
  isNeedUserLevel: boolean,     // 等级要求
  lotteryNumLimit: string,      // 中奖次数限制
  lotteryTotalLimit: number,    // 抽奖总次数限制
  lucky_base: string | number,  // 抽奖基数(分母)
  relateCompId: string,         // 组件id
  sdate: string,                // 开始时间
  elements: ILotteryItem[],     // 奖品列表
  [key: string]: any
}

declare interface ILotteryItem {
  gift_daylimit: string,        // 每天总中奖量
  gift_id: number,              // 奖品Id
  gift_name: string,            // 奖品名称
  gift_percent: string,         // 中奖概率值(分子)
  gift_totallimit: string,      // 奖品总数
  luck_zizhi: string,           // 是否限制微博资质1是0否,预留
  lucky_lv: string,             // 限制微博等级(小于不可中奖),预留
  pic_url: string,              // 图片地址
  popId: number ,               // 跳转弹层
  pics?: string[]
}
