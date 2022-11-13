<template>
  <inject-template :item="item" :pageId="pageId" :popId="popId" :isPropagation="false">
    <template v-slot:common>
      <div v-if="commonAttr.isOtherBtnTrigger" class="wb-imgs" :style="styles">
        <ul class="swiper-list">
          <li v-for="(item_, index) in lists_" :key="index" class="swiper-li">
            <img :src="item_.url" />
          </li>
        </ul>
      </div>
      <div v-else class="wb-imgs" :style="styles">
        <div class="swiper swiper-container" :id="'swiper-' + item.id">
          <div class="swiper-wrapper">
            <div class="swiper-slide" v-for="(item_, index) in lists_" :key="index" :style="getSlideHeight">
              <a v-if="isH5Edit" :href="getLink(item_)" class="wid-hei-inherit">
                <img :src="item_.url">
              </a>
              <a v-else :href="getLink(item_)" class="wid-hei-inherit">
                <img :data-src="item_.url" class="swiper-lazy">
                <div class="swiper-lazy-preloader swiper-lazy-preloader-white"></div>
              </a>
            </div>
          </div>
          <div @click.stop v-if="item.commonAttr.paginationType == PAGINATION_TYPE[1].value" class="swiper-pagination" :class="getPaginationClass"></div>
          <template v-else-if="item.commonAttr.paginationType == PAGINATION_TYPE[2].value">
            <div @click.stop :id="item.id + '-prev'" class="swiper-button-prev" :style="getSwiperPreStyle(commonAttr)"></div>
            <div @click.stop :id="item.id + '-next'" class="swiper-button-next" :style="getSwiperNextStyle(commonAttr)"></div>
          </template>
          <template v-else-if="item.commonAttr.paginationType == PAGINATION_TYPE[3].value">
            <div @click.stop :id="item.id + '-pagination'" class="swiper-pagination" :class="getPaginationClass"></div>
            <div @click.stop :id="item.id + '-prev'" class="swiper-button-prev" :style="getSwiperPreStyle(commonAttr)"></div>
            <div @click.stop :id="item.id + '-next'" class="swiper-button-next" :style="getSwiperNextStyle(commonAttr)"></div>
          </template>
        </div>
      </div>
    </template>
  </inject-template>
</template>


