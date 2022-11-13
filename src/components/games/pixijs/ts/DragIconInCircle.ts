import BaseStore from '@/components/utils/BaseStore'
import DragIconsManager from './DragIconsManager'
import { MOBILE_WID_HEI } from '@/const/'
const DEGREE = 360;

export default class DragIconInCircle extends BaseStore {
  private dragIconsManager: any = null
  private app: any = null
  private injectJsClassObj: any = null
  private container: any = null

  private icons: any[] = []
  private selectIcons: any[] = []
  private iconsLen = 0

  private rotation = Math.PI / 8
  private allHalfCircleCount = 0//icon数需要渲染圆的个数

  private isClockwise = true//顺时针
  private allCount = 0
  private isTickRotation = true //在tick里旋转容器
  private currentHalfCircleIndex = 0
  private stopRadian = 0
  private dragContainerAlpha = 0.01
  private initCircleIcon = true
  private isStopRotation = true
  private speed = 0.002

  private br = 0
  private ICON_OBJ: any = {
    ICON_WIDTH: 172,
    ICON_HEIGHT: 172,
    TXT_HEIGHT: 0,
    CONTAINER_HEIGHT: 4096,
    FRACTION: 6,
    BOTTOM: 120,
    DISTANCE_RATIO: '1,1,1',
  }
  private icons_: string[] = []
  private selectIcons_: string[] = []
  private containerHeight = 0

	constructor(item: IComponent) {
    super(item)
  }
  

  initPixi({PIXI, app}) {
    this.app = app

    // https://static.hd.xxx.com/upload/biz/1/select_dark_1.json
    // https://static.hd.xxx.com/upload/biz/1/select_dark_1.png
    // https://static.hd.xxx.com/upload/biz/1/select_light_1.json
    // https://static.hd.xxx.com/upload/biz/1/select_light_1.png
    this.injectJsClassObj = this.item.interactionData.injectJsClassObj;
    // this.injectJsClassObj.txtHeight = 30
    this.ICON_OBJ.ICON_WIDTH = this.injectJsClassObj.iconWidth;
    this.ICON_OBJ.ICON_HEIGHT = this.injectJsClassObj.iconHeight;
    this.ICON_OBJ.TXT_HEIGHT = this.injectJsClassObj.txtHeight ? this.injectJsClassObj.txtHeight : 0;
    this.ICON_OBJ.FRACTION = this.injectJsClassObj.fraction ? this.injectJsClassObj.fraction : 6;
    this.ICON_OBJ.BOTTOM = this.injectJsClassObj.bottom ? this.injectJsClassObj.bottom : 120;
    this.ICON_OBJ.DISTANCE_RATIO = this.injectJsClassObj.distanceRatio ? this.injectJsClassObj.distanceRatio : '1,1,1';
    this.ICON_OBJ.ADJUST_RADIAN = this.injectJsClassObj.adjustRadian ? this.injectJsClassObj.adjustRadian : Math.PI;
    this.ICON_OBJ.CONTAINER_HEIGHT = this.injectJsClassObj.containerHeight ? this.injectJsClassObj.containerHeight : 4096;
    this.ICON_OBJ.CIRCLE_NUM = this.injectJsClassObj.circleNum ? this.injectJsClassObj.circleNum : 3;
    this.rotation = this.injectJsClassObj.initRotation ? this.injectJsClassObj.initRotation : Math.PI / 8;
    this.dragContainerAlpha = this.injectJsClassObj.containerAphla ? this.injectJsClassObj.containerAphla : 0.01;
    this.speed = this.injectJsClassObj.speed ? this.injectJsClassObj.speed : 0.002;
    let offsetRotation = DEGREE/4;
    let bOffsetRotation = offsetRotation + (offsetRotation/6 * Math.random());
    let mOffsetRotation = offsetRotation + (offsetRotation/6 * Math.random());
    let sOffsetRotation = offsetRotation + (offsetRotation/6 * Math.random());

    this.ICON_OBJ.B_OFFSET_RATATION = bOffsetRotation;
    this.ICON_OBJ.M_OFFSET_RATATION = mOffsetRotation;
    this.ICON_OBJ.S_OFFSET_RATATION = sOffsetRotation;
    
    Math.PI * 2 / DEGREE * (bOffsetRotation) + Math.PI * 2 - Math.PI/4;
    //   let xx = {
    //     "iconsUrl":"https://static.hd.xxx.com/upload/biz/1/select_dark_1.json",
    //     "selectedIconsUrl":"https://static.hd.xxx.com/upload/biz/1/select_light_1.json",
    //     "bgColor":0xffffff,
    //   }
    
    if(this.injectJsClassObj.iconsUrl) {
      this.loadJSONAssets(PIXI);
    } else {
      this.loadAssets(PIXI);
    }
  }

