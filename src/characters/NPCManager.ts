import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OpenAI } from 'openai';

export interface NPCData {
  id: string;
  name: string;
  bio: string;
  voice_id: string;
  portrait: string;  // path to generated image
  position: THREE.Vector3;
}

export class NPCManager {
  private scene: THREE.Scene;
  private npcs: Map<string, any> = new Map();
  private openai: OpenAI;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.openai = new OpenAI({ apiKey: process.env.LLM_API_KEY });
  }

  addNPC(data: NPCData) {
    // Create a simple billboard with portrait
    const textureLoader = new THREE.TextureLoader();
    const portraitTex = textureLoader.load(data.portrait);
    const mat = new THREE.SpriteMaterial({ map: portraitTex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.position.copy(data.position);
    sprite.scale.set(0.8, 1.2, 1);
    this.scene.add(sprite);

    // Store NPC data
    this.npcs.set(data.id, {
      ...data,
      sprite,
      memory: [],
      mood: 'neutral',
      dialogueHistory: [],
    });

    // Optionally, load a 3D model instead of a sprite
    // (you can replace with GLTF)
  }

  async talkTo(npcId: string, userMessage: string): Promise<string> {
    const npc = this.npcs.get(npcId);
    if (!npc) return 'NPC not found';

    // Build context
    const context = `
You are ${npc.name}, a cyberpunk character in Neon District.
Your bio: ${npc.bio}
Current mood: ${npc.mood}
Previous conversation: ${npc.dialogueHistory.slice(-5).join('\n')}

User says: "${userMessage}"
Respond in character, short (1‑2 sentences), with a cyberpunk vibe.
    `;
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: context }],
      max_tokens: 60,
      temperature: 0.8,
    });
    const reply = response.choices[0].message.content || '...';
    npc.dialogueHistory.push(`User: ${userMessage}`);
    npc.dialogueHistory.push(`${npc.name}: ${reply}`);
    return reply;
  }

  update() {
    // Idle animations – sprites bob or rotate slightly
    this.npcs.forEach((npc) => {
      const time = Date.now() * 0.001;
      npc.sprite.position.y += Math.sin(time + npc.sprite.id) * 0.0005;
    });
  }
}
