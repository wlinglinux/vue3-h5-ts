import { EventBus,getCompIdByParam } from '@/utils'
import { CONTROL_TYPES ,COMPONENT_TYPES} from  '@/const'
import BaseStore from '@/components/utils/BaseStore'


export default class Plant extends BaseStore {
  private lists : any
  private resultList : any
  private checkNum: number
  private randomIndex : number
  private changeBtn: IComponent | null
  private listComp : IComponent | null
  constructor(item: IComponent) {
    super(item)
    this.lists = []
    this.resultList = []
    this.checkNum = 0
    this.randomIndex = 0
    this.changeBtn = null
    this.listComp  = null
  }
  start() {
    const injectJsClassObj =  this.item.interactionData && this.item.interactionData.injectJsClassObj
    let relateAttrCompId = getCompIdByParam(this.item.commonAttr.relateAttrCompId)
    this.checkNum = injectJsClassObj.checkNum
    let relateEventCompId = getCompIdByParam(this.item.commonAttr.relateEventCompId)
    if(relateEventCompId){
      this.changeBtn = this.componentMap[relateEventCompId]
    }
    if(relateAttrCompId){
      let comp = this.componentMap[relateAttrCompId]
      let lists = comp.interactionData.lists
      _.forEach(lists, element => {
        if(element.params)  _.merge(element,JSON.parse(element.params))
        this.lists.push(element)
      });
    }
    
    let listCompId = injectJsClassObj.listCompId
    if(listCompId){
      this.listComp = this.componentMap[listCompId]
    }
    this.addClickEvent()
    this.changeSelectList()
  }

  changeSelectList(){
    let selecteds :number[] = []
    this.resultList = this.getRandTags([...this.lists],this.checkNum)
    _.forEach(this.components,(comp,index) => {
      selecteds.push(index + 1)
      this.siteStore.updateComponentAttr({ id: comp.id, commonAttr: { url: this.resultList[index].url } })
    });
    this.interactionStore.updateFormValueMap({ id: this.item.id, selecteds,lists: this.resultList})
    if(this.listComp){
      this.listComp.lists = this.resultList
    }
  }
  // 随机不重复数组
  getRandTags(arr,num) {
    let result:any = [];  
    arr.sort(function() {
      return (0.5-Math.random());
    })
    for (var i=0;i<num;i++){
      result[i]=arr[i]
    }
    return result 
  }

  addClickEvent(){
    let changeBtnEl = this.changeBtn?.interactionData.vueContainer.$refs.dom.$el
    this.onChangeBtnClick = this.onChangeBtnClick.bind(this)
    changeBtnEl.addEventListener("click", this.onChangeBtnClick)
  }

  onChangeBtnClick(e){
    e.stopPropagation()
    let length = this.lists.length - this.checkNum
    this.randomIndex =  this.randomIndex >= length ? 0 : this.randomIndex + this.checkNum
    this.changeSelectList()
  }

  destroy(){
    super.destroy()
  }
}

