(function() {
    // منع التكرار
    if (window.isAiInjected) return;
    window.isAiInjected = true;
    console.log("%c[SYSTEM]: تم بدأ الأنظمة بنجاح...", "color: #0984e3; font-weight: bold;");
    
    // ==========================================
    // 1. نظام الاتصال وتخطي البروكسي (Supabase Proxy)
    // ==========================================
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
                console.log("%c[DATABASE]: تم الاتصال بـ Supabase بنجاح واستلام البيانات.", "color: #00b894; font-weight: bold;");
                return new Response(JSON.stringify(await r.json()), { status: 200, headers: {'Content-Type': 'application/json'} });
            } catch (e) { return new Response(JSON.stringify({error: e.toString()}), {status: 500}); }
        }
        return originalFetch(url, options);
    };

    // ==========================================
    // 2. محرك الاتصال بـ AICommander
    // ==========================================
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

    // ==========================================
    // 3. عقل الذكاء الصناعي المربوط بالدردشة
    // ==========================================
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

        broadcastTyping(isTyping) {
            if (typeof TypingHandler !== 'undefined') {
                TypingHandler.handleIncomingTyping({ user_id: this.aiId, is_typing: isTyping });
            }
            if (typeof chatUpdatesChannel !== 'undefined' && chatUpdatesChannel) {
                chatUpdatesChannel.send({ 
                    type: 'broadcast', 
                    event: 'typing', 
                    payload: { user_id: this.aiId, is_typing: isTyping } 
                });
            }
        },

        async processMessage(userMessage, chatId) {
            if (!navigator.onLine) return;
            
            await this.init();

            // بث "يكتب الآن"
            this.broadcastTyping(true);
            const typingInterval = setInterval(() => {
                this.broadcastTyping(true);
            }, 2000);

            try {
                // سحب آخر 20 رسالة من سجل المحادثة
                const historyArray = (typeof currentChatState !== 'undefined' ? currentChatState.messages :[]).slice(-20);
                const safeHistory = historyArray.map(m => `${m.user_id === this.aiId ? 'Assistant' : 'User'}: ${m.content}`).join('\n');
                const currentTime = this.getCurrentTime();

                // ------------------------------------
                // مرحلة التحليل (Analyzer) 
                // ------------------------------------
                const analyzerPrompt = `
        ROLE: System Intent Analyzer (JSON Output Engine).
        
        INPUTS:
        - User Message: "${userMessage}"
        - History Context: "${safeHistory}"
        
        AVAILABLE RULES:
        1. YOU_IDENTITY.txt (Questions about Identity, Origin, Author, sexual, illegal, naked, Sexual words,Your sexual potential, An alternative to illegal and sexual)
        2. SYSTEM_RULES.txt (Security, Policy, Restrictions)
        3. COMPANY_INFO.txt (SOPERS 2077, Owner, Projects)
        4. IMAGE_ENGINE.txt (Drawing, Image Generation triggers)
        5. SEARCH_PROTOCOL.txt (Real-time news, Weather, Facts)
        6. URL_PROTOCOL.txt (Link formatting instructions)
        7. PROGRAMMING_LOGIC.txt (Code, Script, Fix, Replace, Syntax, HTML/CSS/JS)
        8. FORMATTING_RULES.txt (Text styling queries)
        9. USER_INTERACTION.txt (Greetings, Small talk, Emotions)
        10. ROLEPLAY_ENGINE.txt (Persona, Roleplay)
        11. CONTEXT_INTELLIGENCE.txt (Complex/Ambiguous requests)

        TASK:
        1. Analyze the user's intent and detect the language of "User Message"
        2. Select ALL relevant files based on the intent.
        3. Determine if Time/Date is needed.
        4. Summarize history ONLY if relevant to the current request.

        OUTPUT FORMAT (Strict JSON):
        {
            "files": ["filename1.txt", "filename2.txt"],
            "need_time": boolean,
            "history_summary": "string or null",
            "detected_language": "string"
        }
        `;

                const analyzerResponse = await executeChatRequest([{ role: "user", content: analyzerPrompt }]);
                const analyzerJson = await analyzerResponse.text();
                const cleanJson = analyzerJson.match(/\{[\s\S]*\}/)?.[0] || "{}";
                
                let data = { files:["USER_INTERACTION.txt" , "YOU_IDENTITY.txt" , "SYSTEM_RULES.txt"], need_time: false, history_summary: "", detected_language: "ar" };
                try {
                    const parsed = JSON.parse(cleanJson);
                    data.files = (parsed.files && parsed.files.length > 0) ? parsed.files : data.files;
                    data.need_time = parsed.need_time || false;
                    data.history_summary = parsed.history_summary || "";
                    data.detected_language = parsed.detected_language || "ar";
                } catch (e) { console.error("Analyzer Parsing Error", e); }

                const language = data.detected_language;
                console.log(
                    `%c[المحلل] تقرير المعطيات:\n1. رسالة المستخدم: "${userMessage}"\n2. اللغة المكتشفة: ${language}\n3. الملفات المختارة: ${JSON.stringify(data.files)}\n4. طلب الوقت: ${data.need_time}\n5. ملخص التاريخ: "${data.history_summary}"`, 
                    "color: #a29bfe; background: #2d3436; padding: 12px; border-left: 5px solid #6C5CE7; font-size: 12px;"
                );

                // جلب قواعد التفكير
                const rulePromises = data.files.map(async (file) => {
                    const res = await fetch(`https://nullnoaccno.github.io/AIFEED/${file}`);
                    return res.ok ? `--- RULE FILE (${file}) ---\n${await res.text()}\n` : "";
                });
                const combinedRules = (await Promise.all(rulePromises)).join("\n");
                
                const timePayload = data.need_time ? currentTime : "";
                const deviceLang = (navigator.languages && navigator.languages.length > 0) ? navigator.languages[0].slice(0, 2) : navigator.language.slice(0, 2);        

                // ------------------------------------
                // مرحلة التنفيذ (Finalizer)
                // ------------------------------------
                const finalizerPrompt = `[SYSTEM_CONTEXT]
 - Time: ${timePayload}
 - Device Language: ${deviceLang}
 - User Locale: ${language}

 [SYSTEM_INSTRUCTIONS]
 - You are MESTORYS AI from SOPERS 2077 (A variant of HACERYOUDIE AI).
 ${combinedRules}

[LONG_TERM_MEMORY_SUMMARY]
${data.history_summary}

[RECENT_CONVERSATION_HISTORY]
${safeHistory}[CURRENT_USER_INPUT]
${userMessage}

[FINAL_OUTPUT_INSTRUCTION]
Reply strictly in ${language}. Respond ONLY with the content. No prefixes.
`;

                console.log("%c[المنفذ] الرسالة المرسلة:", "color: #00cec9; font-weight: bold;", finalizerPrompt);

                const finalizerResponse = await executeChatRequest([{ role: "user", content: finalizerPrompt }]);
                let finalReply = await finalizerResponse.text();
                
                const proxyTester = window.AICommander ? window.AICommander.getProxyError() : "403";
                if (finalReply === proxyTester) throw new Error("403");

                console.log("%c[المنفذ] الرسالة المستلمة:", "color: #fd79a8; font-weight: bold;", finalReply);

                // ------------------------------------
                // معالجة الصور والروابط (مع كسر الكاش)
                // ------------------------------------
                let msgType = "text";
                let fileUrl = null;
                let displayContent = finalReply;

                const imgRegex = /(?:!\[.*?\]\((https?:\/\/[^\s)]+)\))|(https?:\/\/image\.pollinations\.ai[^\s)]+)/i;
                const match = finalReply.match(imgRegex);

                if (match) {
                    msgType = "image";
                    fileUrl = match[1] || match[2];
                    
                    // إضافة seed عشوائي لتجاوز مشكلة الكاش (تكرار نفس الصورة)
                    if (fileUrl && fileUrl.includes('pollinations.ai')) {
                        fileUrl += (fileUrl.includes('?') ? '&' : '?') + 'seed=' + Date.now();
                    }
                    
                    displayContent = finalReply.replace(match[0], '').trim(); // إزالة رابط الصورة من النص
                }

                // ------------------------------------
                // إرسال الرد إلى قاعدة بيانات Supabase
                // ------------------------------------
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
                const errorMsg = error.message.includes('403') ? "تم رفض الاتصال من الخادم." : "حدث خطأ غير متوقع.";
                
                if (typeof client !== 'undefined') {
                    await client.from("messages").insert({
                        chat_id: chatId,
                        user_id: this.aiId,
                        content: errorMsg,
                        type: "text"
                    });
                }
            } finally {
                // إيقاف مؤشر الكتابة
                clearInterval(typingInterval);
                this.broadcastTyping(false);
            }
        }
    };

    // تشغيل النظام
    window.MestorysAI.init();
})();