<template>
  <div class="swiper swiper-container vertical-scroll" :id="'swiper-'+ item.id">
    <div class="swiper-wrapper" :style="getSwiperStyle">
      <div class="swiper-slide">
        <ul class="selected-lists">
          <li v-for="(item_, index) in selectedLists" :key="index" :style="getItemStyle(item_.position, item_)">
            <img :src="item_.resultUrl ? item_.resultUrl :item_.url" class="slide-img">
          </li>
        </ul>
      </div>
    </div>
    <div class="swiper-scrollbar"></div>
  </div>
</template>

<script setup lang="ts">
import { getCompStyle } from '@/components/utils/'
import { SCROLLBER_TYPE_MAP } from '@/const/'
import { useSiteStore } from '@/store/site'
import { EventBus, getPxOVwByValue } from '@/utils/'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
  selectedLists: ICarouselItem[],
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

const getSwiperStyle: any = computed(() => {
  if(commonAttr.isVerticalCenter) {
    return {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
    }
  } else {
    return {}
  }
})
const getItemStyle = (positionStr: string, item: ICarouselItem) => {
  let style_ = {}
  if(commonAttr.isVerticalCenter) {
    style_ =  {
      margin: 0
    }
  } else {
    let position: string[] = positionStr.split(',')
    style_ = {
      width: getPxOVwByValue(_.parseInt(position[2])),
      height: getPxOVwByValue(_.parseInt(position[3])),
    }
  }
  return style_
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
.selected-lists {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  padding-bottom: var(--size-24);
  li {
    display: inline-block;
    margin-top: var(--size-12);
    margin-bottom: var(--size-12);
  }
  img {
    width: 100%;
    object-fit: contain;
  }
}
</style>