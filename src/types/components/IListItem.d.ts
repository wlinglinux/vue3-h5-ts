//老虎机   图片组 name url link schema alt
declare interface IListMachineItem {
  url: string
}
//翻书 通用列表 滚动容器
declare interface IListItem extends ISortItem {
  index: number
  title: string
  url: string
  text: string
  link: string
  width: number
  height: number
  position?: string
  [key: string]: string
}

//单元 多选 下拉列表
declare interface IListFormItem {
  id: string
  text: string
  url: string
  link: string
  jumpUrl: string
  pageId: number
}
//视频
declare interface IListVideoItem {
  time: string
  pageId: number
  compId: string
}
//视频组
declare interface IListVideosItem {
  name: string
  url: number
  poster: string
  link: string
  alt: string
  schema: string
}
//菜单
declare interface IListMenuItem {
  url: string
  icon: string
  eventType: string
  value: string
  bgUrl: string
  selectedBgUrl: string
}

declare interface ISortItem {
  num: number,
  mid?: string,
  uid?: string,
  voteId: number | string
}

declare interface ICarouselItem extends IListItem {
  url: string
  selectUrl: string
  resultUrl: string
  position: string
}


