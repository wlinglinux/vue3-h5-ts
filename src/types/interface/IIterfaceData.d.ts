declare interface IGetSiteData {
  site_id: number
}

declare interface IGetTempSiteData {
  id: number
}

declare interface ICommunicationData {
  code: number
  msg: string
  data: any
  [key: string]: any
}
//王者荣耀
declare interface IFormWangZhe {
  nickname: string
  sex: string
  level: number
  platform: string
  purpose: string
  skills: string
  character: string
  sexIconUrl: string
}

declare interface IFormLottery {
  luck: any[],
  luck_list: IFormLotteryItem[],
  coupon_list: CouponListItem[],
  num_form: number,
  num_luck: number
}

declare interface ICouponListItem {
  add_time: Date//"2022-09-26 22:39:28"
  ext1: string//"精锻用魔矿x2"
  ext2: string//""
  ext3: string//""
  ext4: string//""
  id: string//"1101923"
  site_id: string//"2674"
  sn: string//"UTGVDUNRY8SN"
  tag: string//"7"
  uid: string//""
}
declare interface IFormLotteryItem {
  ele_url: string
  ele_name: string
  create_time: string
}

declare interface ILottery {
  gift_id: number
  gift_idx: number
  gift_info: ILotteryGiftInfo
  gift_name: string
  pic_url: string
}
declare interface ILotteryGiftInfo {
  coupon_list: ICouponListItem[]
}