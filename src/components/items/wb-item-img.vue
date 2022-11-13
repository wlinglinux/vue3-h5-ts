<template>
  <img v-if="getImgUrl && isLazy" :data-id="item.id" class="wb-img" v-lazy="getImgUrl" :style="styles" @load="onImgLoaded"  @click="onSelected($event)"/>
  <img v-else-if="getImgUrl" :data-id="item.id" class="wb-img" :src="getImgUrl" :style="styles" :class="props.classes" @load="onImgLoaded" @click="onSelected" :crossorigin="crossOriginStr"/>
</template>

<script setup lang="ts">
import { getCompStyle, getDataKeyValue, getAttrByCustom } from '@/components/utils/'
import { PAGE_TYPE, COMMON_WID_HEI } from '@/const/'
import { useInteractionStore } from '@/store/interaction'
import { useSiteStore } from '@/store/site'
import { getCompIdByParam, EventBus } from '@/utils/'
import { rotate3dEvent } from '@/components/events/fronts/'

interface Props {
  item: IComponent,
  pageId: number,
  popId: number,
  classes?: any,
}
const props = withDefaults(defineProps<Props>(), {
  classes: []
})
const item = props.item
const commonAttr = item.commonAttr
const styles = computed(() => {
  const styles_ = getCompStyle(item)
  if(commonAttr.filter && commonAttr.filter.isGrayscale) {
    styles_['-webkit-filter'] = 'grayscale('+commonAttr.filter.grayscale+')'
  }
  return styles_
})
const useSite = useSiteStore()
const componentMap = useSite.componentMap
const useInteraction = useInteractionStore()
const pageId = props.pageId
const popId = props.popId
const isH5Edit = useSite.isH5Edit
const interactionData = item.interactionData
let isRotate3dData: boolean = false
let isRefresh: boolean = false
let isSelected: boolean = false
const imgUrl = ref(commonAttr.url)
const crossOriginStr: any = item.commonAttr.relateAttrCompId ? 'anonymous' : ''
const isLazy = computed(() => {
  if(useSite.isSwiper || useSite.attrs.pageType == PAGE_TYPE.long && item.conAttr.top/COMMON_WID_HEI.adaptiveScale > COMMON_WID_HEI.clientHeight*2) {
    return true
  } else {
    return false
  }
})
const getImgUrl = computed(() => {
  if(isH5Edit) {
    return commonAttr.url
  } else {
    //relateAttrCompId 站点id 655 新年许愿管
    if(commonAttr.isDynamic && useInteraction.shareData.url) {
      return useInteraction.shareData.url
    }
    if(isRefresh) {
      return imgUrl.value
    } else {
      const pageIndex = useSite.pageIndex
      if(popId && popId > 0 || pageId && pageId == (pageIndex + 1) || item.commonAttr.isPageFixed || item.interactionData.isInGroup) {
        return commonAttr.url
      } else {
        return ''
      }
    }
  }
})
//methods
const onSelected = (e: Event) => {
  if(isH5Edit) {
    return
  }
  interactionData.isSelected = isSelected = !isSelected
  if(commonAttr.relateAttrCompId) {
    const relateAttrCompId = getCompIdByParam(commonAttr.relateAttrCompId)
    const relateCompData = useSite.componentMap[relateAttrCompId]
    relateCompData.interactionData.isSelected = item.interactionData.isSelected
  }
}

