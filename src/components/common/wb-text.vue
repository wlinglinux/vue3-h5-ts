<template>
  <inject-template :item="item" :pageId="pageId" :popId="popId">
    <template v-slot:common>
      <div :data-id="item.id"  class="wb-text" @click="onClickText">
        <p v-if="isPLabel" ref="refDom" v-html="textValue" :style="styles" class="wid-hei-inherit overflow-hidden"></p>
        <van-field
          v-else
          :center="true"
          :border="false"
          type="textarea"
          ref="refDom"
          :maxlength="commonAttr.limitTextNum ? commonAttr.limitTextNum : 1000"
          :placeholder="commonAttr.placeholder"
          :readonly="isH5Edit ? false : !commonAttr.isEdit"
          v-model="textValue"
          :style="styles"
          @update:model-value="updateFormValueMap"></van-field>
        <span class="need-cls font-size-24" v-show="item.commonAttr.isEdit && item.commonAttr.need && item.commonAttr.isShowNeed">*</span>
      </div>
    </template>
  </inject-template>
</template>

<script setup lang="ts">
import { getCompStyle, getDataKeyValue, getAttrByCustom } from '@/components/utils/'
import { useSiteStore } from '@/store/site'
import { useControlsStore } from '@/store/controls'
import { useInteractionStore } from '@/store/interaction'
import { replaceStr, getCompIdByParam, EventBus, testGuid, addClass, getPxOVwByValue } from '@/utils/'
import { COMPONENT_TYPES, CONTROL_TYPES , INJECT_GROUP_CLASS_NAME_MAP} from '@/const/'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
}>()
const item = props.item
const commonAttr = item.commonAttr
const styles = computed(() => {
  return getCompStyle(item)
})
const useSite = useSiteStore()
const componentMap = useSite.componentMap
const useInteraction = useInteractionStore()
const useControls = useControlsStore()
const isH5Edit = useSite.isH5Edit
let isReplaceByCompId: boolean = false
let isReplaceByStatisticData: boolean = false
let isRefresh: boolean = false
let textValue_ = ref(commonAttr.text)
const textValue = computed({
  get: () => {
    if(isH5Edit) {
      return commonAttr.text
    } else {
      return textValue_.value
    }
  },
  set: (val) => {
    textValue_.value = val
  }
})
let placeholerColor = ''

const isPLabel = computed(() => {
  return commonAttr.isHtml || commonAttr.isVertical || commonAttr.isPLable
})

