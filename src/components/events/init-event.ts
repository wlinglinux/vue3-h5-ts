import { interactionDataEvent } from '@/components/events/fronts/';
import { EVENT_HOVER_TYPES, COMPONENT_TYPES, GENERAL_INIT_TYPES_MAP, EVENTS_RESULTS_TYPES_MAP, CONTROL_TYPES } from '@/const/'
import { getItemBaseControl, openLinkBySelfUrl } from '@/components/utils/'
import { useSiteStore } from '@/store/site'
import { useControlsStore } from '@/store/controls'
import { useInteractionStore } from '@/store/interaction'
import { useUploadStore } from '@/store/upload'
import { getCompIdByParam, EventBus } from '@/utils/'
import { showPage, showPop, showAlert } from '@/components/utils/'
import { USER_EVENT } from '@/store/models/events-data'
import { INIT_API_MAP, PROXY_URL, postInitData } from '@/service/api'
import { useActivityStore } from '@/store/activity'
import { initVoteEvent, initTimerEvent, initRepostsEvent, initRankFriendEvent, initJudgeRightWrongEvent, initUserEvent, initStatisticDataEvent } from '@/components/events/posts/init'
import { STATISTIC_DATA_TYPES_MAP } from '@/const/'


function onInitEvent(item: IComponent) {
  const useSite = useSiteStore()
  const siteInfo = useSite.siteInfo
  const userInfo: IUserInfo = useSite.userInfo
  const eventShare: IEventShare = item.eventShare
  _.forEach(eventShare.initEvents, (event: IEvent) => {
    const baseControl: IBaseControl = getItemBaseControl(item.id, event.controlId)
    switch (event.type) {
      case EVENT_HOVER_TYPES.vote:
        const voteData: IVoteControl = baseControl.data as IVoteControl
        const voteParams = initVoteEvent(baseControl)
        //只有日历会开启isUid这个开关 每日投票是根据计数来控制的
        if (voteData.isUid) {
          initPost(INIT_API_MAP.voteList, event, voteParams , item)
        } else {
          initPost(INIT_API_MAP.vote, event, voteParams, item)
        }
        break
      case EVENT_HOVER_TYPES.number:
        const useControls = useControlsStore()
        const controlData = useControls.controls[item.id] && useControls.controls[item.id][CONTROL_TYPES.wb_number].data as INumberControl
        const synCompId = controlData && getCompIdByParam(controlData.syn_com_id)
        if(controlData && (!synCompId || synCompId && controlData.onceGrowValue > 0)) {
          initPost(INIT_API_MAP.number, event, {}, item)
        }
        // initPost(INIT_API_MAP.number, event, {}, item)
        break
      case EVENT_HOVER_TYPES.numberDayExists:
        const numberExists = baseControl.data as INumberDayExistControl
        if(numberExists.isGlobal) {
          initPost(INIT_API_MAP.numberExists, event, {}, item)
        } else {
          initPost(INIT_API_MAP.numberDayExists, event, {}, item)
        }
        break
      case EVENT_HOVER_TYPES.generalNum:
        //进度条 统计参与活动用户数
        initPost(INIT_API_MAP.generalNum, event, { ele_key: (baseControl.data as IGeneralNumberControl).ele_key }, item)
        break
      case EVENT_HOVER_TYPES.isFollow:
        if (event.comps[1].attrs.value) {
          initPost(INIT_API_MAP.friendShip, event, { uidb: event.comps[1].attrs.value }, item)
        }
        break
      case EVENT_HOVER_TYPES.reposts:
        if(event.isPost || !baseControl){
          return
        }
        const mids = initRepostsEvent(baseControl)
        if(mids.length > 0) {
          event.isPost = true
          let params = { mids: mids.join() }
          //同一个页面同时有多个请求 博文组 事件 后端说有压力，这里就延时处理了
          window.setTimeout( () => {
            initPost(INIT_API_MAP.cardlist, event, params, item)
          }, siteInfo.repostsDelayTime)
          useSite.updateRepostsDelayTimeTime(100)
        } else {
          useSite.updatePageOrPopComNum(siteInfo.pageOrPopComNum - 1)
        }
        break
      case EVENT_HOVER_TYPES.rankFriend:
        if (event.isPost || !baseControl) {
          return
        }
        const friendParams = initRankFriendEvent(baseControl) //{ url , params }
        if(friendParams.url) {
          initPost(friendParams.url, event, friendParams.params, item)
          event.isPost = true
        }
        break
      case EVENT_HOVER_TYPES.judgeRightWrong:
        const { url , params } = initJudgeRightWrongEvent(baseControl)
        if(url) initPost(url, event, params, item)
        break
      case EVENT_HOVER_TYPES.user:
        if (event.isPost || !baseControl) {
          return
        }
        initPost(INIT_API_MAP.head, event, initUserEvent(baseControl), item)
        event.isPost = true
        break
      case EVENT_HOVER_TYPES.statisticData:
        if(event.isPost) return
        const statisticParams = initStatisticDataEvent(event)
        initPost(statisticParams.url, event, statisticParams.params, item)
        event.isPost = true
        break
      case EVENT_HOVER_TYPES.timer:
        initPost(INIT_API_MAP.controls, event, initTimerEvent(), item)
        break
    }
  })
  if (item.cid == COMPONENT_TYPES.wb_input && (item.commonAttr.isAuto) && !userInfo.uid) {
    if (item.isPost) {
      return
    }
    let params = { uid: '' }
    item.isPost = true
    initPost(INIT_API_MAP.head, _.cloneDeep(USER_EVENT), params, item)
  }
}

