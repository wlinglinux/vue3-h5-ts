<template>
  <inject-template :item="item" :pageId="pageId" :popId="popId" :isPropagation="false">
    <template v-slot:common>
      <div class="wb-camera">
        <img v-if="cropUploadImgUrl && isHtml2canvas" :src="cropUploadImgUrl" class="crop-img" :id="'crop-' + item.id">
        <img v-if="commonAttr.isCutImage" class="crop-frame" :src="commonAttr.cropFrameUrl" :style="cropFrameStyle">
        <canvas v-if="commonAttr.isCutImage" id="canvasImg"></canvas>
        <div class="drag-resize-con" v-show="!isHtml2canvas">
          <croppa
            :style="cameraStyles"
            ref="refDom"
            v-model="croppaData"
            :width="croppaWidth"
            :height="croppaHeight"
            prevent-white-space
            :canvas-color="commonAttr.canvasColor"
            :placeholder="placeholder"
            :placeholder-color="commonAttr.placeholderColor"
            :placeholder-font-size="commonAttr.placeholderFontSize"
            :show-remove-button="commonAttr.isShowRemoveButton"
            :remove-button-color="commonAttr.removeButtonColor"
            :remove-button-size="parseInt(commonAttr.delButtonSize)"
            :show-loading="commonAttr.isShowLoading"
            :loading-size="parseInt(commonAttr.loadingSize)"
            :loading-color="commonAttr.loadingColor"
            :zoom-speed="commonAttr.zoomSpeed"
            :quality="parseInt(commonAttr.quality)"
            :initial-image="commonAttr.initialImage"
            :file-size-limit="commonAttr.fSizeLimit"
            initial-size="cover"
            initial-position="center"
            :accept="accept"
            @file-size-exceed="onFileSizeExceed"
            @new-image-drawn="onComplete"
            @new-image="onChangeOrientation"
            @zoom="onZoom"
            @image-remove="onImageRemove"
            >
            <div class="spinner" v-if="croppaData && croppaData.loading"></div>
            <template v-slot:placeholder v-if="commonAttr.isPlaceholderImg">
              <img  class="img-placeholder" crossOrigin="anonymous" :src="commonAttr.placeholderUrl">
            </template>
          </croppa>
        </div>
        <img v-if="commonAttr.isCutImage" class="crop-line-left" :src="commonAttr.cropFrameLineUrl"  :style="cropFrameLeftStyle">
        <img v-if="commonAttr.isCutImage" class="crop-line-right" :src="commonAttr.cropFrameLineUrl"  :style="cropFrameRightStyle">

        <div v-show="isPoster && isDrawImg && isHavePoster" class="poster-con">
          <wb-moveable :item="item" :pageId="pageId" :popId="popId" ref="refMoveable"></wb-moveable>
        </div>
      </div>
    </template>
  </inject-template>
</template>

<script setup lang="ts">
import WbMoveable from './wb-moveable.vue'
import Croppa from '@/components/croppa/cropper.vue'

import { getCompStyle, showAlert } from '@/components/utils/'
import { useSiteStore } from '@/store/site'
import { useControlsStore } from '@/store/controls'
import { useInteractionStore } from '@/store/interaction'
import { EventBus, isJSON, isWeibo, getPxOVwByValue } from '@/utils/'
import { COMMON_WID_HEI } from '@/const/'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
}>()
const item = props.item
const interactionData = item.interactionData
const commonAttr = item.commonAttr
const styles = computed(() => {
  return getCompStyle(item)
})
const useSite = useSiteStore()
const siteInfo = useSite.siteInfo
const componentMap = useSite.componentMap
const useInteraction = useInteractionStore()
const useControls = useControlsStore()
const isH5Edit = useSite.isH5Edit

let cropUploadImgUrl = ref(''),
  isHtml2canvas = ref(false),
  isDrawImg = ref(false),
  isHavePoster = ref(false)

