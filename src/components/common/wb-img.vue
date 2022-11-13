<template>
  <inject-template :item="item" :pageId="pageId" :popId="popId">
    <template v-slot:common>
      <div v-if="isRotate3d" :class="getRotateConClass">
        <wb-item-img :item="item" :pageId="pageId" :popId="popId" ref="dom" :classes="getRotateClass"></wb-item-img>
      </div>
      <wb-item-img v-else :item="item" :pageId="pageId" :popId="popId" ref="dom"></wb-item-img>
    </template>
  </inject-template>
</template>

<script setup lang="ts">
import WbItemImg from '@/components/items/wb-item-img.vue'
import { useSiteStore } from '@/store/site'
import { onBeforeUnmount } from 'vue'
import { getCompIdByParam, EventBus } from '@/utils/'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
}>()
const item = props.item
const commonAttr = item.commonAttr
const interactionData = item.interactionData
const useSite = useSiteStore()
const isPlayRotate3d = ref(false)
const isRotate3d = item.events.rotate3d
const getRotateConClass = computed(() => {
  const classes = [{
    'rotate3d': true,
    'wid-hei-inherit': true,
  }]
  return classes
})
const getRotateClass = computed(() => {
  const classes = [{
    'isPlay': isPlayRotate3d.value,
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
      window.clearTimeout(item.interactionData.rotateSetTimeoutCb)
    }
    isPlayRotate3d.value = isPlay
  }
}
const initComp = () => {
  if(useSite.isH5Edit) {
    return
  }
  if(item.events.rotate3d) {
    EventBus.$on("rotate3d", onRotate3d)
  }
}

initComp()

onBeforeUnmount(() => {
  if(useSite.isH5Edit) {
    return
  }
  if(item.events.rotate3d) {
    EventBus.$off("rotate3d", onRotate3d)
    if(item.interactionData.rotateSetTimeoutCb) {
      window.clearTimeout(item.interactionData.rotateSetTimeoutCb)
    }
  }
})
</script>

<script lang="ts">
export default defineComponent({
  // props: ['item', 'pageId', 'popId'],
  mounted() {
    const useSite = useSiteStore()
    if(!useSite.isH5Edit) {
      this.item.interactionData.vueContainer = this
    }
  },
})
</script>

<style lang="scss">
.rotate3d {
  /* 如果要对一个元素进行硬件加速，可以应用以下任何一个 property (并不是需要全部，任意一个就可以)：
  perspective: 1000px;
  backface-visibility: hidden;
  transform: translateZ(0);  */
	/* -webkit-transform: translateX(-50%) translateY(-50%);
	    transform: translateX(-50%) translateY(-50%); */
  -webkit-perspective: 1000px;
  perspective: 1000px;
}
.rotate3d .isPlay {
	/* -webkit-transform: translate3d(0, 0, 0) rotateY(720deg);
  -moz-transform: translate3d(0, 0, 0) rotateY(720deg);
  -ms-transform: translate3d(0, 0, 0) rotateY(720deg);
  transform: translate3d(0, 0, 0) rotateY(720deg); */
  -webkit-animation: rotate-side 2s 1 ease-in-out;
  animation: rotate-side 2s 1 ease-in-out;
}

@-webkit-keyframes rotate-side {
  0% {
    -webkit-transform: rotateY(0deg);
    transform: rotateY(0deg);
  }
  90% {
    -webkit-transform: rotateY(-362deg);
    transform: rotateY(-362deg)
  }
  97%,
  100% {
    -webkit-transform: rotateY(-360deg);
    transform: rotateY(-360deg);
  }
}
@keyframes rotate-side {
  0% {
    -webkit-transform: rotateY(-0deg);
    transform: rotateY(-0deg);
  }
  90% {
    -webkit-transform: rotateY(-362deg);
    transform: rotateY(-362deg);
  }
  97%,
  100% {
    -webkit-transform: rotateY(-360deg);
    transform: rotateY(-360deg);
  }
}
</style>