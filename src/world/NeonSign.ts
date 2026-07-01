import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { GSAP } from 'gsap';

export class NeonSign {
  private scene: THREE.Scene;
  private group: THREE.Group;
  private tubes: THREE.Mesh[] = [];
  private glowLight: THREE.PointLight;
  private flickerTimeout: number | null = null;
  private isFlickering = false;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.position.set(0, 3.2, -4);
    this.group.scale.set(0.6, 0.6, 0.6);

    // Load font and build text
    this.buildSign();

    // Glow point light
    this.glowLight = new THREE.PointLight(0xff2266, 2, 8);
    this.glowLight.position.set(0, 0.5, 0.5);
    this.group.add(this.glowLight);

    // Flicker effect (starts after 2s)
    setTimeout(() => this.startFlicker(), 2000);

    this.scene.add(this.group);
  }

  private async buildSign() {
    const loader = new FontLoader();

    // Try loading the default Three.js font
    // You need to have this font file in your public/fonts/ folder
    // Download from: https://threejs.org/examples/fonts/helvetiker_regular.typeface.json
    try {
      const font = await new Promise((resolve, reject) => {
        loader.load(
          '/fonts/helvetiker_regular.typeface.json',
          resolve,
          undefined,
          reject
        );
      });

      this.createTextGeometry(font);
    } catch (error) {
      console.warn('Font not loaded, using canvas fallback for neon sign.');
      this.createCanvasFallback();
    }
  }

  private createTextGeometry(font: any) {
    const text = 'RED LIGHT';
    const geometry = new TextGeometry(text, {
      font: font,
      size: 0.8,
      height: 0.1,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.01,
      bevelSegments: 4,
    });
    geometry.computeBoundingBox();

    // Center the text
    const box = geometry.boundingBox!;
    const centerX = (box.max.x + box.min.x) / 2;
    const centerY = (box.max.y + box.min.y) / 2;
    geometry.translate(-centerX, -centerY, 0);

    // Neon tube material – intense pink/red
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff2266,
      emissive: 0xff0044,
      emissiveIntensity: 2.0,
      metalness: 0.3,
      roughness: 0.2,
    });

    const mesh = new THREE.Mesh(geometry, mat);
    this.group.add(mesh);
    this.tubes.push(mesh);

    // Inner glow (smaller, brighter)
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xff88aa,
      emissive: 0xff4488,
      emissiveIntensity: 3.0,
      transparent: true,
      opacity: 0.6,
    });
    const innerMesh = new THREE.Mesh(geometry.clone(), innerMat);
    innerMesh.scale.set(0.85, 0.85, 0.85);
    this.group.add(innerMesh);
    this.tubes.push(innerMesh);

    // "DISTRICT" below
    const geo2 = new TextGeometry('DISTRICT', {
      font: font,
      size: 0.5,
      height: 0.08,
      curveSegments: 8,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.01,
    });
    geo2.computeBoundingBox();
    const box2 = geo2.boundingBox!;
    const cx2 = (box2.max.x + box2.min.x) / 2;
    const cy2 = (box2.max.y + box2.min.y) / 2;
    geo2.translate(-cx2, -cy2 - 0.7, 0);

    const mat2 = new THREE.MeshStandardMaterial({
      color: 0x66ccff,
      emissive: 0x44aaff,
      emissiveIntensity: 1.8,
      metalness: 0.3,
      roughness: 0.2,
    });
    const mesh2 = new THREE.Mesh(geo2, mat2);
    this.group.add(mesh2);
    this.tubes.push(mesh2);

    // Glow halo (transparent plane behind text)
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xff0044,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const haloGeo = new THREE.PlaneGeometry(4.5, 1.8);
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(0, 0, -0.2);
    this.group.add(halo);
  }

  private createCanvasFallback() {
    // Fallback: render text to a canvas and use as a sprite/plane
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Background (transparent)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Glow blur behind text
    ctx.shadowColor = '#ff0044';
    ctx.shadowBlur = 60;

    // Main text
    ctx.fillStyle = '#ff2266';
    ctx.font = 'bold 120px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 80;
    ctx.fillText('RED LIGHT', canvas.width / 2, canvas.height / 2 - 40);

    // Sub text
    ctx.fillStyle = '#66ccff';
    ctx.font = 'bold 70px Arial, sans-serif';
    ctx.shadowColor = '#44aaff';
    ctx.shadowBlur = 60;
    ctx.fillText('DISTRICT', canvas.width / 2, canvas.height / 2 + 70);

    // Extra glow layer
    ctx.shadowBlur = 120;
    ctx.shadowColor = '#ff0044';
    ctx.fillStyle = 'rgba(255, 0, 68, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      emissiveMap: texture,
      emissive: 0xff2266,
      emissiveIntensity: 1.5,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    const geo = new THREE.PlaneGeometry(4, 2);
    const mesh = new THREE.Mesh(geo, mat);
    this.group.add(mesh);
    this.tubes.push(mesh);
  }

  private startFlicker() {
    this.flickerTimeout = window.setInterval(() => {
      // Random flicker – 8% chance per frame
      if (Math.random() < 0.08) {
        this.isFlickering = true;
        const duration = 50 + Math.random() * 150;

        // Dim the tubes
        this.tubes.forEach((tube) => {
          if (tube.material) {
            const mats = Array.isArray(tube.material) ? tube.material : [tube.material];
            mats.forEach((m) => {
              GSAP.to(m, {
                emissiveIntensity: 0.1,
                duration: duration / 1000,
                onComplete: () => {
                  GSAP.to(m, {
                    emissiveIntensity: m.userData?.origIntensity || 2.0,
                    duration: 0.3,
                  });
                },
              });
            });
          }
        });

        // Flicker the light
        GSAP.to(this.glowLight, {
          intensity: 0.2,
          duration: duration / 1000,
          onComplete: () => {
            GSAP.to(this.glowLight, {
              intensity: 2 + Math.random(),
              duration: 0.5,
            });
          },
        });

        setTimeout(() => {
          this.isFlickering = false;
        }, duration + 300);
      }
    }, 2000);
  }

  update() {
    // Gentle pulse
    if (!this.isFlickering) {
      const pulse = 1.8 + 0.4 * Math.sin(Date.now() * 0.001);
      this.glowLight.intensity += (pulse - this.glowLight.intensity) * 0.02;

      this.tubes.forEach((tube) => {
        if (tube.material) {
          const mats = Array.isArray(tube.material) ? tube.material : [tube.material];
          mats.forEach((m) => {
            const target = 1.8 + 0.4 * Math.sin(Date.now() * 0.001 + tube.id);
            if (m.emissiveIntensity !== undefined) {
              m.emissiveIntensity += (target - m.emissiveIntensity) * 0.02;
            }
          });
        }
      });
    }
  }

  dispose() {
    if (this.flickerTimeout) clearInterval(this.flickerTimeout);
    this.scene.remove(this.group);
  }
}
