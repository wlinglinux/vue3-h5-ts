// FRONT_EVENT_TYPE_MAPS.randomOpenPage
import { getCompIdByParam, isHasOwnProperty, EventBus, getRandomArrayElements } from '@/utils/'
import { useInteractionStore } from '@/store/interaction'
import { useSiteStore } from '@/store/site'
import { showPage, showPop} from '@/components/utils'
import { useControlsStore } from '@/store/controls'
import { CONTROL_TYPES } from '@/const/'
function randomOpenPage(item: IComponent, event: IEvent) {
  const useInteraction = useInteractionStore()
  let shareInteractionData: IShareInteractionData = useInteraction.shareInteractionData
  //823 祖玛珑寻找威廉梨人 1791 奶爸请就位 按钮触发下一题
  const pageDataStr = event.comps[1].attrs.value
  let randomPageIds: number[] = []
  let randomPageIndex = 0
  let pageId = -1
  let popId = -1
  let interactionData: any
  if (pageDataStr && pageDataStr.length > 0) {
    const pageData = JSON.parse(pageDataStr)
    //{"randomArr":[2,3,4,5,6],"notSameArr":[4,6],"randomCount":3,"lastPageId":7,"time":2}
    if (isHasOwnProperty(pageData, "notSameArr")) {
      randomPageIds = getRandomArrayElements(pageData.randomArr, pageData.notSameArr, pageData.randomCount)
    } else if (isHasOwnProperty(pageData, "randomArr")) {
      randomPageIds = pageData.randomArr
    }
    randomPageIndex = 0
    const relateCompId = getCompIdByParam(event.comps[1].attrs.relateCompId)
    if (relateCompId) {
      const rules = JSON.parse(event.comps[1].attrs.rules)
      interactionData = { randomPageIds, randomPageIndex: randomPageIndex + 1, relateCompId, rules }
    } else {
      interactionData = { randomPageIds, randomPageIndex: randomPageIndex + 1 }
    }
    _.merge(interactionData, pageData)
    shareInteractionData = interactionData
  } else {
    randomPageIds = shareInteractionData.randomPageIds!
    randomPageIndex = shareInteractionData.randomPageIndex!
    shareInteractionData.randomPageIndex = shareInteractionData.randomPageIndex! + 1
  }

  //更新下一次交互的数据和结果页面 1820打组 自定义数据
  if (randomPageIds.length == 0 && randomPageIndex < shareInteractionData.isRights!.length || randomPageIndex < randomPageIds.length) {
    useInteraction.updateInteractionData(interactionData)
    if (randomPageIds.length == 0) {
      EventBus.$emit("swiperNext", { item: item })
    } else {
      pageId = randomPageIds[randomPageIndex]
      if (pageId && pageId > 0) {
        window.setTimeout(() => {
          showPage(pageId, item)
        }, shareInteractionData.time! * 1000)
      }
    }
  } else {
    if (isHasOwnProperty(shareInteractionData, "lastPageId")) {
      pageId = shareInteractionData.lastPageId!
    }
    if (isHasOwnProperty(shareInteractionData, "lastPopId")) {
      popId = shareInteractionData.lastPopId!
    }
    //默认规则
    if (shareInteractionData.rules && isHasOwnProperty(shareInteractionData.rules, "pushIndexScores")) {
      scoreRules(shareInteractionData)
    } else {
      combinationRules(shareInteractionData)
    }
    if (pageId > 0 || popId > 0) {
      window.setTimeout(() => {
        if (pageId > 0) {
          showPage(pageId, item)
        }
        if (popId > 0) {
          showPop(popId)
        }
        useInteraction.resetInteractionData()
      }, shareInteractionData.time! * 1000)
    }
  }
}

function combinationRules(interactionData_: IShareInteractionData) {
  const useSite = useSiteStore()
  const componentMap = useSite.componentMap
  const useInteraction = useInteractionStore()


  const clickCompIdMap = interactionData_.clickCompIdMap
  const interactionRules = interactionData_.rules
  const interactionResultImgs = interactionData_.imgs
  let clickRuleTypes: number[] = []
  let searchImgIndex = 0
  const relateCompId = interactionData_.relateCompId
  const imgRelateCompIds = interactionData_.imgRelateCompIds
  const bgIndexs = interactionData_.bgIndexs!
  const bgRelateCompId = interactionData_.bgRelateCompId

  let relateCompList: any = []
  let index = 0
  for (let item of clickCompIdMap.values()) {
    clickRuleTypes.push(parseInt(item.relateType))
    relateCompList[index] = { url: item.relateUrl }
    index++
  }
  //更新关联组件属性，通用列表图片组
  if (relateCompId) {
    useSite.updateComponent({ id: relateCompId, data: { lists: relateCompList } })
  }
  if (interactionRules && isHasOwnProperty(interactionRules, "pushIndexMap")) {
    // 有顺序规则 站点 2337
    const pushIndexMap = interactionRules.pushIndexMap
    searchImgIndex = mapRules(interactionRules.rules, clickRuleTypes, pushIndexMap)
  } else {
    // 站点 823
    // 规则 [[1,1,1],[1,3,3],[1,2,3],[1,1,2],[1,2,2],[1,1,3],[2,2,3],[3,3,2],[3,3,3],[2,2,2]]
    for (let i = 0, len = interactionRules.length; i < len; i++) {
      let rules = _.cloneDeep(interactionRules[i])
      let length = 0
      let ruleIndex = -1
      _.forEach(clickRuleTypes, (value) => {
        ruleIndex = rules.indexOf(value)
        if (ruleIndex != -1) {
          _.pullAt(rules, ruleIndex)
          length++
        }
      })
      if (length == clickRuleTypes.length) {
        searchImgIndex = i
        break
      }
    }
  }
  //更新关联图片组件属性
  if (imgRelateCompIds) {
    const imgCompIds = imgRelateCompIds.split(",")
    _.forEach(imgCompIds, (imgRelateCompId: string) => {
      const imgRelateCompData = componentMap[imgRelateCompId]
      const imgUrl = imgRelateCompData.lists[searchImgIndex].url
      useSite.updateComponentAttr({ id: imgRelateCompId, commonAttr: { url: imgUrl } })
    })
  }
  //更新关联背景图片组件属性
  if (bgRelateCompId) {
    const bgRelateCompData = componentMap[bgRelateCompId]
    const bgUrl = bgRelateCompData.lists[bgIndexs[searchImgIndex]].url
    useSite.updateComponentAttr({ id: bgRelateCompId, commonAttr: { url: bgUrl } })
  }
  //更新通用动态图片
  if (interactionResultImgs) {
    const shareData = { url: interactionResultImgs[searchImgIndex] }
    useInteraction.updateShareData(shareData)
  }
  // 更新博文数据
  if (isHasOwnProperty(interactionData_, 'pushCompId') && interactionData_.pushCompId) {
    const pushCompId = interactionData_.pushCompId
    const pushCompData = componentMap[pushCompId]
    pushCompData.commonAttr.pushIndex = searchImgIndex
  }
}

