import { COMMON_WID_HEI, EVENT_HOVER_TYPES, POSITION_TYPE, PAGE_TYPE, H5_TYPE, COMPONENT_TYPES, 
  SAVE_IMG_DATA_TYPES, MOUSE_BEHAVIOR_TYPE, LIST_TYPE_MAP, ANIMATE_TRIGGER_TYPE_MAP } from '@/const/'
import { getCompIdByParam, isJSON } from '@/utils/'
import { ADD_COMP_ATTR } from '@/store/models/component-default-data'
import { searchComponentDataById, getComponentDataByCid } from '@/store/utils/'
import { InteractionData } from '@/store/models/site'
import { useInteractionStore } from '@/store/interaction'
import { useLoadsStore } from '@/store/loads'
import { useSiteStore } from '@/store/site'
import { dealGroupInjectJsClass } from '../utils'
import { isHasOwnProperty, bgPositionStyle } from '@/utils'


function dealComponentData(siteData: ISiteData, componentData: IComponent, currentPage: IPage, isInGroup: boolean = false) {
  const siteStore = useSiteStore()
  siteStore.componentMap[componentData.id] = componentData
  if(componentData.cid != COMPONENT_TYPES.group_component) {
    if(!isHasOwnProperty(siteStore.pageHaveCompNum, currentPage.id)) {
      siteStore.pageHaveCompNum[currentPage.id] = 0
    }
    //这里为啥之前要加  isInGroup 这个打组里的组件不做验证，不知道为啥
    // if(!componentData.commonAttr.isPageFixed && !isInGroup) {
    if(!componentData.commonAttr.isPageFixed) {
      siteStore.pageHaveCompNum[currentPage.id] = siteStore.pageHaveCompNum[currentPage.id] + 1
    }
  }
  const interactionData = new InteractionData()
  if(isHasOwnProperty(componentData, 'interactionData')) {
    _.merge(componentData.interactionData, interactionData)
  } else {
    componentData.interactionData = interactionData
  }
  //属性兼容性处理, 递归恢复、添加删除属性 和 赋值 conStyles
  newlyIncreasedAttr(componentData)
  if(Number(siteData.id) < 2540) {
    dealCompatibilityData(componentData)
  }
  //事件相关
  dealCompEvents(componentData, currentPage)
  //设置加载，页面及interactionData数据
  setStateValueByCid(componentData, currentPage)
  //通用属性中位置处理
  dealPosition(componentData, currentPage.attrs)
  
  //自适应单位处理
  if(siteData.attrs.h5Type == H5_TYPE.mobile) {
    if(siteData.attrs.pageType == PAGE_TYPE.single || currentPage.attrs.height/COMMON_WID_HEI.adaptiveScale <= COMMON_WID_HEI.clientHeight) { 
      //全屏组件高度调整
      if(componentData.commonAttr.isFullScreen) {
        componentData.conAttr.top = 0
        componentData.conAttr.height = currentPage.attrs.height
      }
    }
  }
  
  //设置全局组件关联事件共享池
  const relateEventCompId = getCompIdByParam(componentData.commonAttr.relateEventCompId)
  if(relateEventCompId) {
    const componentDataInPage = searchComponentDataById(relateEventCompId, currentPage)
    if(!componentDataInPage) {
      const searchCompData = siteStore.componentMap[relateEventCompId]
      if(!siteStore.isGlobalShareComponents[currentPage.id]) {
        siteStore.isGlobalShareComponents[currentPage.id] = { id: currentPage.id + '-0', components: [searchCompData] }
      }else{
        siteStore.isGlobalShareComponents[currentPage.id].components.push(searchCompData)
      }
    }
  }
  if(componentData.commonAttr.injectJsClass) {
    const isLoadJsObj = useLoadsStore().isLoadJsObj
    dealGroupInjectJsClass(componentData, isLoadJsObj)
  }
}



