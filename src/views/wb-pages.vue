<template>
  <div v-if="pageId > 0 && pages.length > 0 && currentPage" :style="globalStyles" class="wid-hei-inherit">
    <global-share-components v-if="isDisplaySharePage"></global-share-components>
    <div :id="'page-' + pageId" :key="currentPage.id" :style="siteStyles">
      <!-- <div class="page"> -->
        <group-component :item="currentPage" :pageId="pageId" :popId="-1" :style="pageStyles"></group-component>
      <!-- </div> -->
    </div>
    <div v-if="siteAttrs.isDisplayDebuggerText" class="version"> {{ version }} </div>
  </div>
</template>

<script lang="ts" setup>
import { useSiteStore } from '@/store/site'
import { EventBus, getCompIdByParam, getPxOVwByValue } from '@/utils/'
import { isForbidMove, isFixIosForm, eventPostAddLoading } from './utils/'
import GlobalShareComponents from '@/views/global-share-components.vue'
import { COMMON_WID_HEI, COMPONENT_TYPES, LIST_TYPE_MAP, PAGE_TYPE } from '@/const'
import { searchComponentDataByCid } from '@/store/utils/'
import { useLoadsStore } from '@/store/loads'
import CssGsapAnimate from '@/components/animate/CssGsapAnimate'

const version = ref('版本v4.2')
const useSite = useSiteStore()
const siteAttrs = useSite.attrs
let setIntervalCb = -1

const pageId = computed(() => {
  return useSite.pageIndex + 1
})
const pages = computed(() => {
  return useSite.pages
})
const currentPage = computed(() => {
  return useSite.pages[useSite.pageIndex]
})

const isDisplaySharePage = _.size(useSite.isGlobalShareComponents) > 0 ? true : false

