
declare interface IPushControl extends IBaseListControl { 
  day_limit: number                  // 每天每个用户限制数
  failText: string                   // 失败博文内容
  relateCompId: string               // 关联组件id
  isGetOther: boolean                // 获取组件提供数据
  isGiveOther: boolean               // 提供数据给关联组件
  isRandomPush: boolean              // 多博文随机分享
  isReplaceShareData: boolean        // 替换动态图片
  isSame: boolean                    // UI与发博图片是否相同
  isRandom: boolean                  // 多博文随机分享
  elements: IPushItem[] 
  fileNamePics: IPushItemPic_              // 交互中 临时存储 文件名 IPushItem
  [key: string]: any
}

declare interface IPushItem extends ISortItem {
  mid: string                      //给某个mid触发原发博文
  text: string                     //发博的内容
  isPic: boolean                   //发博是否带图
  isRandomPic: boolean             //发博是否随机图片
  url: string                      //前端显示图片
  pics: IPushItemPic[]
}
declare interface IPushItemPic_ {
  [key: string]: IPushItemPic
}
declare interface IPushItemPic {
  loading?: boolean            // 上传图片 临时存储
  pic_id?: string              // 发博需要的pid 不同的接口 发博键值不同
  pic_url?: string             // 图片地址
  original?: string            // 原图地址
  thumbnail?: string           // 图片缩略图地址
  pid?: string                 // 发博需要的pid 不同的接口 发博键值不同
  [key: string]: any
}