  loadJSONAssets(PIXI: any) {
    const loader = this.app.loader;
    let selectedIconsUrl = this.injectJsClassObj.selectedIconsUrl;
    let iconsUrl = this.injectJsClassObj.iconsUrl;
    loader.add("selectIcons", selectedIconsUrl);//"./assets/images/select_dark_1.json"
    loader.add("icons", iconsUrl)
      .load(this.setupJSON.bind(this));
  }

  loadAssets(PIXI: any) {
    // let nn = {"urlPrefix":"https://static.hd.xxx.com/upload/biz/26/","prefix":"xy","count":30,"commonName":"grey","selectedName":"light"}
    const loader = this.app.loader;
    let urlPrefix = this.injectJsClassObj.urlPrefix;
    let prefix = this.injectJsClassObj.prefix;
    let count = this.injectJsClassObj.count;
    let commonName = this.injectJsClassObj.commonName;
    let selectedName = this.injectJsClassObj.selectedName;
    let countName = '';
    let iconName = '';
    let selectedIconName = '';
    this.icons_ = [];
    this.selectIcons_ = [];
    for(let i = 1; i <= count; i++) {
      iconName = '';
      selectedIconName = '';
      if(i < 10) {
        countName = '0' + i;
      } else {
        countName = _.toString(i);
      }
      iconName = prefix + '-' + countName + '-' + commonName + '.png';
      this.icons_.push(iconName);
      selectedIconName = prefix + '-' + countName + '-' + selectedName + '.png';
      this.selectIcons_.push(selectedIconName);
      loader.add(iconName, urlPrefix + iconName);
      loader.add(selectedIconName, urlPrefix + selectedIconName);
    }
    //https://static.hd.xxx.com/upload/biz/26/xy-11-grey.png
    loader.load(this.setup.bind(this));
  }

  setup(loader: any, resources: any) {
    this.initCircle();

    let texture: any
    _.forEach(this.icons_, (iconName, id) => {
      texture = resources[iconName].texture;
      texture.iconId = id + 1;
      this.icons.push(texture);
    })
    _.forEach(this.selectIcons_, (iconName, id) => {
      texture = resources[iconName].texture;
      texture.iconId = id + 1;
      this.selectIcons.push(texture);
    })
    this.initContainer(window.PIXI);
  }

  initCircle() {
    let r = this.ICON_OBJ.CONTAINER_HEIGHT/2;
    let fraction = this.ICON_OBJ.FRACTION;
    this.containerHeight = this.ICON_OBJ.CONTAINER_HEIGHT;
    let rd = _.parseInt(r/fraction);
    let br = this.br = rd * (fraction-1);
    let mr = rd * (fraction-2);
    let sr = 0;
    if(this.ICON_OBJ.CIRCLE_NUM == 3) {
      sr = rd * (fraction-3);
    } else {
      sr = rd * (fraction-2.2);
    }

    let bCircumference = 2 * Math.PI * br;
    let mCircumference = 2 * Math.PI * mr;
    let sCircumference = 2 * Math.PI * sr;
    
    let distance = this.injectJsClassObj.distance;
    distance = distance ? parseFloat(distance) : 1.5;
    let distanceRatios = this.ICON_OBJ.DISTANCE_RATIO.split(',')
    let bCount = _.parseInt(bCircumference / (this.ICON_OBJ.ICON_WIDTH * distance * distanceRatios[0]));
    let mCount = 0;
    if(this.ICON_OBJ.CIRCLE_NUM == 3) {
      mCount = _.parseInt(mCircumference / (this.ICON_OBJ.ICON_WIDTH * distance * distanceRatios[1]));
    }
    let sCount = _.parseInt(sCircumference / (this.ICON_OBJ.ICON_WIDTH * distance * distanceRatios[2]));
    this.allCount = bCount + mCount + sCount;
  }

  setupJSON(loader: any, resources: any) {
    this.initCircle();

    //PIXI.Loader.shared.resources
    let id = 1;
    if(resources.icons) {
      let iconObj = resources.icons.textures;
      for (let iconKey in iconObj) {
        iconObj[iconKey].iconId = id;
        this.icons.push(iconObj[iconKey]);
        id++;
      }
    }
    id = 1;
    if (resources.selectIcons) {
      let iconLightObj = resources.selectIcons.textures;
      for (let iconLightKey in iconLightObj) {
        iconLightObj[iconLightKey].iconId = id;
        this.selectIcons.push(iconLightObj[iconLightKey]);
        id++;
      }
    }
    this.initContainer(window.PIXI);
  }

