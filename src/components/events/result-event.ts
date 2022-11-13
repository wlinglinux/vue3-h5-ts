import { getCompIdByParam, isHasOwnProperty, EventBus, isJSON } from '@/utils/'
import { EVENT_HOVER_TYPES, COMPONENT_TYPES, EVENTS_RESULTS_TYPES_MAP, CONTROL_TYPES } from '@/const/'
import { showPage, showPop, showToast, openLinkBySelfUrl } from '@/components/utils/'
import { useSiteStore } from '@/store/site'
import { useInteractionStore } from '@/store/interaction'
import { getItemBaseControl } from '@/components/utils/'
import { postStatics } from '@/service/statics'

function eventResultDisplay({ item, type }: { item: IComponent, type: string }) {
  const useSite = useSiteStore()
  const useInteraction = useInteractionStore()
  const siteInfo = useSite.siteInfo
  const eventShare = item.eventShare
  const eventAttr: IEventAttr = item.eventAttr
  const isSuccess = eventShare.isSuccess
  //在某些特殊事件中动态设置的字段，如果为true就不需要在这里在触发弹层了
  if (eventAttr && eventAttr.isNoActEventResult) {
    return
  }
  //给页面或弹层设置 组件动态字段数据
  postSetShareData({ item, type })

  if(eventAttr.resultType == EVENTS_RESULTS_TYPES_MAP.page) {
    // 触发事件后 跳转页面
    let pageId: number
    if(isSuccess) {
      pageId = eventAttr.successPanelId
    }else {
      pageId = eventAttr.failPanelId
    }
    if(pageId) {
      //防止剩下事件还没有执行完，就跳转页面了
      eventShare.showPageCb = window.setInterval(() => {
        if(eventShare.isClick) {
          showPage(pageId, item)
          window.clearInterval(eventShare.showPageCb)
        }
      }, siteInfo.reloadTime)
    }
  } else if (eventAttr.resultType == EVENTS_RESULTS_TYPES_MAP.pop) {
    //老虎机1196和跑马灯2674的弹层需要在 动画结束后才能弹出，需要打开 主事件结果中断 isBreakResult这个开关
    if(isHasOwnProperty(eventAttr, 'isBreakResult') || eventAttr.isBreakResult) {
      let lotteryIndex: number = -1
      if(eventShare.lotteryIndex >= 0) {
        lotteryIndex = eventShare.lotteryIndex
      }
      eventShare.delayShowPopParams = { item, type }
      EventBus.$emit('stopSlotMachine', lotteryIndex)
      eventShare.lotteryIndex = -1
    } else {
      postShowPop({ item, type })
    }
  } else if (eventAttr.resultType == EVENTS_RESULTS_TYPES_MAP.jump) {
    //触发事件后跳转
    if (isSuccess && eventAttr.link.length > 0) {
      openLinkBySelfUrl(eventAttr.link);
    }
  } else if (eventAttr.resultType == EVENTS_RESULTS_TYPES_MAP.component) {
    //一个组件只能走一次这个代码
    if (type == eventAttr.eventType) {
      //动态组件 在ui中直接显示结果
      let commonAttr = { isVisible: true }
      let compId: string
      if (isSuccess) {
        compId = eventAttr.successCompId
      } else {
        compId = eventAttr.failCompId
      }
      const params = eventAttr.params ? JSON.parse(eventAttr.params) : null
      if(compId) {
        let relateCompId = getCompIdByParam(compId)
        let relateComp: IComponent = useSite.componentMap[relateCompId]
        let groupComp = relateComp && relateComp.interactionData.isInGroup &&  useSite.componentMap[relateComp.interactionData.groupCompId!]
        if(groupComp && groupComp.cid == COMPONENT_TYPES.group_carousel) {
          relateCompId = relateCompId + '_' + item.commonAttr.itemIndex + '_' + relateComp.commonAttr.qIndex
        }
  
        if(params && params.delayTime) {
          window.setTimeout(() => {
            useSite.updateComponentAttr({id: relateCompId, commonAttr: { isVisible: false } })
          }, params.delayTime * 1000)
        } else {
          useInteraction.resetVisibleComponents()
        }
        useInteraction.updateComponentVisible({ id: relateCompId, commonAttr })
      } else if(params && params.msg) {
        showToast(params.msg)
      }
    }
  } else {
    //不提示任何信息
  }
}

