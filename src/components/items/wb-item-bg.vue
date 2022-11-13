<template>
  <div v-if="commonAttr.isTouchmove" :data-id="item.id" class="wb-bg" :style="styles" @touchmove="onTouchMove($event)" @touchend="onTouchEnd($event)"></div>
  <div v-else :data-id="item.id" class="wb-bg" :style="styles"></div>
</template>
<script setup lang="ts">
import { getCompStyle } from '@/components/utils/'
import { EventBus } from '@/utils/'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
}>()
const item = props.item
const commonAttr = item.commonAttr
let touched: boolean = false

const styles = computed(() => {
  const styles_ = getCompStyle(item)
  return styles_
})

const onTouchMove = (e: Event) => {
  e.stopPropagation()
  e.stopImmediatePropagation()
  touched = true
}
const onTouchEnd = (e: Event) => {
  e.stopPropagation()
  e.stopImmediatePropagation()
  if(touched) {
    EventBus.$emit("itemClick", { id: item.id, index: 0 })
  }
  touched = false
}
</script>

<style lang="scss">
.wb-bg {
  width: inherit;
  height: inherit;

  @keyframes mask{
    0% {-webkit-mask-position: 0px 0px;}
    25% {-webkit-mask-position: 619px 0px;}
    50% {-webkit-mask-position: 0px 0px;}
    75% {-webkit-mask-position: 308px 0px; -webkit-mask-size:100%;}
    100% {-webkit-mask-size: 1000%;}
  }

  .mask{
    width: inherit;
    height: inherit;
    animation: mask 5s linear infinite forwards;
  }
}
</style>