class EventShare implements IEventShare {
  public initEvents: IEvent[] = []
  public loadEvents: IEvent[] = []
  public commonFrontEvents: IEvent[] = []
  public wbEvents: IEvent[] = []
  public commonEvents: IEvent[] = []
  public wbTypes: string[] = []

  public mainControlId: string = ""
  public pageId: number = -1
  public popId: number = -1

  public isClick: boolean = true
  public isPost: boolean = true
  public eventIndex: number = 0
  public lotteryIndex: number = -1
  
  public delayShowPopParams?: any

  public loadImgNum: number = 0
  public loadedImgNum: number = 0
  public loadEventCb?: number
  public loadEventPageCb?: number

  public showPageCb?: number
  public showPopCb?: number

  public e: any
  public isSuccess: boolean = false
  public communicationData: ICommunicationData = { code: -1, msg: "", data: {}}
  public isEventPostFail: boolean = false

}

export {
  EventShare
}