function postSetShareData({ item, type }: { item: IComponent, type: string }) {
  const eventShare = item.eventShare
  const shareData = { content: '', url:'' }
  const isSuccess = eventShare.isSuccess
  const data: ICommunicationData = eventShare.communicationData

  const infoStr = item.events[type] && item.events[type].comps[0].attrs.value
    //733  {"920105":"您已兑换过此礼品","920110":"您已兑换过此礼品","920117":"此礼物已兑换完","successText":"恭喜你兑换了$name$","failText":"兑换失败","default":"","notEnough":"碎片不足"}
  if(infoStr && infoStr.length > 0) {
    const error = JSON.parse(infoStr)
    if(isSuccess) {
      let attrName = getCompIdByParam(error.successText)
      let controlData = getItemBaseControl(item.id, CONTROL_TYPES.wb_number)
      if(attrName && controlData){
        shareData.content = error.successText.replace("$num$", (controlData.data as INumberControl).num)
      }else{
        shareData.content = error.successText
      }
      //抽奖奖品
      if(type == EVENT_HOVER_TYPES.lottery) {
        setShareByLottery(item, shareData, error.successText)
      }
    } else {
      setShareUrlOrContent(error, data.code, shareData)
    }
  } else {
    if(isSuccess) {
      if(type == EVENT_HOVER_TYPES.lottery) {
        setShareByLottery(item, shareData, '')
      } else if(type == EVENT_HOVER_TYPES.packet) {
        //'type'=>1,'award’=>1.2是现金的大小单位为元 'type'=>2,'award’=>'奖品名称'
        shareData.content = data.data.award
      }
    }
  }
  let isShare = false
  for(let key in shareData) {
    if(shareData[key]) {
      isShare = true
      break
    }
  }
  if(isShare) {
    const useInteraction = useInteractionStore()
    useInteraction.updateShareData(shareData)
  }
}

function configChangeShareData(lists: IInteractionItem[]) {
  let shareData: IShareData = { videoUrl: '', posterUrl:'' }
  _.forEach(lists, (item: IInteractionItem) => {
    if(isJSON(item.params)) {
      let obj = JSON.parse(item.params)
      if(obj.videoUrl) {
        shareData.videoUrl = obj.videoUrl //视频地址
        shareData.posterUrl = item.url    //视频封面
      }
    } else {
      shareData.url = item.url           //海报地址
    }
  })
  const useInteraction = useInteractionStore()
  useInteraction.updateShareData(shareData)
}

function setShareByLottery(item: IComponent, shareData: IShareData, successText: string = '') {
  const eventAttr = item.eventAttr
  const eventShare = item.eventShare
  const data: ICommunicationData = eventShare.communicationData
  
  const lotteryData: ILottery = data.data as ILottery
  if (lotteryData.gift_name) {
    if(lotteryData.gift_info && lotteryData.gift_info.coupon_list && lotteryData.gift_info.coupon_list.length >0) {
      const useInteraction = useInteractionStore()
      useInteraction.updateBindData({ key: 'couponCode', value: (lotteryData.gift_info.coupon_list[0] as ICouponListItem).sn })
    }
    item.eventShare.lotteryIndex = lotteryData.gift_idx
    setPushCompPushIndex(item, lotteryData.gift_idx)
    shareData.content =  successText ? successText.replace("$name$", lotteryData.gift_name) : lotteryData.gift_name
    shareData.url = lotteryData.pic_url
    // 多维抽奖 2253 自定义数据
    if(item.interactionData && item.interactionData.isDimension && item.interactionData.dimensionLists) {
      if(item.eventShare.lotteryIndex >= 0 && item.interactionData.dimensionLists) {
        let list: IInteractionItem[] = item.interactionData.dimensionLists[item.eventShare.lotteryIndex]
        let index  = _.random(0, list.length - 1)
        shareData.url = list[index].url
      }
    }
    setEveryRewrdPop({item, eventAttr, data})
  } else {
    staticsError(item, eventAttr, data)
  }
}

