import { useActivityStore } from '@/store/activity'
import { useInteractionStore } from '@/store/interaction'
import { useSiteStore } from '@/store/site'
import { useControlsStore } from '@/store/controls'
import { getCompIdByParam, isHasOwnProperty, isJSON } from '@/utils/'
import { CONTROL_TYPES, COMPONENT_TYPES, STATISTIC_DATA_TYPES_MAP } from '@/const/'
import { getMainListEventByEvents, getMainWbDataEventByEvents } from '@/components/events/utils/'
import { getWbListOrListByItem, getItemBaseControl } from '@/components/utils/'

function getBlogText(item: IComponent, itemIndex: number): string {
  const useSite = useSiteStore()
  const isH5Edit = useSite.isH5Edit
  let textStr = ''
  const useBaseControl = getItemBaseControl(item.id, CONTROL_TYPES.wb_user)
  const userControlData = useBaseControl && (useBaseControl.data as IBaseListControl).elements[itemIndex]
  const repostBaseControl = getItemBaseControl(item.id, CONTROL_TYPES.wb_reposts)
  const repostControlData = repostBaseControl && (repostBaseControl.data as IBaseListControl).elements[itemIndex]  
  if(repostControlData || userControlData) {
    const itemData: any = repostControlData || userControlData
    if(isH5Edit) {
      textStr = itemData.push_text
    } else {
      if(item.dataKeys && item.dataKeys.text) {
        textStr = itemData.text
      } else {
        textStr = itemData.push_text
      }
    }
  } else {
    const list = getWbListOrListByItem(item)
    const getVariableItem = list[itemIndex]
    textStr = getVariableItem ? getVariableItem.text : ''
  }
  return textStr
}

function getNumberControlData(compId: string): IGeneralNumberControl {
  const baseNumberControl = getItemBaseControl(compId, CONTROL_TYPES.wb_number)
  const baseGeneralNumberControl = getItemBaseControl(compId, CONTROL_TYPES.wb_general_num)
  return baseNumberControl && baseNumberControl.data as IGeneralNumberControl || baseGeneralNumberControl && baseGeneralNumberControl.data as IGeneralNumberControl
}

function getDataKeyValue(relateItemOrItem: IComponent, item: IComponent, txt: string) {
  const commonAttr = item.commonAttr
  const dataKey = commonAttr.dataKey
  let txtOrUrl = ''
  if(dataKey == "custom") {
    txtOrUrl = getAttrByCustom(relateItemOrItem, item, txt)
  } else {
    const attrs = dataKey.split('-')
    // const eventType = attrs[0]
    let attr = attrs[1]
    let itemData = getItemDataByCompData(relateItemOrItem, commonAttr)
    if(itemData && isHasOwnProperty(itemData, attr)) {
      txtOrUrl = itemData[attr]
    }
  }
  return txtOrUrl
}

function getItemDataByCompData(relateItemOrItem: IComponent, commonAttr: ICommonAttr): any {
  const compId = relateItemOrItem.id
  let itemData: IBaseControl | IListItem | any
  let mainListEvent: IEvent = getMainListEventByEvents(relateItemOrItem.events)
  let mainEvent: IEvent = getMainWbDataEventByEvents(relateItemOrItem.events)
  let controlId: string = ""
  if(mainListEvent) {
    controlId = mainListEvent.controlId
  } else if (mainEvent) {
    if(relateItemOrItem.events.general && relateItemOrItem.events.vote) {
      controlId = CONTROL_TYPES.wb_vote
    } else {
      controlId = mainEvent.controlId
    }
  }
  if(controlId && controlId != CONTROL_TYPES.wb_vote) {
    const useControls = useControlsStore()
    let baseControl = useControls.controls[compId] && useControls.controls[compId][controlId]
    if((baseControl.data as IBaseListControl).elements) {
      itemData = (baseControl.data as IBaseListControl).elements[commonAttr.itemIndex]
    } else {
      itemData = baseControl.data
    }
  } else {
    itemData = relateItemOrItem.lists && relateItemOrItem.lists[commonAttr.itemIndex]
  }
  return itemData
}

