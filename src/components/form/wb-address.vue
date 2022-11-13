<template>
  <inject-template :item="item" :pageId="pageId" :popId="popId">
    <template v-slot:common>
      <div class="wb-address" ref="refDom" :data-id="item.id" @click.stop>
        <van-cell is-link @click="onShowPopup" :style="adressStyles">{{ address }}</van-cell>
        <van-popup v-model:show="isShowAddress" teleport="body" position="bottom" round>
          <van-area :area-list="AreaList" @confirm="onConfirm" @cancel="onCancel"/>
        </van-popup>
      </div>
    </template>
  </inject-template>
</template>


<script setup lang="ts">
import { isHasOwnProperty } from '@/utils/'
import { getCompStyle } from '@/components/utils/'
import { useInteractionStore } from '@/store/interaction'
import AreaList from '@/components/form/js/area'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
}>()
const item = props.item
const commonAttr = item.commonAttr
const useInteraction = useInteractionStore()
const isShowAddress = ref(false)
const address = ref('')
const adressStyles = computed(() => {
  const styles = getCompStyle(item)
  styles.padding = 0
  return styles
})

const onShowPopup = () => {
  isShowAddress.value = true
}
const setAreaModel = (arr: any[]) => {
  let areaName = ''
  for (var i = 0; i < arr.length; i++) {
    areaName = areaName + ( i == 0 ? '' : '/') + arr[i].name
  }
  address.value = areaName
}
//确定选择城市
const onConfirm = (arr: []) => {
  isShowAddress.value = false//关闭弹框
  setAreaModel(arr)

  // const jumpUrl = "address"
  // const comType = "click"
  // const wModule = "jump"
  // onPostStatics({ item, e: null, comType, wModule, jumpUrl, params: '', apiUri: '' })
}
const onCancel = () => {
  isShowAddress.value = false
  area.reset()// 重置城市列表
}
const updateFormValue = () => {
  useInteraction.updateFormValueMap({ id: item.id, value: address.value })
}
const refDom = ref<any>(null)
let area: any
onMounted(() => {
  area = refDom.value
  const arrowBtn = area.getElementsByClassName('van-cell__right-icon')[0]
  if(isHasOwnProperty(commonAttr, "arrowBtnColor") && arrowBtn) {
    arrowBtn.style.color = commonAttr.arrowBtnColor
  }
})
</script>


<style lang="scss">
.wb-address {
  width: inherit;
  height: inherit;
  padding: 0;


  .van-cell__value--alone{

    span{
      padding: 0.14rem;
      display: inline-block;
      color: inherit;
    }
  }
}
</style>