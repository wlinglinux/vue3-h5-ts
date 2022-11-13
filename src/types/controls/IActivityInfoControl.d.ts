
declare interface IActivityInfoControl { 
  isHave: boolean
  isJoin: boolean                      // 是否参加过了
  isLoad: boolean
  
  activityType: string                // 活动类型  GENERAL_TYPES_MAP
  compId: string
  jumpPopId: number                   // 跳转弹层
  jumpPageId: number                  // 跳转页面
  relateCompId: string                // 获取活动信息需要的关联组件id
  num_form: number
  params: string
  [key: string]: any
}
