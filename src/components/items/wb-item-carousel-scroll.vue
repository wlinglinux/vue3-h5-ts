<template>
  <div class="group-carousel" :style="styles">
    <div class="swiper swiper-container vertical-scroll" :id="'swiper-' + item.id">
        <div class="swiper-wrapper">
          <div class="swiper-slide">
            <div v-for="(carouselItem) in carouselList" :key="carouselItem.id" class="flex-con" :style="scrollItemStyle">
              <group-component :item="carouselItem" :pageId="pageId" :popId="popId"></group-component>
            </div>
          </div>
        </div>
        <div class="swiper-scrollbar"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCompStyle } from '@/components/utils/'
import { EventBus, getPxOVwByValue } from '@/utils/'
import { useSiteStore } from '@/store/site'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
  carouselList: IComponent[],
}>()
const item = props.item
const useSite = useSiteStore()
const carouselList = props.carouselList
const commonAttr = item.commonAttr
const styles = computed(() => {
  return getCompStyle(item)
})
let swiper: any
let swiperDom: any
const scrollItemStyle = {
  height: getPxOVwByValue(commonAttr.height),
  width: `calc(100% / ${commonAttr.columnNum || 1})`
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