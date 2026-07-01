import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GSAP } from 'gsap';

export class HolographicConsole {
  private scene: THREE.Scene;
  private group: THREE.Group;
  private glowLight: THREE.PointLight;
  private discs: THREE.Mesh[] = [];
  private eqBars: THREE.Mesh[] = [];

  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.set(0, 0.5, -1);

    // Base platform
    const baseGeo = new THREE.BoxGeometry(1.8, 0.1, 1.2);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x222244,
      metalness: 0.9,
      roughness: 0.2,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    this.group.add(base);

    // Jog wheels (discs)
    for (let i = 0; i < 2; i++) {
      const discGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.05, 32);
      const discMat = new THREE.MeshStandardMaterial({
        color: 0x88ddff,
        emissive: 0x22aaff,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.8,
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.set(-0.5 + i * 1.0, 0.1, 0);
      disc.rotation.x = Math.PI / 2;
      this.group.add(disc);
      this.discs.push(disc);
    }

    // EQ bars (holographic)
    for (let i = 0; i < 8; i++) {
      const barGeo = new THREE.BoxGeometry(0.06, 0.2, 0.06);
      const barMat = new THREE.MeshStandardMaterial({
        color: 0xff44aa,
        emissive: 0xff00aa,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.7,
      });
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(-0.7 + i * 0.2, 0.15, 0.5);
      this.group.add(bar);
      this.eqBars.push(bar);
    }

    // Glow light
    this.glowLight = new THREE.PointLight(0xff44aa, 1, 3);
    this.glowLight.position.set(0, 0.3, 0);
    this.group.add(this.glowLight);

    this.scene.add(this.group);
  }

  addToScene() {
    // already added in constructor
  }

  update() {
    // Animate discs (slow rotation)
    const time = Date.now() * 0.001;
    this.discs.forEach((disc, i) => {
      disc.rotation.z += 0.01 * (i + 1);
    });

    // Animate EQ bars (bouncing)
    this.eqBars.forEach((bar, i) => {
      const height = 0.1 + 0.2 * (0.5 + 0.5 * Math.sin(time * 2 + i * 1.5));
      bar.scale.y = height;
    });

    // Pulse glow
    const intensity = 0.8 + 0.4 * Math.sin(time * 1.5);
    this.glowLight.intensity = intensity;
  }

  updatePrice(price: number) {
    // Update a holographic text display (you'd use a TextGeometry or canvas texture)
    console.log(`BTC price: $${price}`);
  }
}
