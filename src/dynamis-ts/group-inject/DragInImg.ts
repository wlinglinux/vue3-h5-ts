import { COMMON_WID_HEI } from '@/const/'
import { EventBus  } from '@/utils/'
import BaseStore from '@/components/utils/BaseStore'

export default class DragInImg extends BaseStore {
  private startPistion: { x: number, y: number } | null
  private raduisR: number
  private totalLength: number
  private currentLength: number
  private defaultRaduis: number
  private isHorizontal: boolean
  private imgItem: null | IComponent
  private img: HTMLElement | null
  constructor(item: IComponent) {
    super(item)
    //子类覆盖
    this.startPistion = { x: 0, y:0 } 
    this.raduisR = 40/COMMON_WID_HEI.adaptiveScale
    this.totalLength = 0
    this.currentLength = 0
    this.defaultRaduis = 40
    this.isHorizontal = false
    this.imgItem = null
    this.img = null
  }

  start() {
    //relateEventCompId 事件关联id clipCompId 下滑变化的图片id  delayTime 延迟时间
    // {"delayTime":1,"relateEventCompId":"2c0988fd-217f-4883-97bd-c9a3dcf57dc9","clipCompId":"b6c07b1e-e109-4bfc-8a77-e453663acfbc"}
    let clipCompId = this.item.interactionData && this.item.interactionData.injectJsClassObj.clipCompId
    if(!clipCompId){
      return
    }
    this.imgItem = this.componentMap[clipCompId]
    //这里的图片组件需要添加css clip-path 不必使用 $refs.dom.$el
    this.img = this.imgItem.interactionData.vueContainer.$el
    let startPic: IComponent
    _.forEach(this.components, (component) => {
      if(component.conAttr.width <150 &&  component.conAttr.height < 150){
        this.raduisR = component.conAttr.width/2/COMMON_WID_HEI.adaptiveScale
        startPic  = component
      }
    })

    const raduis = this.raduisR 
    const left = this.item.conAttr.left/COMMON_WID_HEI.adaptiveScale
    const top =  this.item.conAttr.top/COMMON_WID_HEI.adaptiveScale
    const itemLeft = startPic!.conAttr.left/COMMON_WID_HEI.adaptiveScale
    const itemTop = startPic!.conAttr.top/COMMON_WID_HEI.adaptiveScale
    this.startPistion!.x = left+itemLeft+raduis
    this.startPistion!.y = top+itemTop+raduis

    if(this.imgItem.conAttr.width > this.imgItem.conAttr.height*2) {
      this.isHorizontal = true
      this.totalLength = this.imgItem.conAttr.width/COMMON_WID_HEI.adaptiveScale
      this.img!.style.setProperty('clip-path',`inset(0 ${ this.totalLength }px 0 0)`)
    }else{
      this.totalLength = this.imgItem.conAttr.height/COMMON_WID_HEI.adaptiveScale
      this.img!.style.setProperty('clip-path',`inset(0 0 ${ this.totalLength }px 0)`)
    }
    this.onTouchStart = this.onTouchStart.bind(this)
    this.onTouchMove = this.onTouchMove.bind(this)
    this.onTouchEnd = this.onTouchEnd.bind(this)
    document.documentElement.addEventListener("touchstart", this.onTouchStart)
    document.documentElement.addEventListener("touchend", this.onTouchEnd)
  }

  onTouchStart(e){
    const touchPosition = {x: 0, y: 0}
    touchPosition.x = (e.touches ? e.touches[0].pageX : e.pageX)
    touchPosition.y = (e.touches ? e.touches[0].pageY : e.pageY)
    if(this.computePointIsInCircle(touchPosition,this.startPistion)){
      document.documentElement.addEventListener("touchmove", this.onTouchMove)
    }
  }

  onTouchMove(e){
    const touchX = (e.touches ? e.touches[0].pageX : e.pageX)
    const touchY = (e.touches ? e.touches[0].pageY : e.pageY)
    if(this.isHorizontal){
      this.currentLength = this.totalLength - (touchX - this.startPistion!.x )
      this.img!.style.setProperty('clip-path',`inset(0 ${this.currentLength}px 0 0)`)
    }else{
      this.currentLength = this.totalLength - (touchY - this.startPistion!.y)
      this.img!.style.setProperty('clip-path',`inset(0 0 ${ this.currentLength }px 0)`)
    }
    if(this.currentLength <= 0){
      this.emitEvent()
    }
  }

  onTouchEnd(){
    document.documentElement.removeEventListener('touchmove', this.onTouchMove)
    if( this.currentLength > 0){
      if(this.isHorizontal){
        this.img!.style.setProperty('clip-path',`inset(0 0 ${ this.totalLength }px 0)`)
      }else{
        this.img!.style.setProperty('clip-path',`inset(0 ${ this.totalLength }px 0 0)`)
      }
      return
    }
  }

  emitEvent(){
    let relateEventCompId = this.item.interactionData && this.item.interactionData.injectJsClassObj.relateEventCompId
    if(relateEventCompId){
      let relateEventCompData = this.componentMap[relateEventCompId]
      let id = relateEventCompData.id 
      let itemIndex =  relateEventCompData.itemIndex
      let delayTime = this.item.interactionData && this.item.interactionData.injectJsClassObj.delayTime
      if(!delayTime) delayTime = 0.5
      window.setTimeout(() => {
        EventBus.$emit("itemClick", {id, index: itemIndex})
      }, delayTime*1000)
    }
  }

  computePointIsInCircle(p, circle) {
    //求点到圆心的距离，用到了勾股定理
    const offsetX = p.x - circle.x
    const offsetY = p.y - circle.y
    var dis = Math.sqrt(offsetX*offsetX + offsetY*offsetY)//Math.sqrt()求平方跟
    let raduisR = this.raduisR
    if(raduisR < this.defaultRaduis){
      raduisR = this.defaultRaduis
    }
    if(dis <= raduisR){
      return true
    }
    return false
  }

  destroy(){
    super.destroy()
    this.raduisR = 0
    this.startPistion = null
    this.totalLength = 0
    this.currentLength = 0
    document.documentElement.removeEventListener("touchstart", this.onTouchStart)
    document.documentElement.removeEventListener("touchmove", this.onTouchMove)
    document.documentElement.removeEventListener("touchend", this.onTouchEnd)
    this.imgItem = null
    this.img = null
  }
}
