import { useActivityStore } from '@/store/activity'
import { CONTROL_TYPES, GENERAL_TYPES_MAP, EVENT_HOVER_TYPES, COMPONENT_TYPES, INJECT_GROUP_CLASS_NAME_MAP } from '@/const/'
import { getCompIdByParam, isHasOwnProperty, isJSON } from '@/utils/'
import { POST_API_MAP } from '@/service/api'
import { useSiteStore } from '@/store/site'
import { useControlsStore } from '@/store/controls'
import { useInteractionStore } from '@/store/interaction'
import { eventResultDisplay } from '@/components/events/result-event'
import { resetSubmitStatus, showToast, getItemBaseControl, showPage, showPop, getCheckboxStr } from '@/components/utils/'

function generalEvent(item: IComponent, event: IEvent, params: any ) {
  const useSite = useSiteStore()
  const useInteraction = useInteractionStore()
  const useControls = useControlsStore()

  let url = POST_API_MAP.general
  const controlId = event.controlId
  const baseControl = getItemBaseControl(item.id, controlId)
  const controlData = baseControl && baseControl.data as IGeneralControl
  const ele_key = controlData.ele_key
  params.ele_key = ele_key
  const relateCompId = getCompIdByParam(controlData.relateCompId)
  const relateCompData = useSite.componentMap[relateCompId]
  if(relateCompData) {
    params.com_id = relateCompId
  }
  const useActivity = useActivityStore()
  const activityInfo = useActivity.activityInfo
  let hint = ''
  if(activityInfo.isJoin  && ele_key != GENERAL_TYPES_MAP.info) {
    hint = "亲，您已经参加过这个活动了！！"
    let hintStr = event.comps[0].attrs.value
    if(hintStr && isJSON(hintStr)){
      let hintObj = JSON.parse(hintStr)
      //为空字符串可以覆盖默认的hint
      if(hintObj.hint || hintObj.hint == '') {
        hint = hintObj.hint
      }
    }
    const pageId = activityInfo.jumpPageId
    const popId = activityInfo.jumpPopId
    if (pageId > 0) {
      showPage(pageId, item)
    }
    if(popId > 0){
      showPop(popId)
    }
    if(hint) {
      showToast(hint)
    }
    url = ''
    resetSubmitStatus(item.eventShare)
    return url
  } else {
    if(ele_key != GENERAL_TYPES_MAP.draw && ele_key != GENERAL_TYPES_MAP.puzzle && ele_key != GENERAL_TYPES_MAP.randbm && ele_key != GENERAL_TYPES_MAP.info) {
      useActivity.updateActivityInfo({ id: '', controlId: '', data: { isJoin: true } })
    }
  }
  switch (ele_key) {
    case GENERAL_TYPES_MAP.info:
      //ext_1=王者荣耀 ext_2=曹操,乔安娜,宫本武藏
      const getCompId = getCompIdByParam(controlData.getCompId)
      controlData[controlData.ext_key] = getRadioOrCheckboxStr(useSite.componentMap[getCompId])
      params[controlData.ext_key] = controlData[controlData.ext_key]
      let isJoin = useActivity.activityInfo.isJoin
      if(isJoin) params.operate = 'reset' // 重置的时候就添加该属性
    break
    case GENERAL_TYPES_MAP.tree:
    break
    case GENERAL_TYPES_MAP.randbm:
    break
    case GENERAL_TYPES_MAP.scoreForm:
      // 这个没有触发事件
      url = ''
    break
    case GENERAL_TYPES_MAP.lotteryForm:
      // 这个没有触发事件
      url = ''
      const pageId = activityInfo.jumpPageId
      const popId = activityInfo.jumpPopId
      if(isHasOwnProperty(controlData, 'isPopup') && controlData['isPopup']) {
        controlData['isPopup'] = false
        if (pageId > 0) {
          showPage(pageId, item)
          useControls.updateLotteryForm({id: item.id, controlId, data: { isPopup: false }})
        }
        if(popId > 0){
          useControls.updateLotteryForm({id: item.id, controlId, data: { isPopup: false }})
          showPop(popId)
        }
        resetSubmitStatus(item.eventShare)
        return ''
      }
    break
    case GENERAL_TYPES_MAP.area:
      // delete params.com_id;
      if(!useInteraction.formValueMap[relateCompId]) {
        showToast("亲，请选择一个选项呗！！！");
        url = ''
      } else {
        if(relateCompId && useInteraction.formValueMap[relateCompId]) {
          params.area_code = useInteraction.formValueMap[relateCompId].value || useInteraction.formValueMap[relateCompId].item.value
          //https://apib.hd.xxx.com/v1/feact/area_bind?site_id=&area_code=
          url = POST_API_MAP.areaBind
        } else {
          url = ''
        }
      }
      break
    case GENERAL_TYPES_MAP.draw:
      setDrawTypeParams(item, params, relateCompData)
      break
    case GENERAL_TYPES_MAP.puzzle:
      setPuzzleTypeParams(item, event, params, relateCompData)
      break
    case GENERAL_TYPES_MAP.baoming:
      // 获取单位的值 站点2422 元气植物
      if(!useInteraction.formValueMap[relateCompId]) {
        showToast("亲，请选择一个选项呗！！！");
        url = ''
      } else {
        // 获取到对应的id值
        const index  = useInteraction.formValueMap[relateCompId].value || useInteraction.formValueMap[relateCompId].item.value
        const obj = JSON.parse(item.events[EVENT_HOVER_TYPES.anchor].comps[2].attrs.value)
        if(obj) {
          const pageId = obj.pages[index]
          params.ext_1 = pageId
        }
      }
      break
  }
  return url
}

