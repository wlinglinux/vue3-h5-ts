import { PAGE_TYPE, COMMON_WID_HEI, COMPONENT_TYPES, INJECT_GROUP_CLASS_NAME_MAP, LIST_TYPE_MAP } from '@/const/'
import { getPxOVwByValue, bgPositionStyle, isHasOwnProperty, getCompIdByParam, isJSON } from '@/utils/'
import { dealComponentData } from './comp-data-utils'
import { getMainListEventByEvents } from '@/components/events/utils/'
import { PageStyles, InteractionData } from '@/store/models/site'
import { useLoadsStore } from '@/store/loads'
import { useControlsStore } from '@/store/controls'
import { useSiteStore } from '@/store/site'

function dealPageStyleAndAttr(siteAttrs: ISiteAttrs, siteInfo: ISiteInfo, page: IPage) {
  if(page.attrs.height < 1334) page.attrs.height = 1334
  let hei = page.attrs.height
  if(!page.styles) {
    page.styles = new PageStyles()
  }
  let pageStyles: IPageStyles = page.styles
  pageStyles.width = getPxOVwByValue(page.attrs.width)
  pageStyles.height = getPxOVwByValue(hei)
  if((siteAttrs.pageType == PAGE_TYPE.single || hei/COMMON_WID_HEI.adaptiveScale <= COMMON_WID_HEI.clientHeight)){
    page.attrs.width = COMMON_WID_HEI.clientWidth*COMMON_WID_HEI.adaptiveScale
    pageStyles.width = getPxOVwByValue(page.attrs.width)
    let reallyHeight = COMMON_WID_HEI.clientHeight*COMMON_WID_HEI.adaptiveScale
    if(COMMON_WID_HEI.adaptiveScale <= 1 && !siteInfo.md.isMobile) {
      reallyHeight = COMMON_WID_HEI.clientHeight
      if(reallyHeight < page.attrs.height) {
        reallyHeight = page.attrs.height
      }
    }
    page.attrs.height = reallyHeight
    pageStyles.height = getPxOVwByValue(reallyHeight)
  }
  if(page.attrs.backgroundColor) {
    pageStyles.backgroundColor = page.attrs.backgroundColor
  }
  if(page.attrs.bgUrl && page.attrs.bgUrl != 'https://static.hd.xxx.com/jye/fe-web/images/edit-bg.jpg') {
    pageStyles.backgroundImage = 'url(' + page.attrs.bgUrl + ')'
    bgPositionStyle(pageStyles, page.attrs.bgPositionRepeatType)
  } else {
    pageStyles.backgroundImage = 'url()'
  }
}

function dealPageOrGroup(siteData: any, pageOrGroupComponent: IGroup, currentPage: IPage, isInGroup: boolean, pages: IPage[]){
  for(let j = 0, len = pageOrGroupComponent.components.length; j < len; j++) {
    let componentData: IComponent = pageOrGroupComponent.components[j]
    dealComponentData(siteData, componentData, currentPage, isInGroup)
    componentData.interactionData.isInGroup = isInGroup
    if(isInGroup) {
      componentData.interactionData.groupCompId = pageOrGroupComponent.id
    }
    //打组组件
    if(componentData.components && componentData.components.length > 0) {
      dealPageOrGroup(siteData, componentData, currentPage, true, pages)
      dealGroupComponentData(componentData, currentPage)
      if(componentData.commonAttr.isPercent) {
        dealGroupComponentPercent(componentData)
      }
    }
  }
}
function dealGroupComponentPercent(componentData: IComponent) {
  const hei = componentData.conAttr.height
  if(!isHasOwnProperty(componentData, 'conStyles')) {
    componentData.conStyles = {}
  }
  componentData.conStyles.height = "100vh"
  _.forEach(componentData.components, (componentData_: IComponent) => {
    if(!isHasOwnProperty(componentData_, 'conStyles')) {
      componentData_.conStyles = {}
    }
    componentData_.conStyles.top =  componentData_.conAttr.top/hei * 100 + "vh"
    componentData_.conStyles.height =  componentData_.conAttr.height/hei * 100 + "vh"
  })
}
function dealGroupComponentData(componentData: IComponent, currentPage: IPage) {
  //对打组组件中各种组件类型分类处理，比如打组组件集合类型radios，那么就组成一个单选组，
  //设置fixed打组组件中包含wb_menu组件的fixed属性
  _.forEach(componentData.components, (componentData_: IComponent) => {
    if(componentData_.cid == COMPONENT_TYPES.wb_menu) {
      componentData_.commonAttr.isPageFixed = true
    }else if(componentData_.cid == COMPONENT_TYPES.wb_scroll_container) {
      //标志处理这个组件冗余UI，用作截图发博使用
      if(componentData.conAttr.left > COMMON_WID_HEI.width || componentData.conAttr.left < -COMMON_WID_HEI.width) {
        componentData_.interactionData.groupCompId = componentData.id
      }
    }
  })
  if(componentData.cid == COMPONENT_TYPES.group_carousel) {
    if(!isHasOwnProperty(componentData, "events")) {
      componentData.events = {}
    }
    if(componentData.commonAttr.listType !== LIST_TYPE_MAP['rotate']) {
      let isRelative = false
      if(componentData.commonAttr.listType == LIST_TYPE_MAP.relative) {
        isRelative = true
        currentPage.isAdjustPageHeight= true
      }
      addGroupCarouselList(componentData, isRelative)
    }
  }else if(componentData.cid == COMPONENT_TYPES.group_component) {
    if(componentData.commonAttr.injectJsClass) {
      const loadsStore = useLoadsStore()
      dealGroupInjectJsClass(componentData, loadsStore.isLoadJsObj)
      if(componentData.commonAttr.injectJsClass == INJECT_GROUP_CLASS_NAME_MAP['ClickGetNumberAnim']) {
        const siteStore = useSiteStore()
        addAnimComps(componentData, siteStore.componentMap)
      } 
    }
  }
}


