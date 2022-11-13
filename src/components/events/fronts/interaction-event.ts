import { useControlsStore } from '@/store/controls';
import { getCompIdByParam, EventBus, isJSON, isWeibo, isHasOwnProperty } from '@/utils/'
import { useSiteStore } from '@/store/site'
import { COMMON_WID_HEI, FRONT_EVENT_TYPE_MAPS, COMPONENT_TYPES, INJECT_GROUP_CLASS_NAME_MAP } from '@/const/'
import { randomOpenPage } from '@/components/events/fronts/interaction/random-open-page'
import { getWbListByItem, showToast, showPage } from '@/components/utils/'
import { useInteractionStore } from '@/store/interaction'

function interactionEvent(item: IComponent, event: IEvent): boolean {
  const useSite = useSiteStore()
  const componentMap = useSite.componentMap
  const useInteraction = useInteractionStore()
  let isContinue = true
  const frontEventType: number = _.parseInt(event.comps[0].attrs.value)
  switch (frontEventType) {
    case FRONT_EVENT_TYPE_MAPS.swiperPre:
      EventBus.$emit("swiperPre", { item: item })
      break
    case FRONT_EVENT_TYPE_MAPS.swiperNext:
      EventBus.$emit("swiperNext", { item: item })
      break
    case FRONT_EVENT_TYPE_MAPS.playSpriteSheetAnim:
      EventBus.$emit("playGroupSpriteSheetAnim", { item: item })
      EventBus.$emit("playSpriteSheetAnim")
      isContinue = false
      break
    case FRONT_EVENT_TYPE_MAPS.removeSpriteSheetText:
      EventBus.$emit("removeSpriteSheetText")
      break
    case FRONT_EVENT_TYPE_MAPS.confirmSpriteSheetText:
      const paramStr = event.comps[1].attrs.value
      // {"relateCompId":"85311510-2382-4feb-8c4a-e9ff747553e7","pageId":4}
      if (paramStr && isJSON(paramStr)) {
        const paramObj = JSON.parse(paramStr)
        EventBus.$emit("confirmSpriteSheetText", paramObj)
      }
      break
    case FRONT_EVENT_TYPE_MAPS.textChangeAddHiddenId:
      const compIdStr = event.comps[1].attrs.value
      const compIdObj = JSON.parse(compIdStr)
      const hiddenCompId = compIdObj.hiddenCompId
      const saveImgCompId = compIdObj.saveImgCompId
      const saveImgCompData = componentMap[saveImgCompId]
      let saveImgEvent = _.cloneDeep(saveImgCompData.events.saveImg)
      const hiddenCompIdStr = saveImgEvent.comps[1].attrs.hiddenCompIds
      const hiddenCompIds = JSON.parse(hiddenCompIdStr)
      _.pull(hiddenCompIds, hiddenCompId)
      saveImgEvent.comps[1].attrs.hiddenCompIds = JSON.stringify(hiddenCompIds)
      break
    case FRONT_EVENT_TYPE_MAPS.swiper:
      changeSwiper(item, event)
      break
    case FRONT_EVENT_TYPE_MAPS.urlToCanvas:
      EventBus.$emit("addImgToCanvas", { url: item.commonAttr.url, width: item.conAttr.width / COMMON_WID_HEI.adaptiveScale, height: item.conAttr.height / COMMON_WID_HEI.adaptiveScale })
      break
    case FRONT_EVENT_TYPE_MAPS.randomOpenPage:
      randomOpenPage(item, event)
      break
    case FRONT_EVENT_TYPE_MAPS.weiboWeixin:
      const weixinCompId = getCompIdByParam(event.comps[1].attrs.weixinCompId)
      const weiboCompId = getCompIdByParam(event.comps[1].attrs.weiboCompId)
      if (weixinCompId && weixinCompId.length > 0) {
        if (isWeibo()) {
          useSite.updateComponentAttr({ id: weixinCompId, commonAttr: { isVisible: false } })
        } else {
          useSite.updateComponentAttr({ id: weiboCompId, commonAttr: { isVisible: false } })
        }
      }
      break
    case FRONT_EVENT_TYPE_MAPS.videoMute:
      EventBus.$emit("videoMute")
      break
    case FRONT_EVENT_TYPE_MAPS.videoPlayAudio:
      EventBus.$emit("videoPlayAudio")
      break
    case FRONT_EVENT_TYPE_MAPS.playVideo:
      const videoStr = event.comps[1].attrs.value
      if (videoStr && isJSON(videoStr)) {
        const videoData = JSON.parse(videoStr)
        EventBus.$emit("playVideo", videoData)
      } else {
        EventBus.$emit("playVideo")
      }
      break
    case FRONT_EVENT_TYPE_MAPS.switchVideo:
      const videoStrSwith = event.comps[1].attrs.value
      if (videoStrSwith && isJSON(videoStrSwith)) {
        const videoData = JSON.parse(videoStrSwith)//{url:"",timeSectionList:[{time:2,popId:1,pageId:1,compId:""}]}
        EventBus.$emit("switchVideo", videoData)
      }
      break
    case FRONT_EVENT_TYPE_MAPS.playAudio:
      // 图片和按钮组件中会 设置这个值
      const isPlay = item.interactionData.isSelected
      EventBus.$emit("playOrPauseAudio", { isPlay, isTouch: true })
      break
    case FRONT_EVENT_TYPE_MAPS.pauseAudio:
      EventBus.$emit("playOrPauseAudio", { isPlay: false, isTouch: true })
      break
    case FRONT_EVENT_TYPE_MAPS.changeRelateCompData:
      let wbLists = getWbListByItem(item)
      let clickItem = wbLists[item.commonAttr.itemIndex]
      changeRelateCompData(item, event, clickItem)
      break
    case FRONT_EVENT_TYPE_MAPS.openCamera:
      EventBus.$emit("openCamera")
      break
    case FRONT_EVENT_TYPE_MAPS.rotateCameraImg:
      EventBus.$emit("rotateCameraImg")
      break
    case FRONT_EVENT_TYPE_MAPS.removeCamera:
      EventBus.$emit("removeCamera")
      break
    case FRONT_EVENT_TYPE_MAPS.slotMachine:
      EventBus.$emit("slotMachine")
      break
    case FRONT_EVENT_TYPE_MAPS.graspDoll:
      EventBus.$emit("graspDoll")
      break
    case FRONT_EVENT_TYPE_MAPS.exportSVG:
      EventBus.$emit("exportSVG")
      break
    case FRONT_EVENT_TYPE_MAPS.copyText:
      let textCompIdStr = event.comps[1].attrs.value;
      if (textCompIdStr && isJSON(textCompIdStr)) {
        const textCompObj = JSON.parse(textCompIdStr)
        let textCompId = textCompObj.textCompId
        if (isHasOwnProperty(item.interactionData, 'isInGroupCarousel') && item.interactionData.isInGroupCarousel) {
          const textCompData = componentMap[textCompId]
          const idIndexs = item.id.split('_')
          textCompId = textCompId + '_' + idIndexs[1] + '_' + textCompData.commonAttr.qIndex
        }
        clipboardCopy(useInteractionStore().formValueMap[textCompId].value, textCompObj)
        // copyToClipboard(useInteractionStore().formValueMap[textCompId].value)
      }
      break
    case FRONT_EVENT_TYPE_MAPS.randomText:
      let eventRadomText = item.events.interactionData
      if (eventRadomText) {
        let relateCompId = getCompIdByParam(eventRadomText.comps[1].attrs.value)
        let lists = item.interactionData.lists
        let length = lists.length
        let randomIndex = _.random(0, length - 1)
        let itemList = lists[randomIndex]
        if (itemList && itemList.params && isJSON(itemList.params)) {
          let text = JSON.parse(itemList.params).text
          useSite.updateComponentAttr({ id: relateCompId, commonAttr: { text } })
          EventBus.$emit("refreshDynamicData")
        }
      }
      break
    case FRONT_EVENT_TYPE_MAPS.twistedEgg:
      EventBus.$emit("twistedEgg", item)
      isContinue = false
      break
    case FRONT_EVENT_TYPE_MAPS.passData:
      EventBus.$emit("passData", { itemIndex: item.commonAttr.itemIndex })
      break
    case FRONT_EVENT_TYPE_MAPS.turnBook:
      EventBus.$emit("turnBook")
      break
    case FRONT_EVENT_TYPE_MAPS.startTimer:
      EventBus.$emit("timerStart")
      break
    case FRONT_EVENT_TYPE_MAPS.clearPaper:
      EventBus.$emit("clearPaper");
      break
    case FRONT_EVENT_TYPE_MAPS.resetBtnStatus:
      EventBus.$emit("allBtnStatus", { isSelected: false })
      EventBus.$emit("allStatus", { isSelected: false })
      break
    case FRONT_EVENT_TYPE_MAPS.switchAudio:
      let relateAttrCompId = getCompIdByParam(item.commonAttr.relateAttrCompId)
      if (relateAttrCompId) {
        let itemIndex = componentMap[relateAttrCompId].commonAttr.itemIndex
        let list: any = item.interactionData.lists[itemIndex]
        _.merge(list, JSON.parse(list.params))
        EventBus.$emit('switchAudio', {
          url: list.url,
          name: list.name
        })
      }
      break
    case FRONT_EVENT_TYPE_MAPS.switchScroll:
      // 切换横向滚动容器
      const compStr = event.comps[1].attrs.value
      if (compStr && isJSON(compStr)) {
        const compObj = JSON.parse(compStr)
        if (compObj.relateCompId) {
          let url = item.lists[item.commonAttr.itemIndex].url
          if (item.events.interactionData) {
            url = item.interactionData.lists[item.commonAttr.itemIndex].url
          }
          useInteraction.updatePageCropRecoverUrl({ id: compObj.relateCompId, pageId: item.eventShare.pageId })
          useSite.updateComponentAttrUrl({ id: compObj.relateCompId, commonAttr: { url } })
          // useSite.updateComponentAttr({id: compObj.relateCompId, commonAttr: { url } })
        }
      }
      break
    case FRONT_EVENT_TYPE_MAPS.uploadCompData:
      updateCompData(item, event)
      break
    case FRONT_EVENT_TYPE_MAPS.simulationNumber:
      let params = event.comps[1].attrs.value
      if (params && isJSON(params)) {
        const paramsObj = JSON.parse(params)
        if (isHasOwnProperty(useInteraction.bindData, paramsObj['key'])) {
          let value = useInteraction.bindData[paramsObj['key']]
          value += Number(paramsObj.num)
          useInteraction.updateBindData({ key: paramsObj['key'], value })
        }
      }
      break
    case FRONT_EVENT_TYPE_MAPS.randomOpenPagePre:
      const shareInteractionData = useInteraction.shareInteractionData
      shareInteractionData.randomPageIndex = shareInteractionData.randomPageIndex! - 1
      let randomPageIds = shareInteractionData.randomPageIds
      let pageId = randomPageIds[shareInteractionData.randomPageIndex - 1]
      if (pageId && pageId > 0) {
        window.setTimeout(() => {
          showPage(pageId, item)
        }, shareInteractionData.time! * 1000)
      }
      break
    case FRONT_EVENT_TYPE_MAPS.randomQuestions:
      onRandomQuestions(item, event)
      break
  }
  return isContinue
}
// 判断随机数据
function onRandomQuestions(item: IComponent, event: IEvent) {
  const useSite = useSiteStore()
  const ITEMINDEX_TITLE = 0
  let params = event.comps[1].attrs.value
  if (params && isJSON(params)) {
    const paramsObj = JSON.parse(params)
    if (!isHasOwnProperty(paramsObj, 'compIds')) {
      return
    }
    let dataCompId = item.id
    if (isHasOwnProperty(paramsObj, 'relatedCompId')) {
      dataCompId = paramsObj.relatedCompId
    }
    let dataComp = useSite.componentMap[dataCompId]

    if (dataComp.interactionData && dataComp.interactionData.isDimension) {
      let interactionData: any = dataComp.interactionData
      let lists = interactionData.dimensionLists
      let titles = interactionData.titles
      let compIds = paramsObj.compIds
      let compIdIndex = compIds.length  - 1
      while(compIdIndex >= 0){
        let listIndex = _.random(0,lists.length - 1)
          let itemList = lists[listIndex]
          let titleUrl = titles[listIndex]
          console.log(titleUrl)
          let comp = useSite.componentMap[compIds[compIdIndex]]
          lists.splice(listIndex,1)
          titles.splice(listIndex,1)
          if (comp.cid == COMPONENT_TYPES.group_component) {
            _.forEach(comp.components, (itemComp) => {
              if (itemComp.commonAttr.itemIndex == ITEMINDEX_TITLE) { // 元素中的title
                useSite.updateComponentAttr({
                  id: itemComp.id,
                  commonAttr: { url: titleUrl }
                })
              } else if (itemComp.commonAttr.injectJsClass == INJECT_GROUP_CLASS_NAME_MAP.MenuByBtns) {
                let components = itemComp!.components
                _.forEach(components, (component, index) => {
                  useSite.updateComponentAttr({
                    id: component.id,
                    commonAttr: {
                      bgUrl: itemList[index].url,
                      selectedBgUrl: itemList[index].selectedUrl,
                    }
                  })
                })
              }
            });
          }
          compIdIndex --
      }
      // for (let i = startIndex,j = 0; i <= endIndex; i++, j++) {
      //   let itemList = lists[i]
      //   let titleUrl = titles[i]
      //   let compId = compIds[j]
      //   let comp = useSite.componentMap[compId]
      //   if (comp.cid == COMPONENT_TYPES.group_component) {
      //     _.forEach(comp.components, (itemComp) => {
      //       if (itemComp.commonAttr.itemIndex == ITEMINDEX_TITLE) { // 元素中的title
      //         useSite.updateComponentAttr({
      //           id: itemComp.id,
      //           commonAttr: { url: titleUrl }
      //         })
      //       } else if (itemComp.commonAttr.injectJsClass == INJECT_GROUP_CLASS_NAME_MAP.MenuByBtns) {
      //         let components = itemComp!.components
      //         _.forEach(components, (component, index) => {
      //           useSite.updateComponentAttr({
      //             id: component.id,
      //             commonAttr: {
      //               bgUrl: itemList[index].url,
      //               selectedBgUrl: itemList[index].selectedUrl,
      //             }
      //           })
      //           // EventBus.$emit("btnStatus", { compId: itemComp.id, isSelected: false })
      //         })
      //       }
      //     });
      //   }
      // }
    }
  }
}

