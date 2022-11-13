import AxiosService from '@/service/axios'
import { getQueryString } from '@/utils'

// const env_ = import.meta.env
// const PROXY_URL = env_.DEV ? 'api' : ''
const PROXY_URL = ''

const POST_API_MAP = {
  number: '/feact/number',
  vote: '/feact/vote',
  push: '/feact/wb_push',
  repost: '/feact/wb_repost',
  praise: '/feact/wb_praise',
  packet: '/feact/wb_packet',
  general: '/feact/general',
  lottery: '/feact/lottery',
  msg: '/feact/wb_msg',
  follow: '/feact/wb_follow',
  areaBind: '/feact/area_bind',
  picId: '/feact/picid',
  submit: '/Feact/formdata'
}

const INIT_API_MAP = {
  number: "/feinit/number",
  numberDayExists: '/feinit/number_dayexists',
  numberExists: '/feinit/number_exists',
  vote: '/feinit/vote',
  voteList: '/feinit/vote_list',
  general: '/feinit/general',
  generalNum: '/feinit/general_num',
  friendShip: '/feinit/wb_friendship',
  cardlist: '/feinit/wbcardlist',
  friends: '/feinit/wb_friends',
  numberRank: '/feinit/number_rank',
  data: '/feinit/data',                   
  numberInfo: '/feinit/number_info', 
  wzRank: 'feinit/wz_rank',
  lotteryLuckyform: '/feinit/Lottery_luckyform',
  head: '/feinit/wb_head',
  coupon: '/feinit/Coupon',
  pk:'/feinit/wb_pk',
  coupondraw: '/feinit/coupondraw',
  wbData:'/feinit/wb_data',
  controls: '/feinit/controls',
  formrandlist: '/feinit/formrandlist',
  share: '/feinit/share',
  timer: '/feinit/timer',
  file: '/file/params',
  formlatest: '/feinit/formlatest', // 活动信息
  wzSraffletimes: '/feinit/wz_sraffletimes' // 王者荣耀抽奖次数
}

function postInteractionData(url: string, params: any){
  return AxiosService.post(url, params)
}

function postInitData(url: string, params: any){
  return AxiosService.post(url, params)
}

function getSiteData(params: IGetSiteData) {
  return AxiosService.post(PROXY_URL + '/feinit/get', params)
}

function getTempSiteData(params: IGetTempSiteData) {
  return AxiosService.post(PROXY_URL + '/site/gettemp', params)
}

function sendStaticsVisit(type: string, site_id: number) {
  // if(process.env.NODE_ENV === 'development'){
  //   return
  // }
	var jy_fr = getQueryString("stfr")
	var params = {
		"site_id": site_id,
		"t": type,
		"jy_fr": jy_fr,
	}
  //后端置cookie
	AxiosService.post(PROXY_URL + "/feinit/s", params).then(function(){})
}

export {
  PROXY_URL,
  getSiteData,
  getTempSiteData,
  sendStaticsVisit,
  POST_API_MAP,
  INIT_API_MAP,
  postInitData,
  postInteractionData
}
