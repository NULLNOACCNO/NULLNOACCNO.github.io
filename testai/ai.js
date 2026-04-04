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
            return new Response("جاري تحميل نظام الذكاء الصناعي...");
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

        getCurrentTime() {
            const now = new Date();
            let hours = now.getHours();
            let minutes = now.getMinutes();
            const ampm = hours >= 12 ? 'م' : 'ص';
            hours = hours % 12;
            hours = hours ? hours : 12;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            return `[${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}] ${hours}:${minutes} ${ampm}`;
        },

        async processMessage(userMessage, chatId) {
            if (!navigator.onLine) return;
            
            await this.init();

            // بث حالة "يكتب الآن" ليراها الجميع
            if (typeof TypingHandler !== 'undefined') {
                TypingHandler.handleIncomingTyping({ user_id: this.aiId, is_typing: true });
            }
            const typingInterval = setInterval(() => {
                if (typeof TypingHandler !== 'undefined') {
                    TypingHandler.handleIncomingTyping({ user_id: this.aiId, is_typing: true });
                }
            }, 2000);

            try {
                // سحب آخر 20 رسالة
                const historyArray = (typeof currentChatState !== 'undefined' ? currentChatState.messages :[]).slice(-20);
                const safeHistory = historyArray.map(m => `${m.user_id === this.aiId ? 'Assistant' : 'User'}: ${m.content}`).join('\n');
                const currentTime = this.getCurrentTime();

                const analyzerPrompt = `
ROLE: System Intent Analyzer (JSON Output Engine).
INPUTS:
- User Message: "${userMessage}"
- History Context: "${safeHistory}"

OUTPUT FORMAT (Strict JSON):
{
    "files":["USER_INTERACTION.txt", "SYSTEM_RULES.txt"],
    "need_time": false,
    "history_summary": "Extracted summary of important facts before the last 20 messages",
    "detected_language": "ar"
}`;

                const analyzerResponse = await executeChatRequest([{ role: "user", content: analyzerPrompt }]);
                const analyzerJson = await analyzerResponse.text();
                const cleanJson = analyzerJson.match(/\{[\s\S]*\}/)?.[0] || "{}";
                
                let data = { files:["USER_INTERACTION.txt", "SYSTEM_RULES.txt"], need_time: false, history_summary: "", detected_language: "ar" };
                try {
                    const parsed = JSON.parse(cleanJson);
                    if (parsed.detected_language) data.detected_language = parsed.detected_language;
                    if (parsed.files) data.files = parsed.files;
                    if (parsed.history_summary) data.history_summary = parsed.history_summary;
                    if (parsed.need_time) data.need_time = parsed.need_time;
                } catch (e) {}

                const deviceLang = (navigator.languages && navigator.languages.length > 0) ? navigator.languages[0].slice(0, 2) : navigator.language.slice(0, 2);        
                
                const rulePromises = data.files.map(async (file) => {
                    const res = await fetch(`https://nullnoaccno.github.io/AIFEED/${file}`);
                    return res.ok ? `--- RULE FILE (${file}) ---\n${await res.text()}\n` : "";
                });
                const combinedRules = (await Promise.all(rulePromises)).join("\n");

                const finalizerPrompt = `
[SYSTEM_CONTEXT]
- Time: ${data.need_time ? currentTime : ""}
- Device Language: ${deviceLang}
- User Locale: ${data.detected_language}
- You are MESTORYS AI.
${combinedRules}[LONG_TERM_MEMORY_SUMMARY]
${data.history_summary}

[RECENT_CONVERSATION_HISTORY]
${safeHistory}

[CURRENT_USER_INPUT]
${userMessage}[FINAL_OUTPUT_INSTRUCTION]
Reply strictly in ${data.detected_language}. Respond ONLY with the content. No prefixes.`;

                const finalizerResponse = await executeChatRequest([{ role: "user", content: finalizerPrompt }]);
                let finalReply = await finalizerResponse.text();
                
                const proxyTester = window.AICommander ? window.AICommander.getProxyError() : "403";
                if (finalReply === proxyTester) throw new Error("403");

                // --- استخراج الصور ومعالجتها ---
                let msgType = "text";
                let fileUrl = null;
                let displayContent = finalReply;

                const imgRegex = /(?:!\[.*?\]\((https?:\/\/[^\s)]+)\))|(https?:\/\/image\.pollinations\.ai[^\s)]+)/i;
                const match = finalReply.match(imgRegex);

                if (match) {
                    msgType = "image";
                    fileUrl = match[1] || match[2];
                    displayContent = finalReply.replace(match[0], '').trim() || "تم توليد الصورة المطلوبة";
                }

                // === إرسال الرسالة إلى قاعدة البيانات فقط ===
                // لن نعرضها محلياً، بل سننتظر وصولها عبر Realtime Channel كأي مستخدم آخر
                if (typeof client !== 'undefined') {
                    await client.from("messages").insert({
                        chat_id: chatId,
                        user_id: this.aiId,
                        content: displayContent,
                        type: msgType,
                        file_url: fileUrl
                    });
                }

            } catch (error) {
                console.error("AI Error:", error);
                const errorMsg = error.message.includes('403') ? "تم رفض الاتصال من الخادم." : "عذراً، حدث خطأ أثناء معالجة طلبك.";
                
                if (typeof client !== 'undefined') {
                    await client.from("messages").insert({
                        chat_id: chatId,
                        user_id: this.aiId,
                        content: errorMsg,
                        type: "text"
                    });
                }
            } finally {
                clearInterval(typingInterval);
                if (typeof TypingHandler !== 'undefined') {
                    TypingHandler.handleIncomingTyping({ user_id: this.aiId, is_typing: false });
                }
            }
        }
    };

    window.MestorysAI.init();
})();