function dealGroupInjectJsClass(componentData: IComponent, isLoadJsObj: IIsLoadJsObj) {
  const commonAttr = componentData.commonAttr
  _.forEach(componentData.components, (compData: IComponent) => {
    if(!compData.interactionData) { 
      compData.interactionData = new InteractionData()
    }
    compData.interactionData.groupInjectClassName = componentData.commonAttr.injectJsClass
  })
  if(commonAttr.spriteSheetParams && isJSON(commonAttr.spriteSheetParams)) {
    componentData.interactionData.spriteSheetObj = JSON.parse(commonAttr.spriteSheetParams)
    _.forEach(componentData.components, (compData: IComponent) => {
      if(compData.cid == COMPONENT_TYPES.wb_bg && !compData.commonAttr.spriteSheetParams) {
        compData.interactionData.spriteSheetObj = _.cloneDeep(componentData.interactionData.spriteSheetObj)
      }
    })
  }
  if(commonAttr.params && isJSON(commonAttr.params)) {
    componentData.interactionData.injectJsClassObj = JSON.parse(commonAttr.params)
  }
  if(commonAttr.injectJsClassParams && isJSON(commonAttr.injectJsClassParams)) {
    let injectJsClassObj = JSON.parse(commonAttr.injectJsClassParams)
    componentData.interactionData.injectJsClassObj = injectJsClassObj
    if(injectJsClassObj.gsap) {
      isLoadJsObj.isGsap = true
      if(injectJsClassObj.gsap.isBezier) {
        isLoadJsObj.isGsapBezier = true
      }
    } else if(injectJsClassObj.matter) {
      isLoadJsObj.isMatter = true
    } else if(injectJsClassObj.svg) {
      isLoadJsObj.isSvg = true
    } else if(injectJsClassObj.three) {
      let threeObj = injectJsClassObj.three
      if(threeObj.orbit) {
        isLoadJsObj.isOrbitControls = true
      }
      if(threeObj.gltf) {
        isLoadJsObj.isGltfLoader = true
      }
      if(threeObj.panorama) {
        isLoadJsObj.isPanorama = true
      }
    } else if(injectJsClassObj.pixi) {
      isLoadJsObj.isPixi = true
      let pixiObj = injectJsClassObj.pixi
      if(pixiObj.filters) {
        isLoadJsObj.isPixiFilters = true
      }
    } else if(injectJsClassObj.turn) {
      isLoadJsObj.isTurnBook = true
    }
  }
}

function addAnimComps(componentData: IComponent, componentMap: IComponentMap) {
  let comps: IComponent[] = [];
  let copyItem: IComponent;
  let copyItem_: IComponent;
  _.forEach(componentData.components, (componentData: IComponent) => {
    copyItem = _.cloneDeep(componentData);
    copyItem.conAttr.top = _.parseInt(componentData.conAttr.top - componentData.conAttr.height * 2);
    copyItem.id = componentData.id + "-" + componentData.commonAttr.itemIndex + "-0";
    comps.push(copyItem);
    componentMap[copyItem.id] = copyItem;
    copyItem_ = _.cloneDeep(copyItem);
    copyItem_.id = componentData.id + "-" + componentData.commonAttr.itemIndex + "-1";
    comps.push(copyItem_);
    componentMap[copyItem_.id] = copyItem_;
    copyItem_ = _.cloneDeep(copyItem);
    copyItem_.id = componentData.id + "-" + componentData.commonAttr.itemIndex + "-2";
    comps.push(copyItem_);
    componentMap[copyItem_.id] = copyItem_;
  })
  componentData.components = _.concat(componentData.components, comps)
}

