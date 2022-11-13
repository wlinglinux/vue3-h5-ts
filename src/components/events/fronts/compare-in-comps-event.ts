import { COMPONENT_TYPES, CONTROL_TYPES, COMPARE_FORM ,INJECT_GROUP_CLASS_NAME_MAP} from '@/const'
import { getCompIdByParam, isHasOwnProperty } from '@/utils/'
import { showPop, showPage, showToast} from '@/components/utils'
import { resetSubmitStatus } from '@/components/utils/'
import { useSiteStore } from '@/store/site'
import { useInteractionStore } from '@/store/interaction'
import { useControlsStore } from '@/store/controls'
import { useActivityStore } from '@/store/activity'

function compareInCompsEvent(item: IComponent, event: IEvent) {
  //compareCompId 符号是-
  //compareInComps: [{"compId":"","compareCompId":"","compareRule":">10000"}]
  const useSite = useSiteStore()
  const componentMap = useSite.componentMap
  const useInteraction = useInteractionStore()
  const useControls = useControlsStore()
  const useActivity = useActivityStore()
  const compDataStr = event.comps[0].attrs.value
  let isContinue: boolean = true
  let isShowPop: boolean = true
  let msg: string = ''
  let hint: string = ''
  let compDataJson: any
  if(compDataStr && compDataStr.length > 0) {
    compDataJson = JSON.parse(compDataStr)
    hint = compDataJson.hint
    const compId = getCompIdByParam(compDataJson.compId) || compDataJson.compId
    const compData = componentMap[compId]
    const compareCompId = getCompIdByParam(compDataJson.compareCompId) || compDataJson.compareCompId
    const compareCompData = componentMap[compareCompId]
    const compareCompIds = compDataJson.compareCompIds && compDataJson.compareCompIds.split(",")
    if(compareCompIds && compareCompIds.length > 0) {
      //1990
      let compareCompData: IComponent
      let compareId: string = ''
      for(let i = 0, len = compareCompIds.length; i < len; i++) {
        compareId = compareCompIds[i]
        compareCompData = componentMap[compareId]
        // 站点2476 截图数据校验
        if(compareCompData && compareCompData.cid == COMPONENT_TYPES.wb_camera) {
          if(!compareCompData.commonAttr.cropUploadImgUrl) {
            isContinue = false
            msg = "亲，你还有没有选的哦！！！"
            break
          }
        } else if (compareCompData && !useInteraction.formValueMap[compareCompData.id]
          || !useInteraction.formValueMap[compareCompData.id].value
          || useInteraction.formValueMap[compareCompData.id].value == compareCompData.commonAttr.placeholder
          ) {
            isContinue = false
            msg = "亲，你还有没有选的哦！！！"
            break
          }
      }
    } else if(compareCompData && compareCompData.events.user && compareCompData.events.numberDayExists) {
      //会员与非会员 不同弹层 点击后 弹出另一个弹层 2674
      const numberDayExistBaseControlData = useControls.controls[compareCompId][compareCompData.events.numberDayExists.controlId]
      const numberDayExistControlData = (numberDayExistBaseControlData.data as INumberDayExistControl)
      if(numberDayExistControlData.isGlobal && !numberDayExistControlData.isNumber) {
        const popId = compDataJson.popId
        if(popId > 0) {
          isShowPop = true
        } else {
          isShowPop = false
        }
        isContinue = false
      }
    } else if(compData && compData.events.number && compareCompData && compareCompData.events.number) {
      const numberControlData = useControls.controls[compId][CONTROL_TYPES.wb_number]
      const numberMinusControlData = useControls.controls[compareCompId][CONTROL_TYPES.wb_number]
      let compareResult = compareInCompsIsContinue(item,numberControlData, numberMinusControlData, hint)
      isContinue = compareResult.isContinue
      msg = compareResult.msg
    } else if(compareCompData && compareCompData.events.number) {
      const numberMinusControlData = useControls.controls[compareCompId][CONTROL_TYPES.wb_number]
      // numberMinusControlData.data.num = 0
      if((numberMinusControlData.data as INumberControl).num <= 0) {
        isContinue = false
      }
    } else if(compareCompData && compareCompData.cid == COMPONENT_TYPES.wb_calendar) {
      //连续签到几天才能抽奖 {"signDay":1,"btnCompId":"05c6a3f2-3f7d-40c6-b286-2512c6aa98e0"}
      const voteBaseControl = useControls.controls[compareCompId][CONTROL_TYPES.wb_vote]
      const voteControlData = voteBaseControl.data as IVoteControl
      const interactionData = compareCompData.interactionData
      let voteCount = 0
      _.forEach(voteControlData.elements, (vote: IVoteMapItem) => {
        if(vote.num > 0) {
          voteCount++
        }
      })
      if(interactionData.signDay && voteCount < interactionData.signDay) {
        isContinue = false
        msg = "亲，签到天数不够！！！"
      }
    } else if(compareCompData && compareCompData.events.timer) {
      let end: number = 0
      let start: number = 0
      let now: number = 0
      const timerBaseControl = useControls.controls[compareCompId][CONTROL_TYPES.wb_timer]
      const timerControlData = timerBaseControl.data as ITimerControl
      if(timerControlData.time && timerControlData.time.length > 0) {
        start = new Date(timerControlData.time).getTime()
        end = new Date(timerControlData.endTime).getTime()
        now = new Date().getTime()
      }
      let startTime: number = 0
      let endTime: number = 0
      startTime = now - start
      endTime = end - now
      if(startTime < 0) {
        isContinue = false
        msg = "亲，活动还未开始！！请耐心等待！！"
      } else if(endTime < 0) {
        isContinue = false
        msg = "亲， 活动已结束了哦！！"
      }
    } else if(compareCompData && compareCompData.commonAttr.injectJsClass && compareCompData.commonAttr.injectJsClass ==  INJECT_GROUP_CLASS_NAME_MAP.CheckBox){
      isContinue = checkFormCheckboxValue(compareCompData.id,compDataJson).isContinue
      msg = checkFormCheckboxValue(compareCompData.id,compDataJson).msg
    } else if(compareCompData && COMPARE_FORM.indexOf(compareCompData.cid) != -1 || compData && COMPARE_FORM.indexOf(compData.cid) != -1) {
      let compareCompId = compareCompData.id
      if(isHasOwnProperty(item.interactionData, 'isInGroupCarousel') && item.interactionData.isInGroupCarousel) {
        const idIndexs = item.id.split('_')
        compareCompId = compareCompId + '_' + idIndexs[1] + '_' + compareCompData.commonAttr.qIndex
      }
      let formResultCompareComp = useInteraction.formValueMap[compareCompId]
      if(!formResultCompareComp || compData && !useInteraction.formValueMap[compData.id] || _.parseInt(formResultCompareComp.value) < 0 || formResultCompareComp.value && formResultCompareComp.value.length == 0) {
        isContinue = false
        msg = "亲，你还有没有选的哦！！！"
      }
    } else if(compareCompData.cid == COMPONENT_TYPES.wb_camera) {
      if(!compareCompData.commonAttr.cropUploadImgUrl) {
        isContinue = false
        msg = "亲，你还没有从相册中选择图片哦！！！"
      }
      if(compareCompData.commonAttr.isPoster) {
        if(!compareCompData.commonAttr.isAddPoster) {
          isContinue = false
          msg = "亲，你还没有选择贴纸哦！！"
        }
      }
    } else if(compareCompData.cid == COMPONENT_TYPES.wb_scroll_container || compareCompData.cid == COMPONENT_TYPES.wb_pixis) {
      // 设置最小值或是最大值
      let min = compDataJson.min ? compDataJson.min : 3
      if(!useInteraction.formValueMap[compareCompData.id] || useInteraction.formValueMap[compareCompData.id].selecteds!.length < min) {
        isContinue = false
        msg = "亲，再选择几个呗！！！"
      }
      if(compDataJson.max) {
        if(!useInteraction.formValueMap[compareCompData.id] || useInteraction.formValueMap[compareCompData.id].selecteds!.length >= compDataJson.max) {
          isContinue = false
          msg = `亲,最多只能选择${ compDataJson.max }个！！！`
        }
      }
    } else if(compareCompData.cid == COMPONENT_TYPES.wb_text) {
      if(compareCompData.commonAttr.isEdit) {
        if(!useInteraction.formValueMap[compareCompData.id] || useInteraction.formValueMap[compareCompData.id].value == compareCompData.commonAttr.placeholder) {
          isContinue = false
          msg = compareCompData.commonAttr.placeholder
        }
      } else {
        let dataKey = compareCompData.commonAttr.dataKey
        if(dataKey) {
          let num = parseInt(useInteraction.formValueMap[compareCompData.id].value )
          let rule = compDataJson.compareRule
          let symbols = rule.split(',')
          if(symbols[0] == '>=') {
            if(num >= parseInt(symbols[1])) {
              isContinue = true
            } else{
              isContinue = false
              msg = "亲，您的数量不够哦！！！"
            }
          }
        }
      }
    } else if(compareCompData && compareCompData.events.interactionData) {
      if(compareCompData.interactionData.card) {
        //每一项都大于0, 每个卡片持有一个就可以合成了 站点1372 this.interactionData.card
        const card = useInteraction.shareInteractionData.card
        let total = 0
        let length = 0
        _.forEach(card, (num: number) => {
          length++
          if(num > 0) {
            total += 1
          }
        })
        isContinue = total >= length ? true : false
        if(!isContinue) {
          msg = "亲，还不能合成，去收集全在来吧！！！"
        }
      } else if(compareCompData.interactionData.puzzle) {
        //this.interactionData.puzzle
        let puzzle = useInteraction.shareInteractionData.puzzle
        let matchLength = compareCompData.interactionData.matchLength
        let team_one = _.dropRight(puzzle, matchLength)
        let team_two = _.drop(puzzle, matchLength)
        let isOne = false
        let isTwo = false
        for(let i = 0, len = team_one.length; i < len; i++) {
          let one = parseInt(team_one[i])
          let two = parseInt(team_two[i])
          if(one == 1) {
            isOne = true
          }
          if(two == 1) {
            isTwo = true
          }
        }
        if(isOne && isTwo) {
          isContinue = true
        } else {
          isContinue = false
        }
        if(!isContinue) {
          msg = "亲，还不能翻牌，去收集全在来吧！！！"
        }
      }
    } else {
      //1471 新年宫气妆
      if(!useInteraction.formValueMap[compareCompData.id] || compData && !useInteraction.formValueMap[compData.id]) {
        isContinue = false
        msg = "亲，你还有没有选的哦！！！"
      }
    }
  }

  if(!isContinue) {
    if(hint) {
      msg = hint
    }
    const popId = compDataJson && compDataJson.popId
    const pageId = compDataJson && compDataJson.pageId
    if(isShowPop && popId) {
      showPop(popId)
    }
    if(pageId) {
      showPage(pageId, item)
    }
    if(msg) {
      showToast(msg)
    }
  }
  //抽奖如果没有抽奖次数了，显示弹出是抽奖失败的弹层，但是文本是自定义的，如果没有自定义的文本就提示 亲，没有抽奖次数了！！
  return isContinue
}

