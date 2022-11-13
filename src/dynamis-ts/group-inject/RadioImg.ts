import { EventBus } from '@/utils'
import { COMPONENT_TYPES } from '@/const'
import BaseStore from '@/components/utils/BaseStore';

interface IRadioImg{
  imgCompId: string,
  "letter-spacing": number,
  time: number
}


export default class RadioImg extends BaseStore {
  private img: null | IComponent;
  private imgEl: null | HTMLImageElement;
  private imgs: string[];
  private radio: null | IComponent;
  private time: number;
  private letterSpacing: number;
  constructor(item: IComponent) {
    super(item);
    //子类覆盖
    this.img = null
    this.imgEl = null
    this.imgs = []
    this.radio = null
    this.time = 0
    this.letterSpacing =  0
  }

  start() {
    // {imgCompId:"","letter-spacing":"20", "time" : 20}
    let injectJsClassObj:IRadioImg = this.item.interactionData.injectJsClassObj
    _.forEach(this.components, item =>{
      if(item.cid == COMPONENT_TYPES.wb_radio){
        this.radio = item
      }
    })
    let imgCompId = injectJsClassObj.imgCompId
    if(imgCompId){
      this.img = this.componentMap[imgCompId]
      this.imgEl = this.componentMap[imgCompId].interactionData.vueContainer.$refs.dom.$el
      this.imgs = _.map(this.img.interactionData.lists, item => item.url) || []
    }
    this.time = injectJsClassObj.time || 2;
    this.letterSpacing = injectJsClassObj['letter-spacing'] || 5;

    this.checkRadio = this.checkRadio.bind(this)
    EventBus.$on("radioImg",this.checkRadio)
  }
  checkRadio({index}){
    let element = document.getElementById(this.radio!.id)!
    let lis = element.getElementsByClassName('radio-btn')
    this.imgEl && this.imgEl!.classList.remove('animate__animated', 'animate__fadeIn')

    // 背景图片设置
    setTimeout(() =>{
      // this.store.commit('updateComponentAttr',{id: this.img.id, commonAttr:{url: this.imgs[index]}})
      if(this.imgs && this.imgs.length > 0 && this.imgEl){
        this.imgEl.src = this.imgs[index]
        this.imgEl.classList.add('animate__animated', 'animate__fadeIn');
        this.imgEl.style.setProperty('--animate-duration', `${this.time}s`);
      }
      let li: any = lis[index]
      li.style.letterSpacing = this.letterSpacing + 'px'
      li.style.transition = `all ${this.time}s`
    },500)
  }
  destroy(){
    super.destroy();
    this.img = null
    this.imgEl = null
    this.imgs = []
    this.time = 0
    this.letterSpacing =  0
    EventBus.$off("radioImg", this.checkRadio);
  }
}