function addGroupCarouselList(componentData: IComponent, isRelative: boolean) {
  const siteStore = useSiteStore()
  const componentMap: IComponentMap = siteStore.componentMap, 
    controlsStore = useControlsStore(),
    controls: IControlsMap = controlsStore.controls
  _.forEach(componentData.components, (compData: IComponent, i: number) => {
    compData.commonAttr.qIndex = i
  })
  let itemList: IComponent[] = []
  let copyItem: IComponent;
  const relateAttrCompId = getCompIdByParam(componentData.commonAttr.relateAttrCompId)
  let relateLists: any
  if(isRelative) {
    _.sortBy(componentData.components, (comp: IComponent) => { return comp.conAttr.top; });
   _.forEach(componentData.components, (comp: IComponent, index: number) => {
    if(index > 0) {
      const prevComp = componentData.components[index - 1]
      comp.conAttr.top = comp.conAttr.top - prevComp.conAttr.height - prevComp.conAttr.top
    }
    if(!isHasOwnProperty(comp, 'conStyles')) {
      comp.conStyles = {}
    }
    comp.conStyles.top = '0'
    comp.conStyles.marginTop = getPxOVwByValue(comp.conAttr.top)
   })
   if(!isHasOwnProperty(componentData, 'conStyles')) {
    componentData.conStyles = {}
   }
   componentData.conStyles.height = 'auto'
  }
  if(relateAttrCompId) {
    const relateCompData: IComponent = componentMap[relateAttrCompId]
    if(relateCompData && relateCompData.events && relateCompData.events.interactionData) {
      relateLists = relateCompData.interactionData.lists
    } else if(relateCompData && relateCompData.lists && relateCompData.lists.length > 0){
      relateLists = relateCompData.lists
    } else {
      if(relateCompData.events) {
        let mainEvent: IEvent | void = getMainListEventByEvents(relateCompData.events)
        if(mainEvent as IEvent) {
          relateLists = (controls[relateAttrCompId][mainEvent.controlId].data as IBaseListControl).elements
        }
      }
    }
  }
  if(!relateLists) {
    relateLists = [{}]
  }
  const itemIndex = componentData.commonAttr.itemIndex >= 0 ? _.parseInt(componentData.commonAttr.itemIndex) : 0
  const listLen = componentData.commonAttr.listLen >=0 ? _.parseInt(componentData.commonAttr.listLen): 0
  if(itemIndex > 0) {
    relateLists =  relateLists.slice(itemIndex, relateLists.length)
  }
  if(listLen > 0) {
    relateLists =  relateLists.slice(0, listLen)
  }

  _.forEach(relateLists, (item: any, index: number) => {
    copyItem = _.cloneDeep(componentData)
    copyItem.cid = COMPONENT_TYPES.group_component
    copyItem.conAttr.height = componentData.commonAttr.height
    copyItem.id = componentData.id + "_" + index
    copyItem.commonAttr.itemIndex = itemIndex + index
    componentMap[copyItem.id] = copyItem
    copyItem.interactionData = new InteractionData()

    _.forEach(copyItem.components, (compData: IComponent, i: number) => {
      if(isRelative) {
        compData.conAttr.position = 'relative'
      }
      compData.id = compData.id + "_" + index + "_" + i
      compData.commonAttr.qIndex = i
      compData.commonAttr.itemIndex = itemIndex + index
      componentMap[compData.id] = compData
      compData.interactionData = new InteractionData()
      compData.interactionData.isInGroupCarousel = true
      compData.interactionData.groupCompId = componentData.id

      if(compData.components && compData.components.length > 0) {
        compData.cid = COMPONENT_TYPES.group_component
        _.forEach(compData.components, (compData_: IComponent) => {
          compData_.id = compData_.id + "_" + index + "_" + i
          compData_.commonAttr.qIndex = i
          compData_.commonAttr.itemIndex = itemIndex + index
          componentMap[compData_.id] = compData_
          compData_.interactionData.isInGroupCarousel = true
          compData_.interactionData.groupCompId = componentData.id
        })
      }
    })
    itemList.push(copyItem)
  })
  componentData.components = itemList
}


export {
  dealPageStyleAndAttr,
  dealPageOrGroup,
  dealGroupInjectJsClass
}