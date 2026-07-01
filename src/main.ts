import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { NPCManager } from './characters/NPCManager';
import { HolographicConsole } from './console/HolographicConsole';
import { VideoScenario } from './systems/VideoScenario';
import { CryptoData } from './systems/CryptoData';

// Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 2, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2.2;

// Post‑processing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.4, 0.2, 0.1);
composer.addPass(bloomPass);

// === BACKGROUND (STATIC IMAGE) ===
const textureLoader = new THREE.TextureLoader();
const bgTexture = textureLoader.load('/images/077d8204-84ad-4735-a79e-413ba086df8b.png');
scene.background = bgTexture;

// Lights
const ambientLight = new THREE.AmbientLight(0x222244, 0.5);
scene.add(ambientLight);
const keyLight = new THREE.DirectionalLight(0xff44aa, 2);
keyLight.position.set(3, 5, 4);
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0x44aaff, 0.8);
fillLight.position.set(-4, 2, -3);
scene.add(fillLight);

// Neon sign
const neonMat = new THREE.MeshStandardMaterial({
  color: 0xff00ff,
  emissive: 0xff00ff,
  emissiveIntensity: 0.6,
});
const sign = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.5), neonMat);
sign.position.set(0, 2.5, -3);
scene.add(sign);

// NPCs
const npcManager = new NPCManager(scene);
npcManager.addNPC({
  id: 'lina',
  name: 'Lina',
  bio: 'Cyberpunk DJ, loves neon and chaos.',
  voice_id: 'en-US-Neural2-F',
  portrait: '/images/forecast_000.png',
  position: new THREE.Vector3(-2, 0, 1),
});
npcManager.addNPC({
  id: 'shyla',
  name: 'Shyla',
  bio: 'Hacker with a heart of gold.',
  voice_id: 'en-US-Neural2-F',
  portrait: '/images/forecast_001.png',
  position: new THREE.Vector3(2, 0, 0.5),
});
npcManager.addNPC({
  id: 'nova',
  name: 'Nova',
  bio: 'Rooftop racer, knows the city secrets.',
  voice_id: 'en-US-Neural2-F',
  portrait: '/images/forecast_002.png',
  position: new THREE.Vector3(0, 0, 2.5),
});

// Holographic console
const consoleObj = new HolographicConsole(scene, camera);
consoleObj.addToScene();

// Video Scenario (for transitions – you can keep this even without videos)
const videoPlayer = new VideoScenario();
videoPlayer.loadScenarios([
  { id: 'lounge', src: '/videos/lounge.mp4' },
  { id: 'rooftop', src: '/videos/rooftop.mp4' },
  { id: 'cuba', src: '/videos/cuba.mp4' },
]);

