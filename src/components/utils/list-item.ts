import { useInteractionStore } from './../../store/interaction';
import { useSiteStore } from '@/store/site'
import { useControlsStore } from '@/store/controls'
import { getCompIdByParam } from '@/utils/'
import { getMainListEventByEvents } from '@/components/events/utils/'

function getWbListOrListByItem(item: IComponent): any[] {
  if(isWbList(item)) {
    return getWbListByItem(item)
  } else {
    return getListByItem(item)
  }
}

function getWbListByItem(item: IComponent): any[] {
  const commonAttr = item.commonAttr
  const useSite = useSiteStore()
  let wbLists_: any[] = []
  const relateAttrCompId = getCompIdByParam(commonAttr.relateAttrCompId)
  let compId: string = ''
  let controlId: string = ''
  if(relateAttrCompId) {
    compId = relateAttrCompId
    const relateCompData = useSite.componentMap[relateAttrCompId]
    if(relateCompData) {
      const relateMainEvent = getMainListEventByEvents(relateCompData.events)
      if(relateMainEvent) {
        controlId = relateMainEvent.controlId
      }
    }
  } else {
    compId = item.id
    const mainListEvent = getMainListEventByEvents(item.events)
    controlId = mainListEvent && mainListEvent.controlId
  }
  const useControls = useControlsStore()
  const baseControl = useControls.controls[compId] && useControls.controls[compId][controlId]
  if(baseControl) {
    let controlData = baseControl.data as IBaseListControl
    if(controlData) {
      if(controlData.elements) {
        wbLists_ = controlData.elements
      }
    }
  }
  return wbLists_
}

function getListByItem(item: IComponent) {
  const useSite = useSiteStore()
  const commonAttr = item.commonAttr
  const relateAttrCompId = getCompIdByParam(commonAttr.relateAttrCompId)
  if(relateAttrCompId) {
    const relateCompData = useSite.componentMap[relateAttrCompId]
    return relateCompData.lists
  } else {
    return item.lists
  }
}


function isWbList(item: IComponent) {
  let wbLists_ = getWbListByItem(item)
  if(_.isArray(wbLists_) && wbLists_.length > 0){
    return true
  } else {
    return false
  }
}

function getItemIndex(item: IComponent, index: number) {
  const useSite = useSiteStore()
  const commonAttr = item.commonAttr
  let index_: number = 0
  if(index >= 0) {
    index_ = index
  } else {
    const relateAttrCompId = getCompIdByParam(commonAttr.relateAttrCompId)
    if(relateAttrCompId) {
      const relateCompData = useSite.componentMap[relateAttrCompId]
      if(relateCompData.commonAttr.itemIndex >= 0) {
        index_ = relateCompData.commonAttr.itemIndex
      }
      if(commonAttr.itemIndex >= 0) {
        index_ = commonAttr.itemIndex
      }
    } else {
      if(commonAttr.itemIndex >= 0) {
        index_ = commonAttr.itemIndex
      }
    }
  }
  return index_ >= 0 ? index_ : 0
}


function getCheckboxStr(compData: IComponent, key: string =  'text') {
  const useInteraction = useInteractionStore()
  let selecteds: any = []
  let lists: any = []
  if(useInteraction.formValueMap[compData.id]) {
    selecteds = useInteraction.formValueMap[compData.id].selecteds
    lists = useInteraction.formValueMap[compData.id].lists
  }
  let checkboxNum = 0
  let strs = ''
  let str = ''
  _.forEach(selecteds, (id: number) => {
      checkboxNum++
      str = lists[id-1][key]
      strs += str ? str + ',' : id + ','
  })
  return { checkboxNum, strs }
}


export {
  isWbList,
  getWbListByItem,
  getListByItem,
  getWbListOrListByItem,
  getItemIndex,
  getCheckboxStr
}