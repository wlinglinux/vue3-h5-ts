import { COMMON_WID_HEI } from '@/const/';
import BaseStore from '@/components/utils/BaseStore'
import { isHasOwnProperty, EventBus } from '@/utils/'

const DEGREE = 360

export default class DragIconsManager extends BaseStore {
  private icons: any[] = [];
  private selectIcons: any[] = [];

  private iconIndex = 0;
  private bIndex = 0;
  private mIndex = 0;
  private sIndex = 0;

  private bCount = 0;
  private mCount = 0;
  private sCount = 0;
  private allCount = 0;

  private bOffsetRotation = 0;
  private mOffsetRotation = 0;
  private sOffsetRotation = 0;

  private br = 0;
  private mr = 0;
  private sr = 0;

  private selectedIcons = {};
  private iconTxts: any[] = [];
  private currentIcons: any[] = [];
  private currenSelectedIcons: any[] = [];

  private txtStyle = null;
  private stopRadian = 0;

  private evenIconCount = 0;
  private oddIconCount = 0;

  private ICON_OBJ: any = {}
  private injectJsClassObj: any = {}
  private itemLists: any[] = []
  private container: any = null
  constructor(item: IComponent) {
    super(item)
  }

  init(icons, selectIcons, ICON_OBJ, container) {
    this.icons = icons
    this.selectIcons = selectIcons
    this.container = container
    this.ICON_OBJ = ICON_OBJ
    this.injectJsClassObj = this.item.interactionData.injectJsClassObj
    this.initCircle()
    if(this.ICON_OBJ.TXT_HEIGHT > 0) {
      this.initTxtStyle()
    }
  }

  initCircle() {
    if(this.item.events.interactionData) {
      this.itemLists = this.item.interactionData.lists;
      let obj = JSON.parse(this.item.events.interactionData.comps[0].attrs.value);
      _.forEach(this.itemLists, (item) => {
        item.position = "0,0," + obj.imgWidth + "," + obj.imgHeight;
      })
    }
    let r = this.ICON_OBJ.CONTAINER_HEIGHT/2;
    let fraction = this.ICON_OBJ.FRACTION;
    let rd = _.parseInt(r/fraction);
    let br = this.br = rd * (fraction-1);
    let mr = this.mr = rd * (fraction-2);
    let sr = 0;
    if(this.ICON_OBJ.CIRCLE_NUM == 3) {
      sr = this.sr = rd * (fraction-3)
    } else {
      sr = this.sr = rd * (fraction-2.2)
    }

    let bCircumference = 2 * Math.PI * br;
    let mCircumference = 2 * Math.PI * mr;
    let sCircumference = 2 * Math.PI * sr;
    
    let distance = this.injectJsClassObj.distance;
    distance = distance ? parseFloat(distance) : 1.5;
    let distanceRatios = this.ICON_OBJ.DISTANCE_RATIO.split(',')
    this.bCount = _.parseInt(bCircumference / (this.ICON_OBJ.ICON_WIDTH * distance * distanceRatios[0]));
    this.mCount = 0;
    if(this.ICON_OBJ.CIRCLE_NUM == 3) {
      this.mCount = _.parseInt(mCircumference / (this.ICON_OBJ.ICON_WIDTH * distance * distanceRatios[1]));
    }
    this.sCount = _.parseInt(sCircumference / (this.ICON_OBJ.ICON_WIDTH * distance * distanceRatios[2]));
    this.allCount = this.bCount + this.mCount + this.sCount;
    if(this.allCount > this.icons.length) {
      this.allCount = this.icons.length;
    }

    this.bOffsetRotation = this.ICON_OBJ.B_OFFSET_RATATION;
    this.mOffsetRotation = this.ICON_OBJ.M_OFFSET_RATATION;
    this.sOffsetRotation = this.ICON_OBJ.S_OFFSET_RATATION;
  }