//有些组件需要提前加载素材，在这里设置一些在渲染页面中需要的值，方便在页面中使用
function setStateValueByCid(componentData: IComponent, currentPage: IPage) {
  const loadsStore = useLoadsStore()
  const isLoadJsObj = loadsStore.isLoadJsObj
  const isLoadAnimate = loadsStore.isLoadAnimate
  const siteStore = useSiteStore()
  const commonAttr = componentData.commonAttr

  if(commonAttr.customFontStyle || commonAttr.isCustomFont) {
    isLoadJsObj.isCustomFont = true
  }
  
  const interactionStore = useInteractionStore()
  //初始化隐藏组件数据visibleComponents
  if(!commonAttr.isVisible && !commonAttr.isPageFixed) {
    interactionStore.visibleComponents[componentData.id] = componentData.id
  }

  let cid = componentData.cid
  if(cid == COMPONENT_TYPES.wb_text) {
    if(commonAttr.isEdit) {
      currentPage.isForm = true
    }
    if(commonAttr.isDisplayY) {
      currentPage.isDisplayTextScroller = true
    }
    if(componentData.commonAttr.fontFamily != "默认字体") {
      isLoadJsObj.isDefaultFont = true
    }
  }else if(cid == COMPONENT_TYPES.wb_common_list) {
    if(commonAttr.isAutoY) {
      interactionStore.frontData.pageCommonListAutoHeight[currentPage.id] = true
    }
  }else if(cid == COMPONENT_TYPES.wb_menu) {
    if(componentData.lists[0].eventType == 'compVisibleInComps') {
      _.forEach(componentData.lists, (item_: any) => {
        let compId = getCompIdByParam(item_.value) || item_.value;
        interactionStore.visibleComponents[compId] = compId;
      })
    }
  }else if( cid == COMPONENT_TYPES.group_carousel) {
    if(commonAttr.listType != (LIST_TYPE_MAP.commonList || LIST_TYPE_MAP.rotate)) {
      isLoadJsObj.isSwiper = true
    }
  }else if(cid == COMPONENT_TYPES.wb_video) {
    isLoadJsObj.isVideo = true
  }else if(cid == COMPONENT_TYPES.wb_imgs) {
    isLoadJsObj.isSwiper = true
  }else if(cid == COMPONENT_TYPES.wb_scroll_container) {
    isLoadJsObj.isSwiper = true
  }else if(cid == COMPONENT_TYPES.group_component) {
    if(commonAttr.isGroupGsap) {
      isLoadAnimate.isGroupGsap[currentPage.id] = true
    }
  }else if(cid == COMPONENT_TYPES.wb_checkbox) {
    siteStore.isForm.isCheckbox[currentPage.id] = true
    currentPage.isForm = true
  }else if(cid == COMPONENT_TYPES.wb_radio) {
    siteStore.isForm.isRadio[currentPage.id] = true
    currentPage.isForm = true
  }else if(cid == COMPONENT_TYPES.wb_dropdown) {
    siteStore.isForm.isDropdown[currentPage.id] = true
    currentPage.isForm = true
  }else if(cid == COMPONENT_TYPES.wb_address) {
    siteStore.isForm.isAddress[currentPage.id] = true
    currentPage.isForm = true
  }else if(cid == COMPONENT_TYPES.wb_input && (commonAttr.isAuto || commonAttr.dataKey)) {
    currentPage.isForm = true
  }else if(cid == COMPONENT_TYPES.wb_is_post_event) {
    // siteStore.globalIsPost['isFollow'] = true
    if(componentData.events.follow) {
      siteStore.globalIsPost.followCompIds.push(componentData.id)
    }
    siteStore.globalIsPost[commonAttr.interfaceType] = true
  }else if(cid == COMPONENT_TYPES.wb_process) {
    if(commonAttr.isLoadAssets) {
      isLoadJsObj.isLoadAssets = true
    }
  }else if(cid == COMPONENT_TYPES.wb_mc || cid == COMPONENT_TYPES.wb_bitmap_text) {
    if(commonAttr.isCreatejs) {
      isLoadJsObj.isCreatejs = true
    }else{
      isLoadJsObj.isEaseljs = true
    }
  }else if(cid == COMPONENT_TYPES.wb_pixis) {
    isLoadJsObj.isPixi = true
  }else if(cid == COMPONENT_TYPES.wb_phasers) {
    isLoadJsObj.isPhaser = true
  }else if(cid == COMPONENT_TYPES.wb_threes || cid == COMPONENT_TYPES.wb_panorama) {
    isLoadJsObj.isThree = true
  }else if(cid == COMPONENT_TYPES.wb_moveable || (cid == COMPONENT_TYPES.wb_camera && commonAttr.isPoster)) {
    isLoadJsObj.isMoveable = true
  }else if(cid == COMPONENT_TYPES.wb_svg_icon) {
    if(commonAttr.isSvga) {
      isLoadJsObj.isSvga = true
    }else{
      isLoadJsObj.isSvgAnimate = true
    }
  }else if(cid == COMPONENT_TYPES.wb_slot_machine) {
    isLoadJsObj.isSlotMachine = true
  }else if(cid == COMPONENT_TYPES.wb_audio) {
    isLoadJsObj.isAudio = true
  }else if(cid == COMPONENT_TYPES.wb_upload) {
    isLoadJsObj.isHtml2canvas = true
    siteStore.isForm.isUpload[currentPage.id] = true
    isLoadJsObj.isNeedUploadParams = true
  }else if(cid == COMPONENT_TYPES.wb_paper) {
    isLoadJsObj.isPaper = true
  }else if(cid == COMPONENT_TYPES.wb_turn_book) {
    isLoadJsObj.isTurnBook = true
  } else if(cid == COMPONENT_TYPES.wb_bg) {
    if(componentData.commonAttr.spriteSheetParams && isJSON(componentData.commonAttr.spriteSheetParams)) {
      componentData.interactionData.spriteSheetObj = JSON.parse(componentData.commonAttr.spriteSheetParams)
    }
  }

  if(componentData.animate) {
    isLoadJsObj.isAnimate = true
    isLoadAnimate.isAnimate[currentPage.id] = true
    if(componentData.animate.animates.length > 0) {
      _.forEach(componentData.animate.animates, (animate: ICssAnimation) => {
        animate.isPlaying = true
      })
    }
    //动画处理
    if(componentData.animate.isGsap) {
      isLoadAnimate.isGsap[currentPage.id] = true
      if(componentData.animate.path.isPathBezier) {
        isLoadAnimate.isPathBezier[currentPage.id] = true
      }
    }
  }
}

