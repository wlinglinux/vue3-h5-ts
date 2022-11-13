<template>
  <div class="wb-process-bar" :style="itemStyle_">
    <div class="wb-bar-con" :style="processBorderStyle_" @click.stop>
      <img v-if="commonAttr.barUrl" class="mask-bar" :style="maskStyle" :src="commonAttr.barUrl">
      <span class="wb-bar" :style="barStyle">
        <span v-if="commonAttr.isDisplayPercent" class="marker" :style="markerStyle" v-html="percentInfo"></span>
        <img class="maker-bar-point" v-if="commonAttr.barPointUrl" :src="getBarPointUrl(commonAttr.barPointUrl)" :style="markerPointStyle">
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCompStyle, itemStyle, processBorderStyle, convertCss, showPage, setNewPadding } from '@/components/utils/'
import { CONTROL_TYPES } from '@/const'
import { useControlsStore } from '@/store/controls'
import { useInteractionStore } from '@/store/interaction'
import { useSiteStore } from '@/store/site'
import { getPxOVwByValue, EventBus, getCompIdByParam, isJSON, isHasOwnProperty } from '@/utils/'

const props = defineProps<{ 
  item: IComponent,
}>()
const item = props.item
const commonAttr = item.commonAttr
const useSite = useSiteStore()
const useInteraction = useInteractionStore()
const siteInfo = useSite.siteInfo
const useControls = useControlsStore()
const isH5Edit = useSite.isH5Edit
const percent = ref(0)
let isDelayTimeComplate = false
let isOpen = true
const styles = computed(() => {
  return getCompStyle(item)
})
const itemStyle_ = computed(() =>{
  return itemStyle(item)
})
const processBorderStyle_ = computed(() => {
  return processBorderStyle(item)
})
const maskStyle = computed(() => {
  return {
    'clip-path': 'inset(0 '+ (100-percent.value)+'% 0 0)',
    '-webkit-clip-path': 'inset(0 '+ (100-percent.value)+'% 0 0)',
  }
})
const barStyle = computed(() => {
  const commonAttr = item.commonAttr
  const style_: any = {
    width: percent.value + "%",
    borderRadius: getPxOVwByValue(commonAttr.borderRadius)
  }
  if(commonAttr.barUrl && commonAttr.barUrl.length > 0) {
    // style_.backgroundImage = 'url(' + commonAttr.barUrl + ')'
  } else {
    style_.backgroundColor = commonAttr.barColor
  }
  return style_
})
const markerStyle = computed(() => {
  const commonAttr = item.commonAttr
  const style_: any = {
    textShadow: convertCss('0 0 4px ' + commonAttr.textShadowColor + ', -0 -0 2px ' + commonAttr.textShadowColor + ''),
  }
  setNewPadding(commonAttr, style_)
  if(commonAttr.percentStyle) {
    let styles = commonAttr.percentStyle.split(",")
    if(styles[1]) {
      _.merge(style_, {
        top: getPxOVwByValue(styles[0]),
        width: getPxOVwByValue(styles[1]),
        height: getPxOVwByValue(styles[2]),
        backgroundColor: styles[3],
        borderRadius: getPxOVwByValue(styles[4]),
        left: getPxOVwByValue(styles[5]),
      })
    } else {
      style_.top = getPxOVwByValue(styles[0])
    }
  }
  return  style_
})
const markerPointStyle: any = computed(() => {
  const commonAttr = item.commonAttr
  if(commonAttr.barPointUrl) {
    const styles = commonAttr.barPointUrl.split(",")
    let wid = styles[1] ? styles[1] : 54
    wid = _.parseInt(wid)
    let hei = styles[2] ? styles[2] : 54
    hei = _.parseInt(hei)
    let top = styles[3] ? styles[3] : -12
    top = _.parseInt(top)
    let percent_: number = percent.value/100 > 1 ? 1 : percent.value/100
    percent_ = percent_ < 0 ? 0 : percent_
    let left = 0
    let barPercent = wid/item.conAttr.width
    if(percent_ > barPercent) {
      left = _.parseInt(percent_ * item.conAttr.width)
    }
    if(percent_ >= 1) {
      left = _.parseInt(percent_ * item.conAttr.width - wid)
    }
    if(styles[4]) {
      left +=  _.parseInt(styles[4])
    }
    left = left < 0 ? 0 : left
    return {
      position: "absolute",
      width: getPxOVwByValue(wid),
      height: getPxOVwByValue(hei),
      top: getPxOVwByValue(top),
      left: getPxOVwByValue(left),
    }
  } else {
    return {
      position: "absolute",
      width: getPxOVwByValue(50),
      height: getPxOVwByValue(50),
      top: 0,
      left: 0,
    }
  }
})
const getBarPointUrl = (url: string) => {
  return url.split(',')[0]
}
const percentInfo = computed(() => {
  //是list或者data
  let str = ''
  if(commonAttr.percentStr.indexOf('%') != -1) {
    str = commonAttr.percentStr.replace("$num$", percent.value)
  } else {
    const useControls = useControlsStore()
    const numberControlData =  useControls.controls[item.id][CONTROL_TYPES.wb_number].data as INumberControl
    let num: string | number = numberControlData.num
    //千位分隔符
    if(commonAttr.isSeparator) {
      // '10000000000'.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      num = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
    str = commonAttr.percentStr.replace("$num$", num)
  }
  return str
})
const onIntervalAssetsProcess = (process: number) => {
  percent.value = process
  loadComplete()
}
const onLoadAssetsProcess = (process: number) => {
  percent.value = Math.trunc(process)
  loadComplete()
}
const getInteractionPercent = (currentNum: number, processes: Object, keyTotals: number) => {
  let percent_ = 0
  let index = 0
  for(let total_ in processes) {
    percent_  = processes[total_]
    if(currentNum >= _.parseInt(total_) && currentNum < keyTotals[index+1]){
      return percent_
    }
    index++
  }
  return percent_
}
const onRefreshNumber = () => {
  let percent_ = 0
  let interactionEvent = item.events.interactionData
  const compId = getCompIdByParam(commonAttr.relateAttrCompId) || item.id
  const compData = useSite.componentMap[compId]
  if(compData && compData.events.interactionData) {
    interactionEvent = compData.events.interactionData
  }
  const baseControl = useControls.controls[compData.id]
  const numberControlData = baseControl && baseControl[CONTROL_TYPES.wb_number] && baseControl[CONTROL_TYPES.wb_number].data as INumberControl
  if(interactionEvent) {
    //自定义进度信息
    const interactionStr = interactionEvent.comps[0].attrs.value
    if(isJSON(interactionStr)){
      const interactionObj = JSON.parse(interactionStr)
      if(isHasOwnProperty(interactionObj, 'customKey')) {
        if(interactionObj.customKey == "generalTotal") {
          // 1743 为地球抗老 {"process":{"0":"10","1106":"30","1992":"55","5000":"76","11060":"100","1000000":100},"custom":"generalTotal"}
          const customKey = interactionObj.customKey//generalTotal
          const processes = interactionObj.process//{"1106":"25%"}

          let keyTotals = _.keys(processes)
          percent_ = getInteractionPercent(useInteraction.bindData[customKey], processes, keyTotals)
        }
      } else if(isHasOwnProperty(interactionObj, 'pk')) {
        if(numberControlData) {
          percent_ = numberControlData.process ? numberControlData.process : 0
        }
      } else if(isHasOwnProperty(interactionObj, 'compId')){
          // 2480 问候地球 {"process":{"0":"10","1106":"30","1992":"55","5000":"76","11060":"100","1000000":100},"compId":"4b799358-91b7-4131-93cd-d0ab02deb861"}
        const processes = interactionObj.process//{"1106":"25%"}
        let keyTotals = _.keys(processes)
        percent_ = getInteractionPercent(numberControlData.num, processes, keyTotals)
      }
    }
  } else if(numberControlData) {
    let total = 100
    if(numberControlData.total > 0) {
      total = _.parseInt(numberControlData.total)
    }
    percent_ = Math.round(numberControlData.num/total * 100)
  }
  percent.value = percent_ > 100 ? 100 : percent_
}
const loadComplete = () => {
  if(percent.value >= 100 && commonAttr.pageId && isDelayTimeComplate && isOpen) {
    isOpen = false
    showPage(commonAttr.pageId, item)
  }
}
const initComp = () => {
  if(isH5Edit || commonAttr.groupInjectClassName) {
    if(isH5Edit){
      //啥也不做
    } else {
      EventBus.$off("clickAddProcess", onIntervalAssetsProcess)
      EventBus.$on("clickAddProcess", onIntervalAssetsProcess)
    }
  } else {
    if(commonAttr.isLoadAssets) {
      EventBus.$off("loadAssetsProcess", onLoadAssetsProcess)
      EventBus.$on("loadAssetsProcess", onLoadAssetsProcess)
    }
    const compId = getCompIdByParam(commonAttr.relateAttrCompId) || item.id
    const compData = useSite.componentMap[compId]
    const numberControlData = useControls.controls[compData.id] && useControls.controls[compData.id][CONTROL_TYPES.wb_number]
    const interactionEvent = compData.events.interactionData
    if(numberControlData || interactionEvent) {
      EventBus.$off("refreshDynamicData", onRefreshNumber)
      EventBus.$on("refreshDynamicData", onRefreshNumber)
    }
    onRefreshNumber()
  }
}
onMounted(() => {
  window.setTimeout(() => {
    isDelayTimeComplate = true
    //素材在这个组件还没有初始化化就已经加载完了
    if(siteInfo.isLoadAssetsCompleteNotInitComp) {
      percent.value = 100
    }
    loadComplete()
  }, commonAttr.delayTime * 1000)
})
initComp()
onBeforeUnmount(() => {
  EventBus.$off("refreshDynamicData", onRefreshNumber)
  EventBus.$off("loadAssetsProcess", onLoadAssetsProcess)
  EventBus.$off("clickAddProcess", onIntervalAssetsProcess)
})
</script>

<style lang="scss">
.wb-process-bar {
  width: inherit;
  height: inherit;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  .wb-bar-con {
    flex: auto;
    width: 100%;
    height: 100%;
    border: var(--size-2) solid #fff;
    flex-direction: column;
    justify-content: center;
    justify-items: center;
    align-content: center;
    align-items: center;
    background-size: contain;
    background-repeat: no-repeat;

    .mask-bar {
      clip-path: inset(0px 0% 0px 0px);
      transition: all 0.5s linear;
      background-size: contain;
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }
    .wb-bar {
      position: relative;
      width: 100%;
      height: 100%;
      display: block;
      transition: width 0.5s linear;
      background-size: contain;
      background-repeat: no-repeat;;

      .marker {
        position: absolute;
        right: 0;
        text-align: center;
        display: flex;
        justify-content: center;
        justify-items: center;
        align-content: center;
        align-items: center;
      }
      .maker-bar-point{
        transition: all 0.5s linear;
      }
    }
  }
}
</style>