import BaseCreatejs from '@/components/games/createjs/utils/BaseCreatejs'

class VideoAnimate extends BaseCreatejs {
  private mc: any
  constructor(item: IComponent) {
    super(item)
  }

  initView() { 
    this.mc = this.stagePage
    this.addStage(this.mc)
  }
	addStage(child: any) {
		this.stagePage.removeAllChildren()
		this.stagePage.addChild(child)
		
    child.gotoAndPlay(0)
	}

	stopMc() {
		if(this.mc) {
			this.mc.stop()
		}
	}

	playMc(frame: number){
		if(this.mc){
			frame = frame ? frame : 0
			this.mc.gotoAndPlay(frame)
		}
	}

  destroy () {
    if(this.mc) {
      this.mc.stop()
      this.mc.removeAllEventListeners()
      this.mc = null
    }
  }
}

export default VideoAnimate