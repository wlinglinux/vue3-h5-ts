<template>
  <inject-template :item="item" :pageId="pageId" :popId="popId">
    <template v-slot:common>
      <div class="wb-input" @click.stop>
        <van-field
          :center="true"
          :border="false"
          :maxlength="commonAttr.limitTextNum ? commonAttr.limitTextNum : 100"
          type="text"
          :name="commonAttr.name"
          :readonly="commonAttr.name === 'fixed' ? true : false"
          :placeholder="commonAttr.placeholder"
          :autofocus="autofocus"
          :autocomplete="autocomplete"
          v-model="inputValue"
          :style="styles"
          :class="['padding-8-16', commonAttr.placeholerColor]"
          @update:model-value="updateFormValueMap"></van-field>
        <span class="need-cls font-size-24" v-show="commonAttr.need && commonAttr.isShowNeed">*</span>
      </div>
    </template>
  </inject-template>
</template>

<script setup lang="ts">
import { useSiteStore } from '@/store/site'
import { useInteractionStore } from '@/store/interaction'
import { INPUT_USER_TYPES_MAP } from '@/const/'
import { getCompStyle } from '@/components/utils/'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
}>()
const item = props.item
const commonAttr = item.commonAttr
const useSite = useSiteStore()
const useInteraction = useInteractionStore()
const autofocus = ref(false)
const autocomplete = ref('off')
const styles = computed(() => {
  return getCompStyle(item)
})
const inputValue_ = ref(commonAttr.value)
const inputValue = computed({
  get: () => {
    if(useSite.isH5Edit) {
      return inputValue_.value
    } else if ((commonAttr.isAuto || commonAttr.userAttr) && useSite.userInfo.uid) {
      if(commonAttr.isAuto || commonAttr.userAttr == INPUT_USER_TYPES_MAP.name) {
        inputValue_.value = useSite.userInfo.name
      } else if (commonAttr.userAttr == INPUT_USER_TYPES_MAP.level) {
        let text = ''
        //是否是微博认证用户，即加V用户，true：是，false：否，专页无此属性即为false
        //verified_type 微博认证用户类型，当verified为true时，其中0是黄V，1～7是蓝V
        //verified_type_ext 微博认证用户类型扩展字段，当verified_type为0时，0是橙v，1是金v；当verified_type为蓝V时，-1是灰v, 0是普通蓝V，1-50表示不同等级蓝V
        if(useSite.userInfo.verified) {
          if(useSite.userInfo.verified_type == 0) {
            if(useSite.userInfo.verified_type_ext == 0) {
              text = '橙v'
            } else if (useSite.userInfo.verified_type_ext == 1) {
              text = '金v'
            } else {
              text = '黄v'
            }
          } else if (useSite.userInfo.verified_type >= 1 && useSite.userInfo.verified_type <= 7) {
            text = '蓝v'
          }
        }
        inputValue_.value = text
      } else {
        inputValue_.value =  ''
      }
    }
    return inputValue_.value
  },
  set: (value: string) => {
    inputValue_.value = value
  }
})
const updateFormValueMap = (text: string) => {
  // inputValue_.value = e.target.value
  let value: string = ''
  if(text) {
    value = text
  }else if(inputValue_.value && inputValue_.value.length > 0) {
    value = inputValue_.value
  }
  if(!useSite.isH5Edit) {
    useInteraction.updateFormValueMap({ id: item.id, value })
  }
}

const initComp = () => {
  if(inputValue_.value && inputValue_.value.length > 0){
    updateFormValueMap(inputValue_.value)
  } else {
    useInteraction.updateFormValueMap({ id: item.id, value: '' })
  }
}
initComp()
</script>

<style lang="scss">
.wb-input {
  display: flex;
  align-items: center;
  width: inherit;
  height: inherit;
  font-size: 0;

  .van-cell{
    width: inherit;
    height: inherit;
  }

  .van-field__body, .van-cell__value--alone, input{
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
.wb-input input {
  width: inherit;
  height: inherit;
}

</style>
