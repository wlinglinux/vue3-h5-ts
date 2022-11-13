import BaseStore from '@/components/utils/BaseStore'
import { EventBus } from '@/utils/'
import { showPage } from '@/components/utils/'
import GroupRadios from '@/dynamis-ts/group-inject/GroupRadios'
import { COMMON_WID_HEI } from '@/const/'

const bombIcon = 'bombIcon'
const cartIcon = 'cartIcon'
const numberIcons = 'numberIcons'
const bgIcon = 'bgIcon'

interface IDropGetPoints {
  goodsUrl: string
  points: [],
  cartUrl: string,
  bgUrl: string,
  score: number,
  bombNum: number,
  bombUrl: string
  clickMoveLen: number,
  numberJsonUrl: string
  gsap: Object,
  isTick: false,
  successPageId: number,
  failPageId: number,
  factors: [],
  cartScale: number,
  numberScale: number,
  goodsScale: number,
  durations: [],
}
export default class DrawMoon extends BaseStore {
  private app: any //PIXI Application
  private container: any  //PIXI Container
  private path : any //绘制的月亮路径
  private pixiDom : any
  private initPointer : any
  private points: any
  constructor(item: IComponent) {
    super(item)
    this.initPointer = null
    this.points = []
  }

  initPixi({PIXI, app}) {
    this.app = app
    const ticker = this.app.ticker
    ticker.stop()
    this.setup(PIXI)
    ticker.add(this.ticker.bind(this))
    ticker.start()
  }

  onPointerdown(e){
    this.initPointer = this.getMousePos(e)
    
  }
  onPointerUp(e){
    if(!this.initPointer) return 
    this.onDrawLine(this.initPointer, this.getMousePos(e))
    this.path.endFill()
  }

  onPointerMove(e){
    if(!this.initPointer) return
    this.onDrawLine(this.initPointer, this.getMousePos(e))
    
  }
  
  onDrawLine(beforePoint, endPoint){
    this.path.moveTo(beforePoint.x, beforePoint.y);
    this.path.lineTo(endPoint.x, endPoint.y)
    this.initPointer = endPoint
  }

  onDrawMoon(){

  }

  getMousePos(event){
    const pos = { x: 0, y: 0 };
    if (this.pixiDom) {
      // Get the position and size of the component on the page.
      const holderOffset = this.pixiDom.getBoundingClientRect();
      pos.x = event.pageX - holderOffset.x;
      pos.y = event.pageY - holderOffset.y;
    }
    pos.x = pos.x  *   COMMON_WID_HEI.adaptiveScale
    pos.y = pos.y  * COMMON_WID_HEI.adaptiveScale
    return pos;
  };
  

  initContainer(PIXI: any) {
    const container = this.container = new PIXI.Container()
    this.app.stage.addChild(container)
  }

  setup(PIXI: any) {
    this.initContainer(PIXI)
    this.path = new PIXI.Graphics()
    this.container.addChild(this.path)
    this.path.lineStyle(2, 0xff0000, 1)
    this.path.beginFill(0xff0000,1)
    // 闭合曲线
    this.pixiDom = document.getElementsByClassName('wb-pixis')[0]
    this.pixiDom.addEventListener('pointerdown',this.onPointerdown.bind(this))
    this.pixiDom.addEventListener('pointermove',this.onPointerMove.bind(this))
    this.pixiDom.addEventListener('pointerup',this.onPointerUp.bind(this))
  }

  ticker() {
  }

  destroy() {
    this.app = null
    this.container = null
  }
}