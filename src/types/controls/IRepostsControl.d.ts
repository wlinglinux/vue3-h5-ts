
// 博文组
declare interface IRepostsControl extends IBaseListControl { 
  mid: string,                         // 转发博文mid
  text: string,
  isAddReposts: boolean
  elements: IRepostsItem[],            // 博文内容
}
// 返回了所有的数据
declare interface IRepostsItem extends ISortItem {
  attitudes_count: number
  comments_count: number
  reposts_count: number
  name: string
  pic_url: string
  text: string
  mid: string
  uid: string
  [key: string]: any
}
