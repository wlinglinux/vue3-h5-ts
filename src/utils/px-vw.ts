import { H5_TYPE } from '@/const/'
import { useSiteStore } from '@/store/site'

const remUnit: number = 7.5

const pxTovw = (a: string | number) => {
  const siteStore = useSiteStore()
  const siteInfo = siteStore.siteInfo
  const siteAttrs = siteStore.attrs
  const isH5Edit = siteStore.isH5Edit
  if(isH5Edit || !siteInfo.md.isMobile || siteAttrs.h5Type == H5_TYPE.pc || siteAttrs.h5Type == H5_TYPE.canvas){
    return a
  } else {
    let num: number = parseInt(Number(a).toFixed(0));
    let oddToEven: number = num % 2 + num;
    let b: string = (oddToEven/remUnit).toString();
    return "string" == typeof a && a.match(/px$/) && (b += "vw"),b
  }
}

const getPxOrVw = () => {
  const siteStore = useSiteStore()
  const siteInfo = siteStore.siteInfo
  const siteAttrs = siteStore.attrs
  const isH5Edit = siteStore.isH5Edit

  let unit = ''
  if(isH5Edit || !siteInfo.md.isMobile || siteAttrs.h5Type == H5_TYPE.pc || siteAttrs.h5Type == H5_TYPE.canvas){
    unit = 'px'
  }else{
    unit = 'vw'
  }
  return unit
}

const getPxOVwByValue = (value: number | string) => {
  const siteStore = useSiteStore()
  const siteInfo = siteStore.siteInfo
  const siteAttrs = siteStore.attrs
  const isH5Edit = siteStore.isH5Edit
  let unit = ''
  if(isH5Edit || !siteInfo.md.isMobile || siteAttrs.h5Type == H5_TYPE.pc || siteAttrs.h5Type == H5_TYPE.canvas){
    unit = value + 'px'
  }else{
    unit = pxTovw(value) + 'vw'
  }
  return unit
}

export {
  getPxOVwByValue,
  pxTovw,
  getPxOrVw,
  remUnit
}