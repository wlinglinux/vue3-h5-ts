import { useInteractionStore } from '@/store/interaction'
import { useControlsStore } from '@/store/controls'
import { useSiteStore } from '@/store/site'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { EventBus, getCompIdByParam, getQueryString, isJSON, isWeibo, isHasOwnProperty } from '@/utils/'
import { dealStatisticData } from '@/store/utils/activity-data-utils'
import { postInitData, INIT_API_MAP} from '@/service/api'
import { getActivityInfoTimeBaseControl } from '@/store/utils/activity-utils'
import { CONTROL_TYPES, GENERAL_ACTIVITY_TYPES_MAP, COMPONENT_TYPES } from '@/const/'
export class ActivityInfo implements IActivityInfoControl {
  public isHave: boolean = false
  public isJoin: boolean = false
  public isLoad: boolean = false

  public activityType: string = ''             // 活动类型  
  public compId: string = ''
  public jumpPopId: number = -1                 // 跳转弹层
  public jumpPageId: number = -1               // 跳转页面
  public relateCompId: string = ''              // 获取活动信息需要的关联组件id

  public num_form: number = 0                  // 表单次数限制
  public params: string = ''                   // 自定义信息
}

function changePageOrPopId(activityInfo: IActivityInfoControl, attrs: ISiteAttrs) {
  if (activityInfo.isLoad && activityInfo.isHave && activityInfo.isJoin) {
    if (activityInfo.jumpPopId) {
      attrs.popId = activityInfo.jumpPopId
    }
    if (activityInfo.jumpPageId) {
      attrs.pageId = activityInfo.jumpPageId
    }
  }
}

