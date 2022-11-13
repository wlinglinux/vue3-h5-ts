import { COMPONENT_TYPES } from '@/const/';
import { useSiteStore } from '@/store/site'
import { getPxOVwByValue, bgPositionStyle, isHasOwnProperty, remUnit } from '@/utils/'

function getListItemConStyle(item: IComponent): any {
  const commonAttr = item.commonAttr
  const styles_: any = {}
  if(commonAttr.bgUrl && commonAttr.bgUrl.length > 0) {
    styles_.backgroundImage = 'url(' +  commonAttr.bgUrl + ')'
    bgPositionStyle(styles_, item.commonAttr.bgPositionRepeatType)

    if(commonAttr.width && commonAttr.height > 0) {
      styles_.width = getPxOVwByValue(commonAttr.width)
      styles_.height = getPxOVwByValue(commonAttr.height)
    }
  } else if(commonAttr.backgroundColor && commonAttr.backgroundColor.length > 0) {
    styles_.backgroundColor = commonAttr.backgroundColor
  }
  setNewMarginPadding(commonAttr, styles_)
  if(commonAttr.borderStyle && commonAttr.borderSize > 0) {
    styles_.border = getPxOVwByValue(commonAttr.borderSize) + ' ' +  commonAttr.borderStyle + ' ' + commonAttr.borderColor
  } else {
    styles_.border = "none"
  }
  return styles_
}

function setNewPadding(commonAttr: ICommonAttr, styles_: any) {
  if(commonAttr.padding) {
    const paddingAttr = commonAttr.padding.split(' ')
    styles_.padding = getPxOVwByValue(paddingAttr[0]) + ' ' + getPxOVwByValue(paddingAttr[1]) + ' ' + getPxOVwByValue(paddingAttr[2]) + ' ' + getPxOVwByValue(paddingAttr[3])
  }
}
function setNewMargin(commonAttr: ICommonAttr, styles_: any) {
  if(commonAttr.margin) {
    const marginAttr = commonAttr.margin.split(' ')
    styles_.margin = getPxOVwByValue(marginAttr[0]) + ' ' + getPxOVwByValue(marginAttr[1]) + ' ' + getPxOVwByValue(marginAttr[2]) + ' ' + getPxOVwByValue(marginAttr[3])
  }
}

function setNewMarginPadding(commonAttr: ICommonAttr, styles_: any) {
  setNewPadding(commonAttr, styles_)
  setNewMargin(commonAttr, styles_)
}

function btnStyle(item: IComponent): any  {
  if(!item) return
  const styles_: any = getCompStyle(item)
  const commonAttr = item.commonAttr
  if(commonAttr.btnPosition && commonAttr.btnPosition.length > 0) {
    let btnPosition = commonAttr.btnPosition.split(',')
    if(btnPosition.length > 0 && btnPosition[0]) {
      styles_.position = "absolute"
      styles_.left = getPxOVwByValue(btnPosition[0])
      styles_.top = getPxOVwByValue(btnPosition[1])
    }
  }
  return styles_
}


