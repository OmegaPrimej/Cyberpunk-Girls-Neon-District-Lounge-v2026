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
