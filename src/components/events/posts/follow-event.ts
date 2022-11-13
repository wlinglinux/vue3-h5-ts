import { POST_API_MAP } from '@/service/api'
import { useSiteStore } from '@/store/site'
import { isHasOwnProperty, getCompIdByParam } from '@/utils/'
import { COMPONENT_TYPES, CONTROL_TYPES } from '@/const/'
import { getItemBaseControl, getCheckboxStr } from '@/components/utils/'


function followEvent(item: IComponent, params: any, baseControl: IBaseControl): string {
  const useSite = useSiteStore()
  let url = ''
  let follow_uid = ''
  const followControlData = baseControl.data as IFollowControl
  const relateCompId = getCompIdByParam(followControlData.relateCompId)
  if(relateCompId) {
    const { strs }  = getCheckboxStr(useSite.componentMap[relateCompId],'text')
    params.follow_topic = strs
    url = POST_API_MAP.follow
  }else{
    if( followControlData.follow_topi) {
      params.follow_topic = followControlData.follow_topi
    }
  }
  follow_uid = followControlData.follow_uid
  //3中情况： 1 有全局关注（一个全局关注单独控制一个按钮关注） 2 有全局关注 控制所有关注事件 3 是没有全局关注的
  if ((isHasOwnProperty(useSite.globalIsPost.isFollowClickMap, follow_uid) && useSite.globalIsPost.isFollowClickMap[follow_uid]) ||
  isHasOwnProperty(useSite.globalIsPost, 'isFollow') && useSite.globalIsPost.isFollow || 
  !isHasOwnProperty(useSite.globalIsPost, 'isFollow') && !isHasOwnProperty(useSite.globalIsPost.isFollowClickMap, follow_uid)) {
    if(!useSite.globalIsPost.isFollowedMap[follow_uid]) {
      if(item.cid == COMPONENT_TYPES.wb_common_list) {
        if (getItemBaseControl(item.id, CONTROL_TYPES.wb_user)) {
          follow_uid = (getItemBaseControl(item.id, CONTROL_TYPES.wb_user).data as IUserControl).elements[item.commonAttr.itemIndex].uid
        } else if (getItemBaseControl(item.id, CONTROL_TYPES.wb_reposts)) {
          let repostItem = (getItemBaseControl(item.id, CONTROL_TYPES.wb_reposts).data as IRepostsControl).elements[item.commonAttr.itemIndex]
          follow_uid = repostItem.uid
        }
      } else {
        let controlData: IUserControl | IRepostsControl | null = null
        const userBaseControl = getItemBaseControl(item.id, CONTROL_TYPES.wb_user)
        const repostsBaseControl = getItemBaseControl(item.id, CONTROL_TYPES.wb_reposts)
        if (userBaseControl) {
          controlData = userBaseControl.data as IUserControl
        } else if (repostsBaseControl) {
          controlData = repostsBaseControl.data as IRepostsControl
        }
        if(controlData) {
          let elements = controlData.elements
          if(elements) {
            let follow_uids: string[] = []
            if((controlData as IUserControl).isFollowByIndex && item.commonAttr.itemIndex >= 0) {
              follow_uid = elements[item.commonAttr.itemIndex].uid
            } else {
              _.forEach(elements, (item: ISortItem) => {
                if(item.uid) {
                  follow_uids.push(item.uid)
                }
              })
              follow_uid = follow_uids.join(',')
            }
          }
        }
      }
      if (follow_uid && _.toString(follow_uid).length > 0) {
        if(!params.follow_topic) params.follow_uid = follow_uid
        url = POST_API_MAP.follow
      }
    }
  }
  return url
}

export {
  followEvent
}