const LOTTERY_ERROR_NOS = [920105, 920106, 920107, 920109, 920110, 920111, 920112, 920113, 920114, 920115, 920116, 920117, 920118, 900104]
function postShowPop({ item, type }: { item: IComponent, type: string }) {
  const eventShare = item.eventShare
  const eventAttr = item.eventAttr
  const isSuccess = eventShare.isSuccess
  const data = eventShare.communicationData

  const useSite = useSiteStore()
  const siteInfo = useSite.siteInfo
  let popId: number
  let content = data.msg
  if (isSuccess) {
    popId = eventAttr.successPanelId
  } else {
    popId = eventAttr.failPanelId
    let isErrorParamsJson = eventAttr.params && isJSON(eventAttr.params)
    if(isErrorParamsJson) {
      const error = JSON.parse(eventAttr.params)
      //自定义参数{"errorCode":{"popId":6}}
      if(isHasOwnProperty(error, data.code.toString())) {
        if(error[data.code].popId && error[data.code].popId > 0) {
          popId = error[data.code].popId
        } else {
          popId = 0
          content = error[data.code]
        }
      } else if (isHasOwnProperty(error, "allRange")) {
        // 接口失败后按照 配置弹出弹，将组件中配置的自定义数据 复制给 shareData 2341
        if(item.interactionData) {
          let lists: IInteractionItem[] = item.interactionData.lists
          configChangeShareData(lists)
        }
        randomPop(eventAttr.params)
        return
      }
    }
  }
  if (popId > 0) {
    eventShare.showPopCb = window.setInterval(() => {
      if(eventShare.isClick) {
        window.clearInterval(eventShare.showPopCb)
        showPop(popId)
      }
    }, siteInfo.reloadTime)
  } else {
    const infoStr = item.events[type] && item.events[type].comps[0].attrs.value
    if(infoStr && infoStr.length > 0){
      const error = JSON.parse(infoStr)
      if(data.code != 0) {
        content = error[data.code]
      } else {
        if(isSuccess) {
          content = error.successText
        } else {
          content = error.failText
        }
      }
    }
    showToast(content)
  }
}

function randomPop(data: string){
  // {"allRange":[0,20],"range":["1,20","0"],"popId":[4,3]} 站点
  if(isJSON(data)){
    let randPopObj = JSON.parse(data)
    let ranges = randPopObj.range
    let allRanges = randPopObj.allRange
    if(!allRanges){
      allRanges = [0,5]
    }
    let popIds = randPopObj.popId
    let random = _.random(allRanges[0], allRanges[1])
    if(random == ranges[1]) {
      showPop(popIds[1])
    }else{
      showPop(popIds[0])
    }
  }
}

function setShareUrlOrContent(error: any, key: number, shareData: IShareData) {
  if(error[key]){
    const isImg = error[key].indexOf("http") != -1 ? true : false
    if(isImg) {
      shareData.url = error[key]
    } else {
      if(error.failText && error.failText.indexOf("http") != -1){
        shareData.url = error.failText
      } else {
        shareData.content = error[key]
      }
    }
  } else {
    if(error.failText && error.failText.indexOf("http") != -1){
      shareData.url = error.failText
    } else {
      shareData.content = error[key]
    }
  }
}

//抽奖关联发博
function setPushCompPushIndex(item: IComponent, itemIndex: number){
  const useSite = useSiteStore()
  let controlData = getItemBaseControl(item.id, CONTROL_TYPES.wb_lottery)
  if(controlData) {
    // 抽奖设置关联发博组件ids，领取卡片
    let relateCompIdsStr =  (controlData.data as ILotteryControl).relateCompId
    let relateCompIdsArr = relateCompIdsStr.split(',')
    let relateCompIdStr = ''
    if(relateCompIdsArr.length > 1){
      relateCompIdStr = relateCompIdsArr[itemIndex]
    }else{
      relateCompIdStr = relateCompIdsArr[0]
    }
    let relateCompId = getCompIdByParam(relateCompIdStr)
    if(relateCompId) {
      const relateCompData = useSite.componentMap[relateCompId]
      relateCompData.commonAttr.itemIndex = itemIndex
    }
  }
}

function setEveryRewrdPop({item, eventAttr, data}){
  const useSite = useSiteStore()
  //事件的成功弹层被具体的奖品需要特定的弹层替换
  let rewardControlData = getItemBaseControl(item.id, CONTROL_TYPES.wb_lottery)
  const lotteryData: ILottery = data.data as ILottery
  let rewardItem = rewardControlData && (rewardControlData.data as ILotteryControl).elements[lotteryData.gift_idx]
  if(rewardItem && rewardItem.popId > 0 && useSite.pops[rewardItem.popId-1]){
    if(eventAttr.resultType == EVENTS_RESULTS_TYPES_MAP.pop) {
      eventAttr.successPanelId = rewardItem.popId
    }
  }
}

function staticsError(item: IComponent, eventAttr: IEventAttr, data: any) {
  eventAttr.successPanelId = eventAttr.failPanelId;
  postStatics({
    comType: 'error', comId: item.id, wModule:'lottery', pageIndex: _.toString(useSiteStore().pageIndex), apiType: 'error',
    apiUri: '', params: JSON.stringify(data), jumpUrl: "", clickSequence: "", mouseX: '0', mouseY: '0'
  })
}

export {
  eventResultDisplay,
  postShowPop
}