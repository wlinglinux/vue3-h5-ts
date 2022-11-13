import { getCompIdByParam, isHasOwnProperty, EventBus } from '@/utils/'
import { CONTROL_TYPES, COMPONENT_TYPES } from '@/const/'
import { useSiteStore } from '@/store/site'
import { useInteractionStore } from '@/store/interaction'
import { showToast, getItemBaseControl } from '@/components/utils/'

function interactionDataEvent(item: IComponent, event: IEvent) {
  const useSite = useSiteStore()
  const useInteraction = useInteractionStore()
  const componentMap = useSite.componentMap
  const formValueMap = useInteraction.formValueMap

  let rotateUrl: string = ''
  let randomIndex: number = -1
  const lists: IInteractionItem[] | undefined = item.interactionData.lists
  const interactionData: IInteractionData = item.interactionData
  const relateCompId: string = getCompIdByParam(event.comps[1].attrs.value)
  const relateCompData: IComponent = componentMap[relateCompId]
  if (relateCompData && relateCompData.commonAttr.itemIndex >= 0 && lists) {
    randomIndex = relateCompData.commonAttr.itemIndex
    item.commonAttr.itemIndex = randomIndex

    if (lists[randomIndex]) {
      rotateUrl = lists[randomIndex].url
    }
    if (rotateUrl) {
      const shareData = { url: rotateUrl }
      useInteraction.updateShareData(shareData)
      EventBus.$emit('refreshDynamicData')
    }
  } else if (item.events.interactionData) {
    // {"signDay":1,"btnCompId":"05c6a3f2-3f7d-40c6-b286-2512c6aa98e0"} 1911 日历组件
    if (isHasOwnProperty(interactionData, "signDay")) {
      // 延迟几秒钟进行操作
      let overTime = window.setTimeout(() =>{
        const btnCompId: string | undefined = interactionData.btnCompId
        let count = 0
        const commonAttr = { filter: { isGrayscale: false, grayscale: 5 } }
        const voteBaseControl = getItemBaseControl(item.id, CONTROL_TYPES.wb_vote)
        const numberBaseControl = getItemBaseControl(item.id, CONTROL_TYPES.wb_number)
        if (voteBaseControl) {
          const voteControlData = voteBaseControl.data as IVoteControl
          let elements = voteControlData.elements
          _.forEach(elements, (vote: IVoteMapItem) => {
            if (vote.num > 0) {
              count++
            }
          })
        } else if (numberBaseControl) {
          const numberControlData = numberBaseControl.data as INumberControl
          count = numberControlData.num
        }
        let isGrey = false
        if (interactionData.signDay && count < interactionData.signDay) {
          isGrey = commonAttr.filter.isGrayscale = true
        } else {
          isGrey = commonAttr.filter.isGrayscale = false
        }
        const btnCompData = btnCompId && componentMap[btnCompId]
        if(btnCompData) {
          if(btnCompData.cid == COMPONENT_TYPES.wb_img) {
            useSite.updateComponentAttr({ id: btnCompId, commonAttr })
            // EventBus.$emit('refreshImgStyles', { id: btnCompId })
          } else if(btnCompData.cid == COMPONENT_TYPES.wb_btn){
            useSite.updateComponentAttr({ id: btnCompId, commonAttr:{ isGrey} })
            EventBus.$emit('allBtnStatus', { isGrey, compId: btnCompId })
            EventBus.$emit('btnStatus', { isGrey, compId: btnCompId })
          }
        }
        window.clearInterval(overTime)
      },100)
      
    } else if (isHasOwnProperty(interactionData, "lottery")) {
      // 2113 自定义数据-点击 {"lottery": {"3": "b5c5a0ba-b3ad-4088-a9cd-dd82ac42a769","7": "080a918f-9ab6-4beb-9c47-b95d17802446","14": "88236e33-b128-48d4-9577-8159c38ca331"}}
      let compId = item.events.interactionData.comps[1] && getCompIdByParam(item.events.interactionData.comps[1].attrs.value)
      if (compId && compId.length) {
        let num: number = _.parseInt(formValueMap[compId].value)
        let max: number = 0
        _.forEach(interactionData.lottery, (value: string, key: number) => {
          key = _.parseInt(key)
          if (num >= _.parseInt(key)) {
            if (max < key) {
              max = key
            }
          }
        })
        let maxCompId = interactionData.lottery[max]
        if (!maxCompId) {
          showToast('亲，签到次数不够！')
          return
        }
        EventBus.$emit("itemClick", { id: maxCompId })
      }
    } else if (isHasOwnProperty(interactionData, "isEmitClick")) {
      EventBus.$emit('radioImg', { index: item.commonAttr.itemIndex })
    }
  }
}

export {
  interactionDataEvent
}