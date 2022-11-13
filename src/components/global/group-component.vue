<template>
  <div v-if="item.commonAttr" :class="getGroupClass" :style="scaleCompStyle" :id="item.id" ref="injectTemplate">
    <template v-for="(item_, i) in domComponents" :key="item_.id + '_' + i">
      <component :is="item_.type" :item="item_" :pageId="pageId" :popId="popId" :style="getConstyles(item_)"></component>
    </template>
  </div>
  <div v-else :style="scaleCompStyle" class="page-con">
    <template v-for="(item_, i) in domComponents" :key="item_.id + '_' + i">
      <component :is="item_.type" :item="item_" :pageId="pageId" :popId="popId" :style="getConstyles(item_)"></component>
    </template>
  </div>
</template>

<script setup lang="ts">
import { DOM_CID, CREATEJS_CID, PAGE_TYPE, COMMON_WID_HEI, INJECT_GROUP_CLASS_NAME_MAP, COMPONENT_TYPES } from '@/const/'
import CssGsapAnimate from '@/components/animate/CssGsapAnimate'
import { ANIMATE_TRIGGER_TYPE_MAP, BG_POSITION_REPEAT_TYPES_MAP } from '@/const/'
import { useSiteStore } from '@/store/site'
import { bgPositionStyle, getPxOVwByValue, isHasOwnProperty } from '@/utils/'
import { ADD_COMP_ATTR } from '@/store/models/component-default-data'
import { EventBus } from '@/utils'


interface Props {
  item: IComponent,
  pageId: number,
  popId: number
}
const props = withDefaults(defineProps<Props>(), {
  pageId: -1,
  popId: -1,
})

const item = props.item
const commonAttr = item.commonAttr

const siteStore = useSiteStore()
const isH5Edit = siteStore.isH5Edit
const siteInfo = siteStore.siteInfo
const siteAttrs = siteStore.attrs
const pageIndex = siteStore.pageIndex
const popIndex = siteStore.popIndex
const pages = siteStore.pages
const pops = siteStore.pops

const scaleCompStyle = computed(() => {
  const styles: any = {}
  if(commonAttr && isHasOwnProperty(commonAttr, "opacity")){
    styles.opacity = commonAttr.opacity
  }
  const conAttr = item.conAttr
  //是组件，不是页面
  if(!isH5Edit && conAttr && siteAttrs.pageType == PAGE_TYPE.single && conAttr.realTop > 0){
    const scale_ = getScale(conAttr)
    styles['transform-origin'] = 'top'
    styles['transform'] = 'scale(' + scale_ + ')'
  }
  return styles
})

const domComponents = computed(() => {
  if(isH5Edit) {
    const components: IComponent[] = []
    const minCid: number = DOM_CID
    const maxCid: number = CREATEJS_CID
    _.forEach(item.components, (component: IComponent) => {
      let cid = component.cid
      if (cid >= minCid && cid < maxCid || component.components && component.components.length > 0) {
        components.push(component)
      }
    })
    return components
  } else {
    return item.components
  }
})

