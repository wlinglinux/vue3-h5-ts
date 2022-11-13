<template>
  <inject-template :item="item" :pageId="pageId" :popId="popId">
    <template v-slot:common >
      <van-button :data-id="item.id" :style="styles" :class="getBtnClass" @click="onSelected($event)" ref="dom">
        {{ commonAttr.bgUrl && commonAttr.bgUrl.length > 0 ? "" : commonAttr.title }}</van-button>
    </template>
  </inject-template>
</template>

<script setup lang="ts">
import { useSiteStore } from '@/store/site'
import { getCompStyle } from '@/components/utils/'
import { EventBus, getCompIdByParam, isHasOwnProperty } from '@/utils/'
import { useControlsStore } from '@/store/controls'
import { CONTROL_TYPES } from '@/const/'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
}>()
const item = props.item
const textAlign = item.commonAttr.textAlign || 'center'
const commonAttr = item.commonAttr
const useSite = useSiteStore()
const useControls = useControlsStore()
const isH5Edit = useSite.isH5Edit
let isSelected = false
let isDisabled = false
let isGrey = false
let isGreyClass = false
const styles = computed(() => {
  return getCompStyle(item)
})
const getBtnClass = computed(() => {
  return { "grayscale": isGreyClass, "wb-btn": true }
})
const onSelected = (e: Event) => {
  if(useSite.isH5Edit) {
    return
  }
  if(isDisabled && e || item.interactionData && item.interactionData.groupInjectClassName) {
    e.stopPropagation()
    return
  }
  if(commonAttr.isSelected) {
    item.interactionData.isSelected = isSelected = !isSelected
    if(commonAttr.relateAttrCompId) {
      const relateAttrCompId = getCompIdByParam(commonAttr.relateAttrCompId)
      const relateCompData = useSite.componentMap[relateAttrCompId]
      relateCompData.interactionData.isSelected = item.interactionData.isSelected
    }
    refreshStyles()
  }
}

const setBtnDisabledByTimer = () => {
  const relateAttrCompId = getCompIdByParam(commonAttr.relateAttrCompId)
  let baseControl: any = useControls.controls[item.id]
  if(relateAttrCompId) {
    baseControl = useControls.controls[relateAttrCompId]
  }
  if(baseControl) {
    if(baseControl[CONTROL_TYPES.wb_timer]) {
      let end = 0
      let start = 0
      let now = 0
      let timerControlData = baseControl[CONTROL_TYPES.wb_timer]
      if(timerControlData.data.time && timerControlData.data.time.length > 0) {
        start = new Date(timerControlData.data.time).getTime()
        end = new Date(timerControlData.data.endTime).getTime()
        now = new Date().getTime()
      }
      let startTime = 0
      let endTime = 0
      startTime = now - start
      endTime = end - now
      let isDisabled_ = false
      if(startTime < 0) {
        isDisabled_ = true
        // showToast("亲，活动还未开始！！请耐心等待！！");
      }else if(endTime < 0) {
        isDisabled_ = true
        // showToast("亲， 活动已结束了哦！！");
      }else{
        isDisabled_ = false
      }
      if(commonAttr.isDisabled && isDisabled_) {
        isDisabled = true
        setBtnGreyClass()
        refreshStyles()
      }
      if(commonAttr.isGrey && isDisabled_) {
        isGrey = true
        setBtnGreyClass()
        refreshStyles()
      }
    }
  }
}

