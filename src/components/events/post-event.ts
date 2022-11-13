import { getCompIdByParam, isHasOwnProperty, EventBus, getMousePos, isJSON } from '@/utils/'
import { EVENT_HOVER_TYPES, COMPONENT_TYPES, GENERAL_TYPES_MAP } from '@/const/'
import { useInteractionStore } from '@/store/interaction'
import { useSiteStore } from '@/store/site'
import { useControlsStore } from '@/store/controls'
import { useActivityStore } from '@/store/activity'
import { onFrontEvents } from '@/components/events/front-event'
import { eventResultDisplay, postShowPop } from '@/components/events/result-event'
import { resetSubmitStatus, showToast, getItemBaseControl, showPop } from '@/components/utils/'
import { POST_API_MAP, PROXY_URL, postInteractionData } from '@/service/api'
import { pushEvent, numberEvent, voteEvent, repostEvent, generalEvent, followEvent, msgEvent, submitEvent } from '@/components/events/posts/'
import { API_VERSION, postStatics } from '@/service/statics'

function isPostWbEventOrCommonEvents({ item, loadEvent }: { item: IComponent, loadEvent: IEvent | null }) {
  let event = loadEvent ? loadEvent : item.eventShare.wbEvents[item.eventShare.eventIndex]
  if(event) {
    postWbEvent({ item, loadEvent })
  }else{
    onFrontEvents( { item })
  }
}

function postWbEvent({ item, loadEvent }: { item: IComponent, loadEvent: IEvent | null }) {
  const eventShare = item.eventShare
  const useInteraction = useInteractionStore()
  const useActivity = useActivityStore()
  const useSite = useSiteStore()

  const event = loadEvent ? loadEvent : eventShare.wbEvents[eventShare.eventIndex]
  let url: string = ''
  const controlId = event.controlId
  const params: any = { com_id: item.id, type: event.type, controlId }
  const baseControl: IBaseControl | any = getItemBaseControl(item.id, controlId)
  let isContinue = true
  switch (event.type) {
    case EVENT_HOVER_TYPES.number:
      url = numberEvent(params, baseControl)
      break
    case EVENT_HOVER_TYPES.vote:
      url = voteEvent(item, params)
      break
    case EVENT_HOVER_TYPES.push:
      //1、不需要控制全局发博 2、需要控制全局发博
      if(isHasOwnProperty(useSite.globalIsPost, 'isPush') && !useSite.globalIsPost.isPushClickMap[item.id]) {
        //不发博继续后面的事件
        url = ''
      } else {
        url = pushEvent(item, params)
      }
      break
    case EVENT_HOVER_TYPES.repost:
      url = repostEvent(item, params, baseControl)
      break
    case EVENT_HOVER_TYPES.general:
      url = generalEvent(item, event, params)
      if(!url) {
        return
      }
      break
    case EVENT_HOVER_TYPES.follow:
      url = followEvent(item, params, baseControl)
      break
    case EVENT_HOVER_TYPES.praise:
      url = POST_API_MAP.praise
      _.merge(params, { mid: (baseControl.data as IPraiseControl).mid })
      break
    case EVENT_HOVER_TYPES.lottery:
      url = POST_API_MAP.lottery
      break
    case EVENT_HOVER_TYPES.packet:
      url = POST_API_MAP.packet
      params.from = useSite.siteInfo.wbFrom
      params.aid = useSite.siteInfo.wbAid
      break
    case EVENT_HOVER_TYPES.smsVerification:
      let relateCompId = getCompIdByParam(event.comps[0].attrs.value)
      if (relateCompId) {
        eventShare.eventIndex++
        let phone = useInteraction.formValueMap[relateCompId] ? useInteraction.formValueMap[relateCompId].value : ''
        if (/^1[3-5789]\d{9}$/.test(phone)) {
          post("/sms/", { phone }, item)
          let msg = "验证码已发，请注意查看手机"
          showToast(msg)
        } else {
          resetSubmitStatus(eventShare)
          let msg = "电话号码输入不正确"
          showToast(msg)
        }
        return
      }
      break
    case EVENT_HOVER_TYPES.submit:
      //提交过表单 表单提示的时候有次数限制时提示信息
      if(item.events.activityInfo && useActivity.activityInfo.isJoin) {
        if(useActivity.activityInfo.num_form > 0 && baseControl.data.day_limit > 0) {
          item.eventShare.communicationData = { msg: "", code: 900104, data: {} }
          postShowPop({item, type: item.events.activityInfo.type})
          resetSubmitStatus(eventShare)
          return
        }
      } else {
        url = submitEvent(item, event, params)
        if(!url) isContinue = false
      }
      break
    case EVENT_HOVER_TYPES.msg:
      url = msgEvent(params, baseControl)
      break
    case EVENT_HOVER_TYPES.user:
      const userData: IUserControl = baseControl.data as IUserControl
      const customParams = userData.customParams
      //{random:true,length:5,isMember:true,pops:[3,4],"popId":8}不是会员弹层3，是会员弹层4 站点2674
      if (customParams && isJSON(customParams)) {
        const customObj = JSON.parse(customParams)
        if(customObj.isMember) {
          let popId = 0
          // 在组件间对比中做了处理
          // if(item.events.number && item.events.numberDayExists) {
          // const numberDayExistControlData = (numberDayExistBaseControlData.data as INumberDayExistControl)
          // if(numberDayExistControlData.isGlobal && !numberDayExistControlData.isNumber) { {
          //     //领取了奖品 弹出特定弹层
          //     popId = customObj.popId
          //   }
          // } else {
            const user: IUserInfo = useSite.userInfo
            if(user.mbtype > 0) {
              //会员
              popId = customObj.pops[1]
            } else {
              popId = customObj.pops[0]
            }
          // }
          if(popId > 0) {
            showPop(popId)
          }
        }
      }
      break
  }
  if (url) {
    post(url, params, item )
  } else {
    if(isContinue) {
      eventShare.eventIndex++
      isPostWbEventOrCommonEvents({ item, loadEvent: null })
    }
  }
}

