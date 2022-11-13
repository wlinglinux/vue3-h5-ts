import BaseStore from '@/components/utils/BaseStore'

interface IAppearInSequenceAnim{
  [key: string]: IAppearInSequenceAnimItem
}

interface IAppearInSequenceAnimItem{
  type: string , // show | click
  delayTime: number,
  duraion: number,
  displayCompId: string
}

interface ISequenceCompGsap{
  compData: IComponent,
  obj: IAppearInSequenceAnimItem
}

interface IGsap{
  delayTime: number,
}
export default class AppearInSequenceAnim extends BaseStore {
  private sequenceComps: IComponent[]
  private sequenceCompMap: IAppearInSequenceAnim
  private sequenceCompGsaps: ISequenceCompGsap[]
  private sequenceCompGsapIndex: number
  private gsap: IGsap | null
  constructor(item: IComponent) {
    super(item)
    //子类覆盖
    this.sequenceComps = []
    this.sequenceCompMap = {}
    this.sequenceCompGsaps = []
    this.sequenceCompGsapIndex = 0
    this.gsap = null
  }

  start() {
    // let injectJsClassObj = {
    //   "08b18e9a-8354-43eb-9532-9742752ab422":{"type":"show","delayTime":2,"duraion":1,"displayCompId":"0c851506-f75f-4a4c-9dd6-b5b04601b46a"},
    //   "0c851506-f75f-4a4c-9dd6-b5b04601b46a":{"type":"click","displayCompId":"205d7acd-231f-4489-9dd1-adcaecfc3364"},
    //   "205d7acd-231f-4489-9dd1-adcaecfc3364":{"type":"show","delayTime":2,"duraion":1,"displayCompId":"064db51e-1133-400b-bbc4-b91eebb00814"},
    //   "064db51e-1133-400b-bbc4-b91eebb00814":{"type":"show","delayTime":2,"duration":0.1},
    //   "gsap":{"delayTime":2}  //配置这个参数加载 gsap js文件
    // }
    const injectJsClassObj: IAppearInSequenceAnim = _.cloneDeep(this.item.interactionData.injectJsClassObj)

    this.gsap = injectJsClassObj.gsap
    delete injectJsClassObj.gsap

    const sequenceCompMap = this.sequenceCompMap = injectJsClassObj
    _.forEach(sequenceCompMap, (obj: any, compId: string) => {
      let sequenceCompData: IComponent = this.componentMap[compId]
      this.sequenceComps.push(sequenceCompData)
      sequenceCompData.commonAttr.isVisible = false

      if(obj.type == "click"){
        const img = sequenceCompData.interactionData.vueContainer.$refs.dom.$el
        this.onImgClick = this.onImgClick.bind(this)
        img.addEventListener("click", this.onImgClick)
      }
    })
    this.sequenceComps = _.sortBy(this.sequenceComps, (compData) => { return compData.commonAttr.itemIndex })

    this.setGaspAnimAttr()
  }

  setGaspAnimAttr() {
    _.forEach(this.sequenceComps, (compData: IComponent) => {
      const obj:IAppearInSequenceAnimItem = this.sequenceCompMap[compData.id]
      if(obj.type == "show"){
        this.sequenceCompGsaps.push({compData, obj})
      }
    })
    
    window.setTimeout(() => {
      const compObjData = this.sequenceCompGsaps[0]
      const obj = compObjData.obj//{type,delayTime,displayCompId}
      //这里是个打组组件
      const dom = compObjData.compData.interactionData.vueContainer.$el
      compObjData.compData.commonAttr.isVisible = true
      this.addAction(obj, dom)
    }, this.gsap!.delayTime * 1000)
  }

  addAction(obj: any, dom: any){
    window.gsap.to(dom, {duration: obj.duration, delay: obj.delayTime, opacity: 1, onComplete: () => {
      this.sequenceCompGsapIndex++
      const displayCompId = obj.displayCompId
      if(displayCompId && this.sequenceCompMap[displayCompId]) {
        const obj = this.sequenceCompMap[displayCompId]
        const compData = this.componentMap[displayCompId]
        compData.commonAttr.isVisible = true
        //这里是个打组组件
        const dom = compData.interactionData.vueContainer.$el
        this.addAction(obj, dom)
      }
    }})
  }

  onImgClick(e: any) {
    e.stopPropagation()
    e.stopImmediatePropagation()
    const img = e.currentTarget
    const compId = img.dataset.id
    // let compData = this.componentMap[compId]
    // let imgVueClass = compData.interactionData.vueContainer
    
    const displayCompId = this.sequenceCompMap[compId].displayCompId
    const obj = this.sequenceCompMap[displayCompId]
    const compData = this.componentMap[displayCompId]
    compData.commonAttr.isVisible = true
    //这里是个打组组件
    const dom = compData.interactionData.vueContainer.$el
    this.addAction(obj, dom)

    img.removeEventListener("click", this.onImgClick)

    const jumpUrl = 'appearInSequence'
    const comType = "click"
    const wModule = "anim"
    this.onPostStatics({ e, comType, wModule,  jumpUrl })
  }

  destroy(){
    super.destroy()

    this.sequenceComps = []
    this.sequenceComps = []
    this.sequenceCompMap = {}
    this.sequenceCompGsaps = []
    this.sequenceCompGsapIndex = 0
    this.gsap = null
  }
}
