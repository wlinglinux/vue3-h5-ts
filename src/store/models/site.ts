import { COMMON_WID_HEI, BG_POSITION_REPEAT_TYPES_MAP, PAGE_MODE_MAP, SWIPER_EFFCE, H5_TYPE, PAGE_TYPE } from '@/const/'

class Md implements IMd {
  public isIPhone: boolean = false
  public isMobile: boolean = false
  public mobileName: string = ''
  public os: string = ''
}

class Env implements IEnv {
  public apiUrl: string = ''
  public webUrl: string = ''
  public baseUrl: string = ''
}

class SiteInfo implements ISiteInfo {
  public repostsDelayTime: number = 0
  public pageOrPopComNum: number = 0
  public compLoadNum: number = 0
  public popCompLoadNum: number = 0
  public id: number = 0
  public from: string = ''
  public wbFrom: string = ''
  public wbAid: string = ''
  public isTemp: boolean = false
  public isDebug: number = 0
  public code: number = 1
  public msg: string = '数据错误'
  public isTemplate: boolean = false
  public isLoading: boolean = true
  public isDisplayAssetsLoading: boolean = false
  public isInitSite: boolean = true
  public wxTicket: IWxTicket | any = null
  public formIsSubmit: boolean = false
  public isLoadAssetsCompleteNotInitComp: boolean = false
  public isReload: boolean = false
  public isPopReload: boolean = false
  public reloadTime: number = 50
  public md: Md = new Md()
  public env: Env = new Env()
}

class IsForm implements IIsForm {
  public isCheckbox: IHavePageIdOrComId = {}
  public isRadio: IHavePageIdOrComId = {}
  public isDropdown: IHavePageIdOrComId = {}
  public isAddress: IHavePageIdOrComId = {}
  public isUpload: IHavePageIdOrComId = {}
}

class UserInfo implements IUserInfo {
  public uid: string = ''
  public name: string = ''
  public avatar_large: string = ''
  public frontPicUrl: string = ''
  public jumpLink: string = ''

  public addr: string = ''        //初始化站点后台传过来的用户信息
  public gender: string = ''
  public screen_name: string = ''
  public verified_type: number = -1
  public num: number = -1
  public mbtype: number = 0
  public voteId: number = -1
}

class ShareAttr implements IShareAttr {
  public allShare: IShareDescription = new ShareDescription()
  public wxShare: IShareDescription = new ShareDescription()
  public wbShare: IShareDescription = new ShareDescription()
  public bIsWxChecked: boolean = false
  public bIsWbChecked: boolean = false
  public icon: string = ''

  //card
  public type: string = ''
  public card166: ICard166 | null = null
}

class ShareDescription implements IShareDescription {
  public title: string = ''
  public desc: string = ''
  public key?: string = ''
}

class SiteAttrs implements ISiteAttrs {
  public width: number = COMMON_WID_HEI.width
  public height: number = COMMON_WID_HEI.height
  // public isGradient?: boolean = false
  // public gradientAngle?: number = 0
  // public gradients?: string = '#4bb0ff#6149f6'
  public bgUrl: string = ''
  public backgroundColor: string = ''
  public bgPositionRepeatType: number = BG_POSITION_REPEAT_TYPES_MAP.centerTop
  public isAutoClose: boolean = false
  public delayTime: number = 0
  public isPopUseSiteBg: boolean = false

  public isNoSwiping: boolean = true //单页也不使用swiper
  public swiper: ISwiper = { turnPageMode: PAGE_MODE_MAP.top_down, autoTurnPage: false, turnPageTime: 0.5,  effect: SWIPER_EFFCE[0].value, swiperHintUrl: '', noSwipings: '', isTurnPage: false }
  public isRandomEffect:  boolean = false
  public isPopRandomEffect: boolean = false
  public h5Type: number = H5_TYPE.mobile
  public pageType: number = PAGE_TYPE.single
  public pageId: number =  -1
  public popId: number = -1
  public isOffline:  boolean = false
  public push_visible:  boolean = false
  public isDisplayDebuggerText:  boolean =false
  public loadAssets: string = ''
  public controlData:  string = ''
  public isShareWeiboWinxin: boolean = false
  public reloadTime: number = 50
  public share: IShareAttr = new ShareAttr()  

  public wx_appkey: string = ''
  public wx_appsecret: string = ''
  public wb_appkey: string = ''
  public wb_appsecret: string = ''
  public bIsWbAppkeyChecked: boolean = true
  public key: string = ''
  public thumb: string = ''
  public sdate: string = ''
  public edate: string = ''
  public offlineJumpLink: string = ''
  public isDisplayAssetsLoading: boolean = false                  
  public isNotSaveImg: boolean = false                  //是否可以在app端长按保存图片 需要判断整个站点是否能够进行长按保存
  //card
  public isCard166: boolean = false
}

class PageAttrs implements IPageAttrs {
  public width:number = COMMON_WID_HEI.width
  public height:number = COMMON_WID_HEI.height
  // public isGradient?: boolean = false
  // public gradientAngle?: number = 0
  // public gradients?: string = '#4bb0ff#6149f6'
  public bgUrl: string = '' 
  public backgroundColor: string = '' 
  public bgPositionRepeatType: number = BG_POSITION_REPEAT_TYPES_MAP.centerTop
  public isAutoClose: boolean = false
  public delayTime: number = 0
  public isPopUseSiteBg: boolean = false
}

class PageStyles implements IPageStyles {
  public width: string = COMMON_WID_HEI.width + 'px'
  public height: string = COMMON_WID_HEI.height + 'px'
  public backgroundColor: string = "rgba(255, 255, 255, 0)"
  public backgroundImage: string = "url()"
  public backgroundSize: string = 'cover'
  public backgroundPosition: string = 'center center'
  public backgroundRepeat: string = 'no-repeat'
}

class ConStyles implements IConStyles {
  public position: string = 'absolute'
  public width: string = '0'
  public height: string = '0'
  public left: string = '0'
  public top: string = '0'
  public zIndex: number  = 0                  
}

class CompStyles implements ICompStyles {
  public width: string = '0'
  public height: string = '0'
}

class GlobalIsPost implements IGlobalIsPost {
  // isPushImg: true,
  // isFollow: true,
  public followCompIds: [] = []             //需要发送的全局关注uid集合
  public isFollowedMap: IIsFollowUid = {}              //关注过的uid集合
  public isFollowClickMap: IIsFollowUid = {}           //选择和取消选择的状态
  public isPushClickMap: IIsFollowUid = {}           //选择和取消选择的状态
}

class TimeObj implements ItimeObj {
  public serverTime: string = ''
  public timerTime: string = ''
  public isTimerStart: boolean = false
  public isTimerEnd: boolean = false
}

class InteractionData implements IInteractionData {
  vueContainer: any = null
  lists: IInteractionItem[] = []
}

export {
  Env,
  Md,
  PageAttrs,
  PageStyles,
  ConStyles,
  CompStyles,
  InteractionData,
  SiteInfo,
  SiteAttrs,
  GlobalIsPost,
  UserInfo,
  IsForm,
  TimeObj,
}