let croppa = {},
cropFrameStyle = {
  top: '0',
  left: '0',
  width: '0',
  height: '0',
},
cropFrameLeftStyle = {
  top: '0',
  left: '0',
  width: '0',
  height: '0',
},
cropFrameRightStyle = {
  top: '0',
  left: '0',
  width: '0',
  height: '0',
},
rotateIndex = 1,
interactionDataObj = {
  displayEventCompId: '',
  hiddenEventCompId: ''
},
timeoutCb = -1,
openPhotoCb = -1

let croppaDom: any
let moveableDom: any
let croppaData = reactive({ loading: false })
const isPoster = computed(() => {
  return commonAttr.isPoster
})
const cameraStyles = computed(() => {
  let styles_ = styles
  _.merge(styles_, { backgroundColor: commonAttr.canvasColor})
  return styles_
})
const croppaWidth = computed(() => {
  if(isH5Edit){
    return item.conAttr.width
  } else {
    let borderSize_ = commonAttr.borderSize_ ? commonAttr.borderSize_ : commonAttr.borderSize
    return Number((item.conAttr.width-borderSize_*commonAttr.quality)/COMMON_WID_HEI.adaptiveScale);
  }
})
const croppaHeight = computed(() => {
  if(isH5Edit) {
    return item.conAttr.height
  } else {
    let borderSize_ = commonAttr.borderSize_ ? commonAttr.borderSize_ : commonAttr.borderSize
    return Number((item.conAttr.height-borderSize_*commonAttr.quality)/COMMON_WID_HEI.adaptiveScale);
  }
})
const placeholder = computed(() => {
  return croppaDom && croppaDom.loading ? '' : commonAttr.placeholder
})
const accept = computed(() => {
  if(isWeibo()) {
    return "image/*"
  } else {
    return ""
  }
})

const initComp = () => {
  if(isH5Edit) return
  EventBus.$off("isStartHtml2canvas", onHiddenCroppa)
  EventBus.$on("isStartHtml2canvas", onHiddenCroppa)
  EventBus.$off("openCamera", onOpenCamera)
  EventBus.$on("openCamera", onOpenCamera)
  EventBus.$off("removeCamera", onRemoveCamera)
  EventBus.$on("removeCamera", onRemoveCamera)
  EventBus.$off("rotateCameraImg", onRotateCameraImg)
  EventBus.$on("rotateCameraImg", onRotateCameraImg)
  EventBus.$off("addImgToCanvas", onAddDragItemCanvas)
  EventBus.$on("addImgToCanvas", onAddDragItemCanvas)
  EventBus.$off("cameraDisplayMoveable", onCameraDisplayMoveable)
  EventBus.$on("cameraDisplayMoveable", onCameraDisplayMoveable)

  if(item.events.interactionData) {
    const interactionDataStr = item.events.interactionData.comps[0].attrs.value
    if(isJSON(interactionDataStr)) {
      //{"displayEventCompId":"1bcf3e66-31bf-4ef1-9ba3-2e0edbc2aec6","hiddenEventCompId":"27dbf606-0a75-486a-a19b-9a7770bbd4db"}
      interactionDataObj = JSON.parse(interactionDataStr)
    }
  }
  if(item.commonAttr.isPoster){
    item.commonAttr.isAddPoster = false
  }
}

