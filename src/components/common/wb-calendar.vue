<template>
  <inject-template :item="item" :pageId="pageId" :popId="popId">
    <template v-slot:common >
      <div class="wb-calendar" :id="'calender-'+ item.id">
        <van-calendar v-model="calendarData.show"
          :title="calendarData.title"
          type="single"
          :default-date="calendarData.defaultDate"
          :min-date="minDate" 
          :max-date="maxDate"
          :row-height="rowHeight"
          :formatter="formatter"
          :poppable="calendarData.poppable"
          :show-mark="calendarData.showMark"
          :show-title="calendarData.showTitle"
          :show-month-title="calendarData.showSubtitle"
          :show-subtitle="calendarData.showSubtitle"
          :show-confirm="calendarData.showConfirm"
          :readonly="calendarData.readonly"
          :first-day-of-week="calendarData.firstDayOfWeek"
        />
      </div>
    </template>
  </inject-template>
</template>

<script setup lang="ts">
import { CALENDER_TYPE_MAP, COMMON_WID_HEI, CONTROL_TYPES } from '@/const/'
import { EventBus, getPxOVwByValue } from '@/utils/'
import { getCompStyle, getListByItem, loadStyleString } from '@/components/utils/'
import { useSiteStore } from '@/store/site'
import { useControlsStore } from '@/store/controls'

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
const isH5Edit = useSite.isH5Edit

// 对获取到的数据进行初始化
const calendarData = reactive({
  show: false,
  date: new Object(),
  title: '日历',
  type: 'single',//single表示选择单个日期，multiple表示选择多个日期，range表示选择日期区间
  defaultDate: null,
  // formatter:日期格式化函数
  poppable: false,//是否以弹层的形式展示日历
  showMark: false,//是否显示月份背景水印
  showTitle: true,//是否展示日历标题
  showSubtitle: true,//是否展示日历副标题（年月）
  showConfirm: false,//是否展示确认按钮
  readonly: true,//是否为只读状态，只读状态下不能选择日期
  // confirm-text	确认按钮的文字
  // confirm-disabled-text	确认按钮处于禁用状态时的文字
  firstDayOfWeek: 0, //设置周起始日
})
let dateMinStr = ''
let dateMaxStr = ''
const formatter = (day: any) => {
  // date	日期对应的 Date 对象
  // type	日期类型，可选值为selected、start、middle、end、disabled
  // topInfo 上方的提示信息
  // bottomInfo 下方的提示信息
  // text	中间显示的文字
  // className	额外类名
  const year = day.date.getFullYear()
  const month = day.date.getMonth() + 1
  const month_ = month <= 9 ? "0" + month : month
  const date = day.date.getDate()
  const date_ = date <= 9 ? "0" + date : date

  // if (month === 5) {
  //   if (date === 1) {
  //     day.topInfo = '劳动节'
  //   } else if (date === 4) {
  //     day.topInfo = '青年节'//上方的提示信息
  //   }
  // }

  // if (day.type === 'start') {
  //   day.bottomInfo = '入住'
  // } else if (day.type === 'end') {
  //   day.bottomInfo = '离店'//下方的提示信息
  // }else
  const currentDate = new Date()
  const baseControl = useControls.controls[item.id]
  const voteControlData = baseControl && baseControl[CONTROL_TYPES.wb_vote] && baseControl[CONTROL_TYPES.wb_vote].data as IVoteControl
  const elements = voteControlData && voteControlData.elements
  if(elements && elements[year.toString() + month_ + date_] && elements[year.toString() + month_ + date_].num > 0){
    day.type = "selected"
    // day.topInfo = month + '月'
  } else if (date === currentDate.getDate() && month == currentDate.getMonth() + 1) {
    day.text = '今天'
    // day.type = "selected"
    // day.topInfo = month + '月'
  }
  //根据条件显示签到天数
  let lists = item.interactionData && item.interactionData.lists
  if(lists && lists.length > 0){
    let key = _.parseInt(date_) - 1
    if(lists[key] && lists[key].url && lists[key].url.length > 0){
      day.text = ''
      day.topInfo =''
      day.className = `calendar-item-bg-${key}`
    }
  }
  return day
}
const rowHeight = computed(() =>{
  if(isH5Edit) {
    return COMMON_WID_HEI.width * 0.11285
  } else {
    let reallyWidth = COMMON_WID_HEI.clientWidth
    if(item.conAttr && item.conAttr.width){
      reallyWidth = item.conAttr.width / COMMON_WID_HEI.adaptiveScale
    }
    reallyWidth *= 0.11285
    return reallyWidth
  }
})

const minDate = computed(() => {
  let minDate = ""
  if(commonAttr.calendarType == CALENDER_TYPE_MAP.currentMonth) {
    minDate = dateMinStr
  } else {
    minDate = commonAttr.minDate
  }
  let arr = minDate.split("/")
  return new Date(_.parseInt(arr[0]), _.parseInt(arr[1])-1, _.parseInt(arr[2]))
})

