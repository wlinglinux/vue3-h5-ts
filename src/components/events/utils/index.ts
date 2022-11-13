import { WB_LISTS_CONTROL_ID } from '@/const/'

function getMainListEventByEvents(events: IEventMap): IEvent {
  let event_: IEvent | any
  let tempArr: IEvent[] = []
  _.forEach(events, (event: IEvent) => {
    if(event.controlId && event.controlId.length > 0 && WB_LISTS_CONTROL_ID.indexOf(event.controlId) != -1) {
      tempArr.push(event)
    }
  })
  if(tempArr.length > 0){
    tempArr = _.sortBy(tempArr, (event: IEvent) => { return event.index; })
    event_ = tempArr[0]
    //主事件是组件的第一个事件，是wblist值， controlId是组件的主事件id
  }
  return event_
}


function getMainWbDataEventByEvents(events: IEventMap) : IEvent {
  let event_: IEvent | any
  let tempArr: IEvent[] = []
  _.forEach(events, (event: IEvent) => {
    if(event.controlId && event.controlId.length > 0){
      tempArr.push(event)
    }
  })
  if(tempArr.length > 0){
    tempArr = _.sortBy(tempArr, (event: IEvent) => { return event.index; })
    event_ = tempArr[0]
    //主事件是组件的第一个事件，是wblist值， controlId是组件的主事件id
  }
  return event_
}

export {
  getMainListEventByEvents,
  getMainWbDataEventByEvents,
}