// Crypto
const crypto = new CryptoData();
crypto.startTicker((price) => {
  consoleObj.updatePrice(price);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  npcManager.update();
  consoleObj.update();
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




import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { NPCManager } from './characters/NPCManager';
import { HolographicConsole } from './console/HolographicConsole';
import { VideoScenario } from './systems/VideoScenario';
import { CryptoData } from './systems/CryptoData';

// ================================================================
// 1. SCENE SETUP
// ================================================================
const scene = new THREE.Scene();
// We'll set background later

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 2, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2.2;

// Post-processing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.4, 0.2, 0.1
);
composer.addPass(bloomPass);

// ================================================================
// 2. VIDEO BACKGROUND (USING ONE OF YOUR UPLOADED VIDEOS)
// ================================================================
// Use one of your uploaded videos – change this to the exact file name
const VIDEO_PATH = '/videos/generated_video_67cbd886.mp4'; // or 'generated_video_98ceae74.mp4'

// Create video element
const video = document.createElement('video');
video.src = VIDEO_PATH;
video.loop = true;
video.muted = true;       // Must be muted for autoplay
video.playsInline = true;
video.crossOrigin = 'anonymous';

// Load and play
let videoReady = false;

video.addEventListener('canplay', () => {
  console.log('✅ Video can play, attempting autoplay...');
  video.play().then(() => {
    console.log('🎥 Video playing!');
    videoReady = true;
  }).catch((err) => {
    console.warn('Autoplay failed:', err);
    // Will retry on click
  });
});

video.addEventListener('error', (e) => {
  console.error('❌ Video error:', e);
  // Fallback: use a static color or image
  scene.background = new THREE.Color(0x0a0a1a);
});

// Start loading
video.load();

// Create texture
const videoTexture = new THREE.VideoTexture(video);
videoTexture.colorSpace = THREE.SRGBColorSpace;
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;

// Set as background (will be black until video loads)
scene.background = videoTexture;

// Fallback: if video not ready after 3 seconds, show a color
const fallbackTimeout = setTimeout(() => {
  if (!videoReady) {
    console.warn('⏳ Video took too long – using fallback color');
    scene.background = new THREE.Color(0x0a0a1a);
  }
}, 5000);

// Click anywhere to start video (for browsers that block autoplay)
renderer.domElement.addEventListener('click', () => {
  if (!videoReady) {
    video.play().then(() => {
      console.log('🎥 Video started on user click');
      videoReady = true;
      clearTimeout(fallbackTimeout);
      scene.background = videoTexture;
    }).catch((err) => console.warn('Play on click failed:', err));
  }
}, { once: false });

// ================================================================
// 3. LIGHTS
// ================================================================
const ambientLight = new THREE.AmbientLight(0x222244, 0.5);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xff44aa, 2);
keyLight.position.set(3, 5, 4);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x44aaff, 0.8);
fillLight.position.set(-4, 2, -3);
scene.add(fillLight);

// Neon sign
const neonMat = new THREE.MeshStandardMaterial({
  color: 0xff00ff,
  emissive: 0xff00ff,
  emissiveIntensity: 0.6,
});
const sign = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.5), neonMat);
sign.position.set(0, 2.5, -3);
scene.add(sign);

// ================================================================
// 4. NPC SYSTEM
// ================================================================
const npcManager = new NPCManager(scene);
npcManager.addNPC({
  id: 'lina',
  name: 'Lina',
  bio: 'Cyberpunk DJ, loves neon and chaos.',
  voice_id: 'en-US-Neural2-F',
  portrait: '/images/forecast_000.png', // adjust path if needed
  position: new THREE.Vector3(-2, 0, 1),
});
npcManager.addNPC({
  id: 'shyla',
  name: 'Shyla',
  bio: 'Hacker with a heart of gold.',
  voice_id: 'en-US-Neural2-F',
  portrait: '/images/forecast_001.png',
  position: new THREE.Vector3(2, 0, 0.5),
});
npcManager.addNPC({
  id: 'nova',
  name: 'Nova',
  bio: 'Rooftop racer, knows the city secrets.',
  voice_id: 'en-US-Neural2-F',
  portrait: '/images/forecast_002.png',
  position: new THREE.Vector3(0, 0, 2.5),
});

// ================================================================
// 5. HOLOGRAPHIC CONSOLE
// ================================================================
const consoleObj = new HolographicConsole(scene, camera);
consoleObj.addToScene();

// ================================================================
// 6. VIDEO SCENARIO SYSTEM (for transitions – separate overlay)
// ================================================================
const videoPlayer = new VideoScenario();
videoPlayer.loadScenarios([
  { id: 'lounge', src: '/videos/lounge.mp4' },
  { id: 'rooftop', src: '/videos/rooftop.mp4' },
  { id: 'cuba', src: '/videos/cuba.mp4' },
]);

// ================================================================
// 7. CRYPTO DATA
// ================================================================
const crypto = new CryptoData();
crypto.startTicker((price) => {
  consoleObj.updatePrice(price);
});

// ================================================================
// 8. ANIMATION LOOP
// ================================================================
function animate() {
  requestAnimationFrame(animate);

  controls.update();
  npcManager.update();
  consoleObj.update();
  videoPlayer.update();

  // Important: if video texture is not updating, we can force a flag:
  // videoTexture.needsUpdate = true; // not needed usually

  composer.render();
}
animate();

// ================================================================
// 9. RESIZE HANDLER
// ================================================================
window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
});
