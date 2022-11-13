
function initVoteEvent(baseControl: IBaseControl): any {
  const vote_ids: string[] = []
  const voteData: IVoteControl = baseControl.data as IVoteControl
  _.forEach(voteData.elements, (item: IVoteMapItem, key: string) => {
    vote_ids.push(key)
  })
  return { vote_ids: vote_ids.join() }
}


export{
  initVoteEvent
}