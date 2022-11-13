import { isJSON } from '@/utils/'

function initUserEvent(baseControl: IBaseControl): any {
  const userData: IUserControl = baseControl.data as IUserControl
  //{random:true,length:5,isMember:true,pops:[3,4]}不是会员弹层3，是会员弹层4 站点2674
  let lists: IUserInfo[] = userData.elements
  const customParams = userData.customParams
  if (customParams && isJSON(customParams)) {
    let customObj = JSON.parse(customParams)
    if (customObj.random) {
      const newLists = _.shuffle(lists)
      lists = userData.elements = _.drop(newLists, newLists.length - customObj.length)
    } else if(customObj.isMember) {
      
    }
  }
  const uids: string[] = []
  _.forEach(lists, (item: IUserInfo) => {
    if (item.uid && item.uid.length > 0) {
      uids.push(item.uid)
    }
  })
  return { uids: uids.join() }
}
  

export {
  initUserEvent
}