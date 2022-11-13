import BaseCreatejs from '@/components/games/createjs/utils/BaseCreatejs.js'
import { isJSON, getCompIdByParam, EventBus } from '@/utils'

declare interface IFoodMap {
  operate: number
  levelColors: Object
  popId: number
  imgCompId: string
  listCompId: string
}

export default class FoodMap extends BaseCreatejs {
  // {"operate":"2000","levelColors":{"1000":"80,50","2000":"180,100","3000":"280,200"},"popId":1,"imgCompId":"","listCompId":""} 站点1228
  private injectJsClassObj: IFoodMap = { operate: 0, levelColors: {}, popId: 0, imgCompId: '', listCompId: '' }
  private mapNames = ['beijing', 'anhui', 'chongqing', 'fujian', 'gansu', 'guangdong', 'guangxi', 'guizhou', 'henan', 'hebei', 'hainan', 'heilongjiang', 'hubei', 'hunan', 'jilin', 'jiangsu', 'liaoning', 'neimenggu', 'ningxia', 'qinghai', 'shandong', 'shanxi', 'shanxi_1', 'shanghai', 'sichuan', 'taiwan', 'tianjin', 'xizang', 'xianggang', 'aomen', 'xinjiang', 'yunnan', 'zhejiang', 'jiangxi']
  private itemFoods: Object = {}
  private mapNameObjs: Object = {}
  private urls: any
  private items: any[] = []
  constructor(item: IComponent) {
    super(item)
  }

  initView() {
    const params = this.item.commonAttr.injectJsClassParams || this.item.commonAttr.params
    if (params && isJSON(params)) {
      this.injectJsClassObj = JSON.parse(params)
    }
    let mapItem: any
    let itemFood: any
    let mapName: string
    for (let i = 0, len = this.mapNames.length; i < len; i++) {
      mapName = this.mapNames[i]
      this.mapNameObjs[mapName] = i
      mapItem = this.stagePage[mapName]
      mapItem.mapName = mapName
      mapItem.mouseChildren = false
      mapItem.alpha = 0.01
      mapItem.addEventListener('click', (e: Event) => {
        let itemTarget: any = e.target
        //触发弹层
        let shareData = { url: this.urls[this.mapNameObjs[itemTarget.mapName]].url, content: itemTarget.num }
        this.interactionStore.updateShareData(shareData)
        this.showPop(this.injectJsClassObj.popId)
      })
      this.items[mapName] = mapItem

      itemFood = this.stagePage['food_' + this.mapNames[i]]
      itemFood.visible = false
      itemFood.mouseChildren = false
      this.itemFoods[mapName] = itemFood
    }

    EventBus.$on('refreshDynamicData', () => {
      this.refreshMap()
    })
    this.refreshMap()
  }
  
  refreshMap() {
    const mapNameNumObj = {}
    const relateListId = (this.injectJsClassObj.listCompId)//通用列表组件id
    const relatePopImgId = (this.injectJsClassObj.imgCompId)//关联的弹层中动态图片组件id
    if(relatePopImgId) {
      this.urls = this.componentMap[relatePopImgId].lists
    }
    if(relateListId) {
      const relateCompData = this.componentMap[relateListId]
      const lists = relateCompData.lists
      _.forEach(lists, (item) => {
        const index = item.voteId - 1
        const mapName = this.mapNames[index]
        this.items[mapName].num = item.num
        if (item.num >= this.injectJsClassObj.operate) {
          mapNameNumObj[mapName] = { mapName, num: item.num }
        }
      })
    }
    let itemFood: any
    let bmp: any
    let wid = 0
    let hei = 0
    let matrix: any
    _.forEach(mapNameNumObj, (item: any) => {
      itemFood = this.itemFoods[item.mapName]
      bmp = itemFood.children[0]
      wid = itemFood.nominalBounds.width
      hei = itemFood.nominalBounds.height
      //redMultiplier greenMultiplier blueMultiplier alphaMultiplier redOffset greenOffset blueOffset alphaOffset
      // bmp.filters = [new createjs.ColorFilter(0.9, 1, 1, 1, 0, 0, 0, 0)]
      if (this.injectJsClassObj.levelColors) {
        let { hue, saturation } = this.getHueSaturation(this.injectJsClassObj.levelColors, item)
        matrix = new window.createjs.ColorMatrix().adjustHue(hue).adjustSaturation(saturation)
        bmp.filters = [new window.createjs.ColorMatrixFilter(matrix)]
        bmp.cache(0, 0, wid, hei)
      }
      itemFood.visible = true
    })
  }

  getHueSaturation(levelColors: any, item: any) {
    let levelKeys = _.keys(levelColors);
    let index = 0
    let hue = 0
    let saturation = 0
    let hueSaturations: string[] = []
    let levelColor: string = ''
    let maxKey = levelKeys[levelKeys.length - 1]
    if (item.num >= maxKey) {
      levelColor = levelColors[maxKey]
      hueSaturations = levelColor.split(",")
      hue = _.parseInt(hueSaturations[0])
      saturation = _.parseInt(hueSaturations[1])
    } else {
      for (let levelColor in levelColors) {
        if (item.num >= levelKeys[index] && item.num < levelKeys[index + 1]) {
          hueSaturations = levelColor.split(",")
          hue = _.parseInt(hueSaturations[0])
          saturation = _.parseInt(hueSaturations[1])
          break
        }
        index++
      }
    }
    return { hue, saturation }
  }

  destroy() {
    super.destroy()
    let item: any
    while (this.items.length > 0) {
      item = this.items.pop()
      item.removeAllEventListeners()
    }
  }
}
