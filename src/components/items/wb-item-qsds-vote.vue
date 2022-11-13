<template>
<div class="wb-item-qsds-vote">
  <div class="item-qsds-vote" :style="qsdsItemStyle">
    <div v-if="dataKeys && dataKeys.pic_url" class="vote-head-con" @click.stop>
      <p v-if="getVariableItem && commonAttr.isSort" class="padding-0-8 font-bold"> {{ index+1 }} </p>
      <div class="qsds-head-img">
        <img class="head-img" :src="getImgOrHeadUrl" :style="imgStyle_">
      </div>
    </div>
    <p v-else class="qsds-vote-con-img" @click.stop="onJump($event, item, itemIndex)">
      <img v-if="getVariableItem && getVariableItem.url" :src="getVariableItem.url" :style="imgStyle_"/>
    </p>
    <p class="qsds-vote-con-title padding-left-16" @click.stop="onJump($event, item, itemIndex)">
      <span class="qsds-vote-con-title-num">
        <b v-if="dataKeys && dataKeys.name">{{ getUserName }}</b>
        <b v-else>{{ getVariableItem.push_title || getVariableItem.title }}</b>
      </span>
      <span class='vote-con-title-desc'>
        {{ getBlogText_ }}
      </span>
    </p>
    <van-button v-if="commonAttr.isBtn" :style="btnStyle_"></van-button>
  </div>
  <p @click.stop class="votePosition" :style="fontStyle_">{{ getVariableItem.num }}票</p>
</div>
</template>

<script setup lang="ts">
import { getWbListOrListByItem, getItemIndex, getItemBaseControl, getBlogText, onJump, imgStyle, fontStyle, btnStyle } from '@/components/utils/'
import { CONTROL_TYPES } from '@/const/'
import { useSiteStore } from '@/store/site'

const props = defineProps<{ 
  item: IComponent,
  index: number,
}>()
const item = props.item
const commonAttr = item.commonAttr
const useSite = useSiteStore()
const itemIndex = getItemIndex(item, props.index)
let getVariableItem_: any
const getVariableItem: any = computed(() => {
  const list = getWbListOrListByItem(item)
  getVariableItem_ = list[itemIndex]
  return getVariableItem_
})
const btnStyle_ = btnStyle(item.btn!)
const fontStyle_ = computed(() => {
  const styles_ = {}
  return fontStyle(item.commonAttr, styles_)
})
const imgStyle_ = computed(() => {
  return imgStyle(item)
})
const qsdsItemStyle = computed(() => {
  const index = props.index
  const styles_: any = {}
  fontStyle(item.commonAttr, styles_)
  let url = ""
  if(commonAttr.bgUrl) {
    url = commonAttr.bgUrl
  } else {
    const itemBgs = commonAttr.itemBgs && commonAttr.itemBgs.split(",")
    if(itemBgs) {
      let len = itemBgs.length - 1
      if (index <= len) {
        url = itemBgs[index]
      } else {
        url = itemBgs[len]
      }
    }
  }
  if(url) {
    styles_.backgroundImage = "url(" + url + ")";
  }
  return styles_
})
const getBlogTitle = computed(() => {
  return getVariableItem_.push_title || getVariableItem_.title
})
const getImgOrHeadUrl = computed(() => {
  //用户头像，博文中的图片
  return getVariableItem_.frontPicUrl || getVariableItem_.pic_url || getVariableItem_.user.avatar_large
})
const getUserName = computed(() => {
  const baseControl = getItemBaseControl(item.id, CONTROL_TYPES.wb_user)
  if(baseControl) {
    return (baseControl.data as IUserControl).namePrefix + getVariableItem_.name
  } else {
    return getVariableItem_.name
  }
})
// const repostItemData = computed(() => {
//   const repostBaseControl = getItemBaseControl(item.id, CONTROL_TYPES.wb_reposts)
//   return repostBaseControl && (repostBaseControl.data as IBaseListControl).elements[itemIndex]
// })
// const userItemData = computed(() => {
//   const useBaseControl = getItemBaseControl(item.id, CONTROL_TYPES.wb_user)
//   return useBaseControl && (useBaseControl.data as IBaseListControl).elements[itemIndex]
// })
const getBlogText_ = computed(() => {
  return getBlogText(item, itemIndex)
})
const dataKeys: any = computed(() => {
  return item.dataKeys
})

const onImgLoaded = () => {
  item.interactionData.isLoaded = true
}

onMounted(() => {
})

</script>


<style lang="scss">
.wb-item-qsds-vote{
  height: 100%;
  position: relative;
  
  .item-qsds-vote {
    height: 100%;
    display: flex;
    flex: auto;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    align-content: center;
    background-size: contain;
    background-repeat: no-repeat;
    .qsds-vote-con-img {
      display: flex;
      justify-content: center;
      justify-items: center;
      align-items: center;
      align-content: center;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    .qsds-vote-con-title {
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-width: 0;
      flex: 1;
      height: inherit;
      span {
        position: relative;
        width: 99%;
      }
      .qsds-vote-con-title-num {
        display: flex;
        b{
          font-size: inherit;
          color: inherit;
        }
        b:last-child {
          margin-left: var(--size-12);
          font-size: 0.8em;
        }
      }
      .vote-con-title-desc {
        font-size:inherit;
        line-height:1.4;
        opacity: 0.6;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
      }
    }
  }
  .vote-head-con {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    .rank {
      position: absolute;
    }
    .qsds-head-img{
      width: 100%;
      height: 100%;
      .head-img {
        width: 100%;
        object-fit: contain;
        border-radius: 50%;
      }
    }
  }
  .votePosition {
    position: absolute;
    right: var(--size-120);
    top: var(--size-8);
  }
}

</style>