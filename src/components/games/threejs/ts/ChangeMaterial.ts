import BaseThree from './BaseThree'
import { COMPONENT_TYPES } from '@/const/'
import { EventBus } from '@/utils/'
export default class ChangeMaterial extends BaseThree {
  private mtls: any
  private theModel = null;
  private INITIAL_MTL = null;
  private activeOption = 'cushions';
  private pointer = null;
  private scaleOffset = 0.002;
  private container: any;
  private INITIAL_MAP: any[] = [];
  private raycaster: any;
  private oldScale: any;
  private activeOptions: any;
  constructor(item: IComponent) {
    super(item)

    this.mtls = [
      {
        size: [2, 2, 2],
        shininess: 60 },
      {
        size: [4, 4, 4],
        shininess: 0 },
      {
        size: [8, 8, 8],
        shininess: 10 },
      {
        size: [3, 3, 3],
        shininess: 0 },
      {
        size: [6, 6, 6],
        shininess: 0 },
    ];
  }

  addToScene(THREE: any) {
    this.pointer = new THREE.Vector2();
    this.oldScale = new THREE.Vector3();
    // let xx = {"three":{"orbit":true,"gltf":true},"parameters":{"modelUrl":"https://static.hd.xxx.com/upload/biz/1/chair.glb","mtlCompId":"49af1d6a-d0bf-4acf-9e95-e9123d315d19","scale":2,"mtlColor":0xf1f1f1,"mtlShininess":10,"childrenId":"back,base,cushions,legs,supports"}}
    let parameters = this.parameters;
    this.INITIAL_MTL = new THREE.MeshPhongMaterial({ color: new THREE.Color(parameters.mtlColor), shininess: parameters.mtlShininess });
    if(parameters.mtls) { 
      _.merge(this.mtls, parameters.mtls);
    }
    if(parameters.scaleOffset) {
      this.scaleOffset = parameters.scaleOffset;
    }
    this.INITIAL_MAP = [];
    let childrenId = parameters.childrenId.split(",");
    _.forEach(childrenId, (childId) => {
      this.INITIAL_MAP.push({ childID: childId, mtl: this.INITIAL_MTL });
    })
    this.activeOptions = childrenId;
    this.activeOption = childrenId[0];
    this.loadModel(THREE, parameters);

    let mtlCompId = parameters.mtlCompId;
    this.addMtlEventListeners(mtlCompId);
    this.addControls(THREE);

    this.raycaster = new THREE.Raycaster();
    let compId = this.item.id;
    let container: any = document.getElementById(compId);
    this.container = container;
    this.onClick = this.onClick.bind(this);
    container.addEventListener('click', this.onClick, false);

    this.ticker();
    this.onSetActiveOption = this.onSetActiveOption.bind(this);
    EventBus.$on("passData", this.onSetActiveOption);
  }

