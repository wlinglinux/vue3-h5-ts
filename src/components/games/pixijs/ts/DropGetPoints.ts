import BaseStore from '@/components/utils/BaseStore'
import { EventBus } from '@/utils/'
import { showPage } from '@/components/utils/'


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
//{"goodsUrl":"https://static.hd.xxx.com/upload/biz/26/96079020_2503.png,https://static.hd.xxx.com/upload/biz/26/14618872_2503.png,https://static.hd.xxx.com/upload/biz/26/72500924_2503.png","points":[5,10,20],"cartUrl":"https://static.hd.xxx.com/upload/biz/26/2899484_2503.png","bombUrl":"https://static.hd.xxx.com/upload/biz/26/85926572_2503.png","bgUrl":"https://static.hd.xxx.com/upload/biz/121/26800574_2505.png","numberJsonUrl":"https://static.hd.xxx.com/upload/biz/121/number2505.json","score":200, "bombNum":[2,5],"clickMoveLen":36,"gsap":{},"isTick":false,"successPageId":4,"failPageId":5,"factors":[3,6],"durations":[2.4,3.6],"cartScale":0.9,"numberScale":0.8,"goodsScale":1.3}
export default class DropGetPoints extends BaseStore {
  private app: any //PIXI Application
  private offsetWidths: number[] = []
  private container: any  //PIXI Container
  private goodsKeysTexture: any = {} //score texture
  private bgIcon: any //PIXI Sprite
  private cartIcon: any
  private cartCon: any
  private goodsSprites: any[] = []
  private initGoodsSprites: any[] = []
  private numberTextureObj: any
  private clickContainer: any
  private goodsKeys: number[] = [] //points: [5,10,20]        0是炸弹
  private duration = 2
  private lastTime = 0
  private factor = 1
  private gapTime = 0
  constructor(item: IComponent) {
    super(item)
  }

  initPixi({PIXI, app}) {
    this.interactionStore.updateBindData({key: 'score', value: 0})
    this.app = app
    const ticker = this.app.ticker
    ticker.stop()

    const injectJsClassObj: IDropGetPoints = this.item.interactionData.injectJsClassObj
    const durations = injectJsClassObj.durations ? injectJsClassObj.durations : [2.4,3.6]
    this.duration = _.random(durations[0],durations[1],true)
    const factors: number[] = injectJsClassObj.factors ? injectJsClassObj.factors : [3,4]
    this.factor = _.random(factors[0],factors[1],true)
    const goodsUrl = injectJsClassObj.goodsUrl.split(',')
    const goodsNames: string[] = []
    const loader = PIXI.Loader.shared
    _.forEach(goodsUrl, (iconUrl: string, index: number) => {
      const iconName = 'goodsIcon-' + index
      goodsNames.push(iconName)
    })
    if(loader.resources.bombIcon) {
      this.setup(PIXI, goodsNames, loader.resources)
    } else {
      _.forEach(goodsUrl, (iconUrl: string, index: number) => {
        const iconName = 'goodsIcon-' + index
        loader.add(iconName, iconUrl)
      })
      loader.add(bombIcon, injectJsClassObj.bombUrl)
      loader.add(bgIcon, injectJsClassObj.bgUrl)
      loader.add(cartIcon, injectJsClassObj.cartUrl)
      loader.add(numberIcons, injectJsClassObj.numberJsonUrl)
      //PIXI.Loader.shared.resources resources这两个里有同样的数据
      loader.load((loader: any, resources: any) => {
        this.setup(PIXI, goodsNames, resources)
      })
    }
    //这个很重要，不然 不能移除事件
    this.onTimerEnd = this.onTimerEnd.bind(this)
    EventBus.$off("timerEnd", this.onTimerEnd)
    EventBus.$on("timerEnd", this.onTimerEnd)
  }

  onTimerEnd() {
    this.app.ticker.stop()
    this.app.stop()
    const injectJsClassObj:IDropGetPoints = this.item.interactionData.injectJsClassObj
    if(this.interactionStore.bindData.score > injectJsClassObj.score) {
      showPage(injectJsClassObj.successPageId, this.item) 
    } else {
      showPage(injectJsClassObj.failPageId, this.item) 
    }
  }

  initContainer(PIXI: any) {
    const container = this.container = new PIXI.Container()
    this.app.stage.addChild(container)
  }

