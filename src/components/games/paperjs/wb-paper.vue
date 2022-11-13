<template>
  <paper-template :item="item" :pageId="pageId" :popId="popId" :isPropagation="false">
    <template v-slot:common>
      <canvas v-if="!isSVG" :id="getCanvasId" ref="refDom" class="wb-paper" :style="styles" @click.stop resize></canvas>
    </template>
  </paper-template>
</template>


<script setup lang="ts">
import PaperTemplate from './paper-template.vue'
import { getCompStyle} from '@/components/utils/'
import { useSiteStore } from '@/store/site'
import { PAPER_TYPE_MAP ,COLORS} from '@/const'
import { EventBus ,isJSON , dynamicsLoadScript, getCompIdByParam} from '@/utils'
import { COMMON_WID_HEI } from '@/const/'
import { SaveImgEvent } from '@/components/events/fronts/'

const props = defineProps<{ 
  item: IComponent,
  pageId: number,
  popId: number,
}>()

const item = props.item
const styles = computed(() => {
  return getCompStyle(item)
})

const useSite = useSiteStore()
const isH5Edit = useSite.isH5Edit
const env = useSite.siteInfo.env

let isSVG =  ref(false)
let tool = null
let path =  <any>(null)
let canvasCon = <any>(null)
let viewWidth = <any>(null)
let paper =  <any>null  
let isDragUp =  true
let svg = <any>(null)

let paperObj  = <any>({
  tool: { minDistance: 10 },
  simplifySegment: 10,
  strokeCap: "round",//分段和拐角处使用的形状 'miter', 'round', 'bevel'
  strokeJoin: "round",//'miter', 'round', 'bevel'
  fullySelected: true,//指定是否选择路径及其所有线段
  isRandomColor: true,
  strokeWidth: 4,
  strokeColor: "black",
  fillColor: "black",
  colorLength: 10,
  colors: ["#F0F8FF","#A52A2A","#FF1493","#FFD700","#ADFF2F","#800000","#FF4500","#CD853F","#FF0000","#FF6347","#9ACD32"],
  colorWidth: 50,
  colorHeight: 20,
  colorCap: 4,
  colorOffset: 20,
  isClosed: true,
  isNotColorTool: false
})


const getCanvasId = computed(()=>{
  return 'canvas-' + item.id
})

const initComp = () =>{
  if(!isH5Edit) {
    if(item.commonAttr.injectJsClassParams && isJSON(item.commonAttr.injectJsClassParams)) {
      _.merge(paperObj, JSON.parse(item.commonAttr.injectJsClassParams))
    }
    if(!window.paper) {
      dynamicsLoadScript(env.baseUrl + 'js/paper/paper-full.min.js', "paper", initPaper)
    } else {
      initPaper(window.paper);
    }

    EventBus.$on("paperData", onChangePaperObj)
    EventBus.$on("exportSVG", onExportSVG)
    EventBus.$on("clearPaper", onClearPaper)
  }
}

const initPaper = (paperParam: any)=>{
  if(!paperParam) {
    return;
  }
  let dom = getCurrentInstance()!.refs.refDom
  paperParam.setup(dom);
  paper = paperParam;
  viewWidth = paper.view.size.width;

  if(item.commonAttr.itemType == PAPER_TYPE_MAP.freedomDraw || item.commonAttr.itemType == PAPER_TYPE_MAP.drawMoon) {
    let toolFree = tool = new paperParam.Tool();
    toolFree.minDistance = paperObj.tool.minDistance;
    toolFree.onMouseDown = onMouseDown;
    toolFree.onMouseDrag = onMouseDrag;
    toolFree.onMouseUp = onMouseUp;
    if(!paperObj.isNotColorTool){ // 是否显示颜色空板
      initColors();
    }
  } else if(item.commonAttr.itemType == PAPER_TYPE_MAP.drawColors) {
  }
}




const onChangePaperObj = (paperObjParams) =>{
   _.merge(paperObj, paperObjParams);
}

const onExportSVG = () =>{
  canvasCon = document.getElementsByClassName("paper-con")[0]!;
  let svgParam = svg = paper.project.exportSVG();
  svgParam.style.position = "absolute";
  svgParam.style.left = "0";
  svgParam.style.top = "0";
  svgParam.style.width = "100%";
  svgParam.style.height = "100%";
  canvasCon!.appendChild(svg);
  isSVG.value = true;
}

const onClearPaper = () =>{
  paper.project.activeLayer.removeChildren(); 
}

