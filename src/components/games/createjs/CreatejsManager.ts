import { RESIZE_TYPE_MAP, CREATEJS_CONSTS, CANVAS_MC_TYPES_MAP } from '@/const/'
import { isJSON } from '@/utils/'

export default class CreatejsManager {
  private item: IComponent
  private commonAttr: ICommonAttr
  private stage: any
  private canvasCon: any
  private framerate: number = 24
  private instance: any
  private canvas: any      //HTMLCanvasElement
  private canvasScaleY: number = 1
  constructor(item: IComponent) {
    this.item = item
    this.commonAttr = item.commonAttr
  }

  init(canvasCon: any, item: IComponent) {
    this.item = item
    this.commonAttr = item.commonAttr
    this.canvasCon = canvasCon

    this.createStage()
    if (this.commonAttr.itemType == CANVAS_MC_TYPES_MAP.custom) {
      // 站点 1229 非人哉拼图 // 站点 1572 牛气大PK
      this.dynamicLoadJs(this.commonAttr.customClassName)
    } else {
      const className = CREATEJS_CONSTS[this.commonAttr.itemType].className
      let obj = CREATEJS_CONSTS[this.commonAttr.itemType]
      let comp = window.AdobeAn.getComposition(obj.id)
      const lib = comp.getLibrary()
      if (lib.properties.manifest.length > 0) {
        this.loadAssets(lib, className)
      } else {
        this.onComplete(className)
      }
    }
  }

  loadAssets(lib, className) {
    let loader = new window.createjs.LoadQueue(false, "", true)
    loader.on("fileload", () => {})
    loader.on("complete", (e) => {
      this.onComplete(className, e.target)
    })
    loader.on("fileprogress", (e) => {
      console.log(e.progress * 100)
    })
    loader.on("error", (e) => {
      console.log("load error " + e)
    })

    loader.setMaxConnections(25)
    loader.loadManifest(lib.properties.manifest)
  }
  onComplete(className: string, queue?: any) {
    let obj = CREATEJS_CONSTS[this.commonAttr.itemType]
    let comp = window.AdobeAn.getComposition(obj.id)
    let lib = comp.getLibrary()
    if(queue) {
      let ss = comp.getSpriteSheet()
      let ssMetadata = lib.ssMetadata
      for (let i = 0; i < ssMetadata.length; i++) {
        ss[ssMetadata[i].name] = new window.createjs.SpriteSheet({
          "images": [queue.getResult(ssMetadata[i].name)],
          "frames": ssMetadata[i].frames
        })
      }
    }
    window.AdobeAn.compositionLoaded(lib.properties.id)
    
    this.dynamicLoadJs(className, lib)
    this.framerate = lib.properties.fps
  }

  createStage() {
    this.canvas = document.createElement("canvas")
    if (this.item.commonAttr.isCreatejs) {
      this.stage = new window.createjs.StageGL(this.canvas)
    } else {
      this.stage = new window.createjs.Stage(this.canvas)
    }
    this.stage.opacity = 0
    this.stage.autoClear = true
    this.stage.addEventListener('click', (e: Event) => {
      e.preventDefault()
      e.stopImmediatePropagation()
      e.stopPropagation()
    })
  }
  /* @vite-ignore */
  dynamicLoadJs(className: string, lib?: any) {
    import(`./utils/${className}.ts`).then((module) => {
      let injectJsClass = new module.default(this.item)
      this.instance = injectJsClass
      const params: any = {
        stage: this.stage,
        item: this.item,
      }
      if(lib) {
        params.stagePage = new lib[className]()
        params.lib = lib
      }
      injectJsClass.init(params)
      this.addClassToStage()
    })
  }

  addClassToStage() {
    let params = this.commonAttr.injectJsClassParams || this.commonAttr.params
    if(params && isJSON(params)) {
      let obj = JSON.parse(params)
      if(obj.framerate){
        this.framerate = obj.framerate
      }
    }
    this.canvasWidHei()
    while (this.canvasCon.firstChild) {
      this.canvasCon.removeChild(this.canvasCon.lastChild)
    }
    this.canvasCon.appendChild(this.canvas)
    this.addTick(window.createjs)
  }

