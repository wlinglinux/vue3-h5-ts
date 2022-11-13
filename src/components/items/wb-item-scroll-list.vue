<template>
  <div class="wb-scroll-container crop-con" :style="cropHeightStyle">
    <div class="crop-bg" :style="cropBgStyle">
      <ul class="selected-lists crop-middle" :style="cropMiddleStyle" :id="'crop-' + item.id">
        <li v-for="(item_, index) in selectedLists" :key="index" :style="getItemStyle(item_.position, item_)">
          <img :src="item_.resultUrl ? item_.resultUrl : item_.url">
        </li>
      </ul>
    </div>
    <img v-if="cropUrls && cropUrls[1]" :src="cropUrls[1]" class="crop-top" :style="getTopStyle">
    <img v-if="cropUrls && cropUrls[3]" :src="cropUrls[3]" class="crop-bottom" :style="getBottomStyle">
  </div>
</template>

<script setup lang="ts">
import { useSiteStore } from '@/store/site'
import { useInteractionStore } from '@/store/interaction'
import { COMMON_WID_HEI, BG_POSITION_REPEAT_TYPES_MAP } from '@/const/'
import { bgPositionStyle, getPxOVwByValue } from '@/utils/'
import { setNewMarginPadding } from '@/components/utils/'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
  selectedLists: ICarouselItem[],
}>()
const item = props.item
const commonAttr = item.commonAttr
const useSite = useSiteStore()
const useInteraction = useInteractionStore()
const isH5Edit = useSite.isH5Edit
let cropUrlsHeight: string[] = []
let cropUrls: string[] = []
let cropUlHeight = ref(100)
let cropDom: any
const initComp = () => {
  const cropUrlStr = commonAttr.cropUrls
  if(cropUrlStr) {
    cropUrls = cropUrlStr.split(',')
    if(cropUrls.length > 0) {
      if(commonAttr.cropUrlsHeight)
      cropUrlsHeight = commonAttr.cropUrlsHeight.split(",")
    }
  }
}
const computeCropUlHeight = () => {
  if(cropDom) {
    if(cropUrlsHeight && cropUrlsHeight.length === 4) {
      //背景,框上部,框中部拉伸,框下部的Url偏移量
      const cropUrlsOffsets: string[] = commonAttr.cropUrlsOffset.split(',')
      const bottomOffset = cropUrlsOffsets[3] ? _.parseInt(cropUrlsOffsets[3]) : 0
      cropUlHeight.value = cropDom.offsetHeight + Math.round((_.parseInt(cropUrlsHeight[1])+_.parseInt(cropUrlsHeight[3])+bottomOffset)/COMMON_WID_HEI.adaptiveScale)
    } else {
      cropUlHeight.value = cropDom.offsetHeight
    }
  }
}
const cropHeightStyle = computed(() => {
  if(isH5Edit) {
    return {}
  } else {
    const offsetHeight = _.parseInt(item.conAttr.height - cropUlHeight.value*COMMON_WID_HEI.adaptiveScale)
    const groupCompId = item.interactionData.groupCompId!
    const groupCompData = useSite.componentMap[groupCompId]
    // 更新截图打组容器属性高度和背景
    if(groupCompData) {
      const conAttr = {
        height: (groupCompData.conAttr.height_ - offsetHeight),
      }
      useSite.updateComponentConAttr({ id: groupCompId, conAttr })
    }
    return {
      height: cropUlHeight.value + 'px'
    }
  }
})
const cropBgStyle = computed(() => {
  const bg = cropUrls[0]
  if(bg) {
    const bgStyles_ = { backgroundImage: 'url(' + bg + ')' }
    bgPositionStyle(bgStyles_, BG_POSITION_REPEAT_TYPES_MAP.whole)
    return bgStyles_
  } else {
    return {}
  }
})
const cropMiddleStyle = computed(() => {
  const middleUrl = cropUrls[2]
  if(middleUrl) {
    const cropUrlsOffsets = commonAttr.cropUrlsOffset && commonAttr.cropUrlsOffset.split(',')
    let topOffset = 0
    if(cropUrlsOffsets) {
      topOffset = parseFloat(cropUrlsOffsets[1])
    }
    const style_ = {
      backgroundImage: 'url(' + middleUrl + ')',
      top: getPxOVwByValue(Math.round((_.parseInt(cropUrlsHeight[1]) + topOffset)/COMMON_WID_HEI.adaptiveScale)),
      height: ''
    }
    setNewMarginPadding(commonAttr, style_)
    return style_
  } else {
    return {}
  }
})
const getItemStyle = (positionStr: string, item: ICarouselItem) => {
  let style_ = {}
  if(commonAttr.isVerticalCenter) {
    style_ =  {
      margin: 0
    }
  } else {
    let position: string[] = positionStr.split(',')
    style_ = {
      width: getPxOVwByValue(_.parseInt(position[2])),
      height: getPxOVwByValue(_.parseInt(position[3])),
    }
  }
  return style_
}
const getTopStyle = computed(() => {
    //背景,框上部,框中部拉伸,框下部的Url偏移量
  return {
    height: getPxOVwByValue(cropUrlsHeight[1]),
  }
})
const getBottomStyle = computed(() => {
    //背景,框上部,框中部拉伸,框下部的Url偏移量
  return {
    height: getPxOVwByValue(cropUrlsHeight[3]),
  }
})

initComp()

onMounted(() => {
  if(!useSite.isH5Edit) {
    cropDom = document.getElementById('crop-' + item.id)
    computeCropUlHeight()
  }
})
</script>

<style lang="scss">
.selected-lists {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  padding-bottom: var(--size-24);
  li {
    display: inline-block;
    margin-top: var(--size-12);
    margin-bottom: var(--size-12);
  }
  img {
    width: 100%;
    object-fit: contain;
  }
}
.crop-con {
  .crop-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: 100% 100%;
  }
  .crop-top {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }
  .crop-middle {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    background-repeat: no-repeat;
    background-size: 100% 100%;

    img {
      width: 100%;
      object-fit: contain;
    }
  }
  .crop-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
  }
}
</style>