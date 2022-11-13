import { CONTROL_TYPES } from '@/const/'
import { useSiteStore } from '@/store/site'
import { useControlsStore } from '@/store/controls'
import { useInteractionStore } from '@/store/interaction'
import { POST_API_MAP } from '@/service/api'
import { getCompIdByParam, isHasOwnProperty, replaceStr } from '@/utils/'
import { showToast } from '@/components/utils/'

function pushEvent(item: IComponent, params: any){
  const useSite = useSiteStore()
  const useControls = useControlsStore()
  const useInteraction = useInteractionStore()
  const eventShare = item.eventShare
  const baseControl = useControls.controls[item.id][CONTROL_TYPES.wb_push]
  const controlData = baseControl.data as IPushControl
  //这个组件不发博，只是给给的组件提供索引数据
  let url: string = POST_API_MAP.push
  let pic_ids_: string[] = []
  let pic_urls: string[] = []
  let elments: IPushItem[] = controlData.elements
  let isRandomPush = controlData.isRandomPush
  let randomIndex = 0
  const relateCompId = getCompIdByParam(controlData.relateCompId)
  const relateCompData = useSite.componentMap[relateCompId]
  if (isRandomPush) {
    randomIndex = _.random(0, elments.length - 1)
    if(controlData.isGiveOther){
      //设置关联组件pushIndex rotateIndex
      if(relateCompId && relateCompData){
        relateCompData.commonAttr.itemIndex = randomIndex
      }
    }
  } else {
    if(controlData.isGetOther){
      if(relateCompData) {
        let relateAttrCompId = getCompIdByParam(item.commonAttr.relateAttrCompId)
        if(relateAttrCompId && relateAttrCompId.length > 0) {
          const relateAttrCompData = useSite.componentMap[relateAttrCompId]
          if(relateAttrCompData.lists && relateAttrCompData.lists.length > 0) {
            const vote_id: number = relateAttrCompData.lists[item.commonAttr.itemIndex].voteId as number
            randomIndex = vote_id - 1
          }
        } else if(relateCompData.commonAttr.pushIndex || relateCompData.commonAttr.itemIndex >= 0) {
          randomIndex = relateCompData.commonAttr.pushIndex || (relateCompData.commonAttr.itemIndex >= 0 ? relateCompData.commonAttr.itemIndex : 0)
        } 
      } 
    }else{
      //其他动作赋的值 比如发博设置的pushIndex 或者是这个组件的3d旋转设置的
      if(item.commonAttr.pushIndex >= 0) { // pushIndex == 0 的时候发博
        randomIndex = item.commonAttr.pushIndex
      } else {
        randomIndex = item.commonAttr.itemIndex >= 0 ? item.commonAttr.itemIndex : 0 ;
      }
    }
  }
  if(randomIndex >= elments.length) {
    randomIndex = elments.length - 1
  }
  let pushItem_: IPushItem = elments[randomIndex]
  if(pushItem_ && pushItem_.isPic){
    if (pushItem_.isRandomPic) {
      let randomPicIndex = _.random(0, pushItem_.pics.length - 1)
      let picItem = pushItem_.pics[randomPicIndex]
      if(picItem.pic_id) {
        // globalIsPost 全局控制发博是否代图
        if(!isHasOwnProperty(useSite.globalIsPost, 'isPushImg') || isHasOwnProperty(useSite.globalIsPost, 'isPushImg') && useSite.globalIsPost.isPushImg){
          pic_ids_.push(picItem.pic_id)
        }
        if(picItem.pic_url) {
          pic_urls.push(picItem.pic_url)
        }
      }
    } else {
      _.forEach(pushItem_.pics, (picItem: IPushItemPic) => {
        if(picItem.pic_id) {
          if(!isHasOwnProperty(useSite.globalIsPost, 'isPushImg') || isHasOwnProperty(useSite.globalIsPost, 'isPushImg') && useSite.globalIsPost.isPushImg){
            pic_ids_.push(picItem.pic_id)
          }
          if(picItem.pic_url) {
            pic_urls.push(picItem.pic_url)
          }
        }
      })
    }
  }
  //在前端动态图片中显示发博的图片，及发博和前端显示的图片是一样的，发博后显示图片 405
  let dynamicPicUrl: string = ''
  if (controlData.isSame) {
    dynamicPicUrl = pic_urls[0]
  } else {
    dynamicPicUrl = pushItem_ && pushItem_.url
  }
  const isHaveIsReplaceShareData: boolean = isHasOwnProperty(controlData, "isReplaceShareData")
  if (((isHaveIsReplaceShareData && controlData.isReplaceShareData) || !isHaveIsReplaceShareData)  && dynamicPicUrl) {
    let shareData = { url: dynamicPicUrl }
    useInteraction.updateShareData(shareData)
  }
  // 再一次截图的时候，是否替换 isReplace 站点2636
  let pic_ids: string = ''
  if(controlData.isReplace){
    pic_ids = pic_ids_[pic_ids_.length - 1]
  }else{
    pic_ids = pic_ids_.join()
  }
  //替换博文中的$id$为对应组件中的内容
  let text: string = replaceStr(useInteraction.formValueMap, pushItem_.text)
  if (!text){
    showToast('亲，发博内容不能为空！')
    url = ''
  }
  if (eventShare.isEventPostFail && controlData.failText && controlData.failText.length > 0) {
    text = controlData.failText
  }
  //发完博后就清除数据
  if(useInteraction.canvasImgComponentMap[item.id]){
    window.setTimeout(() => {
      pushItem_.pics = []
    }, 2000)
  }
  _.merge(params, { text, pic_ids })
  return url
}

export {
  pushEvent
}