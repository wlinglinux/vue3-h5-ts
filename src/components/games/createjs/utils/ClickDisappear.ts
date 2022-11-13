import BaseCreatejs from '@/components/games/createjs/utils/BaseCreatejs'
import { CONTROL_TYPES } from '@/const/'
import { Toast } from 'vant'
import { getCompIdByParam, isJSON, EventBus } from '@/utils/'

declare interface IClickDisappear {
  row: number
  col: number
  width: number
  height: number
  url: string
  clickIconUrl: string
  time: number
}
export default class ClickDisappear extends BaseCreatejs {
    // 1229 {"row":6,"col":4,"width":131,"height":139,"url":"https://static.hd.xxx.com/upload/biz/1/41705193.png","clickIconUrl":"https://static.hd.xxx.com/upload/biz/1/3013516.png"}
  private injectJsClassObj: IClickDisappear = { row: 0, col: 0, width: 0, height: 0, time: 0, url: '', clickIconUrl: ''}
  private map: any = [] //[][] number
  private tiles: any[] = []
  private img?: HTMLImageElement
  private bitmaps: any[] = []
  private isImgLoaded: boolean = false
  private isPosted: boolean = false
  private isTweening: boolean = true
  constructor(item: IComponent) {
    super(item)
    //子类覆盖
  }

  initView() {
    let params = this.item.commonAttr.params
    if (params && isJSON(params)) {
      this.injectJsClassObj = JSON.parse(params)
    }
    //子类覆盖
    if (this.injectJsClassObj) {
			let row = this.injectJsClassObj.row
			let col = this.injectJsClassObj.col
      let index = 1
      for (let i = 0; i < row; i++) {
        this.map[i] = []
        for (let j = 0; j < col; j++) {
          this.map[i][j] = index
          index++
        }
      }

      const clickIconImg = new Image()
      clickIconImg.src = this.injectJsClassObj.clickIconUrl
      clickIconImg.crossOrigin = "Anonymous"

      this.img = new Image()
      this.img.crossOrigin = "Anonymous"
      this.img.onload = (e) => {
        this.isImgLoaded = true
        this.refreshPuzzle(clickIconImg)
      }
      this.img.src = this.injectJsClassObj.url

      EventBus.$on('refreshPuzzle', () => {
        this.isPosted = true
        this.refreshPuzzle(clickIconImg)
      });
    }
  }

  refreshPuzzle(loadedImg: HTMLImageElement) {
    //每个块的数据
    let puzzle = this.item.interactionData.puzzle;
    if(puzzle){
      if(this.isImgLoaded && (this.isPosted || puzzle)) {
        this.addTile(loadedImg, puzzle)
      }
    }
  }

  addTile(bitImg: HTMLImageElement, puzzle: any) {
		// const row: number = this.injectJsClassObj.row
		// const col: number = this.injectJsClassObj.col
		const spriteWidth: number = this.injectJsClassObj.width
    const spriteHeight: number = this.injectJsClassObj.height

		const ss = new window.createjs.SpriteSheet({
			images: [this.img],
			frames: {
				width: spriteWidth,
				height: spriteHeight,
				regX: spriteWidth / 2,
				regY: spriteHeight / 2,
				spacing: 0,
				margin: 0
			}
		})
    // draw the map:
    let rows: number = this.map.length,
      cols: number = this.map[0].length,
      tile: any, bitmap: any, idx: number = 0
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        idx = this.map[row][col] - 1
        tile = new window.createjs.Sprite(ss)
          .set({
            x: spriteWidth * col + spriteWidth / 2,
            y: spriteHeight * row + spriteHeight / 2
          })
        tile.gotoAndStop(idx)
        tile.mouseChildren = false
        tile.visible = parseInt(puzzle[idx]) == 1 ? true : false
        tile.idx = idx
        this.stagePage.addChild(tile)
        this.tiles[idx] = tile

        bitmap = new window.createjs.Bitmap(bitImg)
        bitmap.visible = puzzle[idx] == 1 ? false : true
				bitmap.regX = spriteWidth / 2
				bitmap.regY = spriteHeight / 2
				bitmap.x = spriteWidth * col + spriteWidth / 2
				bitmap.y = spriteHeight * row + spriteHeight / 2
        bitmap.idx = idx
        bitmap.mouseChildren = false
        this.stagePage.addChild(bitmap)
        this.bitmaps.push(bitmap)
        
        if(bitmap.visible){
          bitmap.addEventListener("click", (e: Event) => {
            let targetItem: any = e.target
            const event = this.item.events.compareInComps
            if(event) {
              const compDataStr = event.comps[0].attrs.value
              const compDataJson = JSON.parse(compDataStr)
              const compId = getCompIdByParam(compDataJson.compId) || compDataJson.compId
              const compareCompId = getCompIdByParam(compDataJson.compareCompId) || compDataJson.compareCompId
              const numberControlData = this.controls[compId][CONTROL_TYPES.wb_number]
              const numberMinusControlData = this.controls[compareCompId][CONTROL_TYPES.wb_number]
  
              let isContinue =  this.compareInCompsIsContinue(numberControlData, numberMinusControlData)
              if(!isContinue){
                return
              }
            }
            const animteTime = this.injectJsClassObj.time
            if(!this.isTweening){
              window.createjs.Tween.get(targetItem).to({
                scale: 0.6,
                skewY: 180,
                opacity: 0,
              }, animteTime * 1000).call(() => {
                this.isTweening = false
                targetItem.visible = false
                puzzle[targetItem.idx] = 1
                targetItem.parent.removeChild(targetItem)
    
                this.tiles[targetItem.idx].visible = true
                this.interactionStore.updateInteractionData({ puzzle })
                EventBus.$emit("itemClick", {id: this.item.id, index: 0, e: null})

              })
            }
            this.isTweening = true
          })
        }
      }
    }
    // this.stage.addChild(this.stagePage)
    // this.stagePage.cache(0, 0, cols*spriteWidth, rows*spriteHeight)
  }

  compareInCompsIsContinue(numberControlData, numberMinusControlData){
    let isContinue = true
    if (numberMinusControlData && numberControlData && numberControlData.data.isUid) {
      if(numberMinusControlData.data.onceGrowValue < 0 || numberMinusControlData.data.op == '-'){
        const num = parseInt(numberControlData.data.num)
        const onceGrowValue = parseInt(numberMinusControlData.data.onceGrowValue)
        if (num - Math.abs(onceGrowValue) < 0) {
          Toast('亲，没有次数了！明天再来吧！')
          // this.showToast('亲，没有次数了！！')
          isContinue = false
        }
      }
    }
    return isContinue
  }

  destroy() {
    super.destroy()
    //子类覆盖
    this.isTweening = false
    let bitmap: any
    while(this.bitmaps.length > 0){
      bitmap = this.bitmaps.pop()
      bitmap.removeAllEventListeners()
      bitmap.parent.removeChild(bitmap)
    }
    this.bitmaps = []

    let tile: any
    while(this.tiles.length > 0){
      tile = this.tiles.pop()
      tile.removeAllEventListeners()
      tile.parent.removeChild(tile)
    }
    this.map = []
  }
}