function dealCompEvents(componentData: IComponent, currentPage: IPage) {
  const interactionStore = useInteractionStore()
  const loadsStore = useLoadsStore()
  const siteStore = useSiteStore()
  const isLoadJsObj = loadsStore.isLoadJsObj

  if(!isHasOwnProperty(componentData, "events")) {
    componentData.events = {}
  }
  if(_.isArray(componentData.events)) {
    componentData.events = {}
  }
  
  _.forEach(componentData.events, (event: IEvent) => {
    if(event.mouseBehavior == MOUSE_BEHAVIOR_TYPE.load) {
      currentPage.isReloadEvent = true
    }
    if(event.type == EVENT_HOVER_TYPES.shake) {
      isLoadJsObj.isShake = true
    }else if(event.type == EVENT_HOVER_TYPES.follow) {
      siteStore.globalIsPost.followCompIds.push(componentData.id)
    }else if(event.type == EVENT_HOVER_TYPES.saveImg) {
      isLoadJsObj.isHtml2canvas = true
      let isUploadImgToServer = event.comps[2].attrs.isUploadImgToServer
      if(isUploadImgToServer) {
        isLoadJsObj.isNeedUploadParams = true
      }
    }else if(event.type == EVENT_HOVER_TYPES.scanQRCode) {
      isLoadJsObj.isScanQRCode = true
    }else if(event.type == EVENT_HOVER_TYPES.interactionData) {
      const customObjStr = event.comps[0].attrs.value
      if(customObjStr && isJSON(customObjStr)) {
        let customObj = JSON.parse(customObjStr)
        if(isHasOwnProperty(customObj, 'card') || isHasOwnProperty(customObj, 'puzzle') || isHasOwnProperty(customObj, 'isEmitClick')) {
          if(isHasOwnProperty(customObj, 'card')) {
            //{"card":{"1":0,"2":0,"3":0,"4":0,"5":0},"btnCompId":""}
            interactionStore.shareInteractionData.card = customObj.card
          } else if(isHasOwnProperty(customObj, 'puzzle')) {
            //{"puzzle":{"row":6,"col":4},"matchLength":5}
            let puzzleObj = customObj.puzzle
            let row = puzzleObj.row
            let col = puzzleObj.col
            let puzzle = _.fill(Array(row*col), 0)
            interactionStore.shareInteractionData.puzzle = puzzle
          } else if(isHasOwnProperty(customObj, 'isEmitClick')) {
            interactionStore.shareInteractionData.isEmitClick = customObj.isEmitClick
          }
        } 
        //pk {"pk":{"oppositeNumberCompId":"1479fe05-8aaa-4e74-b934-241a645cbb66"}} card puzzle
        _.merge(componentData.interactionData, customObj)
      }
    } else if (event.type == EVENT_HOVER_TYPES.statisticData) {
      // const statisticDataType = event.comps[0].attrs.value
      // if(statisticDataType == STATISTIC_DATA_TYPES_MAP.aes) {
      //   isLoadJsObj.isJsBarcode = true
      // }
    }
  })
}

