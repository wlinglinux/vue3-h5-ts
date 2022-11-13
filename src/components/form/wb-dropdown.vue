<template>
  <inject-template :item="item" :pageId="pageId" :popId="popId" :isPropagation="false">
    <template v-slot:common>
      <div v-if="isPicker" class="wb-dropdown" :data-id="item.id">
        <van-cell is-link @click="onShowPicker" :style="styles" ref="refDom">{{ selectedValue }}</van-cell>
        <van-popup v-model:show="showPicker" teleport="body" position="bottom" round>
          <van-picker show-toolbar :title="title" :columns="options" @cancel="onHidePicker" @confirm="onConfirm"/>
        </van-popup>
      </div>
      <div v-else class="wb-dropdown" :data-id="item.id">
        <van-dropdown-menu :overlay="false">
          <van-dropdown-item v-model="selectedValue" :options="options" @change="onPCConfirm"/>
        </van-dropdown-menu>
      </div>
    </template>
  </inject-template>
</template>

<script setup lang="ts">
import { EventBus, isJSON, removeClass } from '@/utils/'
import { getCompStyle, getWbListByItem, isWbList, getListByItem } from '@/components/utils/'
import { useSiteStore } from '@/store/site'
import { useInteractionStore } from '@/store/interaction'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
}>()
const item = props.item
const commonAttr = item.commonAttr
const useSite = useSiteStore()
const useInteraction = useInteractionStore()
const siteInfo = useSite.siteInfo
const isH5Edit = useSite.isH5Edit
const title = ref(props.item.commonAttr.title),
      showPicker = ref(false),
      selectedValue = ref(props.item.commonAttr.placeholder)

let selectedIndex: number =  -1,
    selectedText: string = '' ,
    customList: any[] = [],
    customData: Object = {}
