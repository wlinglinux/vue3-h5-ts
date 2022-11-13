<template>
  <div class="swiper swiper-container gallery-thumbs" :id="'swiper-'+ item.id">
  <div class="swiper-wrapper">
    <div class="swiper-slide" v-for="(item_,index) in lists" :style="getItemConStyle(item_)" :key="item_.id">
      <img v-show="item_.url" :src="item_.url" :style="itemStyle" ref="img" class="slide-img" @click="onAddDragItem($event.currentTarget, item_,index)">
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { getCompStyle, setNewMarginPadding, getListByItem } from '@/components/utils/'
import { COMMON_WID_HEI, SCROLLBER_TYPE_MAP } from '@/const/'
import { useSiteStore } from '@/store/site'
import { getPxOVwByValue, bgPositionStyle, EventBus } from '@/utils/'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
}>()
const item = props.item
const commonAttr = item.commonAttr
const styles = computed(() => {
  return getCompStyle(item)
})
const useSite = useSiteStore()
const siteInfo = useSite.siteInfo
const lists = computed(() => {
  return getListByItem(item)
})

let swiper: any
let swiperDom: any
let wrapperDom: any
const itemStyle: any = computed(() =>{
  let isBackground = commonAttr.isBackground
  if(isBackground) {
    return {
      borderRadius: "10%",
      width: "inherit",
    }
  } else {
    const styles_ = {
      objectFit: "contain",
      width: getPxOVwByValue(commonAttr.width),
      height: 'auto',
    }
    return styles_
  }
})
const getItemConStyle = (carouselItem: IListItem) => {
  let isBackground = commonAttr.isBackground
  const styles_: any = {
    width: getPxOVwByValue(commonAttr.bgWidth ? commonAttr.bgWidth : commonAttr.width),
    height: 'auto',
  }
  setNewMarginPadding(commonAttr, styles_)
  if(isBackground || !carouselItem.url) {
    return styles_
  } else {
    if(commonAttr.bgUrl) {
      styles_.backgroundImage = 'url(' + commonAttr.bgUrl + ')'
      bgPositionStyle(styles_, 0)
    }
    return styles_
  }
}
const onAddDragItem = (target: any, item_: IListItem, index: number) => {
  const itemEmit = { img: target, url: item_.url, width: 0, height: 0 }
  let isBackground = commonAttr.isBackground
  let wid = target.naturalWidth/COMMON_WID_HEI.adaptiveScale
  let hei = target.naturalHeight/COMMON_WID_HEI.adaptiveScale
  let ratio = _.max([wid/COMMON_WID_HEI.clientWidth, hei/COMMON_WID_HEI.clientHeight])
  if(ratio > 0.5) {
    wid = wid/2
    hei = hei/2
  }
  itemEmit.width = wid
  itemEmit.height = hei

  item.commonAttr.itemIndex = index
  if(isBackground) {
    EventBus.$emit("addImgToCanvasBg", itemEmit)
  } else {
    EventBus.$emit("addImgToCanvas", itemEmit)
  }
}
const initSwiper = (Swiper: any) => {
  const list = getListByItem(item)
  const slidesPerView = commonAttr.slidesPerView > list.length ? list.length : commonAttr.slidesPerView
  const wid = commonAttr.bgWidth ? commonAttr.bgWidth : commonAttr.width
  let spaceBetween = _.parseInt((COMMON_WID_HEI.width - slidesPerView*wid)/slidesPerView)
  if(spaceBetween < 0 || spaceBetween > 10) {
    spaceBetween = 4
  }
  swiper = new Swiper(swiperDom, {
    slidesPerView,
    spaceBetween,
    loop: false,
    freeMode: true,
    watchSlidesVisibility: true,
    watchSlidesProgress: true,
  })
}
const onUpdateSwiper = () => {
  if(swiper){
    swiper.destroy()
    swiper = null
    if(window.Swiper) initSwiper(window.Swiper)
    // resetList()
    // swiper.update(true)
  }
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
  } else {
    EventBus.$on("swiperChangePage", onUpdateSwiper)
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
  } else {
    EventBus.$off("swiperChangePage", onUpdateSwiper)
  }
})
</script>

<style lang="scss">
.gallery-thumbs {
  .swiper-slide {
    display: flex;
    justify-content: center;
    justify-items: center;
  }
}
</style>