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
        const isApp = window.location.protocol === 'file:' || !window.location.hostname.includes('localhost');

        const payload = {
            contents: [{
                role: "user",
                parts: [{ text: `${systemPrompt}\n\nUser: ${userMessage}` }]
            }]
        };

        while (attempts < maxAttempts) {
            const key = KeyArmy[this.currentKeyIdx];
            const model = ModelArsenal[this.currentModelIdx];
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

            try {
                let fetchOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                };

                if (isApp) {
                    // تشفير البيانات لإخفاء الموقع وتمريرها عبر Interceptor التطبيق
                    const ghostBody = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
                    fetchOptions.headers['X-Ghost-Body'] = ghostBody;
                } else {
                    // استخدام بروكسي للـ Localhost لتغيير الموقع
                    fetchOptions.body = JSON.stringify(payload);
                    const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(endpoint);
                    return await this.performFetch(proxyUrl, fetchOptions);
                }

                const response = await fetch(endpoint, fetchOptions);

                if (response.status === 429 || response.status === 403) {
                    this.rotateAssets();
                    attempts++;
                    continue;
                }

                const data = await response.json();
                return data.candidates[0].content.parts[0].text;

            } catch (e) {
                this.rotateAssets();
                attempts++;
            }
        }
        return "ERROR_LIMIT";
    }

    async performFetch(url, options) {
        const res = await fetch(url, options);
        const data = await res.json();
        return data.candidates[0].content.parts[0].text;
    }

    rotateAssets() {
        this.currentKeyIdx = (this.currentKeyIdx + 1) % KeyArmy.length;
        if (this.currentKeyIdx === 0) this.currentModelIdx = (this.currentModelIdx + 1) % ModelArsenal.length;
    }
}

window.AICommander = new IntelligenceCommander();
