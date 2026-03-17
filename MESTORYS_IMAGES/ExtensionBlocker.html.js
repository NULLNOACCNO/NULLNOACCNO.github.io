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


