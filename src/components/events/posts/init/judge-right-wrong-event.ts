import { useSiteStore } from '@/store/site';
import { GENERAL_INIT_TYPES_MAP } from '@/const/'
import { getCompIdByParam } from '@/utils/'
import { INIT_API_MAP } from '@/service/api'

function initJudgeRightWrongEvent(baseControl: IBaseControl): any {
  const useSite = useSiteStore()
  // baoming不走这里在 activity里
  let ele_key = (baseControl.data as IJudgeRightWrongControl).ele_key
  let relateCompId = getCompIdByParam((baseControl.data as IJudgeRightWrongControl).relateCompId)

  let params: any = { ele_key, type: ele_key, controlId: baseControl.controlId }
  if (relateCompId) {
    params.com_id = relateCompId
  }

  let url = ''
  if (ele_key == GENERAL_INIT_TYPES_MAP.wzRank) {
    //https://apib.hd.xxx.com/v1/feinit/zwangzhe?site_id=2048
    url = INIT_API_MAP.wzRank
  }else if (ele_key == GENERAL_INIT_TYPES_MAP.area) {
    //https://apib.hd.xxx.com/v1/feinit/data?site_id=&type=area
    url = INIT_API_MAP.data
  } else if (ele_key == GENERAL_INIT_TYPES_MAP.arearank) {
    //https://apib.hd.xxx.com/v1/feinit/number_info?site_id=1&type=arearank
    url = INIT_API_MAP.numberInfo
  } else if (ele_key == GENERAL_INIT_TYPES_MAP.lotteryForm) {
    url = INIT_API_MAP.lotteryLuckyform
    params.isResultDisplay = true
  } else if(ele_key == GENERAL_INIT_TYPES_MAP.formrandlist) {
    // https://apib.hd.xxx.com/v1/feinit/formrandlist?site_id=1580&com_id=0d5df569-1e8f-418c-86af-15bf02c7b4a6
    delete params.ele_key
    //触发这个组件的组件id 提交按钮
    if(relateCompId) {
      params.com_id = relateCompId
    }
    url = INIT_API_MAP.formrandlist
  } else if(ele_key == GENERAL_INIT_TYPES_MAP.puzzle || ele_key == GENERAL_INIT_TYPES_MAP.draw) {
    // http://apib.hd.xxx.com/v1/feinit/general?site_id=1229&com_id=&ele_key=puzzle
    // http://apib.hd.xxx.com/v1/feinit/general?site_id=1229&com_id=&ele_key=draw
    url = INIT_API_MAP.general
  } else if(ele_key == GENERAL_INIT_TYPES_MAP.wzSraffletimes){
    url =  INIT_API_MAP.wzSraffletimes
  } else if (ele_key == GENERAL_INIT_TYPES_MAP.info){
    url = INIT_API_MAP.general
  }

  return { url , params }
}

export {
  initJudgeRightWrongEvent
}