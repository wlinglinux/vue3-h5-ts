import { useSiteStore } from '@/store/site'
import { useInteractionStore } from '@/store/interaction'
import { getCompIdByParam, isHasOwnProperty, EventBus } from '@/utils/'
import { isPostWbEventOrCommonEvents } from '@/components/events/post-event'
import { COMPONENT_TYPES } from '@/const/'
import { getListByItem } from '@/components/utils/'

const rotate3dTime = 5000

function rotate3dEvent(item: IComponent, event: IEvent) {
  const useSite = useSiteStore()
  const useInteraction = useInteractionStore()
  const componentMap = useSite.componentMap

  let rotateUrl: string = ''
  let randomIndex = -1
  const lists = getListByItem(item)
  if (lists && lists.length > 0) {
    randomIndex = _.random(0, lists.length - 1)
    rotateUrl = lists[randomIndex].url
  }
  //别的关联组件给这个组件设置rotateIndex
  let isGetOther = event.comps[2].attrs.value
  let relateCompId = getCompIdByParam(event.comps[0].attrs.value)
  let relateCompData = componentMap[relateCompId]
  if (isGetOther) {
    if (relateCompId && relateCompData && relateCompData.commonAttr.itemIndex >= 0) {
      randomIndex = relateCompData.commonAttr.itemIndex
    }
  } else {
    //别的组件设置的值
    if (item.commonAttr.itemIndex >= 0) {
      randomIndex = item.commonAttr.itemIndex
    }
    //给别的组件设置index
    if (relateCompId && relateCompData) {
      relateCompData.commonAttr.itemIndex = randomIndex
    }
  }

  if (randomIndex != -1) {
    item.commonAttr.itemIndex = randomIndex
  }

  if (lists[randomIndex]) {
    rotateUrl = lists[randomIndex].url
  }

  //event.comps[0]是否播放动画
  let isPlayAnimate = true
  isPlayAnimate = event.comps[1] ? Boolean(event.comps[1].attrs.value) : true

  if (rotateUrl) {
    let shareData = { url: rotateUrl }
    useInteraction.updateShareData(shareData)
    if (!item.commonAttr.isDynamic) {
      useSite.updateComponentAttr({ id: item.id, commonAttr: { url: rotateUrl } })
    }
  }

  let rotate3dTime_: number = rotate3dTime
  if (event.comps[3] && event.comps[3].attrs.value) {
    let obj = JSON.parse(event.comps[3].attrs.value)
    if (isHasOwnProperty(obj, 'delayTime')) {
      const delayTime = JSON.parse(event.comps[3].attrs.value).delayTime
      if (delayTime > 0) {
        rotate3dTime_ = delayTime * 1000
      }
    }
    // {
    //   "rotateGroup": true
    // }
    // {"audio":"https://static.hd.xxx.com/upload/biz/tmp/65376222_2101.mp3","btnUrl":"https://static.hd.xxx.com/upload/biz/1/83938244_2274.png"}
    if (isHasOwnProperty(obj, 'rotateGroup')) {
      if (item.interactionData) {
        let element = item.interactionData.lists[randomIndex]
        _.merge(element, JSON.parse(element.params))
        updateItem(item, element as IGroupInteractionItem)
      }
    }
  }
  if (isPlayAnimate) {
    window.setTimeout(() => {
      EventBus.$emit("rotate3d", { isPlay: true, id: item.id })
    }, 100)
    item.rotateSetTimeoutCb = window.setTimeout(() => {
      EventBus.$emit("rotate3d", { isPlay: false, id: item.id })
      isPostWbEventOrCommonEvents && isPostWbEventOrCommonEvents({ item, loadEvent: null })
      window.clearTimeout(item.rotateSetTimeoutCb)
      item.rotateSetTimeoutCb = null
    }, rotate3dTime_)
  } else {
    isPostWbEventOrCommonEvents && isPostWbEventOrCommonEvents({ item, loadEvent: null })
  }
  return rotateUrl
}
//对打组轮播组里的组件属性根据自定义数据进行动态更新 2113 page=11
//打组轮播组-3d旋转：在站点1719的第六页
//3d旋转用再打组轮播组，动态显示图片、音频、跳转链接（数据配置在打组轮播组上的自定义数据）
function updateItem(item: IComponent, element: IGroupInteractionItem) {
  const useSite = useSiteStore()

  _.forEach(item.components, (component: IComponent) => {
    let id = component.id
    switch (component.cid) {
      case COMPONENT_TYPES.wb_audio:
        useSite.updateComponentAttr({ id, commonAttr: { url: element.audio } })
        break
      case COMPONENT_TYPES.wb_img:
        if (component.events && component.events.link) {
          // 判断图片是否绑定了跳转事件
          let linkEvent: IEvent = component.events.link
          linkEvent.comps[0].attrs.value = element.link
        } else {
          useSite.updateComponentAttr({ id, commonAttr: { url: element.url } })
        }
        break
      case COMPONENT_TYPES.wb_btn:
        break
    }
  })
}

export {
  rotate3dEvent
}