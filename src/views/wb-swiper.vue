<template>
  <div class="wid-hei-inherit" :style="globalStyles">
    <div class="swiper swiper-container" id="swiper-page">
      <div class="swiper-wrapper">
        <div
          v-for="(page, index) in pages"
          :key="page.id"
          :id="'page-' + (index+1)"
          :style="siteStyles"
          :class="['swiper-slide', {'swiper-no-swiping': noSwipings[index]}]"
        >
          <group-component :item="page" :pageId="index+1" :popId="-1" :style="page.styles"></group-component>
        </div>
      </div>
      <div class="swiper-pagination"></div>
    </div>
    <img v-if="displaySwiperArrow" :src="swiperArrowUrl" class="ani-swipe" :style="arrowWidHei">
    <!-- <div v-if="siteAttrs.isDisplayDebuggerText" class="version"> {{ version }} </div> -->
  </div>
</template>

<script lang="ts" setup>
import { useSiteStore } from '@/store/site'
import { bgPositionStyle, EventBus, getPxOVwByValue } from '@/utils/'
import { PageStyles } from '@/store/models/site'
import { COMMON_WID_HEI, PAGE_MODE_MAP, EVENT_HOVER_TYPES } from '@/const/'
import { isFixIosForm, eventPostAddLoading } from './utils/'
import { showPage } from '@/components/utils'

const version = ref('版本v4.0')
const useSite = useSiteStore()
const siteAttrs = useSite.attrs
const siteInfo = useSite.siteInfo

const pages = computed(() => {
  return useSite.pages
})

let noSwipings_: boolean[] = []
const noSwipings = computed(() => {
  return noSwipings_
})
const getIsNoSwiping = () => {
  let isNoSwipings = false
  if(siteAttrs.swiper.noSwipings) {
    const noSwipings = siteAttrs.swiper.noSwipings.split(',')
    if(noSwipings.length > 0){
      isNoSwipings = true
    }
  }
  return isNoSwipings
}
let swiper:any = null

const globalStyles = computed(() => {
   let currentPage = useSite.pages[useSite.pageIndex]
  let styles_ = { width: '100vw', height: '100vh', overflow: 'hidden' }
  if(currentPage) {
    styles_.width = currentPage.styles.width
    styles_.height = currentPage.styles.height
  }
  styles_.overflow = "hidden"
  return styles_
})

const siteStyles = computed(() => {
  const styles_: IPageStyles | any = new PageStyles()
  const currentPage = useSite.pages[useSite.pageIndex]
  if(currentPage) {
    styles_.width = currentPage.styles.width
    styles_.height = currentPage.styles.height
  }
  styles_.backgroundColor = siteAttrs.backgroundColor
  if(siteAttrs.bgUrl) {
    styles_.backgroundImage = 'url(' + siteAttrs.bgUrl + ')'
    bgPositionStyle(styles_, siteAttrs.bgPositionRepeatType)
  }
  if(noSwipings_[useSite.pageIndex]){
    styles_['touch-action'] = 'none'
  }else{
    styles_['touch-action'] = 'default'
  }
  return styles_
})
const isHaveJumpEventInCurrentPage = computed(() => {
  let page = useSite.pages[useSite.pageIndex]
  let isEvent = getEventByType(page, EVENT_HOVER_TYPES.anchor)
  return isEvent
})

const displaySwiperArrow = computed(() => {
  if(siteAttrs.swiper && siteAttrs.swiper.turnPageMode == PAGE_MODE_MAP.top_down && useSite.pages.length > 1
    && !siteAttrs.isNoSwiping && useSite.popIndex < 0 && useSite.pageIndex != useSite.pages.length-1 && !isHaveJumpEventInCurrentPage
    && !noSwipings_[useSite.pageIndex]) {
    return true
  } else {
    return false
  }
})

const swiperArrowUrl = computed(() => {
  let url = ''
  if(siteAttrs.swiper && siteAttrs.swiper.swiperHintUrl && siteAttrs.swiper.swiperHintUrl.length > 0){
    url = siteAttrs.swiper.swiperHintUrl.split(',')[0]
  }else{
    url = `${siteInfo.env.baseUrl}images/web-swipe-tip.png`
  }
  return url
})

const arrowWidHei = computed(() => {
  let reallyWidth = COMMON_WID_HEI.clientWidth*COMMON_WID_HEI.adaptiveScale
  if(siteAttrs.swiper && siteAttrs.swiper.swiperHintUrl.length > 0) {
    if(COMMON_WID_HEI.adaptiveScale <= 1 && !siteInfo.md.isMobile) {
      reallyWidth = COMMON_WID_HEI.clientWidth
    }
    const arr: string[] = siteAttrs.swiper.swiperHintUrl.split(',')
    const width: number = arr[1] ? _.parseInt(arr[1]) : 300
    const height: number = arr[2] ? _.parseInt(arr[2]) : 105
    const bottom: number = arr[3] ? _.parseInt(arr[3]) : 2
    return {
      width: getPxOVwByValue(width),
      height: getPxOVwByValue(height),
      left: getPxOVwByValue((reallyWidth-width)/2),
      bottom: bottom + "%",
    }
  }else{
    return {
      width: getPxOVwByValue(48),
      height: getPxOVwByValue(36),
      left: getPxOVwByValue((reallyWidth-48)/2),
    };
  }
})

