import { COMPONENT_TYPES } from '@/const/';
import { getCompIdByParam, isJSON, EventBus } from '@/utils/'
import { useSiteStore } from '@/store/site'
import { useInteractionStore } from '@/store/interaction'

function showOrHiddenEvent(item: IComponent, event: IEvent) {
  const useSite = useSiteStore()
  const componentMap = useSite.componentMap
  const useInteraction = useInteractionStore()

  let relateCompStr = event.comps[0].attrs.value
  if (relateCompStr && relateCompStr.length > 0 && isJSON(relateCompStr)) {
    let relateCompParam = JSON.parse(relateCompStr)
    let displayCompId = getCompIdByParam(relateCompParam.displayCompId) || relateCompParam.displayCompId
    let hiddenCompId = getCompIdByParam(relateCompParam.hiddenCompId) || relateCompParam.hiddenCompId
    //不在支持这种配置 可以替换为下面的配置更为灵活
    // let timeCompIdObj = relateCompParam.timeCompId//{"timeCompId":{time:"",compId:""}}
    // if(timeCompIdObj){
    //   const end = new Date(timeCompIdObj.time).getTime()
    //   const now = new Date().getTime()
    //   const endTime = end - now
    //   if(endTime < 0){
    //     displayCompId = timeCompIdObj.compId
    //   }
    // }
    const time = relateCompParam.time//{time:"2021/12/1"}} 到这个时间点触发事件 不到时间点直接返回
    if (time) {
      const end = new Date(time).getTime()
      const now = new Date().getTime()
      const endTime = end - now
      if (endTime > 0) {
        return
      }
    }

    // 站点2412&popId=3 当this.bindData中的数据大于20的时候隐藏数据
    let isInVisible = relateCompParam.isInVisible
    let key = relateCompParam.key
    if(isInVisible && key) {
      const bindData = useInteraction.bindData
      if(!bindData[key] || bindData[key] && bindData[key] <= isInVisible){
        return
      }
    }

    // 小于某个值的话就显示隐藏某两个组件 站点2485&popId = 4
    let isVisible = relateCompParam.isVisible
    if(isVisible && key) {
      if(useInteraction.bindData[key] < isVisible){
       [displayCompId,hiddenCompId] = [hiddenCompId, displayCompId]
      }
    }

    if (displayCompId) {
      const displayCompData = useSite.componentMap[displayCompId]
      if(item.interactionData.isInGroupCarousel) {
        displayCompId = displayCompId + '_' + item.commonAttr.itemIndex + '_' + displayCompData.commonAttr.qIndex
      }
      if(!displayCompData.commonAttr.isPageFixed) {
        useInteraction.addNeedRecoverCompId(componentMap[displayCompId])
      }
      useSite.updateComponentAttr({ id: displayCompId, commonAttr: { isVisible: true } })
    }
    if (hiddenCompId) {
      const hiddenCompData = useSite.componentMap[hiddenCompId]
      if(item.interactionData.isInGroupCarousel) {
        hiddenCompId = hiddenCompId + '_' + item.commonAttr.itemIndex + '_' + hiddenCompData.commonAttr.qIndex
      }
      if(!hiddenCompData.commonAttr.isPageFixed) {
        useInteraction.addNeedRecoverCompId(componentMap[hiddenCompId])
      }
      useSite.updateComponentAttr({ id: hiddenCompId, commonAttr: { isVisible: false } })
    }
    //如果组件是全局组件，在页面切换的时候组件已经初始化就不能再次初始化了，所以通过事件刷新组件状态
    if(relateCompParam.synCompIds) {
      const compIds = relateCompParam.synCompIds.split(',')
      const sourceCompId = compIds[0]
      const sourceCompData = useSite.componentMap[sourceCompId]
      const targetCompId = compIds[1]
      const targetCompData = useSite.componentMap[targetCompId]
      if(sourceCompData.cid == targetCompData.cid) {
        if(sourceCompData.cid == COMPONENT_TYPES.wb_btn){
          EventBus.$emit("allBtnStatus", { isSelected: sourceCompData.interactionData.isSelected, compId: targetCompId })
        } else if(sourceCompData.cid == COMPONENT_TYPES.wb_img){
          targetCompData.interactionData.isSelected = sourceCompData.interactionData.isSelected
        }
      }
    }
    const hiddenComps = relateCompParam.hiddenCompIds && relateCompParam.hiddenCompIds.split(",")
    _.forEach(hiddenComps, (hiddenCompId: string) => {
      if (hiddenCompId) {
        if(!componentMap[hiddenCompId].commonAttr.isPageFixed) {
          useInteraction.addNeedRecoverCompId(componentMap[hiddenCompId])
        }
        useSite.updateComponentAttr({ id: hiddenCompId, commonAttr: { isVisible: false } })
      }
    })

    if(item.interactionData.isInGroupCarousel) {
      const currentPage = useSite.getCurrentPage
      if(currentPage.isAdjustPageHeight) {
        const groupCompId = item.interactionData.groupCompId
        nextTick(() => {
          EventBus.$emit('adjustPageHeight', groupCompId) 
        })
      }
    }

    //在规定的时间段内显示不同的组件
    const timesTwoD = relateCompParam.times//{"times":[["2022/9/22 00:00","2022/9/28 11:59"],["2022/9/28 12:00","2022/9/28 15:00"],["2022/9/28 15:01","2022/9/28 23:59"]],"compIds":["2d7c90f0-c257-4b77-bb62-a85dff904691","01f23e6b-f59c-404b-9367-fa78f9df670d","026ae947-5ce6-4c1d-b375-f524caf77166"]}
    const compIds = relateCompParam.compIds
    if(compIds && compIds.length > 0 && timesTwoD && timesTwoD.length > 0) {
      _.forEach(compIds, (compId: string) => {
        useSite.updateComponentAttr({ id: compId, commonAttr: { isVisible: false } })
      })
      _.forEach(timesTwoD, (timeArr: string[], index) => {
        const startTime = new Date(timeArr[0]).getTime()
        const endTime = new Date(timeArr[1]).getTime()
        const now = new Date().getTime()
        if((now > startTime && now < endTime)) {
          useSite.updateComponentAttr({ id: compIds[index], commonAttr: { isVisible: true } })
        }
      })
    } else {
      const times = relateCompParam.times//"times":["2022/9/28 12:00","2022/9/28 15:00"] 在这个时间段触发事件 不到时间点直接返回
      if (times && times.length > 0) {
        const startTime = new Date(times[0]).getTime()
        const endTime = new Date(times[1]).getTime()
        const now = new Date().getTime()
        if((now > startTime && now < endTime)) {
          useSite.updateComponentAttr({ id: displayCompId, commonAttr: { isVisible: true } })
          useSite.updateComponentAttr({ id: hiddenCompId, commonAttr: { isVisible: false } })
        } else {
          useSite.updateComponentAttr({ id: displayCompId, commonAttr: { isVisible: false } })
          useSite.updateComponentAttr({ id: hiddenCompId, commonAttr: { isVisible: true } })
        }
      }
    }
  }
}

export {
  showOrHiddenEvent
}