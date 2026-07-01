// src/systems/SceneManager.ts
import * as THREE from 'three';
import gsap from 'gsap';
import videojs from 'video.js';

type SceneState = 'APARTMENT' | 'ELEVATOR_TRANSITION' | 'DISTRICT_3D';

export class SceneManager {
  private state: SceneState = 'APARTMENT';
  private videoPlayer: any;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  constructor(container: HTMLElement) {
    this.initVideoPlayer();
    this.initThreeScene(container);
    this.bindEvents();
  }

  private initVideoPlayer() {
    this.videoPlayer = videojs('elevator-video', {
      controls: false,
      autoplay: false,
      preload: 'auto'
    });

    // Frame‑accurate handoff at 00:08.21 – adjust if your video timing differs
    this.videoPlayer.on('timeupdate', () => {
      if (this.state === 'ELEVATOR_TRANSITION' && 
          this.videoPlayer.currentTime() >= 8.21) {
        this.transitionToDistrict();
      }
    });
  }

  private initThreeScene(container: HTMLElement) {
    // Basic Three.js setup – you can later move this to a separate file
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0f);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 1.5, 5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    container.appendChild(this.renderer.domElement);

    // Add a simple floor and ambient light for now
    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.2);
    this.scene.add(ambientLight);

    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x111122, metalness: 0.9, roughness: 0.1 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);

    // Start render loop (you might want to integrate this with your existing animation)
    this.animate();
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    // Only render if we're in the district and the scene is visible
    if (this.state === 'DISTRICT_3D') {
      this.renderer.render(this.scene, this.camera);
    }
  }

  private bindEvents() {
    // Listen for the door click – you'll trigger this from your UI
    document.getElementById('door-trigger')?.addEventListener('click', () => this.triggerElevator());
  }

  public triggerElevator() {
    if (this.state !== 'APARTMENT') return;
    this.state = 'ELEVATOR_TRANSITION';

    // RE‑style camera scroll before video
    gsap.to('#apartment-cam', {
      y: -100,
      duration: 1.2,
      ease: 'power2.in',
      onComplete: () => {
        document.getElementById('apartment-view')!.style.display = 'none';
        document.getElementById('elevator-video')!.style.display = 'block';
        this.videoPlayer.play();
      }
    });
  }

  private transitionToDistrict() {
    this.videoPlayer.dispose();
    this.state = 'DISTRICT_3D';

    gsap.to('#elevator-video', {
      opacity: 0,
      duration: 0.8,
      onComplete: () => {
        document.getElementById('three-canvas')!.style.display = 'block';
        // Now you can load your full NeonSign + bloom etc.
        console.log('NEON DISTRICT ONLINE // ENTANGLEMENT_STABLE');
      }
    });
  }
}