function compareInCompsIsContinue(item: IComponent, numberBaseControl: IBaseControl, numberMinusBaseControl: IBaseControl, hint: string) {
  let isContinue = true
  let msg = ''
  const numberControlData = numberBaseControl.data as INumberControl
  const numberMinusControlData = numberMinusBaseControl.data as INumberControl
  if (numberMinusBaseControl && numberBaseControl && numberControlData.isUid) {
    if(numberMinusControlData.onceGrowValue < 0 || numberMinusControlData.op == '-') {
      const num: number = numberControlData.num
      const onceGrowValue: number = numberMinusControlData.onceGrowValue
      if (num - Math.abs(onceGrowValue) < 0) {
        msg = "亲，没有次数了！！！"
        if(hint) {
          msg = hint
        }
        resetSubmitStatus(item.eventShare)
        isContinue = false
      }
    }
  }
  return { isContinue , msg }
}

function checkFormCheckboxValue(id: string, compDataJson: any){
  const useInteraction = useInteractionStore()
  let isContinue = true
  let msg = ''
  if(!useInteraction.formValueMap[id]) {
    isContinue = false
    msg = "亲，你还有没有选的哦！！！"
    return {isContinue,msg}
  }
  if(compDataJson.min) {
    if(useInteraction.formValueMap[id].selecteds!.length < compDataJson.min) {
      isContinue = false
      msg = "亲，再选择几个呗！！！"
    }
  }
  if(compDataJson.max) {
    if(useInteraction.formValueMap[id].selecteds!.length > compDataJson.max) {
      isContinue = false
      msg = `亲,最多只能选择${ compDataJson.max }个！！！`
    }
  }
  return {isContinue,msg}
}

export {
  compareInCompsEvent
}
