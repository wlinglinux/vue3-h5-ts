import { useControlsStore } from '@/store/controls'
import { useSiteStore } from '@/store/site'
import { CONTROL_TYPES, TIMER_TYPES_MAP } from '@/const/'
import { isHasOwnProperty } from '@/utils'

function getActivityInfoTimeBaseControl(): any {
  const useSite = useSiteStore() 
  const componentMap = useSite.componentMap
  const useControls = useControlsStore()
  const controls = useControls.controls
  const activityInfo = { isLoad: false }
  let timeBaseControl: any
  let activityBaseControl: any
  for(let compId in controls) {
    const compControls = controls[compId]
    for(let controlId in compControls) {
      let baseControl: IBaseControl = compControls[controlId]
      if(baseControl.controlId == CONTROL_TYPES.wb_activity_info) {
        activityBaseControl = baseControl
        let compData = componentMap[compId]
        _.merge(activityInfo, baseControl.data)
        _.forEach(compData.events, (event: IEvent) => {
          if(event.controlId == controlId && (event.mouseBehavior == 'load' || event.mouseBehavior == 'data' || !isHasOwnProperty(event, 'mouseBehavior'))) {
            (activityBaseControl.data as IActivityInfoControl).isLoad = true
          }
        })
      } 
      if(baseControl.controlId == CONTROL_TYPES.wb_timer) {
        if((baseControl.data as ITimerControl).type == TIMER_TYPES_MAP.activityCountdownTime) {
          timeBaseControl = baseControl
          timeBaseControl.data.compId = compId
        }
      }
    }
  }
  return { activityBaseControl, timeBaseControl }
}

export {
  getActivityInfoTimeBaseControl
}