  addTick(createjs) {
    createjs.Touch.enable(this.stage)
    window.createjs.Ticker.paused = false
    // this.stage.enableMouseOver(10)
    // this.stage.enableDOMEvents(true)
    // this.stage.mouseMoveOutside = true
    createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED //RAF_SYNCHED TIMEOUT RAF
    createjs.Ticker.framerate = this.framerate
    this.tick = this.tick.bind(this)
    createjs.Ticker.off("tick", this.tick)
    createjs.Ticker.on("tick", this.tick)
  }

  tick(event) {
    // if(this.store.state.attrs.isDisplayDebuggerText){
    //   let fps = window.createjs.Ticker.getMeasuredFPS()
    //   EventBus.$emit("displayDebuggerInfo", { text: "fps: " + parseInt(fps) })
    // }
    if (!event.paused) {
      if (this.stage) {
        this.stage.update()
      }
    }
  }

  canvasWidHei() {
    if (this.commonAttr.isFullScreen) {
      this.resizeScaleStage()
    } else {
      let w = this.commonAttr.designWidth
      let h = this.commonAttr.designHeight
      let wid = this.item.conAttr.width ///COMMON_WID_HEI.adaptiveScale
      let hei = this.item.conAttr.height ///COMMON_WID_HEI.adaptiveScale
      let iw = wid
      let ih = hei

      let pRatio = 1,
        xRatio = iw / w,
        yRatio = ih / h //window.devicePixelRatio || 
      this.canvasScaleY = pRatio * yRatio
      this.canvas.width = w * pRatio * xRatio
      this.canvas.height = h * pRatio * yRatio
      this.stage.scaleX = pRatio * xRatio
      this.stage.scaleY = pRatio * yRatio

      if (this.stage.updateViewport) {
        this.stage.updateViewport(this.canvas.width, this.canvas.height)
      }
    }
  }

  resizeScaleStage() {
    let w = this.commonAttr.designWidth
    let h = this.commonAttr.designHeight
    let iw = document.documentElement.clientWidth
    let ih = document.documentElement.clientHeight

    let pRatio = 1,
      xRatio = iw / w,
      yRatio = ih / h //window.devicePixelRatio || 

    let ratio = 1
    let type = this.commonAttr.resizeType //1 min 2 max 3  拉伸
    if (type == RESIZE_TYPE_MAP.min || type == RESIZE_TYPE_MAP.max) {
      if (type == RESIZE_TYPE_MAP.min) {
        ratio = Math.min(xRatio, yRatio)
      } else {
        ratio = Math.max(xRatio, yRatio)
      }
      this.canvasScaleY = pRatio * ratio
      this.canvas.width = w * pRatio * ratio
      this.canvas.height = h * pRatio * ratio
      this.stage.scaleX = pRatio * ratio
      this.stage.scaleY = pRatio * ratio
      this.canvas.style.width = w * ratio + 'px'
      this.canvas.style.height = h * ratio + 'px'
      this.canvas.style.margin = (document.documentElement.clientHeight - h * ratio) / 2 + 'px' + ' ' + (document.documentElement.clientWidth - w * ratio) / 2 + 'px'

    } else {
      this.canvasScaleY = pRatio * yRatio
      this.canvas.width = w * pRatio * xRatio
      this.canvas.height = h * pRatio * yRatio
      this.stage.scaleX = pRatio * xRatio
      this.stage.scaleY = pRatio * yRatio
    }
    if (this.stage.updateViewport) {
      this.stage.updateViewport(this.canvas.width, this.canvas.height)
    }
    this.stage.update()
  }
  destroy() {
    if (!window.createjs) {
      return
    }
    window.createjs.Touch.disable()
    window.createjs.Ticker.paused = true
    window.createjs.Ticker.off("tick", this.tick)
    if (this.stage) {
      if (this.instance && this.instance.destroy) {
        this.instance.destroy()
      }
      // this.stage.enableMouseOver(10)
      // this.stage.enableDOMEvents(false)
      // this.stage.mouseMoveOutside = false

      this.stage.removeAllChildren()
      this.stage.removeAllEventListeners()
    }
  }
}
