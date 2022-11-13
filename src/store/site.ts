import { PageStyles } from '@/store/models/site'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { Dialog, Toast } from 'vant'
import { H5_TYPE, PAGE_POP_TYPE, COMMON_WID_HEI, MOBILE_WID_HEI, PC_WID_HEI, CANVAS_WID_HEI, PAGE_TYPE, COMPONENT_TYPES, PAGE_MODE_MAP, SWIPER_EFFCE } from '@/const/'
import { isHasOwnProperty, EventBus } from '@/utils'
import { dealPageStyleAndAttr, dealPageOrGroup, resetAllCropImgUrl } from './utils'
import { getSiteData, getTempSiteData } from '@/service/api'
import { getQueryString, bgPositionStyle } from '@/utils/'
import { SiteInfo, GlobalIsPost, UserInfo, IsForm, TimeObj, SiteAttrs } from './models/site'
import { useControlsStore } from './controls'
import { useActivityStore } from './activity'
import { useInteractionStore } from './interaction'
import { useLoadsStore } from './loads'
import LoadSiteAssets from './utils/LoadSiteAssets'
import { postStatics } from '@/service/statics'
const copySiteData = {}

//后台过来的数据，需要处理为合适各个平台的，还有一些全屏等渲染页面需要的属性需要设置
function setControlsAndSiteAttrs(siteData: ISiteData) {
  const useSite = useSiteStore()
  if(isHasOwnProperty(siteData,'uid') && siteData.uid && siteData.uid.length > 0) {
    useSite.userInfo.uid = siteData.uid
    useSite.userInfo.isLogin = true
  }
  if(isHasOwnProperty(siteData,'usr') && !_.isArray(siteData.usr) && siteData.usr.length > 0) {
    _.merge(useSite.userInfo, siteData.usr)
    useSite.userInfo.name = siteData.usr.screen_name
  }
  useSite.siteInfo.isTemplate = siteData.is_template == "1" ? true : false
  useSite.siteInfo.isDisplayAssetsLoading = siteData.attrs.isDisplayAssetsLoading
  useSite.siteInfo.id = parseInt(siteData.id)

  const controlsStore = useControlsStore()
  controlsStore.controls = siteData.controls ? siteData.controls : {}
}

function initComponentMapInPage(componentMap: IComponentMap, allPages: IPage[]) {
  _.forEach(allPages, (page: IGroup) => {
    initComponentMap(componentMap, page)
  })
} 
export function initComponentMap(componentMap: IComponentMap, pageOrGroupComponent: IGroup) {
  _.forEach(pageOrGroupComponent.components, (componentData: IComponent) => {
    componentMap[componentData.id] = componentData;
    if(componentData.components && componentData.components.length > 0){
      if(componentData.conAttr.realTop > 0){
        componentData.conAttr.initTop = componentData.conAttr.top
      }
      initComponentMap(componentMap, componentData);
    }
  })
}
function dealSiteAttr(data: ISiteData) {
  const useSite = useSiteStore()
  const loadsStore = useLoadsStore()
  if(data.attrs.pageType == PAGE_TYPE.long || data.attrs.isNoSwiping){
    loadsStore.isLoadJsObj.isSwiper = false
  }else{
    loadsStore.isLoadJsObj.isSwiper = true
  }
  useSite.attrs = data.attrs
  // useSite.styles = data.styles
  if(!data.styles) {
    data.styles = new PageStyles()
  }
  const siteStyles: IPageStyles = data.styles
  if(useSite.attrs.backgroundColor) {
    siteStyles.backgroundColor = useSite.attrs.backgroundColor
  }
  if(useSite.attrs.bgUrl && useSite.attrs.bgUrl != 'https://static.hd.xxx.com/jye/fe-web/images/edit-bg.jpg') {
    siteStyles.backgroundImage = 'url(' + useSite.attrs.bgUrl + ')'
    bgPositionStyle(siteStyles, useSite.attrs.bgPositionRepeatType)
  } else {
    siteStyles.backgroundImage = 'url()'
  }
  useSite.styles = siteStyles
  const popId = parseInt(getQueryString('popId'))
  if(popId) {
    useSite.attrs.popId = popId
  }
  const pageId = getQueryString('pageId')
  if(pageId) {
    useSite.attrs.pageId = parseInt(pageId)
  }

  if(!isHasOwnProperty(useSite.attrs, 'swiper')) {
    useSite.attrs.swiper = { turnPageMode: PAGE_MODE_MAP.top_down, autoTurnPage: false, turnPageTime: 0.5,  effect: SWIPER_EFFCE[0].value, swiperHintUrl: '', noSwipings: '', isTurnPage: false }
    _.forEach(useSite.attrs.swiper, (value: any, key: string) => {
      useSite.attrs.swiper[key] = useSite.attrs[key]
    })
  }
}
function dealSiteType(siteData: ISiteData) {
  let pages: IPage[] = _.filter(siteData.pages, function(p:IPage) { return p.type == PAGE_POP_TYPE.page })
  let h5Type = siteData.attrs.h5Type
  let page = pages[0]
  if(h5Type == H5_TYPE.mobile) {
    MOBILE_WID_HEI.width = page.attrs.width;
    _.merge(COMMON_WID_HEI, MOBILE_WID_HEI)
  }else if(h5Type == H5_TYPE.pc) {
    PC_WID_HEI.width = page.attrs.width;
    _.merge(COMMON_WID_HEI, PC_WID_HEI)
  }else if(h5Type == H5_TYPE.canvas) {
    CANVAS_WID_HEI.width = page.attrs.width;
    _.merge(COMMON_WID_HEI, CANVAS_WID_HEI)
  }
  COMMON_WID_HEI.adaptiveScale = COMMON_WID_HEI.width/COMMON_WID_HEI.clientWidth
}

