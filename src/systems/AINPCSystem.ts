// src/systems/AINPCSystem.ts
// Complete AI NPC System

import { OpenAIHandler, NPCProfile } from './OpenAIHandler';

export class AINPCSystem {
    private openAI: OpenAIHandler;
    private npcs: Map<string, NPCProfile> = new Map();
    private dialogueHistory: Map<string, string[]> = new Map();

    constructor(apiKey: string) {
        this.openAI = new OpenAIHandler(apiKey);
        this.initializeNPCs();
    }

    private initializeNPCs() {
        const npcList: NPCProfile[] = [
            {
                name: 'Vandal',
                personality: 'Sarcastic, street-smart, secretive, cynical but helpful',
                backstory: 'Ex-corporate hacker who runs the underground neon market',
                currentMood: 'neutral',
                memory: []
            },
            {
                name: 'Shyla',
                personality: 'Mystical, calculating, smooth-talking, crypto-obsessed',
                backstory: 'A crypto oracle who trades in information and digital futures',
                currentMood: 'friendly',
                memory: []
            },
            {
                name: 'Nova',
                personality: 'Ethereal, philosophical, detached, visionary',
                backstory: 'A digital ghost who transcended physical form',
                currentMood: 'neutral',
                memory: []
            },
            {
                name: 'Lina',
                personality: 'Direct, fierce, protective, body-horror enthusiast',
                backstory: 'A biomechanical engineer who upgrades herself with the latest tech',
                currentMood: 'friendly',
                memory: []
            }
        ];

        npcList.forEach(npc => {
            this.npcs.set(npc.name, npc);
            this.dialogueHistory.set(npc.name, []);
        });
    }

    async talkToNPC(npcName: string, message: string): Promise<string> {
        const npc = this.npcs.get(npcName);
        if (!npc) return `[ERROR] NPC "${npcName}" not found.`;

        const response = await this.openAI.generateNPCDialogue(npc, message);
        
        // Update history
        const history = this.dialogueHistory.get(npcName) || [];
        history.push(`P: ${message}`);
        history.push(`${npcName}: ${response}`);
        this.dialogueHistory.set(npcName, history);

        // Update mood
        this.openAI.updateNPCMood(npc, message);

        return response;
    }

    async getIdleBark(npcName: string): Promise<string> {
        const npc = this.npcs.get(npcName);
        if (!npc) return '...';
        
        return await this.openAI.generateNPCDialogue(
            npc,
            'Say something idle and mysterious',
            'Keep it short, atmospheric, cyberpunk'
        );
    }

    getNPC(npcName: string): NPCProfile | undefined {
        return this.npcs.get(npcName);
    }

    getAllNPCs(): NPCProfile[] {
        return Array.from(this.npcs.values());
    }

    getHistory(npcName: string): string[] {
        return this.dialogueHistory.get(npcName) || [];
    }

    clearHistory(npcName: string) {
        this.dialogueHistory.set(npcName, []);
    }

    isEnabled(): boolean {
        return this.openAI.isEnabled();
    }
}
