<template>
  <inject-template :item="item" :pageId="pageId" :popId="popId" :isPropagation="false">
    <template v-slot:common>
      <div class="wb-checkbox" :data-id="item.id">
        <van-checkbox-group v-model="checked" :direction="direction" :checked-color="selectedColor" :icon-size="getIconSite" :max="commonAttr.max" @change="onUpdateFormValue">
          <van-checkbox v-for="(checkboxItem, index) in lists_" :style="styles"
            :key="index" :name="index+1" :shape="commonAttr.shape" :label-position="commonAttr.textAlign">
            {{checkboxItem.text}}
            <template v-if="activeIcon" #icon="props">
              <img class="img-icon" :src="props.checked ? activeIcon : inactiveIcon" />
            </template>
          </van-checkbox>
        </van-checkbox-group>
      </div>
    </template>
  </inject-template>
</template>


<script setup lang="ts">
import { COMMON_WID_HEI } from '@/const/'
import { getCompStyle, getListByItem } from '@/components/utils/'
import { useInteractionStore } from '@/store/interaction'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
}>()
const item = props.item
const commonAttr = item.commonAttr
const useInteraction = useInteractionStore()
const styles = computed(() => {
  const style = getCompStyle(item)
  delete style.fontSize
  return style
})
const lists_ = computed(() => {
  return getListByItem(item)
})
const checked = ref([])

const direction = computed(() => {
  return commonAttr.isColumn ? 'horizontal' : 'vertical'
})
const activeIcon = computed(() => {
  return commonAttr.selectedStyles.url
})
const inactiveIcon = computed(() => {
  return commonAttr.itemStyles.url
})
const getIconSite = computed(() => {
  return commonAttr.fontSize/COMMON_WID_HEI.adaptiveScale
})
const selectedColor = computed(() => {
  return commonAttr.selectedStyles.backgroundColor
})

const onUpdateFormValue = (selecteds: number[]) => {
  const lists = lists_.value
  let value = ''
  _.forEach(selecteds, (index: number) => {
    value += lists[index-1].text + ','
  })
  useInteraction.updateFormValueMap({id: item.id, value, selecteds: selecteds, lists})
}

const initComp = () => {
  useInteraction.updateFormValueMap({ id: item.id, value: '' })
}

initComp()
</script>

<style lang="scss">
.wb-checkbox, .van-checkbox-group {
  width: inherit;
  height: inherit;
}
.van-checkbox__label {
  color: inherit;
  background-color: inherit;
}

</style>