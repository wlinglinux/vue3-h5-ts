import { useSiteStore } from '@/store/site'
import { getCookie, convertDateFormat, guid, getQueryString, getMousePos } from '@/utils/'
import { isWeibo, isWeiXin, isQQ } from '@/utils'
export const API_VERSION = "v1"


const staticsData = {
  "_pk": "200010",
  "_uk": "WbcscXm_v1.0",
  "_src": "web",
  "_v": "2.0",
  "_rk": "0399FBC4-57FF-2A2C-E2E0-450D9F5718AB",
  "_cp": {
    "rp": "1024x756",
    "os": "ios",
    "plt": "pc",
    "device_id": "DB0CBDB7-2EB7-2599-53EF-39159963DF5E",
    "chwm": "sd",
    "from": "D06_G35",
    "appver": "v1.0"
  },
  "_ep": [{
    "timestamp": 1548838607,
    "et": "custom",
    "method": "click",
    "ek": "test",
    "suid": "1617037764",
    "src": "http://localhost/index.html",
    "attribute": {
      "s": "100110",
      "t": "share",
      "l": "1",
      "u": "1617037764",
      "cl": "pc",
      "cti": 1548838607,
      "sti": "2019-01-30 16:56:47",
      "ps": "ps",
      "g": "D3EE1BBE-A451-EE65-DAF0-B129B92A4C43",
      "lv": "2018-10-30 10:20:23",
      "fr": "D06_G35",
      "p": "p",
      "h": "?from=D06_G35&l=s&s=111",
      "rf": "rf",
      "w": "w",
      "m": "m",
      "fn": "fn",
      "uri": "uri",
      "up": "up",
      "j": "jSDSD",
      "pspt": "pspthjgjdgs,687",
      "ax": "893",
      "ay": "178",
      "dg": "0"
    }
  }]
}

export function convertParams(params: any){
  var str = ""
  for(var key in params){
    str += key + "=" + params[key] + "&"
  }
  return str
}
export function onPostStatics({ item, e, comType, wModule, jumpUrl, params, apiUri }: {
  item: IComponent, e: any, comType: string, wModule: string, jumpUrl: string, params: any, apiUri: string 
}) {
  const useSite = useSiteStore()
  if (useSite.isH5Edit) {
    return
  }
  const xy: any = getMousePos(e)
  let comId: string
  if (item) {
    comId = item.id
  } else {
    comType = 'pageOrPop'
    comId = "pageId: " + (useSite.pageIndex+1) + "popId: " + (useSite.popIndex+1)
  }
  postStatics({
    comType, comId, wModule, pageIndex: _.toString(useSite.pageIndex), apiType: "",
    apiUri, params, jumpUrl, clickSequence: "", mouseX: xy.x, mouseY: xy.y
  })
}
// login 登录
// share 分享
// push 原发博文
// repost 转发
// praise 点赞
// comment 评论
// number 计数
// general 活动
// vote 投票
// lottery 抽奖
// package 红包
// jump 跳转
// follow 关注
// msg 私信
// formdata 表单
export function postStatics({
  comType="visit", comId="0", wModule, pageIndex="0", apiType='', apiUri='', 
  params='', jumpUrl, clickSequence='', mouseX="0", mouseY="0"}) {
  const useSite = useSiteStore()
  const siteInfo = useSite.siteInfo
  const userInfo = useSite.userInfo
  // @ts-ignore
  if(siteInfo.isTemp || process.env.NODE_ENV === 'development') {
    return
  }
  staticsData["_rk"] = guid()
  staticsData["_cp"]["rp"] = document.documentElement.clientWidth + "," + document.documentElement.clientHeight
  staticsData["_cp"]["os"] = siteInfo.md.os
  staticsData["_cp"]["plt"] = siteInfo.md.isMobile ? siteInfo.md.mobileName : "pc"
  var jy_device_id = getCookie("jy_device_id")
  staticsData["_cp"]["device_id"] = jy_device_id ? jy_device_id : guid()
  var chwm = ''
  if(isWeibo()){
    chwm = 'weibo'
  }else if(isWeiXin()){
    chwm = 'weixin'
  }else if(isQQ()){
    chwm = 'qq'
  }else{
    chwm = 'other'
  }
  staticsData["_cp"]["chwm"] = chwm

  const siteId = siteInfo.id
  const jy_fr_id = getCookie("jy_fr_" + siteId)
  staticsData["_cp"]["from"] = jy_fr_id ? jy_fr_id : ""
  staticsData["_ep"][0]["timestamp"] = Math.floor(new Date().getTime()/1000)
  staticsData["_ep"][0]["ek"] = comType
  staticsData["_ep"][0]["suid"] = userInfo.uid ? userInfo.uid : ""
  staticsData["_ep"][0]["src"] = window.location.href
  
  staticsData["_ep"][0]["attribute"]["s"] = _.toString(siteId)
  staticsData["_ep"][0]["attribute"]["t"] = wModule ? wModule : ""//模块类型
  staticsData["_ep"][0]["attribute"]["l"] = userInfo.isLogin ? "1" : "0"
  staticsData["_ep"][0]["attribute"]["u"] = staticsData["_ep"][0]["suid"]
  staticsData["_ep"][0]["attribute"]["cl"] = staticsData["_cp"]["plt"]
  staticsData["_ep"][0]["attribute"]["cti"] = staticsData["_ep"][0]["timestamp"]
  staticsData["_ep"][0]["attribute"]["sti"] = convertDateFormat()
  staticsData["_ep"][0]["attribute"]["ps"] = comId
  const jy_uv_guid_id = getCookie("jy_uv_guid_" + siteId)
  staticsData["_ep"][0]["attribute"]["g"] = jy_uv_guid_id ? jy_uv_guid_id : guid()
  var jy_first_date_id = getCookie("jy_first_date_" + siteId)
  jy_first_date_id = jy_first_date_id.replace("+", " ")
  staticsData["_ep"][0]["attribute"]["lv"] = jy_first_date_id ? jy_first_date_id : ""
  //stfr=A1001_A2002_A3001  
  const fr = getQueryString("stfr")
  staticsData["_ep"][0]["attribute"]["fr"] = fr ? fr : ""
  staticsData["_ep"][0]["attribute"]["p"] = pageIndex.toString()
  staticsData["_ep"][0]["attribute"]["h"] = window.location.search
  staticsData["_ep"][0]["attribute"]["rf"] = document.referrer
  staticsData["_ep"][0]["attribute"]["w"] = ""
  staticsData["_ep"][0]["attribute"]["m"] = API_VERSION
  staticsData["_ep"][0]["attribute"]["fn"] = apiType ? apiType : ""
  staticsData["_ep"][0]["attribute"]["uri"] = apiUri ? apiUri : ""
  const ep_attribute_up = convertParams(params)
  staticsData["_ep"][0]["attribute"]["up"] = ep_attribute_up ? ep_attribute_up : ""
  staticsData["_ep"][0]["attribute"]["j"] = jumpUrl ? jumpUrl : ""
  staticsData["_ep"][0]["attribute"]["pspt"] = clickSequence ? clickSequence : ""
  staticsData["_ep"][0]["attribute"]["ax"] = mouseX.toString()
  staticsData["_ep"][0]["attribute"]["ay"] = mouseY.toString()
  staticsData["_ep"][0]["attribute"]["dg"] = siteInfo.isDebug.toString()
  
  const data = JSON.stringify(staticsData)
  const axiosStatics = window.axios.create()
  axiosStatics.post("https://beacon.sina.com.cn/mrt.gif?_"+Math.random(), data).then(function(){})
}