function copyToClipboard(textToCopy: string) {
  // navigator clipboard 需要https等安全上下文
  let isS = false
  if (navigator.clipboard && window.isSecureContext) {
    // navigator clipboard 向剪贴板写文本
    isS = true
    showToast("复制成功！")
    return navigator.clipboard.writeText(textToCopy);
  } else {
    // 创建text area
    let textArea: any = document.createElement("textarea");
    textArea.value = textToCopy;
    // 使text area不在viewport，同时设置不可见
    textArea.style.position = "absolute";
    textArea.style.opacity = 0;
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((res: any, rej: any) => {
      // 执行复制命令并移除文本框
      document.execCommand('copy') ? res() : rej();
      isS = true
      showToast("复制成功！")
      textArea.remove();
    });
  }
}

function copyClipboardApi(text: string): boolean {
  // Use the Async Clipboard API when available. Requires a secure browsing
  // context (i.e. HTTPS)
  if (!navigator.clipboard) {
    throw makeError()
  }
  return Boolean(navigator.clipboard.writeText(text).then(function () {
    return true
  }).then(function () {
    return false
  }))
}

function makeError(): DOMException {
  return new DOMException('The request is not allowed', 'NotAllowedError')
}

function copyExecCommand(text: string): boolean {
  // Put the text to copy into a <span>
  const span = document.createElement('span')
  span.textContent = text

  // Preserve consecutive spaces and newlines
  span.style.whiteSpace = 'pre'
  span.style.webkitUserSelect = 'auto'
  span.style.userSelect = 'all'

  // Add the <span> to the page
  document.body.appendChild(span)

  // Make a selection object representing the range of text selected by the user
  const selection = window.getSelection()
  const range = window.document.createRange()
  selection!.removeAllRanges()
  range.selectNode(span)
  selection!.addRange(range)

  // Copy text to the clipboard
  let success = false
  try {
    success = window.document.execCommand('copy')
  } finally {
    // Cleanup
    selection!.removeAllRanges()
    window.document.body.removeChild(span)
  }

  if (!success) throw makeError()
  return success
}

