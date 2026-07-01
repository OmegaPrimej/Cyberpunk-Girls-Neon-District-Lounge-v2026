import * as THREE from 'three';

// ... after creating scene, camera, renderer ...

// 1. Create a video element
const video = document.createElement('video');
video.src = '/videos/background_loop.mp4';   // relative to public/
video.loop = true;
video.muted = true;
video.autoplay = true;
video.playsInline = true;
video.crossOrigin = 'anonymous';

// 2. Start playing (user gesture may be needed in some browsers)
video.play().catch(() => {
  console.warn('Autoplay blocked – click anywhere to start');
  // You can add a click listener to play later
});

// 3. Create a video texture
const videoTexture = new THREE.VideoTexture(video);
videoTexture.colorSpace = THREE.SRGBColorSpace;

// 4. Set as scene background
scene.background = videoTexture;



import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { NPCManager } from './characters/NPCManager';
import { HolographicConsole } from './console/HolographicConsole';
import { VideoScenario } from './systems/VideoScenario';
import { CryptoData } from './systems/CryptoData';
import { loadGLTF } from './utils/loaders';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a1a);
scene.fog = new THREE.FogExp2(0x0a0a1a, 0.002);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 2, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

// Controls (first‑person feel)
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2.2;

// Post-processing – neon glow
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.4, 0.2, 0.1);
composer.addPass(bloomPass);

// Lights – cyberpunk mood
const ambientLight = new THREE.AmbientLight(0x222244, 0.5);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xff44aa, 2);
keyLight.position.set(3, 5, 4);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x44aaff, 0.8);
fillLight.position.set(-4, 2, -3);
scene.add(fillLight);

// Neon signs – just a simple plane with emissive texture
// (You'll load your generated images here later)
const neonMat = new THREE.MeshStandardMaterial({
  color: 0xff00ff,
  emissive: 0xff00ff,
  emissiveIntensity: 0.6,
});
const sign = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.5), neonMat);
sign.position.set(0, 2.5, -3);
scene.add(sign);

// ============================================================
// 1. NPC SYSTEM
// ============================================================
const npcManager = new NPCManager(scene);
// Add some characters with generated portraits
npcManager.addNPC({
  id: 'lina',
  name: 'Lina',
  bio: 'Cyberpunk DJ, loves neon and chaos.',
  voice_id: 'en-US-Neural2-F',
  portrait: 'generated_forecast/forecast_000.png', // from your image generator
  position: new THREE.Vector3(-2, 0, 1),
});
npcManager.addNPC({
  id: 'shyla',
  name: 'Shyla',
  bio: 'Hacker with a heart of gold.',
  voice_id: 'en-US-Neural2-F',
  portrait: 'generated_forecast/forecast_001.png',
  position: new THREE.Vector3(2, 0, 0.5),
});
npcManager.addNPC({
  id: 'nova',
  name: 'Nova',
  bio: 'Rooftop racer, knows the city secrets.',
  voice_id: 'en-US-Neural2-F',
  portrait: 'generated_forecast/forecast_002.png',
  position: new THREE.Vector3(0, 0, 2.5),
});

// ============================================================
// 2. HOLOGRAPHIC CONSOLE
// ============================================================
const consoleObj = new HolographicConsole(scene, camera);
consoleObj.addToScene();

// ============================================================
// 3. VIDEO SCENARIO SYSTEM
// ============================================================
const videoPlayer = new VideoScenario();
// Preload videos (you'll need to place MP4s in public/videos/)
videoPlayer.loadScenarios([
  { id: 'lounge', src: '/videos/lounge.mp4' },
  { id: 'rooftop', src: '/videos/rooftop.mp4' },
  { id: 'cuba', src: '/videos/cuba.mp4' },
]);

// ============================================================
// 4. REAL-WORLD DATA (crypto ticker)
// ============================================================
const crypto = new CryptoData();
crypto.startTicker((price) => {
  // update holographic display with BTC price
  consoleObj.updatePrice(price);
});

// ============================================================
// 5. ANIMATION LOOP
// ============================================================
function animate() {
  requestAnimationFrame(animate);

  controls.update();

  // NPC idle animations
  npcManager.update();

  // Console glow pulse
  consoleObj.update();

  // Video sync (if playing)
  videoPlayer.update();

  composer.render();
}
animate();

// Resize
window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
});
