import { POST_API_MAP } from '@/service/api'
import { useSiteStore } from '@/store/site'
import { useInteractionStore } from '@/store/interaction'
import { getCompIdByParam, replaceStr } from '@/utils/'

function msgEvent(params: any, baseControl: IBaseControl): string {
  const useInteraction = useInteractionStore()
  const useSite = useSiteStore()

  const url = POST_API_MAP.msg
  const controlData = baseControl.data as IMsgControl
  const index = _.random(0, controlData.elements.length - 1)
  const text = replaceStr(useInteraction.formValueMap, controlData.elements[index])
  const send_uid = controlData.send_uid
  let rec_uid = ''
  // 关联组件获取uid
  let relateCompId: string = getCompIdByParam(controlData.rec_uid)
  if (relateCompId) {
    if (useInteraction.formValueMap[relateCompId] && useInteraction.formValueMap[relateCompId].item) {
      rec_uid = useInteraction.formValueMap[relateCompId].item.uid || useInteraction.formValueMap[relateCompId].item.id
    }
  } else {
    rec_uid = useSite.userInfo.uid
  }
  _.merge(params, { send_uid, rec_uid, text })

  return url
}

export {
  msgEvent
}