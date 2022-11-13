import { getCompIdByParam, isHasOwnProperty, EventBus } from '@/utils/'
import { COMPONENT_TYPES } from '@/const/'
import { useSiteStore } from '@/store/site'
import { isWbEvent } from '@/components/utils/'
import { postWbEvent } from '@/components/events/post-event'
import { frontEvent, onFrontEvents } from '@/components/events/front-event'
  

  function onLoadEvent(item: IComponent) {
     //加载截图，发博操作，需要发博事件的操作类型配置为click，这样就在加载时不会执行，在截图后会去执行click发博事件
     if(item.events.saveImg){
      onLoadEventCb(item)
    }else{
      executeLoadEvent(item)
    }
  }

  function onLoadEventCb(item: IComponent) {
    const useSite = useSiteStore()
    //截图容器，监测图片是否加载完，加载后在调用
    const event = item.events.saveImg
    const cropConId = event.comps[1].attrs.value
    const cropCompId = getCompIdByParam(cropConId)
    item.eventShare.loadImgNum = 0
    item.eventShare.loadedImgNum = 0
    if(cropCompId) {
      let compData: IComponent = useSite.componentMap[cropCompId]
      loadedImgs(item, compData, true)
      item.eventShare.loadEventCb = window.setInterval(() => {
        item.eventShare.loadedImgNum = 0
        loadedImgs(item, compData, false)
        if(item.eventShare.loadedImgNum >= item.eventShare.loadImgNum){
          window.clearInterval(item.eventShare.loadEventCb)
          executeLoadEvent(item)
        }
      }, useSite.siteInfo.reloadTime)
    } else {
      _.forEach(useSite.getCurrentPage.components, (compData: IComponent) => {
        loadedImgs(item, compData, true)
      })
      item.eventShare.loadEventPageCb = window.setInterval(() => {
        item.eventShare.loadedImgNum = 0
        _.forEach(useSite.getCurrentPage.components, (compData) => {
          loadedImgs(item, compData, false)
        })
        if(item.eventShare.loadedImgNum >= item.eventShare.loadImgNum){
          window.clearInterval(item.eventShare.loadEventPageCb)
          window.setTimeout(() => {
            executeLoadEvent(item)
          }, useSite.siteInfo.reloadTime)
        }
      }, useSite.siteInfo.reloadTime)
    }
  }

  function executeLoadEvent(item: IComponent) {
    _.forEach(item.eventShare.loadEvents, (loadEvent: IEvent) => {
      let isWbEvent_ = isWbEvent(loadEvent)
      if(isWbEvent_) {
        postWbEvent( { item, loadEvent } )
      } else {
        if(item.eventShare.commonFrontEvents.length > 0){
          onFrontEvents({ item, events: item.eventShare.commonFrontEvents })
        } else {
          frontEvent( { item: item, event: loadEvent} )
        }
      }
    })
  }
  

  function loadedImgs(item: IComponent, compData: IComponent, isAddNum: boolean){
    if(compData.components && compData.components.length > 0){
      _.forEach(compData.components, (compData_: IComponent) => {
        loadedImgs(item, compData_, isAddNum);
      })
    }else if(compData.cid == COMPONENT_TYPES.wb_img || compData.cid == COMPONENT_TYPES.wb_common_list) {
      if(isAddNum) {
        if(compData.cid == COMPONENT_TYPES.wb_img) {
          if(compData.commonAttr.url) {
            item.eventShare.loadImgNum++;
          }
        } else {
          item.eventShare.loadImgNum++;
        }
      }
      if(isHasOwnProperty(compData.interactionData, "isLoaded") && compData.interactionData.isLoaded) {
        item.eventShare.loadedImgNum++;
      }
    }
  }

  export {
    onLoadEvent
  }