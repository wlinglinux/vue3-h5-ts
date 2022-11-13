import { useActivityStore } from './activity';
import { defineStore, acceptHMRUpdate } from 'pinia'
import { useSiteStore } from '@/store/site'
import { useInteractionStore } from '@/store/interaction'
import { EventBus, getCompIdByParam, isHasOwnProperty,isJSON } from '@/utils/'
import { CONTROL_TYPES, COMPONENT_TYPES, EVENTS_RESULTS_TYPES_MAP } from '@/const/'


const intervalFuncCb = {}
function initNumberDataProcess(numberData: INumberControl, compId: string) {
  const useSite = useSiteStore()
  const componentMap = useSite.componentMap, siteInfo = useSite.siteInfo
  const compData: IComponent = componentMap[compId]
  if(isHasOwnProperty(compData.interactionData, 'pk')) {
    let intervalFuncCbKey = intervalFuncCb["oppositNnumberCb-" + compId]
    if(!intervalFuncCbKey) {
      intervalFuncCbKey = window.setInterval(() => {
        if(siteInfo.isLoading) {
          // 通讯中
        } else {
          changeNumberProcess(numberData, compData.interactionData.pk, true)
          EventBus.$emit("refreshDynamicData")
          window.clearInterval(intervalFuncCbKey)
        }
      }, siteInfo.reloadTime)
    }
  }
  numberData.num = numberData.num
}
function changeNumberProcess(numberData: INumberControl, pkInteraction: IPK, isOpposite: boolean) {
  const useSite = useSiteStore()
  const componentMap = useSite.componentMap
  const useControls = useControlsStore()
  let percent: number = 0
  const oppositeNumberCompId: string = pkInteraction.oppositeNumberCompId//oppositeNumberCompId
  const oppositeNumberWbData: INumberControl = useControls.controls[oppositeNumberCompId][CONTROL_TYPES.wb_number].data as INumberControl
  let total: number = numberData.num + oppositeNumberWbData.num
  if(total == 0) {
    percent = 0
  } else {
    percent = Math.round(numberData.num/total * 100)
  }
  numberData.process = percent

  if(isOpposite) {
    let oppositeCompData: IComponent = componentMap[oppositeNumberCompId]
    if(isHasOwnProperty(oppositeCompData.interactionData, 'pk')) {
      changeNumberProcess(oppositeNumberWbData, oppositeCompData.interactionData.pk, false)
    }
  }
}
function computeVoteTotal(elements: IVoteMap): number{
  let total: number = 0
  _.forEach(elements, (item: IVoteMapItem) => {
    total += item.num
  })
  return total
}

//投票排序
function sortReposts(controlMap: IControlMap, componentData: IComponent) {
  if(!controlMap[CONTROL_TYPES.wb_vote] || !componentData){
    return
  }
  const controlId = controlMap[CONTROL_TYPES.wb_reposts] ? CONTROL_TYPES.wb_reposts :  CONTROL_TYPES.wb_user
  let lists: ISortItem[] = []
  if(controlMap[controlId]){
    lists = (controlMap[controlId].data as IBaseListControl).elements
  } else if(componentData.lists && componentData.lists.length > 0){
    lists = componentData.lists
  }

  const voteMap: IVoteMap = (controlMap[CONTROL_TYPES.wb_vote].data as IVoteControl).elements
  let isAddReposts = false
  if(controlMap[CONTROL_TYPES.wb_reposts]) {
    const repostControl = controlMap[CONTROL_TYPES.wb_reposts].data as IRepostsControl
    isAddReposts = repostControl.isAddReposts
  }
  
  let vote_coefficient: number = _.parseInt((controlMap[CONTROL_TYPES.wb_vote].data as IVoteControl).vote_coefficient)
  if(!vote_coefficient) {
    vote_coefficient = 1
  }
  //ISortItem
  _.forEach(lists, (item: any) => {
    const sortItem = item as ISortItem
    const key: string | number | undefined = sortItem.mid || sortItem.uid || sortItem.voteId
    if(key) {
      let num: number = voteMap[key] && voteMap[key].num
      if(num === undefined) {
        num = 0
      }
      item.num = num * vote_coefficient
      if(item.mid) {
        const repostItem: IRepostsItem = item as IRepostsItem
        const reposts_count: number = repostItem.reposts_count
        const comments_count: number = repostItem.comments_count
        const attitudes_count: number = repostItem.attitudes_count
        if(isAddReposts){
          item.num = (reposts_count + comments_count + attitudes_count + num) * vote_coefficient
        }
      }
    }
  })
  if(componentData.commonAttr.isSort) {
    const listsSort = _.sortBy(lists, (item: ISortItem) => { return -item.num})
    while(lists.length > 0){
      lists.pop()
    }
    _.forEach(listsSort, (item: ISortItem,index: number) => {
      // 更新投票后重新排序之后的索引值
      if(item.voteId == componentData.commonAttr.pushIndex + 1){
        componentData.commonAttr.itemIndex = index 
      }
      lists.push(item)
    })
  }
}