const initComp = () => {
  if(commonAttr.isDynamic) {
    imgUrl.value = ''
  } else {
    imgUrl.value = commonAttr.url
  }
  if(isH5Edit) {
    EventBus.$on('refreshCommonAttr', onRefreshCommonAttr)
    return
  }
  let isSelected_: boolean = item.interactionData.isSelected || false
  if(commonAttr.relateAttrCompId) {
    const relateAttrCompId = getCompIdByParam(commonAttr.relateAttrCompId)
    const relateCompData = useSite.componentMap[relateAttrCompId]
    isSelected_ = relateCompData.interactionData.isSelected || false
  }
  interactionData.isSelected = isSelected = isSelected_
  // EventBus.$on("refreshImgStyles", onRefreshImgStyles)
  const rotate3dEvent = item.events.rotate3d
  if(rotate3dEvent && (rotate3dEvent.mouseBehavior == "data")) {
    isRotate3dData = true
  }
  let relateAttrCompId = getCompIdByParam(commonAttr.relateAttrCompId)
  if(commonAttr.dataKey || relateAttrCompId || commonAttr.isDynamic || isRotate3dData) {
    isRefresh = true
    EventBus.$on("refreshDynamicData", onRefreshImgUrl)
  }
  onRefreshImgUrl()
}
const onRefreshImgUrl = () => {
  let url = commonAttr.url
  if(isH5Edit) {
    url =  commonAttr.url
  } else {
    //relateAttrCompId 站点id 655 新年许愿管
    if(commonAttr.isDynamic && useInteraction.shareData.url) {
      url = useInteraction.shareData.url
    }
    if(isRefresh) {
      url = refreshImgUrl()
    } else {
      const pageIndex = useSite.pageIndex
      if(popId && popId > 0 || pageId && pageId == (pageIndex + 1) || item.commonAttr.isPageFixed) {
        url =  commonAttr.url
      } else {
        url =  ''
      }
    }
  }
  if(url && imgUrl.value != url) {
    imgUrl.value = url
  }
}

const refreshImgUrl = () => {
  let url = imgUrl.value
  const relateAttrCompId = getCompIdByParam(commonAttr.relateAttrCompId)
  const relateComponentData = componentMap[relateAttrCompId]

  if(commonAttr.dataKey) {
    let url_: string = ''
    if(relateComponentData) {
      url_ = getDataKeyValue(relateComponentData, item, '')
    } else if(commonAttr.dataKey == "custom") {
      url_ = getAttrByCustom(item, item, '')
    }
    if(url_) {
      url = url_
    }
  } else if(relateAttrCompId && relateComponentData) {
    //wb-camera 截图传过来的值 站点id 654 王一博 的壁纸女孩 wb-upload 
    const relateCommonAttr = relateComponentData.commonAttr
    let url_ = relateCommonAttr.cropUploadImgUrl || relateCommonAttr.url
    if(url_) {
      url = url_
      if(commonAttr.isForm) {
        useInteraction.updateFormValueMap({
          id: item.id,
          url,
        })
      }
    }
  } else if(isRotate3dData) {
    //数据来自自身，随机一个索引 获取一个图片，不能使用自定义数据 703 3d旋转随机获取一个图片后截图保存给发博提供数据
    url = rotate3dEvent(item, item.events.rotate3d)
  }
  // 动态文本 也可以从图片name中获取键值，或者是默认的shareData中的url
  if(commonAttr.isDynamic && useInteraction.shareData.url) {
    url = useInteraction.shareData.url
  }
  return url
}
const onImgLoaded = () => {
  if(!isH5Edit) {
    interactionData.isLoaded = true
  }
}
const onRefreshCommonAttr = (id: string) => { 
  if(item.id != id) {
    return
  }

}
const onRefreshImgStyles = ({ id }) => {
  if(id == item.id) {
    
  }
}

initComp()
onMounted(() => {
})

// watch(
//   () => item.interactionData.isSelected,
//   (newVal, oldVal) => {
//     if(newVal != oldVal) {
//       debugger
//     }
//   },
//   {
//     immediate: true, // 立即执行
//     deep: true // 深度监听
//   }
// )

onBeforeUnmount(() => {
  if(isH5Edit) {
    EventBus.$off('refreshCommonAttr', onRefreshCommonAttr)
    return
  }
  if(isRefresh) {
    EventBus.$off("refreshDynamicData", onRefreshImgUrl)
  }
  // EventBus.$off("refreshImgStyles", onRefreshImgStyles)
  item.interactionData.isLoaded = false
  isRefresh = false
  imgUrl.value = ''
  isRotate3dData = false
})

</script>

<style lang="scss">
.wb-img {
  width: inherit;
  height: inherit;
}
</style>