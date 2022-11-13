import { Toast } from 'vant'
import { showPop } from '@/components/utils/'
import BaseStore from '@/components/utils/BaseStore'

export default class BaseCreatejs extends BaseStore {
  protected stage: any //window.createjs.Stage
  protected stagePage: any //window.createjs.Container
  protected lib: any
  constructor(item: IComponent) {
    super(item)
    this.item = item
    this.commonAttr = item.commonAttr
  }
  init({ stage, item, stagePage, lib }) {
    this.stage = stage
    this.item = item
    if (stagePage) {
      this.stagePage = stagePage
    } else {
      this.stagePage = new window.createjs.Container()
    }
    this.lib = lib
    this.commonAttr = this.item.commonAttr
    this.initView()
    this.stage.addChild(this.stagePage)
  }

  initView() {}

  showToast(msg: string) {
    if (_.trim(msg)) {
      Toast(msg)
    }
  }
  public showPop(popId: number) {
    showPop(popId)
  }

  destroy() {
    this.stage = null
    this.stagePage = null
    this.lib = null
  }
}
