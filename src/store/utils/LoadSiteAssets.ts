import { COMMON_WID_HEI, H5_TYPE } from '@/const/'
import { getPxOVwByValue, EventBus } from '@/utils/'
import { useSiteStore } from '@/store/site'
import { useLoadsStore } from '@/store/loads'
import { SAVE_IMG_EVENT } from '@/store/models/events-data'
import { initPost } from '@/components/events/init-event'
import { INIT_API_MAP } from '@/service/api'

interface ILoadScript {
  src: string 
  type: string,
  charset: string
}

export default class LoadSiteAssets {
  private siteData_: ISiteData
  private scriptsTotal_: number = 0
  private loadScriptCount_: number = 0
  private scripts_: ILoadScript[] = []
  private scripts__: ILoadScript[] = []
  private isLoadScript_: boolean = true

  constructor(siteData: ISiteData) {
    this.siteData_ = siteData
    this.loadJsAndCssByData()
  }
  loadAllAssets() {
    const useSite = useSiteStore()
    const siteAttrs = useSite.attrs
    const siteInfo = useSite.siteInfo

    if(siteInfo.isDisplayAssetsLoading) {
      useSite.updateDisplayAssetsLoading(siteInfo.isDisplayAssetsLoading)
    }
    if(siteAttrs.loadAssets) {
      const loadAssetses = siteAttrs.loadAssets.split(",")
    if(loadAssetses.length > 0){
        const manifest = loadAssetses
        // Create a preloader. There is no manifest added to it up-front, we will add items on-demand.
        const preload = new window.createjs.LoadQueue(false)
        preload.on("progress", this.onOverallProgress.bind(this))
        preload.loadManifest(manifest)
      }
    }
  }
  onOverallProgress(event: any) {
    const siteStore = useSiteStore()
    const siteInfo = siteStore.siteInfo

    let process = event.loaded * 100
    EventBus.$emit('loadAssetsProcess', process)
    if(process >= 100){
      const isDisplayAssetsLoading:boolean = false
      siteStore.updateDisplayAssetsLoading(isDisplayAssetsLoading)
      siteInfo.isLoadAssetsCompleteNotInitComp = true
    }
  }
  loadJsAndCssByData() {
    const siteStore = useSiteStore()
    const siteAttrs = siteStore.attrs
    const siteInfo = siteStore.siteInfo
    const loadsStore = useLoadsStore()
    const isLoadJsObj = loadsStore.isLoadJsObj
    const isLoadAnimate = loadsStore.isLoadAnimate

    const currentPage = this.siteData_.pages[0]
    const title = siteAttrs.share && siteAttrs.share.allShare ? siteAttrs.share.allShare.title : ''
    const scale = currentPage ? COMMON_WID_HEI.clientWidth/currentPage.attrs.width/window.devicePixelRatio : 1
    const metas = [{ name: 'description', content: title }]
    if(siteAttrs.h5Type == H5_TYPE.pc && siteInfo.md.isMobile){
      metas.push({ name: 'viewport', content: 'width=device-width, initial-scale=' + scale + ', minimum-scale=0.3, maximum-scale=2.0, viewport-fit=cover, user-scalable=yes' })
    } else {
      // metas.push({ name: 'viewport', content: 'width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, viewport-fit=cover' })
    }
    const metaDom = document.getElementsByTagName('head')[0]
    _.forEach(metas, (meta: any) => {
      let newMetaDom = document.createElement("meta")
      newMetaDom.name = meta.name
      newMetaDom.content = meta.content
      metaDom.appendChild(newMetaDom)
    })
    const titleDom = document.getElementsByTagName('title')[0]
    titleDom.innerHTML = title
    const webUrl = siteStore.siteInfo.env.baseUrl
    const links = [{ rel: 'stylesheet', href: webUrl + 'css/iconfont.css?v=1' }]
    // if(isLoadJsObj.isAnimate || siteAttrs.isRandomEffect || siteAttrs.isPopRandomEffect){
    //   links.push({ rel: 'stylesheet', href: webUrl + 'css/animate.min.css?v=2' })
    // }
    // if(isLoadJsObj.isCustomFont){
    //   links.push({ rel: 'stylesheet', href: webUrl + 'css/custom_font.css?v=8' })
    // }
    // if(siteAttrs.loadCss && siteAttrs.loadCss.length > 0) {
    //   links.push({ rel: 'stylesheet', href: siteAttrs.loadCss })
    // }
    if(isLoadJsObj.isDefaultFont){
      links.push({ rel: 'stylesheet', href: webUrl + 'css/fonts.css' })
    }
    if(isLoadJsObj.isSwiper){
      links.push({ rel: 'stylesheet', href: webUrl + 'css/swiper-bundle.min.css?v=7' })
    }
    if(isLoadJsObj.isPanorama) {
      links.push({ rel: 'stylesheet', href: webUrl + 'css/photo-sphere-viewer.css' })
      links.push({ rel: 'stylesheet', href: webUrl + 'css/markers.css' })
    }
    const scripts: ILoadScript[] = []
    const scripts_: ILoadScript[] = []//需要在普通js加载完后在加载的js
    const scripts__: ILoadScript[] = []//需要在普通js加载完后在加载的js
    if(siteAttrs.loadAssets){
      const loadAssetses = siteAttrs.loadAssets.split(",")
      if(loadAssetses.length > 0){
        scripts.push({ src: webUrl + 'js/createjs/preloadjs-NEXT.min.js', type: 'text/javascript', charset: 'utf-8'})
      }
    }
    if(isLoadJsObj.isCreatejs){
      scripts.push({ src: webUrl + 'js/createjs/createjs.min.js', type: 'text/javascript', charset: 'utf-8'})
    }
    if(isLoadJsObj.isEaseljs){
      scripts.push({ src: webUrl + 'js/createjs/easeljs-NEXT.min.js', type: 'text/javascript', charset: 'utf-8'})
      scripts.push({ src: webUrl + 'js/createjs/preloadjs-NEXT.min.js', type: 'text/javascript', charset: 'utf-8'})
      scripts.push({ src: webUrl + 'js/createjs/tweenjs-NEXT.min.js', type: 'text/javascript', charset: 'utf-8'})
    }
    if(isLoadJsObj.isPixi){
      scripts.push({ src: webUrl + 'js/pixi/pixi.min.js', type: 'text/javascript', charset: 'utf-8'})
      if(isLoadJsObj.isGsap) {
        scripts.push({ src: webUrl + 'js/gsap/PixiPlugin.min.js?v=8', type: 'text/javascript', charset: 'utf-8'})
      }
      if(isLoadJsObj.isPixiFilters) {
        scripts_.push({ src: webUrl + 'js/pixi/pixi-filters.js', type: 'text/javascript', charset: 'utf-8'})
      }
    }
    if(isLoadJsObj.isThree){
      scripts.push({ src: webUrl + 'js/three/three.min.js?v=1', type: 'text/javascript', charset: 'utf-8'})
      if(isLoadJsObj.isOrbitControls){
        scripts_.push({ src: webUrl + 'js/three/controls/OrbitControls.js', type: 'text/javascript', charset: 'utf-8'})
      }
      if(isLoadJsObj.isGltfLoader) {
        scripts_.push({ src: webUrl + 'js/three/loaders/GLTFLoader.js', type: 'text/javascript', charset: 'utf-8'})
      }
      if(isLoadJsObj.isPanorama) {
        scripts.push({ src: webUrl + 'js/three/browser.min.js', type: 'text/javascript', charset: 'utf-8'})
        scripts_.push({ src: webUrl + 'js/three/photo-sphere-viewer.min.js', type: 'text/javascript', charset: 'utf-8'})
        scripts__.push({ src: webUrl + 'js/three/markers.min.js', type: 'text/javascript', charset: 'utf-8'})
        // scripts_.push({ src: webUrl + 'js/three/stereo.min.js', type: 'text/javascript', charset: 'utf-8'})
        // scripts_.push({ src: webUrl + 'js/three/gyroscope.min.js', type: 'text/javascript', charset: 'utf-8'})
      }
    }
    if(isLoadJsObj.isSwiper){
      scripts.push({ src: webUrl + 'js/swiper-bundle.min.js?v=7', type: 'text/javascript', charset: 'utf-8'})
    }
    if(isLoadJsObj.isMoveable){
      scripts.push({ src: webUrl + 'js/fabric/fabric.min.js?v=2', type: 'text/javascript', charset: 'utf-8'})
    }
    if(isLoadJsObj.isShake){
      scripts.push({ src: webUrl + 'js/shake.js', type: 'text/javascript', charset: 'utf-8'})
    }
    if(isLoadJsObj.isHtml2canvas){
      scripts.push({ src: webUrl + 'js/html2canvas.min.js?v=5', type: 'text/javascript', charset: 'utf-8'})
    }
    if(isLoadJsObj.isScanQRCode){
      scripts.push({ src: webUrl + 'js/weibo.js?v=2', type: 'text/javascript', charset: 'utf-8'})
    }
    if(isLoadJsObj.isPhaser){
      scripts.push({ src: webUrl + 'js/phaser/phaser.min.js?v=2', type: 'text/javascript', charset: 'utf-8'})
    }
    if(isLoadJsObj.isJsBarcode){
      scripts.push({ src: webUrl + 'js/JsBarcode.all.min.js?v=1', type: 'text/javascript', charset: 'utf-8'})
      scripts.push({ src: webUrl + 'js/base64.js', type: 'text/javascript', charset: 'utf-8'})
    }
    if(isLoadJsObj.isSvgAnimate){
      scripts.push({ src: webUrl + 'js/svg/vivus.min.js', type: 'text/javascript', charset: 'utf-8'})
    }
    if(isLoadJsObj.isSvga){
      scripts.push({ src: webUrl + 'js/svg/svga.min.js', type: 'text/javascript', charset: 'utf-8'})
    }
    if(isLoadJsObj.isSvg){
      scripts.push({ src: webUrl + 'js/svg/svg.min.js', type: 'text/javascript', charset: 'utf-8'})
    }
    if(isLoadJsObj.isSlotMachine){
      scripts.push({ src: webUrl + 'js/slotmachine/slotmachine.js?v=1', type: 'text/javascript', charset: 'utf-8'})
    }
    if(isLoadJsObj.isPaper){
      scripts.push({ src: webUrl + 'js/paper/paper-full.min.js', type: 'text/javascript', charset: 'utf-8'})
    }
    if(isLoadJsObj.isGsap || _.size(isLoadAnimate.isGroupGsap) > 0 || _.size(isLoadAnimate.isGsap) > 0) {
      scripts.push({ src: webUrl + 'js/gsap/gsap.min.js?v=8', type: 'text/javascript', charset: 'utf-8'})
    }
    if(_.size(isLoadAnimate.isPathBezier) > 0 || isLoadJsObj.isGsapBezier){
      scripts.push({ src: webUrl + 'js/gsap/MotionPathPlugin.min.js?v=8', type: 'text/javascript', charset: 'utf-8'})
    }
    if(isLoadJsObj.isVideo){
      if(siteInfo.md.isIPhone){
        scripts.push({ src: webUrl + 'js/iphone-inline-video.min.js', type: 'text/javascript', charset: 'utf-8'})
      }
      links.push({ rel: 'stylesheet', href: webUrl + 'css/video-js.css' })
      scripts.push({ src: webUrl + 'js/video.min.js', type: 'text/javascript', charset: 'utf-8'})
    }
    if(isLoadJsObj.isAudio){
      scripts.push({ src: webUrl + 'js/APlayer.min.js?v=1', type: 'text/javascript', charset: 'utf-8'})
    }
    if(isLoadJsObj.isMatter){
      scripts.push({ src: webUrl + 'js/matter.min.js', type: 'text/javascript', charset: 'utf-8'})
    }

    if(isLoadJsObj.isTurnBook){
      scripts.push({ src: webUrl + 'js/turn/jquery.min.1.7.js', type: 'text/javascript', charset: 'utf-8'})
      scripts.push({ src: webUrl + 'js/turn/turn.min.js', type: 'text/javascript', charset: 'utf-8'})
    }
    this.scriptsTotal_ = scripts.length
    this.loadScriptCount_ = 0
    _.forEach(scripts, (script: any) => {
      this.loadCssOrScript(script.src, this.loadCompleteCallback.bind(this))
    })
    _.forEach(links, (link: any) => {
      this.loadCssOrScript(link.href)
    })
    if(scripts.length == 0) {
      this.loadCompleteCallback()
    }
    if(scripts_.length > 0) {
      this.scripts_ = scripts_
      this.isLoadScript_ = true
    }
    if(scripts__.length > 0) {
      this.scripts__ = scripts__
      this.isLoadScript_ = true
    }
  }
  loadCssOrScript(url: string, fn?: Function) {
    let Head = document.getElementsByTagName('head')[0]
    let linkScript: any
    /* eslint-disable */
    if(/\.css[^\.]*$/.test(url)) {
      linkScript = document.createElement("link")
      linkScript.type = "text/" + ("css")
      linkScript.rel = "stylesheet"
      linkScript.href = url
    } else {
      linkScript = document.createElement("script")
      linkScript.type = "text/" + ("javascript")
      linkScript.src = url
    }
    Head.insertBefore(linkScript, Head.lastChild)
    linkScript.onload = linkScript.onerror = () => {
      if(fn) fn()
    }
  }
  loadCompleteCallback() {
    this.loadScriptCount_++
    if(this.loadScriptCount_ >= this.scriptsTotal_) {
      if(this.isLoadScript_ && this.scripts_.length > 0) {
        this.isLoadScript_ = false
        this.loadScriptCount_ = 0
        this.scriptsTotal_ = this.scripts_.length
        _.forEach(this.scripts_, (script: ILoadScript) => {
          this.loadCssOrScript(script.src, this.loadCompleteCallback.bind(this))
        })
        if(this.scripts__.length > 0) {
          this.scripts_ = this.scripts__
          this.isLoadScript_ = true
          this.scripts__ = []
        }
        return
      }
      const siteStore = useSiteStore()
      siteStore.setSitePages(this.siteData_)
      const loadAssetses = siteStore.attrs.loadAssets.split(",")
      if(siteStore.siteInfo.isDisplayAssetsLoading || loadAssetses.length > 0) {
        this.loadAllAssets()
      }
      // this.addScrollTriggerAnimate()
      // this.setFollowData()
      this.setHtml2canvasUploadData()
      this.initCssVar()
    }
  }
  setHtml2canvasUploadData() {
    const isLoadJsObj = useLoadsStore().isLoadJsObj
    if(isLoadJsObj.isNeedUploadParams) {
      let event = SAVE_IMG_EVENT
      initPost(INIT_API_MAP.file, event, {})
    }
  }

