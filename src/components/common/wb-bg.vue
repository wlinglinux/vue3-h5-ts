<template>
  <inject-template :item="item" :pageId="pageId" :popId="popId">
    <template v-if="!item.commonAttr.isBlank" v-slot:common>
      <wb-item-bg :item="item" :pageId="pageId" :popId="popId" ref="dom"></wb-item-bg>
    </template>
  </inject-template>
</template>

<script setup lang="ts">
import WbItemBg from '@/components/items/wb-item-bg.vue'
import { useSiteStore } from '@/store/site'
import { getSpritesheetStyle } from '@/components/utils/styles'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
}>()
</script>

<script lang="ts">
export default defineComponent({
  // props: ['item', 'pageId', 'popId'],
  mounted() {
    const useSite = useSiteStore()
    const isH5Edit = useSite.isH5Edit
    const item: IComponent = this.item

    //{"url":"https://static.hd.xxx.com/upload/biz/1/55419451_2562.png","width":64,"height":64,"duration":0,"steps":10,"currentStep":0,"isLoop":false}
    if(!isH5Edit) {
      item.interactionData.vueContainer = this
      const spriteSheetObj: ISpriteSheet = item.interactionData.spriteSheetObj
      if(!item.interactionData.isInGroup && spriteSheetObj) {
        const spriteSheetStyles = getSpritesheetStyle(spriteSheetObj)
        const $el = item.interactionData.vueContainer.$el
        for(let key in spriteSheetStyles) {
          if(spriteSheetStyles[key]) {
            $el.style[key] = spriteSheetStyles[key]
          }
        }
      }
    }
  },
})
</script>