const onAddDragItemCanvas = () => {
  if(isPoster.value && isDrawImg.value) {
    //
  } else {
    showAlert("亲，先从相册中选择图片哦！")
  }
}
const onRemoveCamera = () => {
  if(croppaDom) {
    croppaDom.remove()
  }
  if(moveableDom) {
    moveableDom.clearDragIcon()
  }
}
const onCameraDisplayMoveable = ({ isDisplay }) => {
  isHavePoster.value = isDisplay
  item.commonAttr.isAddPoster = isDisplay
}
const onOpenCamera = () => {
  croppaDom.chooseFile()
}
const onRotateCameraImg = () => {
  croppaDom.rotate(rotateIndex)
  rotateIndex++
}
const onHiddenCroppa = ({ isStart, compId }) => {
  onMove()
  if(compId === item.id) {
    isHtml2canvas.value = isStart
  }
}
const computeFrameStyle = () => {
  let cropFrame = new Image()
  cropFrame.src = commonAttr.cropFrameUrl
  cropFrame.onload = (e) => {
    let img: any = e.target
    cropFrameStyle.width = getPxOVwByValue(img.width)
    cropFrameStyle.height = getPxOVwByValue(img.height)
    cropFrameStyle.top = getPxOVwByValue(-(img.height - item.conAttr.height - 8)/2)
    cropFrameStyle.left = getPxOVwByValue((item.conAttr.width - img.width)/2)

    let cropFrameLine = new Image();
    cropFrameLine.src = commonAttr.cropFrameLineUrl
    cropFrameLine.onload = (e) => {
      let imgLine: any = e.target
      cropFrameLeftStyle.width = getPxOVwByValue(imgLine.width)
      cropFrameLeftStyle.height = getPxOVwByValue(imgLine.height)
      cropFrameLeftStyle.left = getPxOVwByValue((item.conAttr.width - img.width)/2)
      cropFrameRightStyle.width = getPxOVwByValue(imgLine.width)
      cropFrameRightStyle.height = getPxOVwByValue(imgLine.height)
      cropFrameRightStyle.left = getPxOVwByValue((item.conAttr.width - img.width)/2 + img.width)
    }
  }
}
const onMove = () => {
  window.clearTimeout(timeoutCb)
  if(commonAttr.isCutImage) {
    timeoutCb = setTimeout(() => {
      const CROPPA_WID = item.conAttr.width
      const CROPPA_HEI = item.conAttr.height
      const canvas: any = document.getElementById("canvasImg")
      const ctx = canvas.getContext("2d")
      const img = croppaDom.getElementById('crop-' + item.id)
      const scale = commonAttr.scale ? commonAttr.scale: 9/20
      const adaptiveScale = COMMON_WID_HEI.adaptiveScale/COMMON_WID_HEI.designScale
      const cropWid = Number(scale * CROPPA_HEI/adaptiveScale)
      const offsetX = Number((CROPPA_WID/adaptiveScale - cropWid)/2)
      const cropHei = CROPPA_HEI/adaptiveScale
      canvas.width = cropWid
      canvas.height = cropHei
      canvas.style.width = getPxOVwByValue(cropWid)
      canvas.style.height = getPxOVwByValue(cropHei)
      ctx.drawImage(img, offsetX, 0, cropWid, cropHei, 0, 0, cropWid, cropHei)
      const canResultBase64 = canvas.toDataURL('image/' + commonAttr.saveImgType, Number(commonAttr.saveImgQuality))
      commonAttr.cropUploadImgUrl = cropUploadImgUrl.value = canResultBase64
    }, siteInfo.reloadTime)
  } else {
    if(commonAttr.isPostInitialImg) {
      commonAttr.cropUploadImgUrl = cropUploadImgUrl.value = croppaDom.originalImage.src
    } else {
      commonAttr.cropUploadImgUrl = cropUploadImgUrl.value = croppaDom.generateDataUrl('image/' + commonAttr.saveImgType, Number(commonAttr.saveImgQuality))
    }
  }
}
const onOpenPhotoAlbum = () => {
  openPhotoCb = window.setInterval(() => {
    if(croppaDom && croppaDom.chooseFile){
      window.clearInterval(openPhotoCb);
      croppaDom.chooseFile();
      if(interactionData) interactionData.isOpenCamera = true;
    }
  }, siteInfo.reloadTime)
}
const onComplete = () => {
  if(isH5Edit) {
    return
  }
  if(commonAttr.isPostInitialImg) {
    commonAttr.cropUploadImgUrl = cropUploadImgUrl.value = croppaDom.originalImage.src
  } else {
    commonAttr.cropUploadImgUrl = cropUploadImgUrl.value = croppaDom.generateDataUrl('image/jpeg', 0.8)
  }
  isDrawImg.value = true

  if(interactionDataObj) {
    EventBus.$emit("itemClick", {id: interactionDataObj.displayEventCompId, index: 0})
  }
  // dragLists.push({ url: cropUploadImgUrl, width: item.conAttr.width/COMMON_WID_HEI.adaptiveScale, height: item.conAttr.height/COMMON_WID_HEI.adaptiveScale});
  // onMove();
}
const onChangeOrientation = () => {
  const metadata = {
    orientation: 1
  }
  croppaDom.applyMetadata(metadata)
}
const onImageRemove = () => {
  isDrawImg.value = false
  // 删除图片数据
  cropUploadImgUrl.value = ''
  useSite.updateComponentAttr({ id: item.id, commonAttr:{ cropUploadImgUrl: ''} })
  if(interactionDataObj) {
    EventBus.$emit("itemClick", {id: interactionDataObj.hiddenEventCompId, index: 0})
  }
}
const initCroppa = () => {
  // if(Croppa){
    // app.use(Croppa)
    
    if(!isH5Edit && commonAttr.isAutoOpen && interactionData && !interactionData.isOpenCamera) {
      onOpenPhotoAlbum()
    }
  // }
}
const onFileSizeExceed = () => {
  showAlert("选择的图片太大了")
}
const onZoom = () => {
  if(croppaDom.scaleRatio > 3){
    croppaDom.scaleRatio = 3
  }
}


