<template>
  <div class="swiper swiper-container vertical-scroll scroller-img-text-con" :id="'swiper-'+ item.id">
    <div class="swiper-wrapper">
      <div class="swiper-slide">
        <img v-if="commonAttr.url" :src="commonAttr.url" class="slide-img" :style="conImgStyle">
        <div v-else-if="commonAttr.innerHtml" v-html="innerHtml" :style="styles"></div>
      </div>
    </div>
    <div class="swiper-scrollbar"></div>
  </div>
</template>

<script setup lang="ts">
import { getCompStyle, setNewMarginPadding } from '@/components/utils/'
import { SCROLLBER_TYPE_MAP } from '@/const/'
import { useSiteStore } from '@/store/site'
import { EventBus } from '@/utils'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
}>()
const item = props.item
const useSite = useSiteStore()
const commonAttr = item.commonAttr
const styles = computed(() => {
  return getCompStyle(item)
})
let swiper: any
let swiperDom: any
let wrapperDom: any

const conImgStyle = computed(() => {
  const styles_ = {}
  setNewMarginPadding(commonAttr, styles_)
  return styles_
})
const innerHtml = computed(() => {
  let html = commonAttr.innerHtml
  html = html.replace(/《/g, "<")
  html = html.replace(/》/g, ">")
  return html
})

const loadInitSwiper = (Swiper: any) => {
  if(commonAttr.url) {
    let img = new Image()
    img.onload = () => {
      initSwiper(Swiper)
    }
    img.src = commonAttr.url
  } else {
    initSwiper(Swiper)
  }
}
const initSwiper = (Swiper: any) => {
  swiper = new Swiper(swiperDom, {
    direction: 'vertical',
    slidesPerView: 'auto',
    freeMode: true,
    scrollbar: {
      el: swiperDom.getElementsByClassName('swiper-scrollbar')[0],
    },
    mousewheel: true,
  })
}

const onLoadJsComplete = () => {
  swiperDom = document.getElementById('swiper-'+ item.id)
  wrapperDom = swiperDom.getElementsByClassName('swiper-wrapper')[0]
  swiperDom.style.setProperty(`--swiper-scrollbar-drag-bgcolor`, SCROLLBER_TYPE_MAP[commonAttr.scrollbarType])
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

<style lang="scss">
.scroller-img-text-con {
  .swiper-scrollbar-drag {
    background-color: var(--swiper-scrollbar-drag-bgcolor);
    opacity: 0.8;
  }
}
</style>