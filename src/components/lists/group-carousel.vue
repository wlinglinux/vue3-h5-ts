<template>
  <div v-if="commonAttr.listType == LIST_TYPE_MAP.commonList" class="group-carousel" :style="styles" :id="item.id">
    <div v-for="(carouselItem, index) in carouselList" :key="carouselItem.id" :active="index === relateCompItemIndex" class="flex-con" :style="scrollItemStyle">
      <group-component :item="carouselItem" :pageId="pageId" :popId="popId"></group-component>
    </div>
  </div>
  <div v-else-if="commonAttr.listType == LIST_TYPE_MAP.relative" class="group-carousel-relative" :id="item.id">
    <template v-for="(carouselItem, index) in carouselList" :key="carouselItem.id" :active="index === relateCompItemIndex">
      <group-component :item="carouselItem" :pageId="pageId" :popId="popId"></group-component>
    </template>
  </div>
  <wb-item-carousel-rotate v-else-if="commonAttr.listType == LIST_TYPE_MAP.rotate" :item="item" :pageId="pageId" :popId="popId" :carouselList="carouselList"></wb-item-carousel-rotate>
  <wb-item-carousel-scroll v-else-if="commonAttr.listType == LIST_TYPE_MAP.scroll" :item="item" :pageId="pageId" :popId="popId" :carouselList="carouselList"></wb-item-carousel-scroll>
  <wb-item-carousel v-else :item="item" :pageId="pageId" :popId="popId" :carouselList="carouselList"></wb-item-carousel>
</template>
<script setup lang="ts">
import WbItemCarousel from '@/components/items/wb-item-carousel.vue'
import WbItemCarouselScroll from '@/components/items/wb-item-carousel-scroll.vue'
import WbItemCarouselRotate from '@/components/items/wb-item-carousel-rotate.vue'
import { getCompStyle, getWbListOrListByItem } from '@/components/utils/'
import { LIST_TYPE_MAP, COMPONENT_TYPES } from '@/const/'
import { getPxOVwByValue, getCompIdByParam } from '@/utils/'
import { useSiteStore } from '@/store/site'
import '@/assets/scss/carousel.scss'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
}>()
const item = props.item
const commonAttr = item.commonAttr
const useSite = useSiteStore()
const isH5Edit = useSite.isH5Edit
const itemList: IComponent[] = []
const styles = computed(() => {
  return getCompStyle(item)
})
const scrollItemStyle = computed(() => {
  return {
    height: getPxOVwByValue(commonAttr.height),
    width: `calc(100% / ${commonAttr.columnNum || 1})`
  }
})
const relateCompItemIndex = computed(() => {
  const relateAttrCompId = getCompIdByParam(commonAttr.relateAttrCompId)
  if(relateAttrCompId) {
    return useSite.componentMap[relateAttrCompId].commonAttr.itemIndex
  } else {
    return commonAttr.itemIndex
  }
})
const carouselList = computed(() => {
  if(isH5Edit) {
    if(itemList.length > 0){
      return itemList
    } else {
      _.forEach(item.components, (compData: IComponent, i: number) => {
        compData.commonAttr.qIndex = i
      })
      let copyItem: IComponent = item
      let wbListOrLists_: any[] = getWbListOrListByItem(item)
      if(!wbListOrLists_) {
        wbListOrLists_ = [{}]
      }
      const itemIndex = item.commonAttr.itemIndex >= 0 ? _.parseInt(item.commonAttr.itemIndex) : 0
      const listLen = item.commonAttr.listLen >=0 ? _.parseInt(item.commonAttr.listLen): 0
      if(itemIndex > 0) {
        wbListOrLists_ =  wbListOrLists_.slice(itemIndex, wbListOrLists_.length)
      }
      if(listLen > 0) {
        wbListOrLists_ =  wbListOrLists_.slice(itemIndex, itemIndex + listLen)
      }
      _.forEach(wbListOrLists_, (item_: any, index: number) => {
        copyItem = _.cloneDeep(item)
        copyItem.cid = COMPONENT_TYPES.group_component
        copyItem.conAttr.height = commonAttr.height
        copyItem.id = item.id + "_" + index
        copyItem.commonAttr.itemIndex = itemIndex + index
        _.forEach(copyItem.components, (compData: IComponent, i: number) => {
          compData.id = compData.id + "_" + index + "_" + i
          compData.commonAttr.qIndex = i
          compData.commonAttr.itemIndex = itemIndex + index

          if(compData.components && compData.components.length > 0) {
            compData.cid = COMPONENT_TYPES.group_component
            _.forEach(compData.components, (compData_: IComponent) => {
              compData_.id = compData_.id + "_" + index + "_" + i
              compData_.commonAttr.qIndex = i;
              compData_.commonAttr.itemIndex = itemIndex + index;
              // componentMap[compData_.id] = compData_;
              // compData_.interactionData.isInGroupCarousel = true;
            })
          }
        })
        copyItem.commonAttr.itemIndex = index
        itemList.push(copyItem)
      })
      return itemList
    }
  } else {
    return item.components
  }
})
</script>

<style lang="scss">
.group-carousel-relative {
  width: inherit;
  height: inherit;
  position: relative;
}
.group-carousel {
  width: inherit;
  height: inherit;
  position: relative;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;

  .flex-con {
    position: relative;
    display: flex;
    flex-direction: column;
  }
  .swiper-slide {
    position: relative;
  }
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