const maxDate = computed(() => {
  let maxDate_ = ""
  if(commonAttr.calendarType == CALENDER_TYPE_MAP.currentMonth) {
    maxDate_ = dateMaxStr
  } else {
    maxDate_ = commonAttr.maxDate
  }
  const arr = maxDate_.split("/")
  return new Date(_.parseInt(arr[0]), _.parseInt(arr[1])-1, _.parseInt(arr[2]))
})

const borderRadius = computed(() => {
  return commonAttr.borderRadius + 'px'
})
const isOverFlow = computed(() => {
  if(commonAttr.borderRadius){
    return 'hidden'
  }else{
    return 'none'
  }
})
const createClass = (lists: any[]) => {
  let innerHTML = ''
  for(let i = 0; i < lists.length; i++) {
    if(lists[i].url && lists[i].url.length == 0)
      break
      innerHTML = innerHTML + `.calendar-item-bg-${i} { border-radius: 50%;
                  width: 11.285%;
                  margin: 1.5%;
                  background:url(${lists[i].url}) ;background-size: contain;}`
  }
  loadStyleString(innerHTML)
}

const onRefreshCommonAttr = (id: string) => { 
  if(item.id != id) {
    return
  }
  const domStyle: any = document.getElementById('calender-'+ item.id)!.style
  domStyle.setProperty(`--calendar-bg-color`, commonAttr.backgroundColor)
  domStyle.setProperty(`--calendar-color`, commonAttr.color)
  if(commonAttr.selectedBgColor) {
    domStyle.setProperty(`--calendar-selected-bg-color`, commonAttr.selectedBgColor)
  }
  if(commonAttr.fontColor){
    domStyle.setProperty(`--calendar-selected-font-color`, commonAttr.fontColor)
  }
  if(commonAttr.selectedBorderUrl) {
    domStyle.setProperty(`--calendar-selected-border-url`, 'url(' + commonAttr.selectedBorderUrl + ')')
    domStyle.setProperty(`--calendar-selected-border-size`, '0')
  } else {
    domStyle.setProperty(`--calendar-selected-border-url`, 'url()')
    domStyle.setProperty(`--calendar-selected-border-size`, getPxOVwByValue(2))
    domStyle.setProperty(`--calendar-selected-border-color`, commonAttr.selectedBorderColor)
  }
  domStyle.setProperty(`--calendar-selected-color`, commonAttr.selectedColor)
  domStyle.setProperty(`--calendar-font-size`, commonAttr.fontSize)
  _.merge(calendarData, commonAttr)
}

const initComp = () => {
  if(isH5Edit) {
    EventBus.$on('refreshCommonAttr', onRefreshCommonAttr)
  }
  // 设置当天voteId
  let date = calendarData.date = new Date()
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  let month_ = month <= 9 ? "0" + month.toString() : month.toString()
  let day_ = day <= 9 ? "0" + day.toString() : day.toString()
  let voteId = item.commonAttr.voteId = year.toString() + month_ + day_

  let d = new Date(year, month, 0)
  let days = d.getDate()

  dateMinStr = year + "/" + month + "/" + 1
  dateMaxStr = year + "/" + month + "/" + days

  const lists = getListByItem(item)
  if(lists) {
    for(let i = 0; i < lists.length; i++) {
      if(lists[i].voteId == voteId) {
        item.commonAttr.itemIndex = i
        break
      }
    }
  }
  if(item.interactionData) {
    const lists = item.interactionData.lists
    if(lists && lists.length > 0) {
      createClass(lists)
    }
  }
}
initComp()

onMounted(() => {
  onRefreshCommonAttr(item.id)
})

onBeforeUnmount(() => {
  if(isH5Edit) {
    EventBus.$off('refreshCommonAttr', onRefreshCommonAttr)
  }
})
</script>



<style lang="scss">
.wb-calendar {
  width: inherit;
  height: inherit;

  --calendar-bg-color: #f2f2f2;
  --calendar-selected-bg-color: transparent;
  --calendar-selected-border-color: green;
  --calendar-selected-border-size: var(--size-2);
  --calendar-selected-border-url: url();//https://static.hd.xxx.com/upload/biz/14/55328798_350.png
  --calendar-color: #000;
  --calendar-selected-color: #cf8910;
  --calendar-selected-font-color: black;
  --calendar-font-size: var(--size-28);
  border-radius: v-bind(borderRadius);
  overflow: v-bind(isOverFlow);

  .van-calendar__day {
    border-radius: 50%;
    color: var(--calendar-color);
    background-color: var(--calendar-bg-color);
    font-size: var(--calendar-font-size);
    width: 11.285%;
    margin: 1.5%;
  }

  .van-calendar__day--start{
    border-radius: var(--size-8) 0 0 var(--size-8);
  }

  .van-calendar__selected-day{
    padding-top: var(--size-8);
    color: var(--calendar-selected-font-color);
    background-color: var(--calendar-selected-bg-color);
    border: var(--calendar-selected-border-size) solid var(--calendar-selected-border-color);
    background-image: var(--calendar-selected-border-url);
    background-size: cover;
  }
  .van-calendar__body{
    margin-top: var(--size-40);
  }
  .van-calendar__month-title{
    display: none
  }
}
</style>