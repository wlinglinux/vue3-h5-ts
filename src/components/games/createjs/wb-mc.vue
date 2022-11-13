<template>
  <inject-template :item="item" :pageId="pageId" :popId="popId" :isPropagation="false">
    <template v-slot:common>
      <div ref="refDom" class="wb-mc" :style="styles" @click.stop>
        <img v-if="commonAttr.defaultPicUrl" :src="commonAttr.defaultPicUrl">
      </div>
    </template>
  </inject-template>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { dynamicsLoadScript } from '@/utils/'
import { getCompStyle } from '@/components/utils/'
import { CANVAS_MC_CLASSNAME_TYPES_MAP, CREATEJS_CONSTS } from '@/const/'
import CreatejsManager from '@/components/games/createjs/CreatejsManager'

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

const refDom = ref<any>(null)
let canvasCon = <any>(null)
onMounted(() => {
  if(refDom.value) {
    canvasCon = refDom.value
    initCreatejs(window.createjs)
  }
})
const initCreatejs = (createjs: any) => {
  if(!createjs || !canvasCon) {
    return
  }
  loadJs(initStage)
}
const loadJs = (cb: Function) => {
if(CANVAS_MC_CLASSNAME_TYPES_MAP[commonAttr.customClassName]) {
  cb()
} else {
  let loadJs = CREATEJS_CONSTS[commonAttr.itemType].className
  if(commonAttr.loadJsUrl) {
    dynamicsLoadScript(commonAttr.loadJsUrl, `${loadJs}`, cb)
  }
}
}

let createjsManager: CreatejsManager
const initStage = () => {
  if(canvasCon && !createjsManager) {
    createjsManager = new CreatejsManager(item)
    createjsManager.init(refDom.value, item)
  }
}

initCreatejs(window.createjs)


onBeforeUnmount(() =>{
  if(createjsManager) {
    createjsManager.destroy()
  }
})

</script>

<style lang="scss">
.wb-mc {
  width: inherit;
  height: inherit;
  background-color: transparent;

  canvas {
    width: inherit;
    height: inherit;
    background-color: transparent;
  }

  img {
    object-fit: contain;
    width: 100%;
  }
}
</style>


