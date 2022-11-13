<template>
  <div class="swiper swiper-container vertical-scroll touch-move-wrapper" :id="'swiper-'+ item.id">
    <div class="swiper-wrapper">
      <div class="swiper-slide">
        <ul class="touch-move-con" :style="getTouchMoveStyle">
          <li v-for="(item_, index) in lists" :key="index" :style="getTouchMoveItemStyle(item_.position)">
            <wb-item-scroller :item="item" :qItem="item_" :index="index" :selecteds="selecteds"></wb-item-scroller>
          </li>
        </ul>
        <p :style="styles" class="text">已经没有了哦</p>
      </div>
    </div>
    <div class="swiper-scrollbar"></div>
  </div>
</template>

<script setup lang="ts">
import WbItemScroller from '@/components/items/wb-item-scroller.vue'
import { getCompStyle, getListByItem } from '@/components/utils/'
import { useSiteStore } from '@/store/site'
import { EventBus, getPxOVwByValue } from '@/utils/'

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
const lists = computed(() => {
  return getListByItem(item)
})
let selecteds: number[] = []
let swiper: any
let swiperDom: any
let wrapperDom: any
let scrollCb: number = -1
let isTouchMove: boolean = false
let topOffset: number = 0

const getTouchMoveStyle = computed(() => {
  let ys: number[] = []
  let itemHeight: number = 0
  let arr: string[] = []
  _.forEach(lists.value, (item: ICarouselItem) => {
    arr = item.position.split(',')
    ys.push(_.parseInt(arr[1]))
    itemHeight = _.parseInt(arr[3])
  })
  ys = ys.sort(function(a, b){return a - b})
  return {
    height: getPxOVwByValue(ys[ys.length - 1] + itemHeight)
  }
})
const getTouchMoveItemStyle: any = (positionStr: string) => {
  const position: string[] = positionStr.split(',')
  if(position.length === 4) {
    return {
      left: getPxOVwByValue(_.parseInt(position[0])),
      top: getPxOVwByValue(_.parseInt(position[1])),
      width: getPxOVwByValue(_.parseInt(position[2])),
      height: getPxOVwByValue(_.parseInt(position[3])),
    }
  } else {
    return  {}
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
    on: {
      touchMove: () => {
        window.cancelAnimationFrame(scrollCb)
        isTouchMove = true
      },
      touchEnd: () => {
        let arr = wrapperDom.style.transform.split(',')
        if(arr[1]) {
          topOffset = arr[1].split('px')[0]
        }
        if(isTouchMove) {
          loop()
        }
        isTouchMove = false
      },
    }
  });
  scrollCb = window.requestAnimationFrame(loop)
}
const loop = () => {
  topOffset -= commonAttr.speed || 1
  wrapperDom.style.scrollTop = topOffset
  if(-topOffset >= wrapperDom.scrollHeight - wrapperDom.clientHeight) {
    window.cancelAnimationFrame(scrollCb)
  } else {
    wrapperDom.style.transform = 'translate3d(0px, ' + topOffset + 'px, 0px)'
    scrollCb = window.requestAnimationFrame(loop)
  }
}

const onLoadJsComplete = () => {
  swiperDom = document.getElementById('swiper-'+ item.id)
  wrapperDom = swiperDom.getElementsByClassName('swiper-wrapper')[0]
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
  window.cancelAnimationFrame(scrollCb)
  if(swiper) {
    swiper.destroy()
  }
  if(useSite.isH5Edit) {
    EventBus.$off("loadJsComplete", onLoadJsComplete) 
  }
})
</script>

<style lang="scss">
.touch-move-wrapper {
  .touch-move-con {
    li {
      position: absolute;
      .bubble {
        position: absolute;
        top: 0;
        left: 0;
      }
      img {
        width: 100%;
        object-fit: contain;
      }
    }
  }
  .text {
    text-align: center;
    color: #ffffff;
    font-size: var(--size-12);
  }
  .swiper-scrollbar {
    background-color: transparent;
  }
  .swiper-scrollbar-drag {
    background-color: transparent;
  }
}
</style>