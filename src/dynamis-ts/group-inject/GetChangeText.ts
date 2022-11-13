import { getSpritesheetStyle } from '@/components/utils/styles';
import BaseStore from '@/components/utils/BaseStore';
import { EventBus } from '@/utils/'

// .万.乐.事 .利 .吉 .喜 .大 .如 .安 .平 .心 .想 .意  .成 .火  .盈  .红 .财 .门
//  0  1  2  3   4   5  6   7  8   9  10  11  12  13  14   15  16  17  18
// let randomSteps = [0,1,2,2,3,4,5,5,6,6,7,8,9,10,11,12,13,14,14,15,16,16,17,18];
// 0-原味 1-西柚 2-白桃 3-芒果 
// 0-大吉大利 1-心想事成    2-财喜盈门       3-红红火火     4-平安喜乐     5-万事如意 
//   6463     10 11 2 13   17 5 15 18   16 16 14 14     9 8 5 1      0 2 7 12

export default class GetChangeText extends BaseStore {
  private currentIndex: number;
  private sortComponents: IComponent[] | null;
  private rights: number[][];
  constructor(item: IComponent) {
    super(item);
    //子类覆盖
    this.currentIndex = -1;
    this.sortComponents = null;

    this.rights = [
      [6, 4, 6, 3],
      [10, 11, 2, 13],
      [17, 5, 15, 18],
      [16, 16, 14, 14],
      [9, 8, 5, 1],
      [0, 2, 7, 12]
    ]

  }

  start() {
    EventBus.$on("confirmSpriteSheetText", (obj: any) => {
      this.rightAnswer(obj)
    })

    this.sortComponents = _.sortBy(this.components, (compData: IComponent) => {
      return compData.commonAttr.itemIndex;
    })
    EventBus.$on('removeSpriteSheetText', () => {
      let compData = this.sortComponents![this.currentIndex]
      if (compData) {
        //将文本设置为空，索引减减
        if (compData.interactionData && compData.interactionData.spriteSheetObj) {
          const spriteSheetObj: ISpriteSheet = compData.interactionData.spriteSheetObj
          spriteSheetObj.currentStep = spriteSheetObj.resetStep ? spriteSheetObj.resetStep : spriteSheetObj.steps
          const spriteSheetStyles = getSpritesheetStyle(spriteSheetObj)
          const bgCompData = this.componentMap[compData.id]
          const $el = bgCompData.interactionData.vueContainer.$el
          for(let key in spriteSheetStyles) {
            if(spriteSheetStyles[key]) {
              $el.style[key] = spriteSheetStyles[key]
            }
          }
        }
        this.currentIndex--
        if (this.currentIndex <= -1) {
          this.currentIndex = -1
        }
      }
    });

    //监听点击文本，接收需要改变的文本
    EventBus.$on('changeText', ({ currentStep }) => {
      const nextIndex = this.currentIndex + 1
      const compData = this.sortComponents![nextIndex]
      if (compData) {
        const spriteSheetObj: ISpriteSheet = compData.interactionData.spriteSheetObj
        spriteSheetObj.currentStep = currentStep
        const spriteSheetStyles = getSpritesheetStyle(spriteSheetObj)
        const $el = compData.interactionData.vueContainer.$el
        for(let key in spriteSheetStyles) {
          if(spriteSheetStyles[key]) {
            $el.style[key] = spriteSheetStyles[key]
          }
        }
        this.currentIndex++
        if (this.currentIndex >= this.components.length) {
          this.currentIndex = this.components.length - 1
        }
      }
    });
    this.resetImgSritesheet();
  }

  resetImgSritesheet() {
    //清空默认的文本
    _.forEach(this.components, (compData) => {
      const spriteSheetObj = compData.interactionData.spriteSheetObj
      const currentStep = spriteSheetObj.resetStep ? spriteSheetObj.resetStep : spriteSheetObj.steps
      spriteSheetObj.currentStep = currentStep
      const spriteSheetStyles = getSpritesheetStyle(spriteSheetObj)
      const $el = compData.interactionData.vueContainer.$el
      for(let key in spriteSheetStyles) {
        if(spriteSheetStyles[key]) {
          $el.style[key] = spriteSheetStyles[key]
        }
      }
    })
  }

  rightAnswer({ relateCompId, pageId, popId, relateCompIdOneDIndex, relateCompIdTwoDImg }) {
    let indexs: number[] = [];
    _.forEach(this.components, (compData) => {
      let spriteSheetObj = compData.interactionData.spriteSheetObj;
      indexs.push(spriteSheetObj.currentStep);
    })
    //_.intersection(v.ids, value).length == value.length
    let rightIndex = -1;
    for (let i = 0, len = this.rights.length; i < len; i++) {
      let rules = _.cloneDeep(this.rights[i]);
      let length = 0;
      _.forEach(indexs, (value) => {
        let index = rules.indexOf(value);
        if (index != -1) {
          _.pullAt(rules, index);
          length++;
        }
      })
      if (length == indexs.length) {
        rightIndex = i;
        break;
      }
    }
    if (rightIndex != -1) {
      let itemIndex = rightIndex;
      this.siteStore.updateComponentAttr({
        id: relateCompId,
        commonAttr: { itemIndex },
      });
      //将两个一维（二维）转化为一维index，设置图片组件的itemIndex
      let relateCompDataOneD = this.componentMap[relateCompId];
      if (relateCompDataOneD && this.componentMap[relateCompIdOneDIndex]) {
        let relateCompDataOneDIndex = this.componentMap[relateCompIdOneDIndex].commonAttr.itemIndex;
        this.siteStore.updateComponentAttr({
          id: relateCompIdTwoDImg,
          commonAttr: { itemIndex: relateCompDataOneDIndex * relateCompDataOneD.interactionData.lists.length + itemIndex },
        });
      }
      this.showPage(pageId);
    } else {
      this.showPop(popId);
    }
  }

  destroy() {
    super.destroy();
  }
}