function newlyIncreasedAttr (componentData: IComponent) {
  // 递归恢复删除字段
  const oriComponentData: IComponent = getComponentDataByCid(componentData.cid)
  _.forEach(oriComponentData, (value: any, key: string) => {
    if(_.isObject(oriComponentData[key])) {
      if(key == "conAttr") {
        if(componentData.conStyles && isHasOwnProperty(componentData.conStyles, 'zIndex')) {
          componentData.conAttr.zIndex = componentData.conStyles.zIndex
        }
      } else if(key == "commonAttr") {
        let oriCommonAttr = {}
        _.merge(oriCommonAttr, ADD_COMP_ATTR.commonAttr)
        _.merge(oriCommonAttr, oriComponentData.commonAttr)
        let commonAttr = componentData.commonAttr
        _.forEach(oriCommonAttr, (value: any, key: string) => {
          if(!isHasOwnProperty(commonAttr, key)) {
            commonAttr[key] = value
          }
        })
      }
    }else if(!isHasOwnProperty(componentData, key)) {
      componentData[key] = value
    }
  })
  const commonAttr = componentData.commonAttr
  if(componentData.cid == COMPONENT_TYPES.wb_btn) {
    componentData.styles = {}
    if(commonAttr.bgUrl) {
      componentData.styles.backgroundImage = 'url(' + commonAttr.bgUrl + ')'
      componentData.styles.backgroundColor = 'rgba(0, 0, 0, 0)'
      bgPositionStyle(componentData.styles, 0)
      commonAttr.backgroundColor = 'rgba(0, 0, 0, 0)'
    } else {
      commonAttr.selectedBgUrl = ''
      componentData.styles.backgroundImage = 'url()'
    }
  }
  componentData.conAttr.height_ = componentData.conAttr.height
}