  setup(PIXI: any, goodsNames: string[], resources: any) {
    this.initContainer(PIXI)
    this.randomGoodsSprite(PIXI, goodsNames, resources)
    this.createBombSprite(PIXI, resources[bombIcon].texture)
    this.createBgSprite(PIXI, resources[bgIcon].texture)
    this.createCartSprite(PIXI, resources[cartIcon].texture)
    this.numberTextureObj = resources[numberIcons].textures
    const injectJsClassObj:IDropGetPoints = this.item.interactionData.injectJsClassObj
    EventBus.$emit('timerStart')
    // injectJsClassObj.isTick = false
    if(injectJsClassObj.isTick) {
      this.initGoods()
    } else {
      this.playGsapTweenIcons(PIXI, window.gsap)
    }
    this.createLeftRightBtn(PIXI)
    const ticker = this.app.ticker
    ticker.add(this.ticker.bind(this))
    ticker.start()
  }
  randomGoodsSprite(PIXI: any, goodsNames: string[], resources: any) {
    const injectJsClassObj:IDropGetPoints = this.item.interactionData.injectJsClassObj
    const points = injectJsClassObj.points
    let xx = 0
    const len = goodsNames.length-1
    _.forEach(goodsNames, (goodsName: string, index: number) => {
      let goodsIcon = new PIXI.Sprite(resources[goodsName].texture)
      // this.container.addChild(goodsIcon)
      // this.goodsIcons.push(goodsIcon)
      this.goodsKeysTexture[points[index]] = resources[goodsName].texture
      if(index == 0) {
        xx += _.random(2,3,true) * goodsIcon.width
      }
      if(index < len) {
        this.offsetWidths.push(Math.floor(xx))
        xx += goodsIcon.width + _.random(1,1.5,true) * goodsIcon.width
      }
    })
    this.goodsKeys = this.getRandomArr(injectJsClassObj.score, points, injectJsClassObj.bombNum)
  }
  createBombSprite(PIXI: any, bombTexture: any) {
    // const bombIcon = new PIXI.Sprite(bombTexture)
    // this.container.addChild(bombIcon)
    // this.goodsIcons.push(bombIcon)
    //炸弹 key 0
    this.goodsKeysTexture[0] = bombTexture
    // const xx = this.offsetWidths[this.offsetWidths.length -1] + bombIcon.width + _.random(0.5,1.5,true) * bombIcon.width
    // this.offsetWidths.push(Math.floor(xx))
  }
  createBgSprite(PIXI: any, bgTexture: any) {
    this.bgIcon = new PIXI.Sprite(bgTexture)
    const designHeight = _.parseInt(this.item.commonAttr.designHeight)
    this.bgIcon.y = designHeight - this.bgIcon.height
    this.container.addChild(this.bgIcon)
  }
  createCartSprite(PIXI: any, cartTexture: any) {
    const injectJsClassObj:IDropGetPoints = this.item.interactionData.injectJsClassObj
    this.cartIcon = new PIXI.Sprite(cartTexture)
    this.cartIcon.scale.set(injectJsClassObj.cartScale)
    const designWidth = _.parseInt(this.item.commonAttr.designWidth)
    const designHeight = _.parseInt(this.item.commonAttr.designHeight)
    this.cartIcon.x = (designWidth - this.cartIcon.width)/2 - 50
    this.cartIcon.y = designHeight - this.bgIcon.height/2 - 100 - this.cartIcon.height
    this.container.addChild(this.cartIcon)

    this.cartCon = new PIXI.Container()
    const graphics = new PIXI.Graphics()
    graphics.beginFill("#fff", 0.1)
    graphics.drawRect(this.cartIcon.width/2-50, 100, this.cartIcon.width/3*2, this.cartIcon.height/3)
    this.cartCon.addChild(graphics)
    this.cartIcon.addChild(this.cartCon)

  }
  generateNumberSprite(sprite: any) {
    const injectJsClassObj:IDropGetPoints = this.item.interactionData.injectJsClassObj
    const x = sprite.x - sprite.width/2, y = sprite.y - sprite.height/2, number = sprite.score
    const numContainer = new window.PIXI.Container()
    let numbers = [number]
    if(_.toString(number).length > 1) {
      numbers = _.toString(number).split('')
    }
    numbers.unshift('+')
    _.forEach(numbers, (number: number, index: number) => {
      let numberSprite = new window.PIXI.Sprite(this.numberTextureObj[number+'.png'])
      numberSprite.x = numberSprite.width/2 * index
      numContainer.addChild(numberSprite)
    })
    // const numberAnimatedSprite = new DropGetPointsItem().init(window.PIXI, this.numberTextureObj, number)
    numContainer.scale.set(injectJsClassObj.numberScale)
    numContainer.x = x
    numContainer.y = y
    this.container.addChild(numContainer)

    window.gsap.to(numContainer, {
      duration: 1,
      y: y-30,
      ease: "none",
      onComplete: () => {
        numContainer.visible = false
        if(numContainer && numContainer.parent) {
          numContainer.parent.removeChild(numContainer)
        }
        window.gsap.killTweensOf(numContainer)
      },
    })
  }
  createLeftRightBtn(PIXI: any) {
    const clickContainer = this.clickContainer = new PIXI.Container()
    const graphics = new PIXI.Graphics()
    graphics.beginFill("#fff", 0.01)
    const designWidth = _.parseInt(this.item.commonAttr.designWidth)
    const designHeight = _.parseInt(this.item.commonAttr.designHeight)
    graphics.drawRect(0, 0, designWidth, designHeight/2)
    graphics.x = 0
    graphics.y = designHeight/2
    clickContainer.addChild(graphics)
    this.container.addChild(clickContainer)
    clickContainer.interactive = true
    this.onPointerdown = this.onPointerdown.bind(this)
    this.onPointermove = this.onPointermove.bind(this)
    clickContainer.on('pointerdown', this.onPointerdown)
    clickContainer.on('pointermove', this.onPointermove)
  }
  
