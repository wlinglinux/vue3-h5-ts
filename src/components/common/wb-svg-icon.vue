<template>
  <inject-template :item="item" :pageId="pageId" :popId="popId" :isPropagation="isPropagation">
    <template v-slot:common>
      <canvas v-if="commonAttr.isSvga" ref="svg" class="wb-svg-icon" :style="styles"></canvas>
      <div v-else ref="svg" class="wb-svg-icon" :style="styles"></div>
    </template>
  </inject-template>
</template>

<script setup lang="ts">
//:is="item.commonAttr.itemType"
import { getCompStyle } from '@/components/utils/'
import { useSiteStore } from '@/store/site'
import { dynamicsLoadScript, EventBus} from '@/utils/'
import { SVG_ANIMATE_START_TYPE } from '@/const/'

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
const useSite = useSiteStore()
const isH5Edit = useSite.isH5Edit
let isPropagation = false
let progress:number = 0
let parser :any
let player:any
let vivus: any

const env_ = import.meta.env


const initComp = () =>{
  if(!isH5Edit) {
    if(commonAttr.isSvga) {
      isPropagation = false
      if(!window.SVGA){
        dynamicsLoadScript(env_.VITE_APP_WEB_URL + "js/svg/svga.min.js", "SVGA", initSvga)
      }
    } else {
      if(!window.Vivus){
        dynamicsLoadScript(env_.VITE_APP_WEB_URL + "js/svg/vivus.min.js", "Vivus", initVivus)
      }
      progress = 0
      EventBus.$off("svgPathAnimate", onPlayPathAnimate)
      EventBus.$on("svgPathAnimate", onPlayPathAnimate)
      EventBus.$off("resetVivus", resetVivus)
      EventBus.$on("resetVivus", resetVivus)
      EventBus.$off("setVivusProress", setVivusProress)
      EventBus.$on("setVivusProress", setVivusProress)
      if(commonAttr.isDrag) {
        isPropagation = false
      } else {
        isPropagation = true
      }
    }
  } else {
    EventBus.$on('refreshCommonAttr', onRefreshCommonAttr)
  }
}

async function initSvga(SVGA: any){
  let svg: any =  getCurrentInstance()!.refs.svg
  if(!SVGA || !svg){
    return
  }
  parser = new window.SVGA.Parser()
  const svga = await parser.load(commonAttr.svgaUrl)
  player = new window.SVGA.Player(svg)
  await player.mount(svga)
  player.start()
}

const initVivus = (Vivus: any) =>{
  let svg: any =  getCurrentInstance()!.refs.svg
  if(!Vivus || !svg || !commonAttr.url){
    return
  }
  if(vivus){
    vivus.stop().destroy()
  }
  if(svg) svg.innerHTML = ''
  // commonAttr.start = "inViewport"
  //play(speed, callback) stop() reset() finish() setFrameProgress(progress) getStatus() destroy()
  let strokeWidth = commonAttr.strokeWidth + 'px'
  let strokeColor = commonAttr.color
  vivus = new window.Vivus(svg, {
    duration: commonAttr.duration,
    file: commonAttr.url,
    type: commonAttr.type,//delayed, sync, oneByOne, script, scenario or scenario-sync
    start: commonAttr.start,//inViewport manual autostart
    delay: commonAttr.delay,
    pathTimingFunction: Vivus[commonAttr.pathTimingFunction],//LINEAR EASE EASE_OUT EASE_IN EASE_OUT_BOUNCE
    animTimingFunction: Vivus[commonAttr.animTimingFunction],
    dashGap: commonAttr.dashGap,
    forceRender: true,
    reverseStack: commonAttr.reverseStack,
    selfDestroy: true,
    onReady: function (vivus) {
      // vivus.el.setAttribute('height', 'auto')
      const path = vivus.el.getElementsByTagName('path')[0]
      path.style['stroke-width'] = strokeWidth
      path.style['stroke'] = strokeColor
      vivus.el.style.setProperty(`--stroke-width`, strokeWidth)
      vivus.el.style.setProperty(`--stroke-color`, strokeColor)
      if(commonAttr.start == SVG_ANIMATE_START_TYPE[0].value){
        vivus.stop()
      }
    }
  }, () => {
    console.log("动画播放完成！")
  })
}

const onPlayPathAnimate = ()=>{
  if(vivus){
    vivus.reset()
    vivus.play()
  }
  //svgAnimateIndex
  // http://lmgonzalves.github.io/segment/
  // const aimatePencents = commonAttr.animatePercents.split(',')
  // if(aimatePencents[svgAnimateIndex]){
  //   const percent = aimatePencents[svgAnimateIndex]
  //   const svgCon = this.$refs.svg
  //   const svgPath = svgCon.getElementsByTagName('path')[0]
  //   const segment = new window.Segment(svgPath)
  //   segment.draw("0", percent, 5, {easing: window.d3['easeCubicOut']})
  // }
}

const resetVivus = () =>{
  if(vivus) vivus.reset()
}


const setVivusProress = (progressData) => {
  if(vivus && progressData > progress) vivus.setFrameProgress(progressData)
  progress = progressData
}

const onRefreshCommonAttr = (id: string) => { 
  if(item.id != id) {
    return
  }
  initVivus(window.Vivus)
}

initComp()

onMounted(()=>{
  if(commonAttr.isSvga) {
    initSvga(window.SVGA)
  } else {
    initVivus(window.Vivus)
  }
})

onBeforeUnmount(()=>{
  if(isH5Edit) {
    EventBus.$off('refreshCommonAttr', onRefreshCommonAttr)
  }
  EventBus.$off("svgPathAnimate", onPlayPathAnimate)
  EventBus.$off("resetVivus", resetVivus)
  EventBus.$off("setVivusProress", setVivusProress)

  if(vivus) {
    vivus.destroy()
    vivus = null
  }
  if(parser) {
    parser.destroy()
    player.destroy()
  }
})

</script>

<style lang="scss" scoped>
.wb-svg-icon {
  --stroke-width: var(--size-36);
  --stroke-color: #f98747;
  width: inherit;
  height: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
}
svg {
  width: 100%;
  stroke-width: var(--stroke-width);
  stroke-linecap: round;
  stroke-linejoin: round;
  fill-rule: evenodd;
}
svg * {
  fill: none;
  stroke: var(--stroke-color);
}
</style>