function dealCompatibilityData(componentData: IComponent) {
  const commonAttr = componentData.commonAttr
  if(componentData.btn) {
    dealCompatibilityData(componentData.btn)
  }
  if(commonAttr.itemMarginTB == 0 && commonAttr.marginTB != 0) {
    commonAttr.itemMarginTB = commonAttr.marginTB
  }
  if(commonAttr.itemMarginLR == 0 && commonAttr.marginLR != 0) {
    commonAttr.itemMarginLR = commonAttr.marginLR
  }
  if(commonAttr.itemMarginTB >= 0) commonAttr.marginTB = commonAttr.itemMarginTB
  if(commonAttr.itemMarginLR >= 0) commonAttr.marginLR = commonAttr.itemMarginLR
  if(commonAttr.itemPaddingTB >= 0) commonAttr.paddingTB = commonAttr.itemPaddingTB
  if(commonAttr.itemPaddingLR >= 0) commonAttr.paddingLR = commonAttr.itemPaddingLR
  //兼容之前的数据
  if(commonAttr.paddingTB >= 0 || commonAttr.paddingLR >= 0) {
    if(!isHasOwnProperty(commonAttr, 'paddingTB')) {
      commonAttr.paddingTB = 0
    }
    if(!isHasOwnProperty(commonAttr, 'paddingLR')) {
      commonAttr.paddingLR = 0
    }
  }
  if(commonAttr.marginTB >= 0 || commonAttr.marginLR >= 0) {
    if(!isHasOwnProperty(commonAttr, 'marginTB')) {
      commonAttr.marginTB = 0
    }
    if(!isHasOwnProperty(commonAttr, 'marginLR')) {
      commonAttr.marginLR = 0
    }
  }
  if(commonAttr.paddingTB >= 0 || commonAttr.paddingLR >= 0) {
    commonAttr.padding = commonAttr.paddingTB + ' ' + commonAttr.paddingLR + ' ' + commonAttr.paddingTB + ' ' + commonAttr.paddingLR
  }
  if(commonAttr.marginTB >= 0 || commonAttr.marginLR >= 0) {
    commonAttr.margin = commonAttr.marginTB + ' ' + commonAttr.marginLR + ' ' + commonAttr.marginTB + ' ' + commonAttr.marginLR
  }
  delete commonAttr.itemMarginTB
  delete commonAttr.itemMarginLR
  delete commonAttr.itemPaddingTB
  delete commonAttr.itemPaddingLR
  delete commonAttr.marginTB
  delete commonAttr.marginLR
  delete commonAttr.paddingTB
  delete commonAttr.paddingLR
  if(commonAttr.itemWidth >= 0) {
    commonAttr.width = commonAttr.itemWidth
    delete commonAttr.itemWidth
  }
  if(commonAttr.itemHeight >= 0) {
    commonAttr.height = commonAttr.itemHeight
    delete commonAttr.itemHeight
  } 
  delete commonAttr.itemWidth
  delete commonAttr.itemHeight
  if(commonAttr.itemBGWidth >= 0 || commonAttr.itemBgWidth >= 0) commonAttr.bgWidth = commonAttr.itemBGWidth || commonAttr.itemBgWidth
  if(commonAttr.itemBGHeight >= 0 || commonAttr.itemBgHeight >= 0) commonAttr.bgHeight = commonAttr.itemBGHeight || commonAttr.itemBgHeight
  if(commonAttr.itemBGUrl || commonAttr.itemBgUrl) commonAttr.bgUrl = commonAttr.itemBGUrl || commonAttr.itemBgUrl
  if(commonAttr.itemBGColor) commonAttr.bgColor = commonAttr.itemBGColor
  if(commonAttr.selectedBGUrl || commonAttr.selectedBgUrl) commonAttr.selectedBgUrl = commonAttr.selectedBGUrl || commonAttr.selectedBgUrl
  if(commonAttr.selectedBackgroundColor || commonAttr.selectedBGColor) commonAttr.selectedBgColor = commonAttr.selectedBackgroundColor || commonAttr.selectedBGColor
  delete commonAttr.itemBGWidth
  delete commonAttr.itemBgWidth
  delete commonAttr.itemBGHeight
  delete commonAttr.itemBgHeight
  delete commonAttr.itemBGUrl
  delete commonAttr.itemBgUrl
  delete commonAttr.itemBGColor
  delete commonAttr.selectedBackgroundColor
  delete commonAttr.selectedBGColor
  if(commonAttr.itemBorderSize >= 0) {
    commonAttr.borderColor = commonAttr.itemBorderColor
    commonAttr.borderSize = commonAttr.itemBorderSize
    commonAttr.borderStyle = commonAttr.itemBorderStyle
  }  
  if(commonAttr.itemBorderRadius >= 0) commonAttr.borderRadius = commonAttr.itemBorderRadius
  delete commonAttr.itemBorderSize
  delete commonAttr.itemBorderColor
  delete commonAttr.itemBorderStyle
  delete commonAttr.itemBorderRadius
  if(componentData.cid == COMPONENT_TYPES.wb_upload || componentData.cid == COMPONENT_TYPES.wb_camera) {
    if(!isHasOwnProperty(commonAttr, 'saveImgType')) {
      commonAttr.saveImgType = SAVE_IMG_DATA_TYPES[0].value
      commonAttr.saveImgQuality = 0.8
    }
  } else if(componentData.cid == COMPONENT_TYPES.wb_radio || componentData.cid == COMPONENT_TYPES.wb_checkbox) {
    if(commonAttr.selectedStyles && commonAttr.selectedStyles.backgroundColor == 'rgba(0, 0, 0, 0)') {
      commonAttr.selectedStyles.backgroundColor = '#2c7ad2'
    }
    // if(commonAttr.backgroundColor == 'rgba(0, 0, 0, 0)' || commonAttr.backgroundColor == 'rgba(255, 255, 255, 1)') {
    //   commonAttr.backgroundColor = 'rgba(255, 255, 0, 0.2)'
    // }
    if(commonAttr.itemStyles) {
      commonAttr.color = commonAttr.itemStyles.color
      commonAttr.backgroundColor = commonAttr.itemStyles.backgroundColor
      commonAttr.lineHeight = commonAttr.itemStyles.lineHeight
      commonAttr.letterSpacing = commonAttr.itemStyles.letterSpacing
    } 
    delete componentData.styles
  } else if (componentData.cid == COMPONENT_TYPES.wb_bg) {
    const spriteSheetParams = componentData.commonAttr.spriteSheetParams
    if(spriteSheetParams && isJSON(spriteSheetParams)) {
      _.merge(componentData.interactionData, { spriteSheetObj: JSON.parse(spriteSheetParams)})
    }
    if(componentData.styles) {
      const bgColor = componentData.styles.backgroundColor
      if(bgColor && bgColor.indexOf('rgba') != -1) {
        const colors = bgColor.replace('rgba(', '').replace(')', '').split(',')
        if(colors && (colors[3] && Number(colors[3]) < 1 || colors[0] != 255 || colors[0] != 0)) {
          commonAttr.backgroundColor = componentData.styles.backgroundColor
        } else {
          // commonAttr.backgroundColor = 'rgba(0, 0, 0, 0)'
        }
      } else {
        commonAttr.backgroundColor = 'rgba(0, 0, 0, 0)'
      }
    }
  }else if(componentData.cid == COMPONENT_TYPES.wb_is_post_event) {
    if(commonAttr.checkboxUrl) {
      commonAttr.backgroundColor = 'rgba(0, 0, 0, 0)'
    }
    if(isHasOwnProperty(commonAttr, 'checkboxSelectedUrl')) {
      commonAttr.selectedCheckboxUrl = commonAttr.checkboxSelectedUrl
      delete commonAttr.checkboxSelectedUrl
    }
    if(isHasOwnProperty(commonAttr, 'checkboxFontSize')) {
      commonAttr.fontSize = commonAttr.checkboxFontSize
      delete commonAttr.checkboxFontSize
    }
  } 
  if (componentData.cid == COMPONENT_TYPES.wb_text || componentData.cid == COMPONENT_TYPES.wb_input || componentData.cid == COMPONENT_TYPES.wb_dropdown || 
    componentData.cid == COMPONENT_TYPES.wb_btn || componentData.cid == COMPONENT_TYPES.wb_is_post_event ||
    componentData.cid == COMPONENT_TYPES.wb_process || componentData.cid == COMPONENT_TYPES.wb_svg_icon) {
    //不能单纯的 覆盖这个样式 有的是这个生效 有的是commonAttr里的生效 styles中会使用item.styles 之后的版本不会再有这个属性 所有的属性都会在commonAttr里
    if(componentData.styles) {
      const styles = componentData.styles
      if(componentData.cid == COMPONENT_TYPES.wb_btn && styles.border) {
        const attrs = styles.border.split(' ')
        if(attrs.length == 3) {
          commonAttr.borderSize = attrs[0].split('px')[0]
          commonAttr.borderStyle = attrs[1]
          commonAttr.borderColor = attrs[2]
        }
      }
      if(styles.color) commonAttr.color = styles.color
      if(styles.backgroundColor) commonAttr.backgroundColor = styles.backgroundColor
      if(styles.fontFamily) commonAttr.fontFamily = styles.fontFamily
      if(styles.lineHeight) commonAttr.lineHeight = styles.lineHeight
      if(styles.fontStyle) commonAttr.fontStyle = styles.fontStyle
      if(styles.fontWeight) commonAttr.fontWeight = styles.fontWeight
      if(styles.textAlign) commonAttr.textAlign = styles.textAlign
      if(styles.textDecoration) commonAttr.textDecoration = styles.textDecoration
      if(styles.letterSpacing) {
        if(!_.isNumber(styles.letterSpacing)) {
          commonAttr.letterSpacing = Number(styles.letterSpacing.split('px')[0])
        } else {
          commonAttr.letterSpacing = Number(styles.letterSpacing)
        }
      }
    }
    if(componentData.cid == COMPONENT_TYPES.wb_process) {
      if(isHasOwnProperty(commonAttr, 'borderBgColor')) {
        commonAttr.backgroundColor = commonAttr.borderBgColor
      }
      if(isHasOwnProperty(commonAttr, 'percentPaddingTB')) {
        commonAttr.padding = commonAttr.percentPaddingTB + ' ' + commonAttr.percentPaddingLR + ' ' + commonAttr.percentPaddingTB + ' ' + commonAttr.percentPaddingLR
      }
    }
  }
  if(componentData.styles) {
    if(isHasOwnProperty(componentData.styles, 'opacity')) {
      componentData.commonAttr.opacity = Number(componentData.styles.opacity)
    } else {
      componentData.commonAttr.opacity = 1
    }
  }
  if(componentData.cid == COMPONENT_TYPES.wb_common_list || componentData.cid == COMPONENT_TYPES.wb_bg) {
    if(componentData.styles && componentData.styles.lineHeight) commonAttr.lineHeight = componentData.styles.lineHeight
    if(componentData.styles && componentData.styles.color) commonAttr.color = componentData.styles.color
    delete componentData.styles
  } else {
    delete componentData.styles
  }
  delete componentData.conStyles
  if(componentData.cid == COMPONENT_TYPES.wb_btn) {
    componentData.styles = {}
    if(componentData.bgUrl) {
      commonAttr.bgUrl = componentData.bgUrl
      delete componentData.bgUrl
    }
    if(commonAttr.bgUrl) {
      if(componentData.selectedBGUrl) {
        commonAttr.selectedBgUrl = componentData.selectedBGUrl
        delete componentData.selectedBGUrl
      }
      componentData.styles.backgroundImage = 'url(' + commonAttr.bgUrl + ')'
      componentData.styles.backgroundColor = 'rgba(0, 0, 0, 0)'
      bgPositionStyle(componentData.styles, 0)
      commonAttr.backgroundColor = 'rgba(0, 0, 0, 0)'
    } else {
      commonAttr.selectedBgUrl = ''
      componentData.styles.backgroundImage = 'url()'
    }
  } 
}