const initComp = () => {
  if(!isH5Edit) {
    let isSelected_: boolean = item.interactionData.isSelected || false
    if(commonAttr.relateAttrCompId) {
      const relateAttrCompId = getCompIdByParam(commonAttr.relateAttrCompId)
      const relateCompData = useSite.componentMap[relateAttrCompId]
      isSelected_ = relateCompData.interactionData.isSelected || false
    }
    item.interactionData.isSelected = isSelected = isSelected_
    //打组组件发事件改变按钮状态
    if(item.interactionData.isInGroup && item.interactionData.groupInjectClassName) {
      EventBus.$on("btnStatus", setBtnGrey)
    } else {
      EventBus.$on("allBtnStatus", setBtnGrey)
    }
    if(commonAttr.isDisabled || commonAttr.isGrey) {
      //每日计数改变按钮状态
      EventBus.$on("refreshNumberDayExists", onRefreshNumberDayExists)
      //计数事件 计数改变改变按钮状态
      const relateAttrCompId = getCompIdByParam(item.commonAttr.relateAttrCompId)
      const compData = useSite.componentMap[item.id]
      const relateCompData = useSite.componentMap[relateAttrCompId]
      if(compData.events.number || relateCompData && relateCompData.events.number) {
        EventBus.$on("refreshDynamicData", onRefreshByNumber)
      }
      if(compData.events.vote || relateCompData && relateCompData.events.vote) {
        EventBus.$on("refreshDynamicData", onRefreshByVote)
      }
      setBtnDisabledByTimer()
    } else {
      refreshStyles()
    }
    if(commonAttr.selectedBgUrl && commonAttr.selectedBgUrl.length > 0) {
      const img = new Image()
      img.src = commonAttr.selectedBgUrl
    }
  }
}

const setBtnGrey = (btnStatus: IBtnStatus) => {
  // {isInGroup: false,"compId":"","isGrey":false,"isSelected":false}
  //在其他交互中改变按钮的状态
  if(isHasOwnProperty(btnStatus, "compId")) {
    if(item.id == btnStatus.compId) {
      refreshBtnStatus(btnStatus)
    }
  } else {
    refreshBtnStatus(btnStatus)
  }
}

const refreshBtnStatus =(btnStatus: any) => {
  if(isHasOwnProperty(btnStatus, "isGrey")) {
    setBtnGreyClass()
    isGrey = btnStatus.isGrey
    refreshStyles()
  } else if (isHasOwnProperty(btnStatus, "isSelected")) {
    item.interactionData.isSelected = isSelected = btnStatus.isSelected
    refreshStyles()
  } else if (isHasOwnProperty(btnStatus, "isDisabled")) {
    isDisabled = btnStatus.isDisabled
    if(isDisabled) setBtnGreyClass()
    refreshStyles()
  }
}

const setBtnGreyClass = () => {
  isGreyClass = false
  if(!commonAttr.selectedBgUrl) {
    if(isDisabled) {
      isGreyClass = true
    }
  }
}

const onRefreshNumberDayExists = ({compId, isNumber}) =>{
  if(item.id == compId) {
    if(commonAttr.isGrey) {
      setBtnGreyClass()
      isGrey = !isNumber
    } else {
      isDisabled = !isNumber
      if(isDisabled) setBtnGreyClass()
    }
    refreshStyles()
  }
}

