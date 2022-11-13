import { getItemBaseControl } from '@/components/utils/'
import { useSiteStore } from '@/store/site'
import { getCompIdByParam } from '@/utils/'
import { POST_API_MAP } from '@/service/api'

function numberEvent (params: any, baseControl: IBaseControl): string {
  const useSite = useSiteStore()
  const siteInfo = useSite.siteInfo

  let url = ''
  const controlData: INumberControl = baseControl.data as INumberControl
  if(controlData.onceGrowValue != 0) {
    if(controlData.onceGrowValue < 0){
      if(controlData.syn_com_id) {
        const synCompId = getCompIdByParam(controlData.syn_com_id)
        const symControlData = synCompId && getItemBaseControl(synCompId, baseControl.controlId)
        if(symControlData && (symControlData.data as INumberControl).num > 0) {
          url = POST_API_MAP.number
        }
      } else {
        if(controlData.num > 0) {
          url = POST_API_MAP.number
        }
      }
    } else {
      url = POST_API_MAP.number
    }
    //链接带过来的uid
    if (siteInfo.from && siteInfo.from.length > 0) {
      _.merge(params, { from: siteInfo.from })
    }
    //更新计数每次增加数据 2152
    if(controlData.isDynamic) {
      _.merge(params, { onceGrowValue: controlData.onceGrowValue, vipOnceGrowValue: controlData.vipOnceGrowValue })
    }
    //关联触发计数组件id
    let syn_com_id = getCompIdByParam(controlData.syn_com_id)
    if (syn_com_id && syn_com_id.length > 0) {
      let synComData = useSite.componentMap[syn_com_id]
      if(synComData && synComData.events.number) {
        _.merge(params, { syn_com_id })
      }
    }
  }
  return url
}

export {
  numberEvent
}