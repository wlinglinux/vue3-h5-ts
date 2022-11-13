declare interface IControlsMap {
  [index: string]: IControlMap                    //组件id n个control
}
declare interface IControlMap {
  [index: string]: IBaseControl                 //control基础数据
}

declare interface IComponentMap {
  [index: string]: IComponent                   //键值是组件id
}

declare interface IRecoverCompMap {
  [index: string]: ICommonAttr                  //键值是组件id
}

declare interface IVisibleComponentMap {
  [index: string]: string                       //键值是组件id 值也是组件id
}

declare interface IFrontData {
  pageCommonListAutoHeight: any,                 //页面id isAutoY
  isLocalSiteData: boolean                      //是否启用本地站点数据
}

declare interface IFormValueMap {
  [index: string]: IFormValueItem
}

declare interface IFormValueItem {
  value: string
  text?: string
  lists?: any[]
  item?: any
  selecteds?: any[] // 滚动容器选中
  urls?: '',
  url?: '',
}

declare interface IAllPagesMap {
  [index: string]: IPage   
}

declare interface IShareData {
  url?: string 
  imgs?: [] 
  link?: string 
  midJump?: string 
  title?:  string 
  content?:  string
  videoUrl?: string
  posterUrl?: string,
  list?: any[],  // 王者荣耀排行榜数据
  mine?: any[]   // 王者荣耀个人数据
  currPeriod?: number // 王者荣耀当前期数
}

declare interface IIsForm {
  isCheckbox: IHavePageIdOrComId
  isRadio: IHavePageIdOrComId
  isDropdown: IHavePageIdOrComId,
  isAddress: IHavePageIdOrComId,
  isUpload: IHavePageIdOrComId,
}

declare interface IHavePageIdOrComId {
  [index: string]: boolean             //键值是页面id       
}

declare interface ISiteInfo {
  repostsDelayTime: number                      //菜单组件 切换的面板都需要获取用户微博数据时 为了减少服务器压力 延时请求数据
  pageOrPopComNum: number                       //页面中需要向后台请求接口数
  compLoadNum: number                           //页面中加载事件组件数
  popCompLoadNum: number                       //弹层中加载事件组件数
  id: number
  from: string
  wbFrom: string
  wbAid: string
  isTemp: boolean
  isDebug: number
  code: number                                 //后端返回的获取站点数据接口code
  msg: string                                  //后端返回的获取站点数据接口msg
  isTemplate: boolean                           //模板
  isLoading: boolean
  isDisplayAssetsLoading: boolean
  isInitSite: boolean
  wxTicket: IWxTicket | any
  formIsSubmit: boolean                         //是否提交过表单
  isLoadAssetsCompleteNotInitComp: boolean      //加载完素材，进度条组件还没有初始化完，就直接调用加载完功能
  isReload: boolean                             //页面初始完后就可以发reload事件了
  isPopReload: boolean                          //页面初始完后就可以发reload事件了
  reloadTime: number
  env: IEnv
  md: IMd

  reloadPopCb?: number
  reloadCb?: number
}


declare interface IMd {
  isIPhone: boolean 
  isMobile: boolean
  mobileName: string
  os: string 
}

declare interface IEnv {
  apiUrl: string | boolean | undefined 
  webUrl: string | boolean | undefined
  baseUrl: string | boolean | undefined
}

declare interface ItimeObj {
  serverTime: string                      //服务器时间
  timerTime: string                       //计时器结束时间
  isTimerStart: boolean
  isTimerEnd: boolean
}

declare interface IIsLoadJsObj {
  isAudio: boolean
  isVideo: boolean
  isMatter: boolean
  isSwiper: boolean
  isShake: boolean
  isMoveable: boolean
  isHtml2canvas: boolean
  isGsap: boolean
  isPhaser: boolean
  isPixi: boolean
  isPixiFilters: boolean
  isThree: boolean
  isSvgAnimate: boolean
  isSlotMachine: boolean
  isCustomFont: boolean
  isDefaultFont: boolean              //编辑端选择非默认字体
  isCreatejs: boolean
  isEaseljs: boolean

  isOrbitControls: boolean
  isGsapBezier: boolean
  isGltfLoader: boolean
  isPanorama: boolean

  isScanQRCode: boolean
  isJsBarcode: boolean
  isSvga: boolean
  isSvg: boolean
  isPaper: boolean

  isLoadAssets: boolean
  isAnimate: boolean
  isTurnBook: boolean,
  isNeedUploadParams: boolean  // 是否需要上传参数
}

