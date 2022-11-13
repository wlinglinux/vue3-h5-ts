

declare interface IWeibo2020StatisticData {
  users: IUserMap
  opp_uid: string
  opp_name: string
  uid1_2019: string
  uid2_2019: string
  uid3_2019: string
  uid1_2020: string
  uid2_2020: string
  uid3_2020: string

  friends: string
  elements: IUserInfo[]
}

declare interface IUserMap {
  [index: string]: IUserInfo
}