  onPointerdown(event: any) {
    const injectJsClassObj: IDropGetPoints = this.item.interactionData.injectJsClassObj
    const designWidth = _.parseInt(this.item.commonAttr.designWidth)
    const clickMoveLen = injectJsClassObj.clickMoveLen
    const parent = event.currentTarget.parent
    this.container.data = event.data
    const currentX = this.container.startX = event.data.getLocalPosition(parent).x
    if(currentX > designWidth/2) {
      this.cartIcon.x += clickMoveLen
    } else {
      this.cartIcon.x -= clickMoveLen
    }
  }

  onPointermove(event: any) {
    const parent = event.currentTarget.parent
    const currentX = event.data.getLocalPosition(parent).x
    const moveX = currentX - this.container.startX
    if(Math.abs(moveX) > 20) {
      this.cartIcon.x = moveX + this.cartIcon.width/2
    }
  }

  getRandomArr(total_: number, arr_: number[], bombNum_: number) {
    let numArr: number[] = []
    const factor = this.factor
    let total: number = Math.floor(factor * total_)
    while(total > 0) {
      let rnd: number = arr_[_.random(0,2)]
      total -= rnd
      numArr.push(rnd)
    }
    
    let bombLen = Math.floor(_.random(bombNum_[0]*factor, bombNum_[1]*factor))
    for(let i = 0; i < bombLen; i++) {
      let index = _.random(0,numArr.length)
      numArr.splice(index, 0, 0)
    }
    this.gapTime = this.duration * 1000/numArr.length
    return numArr
  }
  playGsapTweenIcons(PIXI: any, gsap: any) {
    const injectJsClassObj: IDropGetPoints = this.item.interactionData.injectJsClassObj
    const designHeight = _.parseInt(this.item.commonAttr.designHeight)
    let duration = this.duration
    let delay = 0
    let rand = _.random(0,1)
    _.forEach(this.goodsKeys, (key: number, index: number) => {
      let icon = new PIXI.Sprite(this.goodsKeysTexture[key])
      icon.score = key
      this.goodsSprites.push(icon)
      this.initGoodsSprites.push(icon)
      icon.scale.set(injectJsClassObj.goodsScale)
      this.container.addChild(icon)
      let widIndex = index%this.offsetWidths.length
      let xx = this.offsetWidths[widIndex]
      const goodsWid = this.offsetWidths[widIndex]
      if(rand == 0) {
        xx -= _.random(0,0.5,true) * goodsWid
      } else {
        xx += _.random(0,0.5,true) * goodsWid
      }
      icon.x = xx
      icon.y = -designHeight * _.random(0,0.5,true)
      icon.rotation = window.gsap.utils.random([0,15,30,-15,-30])
      gsap.to(icon, {
        y: designHeight * 1.2,
        duration,
        delay: delay, 
        ease: "none",
        onComplete: () => {
          if(icon && icon.parent) {
            icon.parent.removeChild(icon)
          }
          gsap.killTweensOf(icon)
        },
      })
      if(widIndex == 0) {
        rand = _.random(0,1)
        delay += duration/4
      }
    })
    this.container.addChild(this.cartIcon)
  }
  initGoods() {
    const injectJsClassObj: IDropGetPoints = this.item.interactionData.injectJsClassObj
    const designHeight = this.item.commonAttr.designHeight
    let rand = _.random(0,1)
    _.forEach(this.goodsKeys, (key: number, index: number) => {
      let icon = new window.PIXI.Sprite(this.goodsKeysTexture[key])
      icon.score = key
      icon.scale.set(injectJsClassObj.goodsScale)
      let widIndex = index%this.offsetWidths.length
      let xx = this.offsetWidths[widIndex]
      const goodsWid = this.offsetWidths[widIndex]
      if(rand == 0) {
        xx -= _.random(0,0.5,true) * goodsWid
      } else {
        xx += _.random(0,0.5,true) * goodsWid
      }
      icon.x = xx
      icon.y = -designHeight * _.random(0,1,true)
      icon.rotation = window.gsap.utils.random([0,15,30,-15,-30])
      this.initGoodsSprites.push(icon)
      if(widIndex == 0) {
        rand = _.random(0,1)
      }
    })
  }

