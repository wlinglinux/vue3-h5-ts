<template>
  <inject-template :item="item" :pageId="pageId" :popId="popId" :isPropagation="isPropagation">
    <template v-slot:common>
      <wb-item-scroll-list v-if="isHtml2canvas" :item="item" :pageId="pageId" :popId="popId" :selectedLists="selectedLists"></wb-item-scroll-list>
      <div v-else class="wb-scroll-container">
        <template v-if="commonAttr.isVertical">
          <wb-item-scroll-drag v-if="commonAttr.isTouchMove" :item="item" :pageId="pageId" :popId="popId"></wb-item-scroll-drag>
          <wb-item-scroll-bar v-else-if="selectedLists.length > 0" :item="item" :pageId="pageId" :popId="popId" :selectedLists="selectedLists"></wb-item-scroll-bar>
          <wb-item-scroll-vertical v-else :item="item" :pageId="pageId" :popId="popId"></wb-item-scroll-vertical>
        </template>
        <wb-item-scroll-horizontal v-else :item="item" :pageId="pageId" :popId="popId"></wb-item-scroll-horizontal>
      </div>
    </template>
  </inject-template>
</template>

<script setup lang="ts">
import WbItemScrollList from '@/components/items/wb-item-scroll-list.vue'
import WbItemScrollBar from '@/components/items/wb-item-scroll-bar.vue'
import WbItemScrollDrag from '@/components/items/wb-item-scroll-drag.vue'
import WbItemScrollVertical from '@/components/items/wb-item-scroll-vertical.vue'
import WbItemScrollHorizontal from '@/components/items/wb-item-scroll-horizontal.vue'

import { useSiteStore } from '@/store/site'
import { useInteractionStore } from '@/store/interaction'
import { COMPONENT_TYPES } from '@/const/'
import { getCompIdByParam } from '@/utils/'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
}>()
const item = props.item
const commonAttr = item.commonAttr
const useInteraction = useInteractionStore()
const useSite = useSiteStore()
const selectedLists = computed(() => {
  //获取关联组件数据
  const selectedLists_: ICarouselItem[] = []
  const relateAttrCompId = getCompIdByParam(commonAttr.relateAttrCompId)
  if(relateAttrCompId) {
    const relateCompData = useSite.componentMap[relateAttrCompId]
    if(relateCompData.cid == COMPONENT_TYPES.wb_scroll_container || relateCompData.cid == COMPONENT_TYPES.wb_pixis) {
      const lists: ICarouselItem[] = useInteraction.formValueMap[relateAttrCompId] && useInteraction.formValueMap[relateAttrCompId].lists as ICarouselItem[]
      if(lists) {
        //wb-item-scroller updateFormValue
        const selecteds: number[] = useInteraction.formValueMap[relateAttrCompId].selecteds as number[]
        _.forEach(selecteds, (index: number) => {
          selectedLists_.push(lists[index])
        })
      }
    }
  }
  return selectedLists_
})
const isHtml2canvas = computed(() => {
  let isHtml2canvas_ = false
  const cropUrlStr = commonAttr.cropUrls
  if(cropUrlStr) {
    const cropUrls = cropUrlStr.split(',')
    if(cropUrls.length > 0) {
      isHtml2canvas_ = true
    }
  }
  return isHtml2canvas_
})
const isPropagation = computed(() =>{
  return !isHtml2canvas.value && !commonAttr.isVertical
})
const initComp = () => {}
initComp()
onMounted(() => {
  // MenuByBtns
  item.isCreated = true
})
</script>

<style lang="scss" scope>
.wb-scroll-container {
  width: inherit;
  height: inherit;
  position: relative;

  .swiper-container {
    width: 100%;
    height: 100%;
  }
  
  .vertical-scroll {
    .swiper-slide {
      height: auto;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
    }
    .slide-img {
      width: 100%;
      object-fit: contain;
    }
  }
}

</style>