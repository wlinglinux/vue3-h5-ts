<template>
  <inject-template :item="item" :pageId="pageId" :popId="popId">
    <template v-slot:common>
      <div class="wb-timer">
        <van-count-down ref="refDom" :style="styles" :time="countTime" :auto-start="autoStart" :format="timerFormat" @finish="timerFinished"/>
      </div>
    </template>
   </inject-template>
</template>

<script setup lang="ts">
import { getCompStyle, getItemBaseControl, showPop, showToast } from '@/components/utils/'
import { useSiteStore } from '@/store/site'
import { useControlsStore } from '@/store/controls'
import { EventBus } from '@/utils/'
import { TIMER_PATTERN_MAP, TIMER_TYPES_MAP, CONTROL_TYPES } from '@/const/'

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
const useControls = useControlsStore()
const siteInfo = useSite.siteInfo
const countTime = ref(0)
const autoStart = ref(false)
const timerFormat = ref('00小时00分钟00秒')
let timeTimerCb: number = -1

const setTimeFormat = () => {
  if(commonAttr.pattern == TIMER_PATTERN_MAP.hour.value) {
    timerFormat.value = TIMER_PATTERN_MAP.hour.format
  }else if(commonAttr.pattern == TIMER_PATTERN_MAP.day.value) {
    timerFormat.value = TIMER_PATTERN_MAP.day.format
  }else if(commonAttr.pattern == TIMER_PATTERN_MAP.hourTimeStr.value) {
    timerFormat.value = TIMER_PATTERN_MAP.hourTimeStr.format
  } else if(commonAttr.pattern == TIMER_PATTERN_MAP.secondStr.value) {
    timerFormat.value = TIMER_PATTERN_MAP.secondStr.format
  }
}
const initComp = () => {
  if(useSite.isH5Edit) {
    EventBus.$on('refreshCommonAttr', onRefreshCommonAttr)
    return
  }
  EventBus.$on("timerStart", onTimerStart)
  EventBus.$on("timerPause", onTimerPause)
  setTimeFormat()
}

const refDom = ref<any>(null)
let countDown = <any>(null)
onMounted(() => {
  if(!useSite.isH5Edit) {
    countDown = refDom.value
    refresh()
    const baseControl = getItemBaseControl(item.id, CONTROL_TYPES.wb_timer)
    if(baseControl) {
      _.merge(baseControl.data, countDown.timeData)
    }
  }
})

const onTimerPause = () => {
  countDown.pause()
}
const onTimerStart = () => {
  const baseControl = getItemBaseControl(item.id, CONTROL_TYPES.wb_timer)
  const controlData: ITimerControl = baseControl && (baseControl.data) as ITimerControl
  countTime.value = parseInt(controlData.countdown)*1000
  countDown.reset()
  autoStart.value = true
  countDown.start()
}
const timerFinished = () => {
  const baseControl = getItemBaseControl(item.id, CONTROL_TYPES.wb_timer)
  const controlData: ITimerControl = baseControl && (baseControl.data) as ITimerControl
  if(controlData.type === TIMER_TYPES_MAP.countdown) {
    EventBus.$emit("itemClick", {id: item.id, index: 0})
  }
  if(controlData.popId > 0){
    showPop(controlData.popId)
  }
  EventBus.$emit("timerEnd")
}
const refresh = () => {
  const baseControl = getItemBaseControl(item.id, CONTROL_TYPES.wb_timer)
  const controlData: ITimerControl = baseControl && (baseControl.data) as ITimerControl
  if(!controlData) return 
  if(controlData.type === TIMER_TYPES_MAP.activityCountdownTime) {
    activityCountdownTime(controlData)
  } else if (controlData.type === TIMER_TYPES_MAP.countdown) {
    //计数
    countTime.value = 0
    // onTimerStart()
  } else {
    //正计时 倒计时
    // let start
    let end: number = 0
    let now: number = 0
    if(controlData.time && controlData.time.length > 0){
      if(controlData.type == TIMER_TYPES_MAP.activityStartEndTime){
        // start = new Date(controlData.time).getTime()
        end = new Date(controlData.endTime).getTime()
        now = new Date().getTime()
      }else{
        end = new Date(controlData.time).getTime()
        now = new Date().getTime()
      }
    }else{
      showToast('时间没有设置哦！！')
    }
    // if(startTime < 0) {
    //   isDisabled_ = true
    //   // showToast("亲，活动还未开始！！请耐心等待！！")
    // }else if(endTime < 0){
    //   isDisabled_ = true
    //   // showToast("亲， 活动已结束了哦！！")
    // }else{
    //   isDisabled_ = false
    // }
    let msec: number = 0
    if(controlData.type === TIMER_TYPES_MAP.positiveTime){
      msec = now - end
    }else if(controlData.type === TIMER_TYPES_MAP.countdownTime){
      msec = end - now
    }else if(controlData.type == TIMER_TYPES_MAP.activityStartEndTime){
      msec = end - now
    }
    if(msec <= 0) {
      EventBus.$emit("timeComplete")
    } else {
      countTime.value = msec
      autoStart.value = true
      countDown.start()
      nextTick(() => {
        _.merge(controlData, countDown.timeData)
      })
    }
  }
}
const activityCountdownTime = (controlData: ITimerControl) => {
  const useSite = useSiteStore()
  if(controlData.time && controlData.time.length > 0){
    let now = (new Date(useSite.timeObj.serverTime.replace(/-/g,  "/"))).valueOf()
    let end = (new Date(controlData.time.replace(/-/g,  "/"))).valueOf()
    let msec = end - now
    countTime.value = msec
    if(msec >= 0){
      useSite.updateIsTimerEnd({isTimerEnd :  true})
      autoStart.value = true
      countDown.start()
    }else{
      //活动结束 直接弹出结果 ext_1不能为0 为零就直接停在pop3了
      if(controlData.popId){
        showPop(controlData.popId)
      }
    }
  }else{
    timeTimerCb = window.setInterval( () => {
      const baseControl = getItemBaseControl(item.id, CONTROL_TYPES.wb_timer)
      const controlData: ITimerControl = baseControl && (baseControl.data) as ITimerControl
      if(controlData.time.length > 0){
        useSite.updateIsTimerStart({isTimerStart :  true})
        window.clearInterval(timeTimerCb)
        refresh()
      } else {
        // let event = { type: 'initTime', controlId:CONTROL_TYPES.wb_timer }
        // initPost('/feinit/timer', {event, site_id: siteInfo.id, com_id: item.id, action: 'get' })
      }
    }, 1000)
  }
}
const onRefreshCommonAttr = (id: string) => { 
  if(item.id != id) {
    return
  }
  setTimeFormat()
}

initComp()

onBeforeUnmount(() => {
  if(useSite.isH5Edit) {
    EventBus.$off('refreshCommonAttr', onRefreshCommonAttr)
  }
  EventBus.$off("timerStart", onTimerStart)
  EventBus.$off("timerPause", onTimerPause)
})
</script>

<style lang="scss">
.wb-timer {
  width: inherit;
  height: inherit;

  .van-count-down {
    width: inherit;
    height: inherit;
    text-align: center;
    display: flex;
    align-content: center;
    align-items: center;
    justify-content: center;
    justify-items: center;
  }
}
</style>