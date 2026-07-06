// src/systems/OpenAIHandler.ts
// Full OpenAI integration for AI NPC dialogue

export interface NPCProfile {
    name: string;
    personality: string;
    backstory: string;
    currentMood: string;
    memory: string[];
}

export class OpenAIHandler {
    private apiKey: string;
    private model: string;
    private enabled: boolean;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
        this.model = 'gpt-3.5-turbo';
        this.enabled = !!apiKey && apiKey !== 'your-openai-api-key-here';
        
        if (this.enabled) {
            console.log('🤖 OpenAI initialized');
        } else {
            console.warn('⚠️ OpenAI disabled - Add VITE_OPENAI_API_KEY to .env');
        }
    }

    async generateNPCDialogue(
        npc: NPCProfile,
        playerInput: string,
        context: string = ''
    ): Promise<string> {
        if (!this.enabled) {
            return this.getMockResponse(npc);
        }

        try {
            const systemPrompt = `You are ${npc.name}, a cyberpunk character.
Personality: ${npc.personality}
Backstory: ${npc.backstory}
Current Mood: ${npc.currentMood}
Keep responses short, cyberpunk-style.`;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: playerInput }
                    ],
                    temperature: 0.85,
                    max_tokens: 150
                })
            });

            if (!response.ok) throw new Error('API call failed');
            
            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (error) {
            console.error('OpenAI error:', error);
            return this.getMockResponse(npc);
        }
    }

    private getMockResponse(npc: NPCProfile): string {
        const responses = [
            `The neon whispers secrets, ${npc.name} knows them all.`,
            `In the grid, nothing is real. But ${npc.name} is as real as it gets.`,
            `The city breathes through ${npc.name}'s circuits.`,
            `Holographic dreams and digital screams - that's the Neon District.`,
            `${npc.name} smiles, but the smile is code.`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    updateNPCMood(npc: NPCProfile, playerAction: string): string {
        const positive = ['help', 'tip', 'thanks', 'friend', 'kind'];
        const negative = ['insult', 'threaten', 'ignore', 'hate'];
        
        let moodChange = 0;
        const lower = playerAction.toLowerCase();
        
        for (const word of positive) {
            if (lower.includes(word)) moodChange += 0.15;
        }
        for (const word of negative) {
            if (lower.includes(word)) moodChange -= 0.15;
        }

        const moods = ['hostile', 'unfriendly', 'neutral', 'friendly', 'ecstatic'];
        let idx = moods.indexOf(npc.currentMood) || 2;
        idx = Math.max(0, Math.min(4, idx + Math.round(moodChange)));
        npc.currentMood = moods[idx];
        return npc.currentMood;
    }

    isEnabled(): boolean {
        return this.enabled;
    }
}