const getConstyles = (item_: IComponent) => {
  const conAttr: IConAttr = item_.conAttr
  const conStyles = _.cloneDeep(ADD_COMP_ATTR.conStyles)
  _.forEach(conStyles, (value: any, key: string) => {
    if(key == 'zIndex' || key == 'position') {
      if(isHasOwnProperty(conAttr, key)) {
        conStyles[key] = conAttr[key]
      }
    } else {
      conStyles[key] = getPxOVwByValue(conAttr[key])          
    }
  })
  if(!isH5Edit) {
    if(isHasOwnProperty(item_, 'conStyles')) {
      _.forEach(item_.conStyles, (value: any, key: string) => {
        conStyles[key] = value
      })
    }
    if(item_.cid == COMPONENT_TYPES.group_component && isHasOwnProperty(item_.commonAttr, 'bgUrl')) {
      conStyles.backgroundImage = 'url(' + item_.commonAttr.bgUrl + ')'
      bgPositionStyle(conStyles, BG_POSITION_REPEAT_TYPES_MAP.whole)
    }
  }
  //是组件，不是页面
  if(!isH5Edit && conAttr && siteAttrs.pageType == PAGE_TYPE.single && (conAttr.realTop > 0 || conAttr.otherCompHeight > 0)){
    let clientHeight = COMMON_WID_HEI.clientHeight
    let reallyHeight = clientHeight*COMMON_WID_HEI.adaptiveScale
    if(COMMON_WID_HEI.adaptiveScale <= 1 && !siteInfo.md.isMobile){
      reallyHeight = clientHeight
      let currentPage: IPage = popIndex > 0 ? pops[popIndex] : pages[pageIndex]
      if(reallyHeight < currentPage.attrs.height) {
        reallyHeight = currentPage.attrs.height
      }
    }
    let top = 0
    if(conAttr.realTop > 0) {
      const scale_ = getScale(conAttr)
      const bottom = COMMON_WID_HEI.height - conAttr.top - conAttr.height
      const compHei = conAttr.height
      //设计稿是750
      //只缩小，不放大，因此需要加上绝对值 reallyHeight > compHei那么就是高度比较高，也需要在调整一下bottom的值
      if(conAttr.realTop == 1) {
        top = 0
        //顶部，只是缩放
      } else {
        top = (reallyHeight - conAttr.realTop - bottom - compHei*scale_)/2 + conAttr.realTop
      }
    }
    if(conAttr.otherCompHeight > 0) {
      let difHeight = clientHeight*COMMON_WID_HEI.adaptiveScale - (conAttr.height + conAttr.otherCompHeight)
      //需要调整的组件在顶部，那么上部会被切掉，居中显示
      if(conAttr.top == 0) {
        top = difHeight/2
      } else {
        if(difHeight < 0) {
          difHeight = 0
        }
        top = reallyHeight - difHeight/2 - conAttr.height
      }
    }
    conStyles.top = getPxOVwByValue(top)
  }
  return conStyles
}

const getScale = (conAttr: IConAttr) => {
  const compHei = conAttr.height
  const bottom = COMMON_WID_HEI.height - conAttr.initTop - conAttr.height
  const clientHeight = COMMON_WID_HEI.clientHeight
  let reallyHeight: number = clientHeight*COMMON_WID_HEI.adaptiveScale
  if(COMMON_WID_HEI.adaptiveScale <= 1 && !siteInfo.md.isMobile){
    reallyHeight = clientHeight
    const currentPage = popIndex > 0 ? pops[popIndex] : pages[pageIndex]
    if(reallyHeight < currentPage.attrs.height) {
      reallyHeight = currentPage.attrs.height
    }
  }
  //计算组件的应该有的真实高度与实际高度的比例
  //let pageCompHei = COMMON_WID_HEI.height - conAttr.realTop - bottom
  //在依赖移动设备的高度动态的计算组件的高度
  let pageCompHei = reallyHeight - (conAttr.realTop + bottom)
  if(conAttr.realTop == 1) {
    pageCompHei = reallyHeight
  }
  let scale = 1
  if(compHei > pageCompHei) {
    scale = pageCompHei/compHei
  }
  return scale
}

const getGroupClass = computed(() =>{
  const classes: any[] = []
  const animateClass = {
    'group-component-con': true,
    'wid-hei-inherit': item.components && item.components.length > 0 ? false : true,
    isHiddenComp: !item.commonAttr.isVisible,
  }
  classes.push(animateClass)
  if(commonAttr.isDisplayY) {
    classes.push('scrollbar')
    classes.push(commonAttr.scrollbarType)
  }
  return classes
})
const onPlayAnimate = (id: string) => {
  if(item.id == id) {
    if(item.eventShare && item.eventShare.cssGsapAnimate) {
      item.eventShare.cssGsapAnimate.onPlayAnimate()
    } else {
      const cssGsapAnimate = new CssGsapAnimate(item)
      cssGsapAnimate.onPlayAnimate()
    }
  }
}
watch(
  () => item.active,
  (newVal, oldVal) => {
    if(!(props.pageId == -1 && props.popId == -1)) {
      if(isH5Edit && newVal != oldVal) {
        if(newVal) {
          EventBus.$on("playAnimate", onPlayAnimate)
        } else {
          EventBus.$off("playAnimate", onPlayAnimate)
        }
      }
    }
  },
  { immediate: true }
)
onMounted(() => {
  if(!item.cid || isH5Edit) {
    return
  }
  const animate: IAnimation = item.animate
  const isCssAnimate = animate && animate.animates.length > 0 ? true : false
  if(isCssAnimate || animate && animate.isGsap) {
    if(animate.triggerType == ANIMATE_TRIGGER_TYPE_MAP.auto) {
      const cssGsapAnimate = new CssGsapAnimate(item)
      cssGsapAnimate.loadImgPlayAnimate()
    }
  }
})

</script>

