<template>
  <inject-template :item="item" :pageId="pageId" :popId="popId">
    <template v-slot:common>
      <div class="wb-turn-book">
        <div class="flipbook">
          <div v-for="(item, index) in lists" :style="getPageStyle(item)" :key="index"></div>
        </div>
      </div>
    </template>
  </inject-template>
</template>




<script setup lang="ts">
import { RESIZE_TYPE_MAP } from '@/const/'
import { EventBus,  getPxOVwByValue } from '@/utils/'
import { getCompStyle, showPage, getListByItem, showPop } from '@/components/utils/'
import { useSiteStore } from '@/store/site'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
}>()
const item = props.item
const commonAttr = item.commonAttr
const useSite = useSiteStore()
const lists = computed(() => {
  return getListByItem(item)
})
let turnBookCb: number = -1
let flipIndex: number = 0

const styles = computed(() => {
  return getCompStyle(item)
})
const getPageStyle: any = () => {
  let backgroundSize = 'contain'
  if(commonAttr.isFullScreen) {
    let type = commonAttr.resizeType
    if(type == RESIZE_TYPE_MAP.max) {
      backgroundSize = "cover"
    } else if (type == RESIZE_TYPE_MAP.min) {
      backgroundSize = "contain"
    } else {
      backgroundSize = "100% 100%"
    }
  }
  return {
    'background-image': 'url( ' + item.url + ')',
    'background-repeat': 'no-repeat',
    'background-size': backgroundSize,
    }
}
const initTurn = ($: any) =>{
  const wid = getPxOVwByValue(item.conAttr.width * 2)
  const hei = getPxOVwByValue(item.conAttr.height)
  $('.flipbook').turn({
      width: wid,
      height: hei,
      elevation: 50,
      gradients: true,
      acceleration: true,
      // autoCenter: true,
      // display: 'single',
  });
  if(!commonAttr.isManual) {
    window.setTimeout(() => {
      turnBookCb = window.setInterval(() => {
        const lists = getListByItem(item)
        if(flipIndex >= lists.length) {
          window.clearInterval(turnBookCb)
          if(commonAttr.pageId > 0){
            showPage(commonAttr.pageId, item)
          }
          if(commonAttr.popId > 0){
            showPop(commonAttr.popId)
          }
        }
        $(".flipbook1").turn("next")
        flipIndex++
        flipIndex++
      }, 1000)
    }, 500)
  }
}
const onTurnBook = ($: any) => {
  if(commonAttr.isManual && $(".flipbook")) {
    $(".flipbook").turn("next");
  }
}
const initComp = () => {
  if(!useSite.isH5Edit && commonAttr.isManual) {
    EventBus.$off("turnBook", onTurnBook)
    EventBus.$on("turnBook", onTurnBook)
  }
}

initComp()

onMounted(() => {
  if(!useSite.isH5Edit) {
    initTurn(window.$)
  }
})

onBeforeUnmount(() => {
  EventBus.$off("turnBook", onTurnBook)
})
</script>

<style lang="scss">
.wb-turn-book {
  width: inherit;
  height: inherit;
}
.flipbook {
  overflow: hidden;
  left: -100%;
}
</style>