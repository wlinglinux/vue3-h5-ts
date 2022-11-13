<template>
  <inject-template :item="item" :pageId="pageId" :popId="popId" :isPropagation="false">
    <template v-slot:common>
      <canvas v-if="!isSVG" :id="'moveable-' + item.id" class="wb-moveable" :width="getCanvasWidth" :height="getCanvasHeight"></canvas>
    </template>
  </inject-template>
</template>

<script setup lang="ts">
import { useSiteStore } from '@/store/site'
import { useInteractionStore } from '@/store/interaction'
import { COMMON_WID_HEI } from '@/const/'
import { EventBus } from '@/utils/'
import { getCompStyle } from '@/components/utils/'

const DELETE_OFFSET = 28
const DELETE_SIZE = 48

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
}>()
const item = props.item
const commonAttr = item.commonAttr
const useSite = useSiteStore()
const useInteraction = useInteractionStore()
const styles = computed(() => {
  return getCompStyle(item)
})
const isH5Edit = useSite.isH5Edit
let fabric: any
let fabricCanvas: any
let exportCanvasCon: any
let img: any
const isSVG = ref(false)
let dragLists: IListItem[] = []

const getCanvasWidth = computed(() => {
  return item.conAttr.width/COMMON_WID_HEI.adaptiveScale
})
const getCanvasHeight = computed(() => {
  return item.conAttr.height/COMMON_WID_HEI.adaptiveScale
})
const initComp = () => {
  if(!isH5Edit) {
    EventBus.$off("addImgToCanvas", onAddDragItem)
    EventBus.$on("addImgToCanvas", onAddDragItem)
    EventBus.$off("addImgToCanvasBg", onAddCanvasBackground)
    EventBus.$on("addImgToCanvasBg", onAddCanvasBackground)
    EventBus.$off("exportSVG", onExportSVG)
    EventBus.$on("exportSVG", onExportSVG)
  }
}

const initFabric = (fabric_: any) => {
  fabric = fabric_
  fabricCanvas = new fabric.Canvas('moveable-' + item.id)
  const deleteIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E"
  const deleteImg = document.createElement('img')
  deleteImg.src = deleteIcon
  fabric.Object.prototype.set({
    borderColor: commonAttr.borderColor ? commonAttr.borderColor : '#127BFF',
    cornerColor: commonAttr.cornerColor ? commonAttr.cornerColor : '#127BFF', //激活状态角落图标的填充颜色
    cornerStrokeColor: 'white', //激活状态角落图标的边框颜色
    // borderOpacityWhenMoving: 1,
    // borderScaleFactor: 1,
    cornerSize: 32/COMMON_WID_HEI.adaptiveScale,
    cornerStyle: "circle", //rect,circle
    // centeredScaling: false, //角落放大缩小是否是以图形中心为放大原点
    // centeredRotation: true, //旋转按钮旋转是否是左上角为圆心旋转
    transparentCorners: false, //激活状态角落的图标是否透明
    // rotatingPointOffset: 80/COMMON_WID_HEI.adaptiveScale, //旋转距旋转体的距离
    // originX: "center",
    // originY: "center",
    // lockUniScaling: false, //只显示四角的操作
    // hasRotatingPoint: true, //是否显示旋转按钮
    // selectionDashArray: [5, 5],
    // borderDashArray: [16, 16],
    // strokeWidth: 4,
    // controls: { mtr: { offsetY: 48 } },
    padding: 24/COMMON_WID_HEI.adaptiveScale,
  })
  fabric.Object.prototype.controls.deleteControl = new fabric.Control({
    x: 0.5,
    y: -0.5,
    offsetY: -DELETE_OFFSET/COMMON_WID_HEI.adaptiveScale,
    offsetX: DELETE_OFFSET/COMMON_WID_HEI.adaptiveScale,
    cursorStyle: 'pointer',
    mouseUpHandler: deleteDragItem,
    render: renderIcon(deleteImg),
    cornerSize: DELETE_SIZE/COMMON_WID_HEI.adaptiveScale
  })
  // fabric.Object.prototype.controls.clone = new fabric.Control({
  //   x: -0.5,
  //   y: -0.5,
  //   offsetY: -16,
  //   offsetX: -16,
  //   cursorStyle: 'pointer',
  //   mouseUpHandler: cloneDragItem,
  //   render: renderIcon(cloneImg),
  //   cornerSize: 24
  // });
}
const onAddDragItem = (listItem: IListItem) => {
  const clientWidth = item.conAttr.width/COMMON_WID_HEI.adaptiveScale
  const clientHeight = item.conAttr.height/COMMON_WID_HEI.adaptiveScale 
  const itemLeft = (clientWidth - listItem.width) / 2
  const itemTop = (clientHeight - listItem.height) / 2

  const oImg = new fabric.Image()
  oImg.setSrc(listItem.url, function(oImg: any) {
    oImg.scale(listItem.width/oImg.width).set({
      left: itemLeft,
      top: itemTop,
    })
    fabricCanvas.add(oImg).setActiveObject(oImg)
    fabricCanvas.item(0).controls.mtr.offsetY = -40
    fabricCanvas.requestRenderAll()

    oImg.id = dragLists.length
    dragLists.push(oImg)
    cameraDisplayMoveable()
  }, { crossOrigin: "anonymous" })
}