async function initPost(url: string, event: IEvent | any, params: any, item?: IComponent) {
  const useSite = useSiteStore()
  const siteInfo: ISiteInfo = useSite.siteInfo

  if (item && item.id && !params.com_id) {
    params.com_id = item.id
  }
  params.site_id = siteInfo.id
  const type: string = event.type
  const eventAttr: IEventAttr | any = item && item.eventAttr
  const controlId: string = event.controlId
  const isResultDisplay: boolean = params.isResultDisplay

  delete params.controlId
  delete params.isResultDisplay

  url = PROXY_URL + url
  const { data } = await postInitData(url, params)

  if (event && event.isInitComp && siteInfo.pageOrPopComNum > 0) {
    useSite.updatePageOrPopComNum(siteInfo.pageOrPopComNum - 1)
  }

  let isSuccess = false
  if (data.code == 0) {
    isSuccess = true
    setInitStoreData({ type, params, controlId, data, item })
  } else {
    showAlert(data.msg)
  }
  if (item && isResultDisplay && eventAttr) {
    //获取到数据 但是数据为空 需要结果提示 就重置了这个值 isResultDisplay
    if(data.code != 0) {
      isSuccess = false
    }
    //是否参数修改数据为结果数据，后使用接口的结果类型来显示通讯后的结果提示
    if (isSuccess && event.type == EVENT_HOVER_TYPES.statisticData) {
      // const statisticDataType = event.comps[0].attrs.value
      // if (statisticDataType == STATISTIC_DATA_TYPES_MAP.weibo2021vote) {
      //   // 微博2021年抽奖
      // } else if(statisticDataType == STATISTIC_DATA_TYPES_MAP.weiboTime) {
      //   //获取数据
      // }
      
      if (_.isBoolean(data.data) && !data.data) {
        isSuccess = data.data
      }
    }
    setInitResultDisplay({ item, isSuccess, eventAttr, type })
  }
}

function setInitResultDisplay({ item, isSuccess, eventAttr, type }: { item: IComponent, isSuccess: boolean, eventAttr: IEventAttr, type: string | number }) {
  if (eventAttr.resultType == EVENTS_RESULTS_TYPES_MAP.page) {
    // 触发事件后 跳转页面
    let pageId: number
    if (isSuccess) {
      pageId = eventAttr.successPanelId
    } else {
      pageId = eventAttr.failPanelId
    }
    if (pageId) {
      showPage(pageId, item)
    }
  } else if (eventAttr.resultType == EVENTS_RESULTS_TYPES_MAP.pop) {
    let popId: number
    if (isSuccess) {
      popId = eventAttr.successPanelId
    } else {
      popId = eventAttr.failPanelId
    }
    if (popId) {
      showPop(popId)
    }
  } else if (eventAttr.resultType == EVENTS_RESULTS_TYPES_MAP.jump) {
    //触发事件后跳转
    if (isSuccess && eventAttr.link.length > 0) {
      openLinkBySelfUrl(eventAttr.link);
    }
  } else if (eventAttr.resultType == EVENTS_RESULTS_TYPES_MAP.component) {
    //一个组件只能走一次这个代码
    if (type == eventAttr.eventType) {
      const useInteraction = useInteractionStore()
      //动态组件 在ui中直接显示结果
      useInteraction.resetVisibleComponents()
      const commonAttr: any = { isVisible: true }
      let compId: string
      if (isSuccess) {
        compId = eventAttr.successCompId
      } else {
        compId = eventAttr.failCompId
      }
      let relateCompId = getCompIdByParam(compId)
      if (relateCompId) {
        useInteraction.updateComponentVisible({ id: relateCompId, commonAttr })
      }
    }
  }
}