  loadModel(THREE, parameters) {
    var loader = new THREE.GLTFLoader();
    loader.load(parameters.modelUrl, (gltf) => {
      let theModel = gltf.scene;
      this.theModel = theModel;
      theModel.traverse(o => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
      theModel.scale.set(parameters.scale, parameters.scale, parameters.scale);
      theModel.rotation.y = Math.PI;
      theModel.position.y = -1;

      for (let object of this.INITIAL_MAP) {
        this.initColor(theModel, object.childID, object.mtl);
      }
      this.scene.add(theModel);
      this.addFloor(THREE);
      this.addLights(THREE);
    }, undefined, function (error) {
      console.error(error);
    });
  }

  addFloor(THREE) {
    let scene = this.scene;
    // Floor
    var floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
    var floorMaterial = new THREE.MeshPhongMaterial({
      color: this.parameters.bgColor, // This color is manually dialed in to match the background color
      shininess: 0 });
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -0.5 * Math.PI;
    floor.receiveShadow = true;
    floor.position.y = -1;
    scene.add(floor);
  }

  addMtlEventListeners(mtlCompId: string) {
    const groupCompData = this.componentMap[mtlCompId];

    this.setIntervalCb = window.setInterval(() => {
      let count = 0;
      _.forEach(groupCompData.components, (compData:IComponent) => {
        if(compData.interactionData.vueContainer){
          count++;
        }
      })
      if(count != 0 && count >= length){
        window.clearInterval(this.setIntervalCb);
        
        _.forEach(groupCompData.components, (compData: IComponent) => {
          if (compData.cid == COMPONENT_TYPES.wb_img) {
            let img = compData.interactionData.vueContainer.$refs.dom.$el
            this.onImgClick = this.onImgClick.bind(this);
            img.addEventListener("click", this.onImgClick);
          }
        })
      }
    }, this.siteInfo.reloadTime);
  }

  onImgClick(e) {
    e.stopPropagation();

    let img = e.currentTarget;
    let compId = img.parentElement.id;
    let compData = this.componentMap[compId];

    let color = this.mtls[compData.commonAttr.itemIndex];
    let new_mtl;
    let txt = new THREE.TextureLoader().load(compData.commonAttr.url);
    txt.repeat.set(color.size[0], color.size[1], color.size[2]);
    txt.wrapS = THREE.RepeatWrapping;
    txt.wrapT = THREE.RepeatWrapping;

    new_mtl = new THREE.MeshPhongMaterial({
      map: txt,
      shininess: color.shininess ? color.shininess : 10
    });
    this.setMaterial(this.theModel, this.activeOption, new_mtl);
  }

  initColor(parent, type, mtl) {
    parent.traverse(o => {
      if (o.isMesh) {
        if (o.name.includes(type)) {
          o.material = mtl;
          o.nameID = type; // Set a new property to identify this object
        }
      }
    });
  }

  setMaterial(parent, type, mtl) {
    parent.traverse(o => {
      if (o.isMesh && o.nameID != null) {
        if (o.nameID == type) {
          o.material = mtl;
        }
      }
    });
  }

  addLights(THREE) {
    // Add lights
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    hemiLight.position.set(0, 50, 0);
    // Add hemisphere light to scene   
    this.scene.add(hemiLight);

    var dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
    dirLight.position.set(-8, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);

    // directionalLight.shadow.camera.far = 15
    // directionalLight.shadow.mapSize.set(1024, 1024)
    // directionalLight.shadow.normalBias = 0.05

    // Add directional Light to scene    
    this.scene.add(dirLight);
  }

  addControls(THREE) {
    // Controls
    this.orbitControls = new THREE.OrbitControls(this.camera, this.canvas);
    this.orbitControls.enableDamping = true;// 将其设置为true以启用阻尼（惯性），这将给控制器带来重量感。默认值为false。

    let controls = this.orbitControls;
    controls.maxPolarAngle = Math.PI / 2;// 你能够垂直旋转的角度的上限，范围是0到Math.PI，其默认值为Math.PI。
    controls.minPolarAngle = Math.PI / 3;// 你能够垂直旋转的角度的下限，范围是0到Math.PI，其默认值为0。
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.dampingFactor = 0.1;
    controls.enableRotate = true;// 启用或禁用摄像机水平或垂直旋转。默认值为true。
    controls.autoRotate = false; // Toggle this if you'd like the chair to automatically rotate
    controls.autoRotateSpeed = 0.2; // 30
  }

  onClick( event ) {
    const pointer: any = this.pointer;
    const renderer = this.renderer;
    pointer.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;
    this.raycaster.setFromCamera( pointer, this.camera );
    const intersects = this.raycaster.intersectObject( this.theModel );
    if ( intersects.length > 0 ) {
      let mesh = intersects[0].object;
      this.oldScale.x = mesh.scale.x;
      this.oldScale.y = mesh.scale.y;
      this.oldScale.z = mesh.scale.z;
      mesh.scale.set(this.oldScale.x + this.scaleOffset, this.oldScale.y + this.scaleOffset, this.oldScale.z + this.scaleOffset);
      this.activeOption = mesh.nameID;

      window.setTimeout(() => {
        mesh.scale.set(this.oldScale.x, this.oldScale.y, this.oldScale.z);
      }, 1000)
    }
  }

  onSetActiveOption({itemIndex}) {
    this.activeOption = this.activeOptions[itemIndex];
  }

  ticker() {
    this.orbitControls.update();
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.ticker.bind(this));
  }

  destroy() {
    super.destroy();
    this.theModel = null;
    this.raycaster = null;
    this.INITIAL_MTL = null;
    this.INITIAL_MAP = [];
    this.activeOption = '';
    this.activeOptions = null;
    this.pointer = null;
    this.oldScale = null;
    this.scaleOffset = 0;
    let mtlCompId = this.parameters.mtlCompId;
    let groupCompData = this.componentMap[mtlCompId];
    _.forEach(groupCompData.components, (compData: IComponent) => {
      if (compData.cid == COMPONENT_TYPES.wb_img) {
        let img = compData.interactionData.vueContainer.$refs.dom.$el
        img.removeEventListener("click", this.onImgClick);
      }
    })
    EventBus.$off("passData", this.onSetActiveOption);
    this.container.removeEventListener('click', this.onClick, false);
    this.container = null;
  }
}
