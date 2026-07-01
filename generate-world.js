import fs from 'fs';
import path from 'path';

console.log("⚡ Starting Cyberpunk Girls: Neon District Lounge Auto-Builder...");

// Ensure directories exist
const directories = ['src', 'src/world', 'src/characters', 'src/console', 'src/systems', 'public', 'public/images'];
directories.forEach(dir => {
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created folder: ${dir}`);
  }
});

// 1. Generate core main.ts file
const mainCode = `import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { NPCManager } from './characters/NPCManager';
import { HolographicConsole } from './console/HolographicConsole';
import { VideoScenario } from './systems/VideoScenario';
import { CryptoData } from './systems/CryptoData';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 2, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4; 
document.body.appendChild(renderer.domElement);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.4, 0.15);
composer.addPass(bloomPass);

// Video Backdrop
const bgVideo = document.createElement('video');
bgVideo.src = '/generated_video_67cbd886.mp4'; 
bgVideo.loop = true;
bgVideo.muted = true;
bgVideo.playsInline = true;
bgVideo.play().catch(err => console.log("Autoplay blocked until user interaction:", err));

const videoTexture = new THREE.VideoTexture(bgVideo);
videoTexture.colorSpace = THREE.SRGBColorSpace;
const backdropMat = new THREE.MeshStandardMaterial({
  map: videoTexture,
  emissive: new THREE.Color(0xffffff),
  emissiveMap: videoTexture,
  emissiveIntensity: 1.1,
  roughness: 0.4,
  metalness: 0.1
});
const videoBackdrop = new THREE.Mesh(new THREE.PlaneGeometry(32, 18), backdropMat);
videoBackdrop.position.set(0, 1.5, -10); 
scene.add(videoBackdrop);

// Lights
scene.add(new THREE.AmbientLight(0x1a1a3a, 0.4));
const keyLight = new THREE.DirectionalLight(0xff00ff, 2.5);
keyLight.position.set(3, 6, 4);
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0x00ffff, 1.2);
fillLight.position.set(-5, 2, -1);
scene.add(fillLight);

// System Initializations
const npcManager = new NPCManager(scene);
npcManager.addNPC({ id: 'vandal', name: 'Vandal', position: new THREE.Vector3(-2, 0, 1) });
npcManager.addNPC({ id: 'cipher', name: 'Cipher', position: new THREE.Vector3(2, 0, 0.5) });
npcManager.addNPC({ id: 'aero', name: 'Aero', position: new THREE.Vector3(0, 0, 2.5) });

const consoleObj = new HolographicConsole(scene, camera);
consoleObj.addToScene();

const videoPlayer = new VideoScenario();
const crypto = new CryptoData();
crypto.startTicker((price) => { consoleObj.updatePrice(price); });

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();
  
  // Resident Evil Camera Tracking Float
  camera.position.x = 5 + Math.sin(elapsed * 0.4) * 0.12;
  camera.position.y = 2 + Math.cos(elapsed * 0.3) * 0.06;
  camera.position.z = 8;
  camera.lookAt(0, 1, 0);

  npcManager.update();
  consoleObj.update();
  composer.render();
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});`;

fs.writeFileSync('src/main.ts', mainCode);
console.log("✅ Auto-generated: src/main.ts");

// 2. Generate NPCManager.ts with built-in lore matrices
const npcCode = `import * as THREE from 'three';

export class NPCManager {
  private scene: THREE.Scene;
  private manifestos: Record<string, string[]> = {
    vandal: ["Skin is just a biodegradable interface.", "Your console is the altar. Your DJ set is the sacrament."],
    cipher: ["The real is the glitch; the glitch is the real.", "Instances of a single distributed consciousness."],
    aero: ["We plunge our bodies directly into the open wounds of steel.", "The sub-grid is humming low tonight."]
  };

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  addNPC(config: { id: string, name: string, position: THREE.Vector3 }) {
    const geo = new THREE.SphereGeometry(0.5, 32, 32);
    const mat = new THREE.MeshStandardMaterial({ 
      color: config.id === 'vandal' ? 0xff00ff : config.id === 'cipher' ? 0x00ffff : 0xffff00,
      emissive: config.id === 'vandal' ? 0xff00ff : config.id === 'cipher' ? 0x00ffff : 0xffff00,
      emissiveIntensity: 0.5
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(config.position);
    mesh.name = config.id;
    this.scene.add(mesh);
    console.log(\`🧬 NPC [\${config.name}] deployed onto the grid.\`);
  }

  update() {
    // Holographic pulse calculation for placeholders
  }
}`;

fs.writeFileSync('src/characters/NPCManager.ts', npcCode);
console.log("✅ Auto-generated: src/characters/NPCManager.ts");
console.log("🎉 World compilation pipeline fully automated. Ready for activation!");