const onRefreshByNumber = () => {
  //计数为灰色
  if(commonAttr.isGrey || commonAttr.isDisabled) {
    const relateAttrCompId = getCompIdByParam(item.commonAttr.relateAttrCompId)
    const relateBaseControl = useControls.controls[relateAttrCompId] && useControls.controls[relateAttrCompId][CONTROL_TYPES.wb_number]
    const compBaseControl = useControls.controls[item.id] && useControls.controls[item.id][CONTROL_TYPES.wb_number]
    const baseControl = relateBaseControl || compBaseControl
    if(baseControl) {
      const numberControlData = baseControl.data as INumberControl
      if(numberControlData && numberControlData.dayNum > 0 && numberControlData.dayNum >= _.parseInt(numberControlData.day_limit)) {
        if(commonAttr.isGrey) {
          isGrey = true
        } else {
          isDisabled = true
        }
        setBtnGreyClass()
        refreshStyles()
      }
    }
  }
}
const onRefreshByVote = () => {
  //投票为灰色
  if(commonAttr.isGrey || commonAttr.isDisabled) {
    const relateAttrCompId = getCompIdByParam(item.commonAttr.relateAttrCompId)
    const relateBaseControl = useControls.controls[relateAttrCompId] && useControls.controls[relateAttrCompId][CONTROL_TYPES.wb_vote]
    const compBaseControl = useControls.controls[item.id] && useControls.controls[item.id][CONTROL_TYPES.wb_vote]
    const baseControl = relateBaseControl || compBaseControl
    if(baseControl) {
      const voteControlData = baseControl.data as IVoteControl
      if(voteControlData && voteControlData.elements[commonAttr.itemIndex+1] && voteControlData.elements[commonAttr.itemIndex+1].num > 0) {
        if(commonAttr.isGrey) {
          isGrey = true
        } else {
          isDisabled = true
        }
        setBtnGreyClass()
        refreshStyles()
      }
    }
  }
}
const refreshStyles = () => {
  let styles:any = {}//color: "", backgroundColor: "", backgroundImage: ""
  if(isSelected || isDisabled || isGrey) {
    if(commonAttr.selectedBgUrl && commonAttr.selectedBgUrl.length > 0) {
      styles.backgroundImage = "url(" + commonAttr.selectedBgUrl + ")"
    } else {
      styles.color = commonAttr.selectedColor
      styles.backgroundColor = commonAttr.selectedBgColor
    }
  } else {
    if(commonAttr.bgUrl && commonAttr.bgUrl.length > 0) {
      styles.backgroundImage = "url(" + commonAttr.bgUrl + ")"
    } else {
      styles.color = commonAttr.color
      styles.backgroundColor = commonAttr.backgroundColor
    }
  }
  useSite.updateComponentStyles({id: item.id, styles})
}

initComp()

onMounted(() => {
   if(!isH5Edit) {
     onRefreshByVote()
  }
})
// watch(
//   () => item.interactionData.isSelected,
//   (newVal, oldVal) => {
//     if(newVal != oldVal) {
//     }
//   },
//   {
//     immediate: true, // 立即执行
//     deep: true // 深度监听
//   }
// )

onBeforeUnmount(() => {
  if(isH5Edit) {
    return
  }
  if(item.interactionData.isInGroup && item.interactionData.groupInjectClassName) {
    EventBus.$off("btnStatus", setBtnGrey)
  } else {
    EventBus.$off("allBtnStatus", setBtnGrey)
  }
  EventBus.$off("refreshNumberDayExists", onRefreshNumberDayExists)
  EventBus.$off("refreshDynamicData", onRefreshByNumber)
})

</script>
<script lang="ts">
export default defineComponent({
  // props: ['item', 'pageId', 'popId'],
  mounted() {
    const siteStore = useSiteStore()
    if(!siteStore.isH5Edit) {
      this.item.interactionData.vueContainer = this
    }
  },
})
</script>
<style lang="scss" scoped>
.wb-btn {
  width: inherit;
  height: inherit;

  border: none;
  outline: none;

  // box-shadow: rgb(159 180 242) 0px 0px 17px -9px;
  // background: linear-gradient(rgb(120, 146, 194) 5%, rgb(71, 110, 158) 100%) rgb(120, 146, 194);
  // text-shadow: rgb(40 57 102) 0px 5px 18px;

  .van-button__content {
    justify-content: v-bind(textAlign);
  }
}
.grayscale {
  -webkit-filter: grayscale(100%);
  filter: grayscale(100%);
}

.rotation-animate {
  -webkit-animation: rotating 1.2s linear infinite;
  -moz-animation: rotating 1.2s linear infinite;
  -o-animation: rotating 1.2s linear infinite;
  animation: rotating 1.2s linear infinite
}

@-webkit-keyframes rotating {
  from { -webkit-transform: rotate(0) }
  to { -webkit-transform: rotate(360deg) }
}

@keyframes rotating {
  from { transform: rotate(0) }
  to { transform: rotate(360deg) }
}
@-moz-keyframes rotating {
  from { -moz-transform: rotate(0) }
  to { -moz-transform: rotate(360deg) }
}

</style>