function getRadioOrCheckboxStr(compData: IComponent) {
  const useInteraction = useInteractionStore()
  let strs = ''
  const injectJsClass = compData.commonAttr.injectJsClass
  if(compData.cid == COMPONENT_TYPES.wb_radio || injectJsClass == INJECT_GROUP_CLASS_NAME_MAP.MenuByBtns) {
    strs = useInteraction.formValueMap[compData.id].value
  } else if(compData.cid == COMPONENT_TYPES.wb_checkbox || injectJsClass == INJECT_GROUP_CLASS_NAME_MAP.CheckBox || injectJsClass == INJECT_GROUP_CLASS_NAME_MAP.RandomSelected) {
    const data = getCheckboxStr(compData)
    strs = data.strs
  }
  return strs
}

function setPuzzleTypeParams(item: IComponent, event: IEvent, params: any, relateCompData: IComponent) {
  const useControls = useControlsStore()
  const useInteraction = useInteractionStore()
  //http://apib.hd.xxx.com/v1/feact/general?site_id=1229&com_id=&ele_key=puzzle&ext_1=
  const generalControlId = CONTROL_TYPES.wb_judge_right_wrong//获取通用接口 controlId
  let puzzle = _.cloneDeep(useInteraction.shareInteractionData.puzzle)
  let ext_1 = puzzle.join(',')
  if(relateCompData) {
    //配对 减一
    let matchLength = relateCompData.interactionData.matchLength
    let team_one = _.dropRight(puzzle, matchLength)
    let team_two = _.drop(puzzle, matchLength)
    let isSuccess = false
    for(let i = 0, len = team_one.length; i < len; i++) {
      if(parseInt(team_one[i]) == 1 && parseInt(team_one[i]) == parseInt(team_two[i])) {
        team_one[i] = 2
        team_two[i] = 2
        isSuccess = true
        break
      }
    }
    puzzle = _.concat(team_one, team_two)
    ext_1 = puzzle.join(',')

    const eventShare = item.eventShare
    eventShare.communicationData = { code: 0, msg:'', data: { ext_1 } }
    eventResultDisplay({ item: relateCompData, type: event.type})
  }
  useControls.updatePuzzle({ id: params.com_id, controlId: generalControlId, data: { ext_1 } })
  params.ext_1 = ext_1
}

function setDrawTypeParams(item: IComponent, params: any, relateCompData: IComponent) {
  const useControls = useControlsStore()
  const useInteraction = useInteractionStore()
  //http://apib.hd.xxx.com/v1/feact/general?site_id=1229&com_id=&ele_key=draw&ext_1={}
  let generalControlId = CONTROL_TYPES.wb_judge_right_wrong//获取通用接口 controlId
  //在关联组件上点击领取卡片 1372 触发通用事件和获取通用事件不在一个组件上，通过关联组件将获取通用的组件id传到后端
  const card = _.cloneDeep(useInteraction.shareInteractionData.card)
  if(relateCompData && relateCompData.interactionData && relateCompData.interactionData.card) {
    //3d旋转组件给这个组件设置的值rotateIndex
    let listIndex: number = item.commonAttr.itemIndex
    if(listIndex != -1){
      const listKey: string = _.toString(listIndex + 1)
      if(isHasOwnProperty(card, listKey)){
        card[listKey] += 1
      }
    }
    //领取卡片，更新controls里存储的值
    useControls.updateDraw({ id: params.com_id, controlId: generalControlId, data: { ext_1: card } })
  } else {
    //自身有自定义数据，每条数据都减1，合成事件
    let total = 0
    let length = 0
    _.forEach(card, (num: number) => {
      length++
      if(num > 0) {
        total += 1
      }
    })
    if(total >= length){
      _.forEach(card, (num: number, key: string) => {
        card[key] -= 1
      })
    }
    useControls.updateDraw({ id: params.com_id, controlId: generalControlId, data: { ext_1: card } })
  }
  params.ext_1 = JSON.stringify(card);
}

function generalGaobai(data: IGeneralControl): boolean {
  replaceComId(data, 'ext_1', 'uid')
  replaceComId(data, 'ext_4')
  replaceComId(data, 'ext_5')
  if (!data.ext_1 || data.ext_1 && data.ext_1.length <= 0) {
    showToast("还没有选择好友")
    return false
  }
  if (!data.ext_5 || data.ext_5 && data.ext_5.length <= 0) {
    showToast("还没有选择礼物")
    return false
  }
  return true
}

function replaceComId(obj: object, key: string, matchKey: string = '') {
  const useInteraction = useInteractionStore()
  let relateCompId = getCompIdByParam(obj[key])
  if (relateCompId && relateCompId.length > 1) {
    if (useInteraction.formValueMap[relateCompId]) {
      if (matchKey == 'uid') {
        obj[key] = useInteraction.formValueMap[relateCompId].item.uid ? useInteraction.formValueMap[relateCompId].item.uid : useInteraction.formValueMap[relateCompId].item.id
      } else {
        obj[key] = useInteraction.formValueMap[relateCompId].value
      }
    } else {
      obj[key] = ''
    }
  }
}

export {
  generalEvent
}