function dealPosition(componentData: IComponent, pageAttrs: IPageAttrs) {
  let siteStore = useSiteStore()
  let commonAttr = componentData.commonAttr
  if(commonAttr.isPageFixed) {
    componentData.conAttr.position = "fixed"
    siteStore.fixedComps.push(componentData)
  }
  let left = 0
  let top = 0
  let reallyHeight = COMMON_WID_HEI.clientHeight*COMMON_WID_HEI.adaptiveScale
  if(COMMON_WID_HEI.adaptiveScale <= 1 && !siteStore.siteInfo.md.isMobile) {
    reallyHeight = COMMON_WID_HEI.clientHeight
    if(reallyHeight < pageAttrs.height) {
      reallyHeight = pageAttrs.height
    }
  }
  switch(commonAttr.positionType) {
    case POSITION_TYPE.no:
      if(commonAttr.isBottom) {
        let bottom = COMMON_WID_HEI.height - (componentData.conAttr.top + componentData.conAttr.height)
        if(bottom < 0) {
          bottom = 0
        }
        top = reallyHeight - bottom - componentData.conAttr.height
        componentData.conAttr.top = top
      }
      if(commonAttr.isRight) {
        left = COMMON_WID_HEI.width - (componentData.conAttr.width + componentData.commonAttr.right)
        componentData.conAttr.left = left
      }
    break
    case POSITION_TYPE.top:
      componentData.conAttr.top = 0
    break
    case POSITION_TYPE.bottom:
      top = (reallyHeight - componentData.conAttr.height)
      componentData.conAttr.top = top
    break
    case POSITION_TYPE.left:
      componentData.conAttr.left = 0
    break
    case POSITION_TYPE.right:
      left = COMMON_WID_HEI.width - componentData.conAttr.width
      componentData.conAttr.left = left
    break
    case POSITION_TYPE.leftTop:
      componentData.conAttr.left = 0
      componentData.conAttr.top = 0
    break
    case POSITION_TYPE.rightTop:
      left = COMMON_WID_HEI.width - componentData.conAttr.width
      componentData.conAttr.left = left
      componentData.conAttr.top = 0
    break
    case POSITION_TYPE.leftBottom:
      componentData.conAttr.left = 0
      top = (reallyHeight - componentData.conAttr.height)
      componentData.conAttr.top = top
    break
    case POSITION_TYPE.rightBottom:
      left = COMMON_WID_HEI.width - componentData.conAttr.width
      componentData.conAttr.left = left
      top = (reallyHeight - componentData.conAttr.height)
      componentData.conAttr.top = top
    break
    case POSITION_TYPE.center:
      left = (COMMON_WID_HEI.clientWidth*COMMON_WID_HEI.adaptiveScale - componentData.conAttr.width)/2
      componentData.conAttr.left = left
      top = (reallyHeight - componentData.conAttr.height)/2
      componentData.conAttr.top = top
    break
  }
}


export {
  dealComponentData,
}