
function initRepostsEvent(baseControl: IBaseControl): any {
  let mids: string[] = []
  let lists = (baseControl.data as IRepostsControl).elements
  _.forEach(lists, (item: IRepostsItem) => {
    if(item.mid.length > 0){
      item.mid = item.mid.replace(/\s*/g,"")
      mids.push(item.mid)
    }
  })
  mids = _.uniq(mids)
  return mids
}

export {
  initRepostsEvent
}