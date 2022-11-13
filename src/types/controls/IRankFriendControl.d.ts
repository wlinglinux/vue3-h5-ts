
// 好友排行
declare interface IRankFriendControl extends IBaseListControl { 
  relateCompId: string,                // 触发排行关联id
  rankType: number,                    // 好友接口类型 FRIEND_RANK_TYPES_MAP
  elements: IRankFriendItem[],            
}

declare interface IRankFriendItem {
  name: string,
  num: number,
  pic_url: string,
  progress: number,
  uid: string,
  [key: string]: any
}
