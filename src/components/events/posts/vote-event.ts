import { getWbListOrListByItem } from '@/components/utils/'
import { useInteractionStore } from '@/store/interaction'
import { POST_API_MAP } from '@/service/api'

function voteEvent (item: IComponent, params: any): string {
  let url = POST_API_MAP.vote
  let vote_id: number
  const wbListOrLists: any[] = getWbListOrListByItem(item)
  if (_.isArray(wbListOrLists)) {
    //新的list里都用voteId作为键值 为兼容以前的代码才会写上 || 
    let voteItem = wbListOrLists[item.commonAttr.itemIndex]
    vote_id = voteItem.voteId || voteItem.uid || voteItem.mid 
    item.commonAttr.pushIndex = voteItem.voteId - 1
    //存储link 在事件网页跳转中使用,
    if(voteItem.mid) {
      let midJump = "sinaweibo://detail/?mblogid=" + voteItem.mid
      let shareData = { link: voteItem.link, midJump }
      const useInteraction = useInteractionStore()
      useInteraction.updateShareData(shareData)
    }
  } else if(item.lists && item.lists.length > 0) {
    //日历组件使用voteId
    vote_id = item.commonAttr.voteId || item.lists[item.commonAttr.itemIndex].voteId
    item.commonAttr.pushIndex = vote_id - 1
  } else {
    vote_id = item.commonAttr.voteId ? item.commonAttr.voteId : 1//非list组件添加投票组件，设置投票id为1
    item.commonAttr.pushIndex = vote_id - 1
  }
  // let syn_com_id = getCompIdByParam(controlData.data.syn_com_id)
  // if (syn_com_id && syn_com_id.length > 0) {
  //   _.merge(params, { syn_com_id })

  //   let syn_vote_ids = controlData.data.syn_vote_ids
  //   syn_vote_ids = _.trim(syn_vote_ids)
  //   if (syn_vote_ids.length > 0) {
  //     if (syn_vote_ids.split(",").length > 0) {
  //       _.merge(params, { syn_vote_ids })
  //     }
  //   }
  // }
  _.merge(params, { vote_id })
  return url
}

export {
  voteEvent
}