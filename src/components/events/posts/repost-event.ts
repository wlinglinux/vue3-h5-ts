import { CONTROL_TYPES } from '@/const/'
import { getItemBaseControl } from '@/components/utils/'
import { POST_API_MAP } from '@/service/api'


function repostEvent(item: IComponent, params: any, baseControl: IBaseControl): string {
  const controlData = baseControl.data as IRepostControl
  const elements = controlData.elements
  let index = _.random(0, elements.length - 1)
  let mid = controlData.mid
  let url = ''
  if(item.commonAttr.itemIndex >= 0) {
    index = item.commonAttr.itemIndex
    const repostsBaseControl: IBaseControl = getItemBaseControl(item.id, CONTROL_TYPES.wb_reposts)
    if (repostsBaseControl) {
      let repostsItem: IRepostsItem = (repostsBaseControl.data as IRepostsControl).elements[item.commonAttr.itemIndex]
      if (repostsItem) {
        mid = repostsItem.mid
      }
    }
  }
  const text = elements[index].text ? elements[index].text : ''
  if (mid && mid.length > 0) {
    url = POST_API_MAP.repost
    _.merge(params, { mid, text })
  }
  return url
}

export {
  repostEvent
}