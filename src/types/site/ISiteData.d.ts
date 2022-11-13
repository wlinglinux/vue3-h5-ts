declare interface ISiteAttrs extends IPageAttrs {
  // isTurnPage: boolean                              //鼠标滑动翻页
  isNoSwiping: boolean                                //单页不是滚动swiper 单页禁止滑动
  swiper: ISwiper
  isRandomEffect: boolean                             //页面随机切换效果
  isPopRandomEffect: boolean                          //弹层随机切换效果
  h5Type: number                                      //mobile: 1,pc: 2,canvas: 3,card: 4,
  pageType: number                                    //1 多页 2 长页
  pageId: number
  popId: number
  isOffline: boolean                                    //前端站点下线
  push_visible: boolean                                 //公开发送博文
  isDisplayDebuggerText: boolean
  loadAssets: string                                   //进入页面前需要加载的素材
  controlData: string                                  //站点自定义信息 后端使用
  isShareWeiboWinxin: boolean                           //分享到微博或是微信
  reloadTime: number                                    //移动端setInterval默认时间
  share: IShareAttr                                   

  wx_appkey: string
  wx_appsecret: string
  wb_appkey: string
  wb_appsecret: string
  bIsWbAppkeyChecked: boolean
  key: string
  thumb: string
  sdate: string
  edate: string
  
  offlineJumpLink: string
  isDisplayAssetsLoading: boolean
  isNotSaveImg: boolean                     //是否可以在app端长按保存图片 需要判断整个站点是否能够进行长按保存
  isCard166: boolean
}

declare interface IShareAttr {
  allShare: IShareDescription
  wxShare: IShareDescription
  wbShare: IShareDescription
  bIsWxChecked: boolean
  bIsWbChecked: boolean
  icon: string

  //card
  type?: string
  card166: ICard166 | null
}


declare interface IShareDescription {
  title: string
  desc: string
  key?: string
}

declare interface ISwiper {
  turnPageMode: number | string                               //top_down: 1 left_right: 2
  autoTurnPage: boolean
  turnPageTime: number
  effect: string                                      //slide 
  swiperHintUrl: string                               //swiper向下箭头url
  noSwipings: string                                  //禁止滚动页面索引+1
  isTurnPage: boolean                                //鼠标滑动翻页
}