const getEventByType = (page: IGroup, eventType: string): boolean => {
  for(let i = 0, len = page.components.length; i < len; i++) {
    let componentData = page.components[i]
    let events = componentData.events
    if(events[eventType]) {
      return true
    }else if(componentData.components && componentData.components.length > 0){
      return getEventByType(componentData, eventType)
    }
  }
  return false
}

const initComp = () => {
  const pages = useSite.pages
  _.forEach(pages, () => {
    noSwipings_.push(false)
  })

  if(siteAttrs.swiper.noSwipings){
    const noSwipings = siteAttrs.swiper.noSwipings.split(",")
    _.forEach(noSwipings, (pageId: number) => {
      noSwipings_[pageId-1] = true
    })
  }
  EventBus.$on("showPage", onShowPage)
}

const swiperOption = {
  updateOnWindowResize: true,
  preloadImages: false,//默认为true，Swiper会强制加载所有图片。
  runCallbacksOnInit: true,//slideChangeTransitionStart
  watchOverflow: true,//当没有足够的slide切换时，例如只有1个slide，swiper会失效且隐藏导航等。默认不开启这个功能。
  preventInteractionOnTransition: true,
  direction: siteAttrs.swiper.turnPageMode == PAGE_MODE_MAP.top_down ? "vertical" : "horizontal",
  speed: siteAttrs.swiper.turnPageTime * 1000,//切换速度，即slider自动滑动开始到结束的时间（单位ms），也是触摸滑动时释放至贴合的时间。
  width: COMMON_WID_HEI.clientWidth,
  height: COMMON_WID_HEI.clientHeight,
  mousewheel: !siteAttrs.swiper.isTurnPage, //禁止滑动翻页，
  autoplay: siteAttrs.swiper.autoTurnPage,
  effect: siteAttrs.swiper.effect ? siteAttrs.swiper.effect : 'slideInUp',//slideInUp
  noSwiping: false,
  // fadeEffect: {
  //   crossFade: true,
  // },
  //slide的切换效果，默认为"slide"（位移切换），可设置为'slide'（普通切换、默认）,"fade"（淡入）"cube"（方块）"coverflow"（3d流）"flip"（3d翻转）。
  on: {
    transitionStart: function() {
      // @ts-ignore
      const pageId = this.activeIndex+1
      showPage(pageId)
      EventBus.$emit('showSwiperPage', pageId)
    },
    slideChangeTransitionStart: function() {
      // @ts-ignore
      showPageById(this.activeIndex)
    },
    // transitionEnd: function(){
    // },
    // slideChangeTransitionEnd: function() {
    //   clearAnimates(activeIndex-1);
    // },
  },
  pagination: {
    // @ts-ignore
    el: process.env.NODE_ENV === 'production' ? "" : ".swiper-pagination",
    // @ts-ignore
    clickable: process.env.NODE_ENV === 'production' ? false : true,
  }
}
const OnSlideTo = (pageIndex: number) => {
  if(swiper) {
    swiper.slideTo(pageIndex, 100, false)
  }
}
const showPageById = (pageIndex: number) => {
  const useSite = useSiteStore()
  eventPostAddLoading()
  if(useSite.pageHaveForms[pageIndex]) {
    isFixIosForm()
  }
}
const initSwiper = (Swiper: any) => {
  const swiperDom = document.getElementById('swiper-page')
  if(swiperDom) {
    swiperOption.noSwiping = getIsNoSwiping()
    swiper = new Swiper(swiperDom, swiperOption)
    eventPostAddLoading()
  }
}

const onShowPage = (pageIndex: number) => {
  showPageById(pageIndex)
  OnSlideTo(pageIndex)
}

onMounted(() => {
  initSwiper(window.Swiper)
})
initComp()

// EventBus.$on("communiteComplete", () => {})

onBeforeUnmount(() => {
  EventBus.$off("showPage", onShowPage)
})
</script>


<style lang="scss" scope>
//swiper
@keyframes tipmove {
  0% {
    bottom: var(--size-10);
    opacity: 0;
  }
  50% {
    bottom: var(--size-16);
    opacity: 1;
  }
  100% {
    bottom: var(--size-20);
    opacity: 0;
  }
}
@keyframes start {
  0%,
  30% {
    opacity: 0;
    transform: translate(0, var(--size-10));
  }
  60% {
    opacity: 1;
    transform: translate(0, 0);
  }
  100% {
    opacity: 0;
    transform: translate(0, var(--size--8));
  }
}
.ani-swipe {
  position: fixed;
  z-index: 999;
  animation: start 1.5s infinite ease-in-out;
  left: 46%;
  bottom: 2%;
  width: var(--size-48);
  height: var(--size-36);
}
</style>