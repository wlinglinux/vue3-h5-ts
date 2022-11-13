<template>
  <inject-template :item="item" :pageId="pageId" :popId="popId" :isPropagation="false">
    <template v-slot:common>
      <div class="wb-upload" :data-id="item.id" @click.stop ref="refDom">
        <van-uploader
          v-model="fileList"
          :max-count="uploadCount"
          :max-size="maxsize"
          :accept="accept"
          :deletable="isDisplayDeleteBtn"
          @oversize="onOversize"
          @delete="onDelete"
          :before-read="onBeforeRead"
          :after-read="onAfterRead"
        >
        <template v-slot:default v-if="item.commonAttr.imgUrl" >
          <img :src="item.commonAttr.imgUrl" class="uploader-bg"/>
        </template>
        </van-uploader>
        <span class="need-cls font-size-24" v-show="item.commonAttr.need">*</span>
      </div>
    </template>
  </inject-template>
</template>

<script setup lang="ts">
import { CONTROL_TYPES } from '@/const/'
import { isHasOwnProperty, getPxOVwByValue, getCompIdByParam } from '@/utils/'
import { getCompStyle, showToast,  } from '@/components/utils/'
import { useSiteStore } from '@/store/site'
import { useInteractionStore } from '@/store/interaction'
import { useControlsStore } from '@/store/controls'
import { SaveImgEvent } from '@/components/events/fronts/'


const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
}>()
const item = props.item
const commonAttr = item.commonAttr
const useSite = useSiteStore()
const useInteraction = useInteractionStore()
const useControls = useControlsStore()
const styles = computed(() => {
  return getCompStyle(item)
})
const uploadCount = ref(commonAttr.uploadCount ? commonAttr.uploadCount : 1)
const isDisplayDeleteBtn = isHasOwnProperty(commonAttr, 'isDisplayDeleteBtn') ? commonAttr.isDisplayDeleteBtn : true
const fileList = ref([])
      
let maxsize =  1024 * 1024 * Number(props.item.commonAttr.uploadLimitSize),
    minsize =  1024 * 1024 * 0.2,
    accept =  "image/png,image/jpeg",
    // uploadLoading: {
    //   url: "https://img.yzcdn.cn/vant/leaf.jpg",
    //   status: "uploading",
    //   message: "上传中...",
    // },
    // uploadFail: {
    //   url: "https://img.yzcdn.cn/vant/tree.jpg",
    //   status: "failed",
    //   message: "上传失败",
    // },
    fileUrls = {},
    fileNames: string[] = []

const onOversize = () => {
  showToast(`文件大小不能超过${Math.round(commonAttr.uploadLimitSize)}M`)
}
const updateUploadFormValue = () => {
  const urls: string[] = []
  fileNames = []
  _.forEach(fileList.value, (file_: any) => {
    urls.push(fileUrls[file_.file.name])
    fileNames.push(file_.file.name)
  })
  useInteraction.updateFormValueMap({
    id: item.id,
    urls,
  })
}
const onDelete = () => {
  updateUploadFormValue()
  const saveEvent = item.events.saveImg
  if(saveEvent) {
    let pushCompId = getCompIdByParam(saveEvent.comps[0].attrs.value)
    if(pushCompId) {
      useControls.deletePushPicItem({ id: pushCompId, controlId: CONTROL_TYPES.wb_push, fileNames })
    }
  }
}
const onBeforeRead = (file: any) => {
  if (accept.indexOf(file.type) == -1) {
    showToast("请上传 jpg/png 格式图片")
    return false
  }
  return true
}

const onAfterRead = (file: any) => {
  file.status = "uploading"
  file.message = "上传中..."

  const fileName = file.file.name
  const suffix = fileName.split(".")[1]
  const base64 = file.content
  const saveEvent = item.events.saveImg
  const saveImgEvent = new SaveImgEvent(item)

  const uploadSuccess = (url: string) => {
    fileUrls[fileName] = url
    item.commonAttr.cropUploadImgUrl = url
    updateUploadFormValue()
    file.status = ""
    file.message = ""
  }
  const uploadFail = () => {
    file.status = "failed"
    file.message = "上传失败"
  }
  if(saveEvent) {
    const blob = saveImgEvent.base64ToBlob(base64),
    pushCompId = getCompIdByParam(saveEvent.comps[0].attrs.value)
    if(pushCompId) {
      saveImgEvent.setUploadParams(blob, base64, pushCompId, '', fileName, uploadSuccess, uploadFail)
    }
  } else {
    saveImgEvent.fileToBlob(
    base64,
    suffix,
    uploadSuccess,
    uploadFail
    )
  }
}
const refDom = ref<any>(null)
let upload: any
onMounted(() => {
  upload = refDom.value
  const docStyle = upload.style
  if(uploadCount.value > 1) {
    docStyle.setProperty(`--van-uploader-w-size`, getPxOVwByValue(item.conAttr.height))
    docStyle.setProperty(`--van-uploader-h-size`, getPxOVwByValue(item.conAttr.height))
  } else {
    docStyle.setProperty(`--van-uploader-w-size`, getPxOVwByValue(item.conAttr.width))
    docStyle.setProperty(`--van-uploader-h-size`, getPxOVwByValue(item.conAttr.height))
  }
  updateUploadFormValue()
})
</script>


<style lang="scss">
.wb-upload {
  width: inherit;
  height: inherit;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.van-uploader__mask-message {
  padding: 0;
  margin-top: 0;
  font-size: var(--size-8);
  line-height: 1;
}
.van-loading {
  position: relative;
  font-size: 0;
  vertical-align: middle;
}
.van-uploader__upload {
  border-radius: var(--size-8);
}
.van-uploader__preview-delete-icon{
  font-size: var(--size-36);
}
.van-uploader__preview-delete{
  width: var(--size-36);
  height: var(--size-36);
}
.van-uploader__mask{
  width: inherit;
  height: inherit;
}
.uploader-bg {
  width: 100%
}
.van-uploader__upload, .van-uploader__preview-image {
  width: var(--van-uploader-w-size);
  height: var(--van-uploader-h-size);
  margin: 0;
}
</style>