<template>
  <inject-template :item="item" :pageId="pageId" :popId="popId">
    <template v-slot:common>
      <div class="wb-is-post-event" :style="styles" @click.stop="onChangeAttr">
        <van-checkbox v-if="!commonAttr.selectedCheckboxUrl" v-model="isChecked"
          :checked-color="commonAttr.backgroundColor" shape="square" ref="refDom">{{commonAttr.text}}</van-checkbox>
        <van-checkbox v-else v-model="isChecked"
          :checked-color="commonAttr.backgroundColor" shape="square" ref="refDom">
          {{commonAttr.text}}
          <template #icon="props">
            <img class="img-icon" :src="props.checked ? commonAttr.selectedCheckboxUrl : commonAttr.checkboxUrl" />
          </template>
        </van-checkbox>
      </div>
    </template>
  </inject-template>
</template>

<script setup lang="ts">
import { CONTROL_TYPES } from '@/const/'
import { getCompIdByParam, getPxOVwByValue } from '@/utils/'
import { useSiteStore } from '@/store/site'
import { useControlsStore } from '@/store/controls'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
}>()
const item = props.item
const commonAttr = item.commonAttr
const useSite = useSiteStore()
const useControls = useControlsStore()
const isH5Edit = useSite.isH5Edit
const styles = computed(() => {
  return {
    color: commonAttr.color,
    fontSize: getPxOVwByValue(commonAttr.fontSize),
  }
})

const isChecked = ref(true)

const onChangeAttr = () => {
  if (!isH5Edit) {
    setGlobalIsPost()
  }
}
const setGlobalIsPost = () => {
  const globalIsPost: any = {}
  let followUid = ''
  const baseControl = useControls.controls[item.id]
  if(baseControl && baseControl[CONTROL_TYPES.wb_follow]) {
    const followControlData = baseControl[CONTROL_TYPES.wb_follow].data as IFollowControl
    followUid = followControlData.follow_uid
  }
  let key = commonAttr.interfaceType + 'ClickMap'
  globalIsPost[key] = {}
  if(followUid) {
    globalIsPost.isFollowClickMap[followUid] = isChecked
  } else {
    globalIsPost[commonAttr.interfaceType] = isChecked //isPush isPushImg isFollow 
    globalIsPost[key][getCompIdByParam(commonAttr.relateCompId)] = isChecked
  }
  useSite.updateGlobalPost(globalIsPost)

  window.setTimeout(() => {
    changeCheckboxStyle()
  }, 20)
}

const changeCheckboxStyle = () => {
  const iconSize = getPxOVwByValue(commonAttr.fontSize)
  if(!commonAttr.selectedCheckboxUrl) {
    let checkboxStyle = checkbox.$el.getElementsByTagName("i")[0]
    checkboxStyle.style.border = "2px solid " + commonAttr.borderColor
    checkboxStyle.style.fontSize = iconSize
  } else {
    const checkboxStyle = checkbox.$el.getElementsByTagName("img")[0]
    if(commonAttr.text && commonAttr.text.length > 0){
      // checkboxStyle.style.width = iconSize
      // checkboxStyle.style.height = iconSize
    }
  }
}
const refDom = ref<any>(null)
let checkbox: any
onMounted(() => {
  checkbox = refDom.value
  onChangeAttr()
  changeCheckboxStyle()
})
</script>

<style lang="scss">
.wb-is-post-event {
  width: inherit;
  height: inherit;
  display: flex;
  justify-content: center;
  align-items: center;

  .van-checkbox {
    font-size: inherit;
    color: inherit;
    width: inherit;
    height: inherit;

    span {
      font-size: inherit;
      color: inherit;
    }
  }

  .img-icon{
    width: inherit;
    height: inherit;
  }
}
</style>