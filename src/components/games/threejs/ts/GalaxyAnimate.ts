import BaseThree from './BaseThree'
export default class GalaxyAnimate extends BaseThree {
  private geometry: any;
  private material: any;
  private points: any;
  private clock: any;
  constructor(item: IComponent) {
    super(item)
    this.geometry = null;
    this.material = null;
    this.points = null;
    this.parameters = {
      count: 20000,
      size: 0.005,
      radius: 5,
      branches: 3,
      spin: 1,
      randomness: 0.5,
      randomnessPower: 3,
      insideColor: '#ff6030',
      outsideColor: '#1b3984',
    };
    // {"count":20000,"size":0.005,"radius":5,"branches":3,"spin":1,"randomness":0.5,"randomnessPower":3,"insideColor":"#ff6030","outsideColor":"#1b3984"}
    // parameters.count = 2000;
    // parameters.size = 0.005;
    // parameters.radius = 5;
    // parameters.branches = 3;
    // parameters.spin = 1;
    // parameters.randomness = 0.5;
    // parameters.randomnessPower = 3;
    // parameters.insideColor = '#ff6030';
    // parameters.outsideColor = '#1b3984';

    this.clock = new THREE.Clock();
  }

  addToScene(THREE) { 
    let parameters = this.item.interactionData && this.item.interactionData.injectJsClassObj.parameters;
    if(parameters) {
      _.merge(this.parameters, parameters);
    }
    const geometry = new THREE.BoxGeometry( 3, 3, 3 );
    const material = new THREE.MeshBasicMaterial( { color: 0x333333 } );
    const cube = new THREE.Mesh( geometry, material );
    this.scene.add( cube );
    this.camera.position.z = 5;
    this.generateGalaxy(THREE);

    this.addControls(THREE);
    this.ticker();
  }

  generateGalaxy (THREE) {
    if(this.points !== null) {
      this.geometry.dispose()
      this.material.dispose()
      this.scene.remove(this.points)
    }
    let parameters = this.parameters;
     /**
     * Geometry
     */
      let geometry = this.geometry = new THREE.BufferGeometry()

      const positions = new Float32Array(parameters.count * 3)
      const randomness = new Float32Array(parameters.count * 3)
      const colors = new Float32Array(parameters.count * 3)
      const scales = new Float32Array(parameters.count * 1)
  
      const insideColor = new THREE.Color(parameters.insideColor)
      const outsideColor = new THREE.Color(parameters.outsideColor)
  
      for(let i = 0; i < parameters.count; i++)
      {
          const i3 = i * 3
  
          // Position
          const radius = Math.random() * parameters.radius
  
          const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2
  
          const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
          const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
          const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
  
          positions[i3    ] = Math.cos(branchAngle) * radius
          positions[i3 + 1] = 0
          positions[i3 + 2] = Math.sin(branchAngle) * radius
      
          randomness[i3    ] = randomX
          randomness[i3 + 1] = randomY
          randomness[i3 + 2] = randomZ
  
          // Color
          const mixedColor = insideColor.clone()
          mixedColor.lerp(outsideColor, radius / parameters.radius)
  
          colors[i3    ] = mixedColor.r
          colors[i3 + 1] = mixedColor.g
          colors[i3 + 2] = mixedColor.b
  
          // Scale
          scales[i] = Math.random()
      }
  
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))

    /**
     * Material
     */
    this.material = new THREE.ShaderMaterial({
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms:
      {
        uTime: { value: 0 },
        uSize: { value: 30 * this.renderer.getPixelRatio() }
      },    
      vertexShader: `
        uniform float uTime;
        uniform float uSize;
        
        attribute vec3 aRandomness;
        attribute float aScale;
        
        varying vec3 vColor;
        
        void main()
        {
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                      
          float angle = atan(modelPosition.x, modelPosition.z);
          float distanceToCenter = length(modelPosition.xz);
          float angleOffset = (1.0 / distanceToCenter) * uTime;
          angle += angleOffset;
          modelPosition.x = cos(angle);
          modelPosition.z = sin(angle);
      
          modelPosition.xyz += aRandomness;
      
          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectedPosition = projectionMatrix * viewPosition;
          gl_Position = projectedPosition;
      
          gl_PointSize = uSize * aScale;
          gl_PointSize *= (1.0 / - viewPosition.z);

          vColor = color;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main()
        {
          float strength = distance(gl_PointCoord, vec2(0.5));
          strength = 1.0 - strength;
          strength = pow(strength, 10.0);
      
          vec3 color = mix(vec3(0.0), vColor, strength);
          gl_FragColor = vec4(color, 1.0);
        }             
      `,
    })

    /**
     * Points
     */
    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);
  }

  ticker () {
    const elapsedTime = this.clock.getElapsedTime();
    // Update material
    this.material.uniforms.uTime.value = elapsedTime;
    // Update controls
    this.orbitControls.update();
    // Render
    this.renderer.render(this.scene, this.camera);
    // Call tick again on the next frame
    window.requestAnimationFrame(this.ticker.bind(this));
  }
}