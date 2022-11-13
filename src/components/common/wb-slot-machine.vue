<template>
  <inject-template :item="item" :pageId="pageId" :popId="popId">
    <template v-slot:common>
      <ul class="wb-slot-machine" @click.stop>
        <li :id="'slot-0' + item.id" class="slotMachine">
          <div v-for="(item_, index) in machineData.randomArr_0" :class="getSlotClass(item_)" :style="getSlotStyle(item_)" :key="'slot_0_' + index"></div>
        </li>
        <li :id="'slot-1' + item.id" class="slotMachine">
          <div v-for="(item_, index) in machineData.randomArr_1" :class="getSlotClass(item_)" :style="getSlotStyle(item_)" :key="'slot_1_' + index"></div>
        </li>
        <li :id="'slot-2' + item.id" class="slotMachine">
          <div v-for="(item_, index) in machineData.randomArr_2" :class="getSlotClass(item_)" :style="getSlotStyle(item_)" :key="'slot_2_' + index"></div>
        </li>
      </ul>
    </template>
  </inject-template>
</template>

<script setup lang="ts">
import { EventBus, isHasOwnProperty } from '@/utils/'
import { getCompStyle, getListByItem } from '@/components/utils/'
import { useSiteStore } from '@/store/site'
import { postShowPop } from '@/components/events/result-event'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
}>()
const item = props.item
const commonAttr = item.commonAttr
const useSite = useSiteStore()
const isH5Edit = useSite.isH5Edit
const styles = computed(() => {
  return getCompStyle(item)
})

const machineData = reactive({
  randomArr_0: [],
  randomArr_1: [],
  randomArr_2: [],
})
const machineObj = {
  randomObj_0: {},
  randomObj_1: {},
  randomObj_2: {}
}
let isRunOnce = false,
    runningNum = 0,
    slot_0: any = null,
    slot_1: any = null,
    slot_2: any = null,
    machine_0: any = null,
    machine_1: any = null,
    machine_2: any = null