async function clipboardCopy(text: string, textCompObj: any) {
  let isSuccess = false
  // try {
  //   isSuccess = await copyClipboardApi(text)
  //   alert("writeText: " + isSuccess)
  //   if(!isSuccess) {
  //     try {
  //       isSuccess = await copyExecCommand(text)
  //     } catch (err2) {
  //       throw (err2 || makeError())
  //     }
  //   }
  // } catch (err) {
  try {
    isSuccess = await copyExecCommand(text)
  } catch (err2) {
    throw (err2 || makeError())
  }
  // }
  if (isSuccess) {
    if (textCompObj.hint) {
      showToast(textCompObj.hint)
    } else {
      showToast("复制成功！")
    }
  } else {
    showToast("复制失败！")
  }
}



function changeRelateCompData(item: IComponent, event: IEvent, clickItem: IComponent) {
  const useSite = useSiteStore()
  const componentMap = useSite.componentMap

  //920我的抗疫毕业证
  let itemIndex = item.commonAttr.itemIndex
  const compIdStrs = event.comps[1].attrs.value.split(",")
  const compIds: string[] = []
  let compId: string
  _.forEach(compIdStrs, (compIdStr) => {
    compId = getCompIdByParam(compIdStr)
    if (compId) {
      compIds.push(compId)
    }
  })
  let triggerRelateCompId = compIds[0]
  if (triggerRelateCompId) {
    let triggerRelateCompData = componentMap[triggerRelateCompId]
    const triggerEvents = triggerRelateCompData.events
    if (triggerEvents.user || triggerEvents.vote) {
      //数据有可能是前端配置的uid，也有可能是后端用户数据id
      useSite.updateComponentAttr({ id: triggerRelateCompId, commonAttr: { voteId: clickItem.uid || clickItem.id } })
    } else if (triggerEvents.rotate3d || triggerEvents.interactionData) {
      let triggerRelateData: any
      if (event.comps[1].attrs.compIdObj) {
        triggerRelateData = JSON.parse(event.comps[1].attrs.compIdObj)
      }

      let url = ''
      let imgs: any
      let item: any
      _.forEach(compIds, (compId: string) => {
        url = ''
        item = null
        imgs = null
        triggerRelateCompId = compId
        triggerRelateCompData = componentMap[triggerRelateCompId]
        if (triggerRelateCompData && triggerRelateCompData.cid == COMPONENT_TYPES.wb_img) {
          if (triggerRelateCompData.lists && triggerRelateCompData.lists[itemIndex]) {
            url = triggerRelateCompData.lists[itemIndex].url
          } else if (triggerRelateCompData.interactionData) {
            //支持在触发组件上存储数据（自定义数据事件）同时也支持在目标组件上存储数据（图片是字符串数组格式）
            if (triggerRelateCompData.interactionData.isDimension) {
              if (triggerRelateCompData.interactionData) {
                imgs = triggerRelateCompData.interactionData.dimensionLists
              } else {
                if (triggerRelateData && triggerRelateData[compId]) {
                  imgs = triggerRelateData[compId].imgs
                }
              }
              let itemIndex_ = 0
              if (imgs) {
                //话题词 根据单选 映射后随机话题词 结果页 根据数据包来的数据和单选选中index来确定
                if (triggerRelateData && triggerRelateData[compId] && Object.prototype.hasOwnProperty.call(triggerRelateData[compId], "dataAttr")) {
                  //从后台数据中拿值来映射数据
                  let attr = triggerRelateData[compId]["dataAttr"]
                  const index = triggerRelateCompData.commonAttr[attr] ? triggerRelateCompData.commonAttr[attr] : 0
                  item = imgs[index][itemIndex]
                  url = item.url || item
                  itemIndex_ = index * imgs[index].length + itemIndex
                } else {
                  const randomIndex = _.random(0, imgs[itemIndex].length - 1)
                  item = imgs[itemIndex][randomIndex]
                  url = item && item.url || item
                  itemIndex_ = itemIndex * imgs[itemIndex].length + randomIndex
                }
                triggerRelateCompData.commonAttr.itemIndex = itemIndex_
              }
            } else {
              url = triggerRelateCompData.interactionData.lists[itemIndex].url
            }
          }
          if (url) {
            useSite.updateComponentAttr({ id: triggerRelateCompId, commonAttr: { url } })
          }
        }
      })
    }
  }
}

