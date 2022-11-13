import { getPxOVwByValue, isHasOwnProperty } from '@/utils/'

function getSwiperPreStyle(commonAttr: ICommonAttr) {
  if(commonAttr.preBtnUrl && commonAttr.preBtnUrl.length > 0) {
    if(isHasOwnProperty(commonAttr, "swiperBtnWidth") && commonAttr.swiperBtnWidth) {
      return {
        backgroundImage: "url(" + commonAttr.preBtnUrl + ")",
        width: getPxOVwByValue(commonAttr.swiperBtnWidth),
        height: getPxOVwByValue(commonAttr.swiperBtnHeight),
      }
    } else {
      return {
        backgroundImage: "url(" + commonAttr.preBtnUrl + ")",
      }
    }
  }
}
function getSwiperNextStyle(commonAttr: ICommonAttr) {
  if(commonAttr.nextBtnUrl && commonAttr.nextBtnUrl.length > 0) {
    if(isHasOwnProperty(commonAttr, "swiperBtnWidth") && commonAttr.swiperBtnWidth) {
      return {
        backgroundImage: "url(" + commonAttr.nextBtnUrl + ")",
        width: getPxOVwByValue(commonAttr.swiperBtnWidth),
        height: getPxOVwByValue(commonAttr.swiperBtnHeight),
      }
    } else {
      return {
        backgroundImage: "url(" + commonAttr.nextBtnUrl + ")",
      }
    }
  }
}

function initHorizontalSwiper() {

}


export {
  getSwiperPreStyle,
  getSwiperNextStyle,
  initHorizontalSwiper,
}