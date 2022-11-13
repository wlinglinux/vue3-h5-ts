
// 转发
declare interface IRepostControl extends IBaseListControl { 
  day_limit: number,                    // 每天每个用户限制数
  mid: string,  
  elements: IRepostItem[],             //  列表数据
}
declare interface IRepostItem {
  text: string
  uid: string
}
