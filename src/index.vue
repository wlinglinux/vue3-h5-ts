<template>
  <div v-if="siteInfo.code === 0" id="jianye-container" class="jianye-container" :style="pcStyle">
    <wb-swiper v-if="isSwiper"></wb-swiper>
    <template v-else>
      <transition :name="pageTransitionName">
        <wb-pages></wb-pages>
      </transition>
    </template>
    <group-component class="fixed-con" v-if="fixedComps.length > 0" :item="{ id:'fixed-page', components: fixedComps }" :pageId="1" :popId="-1"></group-component>
    <transition :name="popTransitionName">
      <wb-pops></wb-pops>
    </transition>
    <wb-share v-if="siteAttrs.isShareWeiboWinxin" :item="shareItem"></wb-share>
    <van-loading v-if="siteInfo.isInitSite || siteInfo.isLoading || siteInfo.isDisplayAssetsLoading" :size="40" color="#1989fa"></van-loading>
  </div>
  <wb-qrcode v-if="siteInfo.code === 0 && isDisplayQrcode" class="pc-display-qrcode-con"></wb-qrcode>
</template>

<script setup lang="ts">
import { useSiteStore } from '@/store/site'
import { getQueryString, getPxOVwByValue, EventBus } from '@/utils/'
import { COMMON_WID_HEI } from '@/const/'
import { Env, Md } from '@/store/models/site'
import { sendStaticsVisit } from '@/service/api'
import { Dialog } from 'vant'
// import { siteData } from './site-data'

const isDisplayQrcode = ref(false)
const pageTransitionName = ref('fade')
const popTransitionName = ref('fade')
const shareItem = {}

const useSite = useSiteStore()
const fixedComps = computed(() => {
  return useSite.fixedComps
})
const siteInfo = computed(() => {
  return useSite.siteInfo
})
const md = useSite.siteInfo.md
const siteAttrs = computed(() => {
  return useSite.attrs
})
const pages = useSite.pages

const isSwiper = computed(() => {
  return useSite.isSwiper
})
const onLoginPopup = () => {
    Dialog.confirm({
      title: '',
      message: '亲，确认跳转微博登录页面吗？',
      // theme: 'round-button',
      confirmButtonText: '微博登录',
      confirmButtonColor: '#008000',
      // cancelButtonColor: '#f00'
    })
    .then(() => {
      // on confirm
      window.location.href = "https://passport.weibo.cn/signin/login?entry=mweibo&res=wel&wm=3349&r=" + window.location.href
    })
    .catch(() => {
      // on cancel
      useSite.updateLoading(false)
    })
    // WeiboJS.invoke("login", { redirect_uri: window.location.href }, function(e){});
    // window.wb.login(window.location.href);
    // if(this.$refs.login) {
    //   this.$refs.login.show();
    // }
}
const initComp = () => {
  EventBus.$on("login", onLoginPopup)
}

const requestSiteData = () => {
  const env_ = import.meta.env
  const env: IEnv = new Env()
  env.apiUrl = env_.VITE_APP_API_URL
  env.webUrl = env_.VITE_APP_WEB_URL
  env.baseUrl = env_.VITE_APP_WEB_URL
  useSite.siteInfo.isDebug = env_.DEV ? 1 : 0
  useSite.setEnvInfo(env)

  const site_id: number = Number(getQueryString("id"))
  if(!site_id) return
  let from: string = getQueryString("from")
  if(from){
    useSite.setSiteFrom(from)
  }
  const md_: any = new window.MobileDetect(window.navigator.userAgent)
  const isMobile: boolean = md_.phone() ? true : false
  const md = new Md()
  md.isMobile = isMobile
  md.mobileName = md_.phone()
  md.isIPhone = md_.is('iPhone')
  md.os = md_.os()
  useSite.updateIsMobileInfo(md)
  isDisplayQrcode.value = !isMobile
  
  sendStaticsVisit('visit', site_id)
  if(window.location.href.indexOf("temp") != -1) {
    useSite.getTempSiteData({ id: site_id } ) //IGetTempSiteData
  } else {
    useSite.getSiteData({ site_id })
  }
  // useSite.setSiteData({ data: siteData, code: 0, msg: '' })
}
requestSiteData()
initComp()
const pcStyle = computed(() => {
  const pageIndex = useSite.pageIndex
  const currentPage: IPage = pages[pageIndex]
  let heiStyle: string = ''
  if(currentPage) {
    heiStyle = currentPage.styles.height
  } else {
    let reallyHeight: number = COMMON_WID_HEI.clientHeight*COMMON_WID_HEI.adaptiveScale
    if(COMMON_WID_HEI.adaptiveScale <= 1 && !md.isMobile) {
      reallyHeight = COMMON_WID_HEI.clientHeight
    }
    heiStyle = getPxOVwByValue(reallyHeight)
  }
  return {
    width: getPxOVwByValue(COMMON_WID_HEI.clientWidth*COMMON_WID_HEI.adaptiveScale),
    height: heiStyle,
    margin: md.isMobile ? "0" : "auto",
  }
})
</script>

<script lang="ts">
const components = {
  WbPops: defineAsyncComponent(() => import('@/views/wb-pops.vue')),
  WbShare: defineAsyncComponent(() => import('@/views/wb-share.vue')),
  WbPages: defineAsyncComponent(() => import('@/views/wb-pages.vue')),
  WbSwiper: defineAsyncComponent(() => import('@/views/wb-swiper.vue')),
  WbQrcode: defineAsyncComponent(() => import('@/views/wb-qrcode.vue'))
}
export default defineComponent({
  components
})
</script>