function getCompStyle(item: IComponent): any {
  const useSite = useSiteStore()
  const commonAttr = item.commonAttr
  const styles_: any = item.styles ? item.styles : {}
  setNewMarginPadding(commonAttr, styles_)
  if(commonAttr.width > 0) {
    styles_.width = getPxOVwByValue(commonAttr.width)
  }
  if(commonAttr.height > 0) {
    styles_.height = getPxOVwByValue(commonAttr.height)
  }
  fontStyle(commonAttr, styles_, item)
  if(isHasOwnProperty(commonAttr, 'opacity')) {
    styles_.opacity = commonAttr.opacity
  }
  if(isHasOwnProperty(commonAttr, 'backgroundColor')) {
    styles_.backgroundColor = commonAttr.backgroundColor
  }
  if(isHasOwnProperty(commonAttr, 'borderRadius') && commonAttr.borderRadius > 0) {
    styles_.borderRadius = getPxOVwByValue(commonAttr.borderRadius)
  }
  if(item.interactionData && isHasOwnProperty(item.interactionData, 'isSelected') && item.interactionData.isSelected) {
    styles_.border = 'none'
  } else {
    if(commonAttr.borderStyle && commonAttr.borderSize) {
      styles_.border = getPxOVwByValue(commonAttr.borderSize) + ' ' +  commonAttr.borderStyle + ' ' + commonAttr.borderColor
    } else {
      styles_.border = "none"
    }
  }

  let isSetBgUrl = true
  if(!useSite.isH5Edit && item.cid == COMPONENT_TYPES.wb_btn) {
    isSetBgUrl = false
  }
  if(isSetBgUrl) {
    const bgUrl = commonAttr.bgUrl
    if(bgUrl && bgUrl.length > 0) {
      styles_.backgroundImage = 'url(' + bgUrl + ')'
      bgPositionStyle(styles_, 0)
    }
  }

  if(commonAttr.customFontStyle) {
    const arr = commonAttr.customFontStyle.split(",")
    const fontFamily = arr[0]
    const fontUrl = arr[1]
    styles_.fontFamily = fontFamily
    const fontStyle = `@font-face {
      font-family: '${fontFamily}';
      src: url('${fontUrl}') format('opentype');
    }`
    loadStyleString(fontStyle)
  }
  if(commonAttr.isVertical) {
    styles_.writingMode = "lr-tb"
  }
  const customCssStr = commonAttr.customCssStr
  if(customCssStr && customCssStr.length > 0) {
    convertCustomCss(styles_, customCssStr)
  }
  // const customClassStyle = commonAttr.customClassStr
  // if(customClassStyle && customClassStyle.length > 0) {
  //   loadStyleString(customClassStyle)
  // }
  if(item.commonAttr.isFullScreen && item.commonAttr.objectFit){
    styles_.objectFit = item.commonAttr.objectFit;
  }
  
  if(item.cid == COMPONENT_TYPES.wb_img && useSite.attrs.isNotSaveImg && !commonAttr.isSaveImg) {
    styles_['pointer-events'] = 'none'
    styles_[' -webkit-user-select'] = 'none'
  }
  return styles_
}

function imgStyle(item: IComponent): any {
  let styles_: any = {}
  let commonAttr = item.commonAttr
  if(commonAttr.width > 0){
    styles_.width = 'auto'
    styles_.height = getPxOVwByValue(commonAttr.height)
  } else {
    styles_.width = "100%"
    styles_.objectFit = "contain"
  }
  if(commonAttr.borderSize) {
    let borderStyle = commonAttr.borderStyle ? commonAttr.borderStyle : 'none'
    if(commonAttr.borderStyle && commonAttr.borderStyle != "none") {
      styles_.border = getPxOVwByValue(commonAttr.borderSize) + ' ' +  borderStyle + ' ' + commonAttr.borderColor
    }else{
      styles_.border = "none"
    }
  }
  if(commonAttr.borderRadius) {
    styles_.borderRadius = commonAttr.borderRadius
  }
  return styles_
}

function itemStyle(item: IComponent) {
  const commonAttr = item.commonAttr
  let styles_: any = {}
  const styles: any = getCompStyle(item)
  fontStyle(commonAttr, styles_)
  return styles_
}

function processBorderStyle(item: IComponent){
  const commonAttr = item.commonAttr
  const styles_: any = {}
  setNewMarginPadding(commonAttr, styles_)

  if(commonAttr.url && commonAttr.url.length > 0){
    styles_.backgroundImage = 'url(' + commonAttr.url + ')'
    styles_.backgroundRepeat = 'no-repeat'
    styles_.backgroundSize = 'cover'
    styles_.border = 'none'
  } else {
    styles_.border = getPxOVwByValue(commonAttr.borderSize) + ' ' +  commonAttr.borderStyle + ' ' + commonAttr.borderColor
    styles_.borderRadius = commonAttr.borderRadius
    styles_.backgroundColor = commonAttr.borderBgColor
  }
  return styles_;
}