const styles = computed(() => {
  return getCompStyle(item)
})
const isPicker = computed(() => {
  return isH5Edit || (siteInfo.md.isMobile && !commonAttr.isMenu)
})
const updateInteractionData = () => {
  if(item.events.interactionData) {
    let customParams = item.events.interactionData.comps[0].attrs.value
    let key = ''
    if(customParams && isJSON(customParams)) {
      key = JSON.parse(customParams).key
    }
    if(key) {
      let paperObj = {}
      paperObj[key] = selectedText || selectedValue.value
      EventBus.$emit("paperData", paperObj)
    }
  }
}
const updateFormValue = () => {
  let listItem = customList[selectedIndex]
  if(listItem) {
    useInteraction.updateFormValueMap({ id: item.id, value: selectedValue.value, item })
    EventBus.$emit("itemClick", {id: item.id, index: selectedIndex})
  }
}
const onUpdateFormValue = ({ id }) => {
  //页面上有添加微博用户数据的组件，同时又有下拉列表，这时不需要刷新下拉列表的选中属性，而是使用默认的配置提示
  if(id && item.id != id || selectedIndex < 0){
    return
  }
  let listItem = customList[selectedIndex]
  selectedValue.value = listItem && (listItem.name || listItem.text) || ''
}
const options = computed(() => {
  let lists_: any[] = []
  // commonAttr.isCustomData = true
  // {
  //   "西北地区": {
  //     "texts": ["新疆", "内蒙", "甘肃"],
  //     "index": 3
  //   },
  // }
  // customData = {
  //   "西北地区":["新疆","内蒙","甘肃"],
  // }
  // commonAttr.firstKey = "西北地区"
  // const firstKey = commonAttr.customDataFirstKey
  // lists_ = [{ values: Object.keys(customData) }, { values: customData[firstKey] }]
  // [{
  //   text:'西北地区',
  //   children:[{text:'新疆'},{text:'内蒙'},{text:'甘肃'}],
  // }]
  if(commonAttr.isCustomData) {
    customData = commonAttr.customData && JSON.parse(commonAttr.customData);
    _.forEach(customData, (item: any, key: string, index: number) => {
      const obj: any = {
        text: key,
        children: [],
        index,
      }
      if(_.isArray(item)) {
        _.forEach(item, (text: string) => {
          obj.children.push({ text })
        })
      } else {
        _.forEach(item.texts, (text: string) => {
          obj.children.push({ text })
        })
        obj.index = item.index
      }
      lists_.push(obj)
    })
    lists_ = _.sortBy(lists_, (item: any) => { return item.index })
  } else {
    if(isWbList(item)) {
      const wbLists = getWbListByItem(item)
        _.forEach(wbLists, (item: any, index: number) => {
          //好友列表 id name pic_url
          if(item.value) {
            lists_.push({text: item.name, value: item.value})
          }else{
            lists_.push({text: item.name, value: index})
          }
      })
    } else {
      const lists = getListByItem(item)
      _.forEach(lists, (item: any, index: number) => {
        lists_.push({text: item.text, value: index})
      })
    }
  }
  customList = lists_
  return lists_
})
const onHidePicker = () =>{
  showPicker.value = false
  const conAttr = { zIndex: item.conAttr.oriZIndex }
  useSite.updateComponentConAttr({ id: item.id, conAttr })
}
const onConfirm = (item: any, index: number) => {
  if(_.isArray(item)){
    let str = ''
    let len = item.length - 1
    _.forEach(item, (item_: any, index_: number) => {
      str += item_.text
      if(index_ != len) {
        str += "/"
      }
    })
    selectedText = selectedValue.value = str
    selectedIndex = index[0]
  } else {
    selectedText = selectedValue.value = item.text
    selectedIndex = index
  }
  updateFormValue()
  onHidePicker()
  dropdown.$el.style.color = commonAttr.color
}
const onPCConfirm = (index: number) => {
  selectedValue.value = options.value[index].value
  selectedText = options.value[index].text
  selectedIndex = index
  updateFormValue()
  updateInteractionData()

  // const jumpUrl = "dropdown_" + index
  // const comType = "click"
  // const wModule = "jump"
  // onPostStatics({ item, e: null, comType, wModule, jumpUrl, params: '', apiUri: '' })
}
const onShowPicker = () => {
  if(isH5Edit) return
  showPicker.value = true
  //解决ios bug 不能设置 bottom top不能理解为啥
  const swiperVertical = document.getElementsByClassName("swiper-container-vertical")[0]
  if(siteInfo.md.isIPhone && swiperVertical) {
    setTimeout(() => {
      const vanPopups = dropdown.getElementsByClassName("van-popup--bottom")
      _.forEach(vanPopups, (vanPopup: any) => {
        if(vanPopup) {
          removeClass(vanPopup, "van-popup--bottom")
          vanPopup.style.width = "100vw"
          vanPopup.style.height = "100vh"
          vanPopup.style.left = "0"
          vanPopup.style.right = "0"
        }
      })
    }, 50)
  }
  const conAttr = {
    zIndex: 20,
    oriZIndex: item.conAttr.zIndex
  }
  useSite.updateComponentConAttr({ id: item.id, conAttr })
}
const initComp = () => {
  EventBus.$off("refreshFriends", onUpdateFormValue)
  EventBus.$on("refreshFriends", onUpdateFormValue)

  selectedIndex = commonAttr.isDefaultSelected ? 0 : -1;
  let options_ = options.value
  if(commonAttr.isMenu || !siteInfo.md.isMobile) {
    selectedValue.value = options_[0] ? options_[0].value : ''
  } else {
    selectedValue.value = options_[0] ? options_[0].text : ''
    if(item.commonAttr.placeholder){
      selectedValue.value = item.commonAttr.placeholder
    }
  }
}

const refDom = ref<any>(null)
let dropdown: any
onMounted(() => {
  dropdown = refDom.value
})

onBeforeUnmount(() => {
  EventBus.$off("refreshFriends", onUpdateFormValue)
})
</script>


<style lang="scss">
.wb-dropdown {
  width: inherit;
  height: inherit;

  .van-dropdown-menu {
    width: inherit;
    background-color: transparent;

    .van-dropdown-item {
      width: inherit;
      left: auto;
      right: auto;
    }
    .van-dropdown-item__option {
      text-align: center;
    }
  }
  .van-icon {
    display: none;
  }
}
</style>