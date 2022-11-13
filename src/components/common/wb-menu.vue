<template>
  <inject-template :item="item" :pageId="pageId" :popId="popId">
    <template v-slot:common>
      <ul :class="{'wb-memu': true,'isFixed': isFixed}">
        <li v-for="(item_, index) in lists_" :key="item.id + '-' + index" :style="tabStyles[index]" @click.stop="onMenuClick($event, index)">
          <img v-if="item_.url" :src="item_.url" :style="imgStyles">
          <i v-else :class="item_.icon"></i>
          <p v-if="item_.title">{{item_.title}}</p>
        </li>
      </ul>
    </template>
  </inject-template>
</template>

<script setup lang="ts">
import { EVENT_HOVER_TYPES, COMMON_WID_HEI } from '@/const/'
import { EventBus, getCompIdByParam, getPxOVwByValue, isJSON } from '@/utils/'
import { openLinkBySelfUrl, setNewMarginPadding, showPage, showPop, getListByItem, fontStyle } from '@/components/utils/'
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
const isH5Edit = useSite.isH5Edit
const componentMap = useSite.componentMap
const lists_ = computed(() => {
  return getListByItem(item)
})

const tabStyles: any = reactive([])
const isFixed = ref(false)

let baseDom: any = null
const imgStyles = computed(() => {
  return {
    width: getPxOVwByValue(commonAttr.width),
    height: getPxOVwByValue(commonAttr.height),
  }
})

let tabStyle: any =  {},
    tabSelectedStyle: any =  {},
    anchors: any[] =  [],
    intervalFunc =  -1,
    isClick =  false,
    interval =  -1,
    extraNum =  0,
    tabIndex =  0,
    menuHeight = 0

const initTabStyle = () => {
  const style: any = {}
  const borderRadius = getPxOVwByValue(commonAttr.borderRadius)
  style.borderRadius = borderRadius + ' ' + borderRadius + ' ' + '0 0'
  fontStyle(commonAttr, style)
  setNewMarginPadding(commonAttr, style)

  _.merge(tabSelectedStyle, style)
 tabSelectedStyle.backgroundColor = commonAttr.seletedBgColor
 tabSelectedStyle.color = commonAttr.selectedColor

  _.merge(tabStyle, style)
 tabStyle.backgroundColor = commonAttr.backgroundColor
 tabStyle.color = commonAttr.color
}

const slideTo = ({ slideIndex }) => {
  tabIndex = parseInt(slideIndex)
  initTabStyle()
  refreshTab()
}
const refreshTab = () => {
  if(isH5Edit){
    return
  }
  while(tabStyles.length > 0) {
    tabStyles.pop()
  }
  const lists = lists_.value
  _.forEach(lists, (listItem: IListItem) => {
    tabStyles.push(tabStyle)
    listItem.url = listItem.commonUrl
  })
  tabStyles[tabIndex] = tabSelectedStyle
  if(lists[tabIndex].selectedBgUrl) {
    lists[tabIndex].url = lists[tabIndex].selectedBgUrl
  }
  //强制tab按钮渲染，不可删除这行代码，虽然看着没啥用
  // tabStyles = _.cloneDeep(tabStyles)
}

