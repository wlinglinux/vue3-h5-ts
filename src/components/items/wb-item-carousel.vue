<template>
  <div class="group-carousel" :style="styles">
    <div class="swiper swiper-container swiper-container-h" :id="'swiper-' + item.id">
      <div class="swiper-wrapper">
        <div class="swiper-slide" :class="{'swiper-no-swiping': isNoSwiping}" v-for="(carouselItem) in carouselList" :key="carouselItem.id">
          <group-component :item="carouselItem" :pageId="pageId" :popId="popId" class="wid-hei-inherit"></group-component>
        </div>
      </div>
      <div @click.stop v-if="item.commonAttr.paginationType == PAGINATION_TYPE[1].value" class="swiper-pagination" :class="getPaginationClass"></div>
      <template v-else-if="item.commonAttr.paginationType == PAGINATION_TYPE[2].value">
        <div @click.stop :id="item.id + '-prev'" class="swiper-button-prev" :style="getSwiperPreStyle"></div>
        <div @click.stop :id="item.id + '-next'" class="swiper-button-next" :style="getSwiperNextStyle"></div>
      </template>
      <template v-if="item.commonAttr.paginationType == PAGINATION_TYPE[3].value">
        <div @click.stop :id="item.id + '-pagination'" class="swiper-pagination" :class="getPaginationClass"></div>
        <div @click.stop :id="item.id + '-prev'" class="swiper-button-prev" :style="getSwiperPreStyle"></div>
        <div @click.stop :id="item.id + '-next'" class="swiper-button-next" :style="getSwiperNextStyle"></div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EventBus, getPxOVwByValue, isHasOwnProperty } from '@/utils/'
import { CAROUSEL_TYPES_MAP, PAGINATION_TYPE, COMPONENT_TYPES } from '@/const/'
import { getCompStyle, getSwiperPreStyle, getSwiperNextStyle } from '@/components/utils/'
import { useSiteStore } from '@/store/site'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
  carouselList: IComponent[],
}>()
const item = props.item
const carouselList = props.carouselList
const commonAttr = item.commonAttr
const useSite = useSiteStore()
const isH5Edit = useSite.isH5Edit
const styles = computed(() => {
  return getCompStyle(item)
})
let swiper: any
let swiperDom: any
const getPaginationClass = computed(() => {
  let classObj = {}
  classObj[commonAttr.paginationColorType] = true
  return classObj
})
const scrollItemStyle = {
  height: getPxOVwByValue(commonAttr.height),
  width: `calc(100% / ${commonAttr.columnNum || 1})`
}
const isNoSwiping = computed(() => {
  return commonAttr.isNoSwiping
})
const getSwiperOption = () => {
  let slideNum = 1
  if(commonAttr.carouselType ==  CAROUSEL_TYPES_MAP.slidesPerView && commonAttr.slideNum){
    slideNum = commonAttr.slideNum
  }
  return {
    updateOnWindowResize: true,
    preloadImages: false,//默认为true，Swiper会强制加载所有图片。
    runCallbacksOnInit: true,//slideChangeTransitionStart
    watchOverflow: true,//当没有足够的slide切换时，例如只有1个slide，swiper会失效且隐藏导航等。默认不开启这个功能。
    preventInteractionOnTransition: true,
    observer: true,
    noSwiping: commonAttr.isNoSwiping,
    loop: commonAttr.isLoop,//影响点击事件，不能加这个
    lazy: {
      loadPrevNext: true,
    },
    autoplay: !isH5Edit && commonAttr.autoTurnPage ? {
      delay: commonAttr.turnPageTime*1000,
      disableOnInteraction: true,
    } : false,
    slidesPerView: slideNum,
    spaceBetween: commonAttr.slideSpace ? commonAttr.slideSpace : 20,
    freeMode: commonAttr.isFreeMode ? true : false,
    centeredSlides: true,
    initialSlide: commonAttr.initialSlide ? commonAttr.initialSlide : 0,//默认第三页
    on: {
      slideChangeTransitionEnd: function(e: any) {
        // @ts-ignore
        onEmitSlideChange(e, this.activeIndex)
      },
    },
  }
}
const onEmitSlideChange = (e: any, itemIndex: number) => {
  commonAttr.itemIndex = itemIndex

  // if(e && !commonAttr.autoTurnPage){
  //   const jumpUrl = jumpUrl_ + itemIndex
  //   const comType = "click"
  //   const wModule = "jump"
  //   onPostStatics({ item, e, comType, wModule, jumpUrl, params: '', apiUri: '' })
  // }
}
const initSwiper = (Swiper: any) => {
  const swiperOption: any = getSwiperOption()
  if(commonAttr.paginationType == PAGINATION_TYPE[2].value || commonAttr.paginationType == PAGINATION_TYPE[3].value) {
    const prevEl = document.getElementById(item.id + '-prev')
    const nextEl = document.getElementById(item.id + '-next')
    swiperOption.navigation = {
      prevEl: prevEl,
      nextEl: nextEl,
    };
  }
  swiper = new Swiper(swiperDom, swiperOption)
  carouselDot()
}
const carouselDot = () => {
  const widHei = getPxOVwByValue(20)
  const bullets = swiperDom.getElementsByClassName("swiper-pagination-bullet")
  _.forEach(bullets, (bullet: any) => {
    bullet.style.width = widHei
    bullet.style.height = widHei
  })
}
const onLoadJsComplete = () => {
  swiperDom = document.getElementById('swiper-'+ item.id)
  if(window.Swiper) initSwiper(window.Swiper)
}
const initComp = () => {
  if(useSite.isH5Edit) {
    EventBus.$on("loadJsComplete", onLoadJsComplete)
  }
}
initComp()

onMounted(() => {
  if(!useSite.isH5Edit) {
    onLoadJsComplete()
  }
})

onBeforeUnmount(() => {
  if(swiper) {
    swiper.destroy()
  }
  if(useSite.isH5Edit) {
    EventBus.$off("loadJsComplete", onLoadJsComplete)
  }
})
</script>