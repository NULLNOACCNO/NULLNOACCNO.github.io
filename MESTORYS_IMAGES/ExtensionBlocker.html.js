// ExtensionBlocker delete .html

(async function() {
    let p = window.location.pathname.toLowerCase();
    if (p.endsWith('.html') || p.includes('index')) {
        document.documentElement.style.display = 'none';
        try {
            let r = await fetch('/404');
            let h = await r.text();
            document.open();
            document.write(h);
            document.close();
            window.history.replaceState(null, '', window.location.pathname);
        } catch (e) {
            window.location.replace('/404');
        }
    }
})();


//en or ar way support in type


(function() {
    function enforceTextDirection(el) {
        if (!el || (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA')) return;
        
        const ignoredTypes = ['button', 'submit', 'radio', 'checkbox', 'color', 'range', 'file', 'hidden'];
        if (ignoredTypes.includes(el.type)) return;

        const text = el.value.trim();
        
        if (text.length === 0) {
            el.setAttribute('dir', 'auto');
            el.style.textAlign = '';
            el.style.direction = '';
            return;
        }

        const isArabic = /^[^a-zA-Z]*[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);

        if (isArabic) {
            el.setAttribute('dir', 'rtl');
            el.style.direction = 'rtl';
            el.style.textAlign = 'right';
        } else {
            const isEnglishOrOther = /^[^a-zA-Z]*[a-zA-Z]/.test(text);
            if (isEnglishOrOther) {
                el.setAttribute('dir', 'ltr');
                el.style.direction = 'ltr';
                el.style.textAlign = 'left';
            }
        }
    }

    document.addEventListener('input', function(e) {
        enforceTextDirection(e.target);
    }, true);

    document.addEventListener('paste', function(e) {
        setTimeout(() => enforceTextDirection(e.target), 10);
    }, true);

    window.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('input, textarea').forEach(enforceTextDirection);
    });
})();