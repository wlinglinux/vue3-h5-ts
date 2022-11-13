<template>
  <three-template :item="item">
    <template v-slot:common>
      <div ref="threeCanvas" class="wb-panorama"></div>
    </template>
  </three-template>
</template>
<script>
import ThreeTemplate from '@/components/games/threejs/three-template.vue'
import { MOBILE_WID_HEI } from '@/const/'
import { useSiteStore } from '@/store/site'

export default {
  name: "WbPanorama",
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
      onMouseDownMouseX: 0,
      onMouseDownMouseY: 0,
      onMouseDownLon: 0,
      onMouseDownLat: 0,
      lon: 0,
      lat: 0,
      phi: 0,
      theta: 0,
      isUserInteracting: false,
      scene: null,
      camera: null,
      renderer: null,
      mesh: null,
      material: null,
    };
  },
  computed: {
    conAttr() {
      return this.item.conAttr;
    },
    commonAttr() {
      return this.item.commonAttr;
    },
  },
  mounted () {
    const useSite = useSiteStore()
    if(!useSite.isH5Edit) {
      this.initThree(window.THREE);
    }
  },
  methods: {
    initThree(THREE){
      if(!THREE || this.camera){
        return
      }
      this.init(THREE);
      const useSite = useSiteStore()
      if(!useSite.isH5Edit){
        this.animate();
      }
    },
    init(THREE) {
      let ratio = 1;
      let commonAttr = this.commonAttr;
      let conAttr = this.item.conAttr;
      let wid = commonAttr.designWidth ? commonAttr.designWidth : conAttr.width;
      let hei = commonAttr.designHeight ? commonAttr.designHeight : conAttr.height;
      let pixelRatio = MOBILE_WID_HEI.designScale;
      if(this.item.commonAttr.isFullScreen) {
        wid = document.documentElement.clientWidth;
        hei = document.documentElement.clientHeight;
        pixelRatio = Math.min(window.devicePixelRatio, 2);
      }
      this.ratio = ratio = wid / hei;
      const cameraParams = this.commonAttr.camera;
      this.camera = new THREE.PerspectiveCamera(cameraParams.fov, ratio, cameraParams.near, cameraParams.far);
      this.camera.target = new THREE.Vector3(0, 0, 0);
      this.scene = new THREE.Scene();
      let geometry = new THREE.SphereBufferGeometry(100, 60, 40);
      // invert the geometry on the x-axis so that all of the faces point inward
      geometry.scale(1, 1, -1);
      let texture = new THREE.TextureLoader().load(this.commonAttr.url, () => {
        this.$refs.threeCanvas.appendChild(this.renderer.domElement);
      });
      this.material = new THREE.MeshBasicMaterial({ map: texture });
      this.mesh = new THREE.Mesh(geometry, this.material);
      this.scene.add(this.mesh);
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(pixelRatio);
      this.renderer.setSize(wid, hei);
      this.renderer.domElement.style.objectFit = 'cover';

      document.addEventListener("mousedown", this.onPointerStart, false);
      document.addEventListener("mousemove", this.onPointerMove, false);
      document.addEventListener("mouseup", this.onPointerUp, false);

      document.addEventListener("wheel", this.onDocumentMouseWheel, false);

      document.addEventListener("touchstart", this.onPointerStart, false);
      document.addEventListener("touchmove", this.onPointerMove, false);
      document.addEventListener("touchend", this.onPointerUp, false);

      window.addEventListener("resize", this.onWindowResize, false);
    },
    onWindowResize() {
      this.camera.aspect = this.ratio;
      this.camera.updateProjectionMatrix();

      this.setRenderSize();
    },
    setRenderSize() {
      let commonAttr = this.commonAttr;
      let conAttr = this.item.conAttr;
      let wid = commonAttr.designWidth ? commonAttr.designWidth : conAttr.width;
      let hei = commonAttr.designHeight ? commonAttr.designHeight : conAttr.height;
      if(this.item.commonAttr.isFullScreen) {
        wid = document.documentElement.clientWidth;
        hei = document.documentElement.clientHeight;
        pixelRatio = Math.min(window.devicePixelRatio, 2);
      }
      this.ratio = wid / hei;
      this.renderer.setSize(wid, hei);
      this.renderer.setPixelRatio(this.pixelRatio);
    },
    onPointerStart(event) {
      this.isUserInteracting = true;

      let clientX = event.clientX || event.touches[0].clientX;
      let clientY = event.clientY || event.touches[0].clientY;

      this.onMouseDownMouseX = clientX;
      this.onMouseDownMouseY = clientY;

      this.onMouseDownLon = this.lon;
      this.onMouseDownLat = this.lat;
    },
    onPointerMove(event) {
      if (this.isUserInteracting === true) {
        let clientX = event.clientX || event.touches[0].clientX;
        let clientY = event.clientY || event.touches[0].clientY;

        this.lon = (this.onMouseDownMouseX - clientX) * 0.1 + this.onMouseDownLon;
        this.lat = (clientY - this.onMouseDownMouseY) * 0.1 + this.onMouseDownLat;
      }
    },
    onPointerUp() {
      this.isUserInteracting = false;
    },
    onDocumentMouseWheel(event) {
      let fov = this.camera.fov + event.deltaY * 0.05;
      this.camera.fov = window.THREE.Math.clamp(fov, 10, 75);
      this.camera.updateProjectionMatrix();
    },
    animate() {
      requestAnimationFrame(this.animate);
      this.update();
    },
    update() {
      let THREE = window.THREE
      if(!THREE){
        return
      }
      if (this.isUserInteracting === false) {
        this.lon += 0.1;
      }

      // this.lat = Math.max(-85, Math.min(85, this.lat));
      this.phi = THREE.MathUtils.degToRad(90 - this.lat);
      this.theta = THREE.MathUtils.degToRad(this.lon);

      this.camera.target.x = 500 * Math.sin(this.phi) * Math.cos(this.theta);
      this.camera.target.y = 500 * Math.cos(this.phi);
      this.camera.target.z = 500 * Math.sin(this.phi) * Math.sin(this.theta);

      this.camera.lookAt(this.camera.target);
      this.renderer.render(this.scene, this.camera);
    }
  },
};
</script>
<style lang="scss">
.wb-panorama {
  width: inherit;
  height: inherit;
}
</style>
