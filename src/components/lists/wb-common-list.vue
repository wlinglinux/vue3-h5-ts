<template>
  <inject-template :item="item" :pageId="pageId" :popId="popId">
    <template v-slot:common>
      <div class="wb-common-list">
        <ul>
          <li v-for="(item_, index) in wbListOrLists" :key="item_.id + '_' + index" :active="index === compItemIndex" @click="onEmitSlideChange($event, index)" :style="itemColumnStyle">
            <component :is="commonAttr.itemType" :item="item" :index="index" :style="itemConStyle"></component>
          </li>
        </ul>
      </div>
    </template>
  </inject-template>
</template>

<script setup lang="ts">
import { getCompStyle, getListItemConStyle, getWbListOrListByItem } from '@/components/utils/'
import { COLUMN_PERCENT } from '@/const/'
import { useSiteStore } from '@/store/site'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
}>()
const item = props.item
const commonAttr = item.commonAttr
const useSite = useSiteStore()
const isH5Edit = useSite.isH5Edit
const styles = computed(() => {
  return getCompStyle(item)
})
const wbListOrLists = computed(() => {
  return getWbListOrListByItem(item)
})
const compItemIndex = computed(() => {
  return commonAttr.itemIndex
})
const itemColumnStyle = computed(() => {
  let styles_ = { width: "100%" }
  if(commonAttr.columnNum > 0) {
    styles_.width = COLUMN_PERCENT[commonAttr.columnNum]
  }
  return styles_
})
const itemConStyle = computed(() => {
  return getListItemConStyle(item)
})
const onEmitSlideChange = (e: Event, index: number) => {
  commonAttr.itemIndex = index
}
</script>

<script lang="ts">
const components = {
  WbItemCommon: defineAsyncComponent(() => import('@/components/items/wb-item-common.vue')),
  WbItemQsdsVote: defineAsyncComponent(() => import('@/components/items/wb-item-qsds-vote.vue')),
}
export default defineComponent({
  components,
})
</script>

<style lang="scss">
.wb-common-list{
  height: inherit;
  display: flex;
  flex-direction: row;
  flex: auto;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  background-size: contain;
  width: inherit;

  .header{
    width: inherit;
    .header-con{
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    img{
      width: 100%;
      object-fit: contain;
    }
  }
  .footer{
    display: flex;
    justify-content: center;
    align-items: center;
    width: inherit;
    img{
      object-fit: contain;
    }
  }
  ul {
    width: inherit;
    li {
      display: inline-block;
      position: relative;
    }
  }
}
</style>