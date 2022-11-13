import BaseThree from './BaseThree'
export default class CircleIrregularPattern extends BaseThree {
  constructor(item: IComponent) {
    super(item)
  }

  addToScene(THREE) { 
    // Geometry
    const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    // Material
    // const material = new THREE.MeshBasicMaterial({
    //   color: 0xffff00,
    // });
    const material = new THREE.ShaderMaterial({
        vertexShader: `
          varying vec2 vUv;
          void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            vUv = uv;
          }
        `,
        fragmentShader: `
          varying vec2 vUv;
          void main() {
            vec2 wavedUv = vec2(
              vUv.x + sin(vUv.y * 30.0) * 0.1,
              vUv.y + sin(vUv.x * 30.0) * 0.1
            );
            float strength = 1.0 - step(0.01, abs(distance(wavedUv, vec2(0.5)) - 0.25));
            gl_FragColor = vec4(strength, strength, strength, 1.0);
          }
        `,
        side: THREE.DoubleSide
    });

    // Mesh
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);

    this.addControls(THREE);
    this.ticker();
  }
}