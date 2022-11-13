<template>
  <div v-if="popId > 0 && pops.length > 0 && currentPage" class="pops-con" :style="siteStyles">
    <div :id="'pop-' + popId" :key="currentPage.id" class="pop-con" :style="pageStyles">
      <group-component :item="currentPage" :pageId="-1" :popId="popId"></group-component>
      <i class="jy-icon-layer-closed btn-close" @click="onClose" :class="{ isHideBtnClose: setIsHideBtnClose(currentPage) }"></i>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useSiteStore } from '@/store/site'
import { getPxOVwByValue, EventBus } from '@/utils/'
import { COMMON_WID_HEI, COMPONENT_TYPES } from '@/const/'
import { PageStyles } from '@/store/models/site'
import { isForbidMove, isFixIosForm, eventPostAddLoading } from './utils/'
import { useInteractionStore } from '@/store/interaction'

const useSite = useSiteStore()
const siteInfo = useSite.siteInfo

const popId = computed(() => {
  return useSite.popIndex + 1
})
const pops = computed(() => {
  return useSite.pops
})
const currentPage = computed(() => {
  return useSite.pops[useSite.popIndex]
})
let popTimer: number = -1


const siteStyles = computed(() => {
  const currentPage = useSite.pops[useSite.popIndex]
  let styles_: IPageStyles | any = new PageStyles()
  if(currentPage && currentPage.attrs.isPopUseSiteBg) {
    styles_ = _.cloneDeep(useSite.styles)
    // @ts-ignore
    delete styles_.width
    // @ts-ignore
    delete styles_.height
  }
  styles_.width = currentPage ? currentPage.styles.width : getPxOVwByValue(COMMON_WID_HEI.clientWidth)
  styles_.height = currentPage ? currentPage.styles.height : getPxOVwByValue(COMMON_WID_HEI.clientHeight)
  if(siteInfo.md.isMobile) {
    styles_.margin = "0 0"
  } else {
    const wid = currentPage ? currentPage.attrs.width : COMMON_WID_HEI.clientWidth
    styles_.margin = "0 " + getPxOVwByValue((COMMON_WID_HEI.clientWidth - wid)/2) + ""
  }
  return styles_
})
const pageStyles = computed(() => {
  const currentPage = useSite.pops[useSite.popIndex]
  return currentPage && currentPage.styles
})

const setIsHideBtnClose = (pageOrGroup: IPage) => {
  let isHiddenBtnClose_ = false
  if(pageOrGroup && pageOrGroup.attrs.isAutoClose){
    isHiddenBtnClose_ = true
    return isHiddenBtnClose_
  }
  return isHideBtnClose(pageOrGroup)
}
const isHideBtnClose = (pageOrGroup: IGroup) => {
  let isHiddenBtnClose_ = false
  const len = pageOrGroup.components.length
  for(let i = 0; i < len; i++){
    const componentData_ = pageOrGroup.components[i]
    if (componentData_.events && componentData_.events.layerClose) {
      isHiddenBtnClose_ = true
      break;
    }
    if (componentData_.components && componentData_.components.length > 0) {
      isHiddenBtnClose_ = isHideBtnClose(componentData_)
    }
  }
  return isHiddenBtnClose_
}
const showPop = (popIndex: number) => {
  eventPostAddLoading()
  const currentPage = useSite.pops[useSite.popIndex]
  if (currentPage.attrs.isAutoClose) {
    window.clearTimeout(popTimer)
    const delayTime = Number(currentPage.attrs.delayTime) * 1000 || 1000
    popTimer = window.setTimeout(() => {
      onClose()
    }, delayTime)
  }
  if(useSite.pageHaveForms[popIndex]) {
    isFixIosForm()
  }
  nextTick(() => {
    isForbidMove(false)
  })
}
const setIsResetShare = (currentPage: any) => {
  let isResetShare = false
  _.forEach(currentPage.components, (componentData: IComponent) => {
    if(componentData.components && componentData.components.length > 0){
      isResetShare = setIsResetShare(componentData)
      if(isResetShare) {
        return isResetShare
      }
    }else if(componentData.cid == COMPONENT_TYPES.wb_img || componentData.cid == COMPONENT_TYPES.wb_text) {
      if(componentData.commonAttr.isDynamic){
        isResetShare = true
        return isResetShare
      }
    }
  })
  return isResetShare
}
const onClose = () => {
  window.clearTimeout(popTimer)
  let currentPage = useSite.pops[useSite.popIndex]
  EventBus.$emit("rotate3d", { isPlay: false })
  let isResetShare = false
  if(currentPage && currentPage.components) {
    isResetShare = setIsResetShare(currentPage)
  }
  if(isResetShare) {
    useInteractionStore().updateShareData({})
  }
  useSite.updatePopIndex(-1)
  let isForbid =  useSite.pageHaveScrollY[useSite.pageIndex] ? false : true
  isForbidMove(isForbid)
}

EventBus.$on("showPop", showPop)
EventBus.$on("closePop", onClose)
// EventBus.$on("communiteComplete", () => {})
onBeforeUnmount(() => {
  EventBus.$off("showPop", showPop)
  EventBus.$off("closePop", onClose)
})
</script>


<style lang="scss">
.pops-con {
  position: fixed;
  top: 0;
  left: 0;
  width: inherit;
  height: inherit;
  z-index: 1000;
}
.pop-con {
  width: inherit;
  height: inherit;
}

.pop-con .btn-close {
  position: absolute;
  right: var(--size-20);
  top: var(--size-20);
  font-size: var(--size-40);
  color: #ffffff;
  z-index: 100;
}
</style>