const globalStyles = computed(() => {
  const currentPage = useSite.pages[useSite.pageIndex]
  const styles_ = { width: '100vw', height: '100vh', overflow: 'hidden' }
  if(currentPage) {
    styles_.width = currentPage.styles.width
    styles_.height = currentPage.styles.height
  }
  return styles_
})
const siteStyles = computed(() => {
  const styles_: IPageStyles | any = _.cloneDeep(useSite.styles)
  const currentPage = useSite.pages[useSite.pageIndex]
  if(currentPage) {
    styles_.width = currentPage.styles.width
    styles_.height = currentPage.styles.height
  }
  return styles_
})
const pageStyles = computed(() => {
  let currentPage = useSite.pages[useSite.pageIndex]
  return currentPage && currentPage.styles
})
const scrollToTop = (element: any) => {
  element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' }) // block: 'end'
}
const onShowPage = (pageIndex: number) => {
  if(isLongAnimate) {
    getCurrentPageCssAnimateDoms()
  }
  document.body.scrollTop = 0
  scrollToTop(document.body)
  eventPostAddLoading()
  nextTick(() => {
    if(useSite.pageHaveForms[pageIndex]) {
      isFixIosForm()
    }
    let isForbid =  useSite.pageHaveScrollY[pageIndex] ? false : true
    isForbidMove(isForbid)
    const currentPage = useSite.pages[useSite.pageIndex]
    if(currentPage.isAdjustPageHeight) {
      const groupCompData = searchComponentDataByCid(COMPONENT_TYPES.group_carousel, currentPage)
      if(groupCompData && groupCompData.commonAttr.listType == LIST_TYPE_MAP.relative) {
        setIntervalCb = window.setInterval(() => {
          const dom = document.getElementById(groupCompData.id)
          if(dom) {
            window.clearInterval(setIntervalCb)
            onAdjustPageHeight(groupCompData.id)
          }
        }, useSite.siteInfo.reloadTime)
      }
    }
  })
}
const onAdjustPageHeight = (groupCompId: string) => {
  const groupCompData = useSite.componentMap[groupCompId]
  const currentPage = useSite.pages[useSite.pageIndex]
  const dom = document.getElementById(groupCompId)
  if(dom) {
    const bottomHeight = (currentPage.attrs.height - groupCompData.conAttr.top - groupCompData.conAttr.height)
    let pageHeight = dom.offsetHeight + (groupCompData.conAttr.top + bottomHeight)/COMMON_WID_HEI.adaptiveScale
    if(pageHeight < COMMON_WID_HEI.clientHeight) {
      pageHeight = COMMON_WID_HEI.clientHeight
    }
    useSite.updatePageAttr({ id: currentPage.id, styles: { height: (pageHeight + 'px') } })
    const compId = getCompIdByParam(groupCompData.commonAttr.heightCompId)
    if(compId) {
      const compData = useSite.componentMap[compId]
      const reallyHeight = pageHeight*COMMON_WID_HEI.adaptiveScale
      const top = reallyHeight - bottomHeight + compData.conAttr.height/2
      const conAttr = { top }
      useSite.updateComponentConAttr({ id: compId, conAttr })
    }
  }
}
const compIdDoms: string[] = []
const compIdIsPlayingMap: Object = {}
let isLongAnimate = false
const getCurrentPageCssAnimateDoms = () => {
  const pageId = "#page-" + (useSite.pageIndex+1)
  const pageDom = document.querySelector(pageId)
  const compDoms = pageDom?.getElementsByClassName('inject-con')
  const groupDoms = pageDom?.getElementsByClassName('group-component-con')
  if(groupDoms && groupDoms.length > 0) {
    _.concat(compDoms, groupDoms)
  }
  _.forEach(compDoms, (dom: HTMLDivElement) => {
    const compId = dom.id
    const compData = useSite.componentMap[compId]
    if(compData.animate && compData.animate.animates.length > 0) {
      compIdDoms.push(compId)
      compIdIsPlayingMap[compId] = false
    }
  })
}
const onScrollPlayAnimate = () => {
  _.forEach(compIdDoms, (compId: string) => {
    const dom: any = document.getElementById(compId)
    const rect = dom.getBoundingClientRect()
    const distanceTop = rect.top
    const distanceBottom = rect.bottom
    const compData = useSite.componentMap[compId]
    if(distanceTop > 0 && distanceTop < COMMON_WID_HEI.clientHeight/4) {
      if(!compIdIsPlayingMap[compId]) {
        compIdIsPlayingMap[compId] = true
        if(compData.eventShare && compData.eventShare.cssGsapAnimate) {
          compData.eventShare.cssGsapAnimate.playAnimateOrGsap()
        }
      }
    }
    if(distanceTop > COMMON_WID_HEI.clientHeight || distanceBottom < 0 && compIdIsPlayingMap[compId]) {
      compIdIsPlayingMap[compId] = false
    }
  })
}
const initComp = () => {
  EventBus.$on("showPage", onShowPage)
  EventBus.$on("adjustPageHeight", onAdjustPageHeight)
  // EventBus.$on("communiteComplete", () => {})
  const useLoads = useLoadsStore()
  const animates = useLoads.isLoadAnimate
  const siteAttrs = useSite.attrs
  if(siteAttrs.pageType == PAGE_TYPE.long && (_.size(animates.isAnimate) > 0 || _.size(animates.isGroupGsap) > 0 || _.size(animates.isGsap) > 0)) {
    isLongAnimate = true
    document.body.addEventListener('scroll', _.throttle(onScrollPlayAnimate, 200))
  }
}
initComp()
onMounted(() => {
  if(useSite.pageIndex >= 0) {
    onShowPage(useSite.pageIndex)
  }
})
onBeforeUnmount(() => {
  EventBus.$off("showPage", onShowPage)
  EventBus.$off("adjustPageHeight", onAdjustPageHeight)
})
</script>

<style lang="scss" scoped>
.version {
  position: absolute;
  top: 0;
  left: 0;
  color: silver;
  font-size: 0.4rem;
  z-index: 1000;
  background-color: aliceblue;
}
</style>