function getAttrByCustom(relateItemOrItem: IComponent, item: IComponent, txt: string) {
  const useSite = useSiteStore()
  const useInteraction = useInteractionStore()
  const commonAttr = item.commonAttr
  const useControls = useControlsStore()
  let compId = relateItemOrItem.id
  let baseControl: IBaseControl, itemData: any, dataKey: string = '', txtOrUrl: string = ''
  const statisticEvent = relateItemOrItem.events.statisticData
  const interactionEvent = relateItemOrItem.events.interactionData
  let itemIndex = commonAttr.itemIndex
  let displayNumMark = 0
  if(item.cid == COMPONENT_TYPES.wb_img){
    dataKey = getCompIdByParam(commonAttr.name)
    displayNumMark = 2
  }else if(item.cid == COMPONENT_TYPES.wb_text) {
    // 这里的attr有问题
    displayNumMark = -1
    dataKey = getCompIdByParam(commonAttr.text)
  }

  if(statisticEvent) {
    const statisticDataType = statisticEvent.comps[0].attrs.value
    //statisticDataType == STATISTIC_DATA_TYPES_MAP.weibo2020 || 
    if(statisticDataType == STATISTIC_DATA_TYPES_MAP.weiboTime) {
      baseControl = useControls.controls[compId][statisticEvent.controlId]
      itemData = baseControl && (baseControl.data as IBaseListControl).elements && (baseControl.data as IBaseListControl).elements[itemIndex]
    }
  } else if(interactionEvent) {
    let customStr = interactionEvent.comps[0].attrs.value
    let lists = relateItemOrItem.interactionData.lists
    let dimensionLists: any
    if(relateItemOrItem.interactionData.isDimension && relateItemOrItem.interactionData.dimensionLists) {
      dimensionLists = relateItemOrItem.interactionData.dimensionLists[itemIndex]
    }
    //1971 奶爸段位测验
    //从自定义 数据 的一维或者是二维数组中获取数据
    let relateCompId = getCompIdByParam(interactionEvent.comps[1].attrs.value);
    let relateCompData = useSite.componentMap[relateCompId];
    if(relateCompId && relateCompData && relateCompData.commonAttr.itemIndex >= 0){
      itemIndex = relateCompData.commonAttr.itemIndex;
    }
    let customObj: any
    if(customStr && isJSON(customStr)){
      customObj = JSON.parse(customStr);
      if(isHasOwnProperty(customObj, 'levels')){
        //等级数据，levels:[10,20,30,40],bindData:"num"
        let levels = customObj.levels;
        let bindDataKey = customObj.bindData;
        let num = useInteraction.bindData[bindDataKey];

        let index_ = 0;
        let len = levels.length-1;
        for(let i = 0; i < len; i++){
          if(num > levels[i] && num < levels[i+1]){
            index_ = i + 1;
            break
          }
        }
        txtOrUrl = lists[index_].url
      }else if(isHasOwnProperty(customObj, 'bindData') && customObj.bindData == 'isRights') {
        //isRights 答题是否正确 数组 正确选择 数组下标为 1 的图片url
        let bindDataKey = customObj.bindData;
        let isRights = useInteraction.bindData[bindDataKey]
        let index_ = isRights[itemIndex] ? 1 : 0
        txtOrUrl = lists[index_].url
      } else {
        itemData = getItemDataByCompData(relateItemOrItem, commonAttr)
      }
    }else if((lists.length > 0 || dimensionLists) && itemIndex >= 0){
      let listItem: IInteractionItem
      if(dimensionLists) {
        lists = dimensionLists[itemIndex]
        if(commonAttr.qIndex >= 0){
          listItem = lists[commonAttr.qIndex]
        } else {
          listItem = lists[_.random(0, lists.length-1)]
        }
      } else {
        listItem = lists[itemIndex]
      }
      if(listItem) {
        if(listItem.text || listItem.url) {
          //1535
          if(item.cid == COMPONENT_TYPES.wb_img) {
            txtOrUrl = lists[itemIndex][dataKey] || lists[itemIndex].url
          } else {
            txtOrUrl = lists[itemIndex][dataKey] || lists[itemIndex].text
          }
        }
        //1992
        let itemParams = lists[itemIndex].params
        if(itemParams && isJSON(itemParams)) {
          txtOrUrl = JSON.parse(itemParams).text
        }
      }
    }
  }else {
    itemData = getItemDataByCompData(relateItemOrItem, commonAttr)
  }
  
  if(item.events.interactionData) {
    const visibleStr = item.events.interactionData.comps[0].attrs.value
    dealImgVisibility(item, itemData, displayNumMark, visibleStr)
  }

  if(!txtOrUrl && dataKey) {
    if(itemData){
      if(itemData && isHasOwnProperty(itemData, dataKey)) {
        txtOrUrl = itemData[dataKey];
      }
    } else {
      if(_.isArray(useInteraction.bindData[dataKey])) {
        txtOrUrl = useInteraction.bindData[dataKey][itemIndex]
      } else if (useInteraction.bindData[dataKey] >= 0 || _.toString(useInteraction.bindData[dataKey]).length > 0) {
        txtOrUrl = useInteraction.bindData[dataKey]
      }
    }
  }
  if(txt) {
    if(txt.indexOf("$") != -1) {
      txtOrUrl = txt.replace("$" + dataKey + "$", txtOrUrl)
    }
  }
  return txtOrUrl
}