initComp()
const refDom = ref<any>(null)
const refMoveable = ref<any>(null)
onMounted(() => {
  if(!isH5Edit) {
    croppaDom = refDom.value
    moveableDom = refMoveable.value
    initCroppa()
  }
  computeFrameStyle()
})

onBeforeUnmount(() => {
  if(isH5Edit) return
  EventBus.$off("isStartHtml2canvas", onHiddenCroppa)
  EventBus.$off("openCamera", onOpenCamera)
  EventBus.$off("removeCamera", onRemoveCamera)
  EventBus.$off("cameraDisplayMoveable", onCameraDisplayMoveable)
  EventBus.$off("rotateCameraImg", onRotateCameraImg)
  EventBus.$off("addImgToCanvas", onAddDragItemCanvas)

  interactionData.isOpenCamera = false
})
</script>



<style lang="scss" scoped>
.poster-con{
  width: inherit;
  height: inherit;
  img{
    width: inherit;
    height: inherit;
  }
}
.wb-camera, .img-placeholder{
  width: inherit;
  height: inherit;
  position: relative;
}
.crop-frame{
  position: absolute;
}
 .crop-img{
  position: absolute;
  width: inherit;
  height: inherit;
 }
.crop-line-left{
  position: absolute;
  top: 0;
}
.crop-line-right{
  position: absolute;
  top: 0;
}
.drag-resize-con{
  position: absolute;
  top: 0;
  left: 0;
  height: inherit;
  width: inherit;

  img{
    height: 100%;
    object-fit: cover;
    text-align: center;
  }
}