// FRONT_EVENT_TYPE_MAPS.swiper
function changeSwiper(item: IComponent, event: IEvent) {
  const useSite = useSiteStore()

  let interactionData_ = item.interactionData
  const relateCompId = getCompIdByParam(event.comps[1].attrs.relateCompId)
  const clickDataStr = event.comps[1].attrs.value
  let isBackground = ''
  if (relateCompId) {
    if (clickDataStr && isJSON(clickDataStr)) {
      let clickData = JSON.parse(clickDataStr)
      isBackground = clickData.isBackground || clickData.imgRelateCompId
    }
    //兼容之前的可以将数据存放在event_.comps[1].attrs.imgs里，也可以存放到item.interactionData里
    let imgs: any[] = []
    if (item.interactionData) {
      if (item.interactionData.isDimension && item.interactionData.dimensionLists) {
        imgs = item.interactionData.dimensionLists
      } else {
        imgs = item.interactionData.lists
      }
    }
    let swiperList: any[]
    if (interactionData_.swiperIndex! >= 0 && _.isArray(imgs[0])) {
      swiperList = imgs[interactionData_.swiperIndex!]
    } else {
      swiperList = imgs
    }
    let lists: any[] = []
    _.forEach(swiperList, (item: IListItem) => {
      lists.push({ url: item.url, link: "" })
    })
    lists.push({ url: '', link: "" })
    useSite.replaceComponentList({ id: relateCompId, lists })
    //isBackground这个属性是想背景这样的，直接替换组件url，其他的都是添加到滚动容器里的
    useSite.updateComponentAttr({ id: relateCompId, commonAttr: { isBackground } })
  }
  //交互事件更新幻灯片组件数据
  EventBus.$emit("swiperChangePage")
}