const initComp = () => {
  if(isH5Edit) {
    EventBus.$on('refreshCommonAttr', onRefreshCommonAttr)
    return
  }
  if(commonAttr.isEdit) {
    useInteraction.updateFormValueMap({ id: item.id, value: commonAttr.text })
  }
  const compIds = commonAttr.text.match(/\$[^\$]+\$/g)
  if(_.isArray(compIds)) {
    for(let i = 0, len = compIds.length; i < len; i++) {
      const compIds_ = compIds[i]
      const compId = getCompIdByParam(compIds_)
      if(compId) {
        if(testGuid(compId)) {
          isReplaceByCompId = true
        } else {
          //活动数据 statisticData 更新数据
          isReplaceByStatisticData = true
        }
        break
      }
    }
  }
  const relateAttrCompId = getCompIdByParam(commonAttr.relateAttrCompId)
  if(isReplaceByCompId) {
    EventBus.$on("refreshBindText", onRefreshBindText)
  } else if(commonAttr.isDynamic || commonAttr.isRandom || commonAttr.dataKey || relateAttrCompId) {
    isRefresh = true
    EventBus.$on("refreshDynamicData", onRefreshText)
  } else if(isReplaceByStatisticData) {
    EventBus.$on("refreshStatisticDataText", onRefreshStatisticDataText)
  } 
  if(item.interactionData){
    let isInGroup = item.interactionData.isInGroup
    let groupInjectClassName = item.interactionData.groupInjectClassName!
    if(isInGroup && groupInjectClassName == INJECT_GROUP_CLASS_NAME_MAP[groupInjectClassName]){
      EventBus.$on("reUpdateTextValue", onReUpdateTextValue)
    }
  }
  onRefreshText()
}
//methods
const onClickText = (e: Event) => {
  if(commonAttr.isEdit) {
    e.stopPropagation()
  }
}
const onRefreshText = () => {
  let txt = commonAttr.text
  if(commonAttr.isHtml) {
    txt = txt.replace(/《/g, "<")
    txt = txt.replace(/》/g, ">")
    textValue_.value = txt
  } 
  if(isH5Edit) {
    return
  }
  //弹层 打组注入类  会改变文本 发事件刷新 这个文本
  if(commonAttr.isRandom) {
    //relateAttrCompId 站点id 655 新年许愿管
    if(txt) {
      const arr = txt.split(",")
      if(arr.length > 1) {
        txt = _.random(arr[0], arr[1])
        textValue_.value = txt
      }
    }
  }
  if(isRefresh) {
    updateTextValue(txt)
  } else {
    if(isReplaceByCompId) {
      txt = replaceStr(useInteraction.formValueMap, txt)
      textValue_.value = txt
      useInteraction.updateFormValueMap({ id: item.id, value: txt })
    }
  }
}
const updateTextValue = (txt: string) => {
  const relateAttrCompId = getCompIdByParam(commonAttr.relateAttrCompId)
  let relateComponentData = componentMap[relateAttrCompId]
  let commonAttrText: string = ''
  let txtDataKey = getCompIdByParam(txt)
  if(commonAttr.dataKey) {
    //有 dataKey且有关联组件id，那么就从对应的关联组件id中获取数据 如果没有关联组件，那么就从全局数据中取数据
    if(relateAttrCompId && relateComponentData) {
      const namePrefix = commonAttr.namePrefix ? commonAttr.namePrefix : ''
      let name: string = namePrefix + getDataKeyValue(relateComponentData, item, txt)
      if(commonAttr.nameNum && name.length > commonAttr.nameNum) {
        name = name.substring(0, commonAttr.nameNum) + '...'
      }
      // 1572 自定义文本 自定义绑定字段为索引+1
      if(txtDataKey == "index") {
        name = (commonAttr.itemIndex + 1).toString()
      }
      commonAttrText = name
    } else if(commonAttr.dataKey == 'custom'){
      commonAttrText = getAttrByCustom(item, item, txt)
    }
  } else if(relateAttrCompId && relateComponentData){
    if(relateComponentData.cid == COMPONENT_TYPES.wb_calendar) {
      // 获取签到日历总数
      let elements = (useControls.controls[relateComponentData.id][CONTROL_TYPES.wb_vote].data as IBaseListControl).elements
      let num = _.filter(elements, (item: ISortItem) => item.num == 1).length
      commonAttrText = txt.replace("$" + txtDataKey + "$", num)
    }
  } else if(commonAttr.isRandom) {
    commonAttrText = txt
  }
  // 动态图片，也可以从图片text中获取键值，或者是默认的shareData中的url
  if(commonAttr.isDynamic && useInteraction.shareData.content && useInteraction.shareData.content.toString().length > 0) {
    if(commonAttr.isHtml) {
      txt = useInteraction.shareData.content
      txt = txt.replace(/《br》/g, "<br\>")
      commonAttrText = txt
    } else {
      commonAttrText = useInteraction.shareData.content
    }
  }
  if(textValue_.value !== commonAttrText) {
    if(commonAttr.divideNumber) {
      let realData: number =  0
      if(commonAttr.divideNumber.indexOf('$') > -1) {
        let selfData = 0
        let key = commonAttr.divideNumber.replace(/\$/g,'')
        let total = useInteraction.bindData[key]
        if(relateComponentData) {
          let itemIndex = relateComponentData.commonAttr.itemIndex
          selfData = Number(relateComponentData.lists[itemIndex][txtDataKey])
        } else {
          selfData = Number(commonAttrText)
        }
        realData =  Math.floor((selfData / total) * 100)
        commonAttrText = txt.replace("$" + txtDataKey + "$", (realData).toString() )
      } else {
        let textValue = commonAttrText.replace(/[^\d]/g,'')
        realData = Math.floor(Number(textValue) / commonAttr.divideNumber)
        commonAttrText = txt.replace("$" + txtDataKey + "$", (realData).toString())
      }
      useInteraction.updateFormValueMap({ id: item.id, value: realData })
    } else {
      useInteraction.updateFormValueMap({ id: item.id, value: commonAttrText })
    }
    if(commonAttr.isSeparator) {
      // '10000000000'.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      commonAttrText = commonAttrText.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
    textValue_.value = commonAttrText
  }
}
const onRefreshBindText = () => {
  textValue_.value = replaceStr(useInteraction.formValueMap, commonAttr.text)
}
const onRefreshStatisticDataText = () => {
  textValue_.value = item.commonAttr.text
}
const updateFormValueMap = (text: string) => {
  let value: string = ''
  if(text) {
    value = text
  } else if(textValue_.value && textValue_.value.length > 0) {
    value = textValue_.value
  }
  if(!isH5Edit) {
    useInteraction.updateFormValueMap({ id: item.id, value })
  }
} 
const refreshPlaceholerColor = () => {
  placeholerColor = commonAttr.placeholerColor
  addClass(textareaStyle, placeholerColor)
  addClass(textareaStyle, commonAttr.scrollbarType)
}
const updateScrollY = () => {
  if(textareaStyle) {
    if(commonAttr.isDisplayY) {
      textareaStyle.style['overflow-y'] = 'auto'
      textareaStyle.style['padding-right'] = getPxOVwByValue(8)
    } else {
      textareaStyle.style['overflow-y'] = 'hidden'
    }
  }
}
const onRefreshCommonAttr = (id: string) => { 
  if(item.id != id) {
    return
  }
  if(commonAttr.isDisplayY) {
    updateScrollY()
  }
  if(placeholerColor != commonAttr.placeholerColor && textareaStyle) {
    refreshPlaceholerColor()
  }
}

const onReUpdateTextValue = () =>{
  textValue_.value = commonAttr.text
}

initComp()

const refDom = ref<any>(null)
let textareaStyle = <any>(null)
onMounted(() => {
  if(refDom.value) {
    if(isPLabel.value) {
      textareaStyle = refDom.value
    } else {
      textareaStyle = refDom.value.$el.getElementsByTagName("textarea")[0]
    }
    refreshPlaceholerColor()
    if(commonAttr.isDisplayY) {
      updateScrollY()
    }
  }
})

onBeforeUnmount(() => {
  if(isH5Edit) {
    EventBus.$off('refreshCommonAttr', onRefreshCommonAttr)
    return
  }
  if(isRefresh) {
    EventBus.$off("refreshDynamicData", onRefreshText)
  }
  if(isReplaceByStatisticData) {
    EventBus.$on("refreshStatisticDataText", onRefreshStatisticDataText)
  }
  isRefresh = false;
  textValue_.value = ''
  if(isReplaceByCompId) {
    EventBus.$off("refreshBindText", onRefreshBindText)
  }
  if(item.interactionData){
    let isInGroup = item.interactionData.isInGroup
    let groupInjectClassName = item.interactionData.groupInjectClassName!
    if(isInGroup && groupInjectClassName === INJECT_GROUP_CLASS_NAME_MAP[groupInjectClassName]){
      EventBus.$off("reUpdateTextValue")
    }
  }
})
</script>

<style lang="scss">
 .wb-text{
  width: inherit;
  height: inherit;
  display: flex;
  align-items: center;

  .van-cell{
    width: inherit;
    height: inherit;
  }

  .van-field__body, .van-cell__value--alone, textarea{
    width: inherit;
    height: inherit;
    line-height: inherit;
    color: inherit;
    background-color: inherit;
    text-align: inherit;
    font-weight: inherit;
    font-style: inherit;
    text-decoration: inherit;
    letter-spacing: inherit;
    font-family: inherit;
    font-size: inherit;
    writing-mode: inherit;
  }

  textarea {
    overflow: hidden;
    overflow-scrolling: touch;
      /* ios 自带滚动条不平滑解决方法 */
    tap-highlight-color: rgba(0, 0, 0, 0);
  }
  &.wid-30 ::-webkit-scrollbar {
    width: var(--size-24);
  }
  ::-webkit-scrollbar {
    width: var(--size-8);
  } /* 这是针对缺省样式 (必须的) */
  ::-webkit-scrollbar-track {
    background-color: rgba(42, 12, 12, 0.3);
    box-shadow: inset 0 0 6px rgba(255, 255, 255, 0.8);
    -webkit-box-shadow: inset 0 0 6px rgba(255, 255, 255, 0.8);
  } /* 滚动条的滑轨背景颜色 */

  ::-webkit-scrollbar-thumb {
    background: #fff;
    border-radius: var(--size-8);
  }
  /* 滑块颜色 */
  .red::-webkit-scrollbar-thumb {
    background: red;
  }
  .orange::-webkit-scrollbar-thumb {
    background: orange;
  }
  .yellow::-webkit-scrollbar-thumb {
    background: yellow;
  }
  .green::-webkit-scrollbar-thumb {
    background: green;
  }
  .aqua::-webkit-scrollbar-thumb {
    background: aqua;
  }
  .blue::-webkit-scrollbar-thumb {
    background: blue;
  }
  .purple::-webkit-scrollbar-thumb {
    background: purple;
  }
  .black::-webkit-scrollbar-thumb {
    background: black;
  }
  .white::-webkit-scrollbar-thumb {
    background: white;
  }
  .lightgrey::-webkit-scrollbar-thumb {
    background: lightgrey;
  }
  .lemon::-webkit-scrollbar-thumb {
    background: #fff;
    border-radius: var(--size-8);
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAABNCAYAAAARtbwVAAALCElEQVR4nNVca6zcRhX+xo99Xd8bJw0pTVJogagtVBTMRbRI/ECgEB4FIaJSRahQJBIVUVRRFcGPCspT/QP84ZGIAgKkUqry+NEKKt6vUhGcSjQIEJBKCJS0KXFufDd71/YMOuOx17v27tq7d/cun7TJrj0z9nfOmXPOvC7DFDh8dHXXUp3d3TD1m0MuLjnfjiIA/wDwCICvHjty/M/TtD9rTEz+8NHV95oG+9KOJb0ehMBaJ4LR0GCaGjgX2OhwEXb5NwHceezI8WdzDfy/kj98dPVgFPIHgw2O1rKB5rIJw9DAmOgrF3Q52heiM0KItx87cvyxXENbjMrkDx9d3R6F/NTa2WCbEBzbdzdg76iBsV5TgguEYSyIjQ5H1I2i/bvXv/iGPae/D+CE5Xjncw1vAYzKjxS4Y92LiROYYOhcjNBsGSnxC14AIQSe14rw/O0BrrQ6+jXbLnwQAH3gu/YJACSIb1mO91TuGXNCJc0fPrqqd9rRf9vnuyvJtR2XNWEYDJZtyt/axQBvu+xZXL1tDaYWygeIXEspyEE+BODzluP9Pnd3xqiq+f0bfriiaQxmU4emx7KLotgKwi7HB678D3Y119MKDW1N/i+Ehkg0EULPCkMHcBN9fNf+I4AvAPiO5Xhh7skzQCXyGvih5oqOq3cCB/acx65GG39ZW8FJr4XTbYaDe8/1EU9IM8blx2Dr8oFcCqKFEFq26CuoGwD4uO/a9wL4+qyFUNrsfdfedf+py0/uW+7sXN35TP9NEQFMz9UhaIyjzvzcdajuEPGlQWtI8DcAH7Uc73u5O5uEUuR917YB/BrAtdnrLGBAGEIwDtTrAOO5uoQaW4fOotz1LCKhI0RTWsUAfkqO0nK8TU+YxpL3XZss9WcAXtN3Y0OAcUXW1CCM4U3Rnbq2VkrSZAEhtwa7BJn/p+ljOV6QqzQhcmIuwKdGERfaaOIJoa6wcteLwKQsfekoDaSWRAr4GIA/+K59bUG1iTDyrX3Xvh7A7/rKdTlYFPfQceY+CBMRDG09d30UyGF20cp2hw6AD1mO9+UR1UphKHll7scBXJdcY5S1BRmiNQahlzGebJXx/b8I5BMCsZR1jN+m1MNyvIsFxUth1Ju/O0scQoMIM5GH+nlF4pDmv1Tk2ceCBEZ+Q+tZ2bsA/MZ37T0Tci/WvO/aTQB/BXB5760z5k7JTa068fShTKChnQeYSjNEKIVbFqGyAoV/AXij5Xgnq77HsCfe2kdcRP393Kw+JMhCCIbQXAZftuPPyk7wbTvi70srEI0aoNdz9RIYZAXMTzRH7/lb37VflSs4BjnNq77+zz7y2bBmCIgpySeoWQzMLE6OJAQDC9tAEIIF+QhH6tjgK0k3ojx6v+V4j+cKDkGR5m/KEicnlxKnB24ScUJ3nQN8RKRgJOgmRCu2ElFv9N/uzx9osPWo79ovz7UzBEXkb8/+EGHGOIzNIx43zhD4Jd0f5RONViyEWu89CgTwY9+1X5SrX4A+s1dSc9OGB0KbaJilY3oVmHUBrWVWqxSG0C76qeUMdAFy1tdbjufl6mUwqPlbsz+yWpcefgbECcEGgwgqxn7DALe2Q5ix0AYs4CoA9/uuPcKhZMj7rpyNOJT8ZhEHE5kXMieJzuURrkfx6LAKyCe0liEay6kAar0R5AEAHxnVWlbzrwNwSfKjT+uaNnTIulmQY/z2ZI2JugnRasaEGJdptMI9vmu/OlehgPzBDNs+D8+0Ir+4+Qi7Auh2JxOA2ZQ5AoHGDyoTJI19w3ftRq5CQt53bVLzm9OrYb+JC2Mus0oS3Tarbv4JDCO1gIz57wNwd65sRvOUwz83vRr1pC8zuhmbfBaU/fH25P5F5gWNWjw0ZukI8i7ftV8wWDYh//rkQuzoMmauzY94gqCL/kFURYi6JaMApcHKc5Ez/+xgKwnLdLJC8H6yTMtlwHNBdHG66CKaLTlwymifZoivy5ZJyPc84mC6yWYb4oYhomgzofOTYDp4qyWHwhn1fThbRPNdm/L4nfLXgJePL21ySlsBwUVDpsATgxygaWa1/07ftfem5AG8LBUW7+9nsbObTVZXBpwUMY32ZUq+lNU+9elbkntE/sVpQT5/5zYOwZR9Xw6Iai3ovcnQ96S3ALwwLZjr71tn8gnkxOW02q/XoLM0fdyXzAAT+St6peaXzFRB2Jkyw9Q0sJqedXxvgiK/O7nCKsyjzRNys0s0nfZh9pl+Sj719IsM0Z0y7ps6tN6awQ00iiXG23MlFxDhlIonMDOdMKlRlNPUF/KrucKL5AM4RaIpTX9gsnR1pK0vmg+oPNszWF+vZ53eS8azm3R4OQPwYMo8RNOy47QrxpJn0eJoPwy1fC5SEZmJGUn+3KjqtLtqoTDFUBdyvJP6tt1E/plciSz4YvV7HhY45gpgvay1kSFfPG8uZ3AXyPFFwZTrhD2zb2pqo/BIsGiBnB6FvCn6vcg4cE2tbowcui6Qw48xRb9nvfkBcp9I17XFEAHQBAeLiu9tBabp95lh+zqR7237HDGEXSTti3D42v3Yur0uc1azHO8MgFOQMXA4Q7k5YUEcn3RBE2qD96o9lbB5VP47bmUmWIxcX2Ye0WT5R0bzKfmH5Q1dG9rvobS/MH1/AvJ9ew2AJxPyP1HbOsYuUgw0sGXgE4zwBhZCHpfk1V62B4DxK1PS8y+A+U/i9KLewIgkdyLbyb+GEqYvEbItN39eNdEREXhP87+0HK83M6hOOjwBGfGGh7y0rWBr0145q1tBAFG3z6R/iIJtKbTJX24kHqd9OdHR3drgzyo4Pd5NEyMi9gMUkP8ugL+jpPbl0lZ3tJBmCVFS8yIS4D1H/bDleP/OkbccjycL+bH2x3i/RPrB1kSAsuSjTl+5ryRfijrtA+pUBZhZrnEWhvGpi3lDjM/xSetRb9qbfNqPhpK3HE+o829cen69JCnypHMWgODju2bY7nune5R1S+TIIxbAE+pYh9xdXcb8oSxgnj5AjIk2vCuy4e2xxMsnGFX7E3SsQ36rR+Njv4L0ARtzGgSNeAb5g7CdEqf+8T5l1SmG1lZn2g7JCU6mj94dPQCZBXaCePvqDCFGLKqE65rc3KTwmaL9+EPJKwFQ2HsHSU6eqjBHFs8jUKFwhIamARsyuUq7OTPm/gsAn8wVKnO6ynK8nwO4DSr8VRVA3A02ZmIFQst3RdrIlPHuFM9vthyvMBsrxcRyvPsAvB+JAGrjM8AsZDZIVrAx2yEx9fGwk/I8p46fnMkVVCitRnWU67YkBNKRsrJRIEGcEQrVFQqVUQmpt6djK+sRoo209poi/qdR7VUOzL5r30jbuQHEJ3wCFoe4SV5eZ3IIPckprQRG3UAURjKZUThNmw8sxzuRKzyAibIS37VpB9eDAOITDaTFbn4bW1nQQoIUwpiTmSXwJIAby/5BgolErpIgOpVxn7xAb15XvmCCHdpSaOQTOkE8TzhZdKCc/ZVV/hLD1KL2XfuAOvR/VdpoxOMuzaOJ1/hlWk2HmcY7VjoJdrvleI/k7ozBpiTjvmvX1MGkuwBcmr0nBZEsMYmwlDCkI9X4OPKhOuR8L83K5O6WwKaORNRJTDqnc4fa516MYQIYTrQIBy3He6jgemnMbBjmu/YNaqvnWwDszRWYDp+zHO/OaRuZyxjUd+1rALxWHWp4qdr1+ZxcwRi0ZP602iJ3ae4u8Cs6H7AZf0Rgyybh1bEvIhifC4n78NOW48kJeXX0hc7v0+DqreqUJ01E3GI53tmpXwDA/wCa3FwIIj7tdQAAAABJRU5ErkJggg==);
    background-repeat: no-repeat;
    background-size: contain;
    background-color: transparent;
  }
  .hazeblue::-webkit-scrollbar-thumb {
    background: #1d2b51;
  }
  .landscape::-webkit-scrollbar-thumb {
    background: #ababa0;
  }
  .olive::-webkit-scrollbar-thumb {
    background: olive;
  }
  .chocolate::-webkit-scrollbar-thumb {
    background: chocolate;
  }
  .coral::-webkit-scrollbar-thumb {
    background: coral;
  }
  .crimson::-webkit-scrollbar-thumb {
    background: crimson;
  }
  .tomato::-webkit-scrollbar-thumb {
    background: tomato;
  }
  .darkgray::-webkit-input-placeholder {
    color: darkgray;
  }
  .gainsboro::-webkit-input-placeholder {
    color: gainsboro;
  }
  .ghostwhite::-webkit-input-placeholder {
    color: ghostwhite;
  }
  .silver::-webkit-input-placeholder {
    color: silver;
  }
  .whitesmoke::-webkit-input-placeholder {
    color: whitesmoke;
  }
  .aliceblue::-webkit-input-placeholder {
    color: aliceblue;
  }
  .purple::-webkit-input-placeholder{
    color: purple;
  }
}

</style>