async function setInitStoreData({ type, params, controlId, data, item }) {
  const useSite = useSiteStore()
  const useControls = useControlsStore()
  const useActivity = useActivityStore()
  switch (type) {
    case EVENT_HOVER_TYPES.number || type == EVENT_HOVER_TYPES.generalNum:
      useControls.setInitNumber({ id: params.com_id, controlId, data: data.data })
      break
    case EVENT_HOVER_TYPES.numberDayExists || type == EVENT_HOVER_TYPES.numberExists:
      useControls.setInitNumberDayExists({ id: params.com_id, controlId, data: data.data })
      break
    case EVENT_HOVER_TYPES.vote:
      useControls.setInitVote({ id: params.com_id, controlId, data: data.data })
      break
    case EVENT_HOVER_TYPES.reposts:
      let repostsData_ = { id: params.com_id, controlId, data: data.data }
      useControls.setInitReposts(repostsData_)
      break
    case EVENT_HOVER_TYPES.saveImg:
      const useUpload = useUploadStore()
      useUpload.updateFileUploadData(data.data)
      break
    case EVENT_HOVER_TYPES.rankFriend:
      let rankFriendData_ = { id: params.com_id, controlId, data: data.data }
      useControls.setInitFriends(rankFriendData_)
      break
    case EVENT_HOVER_TYPES.timer:
      let timerData_ = { id: params.com_id, controlId, data: data.data }
      useSite.updateTime(timerData_)
      break
    case EVENT_HOVER_TYPES.isFollow:
      //接口返回是否关注过需要关注的用户，如果关注过就不显示全局关注组件
      // data: false
      let globalPost = { isFollowedMap: {} }
      globalPost.isFollowedMap[params.uidb] = data.data
      useSite.updateGlobalPost(globalPost)
      const compData: IComponent = useSite.componentMap[params.com_id]
      if (compData.cid == COMPONENT_TYPES.wb_btn) {
        let isNumber = !data.data
        //如果用户已经关注但是关注没有成功，但是计数已经执行了，游戏次数已经添加了，这时通过每日计数将按钮置灰
        const numberDayExistsBaseControl = useControls.controls[compData.id][CONTROL_TYPES.wb_number_day_exists]
        const numberDayExistsControlData: INumberDayExistControl = numberDayExistsBaseControl && numberDayExistsBaseControl.data as INumberDayExistControl
        if(numberDayExistsControlData) {
          if(!numberDayExistsControlData.isNumber) {
            isNumber = numberDayExistsControlData.isNumber
          }
        }
        EventBus.$emit("refreshNumberDayExists", { compId: compData.id, isNumber })
        //已经关注 第一次触发计数事件 记录这个按钮状态 计数事件顺序必须在是否关注之前
        if(!isNumber && compData.events.number && (useControls.controls[compData.id][CONTROL_TYPES.wb_number].data as INumberControl).num <= 0) {
          compData.eventShare.isEmitInitEvent = false
          EventBus.$emit("itemClick", {id: item.id, index: 0})
        }
      } else if (compData.cid == COMPONENT_TYPES.wb_is_post_event) {
        useSite.updateComponentAttr({ id: params.com_id, commonAttr: { isVisible: !data.data } })
      }
      break
    case EVENT_HOVER_TYPES.user:
      if (!params.uids || params.uids.length <= 0) {
        useSite.setUserInfo(data.data as IUserInfo)
      }
      //自动填写用户姓名时controlId为空，只有全局wbUserData
      if (controlId) {
        const data_ = { id: params.com_id, controlId, data: data.data }
        useControls.setInitUserList(data_)
      }
      break
    case EVENT_HOVER_TYPES.statisticData:
      const statisticDataType = params.type
      if (statisticDataType == STATISTIC_DATA_TYPES_MAP.weibo2021vote) {
        // 微博2021年抽奖
      } else if(statisticDataType == STATISTIC_DATA_TYPES_MAP.weiboTime) {
        // 微博时间
        useActivity.setStatisticData({ id: params.com_id, controlId, data: data.data })
      }
      // const data_ = await getStatisticData(params, data, controlId)
      // useActivity.setStatisticData(data_)
      break
    case EVENT_HOVER_TYPES.judgeRightWrong:
      setJudgeRightWrong(params, data, controlId, item)
      break
    case EVENT_HOVER_TYPES.share:
      useSite.setShare(data.data)
      break
  }
}

