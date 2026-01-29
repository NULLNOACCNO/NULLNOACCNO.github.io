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
    "gemma-3n-e4b-it",
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

    async executeRequest(messages) {
        let attempts = 0;
        const maxAttempts = KeyArmy.length * ModelArsenal.length;

        const payload = {
            contents: messages.map(m => ({
                role: m.role === "system" ? "user" : m.role,
                parts: [{ text: m.content }]
            })),
            generationConfig: {
                temperature: 0.2,
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
        
        return this.getProxyError();
    }

    getProxyError() {
        const lang = (navigator.language || navigator.userLanguage || 'en').split('-')[0];
        const messages = {
    'ar': "أعتذر، لا يمكنني تنفيذ طلبك الحالي. إليك الأسباب التي قد تكون أدت لذلك:\n١ - ضغط زائد على السيرفر: قد تكون أرسلت الكثير من الرسائل في وقت قصير أو تجاوزت عدد الرموز (Tokens) المسموحة للرسالة الواحدة.\n٢ - محتوى غير قانوني أو جنسي صريح: نحن نتسم بالمرونة مع المحتوى الخيالي، ولكن أي محتوى يتضمن أذى جسدياً سيتم رفضه فوراً من النظام.\n٣ - حظر المنطقة: خدماتنا متاحة حالياً في معظم المناطق الجغرافية، بما في ذلك المناطق التي تخضع لعقوبات دولية مثل سوريا، لذا فإن احتمال الحظر لهذا السبب ضعيف.",
    'en': "I apologize, I cannot fulfill your current request. Here are the potential reasons:\n1 - Server overload: You may have sent too many messages in a short time or exceeded the token limit per message.\n2 - Illegal or explicit sexual content: While we are flexible with fictional content, any content involving physical harm will be rejected immediately.\n3 - Regional block: Our services are available in most geographic areas, including those under international sanctions like Syria, so a block for this reason is unlikely.",
    'fr': "Je m'excuse, je ne peux pas donner suite à votre demande. Voici les raisons possibles :\n1 - Surcharge du serveur : Trop de messages envoyés ou dépassement de la limite de jetons.\n2 - Contenu illégal ou sexuellement explicite : Nous sommes flexibles avec la fiction, mais tout contenu impliquant un préjudice physique sera rejeté.\n3 - Blocage régional : Nos services sont disponibles dans la plupart des régions, donc un blocage pour cette raison est peu probable.",
    'es': "Lo siento, no puedo cumplir con tu solicitud. Las razones pueden ser:\n1 - Sobrecarga del servidor: Demasiados mensajes en poco tiempo o exceso del límite de tokens.\n2 - Contenido ilegal o explícito: Somos flexibles con la ficción, pero cualquier daño físico será rechazado inmediatamente.\n3 - Bloqueo regional: Nuestros servicios están disponibles en la mayoría de las áreas, por lo que un bloqueo por este motivo es poco probable.",
    'tr': "Özür dilerim, talebinizi şu anda gerçekleştiremiyorum. Olası nedenler:\n1 - Sunucu yoğunluğu: Kısa sürede çok fazla mesaj göndermiş veya jeton sınırını aşmış olabilirsiniz.\n2 - Yasadışı veya müstehcen içerik: Kurgusal içerikte esnek olsak da, fiziksel zarar içeren talepler reddedilecektir.\n3 - Bölgesel engelleme: Hizmetlerimiz Suriye dahil birçok bölgede mevcuttur, bu nedenle engellenme ihtimali düşüktür.",
    'de': "Entschuldigung, ich kann Ihre Anfrage nicht erfüllen. Mögliche Gründe:\n1 - Serverüberlastung: Zu viele Nachrichten oder Token-Limit überschritten.\n2 - Illegale oder explizite Inhalte: Wir sind tolerant bei fiktiven Inhalten, aber körperlicher Schaden wird sofort abgelehnt.\n3 - Regionale Sperre: Unsere Dienste sind in den meisten Regionen verfügbar, daher ist eine Sperre unwahrscheinlich.",
    'ru': "Извините, я не могу выполнить ваш запрос. Возможные причины:\n1 - Перегрузка сервера: Слишком много сообщений или превышен лимит токенов.\n2 - Незаконный или откровенный контент: Мы лояльны к художественному вымыслу, но любой физический вред будет отклонен.\n3 - Региональная блокировка: Наши услуги доступны в большинстве регионов, поэтому блокировка маловероятна.",
    'zh': "抱歉，我无法处理您的请求。可能的原因包括：\n1 - 服务器过载：发送消息过多或超过令牌限制。\n2 - 非法或露骨内容：我们对虚构内容较为宽松，但任何涉及人身傷害的内容将被拒绝。\n3 - 地区封锁：我们的服务在大多数地区可用，因此不太可能是因为地区限制。",
    'ja': "申し訳ありませんが、リクエストを処理できません。考えられる理由：\n1 - サーバーの負荷：短期間に多くのメッセージを送信したか、トークン制限を超えました。\n2 - 違法または露骨な内容：フィクションには寛容ですが、身体的危害を含む内容は拒否されます。\n3 - 地域制限：当サービスはほとんどの地域で利用可能なため、地域制限の可能性は低いです。",
    'hi': "क्षमा करें, मैं आपका अनुरोध पूरा नहीं कर सकता। संभावित कारण:\n1 - सर्वर ओवरलोड: आपने बहुत अधिक संदेश भेजे हैं या टोकन सीमा पार कर ली है।\n2 - अवैध या स्पष्ट सामग्री: हम काल्पनिक सामग्री के प्रति उदार हैं, लेकिन शारीरिक नुकसान से संबंधित सामग्री को अस्वीकार कर दिया जाएगा।\n3 - क्षेत्रीय ब्लॉक: हमारी सेवाएँ अधिकांश क्षेत्रों में उपलब्ध हैं, इसलिए इसकी संभावना कम है।",
    'pt': "Desculpe, não posso atender ao seu pedido. Possíveis razões:\n1 - Sobrecarga do servidor: Muitas mensagens ou limite de tokens excedido.\n2 - Conteúdo ilegal ou explícito: Somos flexíveis com ficção, mas qualquer dano físico será rejeitado.\n3 - Bloqueio regional: Nossos serviços estão disponíveis na maioria das áreas, portanto, um bloqueio é improvável.",
    'it': "Spiacente, non posso soddisfare la tua richiesta. Possibili motivi:\n1 - Sovraccarico del server: Troppi messaggi o superamento del limite di token.\n2 - Contenuto illegale o esplicito: Siamo flessibili con la finzione, ma i danni fisici saranno rifiutati.\n3 - Blocco regionale: I nostri servizi sono disponibili nella maggior parte delle aree, quindi un blocco è improbabile.",
    'ko': "죄송합니다. 요청을 처리할 수 없습니다. 가능한 이유:\n1 - 서버 과부하: 메시지가 너무 많거나 토큰 제한을 초과했습니다.\n2 - 불법 또는 노골적인 콘텐츠: 허구적 콘텐츠는 허용되지만, 신체적 가해와 관련된 콘텐츠는 거부됩니다.\n3 - 지역 차단: 대부분의 지역에서 서비스가 제공되므로 차단 가능성은 낮습니다.",
    'nl': "Sorry, ik kan niet aan je verzoek voldoen. Mogelijke redenen:\n1 - Serveroverbelasting: Te veel berichten of tokenlimiet overschreden.\n2 - Illegale of expliciete inhoud: We zijn flexibel met fictie, maar fysieke schade wordt geweigerd.\n3 - Regionale blokkade: Onze diensten zijn in de meeste regio's beschikbaar, dus een blokkade is onwaarschijnlijk.",
    'id': "Maaf, saya tidak dapat memenuhi permintaan Anda. Kemungkinan alasan:\n1 - Kelebihan beban server: Terlalu banyak pesan atau melebihi batas token.\n2 - Konten ilegal atau eksplisit: Kami toleran terhadap fiksi, tetapi bahaya fisik akan ditolak.\n3 - Pemblokiran wilayah: Layanan kami tersedia di sebagian besar wilayah, jadi pemblokiran kecil kemungkinannya.",
    'fa': "عذرخواهی می‌کنم، امکان انجام درخواست شما وجود ندارد. دلایل احتمالی:\n۱ - ترافیک بالای سرور: ارسال پیام‌های زیاد یا فراتر رفتن از حد مجاز توکن.\n۲ - محتوای غیرقانونی یا صریح: ما در مورد محتوای تخیلی انعطاف‌پذیر هستیم، اما آزار جسمی رد خواهد شد.\n۳ - محدودیت منطقه‌ای: خدمات ما در اکثر مناطق فعال است، لذا احتمال مسدودی به این دلیل کم است.",
    'ur': "معذرت، میں آپ کی درخواست پوری نہیں کر سکتا۔ ممکنہ وجوہات:\n1 - سرور پر بوجھ: بہت زیادہ پیغامات یا ٹوکن کی حد سے تجاوز۔\n2 - غیر قانونی یا فحش مواد: ہم خیالی مواد کے لیے نرم ہیں، لیکن جسمانی نقصان پر مبنی مواد مسترد کر دیا جائے گا۔\n3 - علاقائی پابندی: ہماری خدمات اکثر علاقوں میں دستیاب ہیں، لہذا اس کا امکان کم ہے۔",
    'bn': "দুঃখিত, আমি আপনার অনুরোধটি পূরণ করতে পারছি না। সম্ভাব্য কারণ:\n১ - সার্ভার ওভারলোড: আপনি খুব কম সময়ে অনেক বেশি মেসেজ পাঠিয়েছেন।\n২ - অবৈধ বা অশ্লীল কন্টেন্ট: আমরা কাল্পনিক বিষয়ে নমনীয় হলেও শারীরিক ক্ষতির বিষয়গুলো প্রত্যাখ্যান করা হবে।\n৩ - আঞ্চলিক ব্লক: আমাদের পরিষেবা অধিকাংশ জায়গায় সচল, তাই এই সম্ভাবনা কম।",
    'vi': "Xin lỗi, tôi không thể thực hiện yêu cầu. Lý do có thể là:\n1 - Quá tải máy chủ: Gửi quá nhiều tin nhắn hoặc quá giới hạn token.\n2 - Nội dung bất hợp pháp hoặc nhạy cảm: Chúng tôi linh hoạt với nội dung hư cấu, nhưng hành vi gây hại thể xác sẽ bị từ chối.\n3 - Chặn khu vực: Dịch vụ của chúng tôi có sẵn ở hầu hết mọi nơi, nên khả năng bị chặn là rất thấp.",
    'th': "ขออภัย ไม่สามารถดำเนินการตามคำขอได้ สาเหตุที่เป็นไปได้:\n1 - เซิร์ฟเวอร์ทำงานหนักเกินไป: ส่งข้อความมากเกินไปหรือเกินขีดจำกัดโทเคน\n2 - เนื้อหาผิดกฎหมายหรือลามกอนาจาร: เราผ่อนปรนกับเนื้อหาในจินตนาการ แต่การทำร้ายร่างกายจะถูกปฏิเสธ\n3 - การบล็อกภูมิภาค: บริการของเราใช้งานได้ในพื้นที่ส่วนใหญ่ ดังนั้นสาเหตุนี้น่าจะเป็นไปได้น้อย"
};


        return messages[lang] || messages['en'];
    }

    rotateAssets() {
        this.currentKeyIdx = (this.currentKeyIdx + 1) % KeyArmy.length;
        if (this.currentKeyIdx === 0) {
            this.currentModelIdx = (this.currentModelIdx + 1) % ModelArsenal.length;
        }
    }
}

window.AICommander = new IntelligenceCommander();
