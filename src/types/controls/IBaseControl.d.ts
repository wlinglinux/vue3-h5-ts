declare interface IBaseControl  {
  id: string                         // 组件id
  controlId: string                 // 控件ID
  name: string                       // 事件名称
  type: string                       // 事件类型
  data: IActivityInfoControl | ICustomUserControl | IFollowControl | IGeneralControl | IGeneralNumberControl | IJudgeRightWrongControl |
        ILotteryControl | IMsgControl | INumberControl | INumberDayExistControl | IPacketControl | IPraiseControl | IPushControl | 
        IRankFriendControl | IRepostControl | IRepostsControl | IStatisticDataControl | ISubmitControl | IUserControl | IVoteControl | ITimerControl     // 控件数据
}

declare interface IBaseListControl {
  elements: any[],
  oriElements?: any[],
}