function setPageHaveForm(components: IComponent[], pageIndex: number, pageHaveForms: Object) {
  _.forEach(components, (componentData: IComponent) => {
    if(componentData.events.submit) {
      pageHaveForms[pageIndex] = true
    }else if(componentData.components && componentData.components.length > 0) {
      setPageHaveForm(componentData.components, pageIndex, pageHaveForms)
    }
  })
}
function setPagesHaveForm(pages: IPage[], pageHaveForms: Object) {
  _.forEach(pages, (page: IPage, pageIndex: number) => {
    setPageHaveForm(page.components, pageIndex, pageHaveForms)
  })
}

function setPageHaveScrollY(components: IComponent[], pageIndex: number, pageHaveScrollY: Object) {
  _.forEach(components, (componentData: IComponent) => {
    if(componentData.cid == COMPONENT_TYPES.group_component  && componentData.commonAttr.isDisplayY) {
      pageHaveScrollY[pageIndex] = true
    }else if(componentData.components && componentData.components.length > 0) {
      setPageHaveScrollY(componentData.components, pageIndex, pageHaveScrollY)
    }
  })
}

function setPagesHaveScrollY(pages: IPage[], pageHaveScrollY: Object) {
  _.forEach(pages, (page: IPage, pageIndex: number) => {
    setPageHaveScrollY(page.components, pageIndex, pageHaveScrollY)
  })
}
export const useSiteStore = defineStore({
  id: 'site',
  state: (): ISite => {
    return {
      isH5Edit: false,
      componentMap: {},                //所有组件的map
      pageIndex: -1,
      popIndex: -1,                   //打开的弹层id > 0，没有弹层打开就是0
      pages: [],
      pops: [],                      //在这个vite下不知道为啥会被覆盖，只能加一个下划线，估计是有保留单词是pops
      allPages: [],
      allPagesMap: {},
      fixedComps: [],                 //在编辑中将通用属性设置为固定布局的组件
      isGlobalShareComponents: {},     //当前页面需要绑定事件组件ids（别的页面上的组件）
      attrs: new SiteAttrs(),
      styles: new PageStyles(),
      userInfo: new UserInfo(),
      siteInfo: new SiteInfo(),
      timeObj: new TimeObj(),
      globalIsPost: new GlobalIsPost(),
      isForm: new IsForm(),
      pageHaveForms: {},
      pageHaveCompNum: {},
      pageHaveScrollY: {}
    }
  },
  getters: {
    getCurrentPage(): IPage {
      return this.popIndex >= 0 ? this.pops[this.popIndex] : this.pages[this.pageIndex]
    },
    isSwiper(): boolean {
      if(this.attrs.pageType == PAGE_TYPE.long || this.attrs.isNoSwiping){
        return false
      }else{
        return true
      }
    },
    // getUserById: (state) => {
    //   return (userId) => this.users.find((user) => user.id === userId)
    // },
  },
  actions: {
    updateFormIsSubmit(isSubmit: boolean) {
      this.siteInfo.formIsSubmit = isSubmit
    },
    setShare(wxTicket: IWxTicket) {
      this.siteInfo.wxTicket = wxTicket
      EventBus.$emit("refreshWxTicket")
    },
    setUserInfo(userData: IUserInfo) {
      _.merge(this.userInfo, userData)
      localStorage.isLogin = this.userInfo.uid ? true : false
      localStorage.uid = this.userInfo.uid
      EventBus.$emit("refreshDynamicData")
    },
    updatePageAttr(page: IPage | any){
      let currentPage = this.allPagesMap[page.id]
      _.merge(currentPage, page)
    },
    updateComponent({id, data }: {id: string, data:  any}) {
      const componentData = this.componentMap[id]
      if(componentData) _.merge(componentData, data)
    },
    updateComponentAttr({id, commonAttr }: {id: string, commonAttr: ICommonAttr | any}) {
      const componentData = this.componentMap[id]
      if(componentData) _.merge(componentData.commonAttr, commonAttr)
    },
    updateComponentConAttr({id, conAttr }: {id: string, conAttr: IConAttr | any}) {
      const componentData = this.componentMap[id]
      if(componentData) _.merge(componentData.conAttr, conAttr)
    },
    updateComponentStyles({id, styles}: {id: string, styles: any}) {
      const componentData = this.componentMap[id]
      if(componentData) {
        if(!componentData.styles) {
          componentData.styles = styles
        } else {
          _.merge(componentData.styles, styles)
        }
      }
    },
    updateComponentAttrUrl(data: IComponent | any) {
      const componentData = this.componentMap[data.id]
      if(!isHasOwnProperty(componentData.commonAttr, 'url_')) {
        componentData.commonAttr.url_ = componentData.commonAttr.url
      }
      _.merge(componentData, data)
    },
    replaceComponentList({id, lists}: {id: string, lists: any[]}) {
      let componentData = this.componentMap[id]
      _.forEach(lists, (item: any) => {
        item.id = 'click_item_' + _.random(0, 1000)
      })
      componentData.lists = lists
    },
    updateGlobalPost(globalPost: IGlobalIsPost | any) {
      _.merge(this.globalIsPost, globalPost)
    },
    updatePageOrPopComNum(pageOrPopComNum: number) {
      this.siteInfo.pageOrPopComNum = pageOrPopComNum
      if(this.siteInfo.pageOrPopComNum <= 0) {
        this.siteInfo.isLoading = false
        EventBus.$emit('communiteComplete')
      }
    },
    updateLoading(isLoading: boolean) {
      this.siteInfo.isLoading = isLoading
      if(!isLoading) {
        const loadingDom = document.getElementById('loading-process')
        if(loadingDom) {
          document.body.removeChild(loadingDom)
        }
      }
    },
    updateRepostsDelayTimeTime(time: number) {
      this.siteInfo.repostsDelayTime += time
    },
    updateReloadData(compLoadNum: number) {
      this.siteInfo.compLoadNum = compLoadNum
      if(this.siteInfo.compLoadNum <= 0) {
        this.siteInfo.isReload = true
        EventBus.$emit('compInitComplete')
      }
    },
    updatePopReloadData(popCompLoadNum: number) {
      this.siteInfo.popCompLoadNum = popCompLoadNum
      if(this.siteInfo.popCompLoadNum <= 0) {
        this.siteInfo.isPopReload = true
        EventBus.$emit('popCompInitComplete')
      }
    },
    updateDisplayAssetsLoading( isDisplayAssetsLoading: boolean ) {
      this.siteInfo.isDisplayAssetsLoading = isDisplayAssetsLoading
    },
    updatePageIndex(pageIndex: number) {
      const compNum = this.pageHaveCompNum[this.pages[pageIndex].id]
      this.updateReloadData(compNum)
      this.siteInfo.repostsDelayTime = 0
      const useInteraction = useInteractionStore()
      if(useInteraction.coverPageCropCompAttr[pageIndex+1]){
        let compIds = useInteraction.coverPageCropCompAttr[pageIndex+1]
        let compId: string
        while(compIds.length > 0) {
          compId = compIds.pop()
          const compData = this.componentMap[compId]
          if(compData && compData.cid == COMPONENT_TYPES.wb_img) {
            compData.commonAttr.url = compData.commonAttr.url_
          }
        }
      }
      let oldPageIndex = this.pageIndex
      if(pageIndex >= 0) {
        useInteraction.resetVisibleComponents()
        //swiper 不用重置这些数据
        const loadsStore = useLoadsStore()
        const isLoadJsObj = loadsStore.isLoadJsObj
        if(isLoadJsObj.isHtml2canvas && this.attrs.pageType == PAGE_TYPE.single && this.attrs.isNoSwiping){
          resetAllCropImgUrl(this.allPages);
        }
      }
      if(this.pages[pageIndex].isReloadEvent) {
        this.siteInfo.reloadCb = window.setInterval(() => {
          if(this.siteInfo.isReload && !this.siteInfo.isLoading) {
            //这个需要足够的时间，不然页面还没有渲染完，事件无法监听到
            EventBus.$emit("reloadLoadEvent", { pageIndex, popIndex: this.popIndex })
            this.siteInfo.isReload = false
            if(pageIndex != 0 && pageIndex == oldPageIndex) {
              EventBus.$emit("reloadInitEvent", { pageIndex, popIndex: this.popIndex })
            }
            window.clearInterval(this.siteInfo.reloadCb)
          }
        }, this.siteInfo.reloadTime)
      }
      //恢复数据
      _.forEach(useInteraction.recoverCompMap, (comp: any, id: string) => {
        _.merge(this.componentMap[id].commonAttr, useInteraction.recoverCompMap[id])
      })
      this.pageIndex = pageIndex
    },
    updatePopIndex(popIndex: number) {
      if(popIndex >= 0) {
        const compNum = this.pageHaveCompNum[this.pops[popIndex].id]
        this.updatePopReloadData(compNum)
        const useInteraction = useInteractionStore()
        const loadsStore = useLoadsStore()
        const isLoadJsObj = loadsStore.isLoadJsObj
        useInteraction.resetVisibleComponents()
        if(isLoadJsObj.isHtml2canvas) {
          resetAllCropImgUrl(this.allPages)
        }
        if(this.pops[popIndex].isReloadEvent) {
          this.siteInfo.reloadPopCb = window.setInterval(() => {
            if(this.siteInfo.isPopReload && !this.siteInfo.isLoading) {
              EventBus.$emit("reloadLoadEvent", { popIndex, pageIndex: this.pageIndex })
              this.siteInfo.isPopReload = false
              window.clearInterval(this.siteInfo.reloadPopCb)
            }
          }, this.siteInfo.reloadTime)
        }
      }
      this.popIndex = popIndex
    },
    setEnvInfo(env: IEnv) {
      this.siteInfo.env = env;
    },
    setSiteFrom(from: string){
      this.siteInfo.from = from
    },
    updateTime({id, controlId, data}) {
      const useControls = useControlsStore()
      this.timeObj.timerTime = (useControls.controls[id][controlId].data as ITimerControl).time = data.end
      this.timeObj.serverTime = data.current
    },
    updateIsMobileInfo(md: IMd){
      _.merge(this.siteInfo.md, md)
    },
    async getSiteData(params: IGetSiteData) {
      const { data } = await getSiteData(params)
      this.setSiteData(data)
    },
    setSiteData(data: any) {
      const siteData: ISiteData = data.data
      this.siteInfo.code = data.code
      this.siteInfo.msg = data.msg
      if(data.code > 0){
        Dialog.alert({
          title: '',
          message: this.siteInfo.msg,
        })
        return
      }
      setControlsAndSiteAttrs(siteData)
      initComponentMapInPage(this.componentMap, siteData.pages)
      if(siteData.activityInfo && siteData.activityInfo.isHave) {
        const activityStore = useActivityStore()
        activityStore.setActivityData(siteData.activityInfo, siteData)
      } else {
        this.setPageData(siteData)
      }
    },
    updateIsTimerEnd({isTimerEnd}){
      this.timeObj.isTimerEnd = isTimerEnd
    },
    updateIsTimerStart({isTimerStart}){
      this.timeObj.isTimerStart = isTimerStart
    },
    async getTempSiteData(params: IGetTempSiteData) {
      let siteData: any
      const interactionStore = useInteractionStore()
      if(interactionStore.frontData.isLocalSiteData) {
        this.siteInfo.code = 0
        siteData = copySiteData as ISite
        
        setControlsAndSiteAttrs(siteData)
        initComponentMapInPage(this.componentMap, siteData.pages)
        this.setPageData(siteData)
        this.siteInfo.isInitSite = false
        this.siteInfo.isDisplayAssetsLoading = false
        Toast.clear()
      } else {
        const { data } = await getTempSiteData(params)
        siteData = data.data
        this.siteInfo.msg = data.msg
        this.siteInfo.code = data.code
        if(data.code > 0){
          Dialog.alert({
            title: '',
            message: this.siteInfo.msg,
          })
          return
        }
                
        setControlsAndSiteAttrs(siteData)
        initComponentMapInPage(this.componentMap, siteData.pages)
        if(siteData.activityInfo && siteData.activityInfo.isHave) {
          const activityStore = useActivityStore()
          activityStore.setActivityData(siteData.activityInfo, siteData)
        } else {
          this.setPageData(siteData)
        }
      }
    },
    setPageData (siteData: ISiteData) {
      const loadingDom = document.getElementById('loading-process')
      if(loadingDom) {
        document.body.removeChild(loadingDom)
      }
      const useSite = useSiteStore()
      if(!siteData || !siteData.pages) {
        Dialog.alert({
          title: '',
          message: '站点数据错误',
        })
        return
      }
      const jumpUrl = siteData.attrs.offlineJumpLink
      if(siteData.attrs.isOffline && jumpUrl) {
        window.location.href = jumpUrl
        return
      }
      dealSiteType(siteData)
      dealSiteAttr(siteData)
    
      for(let i = 0, pageLen = siteData.pages.length; i < pageLen; i++) {
        let page = siteData.pages[i]
        dealPageStyleAndAttr(siteData.attrs, useSite.siteInfo, page)
        dealPageOrGroup(siteData, page, page, false, siteData.pages)
        if(i == 0 && useSite.fixedComps.length > 0){
          _.pullAllWith(page.components, useSite.fixedComps, _.isEqual)
        }
      }
    
      new LoadSiteAssets(siteData)
      postStatics({ comType: "visit", wModule: "visit", jumpUrl: ''})
    },
    setSitePages(data: ISiteData) {
      const pops = _.filter(data.pages, function(o: IPage) { return o.type == PAGE_POP_TYPE.pop })
      const allPages = this.allPages = data.pages
      setPagesHaveForm(allPages, this.pageHaveForms)
      setPagesHaveScrollY(allPages, this.pageHaveScrollY)
      _.forEach(allPages, (page: IPage) => {
        this.allPagesMap[page.id] = page
      })
      this.pages = _.filter(data.pages, function(o: IPage) { return o.type == PAGE_POP_TYPE.page })
      this.pops = pops
    
      this.siteInfo.isInitSite = false
      
      if(data.attrs.reloadTime) {
        this.siteInfo.reloadTime = data.attrs.reloadTime
      }
      //打开页面 弹层
      const pageId: number = this.attrs.pageId
      const popId: number = this.attrs.popId
      if(pageId > 0) {
        this.updatePageIndex(pageId-1)
        EventBus.$emit('showPage', pageId)
      }
      if(popId > 0){
        this.updatePopIndex(popId-1)
        EventBus.$emit('showPop', popId)
      }
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSiteStore, import.meta.hot))
}