async function post(url: string, params: any, item: IComponent) {
  const useSite = useSiteStore()
  const siteInfo = useSite.siteInfo
  const eventShare = item.eventShare
  const eventAttr = item.eventAttr
  const e = eventShare.e
  const type = params.type
  const controlId = params.controlId
  params.site_id = siteInfo.id

  let params_ = _.clone(params)
  delete params_.type
  delete params_.controlId
  eventShare.eventIndex++
  url = PROXY_URL + url
  let { data } = await postInteractionData(url, params_)

  let isSuccess:boolean = false
  if (data && data.code == 0) {
    isSuccess = true
  } else {
    if (data.code == "900010" && !params.ele_key) {
      nextTick(() => {
        EventBus.$emit('login')
      })
    }
  }
  let isSet = false
   //微博插件事件 提示信息
  if (eventShare.wbTypes.indexOf(params.type) != -1) {
    if (controlId == eventShare.mainControlId) {
      eventShare.communicationData = data
      eventShare.isSuccess = isSuccess
      isSet = true
      setStoreData(item, type, params, data)
      eventResultDisplay({ item, type })
    }
  }
  if(isSuccess && !isSet) {
    setStoreData(item, type, params, data)
  }
  
  if (eventShare.wbEvents[eventShare.eventIndex]) {
    //继续执行下面的微博事件
    //抽奖失败就不能在减计数了，表单提交也不能执行
    if(isSuccess) {
      postWbEvent({ item, loadEvent: null })
    } else {
      if(eventAttr.isBreak) {
        onFrontEvents( { item })
      } else {
        if(eventShare.wbEvents[eventShare.eventIndex]) {
          postWbEvent({ item, loadEvent: null })
        } else {
          onFrontEvents( { item })
        }
      }
    }
  } else {
    onFrontEvents( { item })
    //触发页面加载事件 1911 每日签到
    if(eventAttr && isHasOwnProperty(eventAttr, "isEmitLoadEvent") && eventAttr.isEmitLoadEvent) {
      EventBus.$emit("reloadLoadEvent", { pageIndex: eventShare.pageId - 1, popIndex: eventShare.popId - 1 })
    }
    if(eventAttr && isHasOwnProperty(eventAttr, "isEmitInitEvent") && eventAttr.isEmitInitEvent && (!isHasOwnProperty(item.eventShare, "isEmitInitEvent") || item.eventShare.isEmitInitEvent)) {
      item.eventShare.isEmitInitEvent = false
      EventBus.$emit("reloadInitEvent", { pageIndex: eventShare.pageId - 1, popIndex: eventShare.popId - 1 })
      //如果是弹层，属性刷新页面的接口数据，刷新页面
      if(eventShare.popId > 0) {
        EventBus.$emit("reloadInitEvent", { pageIndex: useSite.pageIndex, popIndex: -1 })
      }
    }
  }

  //{comType, comId, pageIndex, apiType, apiUri, params, jumpUrl, clickSequence, mouseX, mouseY, debug}
  if(e){
    let interfaceType = url.split("/")[2]
    let wbPreArr = interfaceType && interfaceType.split("_")
    let wModule = wbPreArr ? wbPreArr[wbPreArr.length - 1] : ''
    let xy = getMousePos(e)
    delete params_.text
    postStatics({
      comType: 'post', comId: item.id, wModule, pageIndex: _.toString(useSite.pageIndex), apiType: url.split("/")[1],
      apiUri: API_VERSION + url, params: params_, jumpUrl: "", clickSequence: "", mouseX: xy.x, mouseY: xy.y
    })
  }
}

function setStoreData(item: IComponent, type: string, params: any, data: any) {
  const useSite = useSiteStore()
  const useControls = useControlsStore()
  const useActivity = useActivityStore()

  const controlId = params.controlId
  switch (type) {
    case EVENT_HOVER_TYPES.number:
      useControls.updateNumber({ id: params.com_id, controlId, data: data.data })
      break
    case EVENT_HOVER_TYPES.vote:
      useControls.updateVote({ id: params.com_id, controlId, data: data.data })
      break
    case EVENT_HOVER_TYPES.general:
      if(params.ele_key == GENERAL_TYPES_MAP.tree) {
        useControls.updateGeneral({ id: params.com_id, controlId, data: _.merge({ isJoin: true }, data.data) })
      } else if (params.ele_key == GENERAL_TYPES_MAP.randbm) {
        useControls.updateGeneral({ id: params.com_id, controlId, data: data.data })
      } else if(params.ele_key == GENERAL_TYPES_MAP.info){
        useControls.updateInfo({ id: params.com_id, controlId, data: data.data })
      }else {
        useControls.updateGeneral({ id: params.com_id, controlId, data: data.data })
      }
      break
    case EVENT_HOVER_TYPES.praise:
      useControls.updateRepostsPraise({ id: params.com_id, controlId, mid: params.mid })
      break
    case EVENT_HOVER_TYPES.follow:
      useControls.updateRepostsFollow({ id: params.com_id, controlId, mid: params.mid })
      let compData = useSite.componentMap[params.com_id]
      if(compData.cid == COMPONENT_TYPES.wb_btn) {
        let isNumber = !data.data
        EventBus.$emit("refreshNumberDayExists", { compId: compData.id, isNumber })
      }
      break
  }
}



export {
  postWbEvent,
  isPostWbEventOrCommonEvents,
  post
}