  iconAddContainer(half = 2, iconsLen) {
    let radian = Math.PI * 2 / DEGREE;
    let bCount = this.bCount;
    let mCount = this.mCount;
    let sCount = this.sCount;
    let br = this.br;
    let mr = this.mr;
    let sr = this.sr;

    // let currentIconTexture = this.icons[0];
    // let scaleX = this.ICON_OBJ.ICON_WIDTH / currentIconTexture.width;
    // let scaleY = this.ICON_OBJ.ICON_HEIGHT / currentIconTexture.height;
    let iconCount = 0;
    while (this.bIndex < (bCount/half)) {
      if (this.iconIndex < iconsLen && this.sIndex < (sCount/half)) {
        this.createIconTxtCon(sr, radian * (DEGREE / sCount * this.sIndex + this.sOffsetRotation), radian * this.sOffsetRotation, this.iconIndex);
        this.iconIndex++;
        this.sIndex++;
        iconCount++;
      }
      if(this.ICON_OBJ.CIRCLE_NUM == 3){
        if (this.iconIndex < iconsLen && this.mIndex < (mCount/half)) {
          this.createIconTxtCon(mr, radian * (DEGREE / mCount * this.mIndex + this.mOffsetRotation), radian * this.mOffsetRotation, this.iconIndex);
          this.iconIndex++;
          this.mIndex++;
          iconCount++;
        }
      }
      if (this.iconIndex < iconsLen) {
        this.createIconTxtCon(br, radian * (DEGREE / bCount * this.bIndex + this.bOffsetRotation), radian * this.bOffsetRotation, this.iconIndex);
        this.iconIndex++;
        this.bIndex++;
        iconCount++;
      } else {
        break;
      }
    }
    if(half % 2 === 0) { 
      this.evenIconCount = iconCount;//偶数
      this.oddIconCount = this.allCount - iconCount;
    } 
  }