function mapRules(rules: string[], result: number[], pushIndexMap: any) {
  // 站点2337
  //{"rules":[[1,5],[1,6],[1,7],[1,8],[2,5],[2,6],[3,7],[4,8],[3,5],[3,6],[3,7],[3,8],[4,5],[4,6],[4,7],[4,8]],"pushIndexMap":{"0":0,"1":0,"2":1,"3":3,"4":3,"5":0,"6":1,"7":3,"8":0,"9":1,"10":2,"11":2,"12":3,"13":2,"14":1,"15":3}}
  let searchIndex = 0
  for (let index = 0; index < rules.length; index++) {
    if (rules[index].toString() === result.toString()) {
      searchIndex = pushIndexMap[index]
      break
    }
  }
  return searchIndex
}

function scoreRules(interactionData_) {
  const useSite = useSiteStore()
  const componentMap = useSite.componentMap
  const useControls = useControlsStore()
  const useInteraction = useInteractionStore()

  const clickCompIdMap = interactionData_.clickCompIdMap

  const clickScores: number[] = []
  //通过选项对应的分数规则 返回发博索引{"rules":{"1":10,"2":20,"3":"30","4":"40"},"pushIndexScores":[40,90,120,160]}
  let rules = interactionData_.rules.rules//{"1":10,"2":20,"3":"30","4":"40"}
  let clickTotalScore = 0
  let score = 0
  let isRights: boolean[] = []
  // interactionData_.isRights = [5,2,3]//测试数据
  let isHaveRights = isHasOwnProperty(interactionData_, 'isRights')
  let index = 0
  for (let item of clickCompIdMap.values()) {
    score = parseInt(rules[item.relateType])
    clickTotalScore += score
    clickScores.push(score)
    if (isHaveRights) {
      if (interactionData_.isRights[index] == parseInt(item.relateType)) {
        isRights.push(true)
      } else {
        isRights.push(false)
      }
    }
    index++
  }
  let searchIndex = 0
  let pushIndexScores = interactionData_.rules.pushIndexScores
  for (let i = 0, len = pushIndexScores.length; i < len; i++) {
    if (clickTotalScore >= pushIndexScores[i]) {
      searchIndex = i
    }
  }
  //更新bindData 全局分数 clickTotalScore
  useInteraction.updateBindData({ key: 'score', value: clickTotalScore })
  useInteraction.updateBindData({ key: 'scores', value: clickScores })
  if (isHaveRights) {
    useInteraction.updateBindData({ key: 'isRights', value: isRights })
  }
  if (isHasOwnProperty(interactionData_, 'imgRelateCompIds') && interactionData_.imgRelateCompIds) {
    const imgRelateCompIds = interactionData_.imgRelateCompIds
    const imgCompIds = imgRelateCompIds.split(",")
    _.forEach(imgCompIds, (imgRelateCompId: string) => {
      const imgRelateCompData = componentMap[imgRelateCompId]
      const imgUrl = imgRelateCompData.lists[searchIndex].url
      useSite.updateComponentAttr({ id: imgRelateCompId, commonAttr: { url: imgUrl, itemIndex: searchIndex } })
    })
  }
  if (isHasOwnProperty(interactionData_, 'pushCompId') && interactionData_.pushCompId) {
    const pushCompId = interactionData_.pushCompId
    const pushCompData = componentMap[pushCompId]
    pushCompData.commonAttr.pushIndex = searchIndex
  }
  //更新计数每次增加数据 2152
  if (isHasOwnProperty(interactionData_, 'numberCompId') && interactionData_.numberCompId) {
    let baseControl = useControls.controls[interactionData_.numberCompId][CONTROL_TYPES.wb_number] as IBaseControl
    let numberControlData = baseControl.data as INumberControl
    numberControlData.onceGrowValue = numberControlData.vipOnceGrowValue = clickTotalScore
    // this.store.commit('setWbNumber', {id: interactionData_.numberCompId, controlId: numberControlData.controlId, data: numberControlData.data})
  }
}


export {
  randomOpenPage
}