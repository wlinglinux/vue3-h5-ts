declare interface IUserInfo extends ISortItem {
  uid: string,
  name: string,         // 昵称
  avatar_large: string, // 用户头像
  frontPicUrl: string,
  jumpLink: string,     // 跳转链接
  addr: string        //初始化站点后台传过来的用户信息
  gender: string
  screen_name: string
  verified_type: number
  mbtype: number    //是否是会员 非会员为0
  [key: string]: any
}


// addr: "11,8"
// gender: "f"
// screen_name: "是非一念之间之事"
// verified_type: -1