function dealImgVisibility(item: IComponent, itemData_: any, displayNumMark: number, visibleStr: string) {
  const useSite = useSiteStore()
  const useActivity = useActivityStore()
  const useControls = useControlsStore()

  let itemData = _.cloneDeep(itemData_)
  const commonAttr = item.commonAttr
  // 1536 图片满足条件才显示 否则就返回 {"isVisible":200,"relateCompId":"87b7187c-5186-4da4-af4d-edb2bca4ffcd"}
  if(isJSON(visibleStr)){
    const visibleObj = JSON.parse(visibleStr)
    //假如有关联组件就取关联组件的数据来对比
    if(isHasOwnProperty(visibleObj, "relateCompId")) {
      let relateCompData = useSite.componentMap[visibleObj.relateCompId]
      if(relateCompData.events.activityInfo) {
        if(useActivity.activityInfo.isJoin) {
          itemData = { num: 1 }// 伪造的数据用来做对比
        } else {
          itemData = { num: 0 }
        }
      } else if(relateCompData.events.number) {
        itemData = useControls.controls[relateCompData.id][CONTROL_TYPES.wb_number].data
      } else {
        // 还没有遇到这种情况
        // let relateCompControlData = useControls.controls[visibleObj.relateCompId] && useControls.controls[visibleObj.relateCompId].data
        // if(relateCompControlData) {
        //   if(isHasOwnProperty(relateCompControlData, "elements")) {
        //     itemData = relateCompControlData.elements[commonAttr.itemIndex]["num"]
        //   } else {
        //     itemData = relateCompControlData
        //   }
        // }
      }
    }
    if(isHasOwnProperty(visibleObj, "isVisible") && isHasOwnProperty(itemData, "num")) {
      let isVisible = false
      if(itemData.num >= visibleObj.isVisible && commonAttr.itemIndex > displayNumMark) {
        isVisible = true
      }
      if(isVisible != commonAttr.isVisible) {
        useSite.updateComponentAttr({
          id: item.id,
          commonAttr: { isVisible },
        })
      }
      if(isHasOwnProperty(visibleObj, "relateCompId")) {
        let isVisibleRelateComp = true;
        if(commonAttr.itemIndex <= 2 || isVisible) {
          isVisibleRelateComp = false
        }
        useSite.updateComponentAttr({
          id: item.id + "-" + commonAttr.itemIndex + "-" + commonAttr.qIndex,
          commonAttr: { isVisible: isVisibleRelateComp },
        })
      }
      return ""
    }
  }
}

export {
  getDataKeyValue,
  getItemDataByCompData,
  getNumberControlData,
  getAttrByCustom,
  getBlogText,
}