export const useControlsStore = defineStore('controls', {
  state: (): IControls => {
    return {
      controls: {},               //后端接口相关的数据，键值是组件id IControlsMap
    }
  },
  getters: {
    // otherGetter(state) {
    //   const otherStore = useOtherStore()
    //   return state.localData + otherStore.data
    // },
  },
  actions: {
    setInitFriends({id, controlId, data}){
      try {
        //rankType
        let elements = (this.controls[id][controlId].data as IUserControl).elements
        while(elements.length > 0){
          elements.pop()
        }
        _.forEach(data, (user: IUserInfo) => {
          elements.push(user)
        })
        EventBus.$emit("refreshFriends", { id })
        EventBus.$emit("refreshDynamicData")
      } catch (error) {
        console.log(error)
      }
    },
    setInitReposts({id, controlId, data}: {id: string, controlId: string, data: any[]}) {
      const useSite = useSiteStore()
      try{
        //init的接口是并行的，vote接口后发先到，这里是处理这种情况的
        let data_ = {}
        _.forEach(data, (item: IRepostsItem) => {
          data_[item.mid] = item
        })
        let elements = (this.controls[id][controlId].data as IRepostsControl).elements
        _.forEach(elements, (elementItem: IRepostsItem) => {
          let searchItem = data_[elementItem.mid]
          _.merge(elementItem, searchItem)
        })
  
        const componentData: IComponent = useSite.componentMap[id]
        const controlMap: IControlMap = this.controls[id]
        sortReposts(controlMap, componentData)
        EventBus.$emit("refreshDynamicData")
      } catch (error) {
        console.log(error)
      }
    },
    setInitUserList({id, controlId, data}: {id: string, controlId: string, data: IUserControl}) {
      try { 
        if(!data){
          return
        }
        const userControlData = this.controls[id][controlId].data as IUserControl
        let elements = userControlData.elements
        if(data.users && _.isArray(data.users)) {
          userControlData.oriElements = data.users
          let elements_ = {}
          _.forEach(elements, (item: IUserInfo) => {
            elements_[item.uid] = item
          })
          _.forEach(data.users, (user: IUserInfo, index: number) => {
            if(elements[index]) {
              if(elements_[user.id]) {
                elements[index] = elements_[user.id]
                _.merge(elements[index], user)
              } else {
                elements[index] = user
              }
            } else { 
              elements.push(user)
            }
          })
        } else {
          if(elements[0]) {
            for(let key in data) {
              elements[0][key] = data[key]
            }
          }
        }
        const useSite = useSiteStore()
        let componentData = useSite.componentMap[id]
        sortReposts(this.controls[id], componentData)
        EventBus.$emit("refreshDynamicData")
        EventBus.$emit("refreshFriends", { id })
      } catch (error) {
        console.log(error)
      }
    },
    setInitVote({id, controlId, data}: {id: string, controlId: string, data: IVoteMap | any}) {
      const useSite = useSiteStore()
      const useInteraction = useInteractionStore()
      try {
        const controlData: IVoteControl = this.controls[id][controlId].data as IVoteControl
        if(data.list) {
          _.merge(controlData.elements, data.list)
        } else {
          _.merge(controlData.elements, data)
        }
        if(isHasOwnProperty(data, 'remain')) {
          useInteraction.bindData.remain = data.remain
        }
        let total = computeVoteTotal(controlData.elements)
        let vote_coefficient: number = _.parseInt(controlData.vote_coefficient)
        if(!vote_coefficient) {
          vote_coefficient = 1
        }
        useInteraction.bindData.total = total * vote_coefficient
        sortReposts(this.controls[id], useSite.componentMap[id])
        EventBus.$emit("refreshDynamicData")
      } catch(error) {
        console.log(error)
      }
    },
    setInitNumberDayExists({id, controlId, data}) {
      try {
        const numberControlData: INumberControl = this.controls[id][CONTROL_TYPES.wb_number].data as INumberControl
        const numberDayExistControlData: INumberDayExistControl = this.controls[id][controlId].data as INumberDayExistControl
        //全局计数
        if(numberDayExistControlData.isGlobal && _.isBoolean(data)) {
          numberDayExistControlData.isNumber = data ? false : true
        } else {
          numberDayExistControlData.isNumber = _.parseInt(data)!= 0 && _.parseInt(data) >= _.parseInt(numberControlData.day_limit) ? false : true
          numberControlData.dayNum = data
        }
        EventBus.$emit("refreshNumberDayExists", { compId: getCompIdByParam(numberDayExistControlData.relateCompId), isNumber: numberDayExistControlData.isNumber})
      } catch(error) {
        console.log(error)
      }
    },
    setInitNumber({id, controlId, data}: {id: string, controlId: string, data: INumberControl}) {
      try {
        _.merge(this.controls[id][controlId].data, data)
        initNumberDataProcess(this.controls[id][controlId].data as INumberControl, id)
        EventBus.$emit("refreshDynamicData")
      } catch(error) {
        console.log(error)
      }
    },
    updateNumber({id, controlId, data}: {id: string, controlId: string, data: INumberControl}) {
      try {
        if(_.isArray(data)) {
          return
        }
        if(data.num >= 0) {
          const numberControl: INumberControl = this.controls[id][controlId].data as INumberControl
          _.merge(numberControl, data)
          initNumberDataProcess(numberControl as INumberControl, id)
          //前端实时改变按钮状态
          if(isHasOwnProperty(numberControl, 'dayNum')) {
            numberControl.dayNum++
          }
        }
        if(data.syn_com_id_datas && !_.isArray(data.syn_com_id_datas)) {
          let syn_com_id_str = data.syn_com_id
          if(syn_com_id_str && syn_com_id_str.length > 0){
            const syn_com_id = getCompIdByParam(syn_com_id_str)
            if(syn_com_id) {
              let syn_com_id_data: INumberControl = this.controls[syn_com_id][controlId].data as INumberControl
              syn_com_id_data.num = data.syn_com_id_datas.num
            }
          }
        }
        EventBus.$emit("refreshDynamicData")
      } catch (error) {
        console.log(error)
      }
    },
    updateVote({id, controlId, data}: {id: string, controlId: string, data: IVoteMap | any}) {
      const useSite = useSiteStore()
      const useInteraction = useInteractionStore()
      try {
        // const syn_vote_id_datas = data.syn_vote_id_datas;
        const remain = data.remain
        delete data.syn_vote_id_datas
        delete data.remain

        const controlData: IVoteControl = this.controls[id][controlId].data as IVoteControl
        _.merge(controlData.elements, data)
        const elements = controlData.elements
  
        let total = computeVoteTotal(elements);
        let vote_coefficient = _.parseInt(controlData.vote_coefficient)
        if(!vote_coefficient) {
          vote_coefficient = 1;
        }
        useInteraction.bindData.total = total * vote_coefficient
  
        if(remain >= 0){
          useInteraction.bindData.remain = remain
        }
  
        const componentData = useSite.componentMap[id]
        sortReposts(this.controls[id], componentData)
        // if(syn_vote_id_datas && !_.isArray(syn_vote_id_datas)) {
        //   let syn_com_id = controlData.syn_com_id
        //   if(syn_com_id && syn_com_id.length > 0){
        //     let arr = syn_com_id.split("$")
        //     if(arr.length > 1){
        //       syn_com_id = arr[1]
        //       let syn_com_id_datas = this.controls[syn_com_id][controlId].data.elements
        //       _.forEach(syn_vote_id_datas, (itemData, mid: string) => {
        //         _.merge(syn_com_id_datas[mid], itemData)
        //       })
        //     }
        //   }
        // }
        EventBus.$emit("refreshDynamicData")
      } catch (error) {
        console.log(error)
      }
    },
    updateGeneral({id, controlId, data}: { id: string, controlId: string, data: IGeneralControl | any }) {
      const useInteraction = useInteractionStore()
      const useActivity = useActivityStore()
      if(id) {
        const controlData: IGeneralControl = this.controls[id][controlId].data as IGeneralControl
        if(isHasOwnProperty(data,  'isJoin')) {
          controlData.isJoin = data.isJoin
        }
        _.merge(useActivity.activityInfo, controlData)
      } else {
        _.merge(useActivity.activityInfo, data)
      }
      //通用计数 参加活动的用户 排名 isattend rank total
      // data = { rank: 3, total: 5000 }; 1743
      if(data.rank || data.total) {
        useInteraction.bindData.generalRank = data.rank
        useInteraction.bindData.generalTotal = data.total
        EventBus.$emit("refreshDynamicData")
      }
    },
    updateInfo({id, controlId, data}: { id: string, controlId: string, data: IGeneralControl | any }){
      const useActivity = useActivityStore()
      const useSite = useSiteStore()
      const activityInfo = useActivity.activityInfo
      activityInfo.isJoin = true
      if (activityInfo.params && isJSON(activityInfo.params)) {
        const activityInfoParams = JSON.parse(activityInfo.params)
        if (isHasOwnProperty(activityInfoParams, 'ids')) {
          let isJoin = true
          let ids = activityInfoParams.ids
          // 重新更新页面的显示和隐藏
          _.forEach(ids, (value,key) => {
            let component = useSite.componentMap[key]
            let componentIsJoin = useSite.componentMap[value]
            if(component.cid == COMPONENT_TYPES.wb_img){ // 图片是否显示主要是感觉是否有参与过英雄
              component.commonAttr.isVisible = isJoin ? false : true
              componentIsJoin.commonAttr.isVisible = isJoin ? true : false
            }
            if(component.cid == COMPONENT_TYPES.wb_is_post_event){
              component.commonAttr.isVisible = isJoin ? false : true
              componentIsJoin.commonAttr.isVisible = isJoin ? true : false
            }
          });
        }
      }
    },
    updateRepostsPraise({id, controlId, mid}: { id: string, controlId: string, mid: string }) {
      try {
        let elements = (this.controls[id][controlId].data as IRepostsControl).elements
        let item: IRepostsItem
        for(let i = 0, len = elements.length; i < len; i++){
          item = elements[i]
          if(item.mid == mid) {
            item.attitudes_count += 1
            break
          }
        }
      } catch(error) {
        console.log(error)
      }
    },
    updateRepostsFollow({id, controlId, mid}: { id: string, controlId: string, mid: string }) {
      try {
        if(!this.controls[id]) {
          return
        }
        let elements = (this.controls[id][controlId].data as IRepostsControl).elements
        if(elements){
          let item: IRepostsItem
          for(let i = 0, len = elements.length; i < len; i++){
            item = elements[i]
            if(item.mid == mid) {
              item.user.followers_count += 1
              break
            }
          }
        }
      } catch (error) {
        console.log(error)
      }
    },
    updateDraw({id, controlId, data}: { id: string, controlId: string, data: any }) {
      const useInteraction = useInteractionStore()
      const useSite = useSiteStore()
      //1383纯甄卡片抽奖
      const generalControl = this.controls[id][controlId].data as IGeneralControl
      //1383纯甄卡片抽奖
      let cardMap = null
      if(!_.isArray(data) && data.ext_1) {
        delete data.ext_1.NaN
        // data.ext_1 = {1: 5, 2: 5, 3: 5, 4: 5, 5: 5};
        cardMap = data.ext_1
        _.merge(generalControl, data)
        useInteraction.shareInteractionData.card = cardMap
      } else {
        // {"card":{"1":0,"2":0,"3":0,"4":0,"5":0},"btnCompId":"cf6dde53-308c-4b3d-8d83-0a9fa6e412f5"}
        cardMap = useInteraction.shareInteractionData.card
      }
      EventBus.$emit('refreshDraw')

      const compData = useSite.componentMap[id]
      const btnCompId = compData.interactionData.btnCompId
      if(btnCompId) {
        let btnCompData = useSite.componentMap[btnCompId]
        let count = 0
        _.forEach(cardMap, (value: number) => {
          if(value > 0){
            count++
          }
        })
        const commonAttr:any = { filter: { isGrayscale: 0, grayscale: 5 } }
        let isGrey = true
        if(count < _.size(cardMap)){
          commonAttr.filter.isGrayscale = true
          isGrey = true
        }else{
          commonAttr.filter.isGrayscale = false
          isGrey = false
        }
        _.merge(btnCompData.commonAttr, commonAttr)
        if(btnCompData.cid == COMPONENT_TYPES.wb_img) {
          useSite.updateComponentAttr({ id: btnCompId, commonAttr })
          // EventBus.$emit('refreshImgStyles', { id: btnCompId })
        } else {
          EventBus.$emit('btnStatus', { isGrey, compId: btnCompId })
        }
      }
    },
    updatePuzzle({id, controlId, data}: { id: string, controlId: string, data: any }) {
      const useInteraction = useInteractionStore()
      const useSite = useSiteStore()

      //1882 1229非人哉
      if(!_.isArray(data) && data.ext_1) {
        let puzzleStr = data.ext_1
        _.merge(this.controls[id][controlId].data, data)
        useInteraction.shareInteractionData.puzzle = puzzleStr.split(',')
      }
      let componentData = useSite.componentMap[id]
      if(componentData.interactionData && isHasOwnProperty(componentData.interactionData, 'puzzle')) {
        let puzzle = useInteraction.shareInteractionData.puzzle
        let matchLength = componentData.interactionData.matchLength
        let team_one = _.dropRight(puzzle, matchLength)
        let team_two = _.drop(puzzle, matchLength)
  
        let one = 0
        let oneCount = 0
        let two = 0
        let twoCount = 0
        for(let i = 0, len = team_one.length; i < len; i++) {
          one = parseInt(team_one[i])
          two = parseInt(team_two[i])
          if(one == 1) {
            oneCount++
          }
          if(two == 1) {
            twoCount++
          }
        }
        let count = _.min([oneCount, twoCount])
        useInteraction.bindData.puzzle = count
        componentData.commonAttr.itemIndex = count - 1 < 0 ? 0 : count - 1
      }
      EventBus.$emit('refreshPuzzle')
    },
    updateLotteryForm({id, controlId, data}: {id: string, controlId: string, data: any}) {
      const useControls = useControlsStore()
      try {
        _.merge(useControls.controls[id][controlId].data, data)
      } catch (error) {
        console.log(error)
    }
    },
    updateFormrandlist({ id, controlId, formList }) {
      const bindData = useInteractionStore().bindData

      for(let i = 0, len = formList.length; i < len; i++) {
        let item: IFormWangZhe = formList[i]
        if(isHasOwnProperty(item, 'sex') && bindData.sexIconUrls) {
          if(item.sex == "男") {
            item.sexIconUrl = bindData.sexIconUrls[0]
          } else {
            item.sexIconUrl = bindData.sexIconUrls[1]
          }
        }
      }
      (this.controls[id][controlId].data as IJudgeRightWrongControl).elements = formList
      EventBus.$emit("refreshDynamicData")
    },
    updateList({ id, controlId, data }) { // {list:[],mine:[],curr_period:4}
      const useInteraction = useInteractionStore()
      const useSite = useSiteStore()
      let {list, mine, curr_period } = data
      useInteraction.updateShareData({list, mine, currPeriod: curr_period })
      let comp = useSite.componentMap[id]
      let relateEventCompId = getCompIdByParam(comp.commonAttr.relateEventCompId)
      if(relateEventCompId){
        EventBus.$emit('itemClick',{id: relateEventCompId })
      }
    },
    updateWZTime({ id, controlId, data }){
      const useInteraction = useInteractionStore()
      if(isHasOwnProperty(data, 'times')){
        useInteraction.bindData.times = data.times || 0
      }
      EventBus.$emit("refreshDynamicData")
    },
    updateInitInfo({item, data}){
      const useSite = useSiteStore()
      let obj = item.interactionData 
      if(obj){
        let relateCompId =  obj.relateCompId
        let listCompId = obj.listComp
        let relateComp = useSite.componentMap[relateCompId]
        let listComp = useSite.componentMap[listCompId]
        if(listComp && relateComp){
          let lists = relateComp.interactionData.lists
          let resultList: any = []
          let ext_2 = data.ext_2
          _.forEach(lists, element => {
            if(ext_2.indexOf(element.text) > -1){
              if(element.params) _.merge(element,JSON.parse(element.params))
              resultList.push(element)
            }
          });
          listComp.lists =  resultList
        }
      }
    },
    updateArea({ data, id, controlId}) {
      const useSite = useSiteStore()
      this.updateArea_({ data, id, controlId})
      if(!data.data.area_code || !data.data.area[data.data.area_code]) {
        const eventAttr = useSite.componentMap[id].eventAttr
        if(eventAttr.resultType == EVENTS_RESULTS_TYPES_MAP.page) {
          // 触发事件后 跳转页面
          const pageId = eventAttr.failPanelId
          if(pageId > 0) {
            useSite.updatePageIndex(pageId-1)
            EventBus.$emit('showPage', pageId)
          }
        } else if (eventAttr.resultType == EVENTS_RESULTS_TYPES_MAP.pop) {
          const popId = eventAttr.failPanelId
          if(popId > 0){
            useSite.updatePopIndex(popId-1)
            EventBus.$emit('showPop', popId)
          }
        }
      }
    },
    updateArea_({ data, id, controlId}) {
      const elements: any[] = []
      const wbData: any = this.controls[id][controlId].data
      wbData.area_code = data.area_code
      wbData.area = data.area
      _.forEach(data.area, (name: number, key: string) => {
        elements.push({ name, value: key })
      })
      wbData.elements = elements
    },
    updateAreaRank({ data, id, controlId}) {
      const useInteraction = useInteractionStore()
      const wbData: IBaseListControl = this.controls[id][controlId].data as IBaseListControl
      let elements: any[] = []//{rank,area,num}
      let rank = 1
      // data.area {110000:"北京市"} area_code: ''
      _.forEach(data.area, (value: number, name: string) => {
        elements.push({ rank: rank, area: name, num: value })
        rank++
      })
      elements = _.sortBy(elements, (item: any) => { return -item.num })
      _.forEach(elements, (item: any, index: number) => {
        item.rank = index + 1
      })
      wbData.elements = elements
      if(isHasOwnProperty(data, 'total')){
        useInteraction.bindData.total = data.total
      }
      EventBus.$emit("refreshDynamicData")
    },
    deletePushPicItem({id, controlId, fileNames}) {
      const fileNamePics: IPushItemPic_ = (this.controls[id][controlId].data as IPushControl).fileNamePics
      const newPics = []
      if(fileNames.length > 0) {
        _.forEach(fileNames, (fileName: string) => {
          // @ts-ignore
          newPics.push(fileNamePics[fileName])
        })
      }
      (this.controls[id][controlId].data as IBaseListControl).elements[0].pics = newPics
    }
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useControlsStore, import.meta.hot))
}