async function getStatisticData(params: any, data: any, controlId: string) {
  const data_ = { id: params.com_id, controlId, data: data.data }
  if (data_.data.interact_uid && data_.data.interact_uid.length > 0 && data_.data.interact_uid != '0') {
    _.merge(params, { uids: data_.data.interact_uid })
    let user = await postInitData(INIT_API_MAP.head, params)
    if (user.data.data.users) {
      data_.data.elements = user.data.data.users
    } else {
      data_.data.elements = [user.data.data]
    }
  }
  return data_
}

function setJudgeRightWrong(params: any, data: any, controlId: string, item: IComponent) {
  const useControls = useControlsStore()
  const useInteraction = useInteractionStore()
  //获取通用
  switch(params.type) {
    case GENERAL_INIT_TYPES_MAP.area:
      useControls.updateArea({ id: params.com_id, controlId, data: data.data })
      break
    case GENERAL_INIT_TYPES_MAP.arearank:
      useControls.updateAreaRank({ id: params.com_id, controlId, data: data.data })
      break
    case GENERAL_INIT_TYPES_MAP.puzzle:
        useControls.updatePuzzle({ id: params.com_id, controlId, data: data.data })
      break
    case GENERAL_INIT_TYPES_MAP.draw:
      useControls.updateDraw({ id: params.com_id, controlId, data: data.data })
      break
    case GENERAL_INIT_TYPES_MAP.lotteryForm:
      //刷新动态图片和文字
      // {luck:[],luck_list:[],num_form:0,num_luck:0,coupon_list=>[ "xxxx","xxxx"]  //中奖的券码}
      const formLottery: IFormLottery = data.data as IFormLottery
      const formLotteryItem: IFormLotteryItem = formLottery.luck_list && formLottery.luck_list[0]
      if (formLottery.coupon_list && formLottery.coupon_list[0]) {
        const couponListItem: ICouponListItem = formLottery.coupon_list[0] as ICouponListItem
        useInteraction.updateBindData({ key: 'couponCode', value: couponListItem.sn })
      }
      if (formLotteryItem && (formLotteryItem.ele_name || formLotteryItem.ele_url)) {
        useInteraction.updateBindData({ key: 'lotteryUrl', value: formLotteryItem.ele_url })
        useInteraction.updateBindData({ key: 'lotteryName', value: formLotteryItem.ele_name })
        useInteraction.updateBindData({ key: 'lotteryTime', value: formLotteryItem.create_time })
        EventBus.$emit("refreshDynamicData")
      } else {
        data.code = -1
      }
      break
    case GENERAL_INIT_TYPES_MAP.formrandlist:
      useControls.updateFormrandlist({ id: item.id, controlId, formList: data.data })
      break
    case GENERAL_INIT_TYPES_MAP.wzRank:
      useControls.updateList({ id: item.id, controlId, data: data.data })
      break
    case GENERAL_INIT_TYPES_MAP.wzSraffletimes:
      useControls.updateWZTime({ id: item.id, controlId, data: data.data })
      break
    case GENERAL_INIT_TYPES_MAP.info:
      useControls.updateInitInfo({ item, data: data.data })
      break
  }
}

export {
  onInitEvent,
  initPost
}