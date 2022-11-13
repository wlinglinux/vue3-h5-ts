<template>
  <div class="wb-item-common">
    <img v-if="getVariableItem.url" :src="getVariableItem.url" @click="onJump($event, item, itemIndex)" @load="onImgLoaded" :style="imgStyle_">
    <div class="head-name-con">
      <div class="head-con" v-if="getVariableItem.pic_url"><img :src="getVariableItem.pic_url"></div>
      <div class="name-con head-content-con">
        <h3 class="common-title" :style="fontStyle_" @click.stop> {{ getBlogTitle }} </h3>
        <div class="head-content-con content-con" @click.stop="onJump($event, item, itemIndex)">
          <p class="text" :style="getTextStyle_">{{ getBlogText_ }}</p>
        </div>
      </div>
    </div>
    <div v-if="dataKeys && (dataKeys.attitudes_count || dataKeys.comments_count)" class="info-con padding-0-12" @click.stop>
      <p class="info-comment padding-0-12" v-if="dataKeys.comments_count">
        评论{{getVariableItem.comments_count}}
      </p>
      <div class="info-praise padding-0-12" v-if="dataKeys.attitudes_count ">
        <img class="margin-right-12 width-26" @click.stop="onPraise($event)" :src="'//static.hd.xxx.com/upload/biz/26/439747.png'" alt="">
        <span class="praise-num" style="font-weight:normal;">{{ getVariableItem.attitudes_count }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fontStyle, getWbListOrListByItem, onJump, getItemIndex, getBlogText, imgStyle, getTextStyle } from '@/components/utils/'
import { EVENT_HOVER_TYPES, CONTROL_TYPES } from "@/const"
import { POST_API_MAP } from '@/service/api'
import { post } from '@/components/events/post-event'
import { useSiteStore } from '@/store/site'

const props = defineProps<{ 
  item: IComponent,
  index: number
}>()
const item = props.item
const useSite= useSiteStore()
const itemIndex = getItemIndex(item, props.index)
const dataKeys= item.dataKeys
const imgStyle_ = computed(() => {
  return imgStyle(item)
})
const fontStyle_ = computed(() => {
  const styles_ = {}
  return fontStyle(item.commonAttr, styles_)
})
const getTextStyle_ = computed(() => {
  return getTextStyle(item)
})
let getVariableItem_: any
const getVariableItem: any = computed(() => {
  const list = getWbListOrListByItem(item)
  getVariableItem_ = list[props.index]
  return getVariableItem_
})
const getBlogTitle = computed(() => {
  return getVariableItem_.push_title || getVariableItem_.title || getVariableItem_.name
})
const getBlogText_ = computed(() => {
  return getBlogText(item, itemIndex)
})
const onImgLoaded = () => {
  if(!useSite.isH5Edit) {
    item.interactionData.isLoaded = true
  }
}

const onPraise = (e: any)=> {
  if(useSite.isH5Edit) return
  e.stopPropagation()
  let url = POST_API_MAP.praise
  let params = {
    com_id: item.id,
    type: EVENT_HOVER_TYPES.praise,
    mid: getVariableItem_.mid,
    controlId: CONTROL_TYPES.wb_reposts
  }
  item.eventShare.e = e
  post(url, params, item)
}
</script>

<style lang="scss">
.wb-item-common {
  position: relative;
  display: block;
  text-align: center;
  .common-title {
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 1;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    text-align: left;
  }
  .info-con{
    color: #878787;
    display: flex;
    padding: var(--size-12) 0;
    justify-content: space-between;
    align-items: center;
    font-size: var(--size-12); 
    p {
      font-size: inherit;
    }
    .info-praise {
      display: flex;
      justify-items: center;
      align-items: center;
    }
  }
  .vote-con {
    font-size: var(--size-12);
    color: #f00;
  }
  .top-head-name-con{
    top: var(--size--50);
    position: absolute;
  }
  .head-name-con{
    display: flex;
    flex-direction: row;
    align-content: center;
    align-items: center;

    .head-con{
      margin-right: var(--size-12);
      border-radius: 50%;
      img {
        width: var(--size-80);
        height: var(--size-80);
        object-fit: contain;
        border-radius: 50%;
      }
    }
    .name{
      font-weight: 600;
      margin-right: var(--size-10);
    }
  }
  .head-content-con{
    margin-top: var(--size-10);
    .text{
      margin-top: var(--size-10);
      font-size: inherit;
      line-height: inherit;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
    }
  }
  .content-con{
    .text{
      max-width: 100%;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      text-align: left;
    }
  }
  .btn-con{
    width: inherit;
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0);
    bottom: 0;
  }
  .head-name-con{
    display: flex;
    flex-direction: row;
    align-content: center;
    align-items: center;

    .head-con{
      margin-right: var(--size-12);
      border-radius: 50%;
      img {
        width: var(--size-80);
        height: var(--size-80);
        object-fit: contain;
        border-radius: 50%;
      }
    }
    .name {
      font-weight: 600;
      margin-right: var(--size-10);
    }
  }
}
</style>