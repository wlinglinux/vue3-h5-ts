<template>
  <three-template :item="item" :pageId="pageId" :popId="popId">
    <template v-slot:common>
      <img v-if="isHtml2canvas && cropImgUrl" :src="cropImgUrl" class="crop-img absolute">
      <canvas v-else-if="isCanvas" ref="threeCanvas" class="wb-threes" :style="styles"></canvas>
    </template>
  </three-template>
</template>

<script>
import ThreeTemplate from '@/components/games/threejs/three-template.vue'
import { MOBILE_WID_HEI, INJECT_THREE_CLASS_NAME } from '@/const/'
import { EventBus } from '@/utils/'
import { useSiteStore } from '@/store/site'

export default {
  name: "WbThrees",
  props: {
    item: Object,
    pageId: {
      type: Number,
      default: -1,
    },
    popId: {
      type: Number,
      default: -1,
    },
  },
  components: {
    ThreeTemplate
  },
  setup () {
    return {
      isHtml2canvas: false,
      injectJsClass: null,
      camera: null,
      renderer: null,
    }
  },
  data () {
    return {
      cropImgUrl: ''
    }
  },
  computed: {
    isCanvas() {
      return this.commonAttr.injectJsClass !== INJECT_THREE_CLASS_NAME.DisplayPanorama ? true : false
    },
    conAttr() {
      return this.item.conAttr;
    },
    commonAttr() {
      return this.item.commonAttr;
    },
    styles() {
      return {
        opacity: this.item.commonAttr.opacity,
        backgroundColor: this.item.commonAttr.backgroundColor
      };
    }
  },
  created () {
    const useSite = useSiteStore()
    if(!useSite.isH5Edit) {
      let commonAttr = this.commonAttr;
      if(commonAttr.injectJsClass){
        if(INJECT_THREE_CLASS_NAME[commonAttr.injectJsClass]){
          import(`./ts/${commonAttr.injectJsClass}.ts`).then((module) => {
            this.injectJsClass = new module.default(this.item);
            if(commonAttr.injectJsClass !== INJECT_THREE_CLASS_NAME.DisplayPanorama) {
              const container = document.getElementById(this.item.id);
              if(container) {
                this.initThree(window.THREE);
              }
            } else {
              this.injectJsClass.initPanorama();
            }
          })
        }
      }
      EventBus.$off("isStartHtml2canvas", this.onHiddenCanvas);
      EventBus.$on("isStartHtml2canvas", this.onHiddenCanvas);
    }
  },
  mounted(){
    const useSite = useSiteStore()
    if(!useSite.isH5Edit) {
      this.initThree(window.THREE);
    }
  },
  methods: {
    onHiddenCanvas({ isStart, compId }) {
      if(compId === this.item.id){
        let canResultBase64 = this.$refs.threeCanvas.toDataURL("image/png");
        if(isStart) {
          this.cropImgUrl = canResultBase64;  
        } else {
          this.cropImgUrl = '';
        }
        this.isHtml2canvas = isStart;
      }
    },
    initThree(THREE) {
      if (!THREE || this.renderer || !this.injectJsClass) {
        return;
      }
      this.initScene(THREE);
      this.refreshScene(THREE);
    },
    refreshScene(THREE){
      this.injectJsClass.initThree({ item: this.item, THREE, camera: this.camera, renderer: this.renderer });
    },
    initScene(THREE){
      let commonAttr = this.commonAttr;
      let conAttr = this.item.conAttr;
      let wid = commonAttr.designWidth ? commonAttr.designWidth : conAttr.width;
      let hei = commonAttr.designHeight ? commonAttr.designHeight : conAttr.height;
      if(this.item.commonAttr.isFullScreen) {
        wid = document.documentElement.clientWidth;
        hei = document.documentElement.clientHeight;
      }
      const camera = this.commonAttr.camera;
      let arr = camera.position.split(",");
      let position;
      if (arr.length > 0) {
        position = { x: arr[0] != 0 ? parseFloat(arr[0]) : 0.25, y: arr[1] != 0 ? parseFloat(arr[1]) : -0.25, z: arr[2] != 0 ? parseFloat(arr[2]) : 1 }
      } else {
        position = { x: 0.25, y: -0.25, z: 1 }
      }
      this.camera = new THREE.PerspectiveCamera( camera.fov, wid/hei, camera.near, camera.far );
      this.camera.position.set(position.x, position.y, position.z);

      const renderer = this.renderer = new THREE.WebGLRenderer({
        canvas: this.$refs.threeCanvas,
        preserveDrawingBuffer: true,
        antialias: true,
        alpha: true
      });
      // renderer.setClearAlpha(0);
      const parameters = this.item.interactionData && this.item.interactionData.injectJsClassObj.parameters;
      if(parameters) {
        if(parameters.isShadow) {
          renderer.shadowMap.enabled = true;
          renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        if(parameters.isPhysicallyLights) {
          renderer.physicallyCorrectLights = true; //是否使用物理上正确的光照模式。 默认是false。 示例：lights / physical
        }
      }

      this.onWindowResize();
      window.addEventListener("resize", this.onWindowResize, false);
    },
    onWindowResize() {
      let commonAttr = this.commonAttr;
      let conAttr = this.item.conAttr;
      let wid = commonAttr.designWidth ? commonAttr.designWidth : conAttr.width;
      let hei = commonAttr.designHeight ? commonAttr.designHeight : conAttr.height;
      let pixelRatio = MOBILE_WID_HEI.designScale;
      if(this.item.commonAttr.isFullScreen) {
        wid = document.documentElement.clientWidth;
        hei = document.documentElement.clientHeight;
        // pixelRatio = Math.min(window.devicePixelRatio, 2);
      }

      this.camera.aspect = wid / hei;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(wid, hei);
      this.renderer.setPixelRatio(pixelRatio);
      const parameters = this.item.interactionData && this.item.interactionData.injectJsClassObj.parameters;
      if(parameters) this.renderer.setClearColor(parameters.bgColor, 1); //设置背景颜色
    },
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onWindowResize, false);
    EventBus.$off("isStartHtml2canvas", this.onHiddenCanvas);
    if(this.injectJsClass) {
      this.injectJsClass.destroy();
    }
    this.cropImgUrl = '';
    this.isHtml2canvas = false;
    this.camera = null;
    this.renderer = null;
    this.injectJsClass = null;
  },
};
</script>
<style>
.wb-threes {
  width: inherit;
  height: inherit;
}
.absolute {
  position: absolute;
  top: 0;
  left: 0;
}
</style>