  initContainer (PIXI: any) {
    let iconsLen = this.iconsLen = this.icons.length;
    if(this.allCount > iconsLen) {
      this.allCount = iconsLen;
    }
    this.allHalfCircleCount = Math.ceil(iconsLen/(this.allCount/2));

    let container = this.container = new PIXI.Container();
    container.x = (this.br - MOBILE_WID_HEI.clientWidth * MOBILE_WID_HEI.designScale)/2;
    container.y = -(this.containerHeight/2 - MOBILE_WID_HEI.clientHeight * MOBILE_WID_HEI.designScale + this.ICON_OBJ.BOTTOM);
    container.interactive = true;
    container.rotation = this.rotation;
    container
      .on('pointerdown', this.onDragStart.bind(this))
      .on('pointerup', this.onDragEnd.bind(this))
      .on('pointerupoutside', this.onDragEnd.bind(this))
      .on('pointermove', this.onDragMove.bind(this));

    this.addGraphicsToContainer(container);
    this.dragIconsManager = new DragIconsManager(this.item);
    // container.x = 360;
    // container.y = this.app.view.height/2;
    // container.scale = new PIXI.Point (0.2, 0.2);

    this.dragIconsManager.init(this.icons, this.selectIcons, this.ICON_OBJ, container);
    this.dragIconsManager.iconAddContainer(2, iconsLen);
    // this.dragIconsManager.iconAddContainer(1, this.iconsLen);
    this.dragIconsManager.initIconArr(this.currentHalfCircleIndex, this.icons);
    this.dragIconsManager.refreshIconTxt(this.currentHalfCircleIndex);
    
    this.app.stage.addChild(container);
    this.app.ticker.add(this.ticker.bind(this));
  }

  addGraphicsToContainer(container) {
    let graphics = new window.PIXI.Graphics();
    graphics.beginFill(this.injectJsClassObj.bgColor, this.dragContainerAlpha);
    graphics.drawCircle(0, 0, this.br + this.ICON_OBJ.ICON_HEIGHT + this.ICON_OBJ.TXT_HEIGHT);
    // Add it to the stage to render
    container.addChild(graphics);
  }

  onDragStart(event) {
    // store a reference to the data
    this.container.data = event.data;
    let parent = event.currentTarget.parent;
    this.container.startX = this.container.data.getLocalPosition(parent).x;
    this.container.dragging = true;
    this.isTickRotation = false;
  }

  onDragEnd() {
    this.container.dragging = false;
    this.isTickRotation = true;
    this.container.data = null;
  }

  onDragMove(event) {
    if (this.container.dragging) {
      let parent = event.currentTarget.parent;
      let currentX = this.container.data.getLocalPosition(parent).x;
      let moveX = currentX - this.container.startX;
      this.rotation -= moveX * 0.001;
      // if(this.rotation < 0) {
      //   this.rotation = 0;
      // }
      // if(this.rotation > this.allHalfCircleCount*Math.PI) {
      //   this.rotation = this.allHalfCircleCount*Math.PI - 0.001;
      // }
      this.container.startX = currentX;
      if(moveX > 0) {
        this.isClockwise = false;
      } else {
        this.isClockwise = true;
      }
      this.isStopRotation = true;
    }
  }

  ticker() {
    if (this.rotation < 0) return;
    if (this.isTickRotation) {
      this.rotation += this.speed;
    }
    this.container.rotation = this.rotation;
    let circleIndex = Math.floor(this.rotation/Math.PI);
    if(this.currentHalfCircleIndex != circleIndex && circleIndex < this.allHalfCircleCount) {
      if(this.initCircleIcon && circleIndex == 1 && this.dragIconsManager.iconTxtsLength < this.allCount) {
        this.dragIconsManager.iconAddContainer(1, this.iconsLen);
        this.initCircleIcon = false;
        this.dragIconsManager.initIconArr(circleIndex, this.icons);
        this.stopRadian = this.dragIconsManager.refreshIconTxt(circleIndex);
      }
      // if(this.isClockwise) {
      // } else {
      //   this.dragIconsManager.initIconArr(circleIndex-1, this.icons);
      //   this.stopRadian = this.dragIconsManager.refreshIconTxt(circleIndex-1);
      // }
      this.currentHalfCircleIndex = circleIndex;
    }
    // if(this.stopRadian > 0 && circleIndex >= (this.allHalfCircleCount-1) && this.rotation%(Math.PI*2) >= this.stopRadian) {
    //   this.isTickRotation = false;
    // }
    if(this.rotation >= this.ICON_OBJ.ALL_RATATION && this.isStopRotation) {
      this.rotation = this.rotation % (Math.PI * 2);
      this.isTickRotation = false;
      this.isStopRotation = false;
    }
  }

  destroy() {

  }
}