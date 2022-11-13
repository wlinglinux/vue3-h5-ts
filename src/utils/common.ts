import { BG_POSITION_REPEAT_TYPES_MAP } from '@/const/'

// const getQueryString = (name: string) => {
//   let url = location.search //获取url中"?"符后的字串
//   let theRequest: any = new Object()
//   if (url.indexOf("?") != -1) {
//     let str = url.substr(1)
//     let strs = str.split("&")
//     for (let i = 0 i < strs.length i++) {
//       theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1])
//     }
//   }
//   return theRequest[name]
// }
const getQueryString = (name: string): string => {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
  const r = window.location.search.substr(1).match(reg)
  if (r != null) return decodeURIComponent(r[2])
  return ''
}

function isHasOwnProperty(obj: any, attr: string) : boolean {
  return Object.prototype.hasOwnProperty.call(obj, attr)
}

function bgPositionStyle(styles_: IPageStyles | any, bgPositionRepeatType: number){
  styles_.backgroundRepeat = 'no-repeat'
  if(bgPositionRepeatType == BG_POSITION_REPEAT_TYPES_MAP.centerTop){
    styles_.backgroundPosition = 'top center'
    styles_.backgroundSize = 'cover'
  }else if(bgPositionRepeatType == BG_POSITION_REPEAT_TYPES_MAP.centerBottom){
    styles_.backgroundPosition = 'bottom center'
    styles_.backgroundSize = 'auto'
  }else if(bgPositionRepeatType == BG_POSITION_REPEAT_TYPES_MAP.repeatY){
    styles_.backgroundPosition = 'center'
    styles_.backgroundRepeat = 'repeat-y'
    styles_.backgroundSize = 'auto'
  }else if(bgPositionRepeatType == BG_POSITION_REPEAT_TYPES_MAP.whole){
    styles_.backgroundPosition = 'top center'
    styles_.backgroundSize = '100% 100%'
  } else {
    styles_.backgroundPosition = 'top center'
    styles_.backgroundSize = 'contain'
  }
}

function getCompIdByParam(str: string) {
  let compId: string = ''
  if(str && str.length > 0){
    let arr = str.split("$")
    if(arr.length > 1){
      compId = arr[1]
    } else {
      return arr[0]
    }
  }
  return compId
}

function replaceStr(formValueMap: IFormValueMap, text: string): string {
  //正则
   /* eslint-disable */
   let compIds = text.match(/\$[^\$]+\$/g)
   let value: any
   let compId_: string
   text = text.replace(new RegExp(/\$/, 'g'), '')
   _.forEach(compIds, (compId: string) => {
     compId_ = compId.replace(/\$/g, '')
     // if(formValueMap[compId_]){
       value = formValueMap[compId_] ?  formValueMap[compId_].value : ''
       if(value){
         text = text.replace(new RegExp(compId_, 'g'), value)
       }else{
         text = text.replace(new RegExp(compId_, 'g'), '')
       }
     // }
   })
   return text
}

function getMapByArr(arr: IConstItem[]): IConstObj {
  let obj: IConstObj = {}
  let key: string | number = ''
  _.forEach(arr, (item: IConstItem) => {
    key = item.key ? item.key : item.value
    obj[key] = item.value
  })  
  return obj
}

function isJSON(str: string) : boolean {
  try {
    let obj = JSON.parse(str)
    return !!obj && typeof obj === 'object'
  } catch (e) {}
  return false
}

function isWeibo(): boolean {
  var ua = navigator.userAgent.toLowerCase()
  // @ts-ignore
  if (ua.match(/WeiBo/i) == "weibo") {
    return true
  } else {
    return false
  }
}
function isWeiXin() {
  var ua = window.navigator.userAgent.toLowerCase();
  // @ts-ignore
  if(ua.match(/MicroMessenger/i) == 'micromessenger'){
    return true
  } else {
    return false
  }
}
function isQQ() {
  let isQQ = false
  var ua = navigator.userAgent.toLowerCase()
  if(ua.indexOf(' qq') > -1 && ua.indexOf('mqqbrowser') < 0){
    //qq内置浏览器
    isQQ = true
  }
  if(ua.indexOf('mqqbrowser') > -1 && ua.indexOf(" qq") < 0){
    //qq浏览器
    isQQ = true
  }
  return isQQ
}

function getValueFromXml(text: string) {
  let xmlDoc: any
  try //Internet Explorer
  {
    xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM")
    xmlDoc.async = "false"
    xmlDoc.loadXML(text)
  } catch (e) {
    try //Firefox, Mozilla, Opera, etc.
    {
      let parser
      parser = new DOMParser()
      xmlDoc = parser.parseFromString(text, "text/xml")
    } catch (e) {
      // alert(e.message)
    }
  }
  // document.write("xmlDoc is loaded, ready for use")
  return xmlDoc.getElementsByTagName("Location")[0].childNodes[0].nodeValue
}

function randomUploadFileName(site_id: number): string{
  if(site_id){
    return _.random(100000, 99999999) + "_" + site_id
  }else{
    return _.random(100000, 99999999)
  }
}

function getRandomArrayElements(arr: number[], notSames: number[], count): number[] {
  let shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
  let min_ = min;
  let isMatch = false;
  while (i-- > min) {
      index = Math.floor((i + 1) * Math.random());
      temp = shuffled[index];
      shuffled[index] = shuffled[i];
      shuffled[i] = temp;
      if(!isMatch && notSames.indexOf(temp) != -1){
        isMatch = true;
        let newArr = _.difference(notSames, [temp]);
        shuffled = _.difference(shuffled, newArr);
        _.forEach(newArr, () => {
          i--;
          min_--;
        })
      }
  }
  return shuffled.slice(min_);
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
}