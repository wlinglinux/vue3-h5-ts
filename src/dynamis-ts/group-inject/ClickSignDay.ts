import BaseStore from '@/components/utils/BaseStore'
import { EventBus } from '@/utils/'
import { getCompIdByParam } from '@/utils/'
import { COMPONENT_TYPES, CONTROL_TYPES } from '@/const/'


// 1911 每日签到与自定义数据联动 {"signDay":5,"btnCompId":"2d983526-6967-49ca-9792-b3826fecaa2e"}
export default class ClickSignDay extends BaseStore {
  private componentBtns: IComponent[]
  constructor(item: IComponent) {
    super(item)
    //子类覆盖
    this.componentBtns = []
  }

  start() {
    _.forEach(this.components, (compData) => {
      if (compData.cid == COMPONENT_TYPES.wb_btn) {
        this.componentBtns.push(compData)
      }
    })

    this.componentBtns = _.sortBy(this.componentBtns, (compData) => {
      return _.parseInt(compData.commonAttr.itemIndex)
    })

    this.refreshBtn = this.refreshBtn.bind(this)
    EventBus.$on('refreshDynamicData', this.refreshBtn)
    this.refreshBtn()
  }

  refreshBtn() {
    let relateCompId = getCompIdByParam(this.item.commonAttr.relateAttrCompId)
    if (!relateCompId) {
      return
    }
    let data = this.controls[relateCompId][CONTROL_TYPES.wb_number] && this.controls[relateCompId][CONTROL_TYPES.wb_number].data as INumberControl
    let signDays = _.parseInt(data.num)
    _.forEach(this.componentBtns, (compData, index) => {
      let isNumber = false
      if (index < signDays) {
        isNumber = false
      } else {
        isNumber = true
      }
      EventBus.$emit("refreshNumberDayExists", { compId: compData.id, isNumber })
    })
  }

  destroy() {
    super.destroy()
    this.componentBtns = []
  }
}