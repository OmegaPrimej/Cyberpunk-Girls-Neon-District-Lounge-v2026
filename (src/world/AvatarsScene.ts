// src/world/AvatarsScene.ts
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

type AvatarState = 'idle' | 'focus' | 'selected'

type AvatarConfig = {
  id: string
  name: string
  modelPath: string
  position: THREE.Vector3
  accentColor: number
}

class CyberpunkAvatar {
  id: string
  name: string
  modelPath: string
  accentColor: number
  group: THREE.Group
  loaded: boolean
  mixer?: THREE.AnimationMixer
  state: AvatarState

  constructor(scene: THREE.Scene, cfg: AvatarConfig, loader: GLTFLoader) {
    this.id = cfg.id
    this.name = cfg.name
    this.modelPath = cfg.modelPath
    this.accentColor = cfg.accentColor
    this.group = new THREE.Group()
    this.group.position.copy(cfg.position)
    this.loaded = false
    this.state = 'idle'

    scene.add(this.group)

    loader.load(
      this.modelPath,
      gltf => {
        const root = gltf.scene
        root.traverse(obj => {
          if ((obj as THREE.Mesh).isMesh) {
            const mesh = obj as THREE.Mesh
            mesh.castShadow = true
            mesh.receiveShadow = true

            const mat = mesh.material as THREE.MeshStandardMaterial
            if (mat && mat.emissive !== undefined) {
              mat.emissive = new THREE.Color(this.accentColor)
              mat.emissiveIntensity = 1.2
            }
          }
        })

        this.group.add(root)

        if (gltf.animations && gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(root)
          const clip = gltf.animations[0]
          const action = this.mixer.clipAction(clip)
          action.play()
        }

        this.loaded = true
      },
      undefined,
      err => console.error(`Avatar ${this.id} failed to load:`, err)
    )
  }

  setState(state: AvatarState) {
    this.state = state
  }

  update(delta: number, time: number) {
    if (this.mixer) this.mixer.update(delta)

    // subtle idle motion
    const baseY = 0
    const wobble = Math.sin(time * 1.5 + this.group.position.x * 0.3) * 0.02
    this.group.position.y = baseY + wobble

    // emissive pulse based on state
    let pulseFactor = 1.0
    if (this.state === 'idle') pulseFactor = 0.9 + 0.1 * Math.sin(time * 2.0)
    if (this.state === 'focus') pulseFactor = 1.0 + 0.3 * Math.sin(time * 3.0)
    if (this.state === 'selected') pulseFactor = 1.2 + 0.4 * Math.sin(time * 4.0)

    this.group.traverse(obj => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh
        const mat = mesh.material as THREE.MeshStandardMaterial
        if (mat && mat.emissive !== undefined) {
          mat.emissiveIntensity = pulseFactor
        }
      }
    })
  }
}

export class AvatarsScene {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  controls: OrbitControls
  loader: GLTFLoader
  avatars: CyberpunkAvatar[] = []
  clock: THREE.Clock
  raycaster: THREE.Raycaster
  mouse: THREE.Vector2

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x05060a)

    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    )
    this.camera.position.set(0, 1.7, 7)

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(this.renderer.domElement)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.target.set(0, 1.5, 0)

    this.loader = new GLTFLoader()
    this.clock = new THREE.Clock()

    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()

    this.setupLights()
    this.spawnAvatars()

    window.addEventListener('resize', () => this.onResize(container))
    this.renderer.domElement.addEventListener('click', this.onClick)

    this.animate()
  }

  setupLights() {
    const hemi = new THREE.HemisphereLight(0x222244, 0x000000, 0.7)
    this.scene.add(hemi)

    const key = new THREE.SpotLight(0x88ccff, 1.6, 40, Math.PI / 6, 0.3, 1)
    key.position.set(6, 9, 6)
    key.castShadow = true
    this.scene.add(key)

    const rim = new THREE.SpotLight(0xff00ff, 1.3, 40, Math.PI / 5, 0.4, 1)
    rim.position.set(-6, 7, -5)
    rim.castShadow = true
    this.scene.add(rim)

    const floorGeo = new THREE.PlaneGeometry(40, 40)
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x050509,
      metalness: 0.9,
      roughness: 0.18
    })
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    this.scene.add(floor)
  }

  spawnAvatars() {
    const configs: AvatarConfig[] = [
      {
        id: 'silver_headset',
        name: 'Silver Headset',
        modelPath: '/models/cyber_girl_01.glb',
        position: new THREE.Vector3(-2.2, 0, 0),
        accentColor: 0x00ff88
      },
      {
        id: 'pink_pony',
        name: 'Pink Pony',
        modelPath: '/models/cyber_girl_02.glb',
        position: new THREE.Vector3(-0.7, 0, 0),
        accentColor: 0xff00aa
      },
      {
        id: 'katana_core',
        name: 'Katana Core',
        modelPath: '/models/cyber_girl_03.glb',
        position: new THREE.Vector3(0.8, 0, 0),
        accentColor: 0xff2222
      },
      {
        id: 'blonde_rim',
        name: 'Blonde Rim',
        modelPath: '/models/cyber_girl_04.glb',
        position: new THREE.Vector3(2.3, 0, 0),
        accentColor: 0xffaa33
      }
    ]

    configs.forEach(cfg => {
      const avatar = new CyberpunkAvatar(this.scene, cfg, this.loader)
      this.avatars.push(avatar)
    })
  }

  onResize(container: HTMLElement) {
    this.camera.aspect = container.clientWidth / container.clientHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(container.clientWidth, container.clientHeight)
  }

  onClick = (event: MouseEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = this.raycaster.intersectObjects(
      this.avatars.map(a => a.group),
      true
    )

    if (intersects.length > 0) {
      const hit = intersects[0].object
      const avatar = this.avatars.find(a => a.group === hit.parent || a.group.children.includes(hit))
      if (avatar) {
        this.avatars.forEach(a => a.setState('idle'))
        avatar.setState('selected')
        console.log(`Selected avatar: ${avatar.id} (${avatar.name})`)
      }
    }
  }

  animate = () => {
    requestAnimationFrame(this.animate)

    const delta = this.clock.getDelta()
    const time = this.clock.elapsedTime

    this.controls.update()

    for (const avatar of this.avatars) {
      avatar.update(delta, time)
    }

    this.renderer.render(this.scene, this.camera)
  }
}
