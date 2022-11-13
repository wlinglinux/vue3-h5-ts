
import { INIT_API_MAP } from '@/service/api'
import { STATISTIC_DATA_TYPES_MAP } from '@/const/'

function initStatisticDataEvent( event: IEvent): any {
  const statisticDataType = event.comps[0].attrs.value
  let url = ''
  let params: any = { isResultDisplay: true, type: '' }
  // if (statisticDataType == STATISTIC_DATA_TYPES_MAP.aes) {
  //   //加密条形码
  //   url = INIT_API_MAP.coupon
  // } else if (statisticDataType == STATISTIC_DATA_TYPES_MAP.pk) {
  //   //用户是否参数Pk
  //   url = INIT_API_MAP.pk
  // } else 
  if (statisticDataType == STATISTIC_DATA_TYPES_MAP.weibo2021vote) {
    // 微博2021年抽奖
    url = INIT_API_MAP.coupondraw
  } else if(statisticDataType == STATISTIC_DATA_TYPES_MAP.weiboTime) {
    //获取数据
    url = INIT_API_MAP.wbData
    params.type = statisticDataType
  }
  return { url, params }
}

export {
  initStatisticDataEvent
}