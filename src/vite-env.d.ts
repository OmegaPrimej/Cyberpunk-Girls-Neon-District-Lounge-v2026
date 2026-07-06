// src/main.ts
// Main entry point with OpenAI integration

import { SceneManager } from './systems/SceneManager';
import { NeonSign } from './world/NeonSign';
import { AINPCSystem } from './systems/AINPCSystem';
import * as THREE from 'three';

console.log('⚡ NEON DISTRICT LOUNGE v2026');
console.log('🌆 System initializing...');

// ============================================================
// Initialize OpenAI
// ============================================================
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const aiNPC = new AINPCSystem(apiKey || '');

if (aiNPC.isEnabled()) {
    console.log('🤖 AI NPC System ONLINE');
} else {
    console.warn('⚠️ AI NPC System DISABLED - Set VITE_OPENAI_API_KEY');
}

// ============================================================
// Initialize Scene
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('app') || document.body;
    const sceneManager = new SceneManager(container);

    // When district loads, add neon signs and NPCs
    sceneManager.onDistrictLoaded(() => {
        console.log('🌆 District loaded - activating neon signs');
        
        const scene = (sceneManager as any).scene;
        if (scene) {
            // Neon signs
            const neon1 = new NeonSign(scene, {
                text: 'NEON DISTRICT',
                color: '#ff00ff',
                position: new THREE.Vector3(0, 2.5, -2),
                size: 0.5,
                intensity: 1.2,
                pulseSpeed: 2.5,
            });

            const neon2 = new NeonSign(scene, {
                text: 'LOUNGE 2026',
                color: '#00ffff',
                position: new THREE.Vector3(0, 1.2, -2),
                size: 0.3,
                intensity: 0.8,
                pulseSpeed: 1.8,
            });

            // Animation for neon
            const clock = new THREE.Clock();
            function animateNeon() {
                const time = clock.getElapsedTime();
                neon1.update(time);
                neon2.update(time);
                requestAnimationFrame(animateNeon);
            }
            animateNeon();

            // Test NPC interaction
            (window as any).testNPC = async () => {
                const response = await aiNPC.talkToNPC('Vandal', 'Hello, what is this place?');
                console.log('Vandal says:', response);
                alert(`Vandal: ${response}`);
            };

            console.log('📖 Type: testNPC() to talk to Vandal');
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'e' || e.key === 'E') {
            sceneManager.triggerElevator();
        }
        if (e.key === 'f' || e.key === 'F') {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    });

    console.log('✅ System ready!');
    console.log('📖 Controls: [E] Elevator  [F] Fullscreen');
    console.log('🤖 Type testNPC() in console to talk to Vandal');
});
