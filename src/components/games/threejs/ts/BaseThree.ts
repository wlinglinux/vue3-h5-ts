import BaseStore from '@/components/utils/BaseStore'


export default class BaseThree extends BaseStore {
  public camera: any;
  public renderer: any;
  public canvas: any;
  public scene: any;
  public parameters: any;
  public orbitControls: any
	constructor(item: IComponent) {
    super(item)
    this.item = item;
  }

  initThree({ item, THREE, camera, renderer}){
    this.item = item;
    this.commonAttr = item.commonAttr;
    this.camera = camera;
    this.renderer = renderer;
    this.canvas = renderer.domElement;

    this.scene = new THREE.Scene();
    let parameters = this.item.interactionData && this.item.interactionData.injectJsClassObj.parameters;
    this.parameters = parameters;
    if(parameters) {
      this.scene.background = new THREE.Color(parameters.bgColor);
    }
    this.addToScene(THREE);
  }

  addToScene(THREE: any) {
  }

  addControls(THREE: any) {
    // Controls
    this.orbitControls = new THREE.OrbitControls(this.camera, this.canvas);
    this.orbitControls.enableDamping = true;
  }

  ticker () {
    // Update controls
    this.orbitControls.update();
    // Render
    this.renderer.render(this.scene, this.camera);
    // Call tick again on the next frame
    window.requestAnimationFrame(this.ticker.bind(this));
  }
 
  addAxesHelper(THREE: any) {
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);
  }
  addCameraHelper(THREE: any) {
    const helper = new THREE.CameraHelper(this.camera);
    this.scene.add(helper);
  }
  
  destroy() {
    super.destroy();
    this.scene.destroy();
    this.scene = null;
    this.camera.destroy();
    this.camera = null;
    this.orbitControls.destroy();
    this.orbitControls = null;
    this.parameters = null;
  }
}