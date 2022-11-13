import { getCompIdByParam } from '@/utils'
import { useControlsStore } from '@/store/controls'
import { EVENT_HOVER_TYPES, CONTROL_TYPES } from '@/const/'
import { useSiteStore } from '@/store/site'
import { PAGE_TYPE } from '@/const'

class Touchmove {
  static isForbid = true
  static isFirst = true
}
function isFixIosForm() {
  const useSite = useSiteStore()
  const siteAttrs = useSite.attrs
  const currentPage = useSite.getCurrentPage
  const siteInfo = useSite.siteInfo

  if(currentPage.isForm) {
    if(siteInfo.md.isMobile && siteAttrs.pageType == PAGE_TYPE.single){
      iosFormBugFix()
    }
  }
}

let inputOnBlurCb: number = -1
function iosFormBugFix() {
  const useSite = useSiteStore()
  const siteInfo = useSite.siteInfo
  inputOnBlurCb = window.setInterval(() => {
    let inputs = document.querySelectorAll("input")
    let textareas = document.querySelectorAll("textarea")
    inputs = _.concat(Array.prototype.slice.call(inputs), Array.prototype.slice.call(textareas))
    if(inputs.length > 0){
      window.clearInterval(inputOnBlurCb)
      _.forEach(inputs, (input: HTMLInputElement) => {
        input.onblur = null
        input.onblur = () => {
          window.setTimeout( () => {
            window.scrollTo({top: 0, behavior: 'smooth'})
          }, siteInfo.reloadTime)
        }
      })
    }
  }, siteInfo.reloadTime)
}

function isForbidMove(isForbid: boolean) {
  const useSite = useSiteStore()
  const siteAttrs = useSite.attrs
  const currentPage = useSite.getCurrentPage
  Touchmove.isForbid = isForbid
  //长页或是单页中的滚动文本
  if(siteAttrs.pageType == PAGE_TYPE.long || currentPage.isDisplayTextScroller) {
    Touchmove.isFirst = false
    return
  }
  function preventEventDefault(e: MouseEvent) {
    e.stopPropagation()
    if(Touchmove.isForbid) {
      e.preventDefault()
    }
  }
  //禁止safari下拉反弹页面
  if(Touchmove.isFirst) {
    Touchmove.isFirst = false
    window.addEventListener('touchmove', preventEventDefault, { passive: false })
  }
}

function eventPostAddLoading() {
  const useSite = useSiteStore()
  const currentPage = useSite.getCurrentPage
  if(!currentPage) return
  let pageOrPopComNum = 0
  let events: any
  _.forEach(currentPage.components, (componentData: IComponent) => {
    if(componentData.cid == 52) {
      events = {}
    } else {
      events = componentData.events
    }
    _.forEach(events, (event: IEvent) => {
      if (event.isInitComp && !event.isPost) {
        if(event.type == EVENT_HOVER_TYPES.number) {
          const useControls = useControlsStore()
          const controlData = useControls.controls[componentData.id] && useControls.controls[componentData.id][CONTROL_TYPES.wb_number].data as INumberControl
          const synCompId = controlData && getCompIdByParam(controlData.syn_com_id)
          if(controlData && !synCompId) {
            pageOrPopComNum += 1
          }
          // pageOrPopComNum += 1
        } else {
          pageOrPopComNum += 1
        }
      }
    })
  })
  let isLoading: boolean = false
  if (pageOrPopComNum > 0) {
    isLoading = true
    useSite.updatePageOrPopComNum(pageOrPopComNum)
  } else {
    isLoading = false
  }
  useSite.updateLoading(isLoading)
}



export {
  isFixIosForm,
  isForbidMove,
  eventPostAddLoading
}