 testForAABB(object1: any, object2: any) {
  const bounds1 = object1.getBounds()
  const bounds2 = object2.getBounds()

  return bounds1.x < bounds2.x + bounds2.width
    && bounds1.x + bounds1.width > bounds2.x
    && bounds1.y < bounds2.y + bounds2.height
    && bounds1.y + bounds1.height > bounds2.y
  }

  hitTestRectangle(r1: any, r2: any) {
    //Define the variables we'll need to calculate
    let hit: boolean, combinedHalfWidths:number, combinedHalfHeights: number, vx: number, vy: number
    //hit will determine whether there's a collision
    hit = false
    //Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2
    r1.centerY = r1.y + r1.height / 2
    r2.centerX = r2.x + r2.width / 2
    r2.centerY = r2.y + r2.height / 2
  
    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2
    r1.halfHeight = r1.height / 2
    r2.halfWidth = r2.width / 2
    r2.halfHeight = r2.height / 2
  
    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX
    vy = r1.centerY - r2.centerY
  
    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth
    combinedHalfHeights = r1.halfHeight + r2.halfHeight
  
    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {
      //A collision might be occurring. Check for a collision on the y axis
      if (Math.abs(vy) < combinedHalfHeights) {
        //There's definitely a collision happening
        hit = true
      } else {
        //There's no collision on the y axis
        hit = false
      }
    } else {
      //There's no collision on the x axis
      hit = false
    }
    //`hit` will be either `true` or `false`
    return hit
  }

  ticker() {
    const injectJsClassObj: IDropGetPoints = this.item.interactionData.injectJsClassObj
    const isTick = injectJsClassObj.isTick
    if(isTick && this.app.ticker.lastTime - this.lastTime > this.gapTime) {
      if(this.initGoodsSprites.length > 0) {
        let sprite = this.initGoodsSprites.shift()
        this.goodsSprites.push(sprite)
        this.container.addChild(sprite)
      }
      this.lastTime = this.app.ticker.lastTime
    }

    const collisionSpriteArr: any[] = []
    _.forEach(this.goodsSprites, (sprite: any, index: number) => { 
      if(sprite && this.testForAABB(sprite, this.cartCon)) {
        if(sprite.score == 0) {
          //炸弹
          this.interactionStore.updateBindData({key: 'score', value: 0})
        } else {
          const score = this.interactionStore.bindData.score + sprite.score
          this.interactionStore.updateBindData({key: 'score', value: score})
          this.generateNumberSprite(sprite)
        }
        window.gsap.killTweensOf(sprite)
        sprite.rotation = 0
        sprite.x = this.cartCon.width/2 + sprite.width* _.random(0,1,true)
        sprite.y = this.cartCon.height
        sprite.scale.set(0.7)
        sprite.alpha = 0.6
        this.cartCon.addChild(sprite)
        window.gsap.to(sprite, {
          duration: _.random(1,3,true),
          y: sprite.y+30,
          ease: 'none',
          onComplete: () => {
            sprite.parent.removeChild(sprite)
          }
        })
        collisionSpriteArr.push(sprite)
      }

      if(isTick) {
        sprite.y += 10
      }
    })
    _.forEach(collisionSpriteArr, (sprite: any) => {
      let index = this.goodsSprites.indexOf(sprite)
      if(index != -1) {
        this.goodsSprites.splice(index, 1)
      }
    })
  }
  destroy() {
    _.forEach(this.goodsSprites, (sprite) => {
      window.gsap.killTweensOf(sprite)
      if(sprite.parent) {
        sprite.parent.removeChild(sprite)
      }
    })
    this.app = null
    this.container = null
    this.offsetWidths = []
    this.goodsKeysTexture = null
    this.bgIcon = null
    this.cartIcon = null
    this.cartCon = null
    this.goodsSprites = []
    this.initGoodsSprites = []
    this.numberTextureObj = null
    this.goodsKeys = []
    this.lastTime = 0
    this.factor = 0
    this.gapTime = 0

    EventBus.$off('timerEnd', this.onTimerEnd)
    this.clickContainer.off('pointerdown', this.onPointerdown)
    this.clickContainer.off('pointermove', this.onPointermove)
    this.clickContainer = null
  }
}