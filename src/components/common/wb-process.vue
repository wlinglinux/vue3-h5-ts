<template>
  <inject-template :item="item" :pageId="pageId" :popId="popId">
    <template v-slot:common>
      <wb-item-process :item="item" :style="styles"></wb-item-process>
    </template>
  </inject-template>
</template>

<script setup lang="ts">
//:is="item.commonAttr.itemType"
import WbItemProcess from "@/components/items/wb-item-process.vue"
import { getCompStyle } from '@/components/utils/'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
}>()
const item = props.item
const styles = computed(() => {
  return getCompStyle(item)
})
</script>