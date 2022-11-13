import { getCompIdByParam } from '@/utils/'
import { useSiteStore } from '@/store/site'
import { FRIEND_RANK_TYPES_MAP } from '@/const/'
import { INIT_API_MAP } from '@/service/api'

function initRankFriendEvent(baseControl: IBaseControl) {
  const useSite = useSiteStore()
  const userInfo: IUserInfo = useSite.userInfo
  let url = ''
  
  let rankType: number = (baseControl.data as IRankFriendControl).rankType
  let params: any = { uid: userInfo.uid }
  if (rankType == FRIEND_RANK_TYPES_MAP.friends) {
    //获取好友列表
    url = INIT_API_MAP.friends
  } else if (rankType == FRIEND_RANK_TYPES_MAP.rank) {
    //获取七夕好友能量排行榜 及 计数排行榜
    url = INIT_API_MAP.numberRank
    let relateCompId: string = getCompIdByParam((baseControl.data as IRankFriendControl).relateCompId)
    if (relateCompId) {
      params.relate_comp_id = relateCompId
    }
  }
  return { url, params }
}

export {
  initRankFriendEvent
}