const onScroll = () => {
  let scrolled = baseDom.scrollTop || document.documentElement.scrollTop 
  let len = anchors.length - 1
  for(let i = 0; i < len; i++){
    if(scrolled >= anchors[len].scrollTop - extraNum) {
      tabIndex = len
      initTabStyle()
      refreshTab()
      break
    } else if (scrolled >= anchors[i].scrollTop - extraNum && scrolled  < anchors[i+1].scrollTop - extraNum) {
      tabIndex = i
      initTabStyle()
      refreshTab()
      break
    }
  }
}
const handleScroll = () => {
  let currentScrollTop = baseDom.scrollTop || document.documentElement.scrollTop 
  let menu: HTMLElement = document.getElementById(item.id)!
  if( commonAttr.isFixed ) {
    if(currentScrollTop  >= menu.offsetTop){
      isFixed.value = true
      if(!isClick) {
        extraNum = menuHeight
        onScroll()
      }
    } else {
      isFixed.value = false
    }
  }else {
    if(!isClick) {
      onScroll()
    }
  }
}
const scrollToTop = (scrollTop: number, extraNum = 60) =>{
  baseDom.scrollTo({top: scrollTop - extraNum, behavior: 'smooth'})
}
const onMenuClick = (e: any, itemIndex: number) => {
  isClick = true
  tabIndex = itemIndex
  initTabStyle()
  refreshTab()
  commonAttr.itemIndex = itemIndex
  const lists = lists_.value
  //组件的固有点击事件
  // if(item.cid == COMPONENT_TYPES.wb_menu){
    //1 网页链接、2 页面跳转、3 弹层页面
    let item_ = lists[itemIndex]
    // let jumpUrl = item_.value
    if(item_.eventType == EVENT_HOVER_TYPES.link) {
      if(item_.value.indexOf("http") != -1 || item_.value.indexOf("sinaweibo") != -1) {
        openLinkBySelfUrl(item_.value);
      }
    }else if(item_.eventType == EVENT_HOVER_TYPES.anchor) {
      let pageId: number = _.parseInt(item_.value)
      showPage(pageId, item)
    }else if(item_.eventType == EVENT_HOVER_TYPES.layer) {
      let popId = _.parseInt(item_.value)//.replace(/[^0-9]/ig,"")
      showPop(popId)
    }else if(item_.eventType == EVENT_HOVER_TYPES.anchorInPage) {
      let relateAnchorCompId = item_.value
      let scrollToDom: any = document.getElementById(relateAnchorCompId)
      if(scrollToDom) {
        if(commonAttr.isFixed){
          // 站点2456 吸顶菜单
          scrollToTop(scrollToDom.offsetTop, menuHeight)
        }else{
          // 长页面 和 普通页面
          const currentPage = useSite.pages[props.pageId - 1]
          scrollToTop(scrollToDom.offsetTop, extraNum)
        }
        interval = window.setInterval(()=>{
          if(_.parseInt(scrollToDom.offsetTop - menuHeight) ==  _.parseInt(baseDom.scrollTop)){
            window.clearInterval(interval)
            isClick = false
          }
        }, 100)
      }
    }else if(item_.eventType == 'compVisibleInComps'){
      useInteraction.resetVisibleComponents()
      let relateAnchorCompId = getCompIdByParam(item_.value) || item_.value
      let commonAttr = { isVisible: true }
      useInteraction.updateComponentVisible({ id: relateAnchorCompId, commonAttr })
      //触发懒加载 加载 图片
      baseDom.scrollTop = baseDom.scrollTop + 1
      baseDom.scrollTop = baseDom.scrollTop - 1
      let relateAnchorCompData = componentMap[relateAnchorCompId];
      let heightEffectParams = item.commonAttr.heightEffectParams;//{distanceBottom:500,compId:""} 1789
      let heightEffectObj: any = {}
      let pageHeight = 0;
      if(relateAnchorCompData) {
        if(heightEffectParams && isJSON(heightEffectParams)){
          heightEffectObj = JSON.parse(heightEffectParams);
          pageHeight = relateAnchorCompData.conAttr.top + relateAnchorCompData.conAttr.height + parseInt(heightEffectObj.distanceBottom);
          //更新组件位置 2032 510国货大赏{"distanceBottom":500,"compId":"19133ff3-b964-4cf8-a9f0-8deb6649947d","top":40}
          nextTick(() => {
            let compId = heightEffectObj.compId;
            let relateAnchorCompData = componentMap[relateAnchorCompId];
            let top = heightEffectObj.top ? heightEffectObj.top : 20;
            const conAttr = {
              top: (relateAnchorCompData.conAttr.top + relateAnchorCompData.conAttr.height + top)
            }
            useSite.updateComponentConAttr({ id: compId, conAttr })
          })
        }else{
          pageHeight = relateAnchorCompData.conAttr.top + relateAnchorCompData.conAttr.height;
        }
        // 更新页面的高度
        const currentPage = useSite.pages[props.pageId - 1];
        useSite.updatePageAttr({ id: currentPage.id, styles: { height: getPxOVwByValue(pageHeight) } })
      }
    }
    // const jumpUrl = "wb-menu-" + itemIndex
    // const comType = "click"
    // const wModule = "jump"
    // onPostStatics({ item, e: null, comType, wModule,  jumpUrl, params: '', apiUri: '' })
  // }
}

const onRefreshCommonAttr = (id: string) => { 
  if(item.id != id) {
    return
  }
  initTabStyle()
}

const initComp = () => {
  initTabStyle()
  const lists = lists_.value
  _.forEach(lists , (listItem: IListItem) => {
    tabStyles.push(tabStyle)
    listItem.commonUrl = listItem.url
  })
  tabIndex = parseInt(commonAttr.tabIndex)


  if(isH5Edit) {
    EventBus.$on('refreshCommonAttr', onRefreshCommonAttr)
    return
  }

  if(commonAttr.baseCompId){
    let baseCompId = getCompIdByParam(commonAttr.baseCompId)
    baseDom = useSite.componentMap[baseCompId].interactionData.vueContainer.$el
  }else{
    baseDom = document.body || document.documentElement
  }
  EventBus.$off("slideTab", slideTo)
  EventBus.$on("slideTab", slideTo)
}
initComp()

onMounted(() => {
  if(isH5Edit){
    return
  }
  const lists = lists_.value
  const listItem = lists[0]
  if(listItem && commonAttr.isPageFixed){
    if(listItem.eventType == EVENT_HOVER_TYPES.anchorInPage) {
      nextTick( () => {
        baseDom.addEventListener('scroll', onScroll)
      })
    }
  }
  intervalFunc = window.setInterval( () => {
    _.forEach(lists , (item: IListItem) => {
      if(item.eventType == EVENT_HOVER_TYPES.anchorInPage){
          let relateAnchorCompId = item.value
        let scrollToDom = document.getElementById(relateAnchorCompId)
        if(scrollToDom){
          let scrollTop = scrollToDom.offsetTop
          anchors.push({ compId: item.value, scrollTop })
        }
      }
    })
    if(anchors.length >= lists.length){
      window.clearInterval(intervalFunc)
    }
  }, 1000)

  if(tabIndex >= 0) {
    onMenuClick(null, tabIndex)
  }
  if(commonAttr.isFixed){
    menuHeight = item.conAttr.height / COMMON_WID_HEI.adaptiveScale
  }
  isClick = false
  baseDom.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  if(isH5Edit) {
    EventBus.$off('refreshCommonAttr', onRefreshCommonAttr)
    return
  }
  EventBus.$off("slideTab", slideTo)
  baseDom.removeEventListener('scroll', handleScroll)
  if(interval) window.clearInterval(interval)
})
</script>

<style lang="scss">
.wb-memu {
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
  height: inherit;
  width: inherit;

  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex-wrap: wrap;

  li {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: inherit;
    color: inherit;
    flex-grow: 1;

    img {
      object-fit: contain;
    }
    p {
      font-size: inherit;
    }
    i {
      font-size: inherit;
    }
    a {
      visibility: hidden;
    }
  }
}
.isFixed {
  position: fixed;
  top: 0;
  z-index: 99999;
}

</style>
