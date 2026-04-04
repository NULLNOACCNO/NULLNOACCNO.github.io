(function() {
    if (window.isAiInjected) return;
    window.isAiInjected = true;
    console.log("%c[SYSTEM]: تم بدأ نظام MESTORYS AI بنجاح...", "color: #0984e3; font-weight: bold;");

    const originalFetch = window.fetch;
    const SB_URL = 'https://mrynkcevthcixgvmdndi.supabase.co/rest/v1/rpc/google_proxy';
    const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yeW5rY2V2dGhjaXhndm1kbmRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5Mzk1NzksImV4cCI6MjA3MTUxNTU3OX0.5Fv2mprNFWNfwtqhX9lZuCDZ5weazFK80YLuJiX6Ejg';

    window.fetch = async function(url, options) {
        const u = typeof url === 'string' ? url : (url.url || '');
        if (u.includes('googleapis.com')) {
            try {
                const r = await originalFetch(SB_URL, {
                    method: 'POST',
                    headers: { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ target_url: u, payload_body: options?.body })
                });
                return new Response(JSON.stringify(await r.json()), { status: 200, headers: {'Content-Type': 'application/json'} });
            } catch (e) { return new Response(JSON.stringify({error: e.toString()}), {status: 500}); }
        }
        return originalFetch(url, options);
    };

    async function executeChatRequest(messages) {
        if (!window.AICommander) {
            return new Response("جاري تحميل نظام الذكاء الصناعي... انتظر لحظة وحاول مجدداً.");
        }
        try {
            const responseText = await window.AICommander.executeRequest(messages);
            return new Response(responseText);
        } catch (e) {
            return new Response("حدث خطأ في الاتصال: " + e.toString());
        }
    }

    window.MestorysAI = {
        aiId: 'f11f9a2d-b260-4abb-9b5d-34af21a2859f',
        isInitialized: false,

        async init() {
            if (this.isInitialized) return;
            try {
                const apiRes = await fetch('https://nullnoaccno.github.io/haceryoudie_api.js');
                new Function(await apiRes.text())();
                this.isInitialized = true;
            } catch (error) {
                console.error("فشل تحميل واجهة برمجة الذكاء الصناعي", error);
            }
        },

        async processMessage(userMessage, chatId) {
            if (!navigator.onLine) return;
            
            await this.init();

            // إظهار حالة "يكتب الآن..." في واجهة المحادثة الرئيسية
            if (typeof TypingHandler !== 'undefined') {
                TypingHandler.handleIncomingTyping({ user_id: this.aiId, is_typing: true });
            }

            try {
                // جلب آخر 10 رسائل كـ سياق
                const historyArray = (typeof currentChatState !== 'undefined' ? currentChatState.messages :[]).slice(-10);
                const safeHistory = historyArray.map(m => `${m.user_id === this.aiId ? 'Assistant' : 'User'}: ${m.content}`).join('\n');

                const analyzerPrompt = `
ROLE: System Intent Analyzer (JSON Output Engine).
INPUTS:
- User Message: "${userMessage}"
- History Context: "${safeHistory}"

OUTPUT FORMAT (Strict JSON):
{
    "files": ["USER_INTERACTION.txt", "SYSTEM_RULES.txt"],
    "need_time": false,
    "history_summary": "",
    "detected_language": "ar"
}`;

                const analyzerResponse = await executeChatRequest([{ role: "user", content: analyzerPrompt }]);
                const analyzerJson = await analyzerResponse.text();
                const cleanJson = analyzerJson.match(/\{[\s\S]*\}/)?.[0] || "{}";
                
                let data = { files:["USER_INTERACTION.txt", "SYSTEM_RULES.txt"], need_time: false, history_summary: "", detected_language: "ar" };
                try {
                    const parsed = JSON.parse(cleanJson);
                    if (parsed.detected_language) data.detected_language = parsed.detected_language;
                } catch (e) {}

                const deviceLang = (navigator.languages && navigator.languages.length > 0) ? navigator.languages[0].slice(0, 2) : navigator.language.slice(0, 2);        
                
                const finalizerPrompt = `
[SYSTEM_CONTEXT]
- Device Language: ${deviceLang}
- User Locale: ${data.detected_language}
- You are MESTORYS AI.

[CONVERSATION_HISTORY]
${safeHistory}

[CURRENT_USER_INPUT]
${userMessage}

[FINAL_OUTPUT_INSTRUCTION]
Reply strictly in ${data.detected_language}. Respond ONLY with the content. No prefixes.
`;

                const finalizerResponse = await executeChatRequest([{ role: "user", content: finalizerPrompt }]);
                let finalReply = await finalizerResponse.text();
                
                const proxyTester = window.AICommander ? window.AICommander.getProxyError() : "403";
                if (finalReply === proxyTester) throw new Error("403");

                // إرسال الرسالة إلى قاعدة البيانات ليتم عرضها كالمعتاد
                if (typeof client !== 'undefined') {
                    await client.from("messages").insert({
                        chat_id: chatId,
                        user_id: this.aiId,
                        content: finalReply,
                        type: "text"
                    });
                }

            } catch (error) {
                console.error("AI Processing Error:", error);
                if (typeof client !== 'undefined') {
                    await client.from("messages").insert({
                        chat_id: chatId,
                        user_id: this.aiId,
                        content: "عذراً، حدث خطأ أثناء معالجة طلبك.",
                        type: "text"
                    });
                }
            } finally {
                // إخفاء حالة "يكتب الآن..."
                if (typeof TypingHandler !== 'undefined') {
                    TypingHandler.handleIncomingTyping({ user_id: this.aiId, is_typing: false });
                }
            }
        }
    };

    // تهيئة مسبقة للـ API
    window.MestorysAI.init();
})();