function fontStyle(commonAttr: ICommonAttr, styles_: any, item: IComponent | any = null): any  {
  if(isHasOwnProperty(commonAttr, 'fontSize') && commonAttr.fontSize > 0) {
    styles_.fontSize = getPxOVwByValue(commonAttr.fontSize)
  }
  if(isHasOwnProperty(commonAttr, 'fontFamily')) {
    styles_.fontFamily = commonAttr.fontFamily
  }
  if(item && item.interactionData && item.cid == COMPONENT_TYPES.wb_btn && isHasOwnProperty(item.interactionData, 'isSelected') && item.interactionData.isSelected) {
    //btn 
  } else {
    if(isHasOwnProperty(commonAttr, 'color')) {
      styles_.color = commonAttr.color
    }
  }
  if(isHasOwnProperty(commonAttr, 'fontWeight') && commonAttr.fontWeight > 0){
    styles_.fontWeight = commonAttr.fontWeight
  }
  if(isHasOwnProperty(commonAttr, 'fontStyle')) {
    styles_.fontStyle = commonAttr.fontStyle
  }
  if(isHasOwnProperty(commonAttr, 'textAlign')) {
    styles_.textAlign = commonAttr.textAlign
  }
  if(isHasOwnProperty(commonAttr, 'fontWeight')) {
    styles_.fontWeight = commonAttr.fontWeight
  }
  if(isHasOwnProperty(commonAttr, 'textDecoration')) {
    styles_.textDecoration = commonAttr.textDecoration
  }
  if(isHasOwnProperty(commonAttr, 'lineHeight') && commonAttr.lineHeight > 0) {
    styles_.lineHeight = commonAttr.lineHeight
  }
  if(isHasOwnProperty(commonAttr, 'letterSpacing') && commonAttr.letterSpacing > 0) {
    styles_.letterSpacing = getPxOVwByValue(commonAttr.letterSpacing)
  }
  return styles_
}


function getTextStyle(item: IComponent): any {
  const commonAttr = item.commonAttr
  const styles_: any = {}
  fontStyle(commonAttr, styles_)
  const lineNum = commonAttr.lineNum
  const lineHeight = commonAttr.lineHeight
  const fontSize = commonAttr.fontSize * 0.8
  styles_.fontSize = getPxOVwByValue(fontSize)
  const textHeight = fontSize*lineHeight*lineNum

  styles_['-webkit-line-clamp'] = lineNum
  styles_.minHeight = getPxOVwByValue(textHeight)
  return styles_
}

function convertCustomCss(styles_: any, customCssStr: string) {
  const cssArr = convertCss(customCssStr).split(";")
  let keyValueArr: string[] = []
  let key: string
  _.forEach(cssArr, (keyValue: string) => {
    keyValueArr = keyValue.split(":")
    key = keyValueArr[0].replace(/[\r\n]/g,"")
    styles_[key] = keyValueArr[1]
  })
}

function convertCss(cssStr: string) {
  return cssStr.replace(/\d+px/g, function(a) {
    let num: number = Number(parseFloat(a).toFixed(0))
    let xx: number = num % 2 + num
    let b: string =  (xx / remUnit).toString()
    return "string" == typeof a && a.match(/px$/) && (b += "vw"),b
  });
}

// 动态加载css脚本
function loadStyleString(cssText: string) {
  const style: any = document.createElement("style")
  style.type = "text/css"
  try{
    // firefox、safari、chrome和Opera
    style.appendChild(document.createTextNode(cssText))
  }catch(ex) {
    // IE早期的浏览器 ,需要使用style元素的stylesheet属性的cssText属性
    style.styleSheet.cssText = cssText;
  }
  document.getElementsByTagName("head")[0].appendChild(style)
}

function getSpritesheetStyle(spriteSheetObj: ISpriteSheet) {
  const spriteSheetStyles_ = {
    width: '',
    height: '',
    background: '',
    backgroundPosition: '',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '',
    animation: '',
  }
  spriteSheetStyles_.width = getPxOVwByValue(spriteSheetObj.width)
  spriteSheetStyles_.height = getPxOVwByValue(spriteSheetObj.height)
  spriteSheetStyles_.background = `url(${spriteSheetObj.url})`
  const currentStep = spriteSheetObj.currentStep > spriteSheetObj.steps ? spriteSheetObj.steps : spriteSheetObj.currentStep
  spriteSheetStyles_.backgroundPosition = `${getPxOVwByValue(-currentStep*spriteSheetObj.width)} 0`
  spriteSheetStyles_.backgroundSize = `${getPxOVwByValue(spriteSheetObj.width*spriteSheetObj.steps)} ${getPxOVwByValue(spriteSheetObj.height)}`
  if(isHasOwnProperty(spriteSheetObj, "scale")) {
    spriteSheetStyles_['transform-origin'] = 'center center'
    spriteSheetStyles_['transform'] = 'scale(' + spriteSheetObj.scale + ')'
    // dom.style['overflow'] = 'hidden';
  }
  return spriteSheetStyles_
}

export {
  getCompStyle,
  getListItemConStyle,
  itemStyle,
  imgStyle,
  fontStyle,
  getTextStyle,
  processBorderStyle,
  convertCss,
  setNewMarginPadding,
  setNewPadding,
  setNewMargin,
  btnStyle,
  getSpritesheetStyle
}