function updateCompData(item: IComponent, event: IEvent) {
  const useSite = useSiteStore()
  const useInteraction = useInteractionStore()
  const useControls = useControlsStore()

  let params = event.comps[1].attrs.value && JSON.parse(event.comps[1].attrs.value)
  if (isHasOwnProperty(params, 'wangze')) {
    let obj = params.wangze
    let currPeriod = useInteraction.shareData.currPeriod!
    let list = useInteraction.shareData.list!
    let mine = useInteraction.shareData.mine!

    let menuComp = useSite.componentMap[obj.menuId]
    let menuIndex = Number(menuComp.commonAttr.itemIndex)
    if (menuIndex < 0) menuIndex = currPeriod - 1 || 0
    EventBus.$emit("allBtnStatus", { isSelected: true, compId: menuComp.components[menuIndex].id })
    let relateAttrCompId = getCompIdByParam(item.commonAttr.relateAttrCompId)
    if (relateAttrCompId) {
      let comp = useSite.componentMap[relateAttrCompId]
      let controlId = comp.events.judgeRightWrong.controlId
      const wbData: IBaseListControl = useControls.controls[relateAttrCompId][controlId].data as IBaseListControl

      let currMine = mine[menuIndex + 1]
      wbData.elements = list![menuIndex + 1] || []
      useInteraction.updateBindData({ key: 'score', value: mine![menuIndex + 1].score }) //分数
      useInteraction.updateBindData({ key: 'name', value: mine![menuIndex + 1].screen_name }) // 名字
      useInteraction.updateBindData({ key: 'generalRank', value: mine![menuIndex + 1].rank }) // 排名

      // 切换的时候列表scrollTop重置
      if (obj.listCompId) {
        let listCompId = 'swiper-' + obj.listCompId
        let dom: any = document.getElementById(listCompId)
        if (dom) {
          dom = dom.getElementsByClassName('swiper-wrapper')[0]
          dom.style.transform = 'translate3d(0px, 0, 0px)'
          let drag: any = document.getElementsByClassName('swiper-scrollbar-drag')[0]!
          drag.style.transform = 'translate3d(0px, 0, 0px)'
        }
      }

      if (isHasOwnProperty(obj, 'initCompId')) {
        let initCompId = obj.initCompId
        let isVisible = false
        if (wbData.elements && wbData.elements.length > 0) {
          isVisible = false
        } else {
          isVisible = true
        }
        useSite.updateComponentAttr({ id: initCompId, commonAttr: { isVisible } })
        let doms = document.body.getElementsByClassName('swiper-wrapper')
        _.forEach(doms, dom => {
          dom.style.transform = 'translate3d(0px, 0, 0px)'
        })
      }

      if (isHasOwnProperty(obj, 'btnId')) {
        let groupComp = useSite.componentMap[obj.btnId]
        _.forEach(groupComp.components, comp => {
          if (comp.commonAttr.itemIndex == menuIndex) {
            useSite.updateComponentAttr({ id: comp.id, commonAttr: { isVisible: true } })
            if (comp.components) {
              let btn = _.find(comp.components, item => item.cid === COMPONENT_TYPES.wb_btn)
              useSite.updateComponentAttr({ id: btn.id, commonAttr: { isVisible: currMine.isShowPrize ? true : false } })
            }
          } else {
            useSite.updateComponentAttr({ id: comp.id, commonAttr: { isVisible: false } })
          }
        })
      }
    }
    useSite.updateComponentAttr({ id: obj.menuId, commonAttr: { itemIndex: -1 } })
  }
}
export {
  interactionEvent
}