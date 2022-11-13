// export const INTERACTION_CLICK_DATA = { clickCompIdMap: new Map(), randomPageIds: [], randomPageIndex: 0, swiperIndex: 0, isEmit: false, isOpenCamera: false, card: null, puzzle: null }
class ShareInteractionData implements IShareInteractionData {
  public clickCompIdMap: any = new Map() 
  public randomPageIds: [] = []
  public randomPageIndex: number = 0 
  public swiperIndex: number = 0  
  public isEmit: boolean = false 
  public isOpenCamera: boolean = false 
  public card: any = null 
  public puzzle: any = null 
  public isEmitClick: boolean = false
}
class BindData implements IBindData {
  public month: number = new Date().getMonth() + 1
  public day: number = new Date().getDate()
  public total: number = 0
  public generalRank: number = 0
  public generalTotal: number = 0
  public remain: number = 0
  public score: number  = 0
  public scores: number = 0
  public isRights: boolean = false
  public puzzle: number  = 0
  public uid: string = ''
  public workNum: number = 0
  public name: string = ''
  public mid: string = ''
  public num: number = 0
  public lotteryUrl: string = ''
  public lotteryName: string  = ''
  public sexIconUrls: string[] = []                        //(性别图标地址)
  public couponCode: string = ''                           //抽奖兑换码
  public times: number = 0                                 // 王者荣耀时间
  public lotteryTime: string = ''                          // 中奖时间
}

class FrontData implements IFrontData {
  public pageCommonListAutoHeight: any = {}
  public isLocalSiteData: boolean = false
}

class ShareData implements IShareData {
  public imgs: [] = [] 
  public url: string = '' 
  public link: string = '' 
  public midJump: string = '' 
  public title:  string = '' 
  public content:  string = ''
  public videoUrl: string = ''
  public posterUrl: string = ''
  public list: [] = []
  public mine: [] = [] 
  //这个不能赋值，否则2422 拖拽按钮组报错
  // public currPeriod: number = -1
}

class StaticData implements IStaticData {
  public total: number = 0
  public founder_date?: string = ''
  public xiaomi_date?: string = ''
  public reister_days?: string = ''
}

export {
  ShareInteractionData,
  BindData,
  ShareData,
  StaticData,
  FrontData
}