const onMouseDown = (event) => {
  // || event.point.y < 100
  if(event.point.x > viewWidth - paperObj.colorWidth) {
    return
  }
  if (path) {
    path.selected = false;
  }
  if(event.item) {
    path = event.item
    path.selected = true;
    return
  }
  let paperParam = paper;
  const colorLength = COLORS.length - 1;
  let strokeColor = paperObj.strokeColor;
  if(paperObj.isRandomColor) {
    strokeColor = COLORS[_.random(0, colorLength)].value;
  }
  path = new paperParam.Path({
    segments: [event.point],
    strokeColor: strokeColor,
    strokeWidth: paperObj.strokeWidth,
    strokeCap: paperObj.strokeCap,
    strokeJoin: paperObj.strokeJoin,
    // dashArray: [10, 12],
    // fullySelected: true
  });
  isDragUp = true;
}

const onMouseDrag = (event) =>{
  if(!path || !isDragUp) {
    return
  }
  path.add(event.point);
}

const onMouseUp = () =>{
  if(!path || !isDragUp) {
    return
  }
  const colorLength = COLORS.length - 1;
  let fillColor = paperObj.fillColor;
  if(paperObj.isRandomColor) {
    fillColor = COLORS[_.random(0, colorLength)].value;
  }
  if(paperObj.isClosed) {
    path.fillColor = fillColor;
  }
  path.closed = paperObj.isClosed;
  path.data.isClosed = paperObj.isClosed;
  // let segmentCount = path.segments.length;
  path.simplify(paperObj.segmentCount);
  // this.path.smooth();
  path.fullySelected = paperObj.fullySelected;
  if(item.commonAttr.itemType == PAPER_TYPE_MAP.drawMoon){
    let length = paperObj.length || 10
    if(path.length > length){
      onEmitEvent()
    }
  }
}

const initColors =() =>{
  const colorLength = COLORS.length;
  // let originals = new this.paper.Group({ insert: false }); // Don't insert in DOM.
  let colorLists = _.drop(_.shuffle(COLORS), colorLength - paperObj.colorLength);
  let viewWidthParam = viewWidth!;
  let colorRect;
  _.forEach(colorLists, (colorItem, index) => {
    colorRect = new paper.Path.Rectangle({
      position: new window.paper.Size(viewWidthParam - paperObj.colorWidth/2, index*(paperObj.colorHeight + paperObj.colorCap) + paperObj.colorOffset),
      rectangle: { size: [paperObj.colorWidth, paperObj.colorHeight] },
      fillColor: colorItem.value
    });
    colorRect.data.color = colorItem.value;
    colorRect.onClick = onClickColor;
  })
}

const onClickColor = (event) =>{
  isDragUp = false;
  if(path) {
    if(path.data.isClosed) {
      path.fillColor = event.currentTarget.data.color;
    } else {
      path.strokeColor = event.currentTarget.data.color;
    }
  }
}

const initCircle = () =>{
  let relateId = paperObj.relateId
  let comp  = useSite.componentMap[relateId]
  let radio  = comp.conAttr.width / 2 / COMMON_WID_HEI.adaptiveScale

  let x = item.conAttr.width / 2 / COMMON_WID_HEI.adaptiveScale
  let y = item.conAttr.height / 2 / COMMON_WID_HEI.adaptiveScale

  let circle = new paper.Path.Circle({
    center: [x, y],
    radius: radio - paperObj.num,
    fillColor: paperObj.fillColor
  })
  circle.blendMode = 'xor'
}

const onEmitEvent = () =>{
  window.setTimeout(() =>{
    let canvas: any = document.getElementById('canvas-' + item.id)!
    let url = canvas.toDataURL()
    useSite.updateComponentAttrUrl({ id: paperObj.imgId, commonAttr: { url } })
    if(paperObj.displayIds) {
      let displayIds = paperObj.displayIds.split(',')
      _.forEach(displayIds, displayId => {
        useSite.updateComponentAttr({ id: displayId, commonAttr: { isVisible: true } })
      })
    }
    if(paperObj.hiddenIds) {
      let hiddenIds = paperObj.hiddenIds.split(',')
      _.forEach(hiddenIds, hiddenId => {
        useSite.updateComponentAttr({ id: hiddenId, commonAttr: { isVisible: false } })
      })
    }
    initCircle()
  },paperObj.time)
}


initComp()

onMounted(()=>{
  if(!isH5Edit) {
    initPaper(window.paper);
  }
})
onBeforeUnmount(() =>{
  if(paper) {
    paper.project.clear()
    paper.project.remove()
  }
  EventBus.$off("paperData", onChangePaperObj)
  EventBus.$off("exportSVG", onExportSVG)
  EventBus.$on("clearPaper", onClearPaper);
  if(svg) {
    canvasCon.removeChild(svg);
  }
  canvasCon = null;
  tool = null;
  path = null;
  svg = null;
  isSVG.value = false;
  // paperObj = null;
})
</script>


<style lang="scss">
.wb-paper {
  width: inherit;
  height: inherit;
  background-color: transparent;

  canvas{
    width: inherit;
    height: inherit;
    background-color: transparent;
  }
  canvas[resize] {
    width: 100%;
    height: 100%;
  } 

  img{
    object-fit: contain;
    width: 100%;
  }
}
</style>