<script lang="ts">
const components = {
  GroupCarousel: defineAsyncComponent(() => import('@/components/lists/group-carousel.vue')),
  WbCommonList: defineAsyncComponent(() => import('@/components/lists/wb-common-list.vue')),
  WbIsPostEvent: defineAsyncComponent(() => import('@/components/global/wb-is-post-event.vue')),
  // GroupComponent: defineAsyncComponent(() => import('@/components/global/group-component.vue')),
  // WbImg: defineAsyncComponent(() => import('@/components/common/wb-img.vue')),
  // WbBg: defineAsyncComponent(() => import('@/components/common/wb-bg.vue')),
  WbText: defineAsyncComponent(() => import('@/components/common/wb-text.vue')),
  WbTimer: defineAsyncComponent(() => import('@/components/common/wb-timer.vue')),
  WbProcess: defineAsyncComponent(() => import('@/components/common/wb-process.vue')),
  WbVideo: defineAsyncComponent(() => import('@/components/common/wb-video.vue')),  
  WbScrollContainer: defineAsyncComponent(() => import('@/components/common/wb-scroll-container.vue')),  
  WbMenu: defineAsyncComponent(() => import('@/components/common/wb-menu.vue')),
  WbMoveable: defineAsyncComponent(() => import('@/components/common/wb-moveable.vue')),
  WbCamera: defineAsyncComponent(() => import('@/components/common/wb-camera.vue')),
  WbImgs: defineAsyncComponent(() => import('@/components/common/wb-imgs.vue')),
  WbCalendar: defineAsyncComponent(() => import('@/components/common/wb-calendar.vue')),
  WbAudio: defineAsyncComponent(() => import('@/components/common/wb-audio.vue')),
  WbSlotMachine: defineAsyncComponent(() => import('@/components/common/wb-slot-machine.vue')),
  WbTurnBook: defineAsyncComponent(() => import('@/components/common/wb-turn-book.vue')),
  WbSvgIcon: defineAsyncComponent(() => import('@/components/common/wb-svg-icon.vue')),
  WbInput: defineAsyncComponent(() => import('@/components/form/wb-input.vue')),  
  WbBtn: defineAsyncComponent(() => import('@/components/form/wb-btn.vue')),
  WbAddress: defineAsyncComponent(() => import('@/components/form/wb-address.vue')),
  WbCheckbox: defineAsyncComponent(() => import('@/components/form/wb-checkbox.vue')),
  WbDropdown: defineAsyncComponent(() => import('@/components/form/wb-dropdown.vue')),
  WbRadio: defineAsyncComponent(() => import('@/components/form/wb-radio.vue')),
  WbUpload: defineAsyncComponent(() => import('@/components/form/wb-upload.vue')),
  WbMc: defineAsyncComponent(() => import('@/components/games/createjs/wb-mc.vue')),
  WbPixis: defineAsyncComponent(() => import('@/components/games/pixijs/wb-pixis.vue')),
  WbPaper: defineAsyncComponent(() => import('@/components/games/paperjs/wb-paper.vue')),
  WbPanorama: defineAsyncComponent(() => import('@/components/games/threejs/wb-panorama.vue')),
  WbThrees: defineAsyncComponent(() => import('@/components/games/threejs/wb-threes.vue')),
}
export default defineComponent({
  // props: ['item', 'pageId', 'popId'],
  // setup() {
  //   let injectJsClass: any = null
  //   return {
  //     injectJsClass
  //   }
  // },
  components,
  created() {
    this.item.vueInjectContainer = this
    const siteStore = useSiteStore()
    if(!siteStore.isH5Edit && this.item.cid) {
      this.item.vueInjectContainer = this
      let item_ = this.item
      if(item_.commonAttr && item_.commonAttr.injectJsClass) {
        if(INJECT_GROUP_CLASS_NAME_MAP[item_.commonAttr.injectJsClass]) {
          import(`../../dynamis-ts/group-inject/${item_.commonAttr.injectJsClass}.ts`).then((module) => {
            // @ts-ignore
            this.injectJsClass = new module.default(item_)
          })
        }
      }
    }
  },
  mounted() {
    const siteStore = useSiteStore()
    if(!siteStore.isH5Edit && this.item.cid) {
      this.item.interactionData.vueContainer = this
    }
  },
  beforeUnmount() {
    // @ts-ignore
    if(this.injectJsClass) {
      // @ts-ignore
      this.injectJsClass.destroy()
    }
  }
})
</script>