const onAddCanvasBackground = (listItem: IListItem) => {
  fabric.Image.fromURL(listItem.url, function(oImg: any) {
    oImg.scale(1/COMMON_WID_HEI.adaptiveScale).set({
      left: 0,
      top: 0,
    });
    fabricCanvas.setBackgroundImage(oImg, fabricCanvas.renderAll.bind(fabricCanvas))
  }, { crossOrigin: "anonymous" })
}

const renderIcon = (icon: any) => {
  return function renderIcon(ctx: any, left: number, top: number, styleOverride: any, fabricObject: any) {
    // @ts-ignore
    const size = this.cornerSize
    ctx.save()
    ctx.translate(left, top)
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle))
    ctx.drawImage(icon, -size/2, -size/2, size, size)
    ctx.restore()
  }
}

const deleteDragItem = (eventData: any, transform: any) => {
  const target = transform.target
  const canvas = target.canvas
  canvas.remove(target)
  canvas.requestRenderAll()

  dragLists = _.cloneDeep(_.pullAllBy(dragLists, [{ id: target.id }], 'id'))
  cameraDisplayMoveable()
}

const cloneDragItem = (eventData: any, transform: any) => {
  const target = transform.target
  const canvas = target.canvas
  target.clone(function(cloned: any) {
    cloned.left += 10
    cloned.top += 10
    canvas.add(cloned)
  })
}

const onExportSVG = () => {
  isSVG.value = true
  // canvas.setActiveObject()
  exportCanvasCon = document.getElementsByClassName("canvas-container")[0]
  // const canvas = exportCanvasCon.getElementsByClassName('wb-moveable')[0]
  // exportCanvasCon.removeChild(canvas)
  // let doc = new DOMParser().parseFromString(canvas.toSVG(), "text/xml")
  // let svg = svg = doc.getElementsByTagName("svg")[0]
  // svg.style.position = "absolute"
  // svg.style.left = "0"
  // svg.style.top = "0"
  // svg.style.width = "100%"
  // svg.style.height = "100%"
  // exportCanvasCon.appendChild(svg)
  // isSVG.value = true

  // var svg = fabricCanvas.toSVG({
  //   viewBox: {
  //     x: 100,
  //     y: 100,
  //     width: 200,
  //     height: 300
  //   }
  // })
  const dataURL = fabricCanvas.toDataURL({
    format: 'png',
    // quality: 0.8,
    multiplier: 2,
    // left: 100,
    // top: 100,
    // width: 200,
    // height: 200
  })
  const oImgBox = document.createElement("img")
  oImgBox.crossOrigin = "Anonymous"
  oImgBox.src = dataURL
  oImgBox.style.position = "absolute"
  oImgBox.style.left = "0"
  oImgBox.style.top = "0"
  oImgBox.style.width = "100%"
  oImgBox.style.height = "100%"
  exportCanvasCon.appendChild(oImgBox)
  img = oImgBox
}

const clearDragIcon = () => {
  // let dragItems = canvas.getActiveObjects()
  while(dragLists.length > 0) {
    let dragItem = dragLists.pop()
    fabricCanvas.remove(dragItem)
  }  
}
const cameraDisplayMoveable = () => {
  if(dragLists.length > 0) {
    EventBus.$emit("cameraDisplayMoveable", { isDisplay: true })
  } else {
    EventBus.$emit("cameraDisplayMoveable", { isDisplay: false })
  }
}

initComp()
onMounted(() => {
  if(window.fabric) {
    initFabric(window.fabric)
  }
})

onBeforeUnmount(() => {
  EventBus.$off("addImgToCanvas", onAddDragItem)
  EventBus.$off("addImgToCanvasBg", onAddCanvasBackground)
  EventBus.$off("exportSVG", onExportSVG)
  if(fabric) {
    clearDragIcon()
    fabricCanvas.removeListeners()
    fabricCanvas.clear()
  }
  fabricCanvas = null
  fabric = null
  if(img) {
    exportCanvasCon.removeChild(img)
  }
  exportCanvasCon = null
  img = null
})

defineExpose({
  clearDragIcon
})

</script>

<style lang="scss">
.wb-moveable {
  width: inherit;
  height: inherit;
  position: relative;
}
</style>