export const useActivityStore = defineStore('activity', {
  state: () => {
    return {
      activityInfo: new ActivityInfo()
    }
  },
  getters: {
  },
  actions: {
    async setActivityData(activityInfo_: IActivityInfoControl, siteData: ISiteData) {
      _.merge(this.activityInfo, activityInfo_)
      const useSite = useSiteStore()
      const useControls = useControlsStore()
      const useInteraction = useInteractionStore()
      // 获取活动信息参数
      let { activityBaseControl, timeBaseControl } = getActivityInfoTimeBaseControl()

      if (timeBaseControl) {
        const serverTimeData = await postInitData('/feinit/timer', { site_id: useSite.siteInfo.id, com_id: timeBaseControl.compId })
        let time = new Date().toLocaleDateString()
        if (serverTimeData.data.data.end) {
          time = serverTimeData.data.data.end
        }
        useSite.timeObj.timerTime = (useControls.controls[timeBaseControl.compId][CONTROL_TYPES.wb_timer].data as ITimerControl).time = time
        useSite.timeObj.serverTime = serverTimeData.data.data.current
      }
      const activityControlData: IActivityInfoControl = activityBaseControl && activityBaseControl.data as IActivityInfoControl
      if (activityControlData) {
        _.merge(this.activityInfo, activityControlData)
        const activityInfo: IActivityInfoControl = this.activityInfo
        const compId = activityInfo.compId
        let url = ''
        const activityType = activityControlData.activityType
        const params: any = { site_id: useSite.siteInfo.id, com_id: compId, ele_key: activityType }
        const relateCompId = getCompIdByParam(activityInfo.relateCompId)
        if (relateCompId) {
          params.com_id = relateCompId
        }
        params.ele_key = activityType

        if (activityType == GENERAL_ACTIVITY_TYPES_MAP.scoreForm) {
          ///feinit/formlatest?site_id=1580&com_id=6&uid=  表单获取自己最新的一条数据, 增加uid参数, 不加uid就是获取自己的
          url = INIT_API_MAP.formlatest
          const uid = getQueryString("uid")
          if (uid && uid.length > 0) {
            params.uid = uid
          }
        } else if (activityType == GENERAL_ACTIVITY_TYPES_MAP.lotteryForm) {
          url = INIT_API_MAP.lotteryLuckyform
        } else if (activityType == GENERAL_ACTIVITY_TYPES_MAP.baoming) {
          url = INIT_API_MAP.general
        } else if (activityType == GENERAL_ACTIVITY_TYPES_MAP.info) {
          url = INIT_API_MAP.general
        } else {
          url = INIT_API_MAP.general
        }

        const postActivityInfoData = await postInitData(url, params)

        if (activityType == GENERAL_ACTIVITY_TYPES_MAP.lotteryForm) {
          // {luck:[],luck_list:[],num_form:0,num_luck:0,coupon_list=>[ICouponListItem,ICouponListItem]  //中奖的券码}
          // 抽奖 / 表单提交： 是否中奖 / 是否提交表单；跳转页面 636 新年求稳签
          // 获取活动信息需要的关联组件id
          const formLottery: IFormLottery = postActivityInfoData && postActivityInfoData.data && postActivityInfoData.data.data
          const bIsFormed = formLottery && !isNaN(_.parseInt(formLottery.num_form)) && _.parseInt(formLottery.num_form) > 0
          const bIsLucked = formLottery && !isNaN(_.parseInt(formLottery.num_luck)) && _.parseInt(formLottery.num_luck) > 0
          // activityInfo.isLoad = true // bIsLucked = true
          //如果是load那么页面一进来就弹出表单填写信息页面，否则就是在按钮触发的时候弹出表单页面
          if (activityInfo.isLoad) {
            if (bIsLucked) { // 是否中奖
              if (bIsFormed) {// 是否提交表单
                // commit('updatePageIndex', 0)
              } else {
                if (activityInfo.jumpPopId) {
                  useSite.attrs.popId = activityInfo.jumpPopId
                }
                if (activityInfo.jumpPageId) {
                  useSite.attrs.pageId = activityInfo.jumpPageId
                }
              }
            }
          }
          if (formLottery.coupon_list && formLottery.coupon_list[0]) {
            useInteraction.updateBindData({ key: 'couponCode', value: (formLottery.coupon_list[0] as ICouponListItem).sn })
          }
          changePageOrPopId(activityInfo, useSite.attrs)
          useSite.setPageData(siteData)
          this.updateActivityInfo({data: formLottery})
          if(!activityInfo.isLoad) {
            useControls.updateLotteryForm({id: compId, controlId: activityBaseControl.controlId, data: {isPopup: bIsLucked && !bIsFormed}})
          }
        } else if (activityType == GENERAL_ACTIVITY_TYPES_MAP.scoreForm) {
          //{自己的uid:{},url传的uid:{}}
          //character: "ISFP-峡谷梦旅人"level: "星耀"platform: "安卓"purpose: "CPDD"sex: "女"skills: "射手"
          const userDatas = postActivityInfoData.data.data
          const uid = getQueryString("uid")
          const uidKey = uid ? uid : siteData.uid
          const userData: IFormWangZhe = userDatas[uidKey]
          const selfUserData = userDatas[siteData.uid]
          const relateCompId = getCompIdByParam(activityInfo.relateCompId)

          if (postActivityInfoData.data.code == 0) {
            if (!_.isArray(selfUserData)) {
              activityInfo.isJoin = true
            } else {
              activityInfo.isJoin = false
            }
          } else {
            activityInfo.isJoin = false
          }
          let iconUrls: any
          if (activityInfo.params && isJSON(activityInfo.params)) {
            const activityInfoParams = JSON.parse(activityInfo.params)
            iconUrls = activityInfoParams.sexIconUrl.split(',')
            useInteraction.updateBindData({ key: 'sexIconUrls', value: iconUrls })
          }
          if (!_.isArray(userData) && userData && siteData.uid) {
            if (userData.sex == "男") {
              userData.sexIconUrl = iconUrls[0]
            } else {
              userData.sexIconUrl = iconUrls[1]
            }
          }
          // changePageOrPopId(activityInfo, siteData.attrs)
          //{"uid":{"pageId":1,"jumpPageId":3}}
          if (activityInfo.params && isJSON(activityInfo.params) && siteData.uid) {
            const activityInfoParams = JSON.parse(activityInfo.params)
            if (isHasOwnProperty(activityInfoParams, 'uid')) {
              const jumpObj = activityInfoParams.uid
              const uidUserData = userDatas[uid]
              const selfUserData = userDatas[siteData.uid]
              // url 上带 uid 
              if (uid) {
                //有uid 被 标记 看用户自身是否参加过活动与是否被标记
                if (uidUserData.del == -1) {
                  if (_.isArray(selfUserData)) {
                    //没有参与过的用户
                    //默认页面 不做跳转 首页 点击按钮跳转填写表单页面
                  } else {
                    //跳转 首页 点击按钮跳转列表页 新增一个首页 只跳转列表页
                    siteData.attrs.pageId = jumpObj.markedJumpPageId
                  }
                } else {
                  if (_.isArray(selfUserData)) {
                    //没有参与过的用户 跳转漂流瓶页面 跳转 表单填写页面
                    if (jumpObj.pageId) {
                      siteData.attrs.pageId = jumpObj.pageId
                    }
                  } else {
                    //跳转漂流瓶页面 跳转 列表页 
                    if (jumpObj.jumpPageId) {
                      siteData.attrs.pageId = jumpObj.jumpPageId
                    }
                  }
                }
              } else {
                if (_.isArray(selfUserData)) {
                  //没有参与过的用户
                  //默认页面 不做跳转 首页 点击按钮跳转填写表单页面
                } else {
                  //直接跳转列表页 
                  siteData.attrs.pageId = activityInfo.jumpPageId
                }
              }
            }
          }
          
          useSite.setPageData(siteData)
          _.merge(activityInfo, userData)
          this.updateActivityInfo({ id: compId, controlId: activityBaseControl.controlId, data: activityInfo })
          if (postActivityInfoData.data.code == 0) {
            useInteraction.updateFormValueMap({ id: relateCompId || compId, scoreData: userData })
          }
        } else if (activityType == GENERAL_ACTIVITY_TYPES_MAP.tree || activityType == GENERAL_ACTIVITY_TYPES_MAP.randbm) {
          //参与后 跳转页面  activityInfo 里有 jumpPageId信息
          const postActivityInfoData_: IGeneralControl = postActivityInfoData.data.data
          if (postActivityInfoData_.hasOwnProperty("isattend")) {
            activityInfo.isJoin = postActivityInfoData_.isattend
          } else {
            activityInfo.isJoin = false
          }
          _.merge(activityInfo, postActivityInfoData_)
          changePageOrPopId(activityInfo, siteData.attrs)
          this.updateActivityInfo({ data: activityInfo })
          useSite.setPageData(siteData)
        } else if (activityType == GENERAL_ACTIVITY_TYPES_MAP.baoming) {
          const postActivityInfoData_: IGeneralControl = postActivityInfoData.data.data
          const pageId = postActivityInfoData_.ext_1 && _.parseInt(postActivityInfoData_.ext_1)
          if (pageId > 0) {
            activityInfo.isJoin = true
            siteData.attrs.pageId = pageId
          } else {
            activityInfo.isJoin = false
          }
          _.merge(activityInfo, postActivityInfoData_)
          changePageOrPopId(activityInfo, siteData.attrs)
          this.updateActivityInfo({ data: activityInfo })
          useSite.setPageData(siteData)
        } else if(activityType == GENERAL_ACTIVITY_TYPES_MAP.info) {
          const postActivityInfoData_: IGeneralControl = postActivityInfoData.data.data
          if (activityInfo.params && isJSON(activityInfo.params)) {
            const activityInfoParams = JSON.parse(activityInfo.params)
            if (isHasOwnProperty(activityInfoParams, 'ids')) {
              let isJoin =  postActivityInfoData_.ext_2 ? true : false
              activityInfo.isJoin = isJoin
              let ids = activityInfoParams.ids
              _.forEach(ids, (value,key) => {
                let component = useSite.componentMap[key]
                let componentIsJoin = useSite.componentMap[value]
                if(component.cid == COMPONENT_TYPES.wb_img){ // 图片是否显示主要是感觉是否有参与过英雄
                  component.commonAttr.isVisible = isJoin ? false : true
                }
                if(component.cid == COMPONENT_TYPES.wb_is_post_event){
                  component.commonAttr.isVisible = isJoin ? false : true
                }
                if(component.cid == COMPONENT_TYPES.wb_common_list){
                  if(isJoin){
                    let lists = componentIsJoin.interactionData.lists
                    let resultList: any = []
                    let ext_2 = postActivityInfoData_.ext_2
                    _.forEach(lists, element => {
                      if(ext_2.indexOf(element.text) > -1){
                        if(element.params) _.merge(element,JSON.parse(element.params))
                        resultList.push(element)
                      }
                    });
                    component.lists =  resultList
                  }
                }
              });
            }
          }
          
          _.merge(activityInfo, postActivityInfoData_)
          changePageOrPopId(activityInfo, siteData.attrs)
          this.updateActivityInfo({ data: activityInfo })
          useSite.setPageData(siteData)
        }
      }
    },
    updateActivityInfo({ id, controlId, data }: { id?: string, controlId?: string, data: any }) {
      const useControls = useControlsStore()
      const useInteraction = useInteractionStore()

      if (id && controlId) {
        const controlData: IActivityInfoControl = useControls.controls[id][controlId].data as IActivityInfoControl
        controlData.isJoin = data.isJoin
        _.merge(this.activityInfo, controlData)
        _.merge(this.activityInfo, data)
        _.merge(controlData, data)
      } else {
        _.merge(this.activityInfo, data)
      }
      //通用计数 参加活动的用户 排名 isattend rank total
      // data = { rank: 3, total: 5000 } 1743
      if (data && (data.rank || data.total)) {
        useInteraction.bindData.generalRank = data.rank
        useInteraction.bindData.generalTotal = data.total
      }
      EventBus.$emit("refreshDynamicData")
    },
    setStatisticData({ id, controlId, data }: { id: string, controlId: string, data: any }) {
      //IStatisticDataControl
      const useSite = useSiteStore()
      const useControls = useControlsStore()
      const useInteraction = useInteractionStore()

      _.merge(useControls.controls[id][controlId].data, data)
      useInteraction.statisticData = useControls.controls[id][controlId].data
      dealStatisticData(useSite.allPages)
      EventBus.$emit("refreshStatisticDataText")
    }
  },

})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useActivityStore, import.meta.hot))
}
