function testGuid(testID:string) : boolean {
  var reg = new RegExp(/^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/);
  if (reg.test(testID)) {
      return true;
  }
  return false;
}
function guid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  })
}
// 数组乱序
const shuffleArray = (arr: number[]) => arr.sort(() => Math.random() - 0.5) 
// 数组去重
const getUnique = (arr: number[]) => [...new Set(arr)]
// 随机颜色
// const generateRandomHexColor = () => { `#${Math.floor(Math.random() \* 0xffffff) .toString(16)}\` }

function addClass(elem: HTMLDivElement, cls: string) {
  //HTML5新增classList
  //如果classList中存在给定的值，删除它，否则，添加它；
  if(elem.classList) elem.classList.add(cls)
}
function removeClass(elem: HTMLDivElement, cls: string) {
  if(elem.classList) elem.classList.remove(cls)
}
function getMousePos(event: any) {
  if(!event){
    return { 'x': 0, 'y': 0 }
  }
  var e = event || window.event
  var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft
  var scrollY = document.documentElement.scrollTop || document.body.scrollTop
  var x = e.pageX || e.clientX + scrollX
  var y = e.pageY || e.clientY + scrollY
  //alert('x: ' + x + '\ny: ' + y)
  return { 'x': x?x:0, 'y': y?y:0 }
}
function getCookie(name: string) {
  var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"))
  if (arr != null) return unescape(arr[2]); return ""
}
function formateDate(fmt: any, date: any) {
  var o = {
    "M+" : date.getMonth()+1,                 //月份
    "d+" : date.getDate(),                    //日
    "h+" : date.getHours(),                   //小时
    "m+" : date.getMinutes(),                 //分
    "s+" : date.getSeconds(),                 //秒
    "q+" : Math.floor((date.getMonth()+3)/3), //季度
    "S"  : date.getMilliseconds()             //毫秒
  };
  if(/(y+)/.test(fmt))
    fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length))
  for(var k in o)
    if(new RegExp("("+ k +")").test(fmt))
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)))
  return fmt
}
function convertDateFormat() {
  var crtTime = new Date()
  return formateDate("yyyy-MM-dd hh:mm:ss", crtTime)//直接调用公共JS里面的时间类处理的办法
}

function convertDateChineseFormat(date: string, isHour = true){
  var crtTime = new Date(date.replace(/-/g,  "/"))
  if(isHour){
    return formateDate("yyyy年MM月dd日 hh小时mm分ss秒", crtTime);//直接调用公共JS里面的时间类处理的办法
  }else{
    return formateDate("yyyy年MM月dd日", crtTime);//直接调用公共JS里面的时间类处理的办法
  }
}

export {
  getRandomArrayElements,
  randomUploadFileName,
  getValueFromXml,
  getQueryString,
  isHasOwnProperty,
  bgPositionStyle,
  getCompIdByParam,
  getMapByArr,
  isJSON,
  isWeibo,
  isWeiXin,
  isQQ,
  replaceStr
} from './common'

export {
  getPxOVwByValue,
  pxTovw,
  getPxOrVw,
  remUnit
} from './px-vw'

export {
  EventBus,
} from './event-bus'


export {
  dynamicsLoadScript
} from './load'

export {
  testGuid,
  guid,
  addClass,
  removeClass,
  getMousePos,
  getCookie,
  convertDateFormat,
  convertDateChineseFormat
}