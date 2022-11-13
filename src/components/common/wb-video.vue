<template>
  <inject-template :item="item" :pageId="pageId" :popId="popId">
    <template v-slot:common>
      <wb-item-video :item="item" :pageId="pageId" :popId="popId" :isRight="false"></wb-item-video>
    </template>
  </inject-template>
</template>

<script setup lang="ts">
import WbItemVideo from '@/components/items/wb-item-video.vue'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
}>()
const item = props.item
const commonAttr = item.commonAttr


// onMounted(() => {
//   initVideoInline(window.enableInlineVideo)
// })
</script>
