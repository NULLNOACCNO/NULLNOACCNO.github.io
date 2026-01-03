const KeyArmy = [
    "AIzaSyA6WdwnzLNWg0DsScW9MHoPHgNtIVfbJmE",
    "AIzaSyDvheFFKflZVhWAMGGfGIZsarLG5qpGKj4",
    "AIzaSyBUDY5QsZPSpvbvKX8CQnPLy_hN8fynDb0",
    "AIzaSyApTPF5Iwe4SZ5I8-TyEJroe3JcsnGh3wg",
    "AIzaSyBKWZaS8KdTzOStR4wavK6SGjQcjBdnfvs",
    "AIzaSyAH0P7Y6dSeQ7Alemd7O7oY7h63Sy_lkzE",
    "AIzaSyDSOt0DJbhrqAvBcGJ0126Zg6XYvBh6YXI",
    "AIzaSyA28p1e4ccd7wSvDpHwacUaRtbWdF0XXC8",
    "AIzaSyA6M3v6MpjPlDwKQJ4Ss-ptttqMsRCSFaU",
    "AIzaSyDs86FJGvjZ8UcG7rFHvExq9E4PttppoHU"
];

const ModelArsenal = [
    "gemma-3-27b-it",
    "gemma-3-12b-it",
    "gemma-3-4b-it",
    "gemma-3-1b-it"
];

class IntelligenceCommander {
    constructor() {
        this.currentKeyIdx = Math.floor(Math.random() * KeyArmy.length);
        this.currentModelIdx = 0;
    }

    async executeRequest(systemPrompt, userMessage) {
        let attempts = 0;
        const maxAttempts = KeyArmy.length * ModelArsenal.length;

        const payload = {
            contents: [{
                role: "user",
                parts: [{ text: `${systemPrompt}\n\nUser: ${userMessage}` }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192
            }
        };

        while (attempts < maxAttempts) {
            const key = KeyArmy[this.currentKeyIdx];
            const model = ModelArsenal[this.currentModelIdx];
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.status === 429 || response.status === 403) {
                    this.rotateAssets();
                    attempts++;
                    continue;
                }

                if (!response.ok) {
                    this.rotateAssets();
                    attempts++;
                    continue;
                }

                const data = await response.json();
                if (data.candidates && data.candidates[0].content) {
                    return data.candidates[0].content.parts[0].text;
                } else {
                    this.rotateAssets();
                    attempts++;
                    continue;
                }

            } catch (e) {
                this.rotateAssets();
                attempts++;
            }
        }
        return "ERROR_SYSTEM_LIMIT_REACHED";
    }

    rotateAssets() {
        this.currentKeyIdx = (this.currentKeyIdx + 1) % KeyArmy.length;
        if (this.currentKeyIdx === 0) {
            this.currentModelIdx = (this.currentModelIdx + 1) % ModelArsenal.length;
        }
    }
}

window.AICommander = new IntelligenceCommander();