<script setup lang="ts">
import { isJSON, getPxOVwByValue, EventBus, addClass, removeClass } from '@/utils/'
import { CAROUSEL_TYPES_MAP, PAGINATION_TYPE } from '@/const/'
import { getCompStyle, getListByItem, getSwiperPreStyle, getSwiperNextStyle, getLink } from '@/components/utils/'
import { useSiteStore } from '@/store/site'
import { useInteractionStore } from '@/store/interaction'
import '@/assets/scss/carousel.scss'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
}>()
const item = props.item
const pageId = props.pageId
const commonAttr = item.commonAttr
const useSite = useSiteStore()
const useInteraction = useInteractionStore()
const isH5Edit = useSite.isH5Edit
const styles = computed(() => {
  return getCompStyle(item)
})
const lists_ = computed(() => {
  return getListByItem(item)
})
const getSlideHeight = computed(() => {
  return { height: getPxOVwByValue(item.conAttr.height) }
})
// const lists = getListByItem(item)
let swiperIndex = 0
let swiper: any
let swiperDom: any
const getPaginationClass = computed(() => {
  let classObj = {}
  classObj[commonAttr.paginationColorType] = true
  return classObj
})
const getSwiperOption = () => {
  let slideNum = 1
  if(commonAttr.carouselType ==  CAROUSEL_TYPES_MAP.slidesPerView && commonAttr.slideNum) {
    slideNum = commonAttr.slideNum
  }
  return {
    updateOnWindowResize: true,
    preloadImages: true,//默认为true，Swiper会强制加载所有图片。
    runCallbacksOnInit: true,//slideChangeTransitionStart
    watchOverflow: true,//当没有足够的slide切换时，例如只有1个slide，swiper会失效且隐藏导航等。默认不开启这个功能。
    preventInteractionOnTransition: true,
    observer: true,
    noSwiping: false,
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
    }
  }
  if(commonAttr.effect) {
    swiperOption.effect = commonAttr.effect
    if(commonAttr.paginationType > PAGINATION_TYPE[0].value) {
      let elPagination = swiperDom.getElementsByClassName('swiper-pagination')[0]
      swiperOption.pagination = {
        el: elPagination,
        clickable: true,
      };
    }

    if(commonAttr.effect == "coverflow"){
      swiperOption.slidesPerView = 3;
      let coverflowEffect = {
        rotate: 30,
        stretch: 0,
        depth: 80,
        modifier: 1,
        slideShadows : true,
      };
      if(commonAttr.effectParams && isJSON(commonAttr.effectParams)) {
        _.merge(coverflowEffect, JSON.parse(commonAttr.effectParams))
      }
      swiperOption.coverflowEffect = coverflowEffect
    }
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
const slideNext = () => {
  const lists = getListByItem(item)
  if(commonAttr.isOtherBtnTrigger) {
    const pageId_ = 'page-' + pageId
    const currentPageDom = document.getElementById(pageId_)
    if(currentPageDom) {
      const lis = currentPageDom.getElementsByClassName("swiper-li")
      swiperIndex++;
      if(swiperIndex >= lists.length) {
        swiperIndex = lists.length - 1
      }
      swiperIndex = swiperIndex%lists.length
      useInteraction.updateInteractionData({ swiperIndex: swiperIndex })
      _.forEach(lis, (li: any, index: number) => {
        if(index == swiperIndex) {
          li.style.display = "block"
          addClass(li, "animate__fadeIn")
          addClass(li, "animate__animated")
        }else{
          li.style.display = "none"
          removeClass(li, "animate__fadeIn")
          removeClass(li, "animate__animated")
        }
      })
    }
  } else {
    if(swiper) {
      const len = lists.length
      useInteraction.updateInteractionData({ swiperIndex: swiper.activeIndex%len })
      if(swiper.activeIndex < len) {
        swiper.slideNext();
        //处理 事件 clickCompIdMap
      }
    }
  }
}
const slidePre = () => {
  const lists = getListByItem(item)
  if(commonAttr.isOtherBtnTrigger) {
    const pageId_ = 'page-' + pageId
    const currentPageDom = document.getElementById(pageId_)
    if(currentPageDom) {
      const lis = currentPageDom.getElementsByClassName("swiper-li")
      swiperIndex--
      if(swiperIndex < 0) {
        swiperIndex = 0
      }
      swiperIndex = swiperIndex%lists.length
      useInteraction.updateInteractionData({ swiperIndex: swiperIndex })
      _.forEach(lis, (li: any, index: number) => {
        if(index == swiperIndex) {
          li.style.display = "block"
          addClass(li, "animate__fadeIn")
          addClass(li, "animate__animated")
        } else {
          li.style.display = "none"
          removeClass(li, "animate__fadeIn")
          removeClass(li, "animate__animated")
        }
      })
    }
  } else {
    if(swiper) {
      const len = lists.length
      useInteraction.updateInteractionData({ swiperIndex: swiper.activeIndex%len })
      swiper.slideNext()
    }
  }
}
const onLoadJsComplete = () => {
  swiperDom = document.getElementById('swiper-'+ item.id)
  if(window.Swiper) initSwiper(window.Swiper)
}
const initComp = () => {
  if(isH5Edit){
    EventBus.$on("loadJsComplete", onLoadJsComplete)
  } else {
    EventBus.$on("swiperChangePage", slideNext)
    EventBus.$on("swiperPre", slidePre)
    EventBus.$on("swiperNext", slideNext)
  }
}
initComp()

onMounted(() => {
  if(!isH5Edit) {
    if(commonAttr.isOtherBtnTrigger) {
      slideNext()
    } else {
      onLoadJsComplete()
    }
  }
})

onBeforeUnmount(() => {
  if(swiper) {
    swiper.destroy()
  }
  if(isH5Edit){
    EventBus.$off("loadJsComplete", onLoadJsComplete)
  } else {
    EventBus.$off("swiperChangePage", slideNext)
    EventBus.$off("swiperPre", slidePre)
    EventBus.$off("swiperNext", slideNext)
  }
})
</script>

<style lang="scss">
.wb-imgs, .swiper-list {
  width: inherit;
  height: inherit;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  li {
    position: absolute;
    top: 0;
    left: 0;
  }
  .swiper-3d .swiper-slide-shadow-left, .swiper-3d .swiper-slide-shadow-right{
    background-image: none;
  }
}
</style>
