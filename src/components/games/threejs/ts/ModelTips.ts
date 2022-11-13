import BaseThree from './BaseThree'
import { getPxOVwByValue } from '@/utils/'
import { loadStyleString } from '@/components/utils/'

export default class ModelTips extends BaseThree {
  private labels: string[];
  private texts: string[];
  private positions: number[][];
  private points: any;
  private raycaster: any;
  private sizes: any;
  constructor(item: IComponent) {
    super(item)
    this.labels = ['1','2','3'];
    this.texts = [
      'Front and top screen with HUD aggregating terrain and battle informations.',
      'Ventilation with air purifier and detection of environment toxicity.',
      'Cameras supporting night vision and heat vision with automatic adjustment.'];
    this.positions = [[1.55, 0.3, -0.6],[0.5, 0.8, -1.6],[1.6, -1.3, -0.7]];
    this.points = null;
    this.raycaster = null;
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    }
  }

  addToScene(THREE: any) {
    // let xx = {"three":{"orbit":true,"gltf":true},"parameters":{"isTone":true,"isPhysicallyLights":true,"isShadow":false,"scale":2,"gltfUrl":"https://static.hd.xxx.com/upload/biz/1/DamagedHelmet.gltf","baseUrl":"https://static.hd.xxx.com/upload/biz/1/","lightColor":"#ffffff","bgColor":"0xffffff"}}
    const renderer = this.renderer;
    const scene = this.scene;
    const parameters = this.parameters;

    renderer.outputEncoding = THREE.sRGBEncoding; //定义渲染器的输出编码。默认为THREE.LinearEncoding
    renderer.toneMapping = THREE.ReinhardToneMapping; // 默认是NoToneMapping。查看Renderer constants以获取其它备选项
    // THREE.LinearToneMapping THREE.ReinhardToneMapping THREE.CineonToneMapping THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 3; // 色调映射的曝光级别。默认是1

    const gltfLoader = new THREE.GLTFLoader();
    const cubeTextureLoader = new THREE.CubeTextureLoader();
   
    const updateAllMaterials = () => {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          // child.material.envMap = environmentMap;
          child.material.needsUpdate = true;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      })
    };
    const environmentMap = cubeTextureLoader.load([
      parameters.baseUrl + 'px.jpg',
      parameters.baseUrl + 'nx.jpg',
      parameters.baseUrl + 'py.jpg',
      parameters.baseUrl + 'ny.jpg',
      parameters.baseUrl + 'pz.jpg',
      parameters.baseUrl + 'nz.jpg'
    ]);
    environmentMap.encoding = THREE.sRGBEncoding;
    scene.background = environmentMap;
    scene.environment = environmentMap;

    gltfLoader.load(
      parameters.gltfUrl,
      (gltf) => {
        gltf.scene.scale.set(parameters.scale, parameters.scale, parameters.scale);
        gltf.scene.rotation.y = Math.PI * 0.5;
        scene.add(gltf.scene);

        updateAllMaterials();
        this.addControls(THREE);
        this.addLights(THREE);
        this.createClass();
        this.addTips();
        this.addRayCast();
        this.ticker();
      }
    )
  }

  addRayCast() {
    const raycaster = new THREE.Raycaster()
    const positions = this.positions;
    const points: any[] = [];
    for(let i = 0; i < positions.length; i++) {
      points.push({
        position: new THREE.Vector3(positions[i][0], positions[i][1], positions[i][2]),
        element: document.querySelector(`.point-${i}`)
      })
    }
    this.points = points;
    this.raycaster = raycaster;
  }

  addLights(THREE) {
    const scene = this.scene;
    const parameters = this.parameters;

    const directionalLight = new THREE.DirectionalLight(parameters.lightColor, 3);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.far = 15;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.normalBias = 0.05;
    directionalLight.position.set(0.25, 3, -2.25);
    scene.add(directionalLight);
  }

  addTips() {
    let innerHtml = '';
    for(let i = 0; i < this.labels.length; i++) {
      innerHtml += `
        <div class="point point-${i}">
          <div class="label">${this.labels[i]}</div>
          <div class="text">${this.texts[i]}</div>
        </div>
      `
    }
    let container = document.createElement('div');
    container.classList.add("threejs-tips-container");
    container.innerHTML = innerHtml;
    document.body.appendChild(container);
  }

  createClass() {
    let innerHTML = `
    .point { 
      position: absolute; 
      top: 50%; 
      left: 50%;
      z-index: 1000;
    }
    .point .label
    {
      position: absolute;
      top: -${getPxOVwByValue(40)};
      left: -${getPxOVwByValue(40)};
      width: ${getPxOVwByValue(80)};
      height: ${getPxOVwByValue(80)};
      border-radius: 50%;
      background: #00000077;
      border: ${getPxOVwByValue(2)} solid #ffffff77;
      color: #ffffff;
      font-family: Helvetica, Arial, sans-serif;
      text-align: center;
      line-height: ${getPxOVwByValue(80)};
      font-weight: 100;
      font-size: ${getPxOVwByValue(28)};
      cursor: help;
      transform: scale(0, 0);
      transition: transform 0.3s;
    }
    .point .text
    {
      position: absolute;
      top: ${getPxOVwByValue(60)};
      left: -${getPxOVwByValue(240)};
      width: ${getPxOVwByValue(400)};
      padding: ${getPxOVwByValue(40)};
      border-radius: ${getPxOVwByValue(8)};
      background: #00000077;
      border: ${getPxOVwByValue(2)} solid #ffffff77;
      color: #ffffff;
      line-height: 1.3em;
      font-family: Helvetica, Arial, sans-serif;
      font-weight: 100;
      font-size: ${getPxOVwByValue(28)};
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
    }
    .point:hover .text
    {
      opacity: 1;
    }
    .point.visible .label
    {
      transform: scale(1, 1);
    }
    `;// pointer-events: none;
    loadStyleString(innerHTML);
  }

  ticker() {
    const controls = this.orbitControls;
    const points = this.points;
    const camera = this.camera;
    const raycaster = this.raycaster;
    const scene = this.scene;
    const renderer = this.renderer;
    // Update controls
    controls.update()
    // Update points only when the scene is ready
    // Go through each point
    for (const point of points) {
      // Get 2D screen position
      const screenPosition = point.position.clone()
      screenPosition.project(camera)
      // Set the raycaster
      raycaster.setFromCamera(screenPosition, camera)
      const intersects = raycaster.intersectObjects(scene.children, true)
      // No intersect found
      if (intersects.length === 0) {
        // Show
        point.element.classList.add('visible')
      }
      // Intersect found
      else {
        // Get the distance of the intersection and the distance of the point
        const intersectionDistance = intersects[0].distance
        const pointDistance = point.position.distanceTo(camera.position)
        // Intersection is close than the point
        if (intersectionDistance < pointDistance) {
          // Hide
          point.element.classList.remove('visible')
        }
        // Intersection is further than the point
        else {
          // Show
          point.element.classList.add('visible')
        }
      }

      const translateX = screenPosition.x * this.sizes.width * 0.5
      const translateY = -screenPosition.y * this.sizes.height * 0.5
      point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
    }
    // Render
    renderer.render(scene, camera)
    // Call tick again on the next frame
    window.requestAnimationFrame(this.ticker.bind(this));
  }

  destroy() {
    super.destroy();
  }
}
