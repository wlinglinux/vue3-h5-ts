<template>
  <pixi-template :item="item" :pageId="pageId" :popId="popId">
    <template v-slot:common>
      <canvas class="wb-pixis" ref="refDom"></canvas>
    </template>
  </pixi-template>
</template>

<script lang="ts">
import PixiTemplate from '@/components/games/pixijs/pixi-template.vue'
import { COMMON_WID_HEI } from '@/const'
import { INJECT_PIXI_CLASS_NAME } from '@/const/'

export default defineComponent({
  props: ['item', 'pageId', 'popId'],
  setup() {
    return {
      injectJsClass: null,
      pixiApp: null,
    }
  },
  components: {
    PixiTemplate
  },
  created() {
    const item = this.item
    if(item.cid) {
      item.vueInjectContainer = this
    }
    if(item.commonAttr && item.commonAttr.injectJsClass) {
      if(INJECT_PIXI_CLASS_NAME[item.commonAttr.injectJsClass]) {
        import(`./ts/${item.commonAttr.injectJsClass}.ts`).then((module) => {
          // @ts-ignore
          this.injectJsClass = new module.default(item)
          this.initPixi(window.PIXI)
        })
      }
    }
  },
  mounted() {
    this.initPixi(window.PIXI)
  },
  methods: {
    initPixi(PIXI: any) {
      // @ts-ignore
      if (!PIXI || this.pixiApp || !this.injectJsClass) {
        return
      }
      this.initApp(PIXI)
      this.refreshApp(PIXI)
    },
    refreshApp(PIXI: any) {
      // @ts-ignore
      this.injectJsClass.initPixi({ PIXI, app: this.pixiApp })
    },
    initApp(PIXI: any) {
      const commonAttr = this.item
      const conAttr = this.item.conAttr
      // create a Pixi application css中已经对canvas进行了缩放处理
      let designWidth = commonAttr.designWidth
      let designHeight = commonAttr.designHeight
      let wid = designWidth && designWidth > 0 ? designWidth : conAttr.width
      let hei = designHeight && designHeight > 0 ? designHeight : conAttr.height
      if(commonAttr.isFullScreen) {
        wid = COMMON_WID_HEI.clientWidth*COMMON_WID_HEI.designScale
        hei = COMMON_WID_HEI.clientHeight*COMMON_WID_HEI.designScale
      }
      let app = new PIXI.Application({
        view: this.$refs.refDom,
        width: wid,
        height: hei,
        transparent: true,
        antialias: true,
        resolution: 1, //window.devicePixelRatio || 1,
        // autoDensity: true,
      })
      // wid = parseInt(wid);
      // hei = parseInt(hei);
      // app.stage.scale.set(1/(app.view.width/initWidth), 1/(app.view.height/initHeight));
      // @ts-ignore
      this.pixiApp = app
      // 如果创建画布后需要更改背景颜色，请将app.renderer对象的backgroundColor属性设置为十六进制颜色值：
      // app.renderer.backgroundColor = 0x061639;
      // 如果您想查看渲染器的宽度或高度，请使用app.renderer.view.width和app.renderer.view.height。
      // 要更改画布的大小，请使用renderer的resize方法，并提供任何新的width和height值。但是，为了确保画布的大小调整到与分辨率匹配，请将autoResize设置为true。
      // app.renderer.autoResize = true;
      // app.renderer.resize(512, 512);
      // 如果您想让canvas画布填充整个窗口，您可以应用下面的CSS样式并将渲染器的大小调整到浏览器窗口的大小。
      // app.renderer.view.style.position = "absolute";
      // app.renderer.view.style.display = "block";
      // app.renderer.autoResize = true;
      // app.renderer.resize(window.innerWidth, window.innerHeight);
    },
  },
  beforeUnmount() {
    // @ts-ignore
    if(this.injectJsClass) {
      // @ts-ignore
      this.injectJsClass.destroy()
    }
  }
})
</script>

<style>
.wb-pixis {
  width: inherit;
  height: inherit;
}
</style>