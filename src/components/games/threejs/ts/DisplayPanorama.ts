import BaseThree from './BaseThree'

export default class ChangeMaterial extends BaseThree {
  constructor(item: IComponent) {
    super(item)
  }

  initData () {
    const injectJsClassObj = this.item.interactionData.injectJsClassObj
    const contentHtml = '<h1>marker 介绍</h1>'
    const a: any[] = [];
    a.push({
      id       : 'lorem',
      content  : contentHtml,
      latitude : 0.32,
      longitude: 0.11,
      image    : injectJsClassObj.markers[0],
      width    : 32,
      height   : 32,
      anchor   : 'bottom center',
    });
    a.push({
      id        : 'imageLayer',
      content  : "<h1>这里是帐篷的介绍</h1>",
      // imageLayer: injectJsClassObj.markers[1],
      html: `<p style="font-size:4vw;color:#f00";text-align:center>这是个帐篷</p>  <img src=${injectJsClassObj.markers[1]} style="height: 10vh; vertical-align: top;"/>`,
      width     : 120,
      height    : 94,
      longitude : -0.1,
      latitude  : -0.3,
    });
    a.push({
      id       : 'scale-2',
      scale    : {
        longitude: [3, 3],
      },
      circle   : 20,
      svgStyle : {
        fill: 'rgba(255, 0, 0, 0.5)',
      },
      longitude: 0.1,
      latitude : -0.2,
    });
    return a
  }

  initPanorama(THREE: any) {
    const injectJsClassObj = this.item.interactionData.injectJsClassObj
    const viewer = new PhotoSphereViewer.Viewer({
      container: document.getElementById(this.item.id),
      panorama: injectJsClassObj.url,
      loadingImg: injectJsClassObj.loadingImg,
      plugins: [
        [PhotoSphereViewer.MarkersPlugin, {
          markers: (() => {
            return this.initData();
          })(),
        }],
      ],
    });
  }
}