  initCssVar() {
    const arr = [-2,-4,-6,-8,-20,-26,-28,-30,-32,-36,-40,-50,-70,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,48,50,52,54,56,58,60,70,80,84,90,72,78,100,104,106,108,120,132,136,140,150,156,160,170,190,192,230,300,330,420,450,500,510,750]
    const docStyle = document.documentElement.style
    _.forEach(arr, (num: number) => {
      docStyle.setProperty(`--size-${num}`, getPxOVwByValue(num))
    })
    const initAPLayerCssObj = {
      "aplayer-author-size": 24,
      "aplayer-title-size": 28,
      "aplayer-lrc-height": 70,
      "aplayer-lrc-size": 24,
      "aplayer-lrc-line-height": 48,
      "aplayer-lrc-active-size": 28,
      "aplayer-pic-top": 100,

      "van-padding-base": 4,
      "van-padding-xs": 8,
      "van-padding-sm": 12,
      "van-padding-md": 16,
      "van-padding-lg": 24,
      "van-padding-xl": 32,

      "van-font-size-xs": 10,
      "van-line-height-xs": 14,
      "van-line-height-sm": 18,
      "van-line-height-md": 20,
      "van-line-height-lg": 22,

      "van-border-width-base": 1,
      "van-border-radius-sm": 2,
      "van-border-radius-md": 4,
      "van-border-radius-lg": 8,
      "van-border-radius-max": 999,

      "van-font-size-lg": 32,
      "van-font-size-md": 28,
      "van-font-size-sm": 24,
      "van-field-text-area-min-height": 12,
      "van-calendar-header-title-height": 88,
      "van-calendar-day-height": 128,
      "van-calendar-month-mark-font-size": 320,
      "van-calendar-weekdays-height": 60,
      "van-calendar-selected-day-size": 108,
      "van-calendar-confirm-button-height": 72,
      "van-dropdown-menu-height": 48,

      "van-uploader-size": 160,
      "van-uploader-icon-size": 48,
      "van-uploader-delete-icon-size": 28,
      "van-uploader-file-icon-size": 40,
      "van-uploader-mask-icon-size": 44,
      "van-uploader-loading-icon-size" : 44,

      "van-button-mini-height": 48,
      "van-button-small-height": 64,
      "van-button-large-height": 100,
      "van-button-default-height": 88,
      "van-button-loading-icon-size": 40,

      "van-toast-icon-size": 72,
      "van-toast-text-min-width": 192,
      "van-toast-default-width": 176,
      "van-toast-default-min-height": 176,

      "van-checkbox-size": 40,
      "van-radio-size": 40,
      "van-field-icon-size": 32,
      "van-field-clear-icon-size": 32,
      "van-field-error-message-font-size": 24,
      // "van-field-text-area-min-height": 120,
      "van-field-word-limit-line-height": 32,
      "van-address-list-item-font-size": 26,
      "van-address-list-edit-icon-size": 40,

      "van-switch-size": 60,
      "van-loading-spinner-size": 60,

      "van-dialog-width": 640,
      "van-dialog-border-radius": 32,
      "van-dialog-header-line-height": 48,
      "van-dialog-header-padding-top": 52,
      "van-dialog-button-height": 96,
      "van-dialog-round-button-height": 72,
      "van-dialog-message-font-size": 32
    }
    _.forEach(initAPLayerCssObj, (num: number, key: string) => {
      docStyle.setProperty(`--${key}`, getPxOVwByValue(num))
    })
  }
}