.sk-fading-circle {
  position: absolute; }
  .sk-fading-circle .sk-circle {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0; }
  .sk-fading-circle .sk-circle .sk-circle-indicator {
    display: block;
    margin: 0 auto;
    width: 15%;
    height: 15%;
    border-radius: 100%;
    -webkit-animation: sk-circleFadeDelay 1s infinite ease-in-out both;
            animation: sk-circleFadeDelay 1s infinite ease-in-out both; }
  .sk-fading-circle .sk-circle2 {
    -webkit-transform: rotate(30deg);
            transform: rotate(30deg); }
  .sk-fading-circle .sk-circle3 {
    -webkit-transform: rotate(60deg);
            transform: rotate(60deg); }
  .sk-fading-circle .sk-circle4 {
    -webkit-transform: rotate(90deg);
            transform: rotate(90deg); }
  .sk-fading-circle .sk-circle5 {
    -webkit-transform: rotate(120deg);
            transform: rotate(120deg); }
  .sk-fading-circle .sk-circle6 {
    -webkit-transform: rotate(150deg);
            transform: rotate(150deg); }
  .sk-fading-circle .sk-circle7 {
    -webkit-transform: rotate(180deg);
            transform: rotate(180deg); }
  .sk-fading-circle .sk-circle8 {
    -webkit-transform: rotate(210deg);
            transform: rotate(210deg); }
  .sk-fading-circle .sk-circle9 {
    -webkit-transform: rotate(240deg);
            transform: rotate(240deg); }
  .sk-fading-circle .sk-circle10 {
    -webkit-transform: rotate(270deg);
            transform: rotate(270deg); }
  .sk-fading-circle .sk-circle11 {
    -webkit-transform: rotate(300deg);
            transform: rotate(300deg); }
  .sk-fading-circle .sk-circle12 {
    -webkit-transform: rotate(330deg);
            transform: rotate(330deg); }
  .sk-fading-circle .sk-circle2 .sk-circle-indicator {
    -webkit-animation-delay: -0.91667s;
            animation-delay: -0.91667s; }
  .sk-fading-circle .sk-circle3 .sk-circle-indicator {
    -webkit-animation-delay: -0.83333s;
            animation-delay: -0.83333s; }
  .sk-fading-circle .sk-circle4 .sk-circle-indicator {
    -webkit-animation-delay: -0.75s;
            animation-delay: -0.75s; }
  .sk-fading-circle .sk-circle5 .sk-circle-indicator {
    -webkit-animation-delay: -0.66667s;
            animation-delay: -0.66667s; }
  .sk-fading-circle .sk-circle6 .sk-circle-indicator {
    -webkit-animation-delay: -0.58333s;
            animation-delay: -0.58333s; }
  .sk-fading-circle .sk-circle7 .sk-circle-indicator {
    -webkit-animation-delay: -0.5s;
            animation-delay: -0.5s; }
  .sk-fading-circle .sk-circle8 .sk-circle-indicator {
    -webkit-animation-delay: -0.41667s;
            animation-delay: -0.41667s; }
  .sk-fading-circle .sk-circle9 .sk-circle-indicator {
    -webkit-animation-delay: -0.33333s;
            animation-delay: -0.33333s; }
  .sk-fading-circle .sk-circle10 .sk-circle-indicator {
    -webkit-animation-delay: -0.25s;
            animation-delay: -0.25s; }
  .sk-fading-circle .sk-circle11 .sk-circle-indicator {
    -webkit-animation-delay: -0.16667s;
            animation-delay: -0.16667s; }
  .sk-fading-circle .sk-circle12 .sk-circle-indicator {
    -webkit-animation-delay: -0.08333s;
            animation-delay: -0.08333s; }

@-webkit-keyframes sk-circleFadeDelay {
  0%,
  39%,
  100% {
    opacity: 0; }
  40% {
    opacity: 1; } }

@keyframes sk-circleFadeDelay {
  0%,
  39%,
  100% {
    opacity: 0; }
  40% {
    opacity: 1; } }

.croppa-container {
  display: inline-block;
  cursor: pointer;
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
  position: relative;
  font-size: 0;
  -ms-flex-item-align: start;
      align-self: flex-start;
  background-color: transparent;
  width: inherit;
  height: inherit;
}
.croppa-container canvas {
  -webkit-transition: all 0.3s;
  transition: all 0.3s;
}
.croppa-container:hover {
  opacity: 0.7;
}
.croppa-container.croppa--dropzone {
  -webkit-box-shadow: inset 0 0 10px #333;
          box-shadow: inset 0 0 10px #333;
}
.croppa-container.croppa--dropzone canvas {
  opacity: 0.5;
}
.croppa-container.croppa--disabled-cc {
  cursor: default;
}
.croppa-container.croppa--disabled-cc:hover {
  opacity: 1;
}
.croppa-container.croppa--has-target {
  cursor: move;
}
.croppa-container.croppa--has-target:hover {
  opacity: 1;
}
.croppa-container.croppa--has-target.croppa--disabled-mz {
  cursor: default;
}
.croppa-container.croppa--disabled {
  cursor: not-allowed;
}
.croppa-container.croppa--disabled:hover {
  opacity: 1;
}
.croppa-container.croppa--passive {
  cursor: default;
}
.croppa-container.croppa--passive:hover {
  opacity: 1;
}
.croppa-container svg.icon-remove {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  -webkit-filter: drop-shadow(-2px 2px 2px rgba(0,0,0,0.7));
          filter: drop-shadow(-2px 2px 2px rgba(0,0,0,0.7));
  z-index: 10;
  cursor: pointer;
  border: 2px solid #fff;
}
</style>