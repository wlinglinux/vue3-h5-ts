import { CONTROL_TYPES } from '@/const/'
import { isWeibo, getCompIdByParam } from '@/utils/'
import { useInteractionStore } from '@/store/interaction'
import { useSiteStore } from '@/store/site'
import { getItemBaseControl, getItemDataByCompData, getWbListOrListByItem } from '@/components/utils/'

function getLink(item: any) {
  let link: string
  if(item && _.isObject(item)){
    if(isWeibo() && item.schema && item.schema.length > 0){
      link = item.schema
    }else{
      link = item.link
    }
  }else{
    link = item
  }
  return link.length > 0 ? link : 'javascript:;'
}

function onJump(e: Event, item: IComponent, itemIndex: number) {
  const useInteraction = useInteractionStore()
  const isH5Edit = useSiteStore().isH5Edit
  const repostBaseControl = getItemBaseControl(item.id, CONTROL_TYPES.wb_reposts)
  const repostControlData = repostBaseControl && (repostBaseControl.data as IBaseListControl).elements[itemIndex]  

  const list = getWbListOrListByItem(item)
  const getVariableItem = list[itemIndex]

  if(isH5Edit || (!getVariableItem && !repostControlData)){
    return
  }

  let shareData = { link: '', midJump: '' }
  let jumpUrl = ""
  if(getVariableItem.link) {
    jumpUrl = shareData.link = getVariableItem.link
  } else {
    if(isWeibo()) {
      //sinaweibo://userinfo?uid=3142205857
      jumpUrl = "sinaweibo://detail/?mblogid=" + repostControlData.mid;
      shareData.midJump = jumpUrl
    }
  }
  useInteraction.updateShareData(shareData)
  if(jumpUrl){
    openLinkBySelfUrl(jumpUrl)
  }
  // const comType = "click"
  // const wModule = "jump"
  // onPostStatics({ item, e: null, comType, wModule, jumpUrl, params: '', apiUri: '' })
  
}

function onMidJump(e: Event, mid: string){
  e.stopPropagation()

  if(mid) {
    let jumpUrl = "sinaweibo://detail/?mblogid=" + mid
    // const comType = "click"
    // const wModule = "jump"
    // onPostStatics({ item, e: null, comType, wModule, jumpUrl, params: '', apiUri: '' })
    if(jumpUrl) {
      openLinkBySelfUrl(jumpUrl)
    }
  }
}


function onEventLink(event: IEvent, item: IComponent) {
  let jumpUrl:string = event.comps[0].attrs.value
  let schema:string = event.comps[1].attrs.value
  let jumpKey:string = event.comps[2].attrs.value
  if (schema && isWeibo()) {
    jumpUrl = schema
  } else if (jumpKey) {
    const interactionStore = useInteractionStore()
    jumpUrl = interactionStore.shareData[jumpKey]
    let relateCompId:string = getCompIdByParam(item.commonAttr.relateAttrCompId)
    if(!jumpUrl && relateCompId) {
      const siteStore = useSiteStore()
      const relateCompData:IComponent = siteStore.componentMap[relateCompId]
      const relateItemData: IListFormItem | any = getItemDataByCompData(relateCompData, item.commonAttr)
      jumpUrl = relateItemData[jumpKey]
      if(isWeibo() && jumpKey == "mid") {
        jumpUrl = "sinaweibo://detail/?mblogid=" + jumpUrl
      }
    }
  }
  if (jumpUrl && jumpUrl.length > 0) {
    if (window.top && window.top.location != self.location) {
      window.top.location.href = jumpUrl
    } else {
      openLinkBySelfUrl(jumpUrl)
    }
  }
}

function openLinkBySelfUrl(jumpUrl: string) {
  let blocked = false
  try {
    let worxWin = window.open(jumpUrl)
    if (worxWin == null) {
      blocked = true
    }
  } catch (ex) {
    blocked = true
  }
  if (blocked) {
    window.location.href = jumpUrl
  }
}

export {
  onEventLink,
  openLinkBySelfUrl,
  onJump,
  onMidJump,
  getLink
}