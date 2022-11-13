
declare interface IUserControl extends IBaseListControl { 
  customParams: string,                  //配置获取用户数据规则
  isFollowByIndex: boolean,              // 按照索引关注
  namePrefix: string ,                   // 用户前缀
  elements: IUserInfo[],     // 用户列表 | 或是用户对象
  [key: string]: any,
}