  getCircleText(text: string) {
    const wid = 450//this.ICON_OBJ.ICON_WIDTH/COMMON_WID_HEI.adaptiveScale
    // <path id="path1" d="M75,0 a1,1 0 0,0 ${wid},0" />
    const svgDomStr = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
        <path id="path1" d = "M 0 520 a 850 510 0 0 0 500 0"/>
      </defs>
      <text x="10" y="100" style="fill:red;font-size:28">
        <textPath xlink:href="#path1">${text}</textPath>
      </text>
    </svg>
			`
    const svgTextture = window.PIXI.Texture.from(svgDomStr)
    const svg = new window.PIXI.Sprite(svgTextture)
    // svg.x = 100
    // svg.y = 100
    return svg
  }

  createIconTxtCon(r, radian, offsetRadian, iconIndex) {
    // radian += Math.PI / 2;
    // const iconMask = new PIXI.Graphics();
    // iconMask.beginFill(0xFF3300);
    // iconMask.drawRoundedRect(0, -20, 500, 540, 300);
    // iconMask.endFill();

    let icon: any;
    let txt: any;
    let iconTxtContianer = new window.PIXI.Container();
    icon = new window.PIXI.Sprite();
    // icon.addChild(iconMask);
    // icon.mask = iconMask;
    icon.width = this.ICON_OBJ.ICON_WIDTH;
    icon.height = this.ICON_OBJ.ICON_HEIGHT;
    iconTxtContianer.icon = icon;
    icon.interactive = true;
    icon.on('pointerdown', this.onClickDown.bind(this));
    icon.on('pointerup', this.onClickIcon.bind(this));
    if(this.ICON_OBJ.TXT_HEIGHT > 0) {
      // txt = new window.PIXI.Text('', this.txtStyle);
      txt = this.getCircleText('1、图片图标！！1、图片图标！！1、图片图标！！1、图片图标！！')
      iconTxtContianer.txt = txt;
      txt.x = -50;
      txt.y = this.ICON_OBJ.ICON_HEIGHT;
      iconTxtContianer.addChild(txt);
    }
    iconTxtContianer.addChild(icon);
    iconTxtContianer.x = _.parseInt(r * Math.sin(radian));// - this.ICON_OBJ.ICON_WIDTH/2
    iconTxtContianer.y = _.parseInt(r * Math.cos(radian));// - this.ICON_OBJ.ICON_HEIGHT/2
    // iconTxtContianer.anchor.x = 0.5;
    // iconTxtContianer.anchor.y = 0.5;
    // iconTxtContianer.pivot = new PIXI.ObservablePoint(() => {}, () => {}, this.ICON_OBJ.ICON_WIDTH/2, this.ICON_OBJ.ICON_HEIGHT/2);
    iconTxtContianer.radian = radian;
    iconTxtContianer.offsetRadian = offsetRadian;
    iconTxtContianer.rotation = -radian;
    this.container.addChild(iconTxtContianer);
    this.iconTxts.push(iconTxtContianer);

    if(iconIndex >= this.allCount-1) {
      this.ICON_OBJ.ALL_RATATION = radian + offsetRadian - this.ICON_OBJ.ADJUST_RADIAN;//加上偏移量 x,y是相对于容器是逆时针的，因此是减去偏移量，调整弧度值是容器可视范围的弧度值
    }
  }

  initIconArr(currentHalfCircleIndex, icons) {
    let startIndex = 0;
    let endIndex = this.allCount;
    if(currentHalfCircleIndex % 2 === 0) { 
      startIndex = Math.floor(currentHalfCircleIndex / 2) * (this.evenIconCount + this.oddIconCount);
      endIndex = startIndex + this.evenIconCount;
    } else {
      startIndex = Math.floor(currentHalfCircleIndex / 2) * (this.evenIconCount + this.oddIconCount) + this.evenIconCount;
      endIndex = startIndex + this.oddIconCount;
    }
    
    while (this.currentIcons.length) {
      this.currentIcons.pop();
    }
    while (this.currenSelectedIcons.length) {
      this.currenSelectedIcons.pop();
    }
    for(startIndex; startIndex < endIndex; startIndex++) {
      if(icons[startIndex]) {
        this.currentIcons.push(icons[startIndex]);
        this.currenSelectedIcons.push(this.selectIcons[startIndex]);
      } else {
        break;
      }
    }
  }

  refreshIconTxt(currentHalfCircleIndex) {
    let allCount = this.allCount;
    let addIndex = 0;
    let len = allCount;
    if(currentHalfCircleIndex % 2 === 0) {
      addIndex = 0;
      len = this.evenIconCount;
    } else {
      addIndex = this.evenIconCount;//前一半圆是双数14 index正好是27/2上取整 单数一半圆是13  
      len = allCount;
    }
    let iconTxt;
    let index = 0;
    let iconId = 0;
    let currentIconTexture: any = null;
    // let radian = Math.PI * 2 / DEGREE;
    for (addIndex; addIndex < len; addIndex++) {
      iconTxt = this.iconTxts[addIndex];
      if(!iconTxt) {
        continue
      }
      // iconTxt.rotation += Math.random() * DEGREE/12 * radian;
      currentIconTexture = this.currentIcons[index];
      if(currentIconTexture) {
        iconId = currentIconTexture.iconId;
        iconTxt.iconId = iconId;
        if(iconTxt.txt) {
          iconTxt.txt.text = iconId + '、图片图标！！';
          iconTxt.txt.iconId = iconId;
        }
        if (this.selectedIcons[currentIconTexture.iconId]) {
          iconTxt.icon.texture = this.currenSelectedIcons[index];
        } else {
          iconTxt.icon.texture = currentIconTexture;
        }
        iconTxt.icon.iconId = iconId;
      } else {
        if(!this.stopRadian) {
          // let preIconTxt = this.iconTxts[addIndex - 1];
          this.stopRadian = iconTxt.radian - iconTxt.offsetRadian + Math.PI/8;
        }
        this.resetIconTxt(addIndex);
      }
      index++;
    } 
    return this.stopRadian;
  }

  resetStopRadian() {
    this.stopRadian = 0;
  }

  initTxtStyle() {
    this.txtStyle = new window.PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 32,
      // fontStyle: 'italic',
      fontWeight: 'bold',
      fill: ['#ffffff', '#00ff99'], // gradient
      stroke: '#4a1850',
      strokeThickness: 5,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
      wordWrap: true,
      wordWrapWidth: 440,
    });
  }
  

  onClickDown(event) {
    let currentTarget = event.currentTarget;
    currentTarget.isDown = true;
  }

  onClickIcon(event) {
    let currentTarget = event.currentTarget;
    if (currentTarget.isDown) {
      if(this.selectedIcons[currentTarget.iconId]) {
        currentTarget.texture = this.icons[currentTarget.iconId-1];
      } else {
        if(!this.onIsOverRange()) return
        currentTarget.texture = this.selectIcons[currentTarget.iconId-1];
      }
      this.selectedIcons[currentTarget.iconId] = !this.selectedIcons[currentTarget.iconId];

      let selectedLists: number[] = [];
      if(this.itemLists) {
        for(let iconId in this.selectedIcons) {
          if(this.selectedIcons[iconId]) {
            selectedLists.push(_.parseInt(iconId)-1)
          }
        }
      }
      this.interactionStore.updateFormValueMap({id: this.item.id, selecteds: selectedLists, lists: this.itemLists});
      let num = _.size(this.selectedIcons);
      if(num < 10){
        num = '0' + num;
      }
      this.interactionStore.updateBindData({key: 'num', value: num})
    }
  }

  onIsOverRange(){
    const event = this.item.events;
    if( event && event.compareInComps) {
      const obj = JSON.parse(event.compareInComps.comps[0].attrs.value)
      const max = obj.max
      const formValue = this.interactionStore.formValueMap[this.item.id]
      if(isHasOwnProperty(obj, "max") && formValue && formValue.selecteds!.length >= max) {
        EventBus.$emit("itemClick", {id: this.item.id})
        return false
      }
    }
    return true
  }

  resetIconTxt (i: number) {
    const iconTxt = this.iconTxts[i];
    if(iconTxt) {
      iconTxt.icon.texture = '';
      if(iconTxt.txt) {
        iconTxt.txt.text = '';
      }
    }
  }

  get iconTxtsLength() {
    return this.iconTxts.length;
  }

}