import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { NPCManager } from './characters/NPCManager';
import { HolographicConsole } from './console/HolographicConsole';
import { VideoScenario } from './systems/VideoScenario';
import { CryptoData } from './systems/CryptoData';

// === 1. SCENE & FIXED CINEMATIC CAMERA SETUP ===
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 2, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4; 
document.body.appendChild(renderer.domElement);

// === 2. POST‑PROCESSING (BLOOM GLOW) ===
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight), 
  1.2,  
  0.4,  
  0.15  
);
composer.addPass(bloomPass);

// === 3. RESIDENT EVIL VIDEO BACKDROP ENGINE ===
const bgVideo = document.createElement('video');
bgVideo.src = '/generated_video_67cbd886.mp4'; 
bgVideo.loop = true;
bgVideo.muted = true;
bgVideo.playsInline = true;
bgVideo.play().catch(err => console.log("Video autoplay blocked until user click:", err));

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

const backdropGeo = new THREE.PlaneGeometry(32, 18);
const videoBackdrop = new THREE.Mesh(backdropGeo, backdropMat);
videoBackdrop.position.set(0, 1.5, -10); 
scene.add(videoBackdrop);

// === 4. CYBERPUNK ENVIRONMENTAL LIGHTING ===
const ambientLight = new THREE.AmbientLight(0x1a1a3a, 0.4);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xff00ff, 2.5);
keyLight.position.set(3, 6, 4);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x00ffff, 1.2);
fillLight.position.set(-5, 2, -1);
scene.add(fillLight);

const neonMat = new THREE.MeshStandardMaterial({
  color: 0xff00ff,
  emissive: 0xff00ff,
  emissiveIntensity: 1.5,
});
const sign = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.5), neonMat);
sign.position.set(0, 3.2, -4);
scene.add(sign);

// === 5. CORE SYSTEM MANAGERS & HAND-PICKED CYBERPUNK NAMES ===
const npcManager = new NPCManager(scene);
npcManager.addNPC({
  id: 'vandal',
  name: 'Vandal',
  bio: 'Cyberpunk DJ, loves neon, glitch audio, and acoustic chaos.',
  voice_id: 'en-US-Neural2-F',
  portrait: '/images/forecast_000.png',
  position: new THREE.Vector3(-2, 0, 1),
});
npcManager.addNPC({
  id: 'cipher',
  name: 'Cipher',
  bio: 'Digital ghost, proxy engineer, hacker with a heart of gold.',
  voice_id: 'en-US-Neural2-F',
  portrait: '/images/forecast_001.png',
  position: new THREE.Vector3(2, 0, 0.5),
});
npcManager.addNPC({
  id: 'aero',
  name: 'Aero',
  bio: 'Sub-grid racer, knows the dark alley coordinates and skyways.',
  voice_id: 'en-US-Neural2-F',
  portrait: '/images/forecast_002.png',
  position: new THREE.Vector3(0, 0, 2.5),
});

const consoleObj = new HolographicConsole(scene, camera);
consoleObj.addToScene();

const videoPlayer = new VideoScenario();
videoPlayer.loadScenarios([
  { id: 'lounge', src: '/videos/lounge.mp4' },
  { id: 'rooftop', src: '/videos/rooftop.mp4' },
  { id: 'cuba', src: '/videos/cuba.mp4' },
]);

const crypto = new CryptoData();
crypto.startTicker((price) => {
  consoleObj.updatePrice(price);
});

// === 6. ANIMATION LOOP WITH KINETIC CAMERA FLOAT ===
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  
  const elapsed = clock.getElapsedTime();
  
  camera.position.x = 5 + Math.sin(elapsed * 0.4) * 0.12;
  camera.position.y = 2 + Math.cos(elapsed * 0.3) * 0.06;
  camera.position.z = 8;
  
  camera.lookAt(0, 1, 0);

  npcManager.update();
  consoleObj.update();
  videoPlayer.update();
  
  composer.render();
}

animate();

// === 7. WINDOW RESIZE HANDLER ===
window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  
  renderer.setSize(w, h);
  composer.setSize(w, h);
});
