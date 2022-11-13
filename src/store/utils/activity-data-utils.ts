import { useSiteStore } from './../site';
import { useInteractionStore } from './../interaction';
import { COMPONENT_TYPES, STATISTIC_DATA_TYPES_MAP } from '@/const/'
import { convertDateChineseFormat } from '@/utils/'

function dealWeibo2020(data: any) : any {
  const weibo2020: IWeibo2020StatisticData = data as IWeibo2020StatisticData
  weibo2020.opp_name = weibo2020.users[weibo2020.opp_uid] ? weibo2020.users[weibo2020.opp_uid].screen_name : "天神"
  let uids = [weibo2020.uid1_2019, weibo2020.uid2_2019, weibo2020.uid3_2019, weibo2020.uid1_2020, weibo2020.uid2_2020, weibo2020.uid3_2020]
  if(weibo2020.uid1_2019 || weibo2020.uid2_2019 || weibo2020.uid3_2019) {
    weibo2020.friends = weibo2020.uid1_2019 || weibo2020.uid2_2019 || weibo2020.uid3_2019
  }else{
    weibo2020.friends = ''
  }
  weibo2020.elements = []
  _.forEach(uids, (uid: string) => {
    weibo2020.elements.push(weibo2020.users[uid])
  })
  return weibo2020
}

export function dealStatisticData(allPages: IPage[]) {
  replaceCompText(allPages)
}

function replaceCompText(allPages: IPage[]){
  //找出所有页面中的文本中有需要替换的组件
  for(let j = 0, len = allPages.length; j < len ; j++) {
    const page = allPages[j]
    replacePageOrGroupText(page)
  }
}

function replacePageOrGroupText(pageOrGroup: IGroup) {
  const components = pageOrGroup.components
  const len = components.length
  let componentData: any | IComponent
  for(let i = 0; i < len; i++) {
    componentData = components[i];
    if(componentData.cid == COMPONENT_TYPES.wb_text){
      replaceTextBydata(componentData.commonAttr)
    } else {
      if(componentData.components && componentData.components.length > 0){
        replacePageOrGroupText(componentData)
      }
    }
  }
}

function replaceTextBydata(commonAttr: ICommonAttr) {
  const useInteraction = useInteractionStore()
  const data = useInteraction.statisticData
  // eslint-disable-next-line
  const dataKeys = commonAttr.text.match(/\$[^\$]+\$/g);
  let value: string;
  let dataKey_: string;
  commonAttr.text = commonAttr.text.replace(new RegExp(/\$/, 'g'), '')
  _.forEach(dataKeys, (dataKey: string) => {
    dataKey_ = dataKey.replace(/\$/g, '')
    value = data[dataKey_]
    if(value) {
      // if(dataKey_.indexOf('_date') != -1){
      //   value = convertDateChineseFormat(value, false)
      // }
      commonAttr.text = commonAttr.text.replace(new RegExp(dataKey_, 'g'), value)
    }
  })
}

function visibleHiddenCompByRule(ruleStr: string){
  //找出规则中的组件与数据对比后改变组件的显示隐藏属性
  const rules = JSON.parse(ruleStr)
  const useInteraction = useInteractionStore()
  const useSite = useSiteStore()
  const data = useInteraction.statisticData
  //牧场计划
  // {
  //   blog_total: { condition: 100, compIds: ["53315817-3365-42e4-b993-14f0b828e6f5", "f2938398-3c14-4290-9251-c771b5c03151"] },
  //   latest_date: { condition: 5, compIds: ["d4734f9d-db6a-4f83-92f6-03fd0e37e597", "e077a49a-f05e-46be-9e05-19611018c4f6"] },
  //
  // }
  //数据包
  // var xx = {"bag_0":{"condition":0,"compIds":["c89e052f-7563-4248-8643-9eab7f1f4326",""]}}
  _.forEach(rules, (rule: any | Object, key: string) => {
    let hiddenId: string = ''
    let dataVal = data[key]
    if(_.isNumber(rule.condition)) {
      // if(key == 'latest_date') {
      //   let time = new Date(data[key])
      //   dataVal = time.getHours()
      // }
      if(dataVal > rule.condition) {
        hiddenId = rule.compIds[1]
      }else{
        hiddenId = rule.compIds[0]
      }
    }else if(_.isBoolean(rule.condition)){
      if(dataVal && dataVal.length > 0 == rule.condition) {
        hiddenId = rule.compIds[1]
      } else {
        hiddenId = rule.compIds[0]
      }
    }
    if(hiddenId) {
      let hiddenComponentData = useSite.componentMap[hiddenId]
      if(hiddenComponentData) {
        hiddenComponentData.commonAttr.isVisible = false
      }
    }
  })
}

export {
  dealWeibo2020,
  visibleHiddenCompByRule
}