declare interface IIsLoadAnimate {
  isAnimate: IHavePageIdOrComId                    //animate 动画 加载css
  isGroupGsap: IHavePageIdOrComId
  isGsap: IHavePageIdOrComId
  isPathBezier: IHavePageIdOrComId
}

declare interface IShareInteractionData {
  randomPageIds: [] 
  swiperIndex: number  

  card: any 
  puzzle: any

  isEmitClick: boolean
  clickCompIdMap?: any       // 点击组件数据
  rules?: any                // 单选规则
  imgs?: string[]            // 结果图片
  relateCompId?: string,
  imgRelateCompIds?: string,
  bgIndexs?: string,
  bgRelateCompId?: string,
  pushCompId?: string,
  lastPopId?: number
  lastPageId?: number
  time?: number,
  randomPageIndex?: number,
  isRights?: boolean[]
  isLoaded?: boolean   //图片加载完成状态
  isSelected?: boolean   //图片点击状态
  isEmit?: boolean // ClickPlaySpriteSheetAnim
  isOpenCamera?: boolean,
  isReturnBack?: boolean // 是否返回上一页反显
  autoPlayAudioCompId?: string
}

declare interface IBindData {
  month: number
  day: number
  total: number,
  generalRank: number
  generalTotal: number                          //(1743为地球抗老),
  remain: number
  score: number                                 //(question总分),
  scores: number                                 //(每道题的分值)，
  isRights: boolean                              //(答题是否正确),
  puzzle: number                                //(可以翻牌次数)
  uid: string
  workNum: number
  name: string
  mid: string
  num: number                                   //好物清单选中图标数量滚动容器 ,
  lotteryUrl: string                            //(抽到奖品的地址)
  lotteryName: string                           //(抽到奖品的名字)
  lotteryTime: string                           //(抽到奖品的时间)
  couponCode: string                            //抽奖兑换码

  sexIconUrls: string[]                         //(性别图标地址)
  times: number                                 // 王者荣耀抽奖次数
}

declare interface IGlobalIsPost {
  followCompIds: string[],//需要发送的全局关注uid集合
  isFollowedMap: IIsFollowUid,//关注过的uid集合
  isFollowClickMap: IIsFollowUid,//选择和取消的状态
  isPushClickMap: IIsFollowUid,
  [key: string]: any   //isPush isPushImg isFollow
}

declare interface IIsFollowUid {
  [indx: string]: boolean
}

declare interface IStaticData {
  [key: string]: any                   //每一个活动的数据结构 活动key
}

declare interface IWeiboTimeline2021 {
  interact_cnt: string
  interact_uid: string
  login_count_cnt: string
  pub_origin_count_cnt: string
  pub_transmit_cnt: string
}

declare interface IFrontSelectScoreFormValues {
  scoreFormValues: any, 
  scoreFormItems: any
}

declare interface IIsGlobalShareComponents {
  [index: string]: IGroup                 //control基础数据
}

declare interface ISite {
  isH5Edit: boolean
  componentMap: IComponentMap
  pageIndex: number
  popIndex: number
  pages: IPage[]
  pops: IPage[]
  allPages: IPage[]
  allPagesMap: IAllPagesMap
  fixedComps: IComponent[]
  isGlobalShareComponents: IIsGlobalShareComponents
  attrs: ISiteAttrs
  styles: IPageStyles
  userInfo: IUserInfo
  siteInfo: ISiteInfo
  timeObj: ItimeObj
  globalIsPost: IGlobalIsPost
  isForm: IIsForm
  pageHaveForms: Object
  pageHaveCompNum: Object,
  pageHaveScrollY: Object
}

declare interface ISiteData {
  activityInfo: IActivityInfo
  attrs: ISiteAttrs
  controls: IControlsMap
  id: string
  is_template: string
  pages: IPage[]
  uid: string
  usr: IUserInfo
  styles?: any
}



declare interface IInteraction {
  recoverCompMap: IRecoverCompMap
  visibleComponents: IVisibleComponentMap
  frontData: IFrontData
  formValueMap: IFormValueMap
  frontSelectScoreFormValues: IFrontSelectScoreFormValues      //表单计分组件存储选择的答案
  statisticData: IStaticData
  shareData: IShareData
  bindData: IBindData
  shareInteractionData: IShareInteractionData
  coverPageCropCompAttr: any
  canvasImgComponentMap: any
}

declare interface IControls {
  controls: IControlsMap
}

declare interface IActivity {
  activityInfo: IActivityInfo
}

declare interface IIsLoad {
  isLoadJsObj: IIsLoadJsObj
  isLoadAnimate: IIsLoadAnimate,
}

