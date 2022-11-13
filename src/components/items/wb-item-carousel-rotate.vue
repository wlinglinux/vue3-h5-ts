<template>
  <div class="group-carousel" :style="styles" :class="getRotateConClass">
    <group-component :item="item" :pageId="pageId" :popId="popId" :class="getRotateClass">></group-component>
  </div>
</template>

<script setup lang="ts">
import { useSiteStore } from '@/store/site'
import { onBeforeUnmount } from 'vue'
import { getCompIdByParam, EventBus } from '@/utils/'
import { getCompStyle } from '@/components/utils/'

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

const interactionData = item.interactionData
const useSite = useSiteStore()
const isPlayRotate3d = ref(false)
let isSelected: boolean = false
const isRotate3d = item.events.rotate3d ? true : false
const getRotateConClass = computed(() => {
  let classes = [{
    'rotate3d': isRotate3d,
    'wid-hei-inherit': true,
  }]
  return classes
})
const getRotateClass = computed(() => {
  let classes = [{
    'isPlay': isPlayRotate3d,
    'wid-hei-inherit': true,
    'transform-center': true
  }]
  return classes
})

const onRotate3d = ({isPlay, id}: {isPlay: boolean, id: string}) => {
  if(id) {
    if(item.id == id) {
      isPlayRotate3d.value = isPlay
    }
  } else {
    if(item.interactionData.rotateSetTimeoutCb) {
      window.clearTimeout(item.interactionData.rotateSetTimeoutCb);
    }
    isPlayRotate3d.value = isPlay
  }
}

if(item.events.rotate3d) {
  EventBus.$on("rotate3d", onRotate3d)
}

//methods
const onSelected = () => {
  interactionData.isSelected = isSelected = !isSelected
  if(commonAttr.relateEventCompId) {
    const relateEventCompId = getCompIdByParam(commonAttr.relateEventCompId)
    const relatCompData = useSite.componentMap[relateEventCompId]
    relatCompData.interactionData.isSelected = interactionData.isSelected
  }
}

onBeforeUnmount(() => {
  if(item.events.rotate3d){
    EventBus.$off("rotate3d", onRotate3d)
    if(item.interactionData.rotateSetTimeoutCb){
      window.clearTimeout(item.interactionData.rotateSetTimeoutCb)
    }
  }
})
</script>