const getSlotStyle = (item: any) => {
  const style_ = {
    backgroundImage: 'url(' + item.url + ')'
  }
  return style_
}
const getSlotClass = (item: any) => {
  return ['slot']
}
const dealRandomArr = (newArr: any, index: number) => {
  const randomArr = machineData['randomArr_' + index] = newArr
  _.forEach(randomArr, (item_: any, index_: number) => {
    item_.randomIndex = index_
    machineObj['randomObj_' + index][item_.index] = item_
  })
}
const initRandomArr = () => {
  const lists = getListByItem(item)
  _.forEach(lists, (listItem: IListItem, index: number) => {
    listItem.index = index
  })
  let newArr = _.cloneDeep(_.shuffle(lists))
  dealRandomArr(newArr, 0)
  newArr = _.cloneDeep(newArr)
  let listItem = newArr.shift()
  newArr.push(listItem)
  dealRandomArr(newArr, 1)
  newArr = _.cloneDeep(newArr)
  listItem = newArr.shift()
  newArr.push(listItem)
  dealRandomArr(newArr, 2)
}
const onSlotMachine = () => {
  if(isRunOnce) {
    machine_0.nextActive = 0
    machine_1.nextActive = 0
    machine_2.nextActive = 0
  } else {
    isRunOnce = true
  }
  const spins = 99999//commonAttr.spins
  machine_0.shuffle(spins)
  machine_1.shuffle(spins)
  machine_2.shuffle(spins)

  let animateTime = parseFloat(commonAttr.animateTime)
  window.setTimeout(() => {
    EventBus.$emit("itemClick", {id: item.id, index: 0, e: null})
  }, animateTime * 1000)
}
const stopCb = () => {
  runningNum++
  if(runningNum >= 3) {
    window.setTimeout(() => {
      onDelayShowPostPop()
    }, commonAttr.pauseTime * 1000)
  }
}
const onStopSlotMachine = (lotteryIndex: number) => {
  // let xx = {
  //   0:,//蓝忘机
  //   1:,//真果粒粉色
  //   2:,//蓝忘机
  //   3:,//真果粒蓝色
  //   4:,//真果粒all
  // }
  // lotteryIndex = 0 //测试代码
  const interactionData = item.interactionData
  if(lotteryIndex >= 0){
    if(interactionData && interactionData.dimensionLists){
      const list = interactionData.dimensionLists[lotteryIndex]
      const randomIndex = _.random(0, list.length-1)
      if(list[randomIndex].params){
        let imgIndexObj = JSON.parse(list[randomIndex].params)
        if(isHasOwnProperty(imgIndexObj, 'imgIndex')){
          const imgIndex_0 = machineObj.randomObj_0[imgIndexObj.imgIndex].randomIndex
          const imgIndex_1 = machineObj.randomObj_1[imgIndexObj.imgIndex].randomIndex
          const imgIndex_2 = machineObj.randomObj_2[imgIndexObj.imgIndex].randomIndex

          machine_0.nextActive = imgIndex_0
          machine_1.nextActive = imgIndex_1
          machine_2.nextActive = imgIndex_2
        }
      }
    }
  } else {
    const lists = getListByItem(item)
    const len = lists.length - 1
    let randomIndex = _.random(0, len)
    machine_0.nextActive = randomIndex
    randomIndex++
    randomIndex = randomIndex % len
    machine_1.nextActive = randomIndex
    randomIndex++
    randomIndex = randomIndex % len
    machine_2.nextActive = randomIndex
  }
  runningNum = 0
  machine_0.stop(stopCb)
  machine_1.stop(stopCb)
  machine_2.stop(stopCb)
}
const onDelayShowPostPop = () => {
  const eventShare = item.eventShare
  if(eventShare.delayShowPopParams) {
    postShowPop(eventShare.delayShowPopParams)
    delete eventShare.delayShowPopParams
  }
}
const onRefreshCommonAttr = (id: string) => {
  if(item.id != id) {
    return
  }
  initRandomArr()
}
const initComp = () => {
  onRefreshCommonAttr(item.id)
  if(isH5Edit) {
    EventBus.$on('refreshCommonAttr', onRefreshCommonAttr)
    return 
  }
  EventBus.$on("slotMachine", onSlotMachine)
  EventBus.$on("stopSlotMachine", onStopSlotMachine)
}

initComp()

onMounted(() => {
  if(isH5Edit) {
    return 
  }
  slot_0 = document.getElementById('slot-0' + item.id)
  slot_1 = document.getElementById('slot-1' + item.id)
  slot_2 = document.getElementById('slot-2' + item.id)

  const spinsTime = parseFloat(commonAttr.spinsTime) * 1000
  machine_0 = new window.SlotMachine(slot_0, {
    active: 0,
    delay: spinsTime,
  })
  machine_1 = new window.SlotMachine(slot_1, {
    active: 0,
    delay: spinsTime,
  })
  machine_2 = new window.SlotMachine(slot_2, {
    active: 0,
    delay: spinsTime,
  })
})

onBeforeUnmount(() => {
  if(isH5Edit) {
    EventBus.$off('refreshCommonAttr', onRefreshCommonAttr)
  }
  EventBus.$off("slotMachine", onSlotMachine)
  EventBus.$off("stopSlotMachine", onStopSlotMachine)
})
</script>

<style lang="scss">
.wb-slot-machine {
  width: inherit;
  height: inherit;

  .slotMachine{
    width: 33.3333%;
    height: inherit;
    overflow: hidden;
    font-size: 0;
    float: left;

    .slotMachineContainer{
      width: 100%;
      height: inherit;
    }
    .slot{
      width: 100%;
      height: inherit;
      background-repeat: no-repeat;
      background-size: contain;
      background-position: center;
    }
  }
  .slotMachineNoTransition {
    -webkit-transition: none !important;
    -o-transition: none !important;
    transition: none !important;
  }
}
</style>