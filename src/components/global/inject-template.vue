<template>
  <div :class="getInjectClass" ref="injectTemplate" :id="item.id" @click="onTemplateClick($event)">
    <slot name="common"></slot>
  </div>
</template>

<script setup lang="ts">
import EventTemplate from '@/components/events/EventTemplate'
import { useSiteStore } from '@/store/site'
import { EventBus } from '@/utils'
import CssGsapAnimate from '@/components/animate/CssGsapAnimate'

interface Props {
  item: IComponent,
  pageId: number,
  popId: number,
  isPropagation?: boolean,
}
const props = withDefaults(defineProps<Props>(), {
  isPropagation: true
}) 
const item = props.item
const commonAttr = item.commonAttr
const siteStore = useSiteStore()
const isH5Edit = siteStore.isH5Edit
let eventTamplate: EventTemplate

const getInjectClass = computed(() => {
  const classes =  {
    'inject-con': true,
    isHiddenComp: !commonAttr.isVisible,
  }
  // if(commonAttr.customClasses) {
  //   const customClasses = commonAttr.customClasses.split(',')
  //   _.forEach(customClasses, (className: string) => {
  //     classes[className] = true
  //   })
  // }
  return classes
})

const onPlayAnimate = (id: string) => {
  if(item.id == id) {
    if(item.eventShare.cssGsapAnimate) {
      item.eventShare.cssGsapAnimate.onPlayAnimate()
    } else {
      const cssGsapAnimate = new CssGsapAnimate(item)
      cssGsapAnimate.onPlayAnimate()
    }
  }
}
const onTemplateClick = (e: Event) => {
  e.stopPropagation()
  if(isH5Edit) {
    return
  }
  if(props.isPropagation) {
    eventTamplate.onTemplateClick(e)
  }
}
const initComp = () =>{
  if(!isH5Edit) {
    eventTamplate = new EventTemplate(item, props.pageId, props.popId)
  }
}

onMounted(() => {
  if(!isH5Edit) {
    eventTamplate.initCssAnimate()
  }
})

initComp()

watch(
  () => item.active,
  (newVal, oldVal) => {
    if(!(props.pageId == -1 && props.popId == -1)) {
      if(isH5Edit && newVal != oldVal) {
        if(newVal) {
          EventBus.$on("playAnimate", onPlayAnimate)
        } else {
          EventBus.$off("playAnimate", onPlayAnimate)
        }
      }
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if(eventTamplate) {
    eventTamplate.destroy()
  }
})
</script>

<script lang="ts">
export default defineComponent({
  // props: ['item', 'pageId', 'popId'],
  created() {
    this.item.vueInjectContainer = this
  },
});
</script>

<style lang="scss">
.inject-con {
  width: inherit;
  height: inherit;
}
.transform-center {
  transform-origin: center center;
}
</style>