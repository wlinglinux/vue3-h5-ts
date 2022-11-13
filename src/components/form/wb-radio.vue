<template>
  <inject-template :item="item" :pageId="pageId" :popId="popId" :isPropagation="false">
    <template v-slot:common>
      <div class="wb-radio" :data-id="item.id">
        <div v-if="commonAttr.title && commonAttr.title.length > 0" class="radio-title" :style="titleStyle" @click.stop>
          <strong>{{commonAttr.title}}</strong>
          <span v-show="item.commonAttr.need">*</span>
        </div>
        <van-radio-group v-model="checked" :direction="direction" :checked-color="selectedColor" :icon-size="getIconSite" @change="onUpdateFormValue">
          <template v-if="isRightIcon" >
            <van-radio v-for="(radioItem, index) in lists_" :style="styles" :key="index" :name="index+1" :shape="commonAttr.shape">
              {{radioItem.text}}
              <template v-if="activeIcon" #icon="props">
                <img class="img-icon" :src="props.checked ? activeIcon : inactiveIcon" />
              </template>
            </van-radio>
          </template>
          <van-cell-group v-else inset>
            <van-cell v-for="(radioItem, index) in lists_" :key="index" :title="radioItem.text" :style="styles" clickable :border="false" @click="checked=index+1">
              <template #right-icon>
                <van-radio :name="index+1" :shape="commonAttr.shape">
                  <template v-if="activeIcon" #icon="props">
                    <img class="img-icon" :src="props.checked ? activeIcon : inactiveIcon" />
                  </template>
                </van-radio>
              </template>
            </van-cell>
          </van-cell-group>
        </van-radio-group>
      </div>
    </template>
  </inject-template>
</template>

<script setup lang="ts">
//:label-position="commonAttr.textAlign"
import { COMMON_WID_HEI, RADIO_CHECKBOX_TYPE_MAP } from '@/const/'
import { EventBus, getPxOVwByValue } from '@/utils/'
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
  const styles_ = getCompStyle(item)
  return styles_
})
const titleStyle = computed(() => {
  const fontSize = commonAttr.fontSize ? commonAttr.fontSize : 24
  return {
    height: getPxOVwByValue(fontSize*1.5),
  }
})

const checked = ref(0)
const isRightIcon = computed(() => {
  return !(commonAttr.itemType == RADIO_CHECKBOX_TYPE_MAP.btn) || commonAttr.isRightIcon
})

const interactionData = useInteraction.shareInteractionData
const lists_ = computed(() => {
  return getListByItem(item)
})
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
  return commonAttr.fontSize/COMMON_WID_HEI.adaptiveScale*1.2
})
const selectedColor = computed(() => {
  return commonAttr.selectedStyles.backgroundColor
})
const onUpdateFormValue = (id: number) => {
  const index = id - 1 
  const lists = lists_.value
  const listItem = lists[index]
  useInteraction.updateFormValueMap({ id: item.id, value: listItem.text, item: listItem })
  useInteraction.updateInteractionData({ swiperIndex: index })

  if(commonAttr.isNotForm) {
    //选择了那个选项，将数据存储起来，在最后使用
    const interactionData_ = _.cloneDeep(interactionData)
    interactionData_.clickCompIdMap.set(item.id, listItem)
    useInteraction.updateInteractionData(interactionData_)
  }

  if(interactionData.isEmitClick) {
    EventBus.$emit("itemClick", {id: item.id, index})
  }

  // const jumpUrl = 'radio_' + index
  // const comType = "click"
  // const wModule = "jump"
  // onPostStatics({ item, e: null, comType, wModule, jumpUrl, params: '', apiUri: '' })
}

const initComp = () => {
  useInteraction.updateFormValueMap({ id: item.id, value: '' })
}

initComp()
</script>



<style lang="scss">
.wb-radio {
  width: inherit;
  height: inherit;

  .van-radio-group {
    width: inherit;
    height: inherit;
  }
  .van-cell__title {
    font-size: inherit;
  }
  .van-cell-group--inset {
    margin: 0;
  }

  .radio-title {
    color: inherit;
    background-color: initial;

    span {
      color:red;
    }
  }
}

</style>