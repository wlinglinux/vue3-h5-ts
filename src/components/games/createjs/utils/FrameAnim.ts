import BaseCreatejs from '@/components/games/createjs/utils/BaseCreatejs'
import { EventBus } from '@/utils/'

class FrameAnim extends BaseCreatejs {
  private frameAnimClass: any
  constructor(item: IComponent) {
    super(item)
  }

  initView() {
    let frameAnimClass = this.frameAnimClass = this.getFrameAnimClass()
    this.stagePage.addChild(frameAnimClass)
    frameAnimClass.paused = false

    EventBus.$on("playImgBounceAnim", ({isPlay}) => {
      frameAnimClass.paused = !isPlay
    })
  }

    // 1572 牛气跃龙门 {"isAutoPlay":false,"framerate":48} {"frames":[[0,0,210,404,0,-9,-1]]} 鲤鱼雪碧图是从animate cc中导出的
  getFrameAnimClass() {
    if (this.item.interactionData && this.item.interactionData.spriteSheetObj) {
      const spriteSheetObj = this.item.interactionData.spriteSheetObj
      const spriteSheet = new window.createjs.SpriteSheet({images: [this.commonAttr.spriteSheetUrl], frames: spriteSheetObj.frames})
      const sprite = new window.createjs.Sprite(spriteSheet)
      return sprite
    }
  }

  destroy() {
    if(this.frameAnimClass) {
      this.frameAnimClass.paused = true
    }
  }
}

export default FrameAnim

  