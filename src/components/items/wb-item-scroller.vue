<template>
  <div class="wb-item-scroller">
    <img :src="selectUrl" class="bubble" @click.stop.prevent.self="onClickBubble">
    <img v-if="bubbleUrl" :src="bubbleUrl" class="bubble" :style="getBubbleStyle" @click.stop.prevent.self="onClickBubble">
  </div>
</template>

<script setup lang="ts">
import { useInteractionStore } from '@/store/interaction'
import { isHasOwnProperty, EventBus, getPxOVwByValue } from '@/utils/'
import { getListByItem } from '@/components/utils/'
import { useSiteStore } from '@/store/site'

const props = defineProps<{ 
  item: IComponent,
  qItem: IListItem,
  index: number,
  selecteds: number[],
}>()
const item = props.item
const useSite = useSiteStore()
const commonAttr = item.commonAttr
const useInteraction = useInteractionStore()
const selecteds = props.selecteds
const lists = getListByItem(item)
const qItem = props.qItem
const index = props.index
const selectUrl = ref('')
const bubbleUrl = ref('')
let isSelected: boolean = false

const onClickBubble = () => {
  let isSend = false
  if(!isSelected) {
    isSend = true
    if(!onIsOverRange()) return
    bubbleUrl.value = commonAttr.effectUrl
    window.setTimeout(() => {
      bubbleUrl.value = ''
    }, 500)
    if(qItem.selectUrl) {
      selectUrl.value = qItem.selectUrl
    }
    selecteds.push(index)
    isSelected = true
  } else {
    if(commonAttr.isUnSelect) {
      isSend = true
      initBubble()
    }
  }
  if(isSend) {
    useInteraction.updateFormValueMap({ id: item.id, selecteds: selecteds, lists: lists })
    let num: string | number = selecteds.length
    if(num < 10){
      num = '0' + num
    }
    useInteraction.updateBindData({ key: 'num', value: num })
  }
}
const initBubble = () => {
  selectUrl.value = qItem.url
  if(commonAttr.bubbleUrl) {
    bubbleUrl.value =commonAttr.bubbleUrl.split(',')[0]
  }
  selecteds.splice(selecteds.indexOf(index), 1)
  isSelected = false
}
const onIsOverRange = () => {
  let event =  item.events
  if( event && event.compareInComps){
    let obj = JSON.parse(event.compareInComps.comps[0].attrs.value)
    let max = obj.max
    if(isHasOwnProperty(obj, "max") && selecteds.length >= max){
      EventBus.$emit("itemClick", {id: item.id});
      return false
    }
  }
  return true
}
const getBubbleStyle = computed(() => {
  let bubbles = ''
  if(commonAttr.bubbleUrl) {
    bubbles = commonAttr.bubbleUrl.split(',')
  }
  let style = {}
  if(qItem.selectUrl) {
    style = {
      top: '50%',
      transform: 'translate(-50%,-50%)'
    }
  }
  return {
    width: getPxOVwByValue(_.parseInt(bubbles[1])),
    height: getPxOVwByValue(_.parseInt(bubbles[2])),
    left: '50%',
    transform: 'translateX(-50%)',
    ...style
  }
})
const initComp = () => {
  if(!useSite.isH5Edit) {
    selectUrl.value = qItem.url
    if(commonAttr.bubbleUrl) {
      bubbleUrl.value =commonAttr.bubbleUrl.split(',')[0]
    }
  }
}

initComp()

</script>

<style lang="scss">
.wb-item-scroller {
  height: 100%;
  position: relative;
  .bubble {
    background-size: contain;
  }
}
</style>

