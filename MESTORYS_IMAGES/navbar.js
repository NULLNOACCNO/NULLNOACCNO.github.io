 const navbar = document.getElementById('navbar31');
const spacer = document.createElement('div');

const navHeight = navbar.offsetHeight || 50; 

spacer.style.height = navHeight + 'px';
spacer.style.width = '100%';
spacer.style.display = 'block';

document.body.prepend(spacer);

const style = document.createElement('style');
style.textContent = `
#navbar31 { 
    background-color: #333; 
    position: fixed; 
    top: 0; 
    left: 0;
    z-index: 999999999;
    display: flex; 
    justify-content: center;
    padding: 0; margin: 0; 
}
.nav-constraint {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    padding-right: 10px;
    box-sizing: border-box;
}
.nav-item { flex: 1; height: 100%; display: flex; align-items: center; justify-content: center; cursor: pointer; text-decoration: none; position: relative; -webkit-tap-highlight-color: transparent; }
.nav-item:hover { background-color: rgba(255,255,255,0.1); }
#logoArea { 
    width: 48px; 
    height: 48px; 
    flex-shrink: 0;     
    display: flex; align-items: center; justify-content: center; position: relative; overflow: visible; pointer-events: none; 
}
.nav-content { width: 26px; height: 26px; fill: #000000; object-fit: contain; z-index: 2; position: relative; }
.logo-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 5; background-position: center; background-size: contain; background-repeat: no-repeat; }
.bg-tiled { background-repeat: repeat-x !important; background-size: auto 60px !important; background-position: top !important; }
`;
document.head.appendChild(style);


const svg1 = (function() {
    setTimeout(function() {
        const nav = document.getElementById("navbar31");
        if (!nav) return;        
        
        // منع التشغيل نهائياً إذا كان الفحص التلقائي مفعلاً
        if (window.autoDateDetect === true) return;

        // التشغيل فقط إذا كان الوضع اليدوي هو 7
        if (window.manualMode !== 7) return;
        nav.style.backgroundColor = "#333"; "#333";
        nav.style.overflow = "hidden";
        const content = nav.querySelector('.nav-constraint');
        if(content) { content.style.position = "relative"; content.style.zIndex = "10"; }

        const c = document.createElement('canvas');
        c.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; z-index:1; pointer-events:none; filter: blur(2px) contrast(200%);";
        nav.insertBefore(c, nav.firstChild);

        const ctx = c.getContext('2d');
        let w, h;
        
        window.windX = 0; window.windY = 0; window.windTime = 0;
        let lastInteractionTime = 0;
        let flameOffsetX = 0, flameOffsetY = 0, targetFlameX = 0, targetFlameY = 0;
        let tiltX = 0, tiltY = 0;

        function resize() {
            w = c.width = nav.offsetWidth;
            h = c.height = nav.offsetHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        class FlameCore {
            constructor() {
                this.particles = [];
                for(let i=0; i<35; i++) this.particles.push(this.createParticle());
            }

            createParticle() {
                return {
                    x: 0, 
                    y: 15,
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: (Math.random() * -1.5) - 0.5,
                    life: 1.0,
                    decay: (Math.random() * 0.015) + 0.005,
                    size: (Math.random() * 15) + 15
                };
            }

            drawExact(ctx) {
                let t = Date.now() * 0.002;
                let noiseX = Math.sin(t * 2.5) * 1.5;
                let noiseY = Math.cos(t * 3.0) * 1.0;

                const by = 25 + noiseY; 
                const bx = noiseX;      
                const size = 25 + Math.sin(t * 1) * 1.5;

                ctx.save();
                const pivotX = bx;
                const pivotY = by + 30;
                ctx.translate(pivotX, pivotY); 
                
                let rawSkew = -tiltX * 0.4;
                let lockedSkew = Math.max(-0.8, Math.min(0.8, rawSkew)); 
                let intensity = Math.abs(lockedSkew);
                let stretch = 1 + (intensity * 0.1);
                let wide = 1 + (intensity * 0.2);

                ctx.transform(wide, 0, lockedSkew, 1, 0, 0); 
                ctx.scale(1, stretch); 
                ctx.translate(-pivotX, -pivotY);

                ctx.beginPath();
                let g = ctx.createLinearGradient(bx, by - size, bx, by + size);
                g.addColorStop(0.0, 'rgba(255, 255, 255, 1)');
                g.addColorStop(0.2, 'rgba(255, 255, 255, 1)');
                g.addColorStop(0.2, 'rgba(255, 200, 100, 0.9)');
                g.addColorStop(0.6, 'rgba(255, 200, 100, 0.9)');
                g.addColorStop(0.4, 'rgba(255, 140, 0, 1)');
                g.addColorStop(1, 'rgba(255, 140, 0, 1)');
                g.addColorStop(1, 'rgba(0, 130, 255, 0.9)');
                g.addColorStop(1.0, 'rgba(0, 130, 255, 0.9)');
                ctx.fillStyle = g;
                ctx.ellipse(bx, by, size * 1, size * 2.0, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.globalCompositeOperation = 'lighter';
                ctx.globalAlpha = 0.1;
                ctx.save();
                ctx.translate(flameOffsetX, flameOffsetY);

                this.particles.forEach(p => {
                    p.life -= p.decay;
                    if (p.life <= 0 || p.size <= 0.5) {
                        Object.assign(p, this.createParticle());
                        return;
                    }
                    let pNoise = Math.sin(p.y * 0.01 + t) * Math.cos(p.x * 0.01 + t);
                    p.x += p.vx + (pNoise * 0.5);
                    p.y += p.vy;
                    
                    if (window.windTime > 0) {
                        p.vx += window.windX * 0.15;
                        p.vy += window.windY * 0.1;
                    }
                    
                    p.vx += (0 - p.x) * 0.002; 
                    p.size *= 0.97;

                    ctx.beginPath();
                    let gp = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                    let r = Math.floor(255 * p.life);
                    let gr = Math.floor(140 * p.life); 
                    let b = Math.floor(50 * p.life * p.life);
                    let a = p.life;
                    
                    gp.addColorStop(0, `rgba(255, 255, 255, ${a})`); 
                    gp.addColorStop(0.4, `rgba(255, 255, 230, ${a})`);
                    gp.addColorStop(0.7, `rgba(255, 180, 0, ${a})`);  
                    gp.addColorStop(0.85, `rgba(${r}, ${gr}, ${b}, ${a})`); 
                    gp.addColorStop(1, `rgba(50, 20, 0, 0)`); 
                    
                    ctx.fillStyle = gp;
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.restore();

                ctx.globalCompositeOperation = 'source-over';
                ctx.globalAlpha = 1.0;
                const wickWidth = size * 0.40; 
                const wickHeight = size * 0.8; 
                const wickCenterX = bx;
                const wickCenterY = (by + size) - wickHeight + 28;

                ctx.beginPath();
                ctx.ellipse(wickCenterX, wickCenterY, wickWidth, wickHeight, 0, 0, Math.PI * 2);
                ctx.fillStyle = '#000000'; 
                ctx.fill();

                ctx.restore();
            }
        }

        let flamesArr = [];
        
        for(let x = -20; x < window.innerWidth + 80; x += 15) {
            flamesArr.push({ obj: new FlameCore(), x: x, y: -5, scale: 0.35 });
        }
                
        for(let x = -20; x < window.innerWidth + 80; x += 15) {
            flamesArr.push({ obj: new FlameCore(), x: x - 7, y: 25, scale: 0.5 });
        }

        function anim() {
            ctx.globalCompositeOperation = 'source-over';
            ctx.clearRect(0, 0, w, h);
            
            flameOffsetX += (targetFlameX - flameOffsetX) * 0.6;
            flameOffsetY += (targetFlameY - flameOffsetY) * 0.6;

            flamesArr.forEach(f => {
                ctx.save();
                ctx.translate(f.x, f.y);
                ctx.scale(f.scale, f.scale); 
                f.obj.drawExact(ctx);
                ctx.restore();
            });

            if (window.windTime > 0) window.windTime--;
            requestAnimationFrame(anim);
        }

        function applyWind(clientX, clientY) {
            const now = Date.now();
            if (now - lastInteractionTime > 1000) window.windTime = 15;
            lastInteractionTime = now;
            const rect = nav.getBoundingClientRect();
            window.windX = (clientX - w/2) * 0.003;
            window.windY = (clientY - rect.top - h/2) * 0.002;
            if (window.windTime > 0) {
                targetFlameX = (clientX - w/2) * 0.02;
                targetFlameY = (clientY - rect.top - h/2) * 0.015;
            }
        }

        nav.addEventListener('mousemove', (e) => applyWind(e.clientX, e.clientY));
        nav.addEventListener('touchmove', (e) => applyWind(e.touches[0].clientX, e.touches[0].clientY));

        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (e) => {
                if (e.gamma === null || e.beta === null) return;
                let tolerance = 8, deadzone = 5, effectiveGamma = 0;
                if (Math.abs(e.beta) < deadzone && Math.abs(e.gamma) < deadzone) return;
                if (Math.abs(e.gamma) > tolerance) {
                    effectiveGamma = e.gamma > 0 ? e.gamma - tolerance : e.gamma + tolerance;
                }
                let multiplier = (Math.abs(e.beta) <= 90) ? -1 : 1;
                let targetX = effectiveGamma * 0.1 * multiplier;
                tiltX += (targetX - tiltX) * 0.4;
                tiltY = e.beta * 0.1;
            });
        }

        anim();

    }, 100);

    return "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxJyBoZWlnaHQ9JzEnPjxyZWN0IHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnIGZpbGw9J3RyYW5zcGFyZW50Jy8+PC9zdmc+";
})();
/**
 * تصميم "newYear" الاحترافي - توليد صورة SVG ديناميكية عالية الدقة
 * تحتوي على: السنة الحالية، بالونات مظللة 3D، ألعاب نارية شعاعية، وتأثيرات إضاءة.
 */
const newYear = (function() {
    const currentYear = new Date().getFullYear();
    const width = 800;
    const height = 800;

    // دالة مساعدة لإنشاء بالون احترافي
    const createBalloon = (x, y, color) => `
        <defs>
            <radialGradient id="grad${x}" cx="45%" cy="45%" r="50%">
                <stop offset="0%" stop-color="white" stop-opacity="0.6" />
                <stop offset="100%" stop-color="${color}" />
            </radialGradient>
        </defs>
        <path d="M ${x} ${y} Q ${x-20} ${y+100} ${x} ${y+150}" stroke="white" fill="none" stroke-width="1" opacity="0.5"/>
        <ellipse cx="${x}" cy="${y}" rx="35" ry="45" fill="url(#grad${x})" />
        <path d="M ${x-5} ${y+44} L ${x+5} ${y+44} L ${x} ${y+52} Z" fill="${color}" />`;

    // دالة مساعدة لإنشاء ألعاب نارية
    const createFirework = (x, y, color) => {
        let rays = '';
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 / 12) * i;
            rays += `<line x1="${x}" y1="${y}" x2="${x + Math.cos(angle) * 60}" y2="${y + Math.sin(angle) * 60}" stroke="${color}" stroke-width="2" stroke-dasharray="2,4" />`;
        }
        return `<g opacity="0.8">${rays}<circle cx="${x}" cy="${y}" r="3" fill="white">
            <animate attributeName="r" values="3;5;3" dur="1s" repeatCount="indefinite" />
        </circle></g>`;
    };

    // تجميع التصميم الكامل
    const svgRaw = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
        <rect width="100%" height="100%" fill="transparent" />
        
        <!-- خلفية مضيئة -->
        <circle cx="400" cy="400" r="300" fill="rgba(000, 000, 000, 0.3)" filter="blur(50px)" />

        <!-- الألعاب النارية -->
        ${createFirework(390, 150, '#FF5733')}
        ${createFirework(650, 120, '#33FF57')}
        ${createFirework(100, 100, '#3357FF')}
        ${createFirework(500, 40, '#F333FF')}
        ${createFirework(700, 70, '#F333FF')}
        ${createFirework(250, 80, '#F333FF')}


        <!-- البالونات -->
        ${createBalloon(200, 300, '#FF4136')}
        ${createBalloon(600, 250, '#FFDC00')}
        ${createBalloon(300, 150, '#2ECC40')}
        ${createBalloon(500, 600, '#B10DC9')}

        <!-- نص السنة الكبيرة بتصميم احترافي -->
        <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#BF953F" />
                <stop offset="25%" stop-color="#FCF6BA" />
                <stop offset="50%" stop-color="#B38728" />
                <stop offset="75%" stop-color="#FBF5B7" />
                <stop offset="100%" stop-color="#AA771C" />
            </linearGradient>
            <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
        </defs>

        <text x="50%" y="55%" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="120" fill="url(#goldGrad)" filter="url(#glow)">${currentYear}</text>
        <text x="50%" y="65%" text-anchor="middle" font-family="Verdana" font-weight="bold" font-size="40" fill="#FFF" letter-spacing="10">HAPPY NEW YEAR</text>
        
        <!-- جزيئات صغيرة (نجوم) -->
        ${Array.from({length: 20}).map(() => `<circle cx="${Math.random()*800}" cy="${Math.random()*800}" r="${Math.random()*2}" fill="white" opacity="${Math.random()}"/>`).join('')}
    </svg>`;

    // تحويل الكود البرمجي إلى رابط صورة Base64
    return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgRaw)));
})();

(function() {
    
window.manualMode = window.manualMode ?? (localStorage.getItem('manualMode') !== null ? Number(localStorage.getItem('manualMode')) : 0);
window.autoDateDetect = window.autoDateDetect ?? (localStorage.getItem('autoDateDetect') !== null ? localStorage.getItem('autoDateDetect') === 'true' : true);


    var CalendarEngine = {
        getHijri: function() {
    var date = new Date();
    // إزاحة بسيطة لضبط الرؤية إذا لزم الأمر (مثلاً -1 أو +1)
    var adjustment = 0; 
    
    if(isNaN(date.getDate())) return {d:0, m:0};

    var day = date.getDate();
    var month = date.getMonth();
    var year = date.getFullYear();

    var m = month + 1;
    var y = year;
    if (m < 3) { y -= 1; m += 12; }

    var jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + (2 - Math.floor(y / 100) + Math.floor(Math.floor(y / 100) / 4)) - 1524.5;
    
    jd += adjustment;
    var i = Math.floor(jd) + 0.5;
    var z = Math.floor((i - 1948440.5) / 10631);
    var n = Math.floor((i - 1948440.5 - 10631 * z) / 354);
    var j = (i - 1948440.5 - 10631 * z - 354 * n);
    var cyc = Math.floor((j - 1) / 30);
    var iy = 30 * z + n;
    var im = Math.floor((j - 1) / 29.5) + 1;
    var id = Math.round(j - 29.5 * (im - 1));
    
    if (im > 12) { im -= 12; iy += 1; }

    return { d: id, m: im }; // يعيد اليوم والشهر القمري الصحيح
},

        getGregorian: function() {
            var today = new Date();
            return { d: today.getDate(), m: today.getMonth() + 1 };
        },
        scan: function() {
            var h = this.getHijri();
            var g = this.getGregorian();
            if (g.m === 2 && g.d === 14) return 10; 
            if (h.m === 9) return 11;
            if (h.m === 10 && h.d <= 3) return 12; 
            if (h.m === 12 && h.d >= 10 && h.d <= 13) return 13; 
            if (h.m === 1 && h.d === 1) return 14; 
            if (h.m === 3 && h.d === 12) return 15; 
            if (g.m === 1 && g.d === 1) return 16; 
            if (g.m === 3 && g.d === 8) return 17; 
            if (g.m === 3 && g.d === 21) return 18; 
            if (g.m === 5 && g.d === 1) return 19; 
            if (g.m === 10 && g.d === 31) return 20; 
            if (g.m === 12 && g.d === 25) return 21; 
            if (g.m === 9 && (g.d === 12 || g.d === 13)) return 22;
            if (g.m === 12 && g.d === 8) return 23; 
            if (g.m === 1 && g.d === 1) return 24; 
            if (g.m === 11 && g.d === 19) return 25; 
            if (g.m === 6 && g.d === 21) return 26; 
            if (g.m === 9 && g.d === 21) return 27; 
            if (g.m === 4 && g.d === 7) return 28; 
            if (g.m === 10 && g.d === 5) return 29; 
            if (g.m === 4 && g.d === 22) return 30; 
            if (g.m === 12 && g.d === 10) return 31; 
            if (g.m === 6 && g.d === 5) return 32; 
            if (g.m === 11 && g.d === 20) return 33; 
            if (g.m === 8 && g.d === 12) return 34;
            return null;
        }
    };
        
    var placeholderSvg = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyNCcgaGVpZ2h0PScyNCc+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjY2NjIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iNCIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==";
    var mestorys = "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSItMTAgMCAyMjAgMjAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxkZWZzPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJtZVN0b3J5R29sZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmMWM0MGYiLz4gCiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2U2N2UyMiIvPiAKICAgIDwvbGluZWFyR3JhZGllbnQ+CgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJ0ZXh0R3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZDM1NDAwIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzhlNDRhZCIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KCiAgICA8ZmlsdGVyIGlkPSJzb2Z0U2hhZG93Ij4KICAgICAgPGZlRHJvcFNoYWRvdyBkeD0iMS4yIiBkeT0iMS41IiBzdGREZXZpYXRpb249IjEiIGZsb29kLWNvbG9yPSIjMDAwIiBmbG9vZC1vcGFjaXR5PSIwLjQiLz4KICAgIDwvZmlsdGVyPgoKICAgIDxnIGlkPSJzdGFySWNvbiI+CiAgICAgIDxwYXRoIGQ9Ik0yMCA1IEwyNCAxNiBMMzUgMTYgTDI2IDIzIEwyOSAzNCBMMjAgMjggTDExIDM0IEwxNCAyMyBMNSAxNiBMMTYgMTYgWiIgZmlsbD0idXJsKCNtZVN0b3J5R29sZCkiIHN0cm9rZT0iI2QzNTQwMCIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KICAgIDwvZz4KICA8L2RlZnM+CgogIDx1c2UgaHJlZj0iI3N0YXJJY29uIiB4PSItMTAiIHk9IjMwIiBmaWx0ZXI9InVybCgjc29mdFNoYWRvdykiIHRyYW5zZm9ybT0ic2NhbGUoMS4yKSIvPgogIDx1c2UgaHJlZj0iI3N0YXJJY29uIiB4PSIxNDAiIHk9IjMwIiBmaWx0ZXI9InVybCgjc29mdFNoYWRvdykiIHRyYW5zZm9ybT0ic2NhbGUoMS4yKSIvPgogIAogIDx0ZXh0IHg9IjEwMCIgeT0iMTg4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ1cmwoI3RleHRHcmFkKSIgZmlsdGVyPSJ1cmwoI3NvZnRTaGFkb3cpIj4KICAgIE1FU1RPUllTINi52YrYryDZhdmK2YTYp9ivCiAgPC90ZXh0Pgo8L3N2Zz4=";
    var themeAssets = {
    7: { bg: svg1, overlay: "" },
    8: { 
        bg: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iNjAiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InRyYW5zcGFyZW50Ii8+PGNpcmNsZSBjeD0iMTAiIGN5PSItMTAiIHI9IjIuNSIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjgiPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImN5IiBmcm9tPSItMTAiIHRvPSI3MCIgZHVyPSIycyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJjeCIgdmFsdWVzPSIxMDsyMDsxMCIgZHVyPSIzcyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz48L2NpcmNsZT48Y2lyY2xlIGN4PSIzMCIgY3k9Ii0xMCIgcj0iMS41IiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIuNSI+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0iY3kiIGZyb209Ii0xMCIgdG89IjcwIiBkdXI9IjRzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImN4IiB2YWx1ZXM9IjMwOzIwOzMwIiBkdXI9IjJzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjwvY2lyY2xlPjxjaXJjbGUgY3g9IjUwIiBjeT0iLTEwIiByPSIyIiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIuNyI+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0iY3kiIGZyb209Ii0xMCIgdG89IjcwIiBkdXI9IjNzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImN4IiB2YWx1ZXM9IjUwOzYwOzUwIiBkdXI9IjRzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjwvY2lyY2xlPjxjaXJjbGUgY3g9IjcwIiBjeT0iLTEwIiByPSIxIiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIuMyI+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0iY3kiIGZyb209Ii0xMCIgdG89IjcwIiBkdXI9IjVzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImN4IiB2YWx1ZXM9IjcwOzY1OzcwIiBkdXI9IjIuNXMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+PC9jaXJjbGU+PGNpcmNsZSBjeD0iOTAiIGN5PSItMTAiIHI9IjIuMiIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iLjkiPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImN5IiBmcm9tPSItMTAiIHRvPSI3MCIgZHVyPSIyLjVzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImN4IiB2YWx1ZXM9IjkwOzEwMDs5MCIgZHVyPSIzLjVzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjwvY2lyY2xlPjxjaXJjbGUgY3g9IjExMCIgY3k9Ii0xMCIgcj0iMS4yIiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIuNiI+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0iY3kiIGZyb209Ii0xMCIgdG89IjcwIiBkdXI9IjQuNXMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0iY3giIHZhbHVlcz0iMTEwOzEwNTsxMTAiIGR1cj0iMi44cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz48L2NpcmNsZT48Y2lyY2xlIGN4PSIyMCIgY3k9Ii0yMCIgcj0iMS44IiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIuNyI+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0iY3kiIGZyb209Ii0yMCIgdG89IjcwIiBkdXI9IjMuMnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0iY3giIHZhbHVlcz0iMjA7MTA7MjAiIGR1cj0iMi4ycyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz48L2NpcmNsZT48Y2lyY2xlIGN4PSI4MCIgY3k9Ii0zMCIgcj0iMS41IiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIuNCI+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0iY3kiIGZyb209Ii0zMCIgdG89IjcwIiBkdXI9IjMuOHMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0iY3giIHZhbHVlcz0iODA7OTA7ODAiIGR1cj0iMy4xcyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz48L2NpcmNsZT48L3N2Zz4=", 
        overlay: "" 
    },
    9: { 
        bg: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iNjAiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InRyYW5zcGFyZW50Ii8+PHBhdGggZD0iTTAgNDAgUTMwIDIwIDYwIDQwIFQxMjAgNDAgVDE4MCA0MCBUMjQwIDQwIFY2MCBIMCBaIiBmaWxsPSIjMDA3N2I2IiBvcGFjaXR5PSIuOCI+PGFuaW1hdGVUcmFuc2Zvcm0gYXR0cmlidXRlTmFtZT0idHJhbnNmb3JtIiB0eXBlPSJ0cmFuc2xhdGUiIGZyb209IjAsMCIgdG89Ii0xMjAsMCIgZHVyPSI0cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz48L3BhdGg+PHBhdGggZD0iTTAgNDUgUTMwIDM1IDYwIDQ1IFQxMjAgNDUgVDE4MCA0NSBUMjQwIDQ1IFY2MCBIMCBaIiBmaWxsPSIjMDBiNGQ4IiBvcGFjaXR5PSIuNyI+PGFuaW1hdGVUcmFuc2Zvcm0gYXR0cmlidXRlTmFtZT0idHJhbnNmb3JtIiB0eXBlPSJ0cmFuc2xhdGUiIGZyb209IjAsMCIgdG89Ii0xMjAsMCIgZHVyPSIzcyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz48L3BhdGg+PHBhdGggZD0iTTAgNTAgUTMwIDQwIDYwIDUwIFQxMjAgNTAgVDE4MCA1MCBUMjQwIDUwIFY2MCBIMCBaIiBmaWxsPSIjOTBlMGVmIiBvcGFjaXR5PSIuOSI+PGFuaW1hdGVUcmFuc2Zvcm0gYXR0cmlidXRlTmFtZT0idHJhbnNmb3JtIiB0eXBlPSJ0cmFuc2xhdGUiIGZyb209IjAsMCIgdG89Ii0xMjAsMCIgZHVyPSIycyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz48L3BhdGg+PGcgc3Ryb2tlPSIjRkZGIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+PGxpbmUgeDE9IjEzMCIgeTE9Ii0yMCIgeDI9IjEyNSIgeTI9Ii0xMCIgb3BhY2l0eT0iLjUiPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9IngxIiBmcm9tPSIxMzAiIHRvPSI5MCIgZHVyPSIwLjhzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9InkxIiBmcm9tPSItMjAiIHRvPSI3MCIgZHVyPSIwLjhzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9IngyIiBmcm9tPSIxMjUiIHRvPSI4NSIgZHVyPSIwLjhzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9InkyIiBmcm9tPSItMTAiIHRvPSI4MCIgZHVyPSIwLjhzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjwvbGluZT48bGluZSB4MT0iMTAwIiB5MT0iLTMwIiB4Mj0iOTUiIHkyPSItMjAiIG9wYWNpdHk9Ii44Ij48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJ4MSIgZnJvbT0iMTAwIiB0bz0iNjAiIGR1cj0iMC41cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJ5MSIgZnJvbT0iLTMwIiB0bz0iNjAiIGR1cj0iMC41cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJ4MiIgZnJvbT0iOTUiIHRvPSI1NSIgZHVyPSIwLjVzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9InkyIiBmcm9tPSItMjAiIHRvPSI3MCIgZHVyPSIwLjVzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjwvbGluZT48bGluZSB4MT0iNzAiIHkxPSItMTUiIHgyPSI2NSIgeTI9Ii01IiBvcGFjaXR5PSIuNiI+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ieTEiIGZyb209Ii0xNSIgdG89Ijc1IiBkdXI9IjAuN3MiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ieDEiIGZyb209IjcwIiB0bz0iMzAiIGR1cj0iMC43cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJ5MiIgZnJvbT0iLTUiIHRvPSI4NSIgZHVyPSIwLjdzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9IngyIiBmcm9tPSI2NSIgdG89IjI1IiBkdXI9IjAuN3MiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+PC9saW5lPjxsaW5lIHgxPSI0MCIgeTE9Ii0yNSIgeDI9IjM1IiB5Mj0iLTE1IiBvcGFjaXR5PSIuNyI+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ieTEiIGZyb209Ii0yNSIgdG89IjY1IiBkdXI9IjAuNnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ieDEiIGZyb209IjQwIiB0bz0iMCIgZHVyPSIwLjZzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9InkyIiBmcm9tPSItMTUiIHRvPSI3NSIgZHVyPSIwLjZzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9IngyIiBmcm9tPSIzNSIgdG89Ii01IiBkdXI9IjAuNnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+PC9saW5lPjxsaW5lIHgxPSIxNTAiIHkxPSItNSIgeDI9IjE0NSIgeTI9IjUiIG9wYWNpdHk9Ii40Ij48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJ5MSIgZnJvbT0iLTUiIHRvPSI4NSIgZHVyPSIwLjlzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9IngxIiBmcm9tPSIxNTAiIHRvPSIxMTAiIGR1cj0iMC45cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJ5MiIgZnJvbT0iNSIgdG89Ijk1IiBkdXI9IjAuOXMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ieDIiIGZyb209IjE0NSIgdG89IjEwNSIgZHVyPSIwLjlzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPjwvbGluZT48bGluZSB4MT0iMTE1IiB5MT0iLTM1IiB4Mj0iMTEwIiB5Mj0iLTI1IiBvcGFjaXR5PSIuOSI+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ieTEiIGZyb209Ii0zNSIgdG89IjU1IiBkdXI9IjAuNHMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ieDEiIGZyb209IjExNSIgdG89Ijc1IiBkdXI9IjAuNHMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ieTIiIGZyb209Ii0yNSIgdG89IjY1IiBkdXI9IjAuNHMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ieDIiIGZyb209IjExMCIgdG89IjcwIiBkdXI9IjAuNHMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIi8+PC9saW5lPjwvZz48L3N2Zz4=", 
        overlay: "" 
    },
    10: { 
    	// Valentine's Day 
        bg: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MCcgaGVpZ2h0PSc0MCcgdmlld0JveD0nMCAwIDI0IDI0Jz48cGF0aCBmaWxsPScjZmZiNmMxJyBkPSdNMTIgMjEuMzVsLTEuNDUtMS4zMkM1LjQgMTUuMzYgMiAxMi4yOCAyIDguNSAyIDUuNDIgNC40MiAzIDcuNSAzYzEuNzQgMCAzLjQxLjgxIDQuNSAyLjA5QzEzLjA5IDMuODEgMTQuNzYgMyAxNi41IDMgMTkuNTggMyAyMiA1LjQyIDIyIDguNWMwIDMuNzgtMy40IDYuODYtOC41NSAxMS41NEwxMiAyMS4zNXonIG9wYWNpdHk9JzAuMycvPjwvc3ZnPg==", 
        overlay: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgODAwIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWluWU1heCBtZWV0Ij48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImcxIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2ZmMGE1NCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI2ZmNDc3ZSIvPjwvbGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IGlkPSJnMiIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZjcwOTYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZjBhNTQiLz48L2xpbmVhckdyYWRpZW50PjxmaWx0ZXIgaWQ9InNoIj48ZmVEcm9wU2hhZG93IGR4PSIwIiBkeT0iOCIgc3RkRGV2aWF0aW9uPSI2IiBmbG9vZC1jb2xvcj0iIzU1MDAxMSIgZmxvb2Qtb3BhY2l0eT0iMC40Ii8+PC9maWx0ZXI+PHN0eWxlPi5oMXthbmltYXRpb246c3dheSAzLjVzIGVhc2UtaW4tb3V0IGluZmluaXRlIGFsdGVybmF0ZTt0cmFuc2Zvcm0tb3JpZ2luOjBweCA4NXB4O30uaDJ7YW5pbWF0aW9uOnN3YXkyIDRzIGVhc2UtaW4tb3V0IGluZmluaXRlIGFsdGVybmF0ZTt0cmFuc2Zvcm0tb3JpZ2luOjBweCA4NXB4O31Aa2V5ZnJhbWVzIHN3YXl7MCV7dHJhbnNmb3JtOnJvdGF0ZSgtNmRlZyk7fTEwMCV7dHJhbnNmb3JtOnJvdGF0ZSg4ZGVnKTt9fUBrZXlmcmFtZXMgc3dheTJ7MCV7dHJhbnNmb3JtOnJvdGF0ZSg3ZGVnKTt9MTAwJXt0cmFuc2Zvcm06cm90YXRlKC01ZGVnKTt9fTwvc3R5bGU+PC9kZWZzPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE4MCwgNDgwKSBzY2FsZSgzKSI+PHBhdGggY2xhc3M9ImgxIiBkPSJNMCAyMCBDLTIwLTE1LTUwLTUtNTAgMjUgQy01MCA1NSAwIDg1IDAgODUgQzAgODUgNTAgNTUgNTAgMjUgQzUwLTUgMjAtMTUgMCAyMCBaIiBmaWxsPSJ1cmwoI2cxKSIgZmlsdGVyPSJ1cmwoI3NoKSIvPjxwYXRoIGNsYXNzPSJoMSIgZD0iTS0zNSAyMiBBMTggMTggMCAwIDEtMTUgNCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBmaWxsPSJub25lIiBvcGFjaXR5PSIwLjQiLz48L2c+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzgwLCA1ODApIHNjYWxlKDIuMikiPjxwYXRoIGNsYXNzPSJoMiIgZD0iTTAgMjAgQy0yMC0xNS01MC01LTUwIDI1IEMtNTAgNTUgMCA4NSAwIDg1IEMwIDg1IDUwIDU1IDUwIDI1IEM1MC01IDIwLTE1IDAgMjAgWiIgZmlsbD0idXJsKCNnMikiIGZpbHRlcj0idXJsKCNzaCkiLz48cGF0aCBjbGFzcz0iaDIiIGQ9Ik0tMzUgMjIgQTE4IDE4IDAgMCAxLTE1IDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC40Ii8+PC9nPjwvc3ZnPg=="
    },
    11: { 
    	// Ramadan 
        bg: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iNjAiPjxzdHlsZT5Aa2V5ZnJhbWVzIGF7MCUsMTAwJXtvcGFjaXR5Oi4yfTUwJXtvcGFjaXR5OjF9fWNpcmNsZXthbmltYXRpb246YSAycyBpbmZpbml0ZX1jaXJjbGU6bnRoLWNoaWxkKG9kZCl7YW5pbWF0aW9uLWR1cmF0aW9uOjEuNXN9Y2lyY2xlOm50aC1jaGlsZCgzbil7YW5pbWF0aW9uLWR1cmF0aW9uOjIuNXN9PC9zdHlsZT48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJyZ2JhKDAsMCwwLDAuMikiLz48ZyBmaWxsPSIjRkZGIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIuNSIvPjxjaXJjbGUgY3g9IjQwIiBjeT0iMjUiIHI9Ii44Ii8+PGNpcmNsZSBjeD0iODUiIGN5PSIxNSIgcj0iLjUiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI0MCIgcj0iLjYiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjQ1IiByPSIuNyIvPjxjaXJjbGUgY3g9IjcwIiBjeT0iNSIgcj0iLjQiLz48L2c+PC9zdmc+", 
        overlay: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgODAwIj48ZGVmcz48ZmlsdGVyIGlkPSJnbG93Ij48ZmVHdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjUiIHJlc3VsdD0iYmx1ciIvPjxmZU1lcmdlPjxmZU1lcmdlTm9kZSBpbj0iYmx1ciIvPjxmZU1lcmdlTm9kZSBpbj0iU291cmNlR3JhcGhpYyIvPjwvZmVNZXJnZT48L2ZpbHRlcj48c3R5bGU+QGtleWZyYW1lcyBmbG9hdCB7IDAlLCAxMDAlIHsgdHJhbnNmb3JtOiB0cmFuc2xhdGUoNjAsIDApIHNjYWxlKDAuMjUpOyB9IDUwJSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlKDYwcHgsIDEwcHgpIHNjYWxlKDAuMjYpOyB9IH0gQGtleWZyYW1lcyB0ZXh0RmxvYXQgeyAwJSwgMTAwJSB7IHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTsgfSA1MCUgeyB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTE1cHgpOyB9IH0gLm1vb24geyBhbmltYXRpb246IGZsb2F0IDRzIGVhc2UtaW4tb3V0IGluZmluaXRlOyB9IC50ZXh0IHsgYW5pbWF0aW9uOiB0ZXh0RmxvYXQgM3MgZWFzZS1pbi1vdXQgaW5maW5pdGU7IHRyYW5zZm9ybS1vcmlnaW46IGNlbnRlcjsgfTwvc3R5bGU+PC9kZWZzPjxnIGNsYXNzPSJtb29uIiBmaWx0ZXI9InVybCgjZ2xvdykiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDYwLCAwKSBzY2FsZSgwLjI1KSI+PHBhdGggZD0iTTQ4MCAxMDAgQTMwMCAzMDAgMCAxIDAgNDgwIDcwMCBBMzgwIDM4MCAwIDEgMSA0ODAgMTAwIiBmaWxsPSIjRkZGRkZGIi8+PC9nPjx0ZXh0IGNsYXNzPSJ0ZXh0IiB4PSI0MDAiIHk9IjcxMSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIxMTAiIGZpbGw9IiNGRkREMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbHRlcj0idXJsKCNnbG93KSI+JiN4NjMxOyYjeDY0NTsmI3g2MzY7JiN4NjI3OyYjeDY0NjsgJiN4NjQzOyYjeDYzMTsmI3g2NEE7JiN4NjQ1OzwvdGV4dD48L3N2Zz4="        
    },
    12: { bg: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPCEtLSBCYWxsb29ucyAoVXBwZXIgUGFydCkgLS0+CiAgPGcgZmlsbC1vcGFjaXR5PSIwLjI1Ij4KICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwLCAxMCkiPgogICAgICA8Y2lyY2xlIGN4PSI1IiBjeT0iMTAiIHI9IjYiIGZpbGw9IiNkNGFmMzciLz4KICAgICAgPHBhdGggZD0iTTUgMTYgTDUgMjAiIHN0cm9rZT0iI2Q0YWYzNyIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KICAgIDwvZz4KICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUwLCA1KSI+CiAgICAgIDxjaXJjbGUgY3g9IjUiIGN5PSIxMCIgcj0iNSIgZmlsbD0iI0ZGNjkyOCIvPgogICAgICA8cGF0aCBkPSJNNSAxNSBMNSAxOSIgc3Ryb2tlPSIjRkY2OTI4IiBzdHJva2Utd2lkdGg9IjAuNSIvPgogICAgPC9nPgogICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODAsIDIpIj4KICAgICAgPGNpcmNsZSBjeD0iNSIgY3k9IjEwIiByPSI2IiBmaWxsPSIjRkZEMDgwIi8+CiAgICAgIDxwYXRoIGQ9Ik01IDE2IEw1IDIwIiBzdHJva2U9IiNGRkQwODAiIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgICA8L2c+CiAgPC9nPgogIDwhLS0gRGV0YWlsZWQgVGVtciAoTG93ZXIgUGFydCkgLS0+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwgNjApIj4KICAgIDxnIGZpbGw9IiM4QjQ1MTMiIGZpbGwtb3BhY2l0eT0iMC4zIj4KICAgICAgPCEtLSBEYXRlIDEgLS0+CiAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIwLCAxNSkgcm90YXRlKDEwKSI+CiAgICAgICAgPGVsbGlwc2UgY3g9IjAiIGN5PSIwIiByeD0iOSIgcnk9IjYiLz4KICAgICAgICA8cGF0aCBkPSJNLTYgLTIgQyAtMyAtNCwgMyAtNCwgNiAtMiBNLTcgMSBDIC0zIDAsIDMgMCwgNyAxIE0tNSAzIEMgLTIgMiwgMiAyLCA1IDMiIHN0cm9rZT0iIzVEMjYwNCIgc3Ryb2tlLXdpZHRoPSIwLjgiIGZpbGw9Im5vbmUiLz4KICAgICAgPC9nPgogICAgICA8IS0tIERhdGUgMiAtLT4KICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzAsIDIwKSByb3RhdGUoLTE1KSI+CiAgICAgICAgPGVsbGlwc2UgY3g9IjAiIGN5PSIwIiByeD0iOCIgcnk9IjUiLz4KICAgICAgICA8cGF0aCBkPSJNLTUgLTIgQyAtMiAtMywgMiAtMywgNSAtMiBNLTYgMSBDIC0yIDAsIDIgMCwgNiAxIiBzdHJva2U9IiM1RDI2MDQiIHN0cm9rZS13aWR0aD0iMC43IiBmaWxsPSJub25lIi8+CiAgICAgIDwvZz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPg==" , overlay: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJnIj48ZmVHdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjMiIHJlc3VsdD0iYiIvPjxmZU1lcmdlPjxmZU1lcmdlTm9kZSBpbj0iYiIvPjxmZU1lcmdlTm9kZSBpbj0iU291cmNlR3JhcGhpYyIvPjwvZmVNZXJnZT48L2ZpbHRlcj48L2RlZnM+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTEwLDApIHNjYWxlKDAuNCkiPjxsaW5lIHgxPSIxMDAiIHkxPSIwIiB4Mj0iMTAwIiB5Mj0iMzUiIHN0cm9rZT0iI2Q0YWYzNyIgc3Ryb2tlLXdpZHRoPSI1IiBzdHJva2UtZGFzaGFycmF5PSI4LDQiLz48Y2lyY2xlIGN4PSIxMDAiIGN5PSI0MCIgcj0iNiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZDRhZjM3IiBzdHJva2Utd2lkdGg9IjQiLz48cGF0aCBkPSJNOTUgNDcgTDEwNSA0NyBMMTE1IDY1IEw4NSA2NSBaIiBmaWxsPSIjZDRhZjM3Ii8+PHBvbHlnb24gcG9pbnRzPSI4NSw2NSAxMTUsNjUgMTI1LDEyMCA3NSwxMjAiIGZpbGw9InJnYmEoMjEyLDE3NSw1NSwwLjEpIiBzdHJva2U9IiNkNGFmMzciIHN0cm9rZS13aWR0aD0iNSIvPjxwYXRoIGQ9Ik0xMDAgMTEwIFE5MiA5NSAxMDAgODUgUTEwOCA5NSAxMDAgMTEwIiBmaWxsPSIjRkZENzAwIiBmaWx0ZXI9InVybCgjZykiLz48bGluZSB4MT0iMTAwIiB5MT0iMTEwIiB4Mj0iMTAwIiB5Mj0iMTIwIiBzdHJva2U9IiNkNGFmMzciIHN0cm9rZS13aWR0aD0iNCIvPjxwYXRoIGQ9Ik03NSwxMjAgTDEyNSwxMjAgTDExNSwxMzUgTDg1LDEzNSBaIiBmaWxsPSIjZDRhZjM3Ii8+PHBhdGggZD0iTTg1LDEzNSBMMTE1LDEzNSBMMTEwLDE0NSBMOTAsMTQ1IFoiIGZpbGw9IiNkNGFmMzciLz48L2c+PHRleHQgeD0iMTAwIiB5PSIxODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNkNGFmMzciIGZpbHRlcj0idXJsKCNnKSI+JiN4NjM5OyYjeDY0QTsmI3g2MkY7ICYjeDYzMzsmI3g2Mzk7JiN4NjRBOyYjeDYyRjs8L3RleHQ+PC9zdmc+" }, // عيد الفطر
    13: { bg: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPCEtLSBCYWxsb29ucyAoVXBwZXIgUGFydCkgLS0+CiAgPGcgZmlsbC1vcGFjaXR5PSIwLjI1Ij4KICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwLCAxMCkiPgogICAgICA8Y2lyY2xlIGN4PSI1IiBjeT0iMTAiIHI9IjYiIGZpbGw9IiNkNGFmMzciLz4KICAgICAgPHBhdGggZD0iTTUgMTYgTDUgMjAiIHN0cm9rZT0iI2Q0YWYzNyIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KICAgIDwvZz4KICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUwLCA1KSI+CiAgICAgIDxjaXJjbGUgY3g9IjUiIGN5PSIxMCIgcj0iNSIgZmlsbD0iI0ZGNjkyOCIvPgogICAgICA8cGF0aCBkPSJNNSAxNSBMNSAxOSIgc3Ryb2tlPSIjRkY2OTI4IiBzdHJva2Utd2lkdGg9IjAuNSIvPgogICAgPC9nPgogICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODAsIDIpIj4KICAgICAgPGNpcmNsZSBjeD0iNSIgY3k9IjEwIiByPSI2IiBmaWxsPSIjRkZEMDgwIi8+CiAgICAgIDxwYXRoIGQ9Ik01IDE2IEw1IDIwIiBzdHJva2U9IiNGRkQwODAiIHN0cm9rZS13aWR0aD0iMC41Ii8+CiAgICA8L2c+CiAgPC9nPgogIDwhLS0gRGV0YWlsZWQgVGVtciAoTG93ZXIgUGFydCkgLS0+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwgNjApIj4KICAgIDxnIGZpbGw9IiM4QjQ1MTMiIGZpbGwtb3BhY2l0eT0iMC4zIj4KICAgICAgPCEtLSBEYXRlIDEgLS0+CiAgICAgIDxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIwLCAxNSkgcm90YXRlKDEwKSI+CiAgICAgICAgPGVsbGlwc2UgY3g9IjAiIGN5PSIwIiByeD0iOSIgcnk9IjYiLz4KICAgICAgICA8cGF0aCBkPSJNLTYgLTIgQyAtMyAtNCwgMyAtNCwgNiAtMiBNLTcgMSBDIC0zIDAsIDMgMCwgNyAxIE0tNSAzIEMgLTIgMiwgMiAyLCA1IDMiIHN0cm9rZT0iIzVEMjYwNCIgc3Ryb2tlLXdpZHRoPSIwLjgiIGZpbGw9Im5vbmUiLz4KICAgICAgPC9nPgogICAgICA8IS0tIERhdGUgMiAtLT4KICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzAsIDIwKSByb3RhdGUoLTE1KSI+CiAgICAgICAgPGVsbGlwc2UgY3g9IjAiIGN5PSIwIiByeD0iOCIgcnk9IjUiLz4KICAgICAgICA8cGF0aCBkPSJNLTUgLTIgQyAtMiAtMywgMiAtMywgNSAtMiBNLTYgMSBDIC0yIDAsIDIgMCwgNiAxIiBzdHJva2U9IiM1RDI2MDQiIHN0cm9rZS13aWR0aD0iMC43IiBmaWxsPSJub25lIi8+CiAgICAgIDwvZz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPg==" , overlay: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJnIj48ZmVHdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjMiIHJlc3VsdD0iYiIvPjxmZU1lcmdlPjxmZU1lcmdlTm9kZSBpbj0iYiIvPjxmZU1lcmdlTm9kZSBpbj0iU291cmNlR3JhcGhpYyIvPjwvZmVNZXJnZT48L2ZpbHRlcj48L2RlZnM+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTAsMTAwKSI+PHJlY3QgeD0iMzIiIHk9IjMyIiB3aWR0aD0iNCIgaGVpZ2h0PSIxNSIgcng9IjIiIGZpbGw9IiNkNGFmMzciLz48cmVjdCB4PSI0MCIgeT0iMzQiIHdpZHRoPSI0IiBoZWlnaHQ9IjE1IiByeD0iMiIgZmlsbD0iI2Q0YWYzNyIvPjxyZWN0IHg9IjU1IiB5PSIzMiIgd2lkdGg9IjQiIGhlaWdodD0iMTUiIHJ4PSIyIiBmaWxsPSIjZDRhZjM3Ii8+PHJlY3QgeD0iNjMiIHk9IjM0IiB3aWR0aD0iNCIgaGVpZ2h0PSIxNSIgcng9IjIiIGZpbGw9IiNkNGFmMzciLz48cGF0aCBkPSJNNzIgMjAgQTQgNCAwIDAgMSA3OCAyNSBBNCA0IDAgMCAxIDcyIDI4IFoiIGZpbGw9IiNmZmYiIHN0cm9rZT0iI2Q0YWYzNyIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTI1IDI1IEExMCAxMCAwIDAgMSAzNSAxNSBBMTIgMTIgMCAwIDEgNTUgMTAgQTEyIDEyIDAgMCAxIDcwIDE1IEExMCAxMCAwIDAgMSA3NSAyNSBBMTAgMTAgMCAwIDEgNzAgMzUgQTEyIDEyIDAgMCAxIDU1IDQwIEExMiAxMiAwIDAgMSAzNSAzNSBBMTAgMTAgMCAwIDEgMjUgMjUgWiIgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjZDRhZjM3IiBzdHJva2Utd2lkdGg9IjIiLz48ZWxsaXBzZSBjeD0iMTIiIGN5PSIyMCIgcng9IjQiIHJ5PSIyIiBmaWxsPSIjZDRhZjM3IiB0cmFuc2Zvcm09InJvdGF0ZSgtMjAgMTIgMjApIi8+PGVsbGlwc2UgY3g9IjI4IiBjeT0iMjAiIHJ4PSI0IiByeT0iMiIgZmlsbD0iI2Q0YWYzNyIgdHJhbnNmb3JtPSJyb3RhdGUoMjAgMjggMjApIi8+PGVsbGlwc2UgY3g9IjIwIiBjeT0iMjMiIHJ4PSI3IiByeT0iOSIgZmlsbD0iI2Q0YWYzNyIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMjEiIHI9IjEuNSIgZmlsbD0iI2ZmZiIvPjxjaXJjbGUgY3g9IjIzIiBjeT0iMjEiIHI9IjEuNSIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0xNCAxNSBBNCA0IDAgMCAxIDIwIDEyIEE0IDQgMCAwIDEgMjYgMTUgQTQgNCAwIDAgMSAyMCAxOCBBNCA0IDAgMCAxIDE0IDE1IFoiIGZpbGw9IiNmZmYiIHN0cm9rZT0iI2Q0YWYzNyIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48L2c+PHRleHQgeD0iMTAwIiB5PSIxODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNkNGFmMzciIGZpbHRlcj0idXJsKCNnKSI+JiN4NjM5OyYjeDY0QTsmI3g2MkY7ICYjeDYzMzsmI3g2Mzk7JiN4NjRBOyYjeDYyRjs8L3RleHQ+PC9zdmc+" }, // عيد الأضحى
    14: { bg: "",overlay: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ29sZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRkQ3MDAiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjRDQyNzM3Ii8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPGZpbHRlciBpZD0ic2hhZG93Ij48ZmVHdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjEiLz48L2ZpbHRlcj4KICA8L2RlZnM+CiAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTMwLCAyMCkgc2NhbGUoMC42KSI+CiAgICA8cGF0aCBkPSJNOTAgMTAgQSA0MCA0MCAwIDEgMSAzMCA3MCBBIDM1IDM1IDAgMSAwIDkwIDEwIFoiIGZpbGw9InVybCgjZ29sZCkiIGZpbHRlcj0idXJsKCNzaGFkb3cpIi8+CiAgICA8cmVjdCB4PSI0MCIgeT0iNTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIzMCIgZmlsbD0idXJsKCNnb2xkKSIvPgogICAgPHBhdGggZD0iTTM1IDUwIEw0NSA0MCBMNTUgNTAgWiIgZmlsbD0idXJsKCNnb2xkKSIvPgogICAgPGNpcmNsZSBjeD0iNDUiIGN5PSIzNSIgcj0iMiIgZmlsbD0iI2Q0YWYzNyIvPgogIDwvZz4KICA8dGV4dCB4PSIxMDAiIHk9IjE4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI2Q0YWYzNyI+2LPZhtipINmH2KzYsdmK2Kkg2YXYqNin2LHZg9ipPC90ZXh0Pgo8L3N2Zz4=" }, // رأس السنة الهجرية
    15: { bg: "", overlay: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJnIj48ZmVHdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjMiIHJlc3VsdD0iYiIvPjxmZU1lcmdlPjxmZU1lcmdlTm9kZSBpbj0iYiIvPjxmZU1lcmdlTm9kZSBpbj0iU291cmNlR3JhcGhpYyIvPjwvZmVNZXJnZT48L2ZpbHRlcj48bGluZWFyR3JhZGllbnQgaWQ9ImdyIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzJlY2M3MSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzBiM2QxYSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUwLDMwKSI+PHJlY3QgeD0iOCIgeT0iNzAiIHdpZHRoPSI4NCIgaGVpZ2h0PSI0MCIgZmlsbD0idXJsKCNncikiIHN0cm9rZT0iI2Q0YWYzNyIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cGF0aCBkPSJNMjUgNzAgQzI1IDMwLDQwIDEwLDUwIDEwIEM2MCAxMCw3NSAzMCw3NSA3MCBaIiBmaWxsPSJ1cmwoI2dyKSIgc3Ryb2tlPSIjZDRhZjM3IiBzdHJva2Utd2lkdGg9IjEuNSIvPjxyZWN0IHg9IjIwIiB5PSI2OCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjQiIGZpbGw9IiNkNGFmMzciLz48cGF0aCBkPSJNNDAgMTEwIEw0MCA5MCBBMTAgMTAgMCAwIDEgNjAgOTAgTDYwIDExMCBaIiBmaWxsPSIjMDUyMTBlIiBzdHJva2U9IiNkNGFmMzciIHN0cm9rZS13aWR0aD0iMSIvPjxyZWN0IHg9IjAiIHk9IjQwIiB3aWR0aD0iOCIgaGVpZ2h0PSI3MCIgZmlsbD0iIzE0NWEzMiIgc3Ryb2tlPSIjZDRhZjM3IiBzdHJva2Utd2lkdGg9IjEiLz48cG9seWdvbiBwb2ludHM9Ii0yLDQwIDEwLDQwIDQsMjAiIGZpbGw9InVybCgjZ3IpIiBzdHJva2U9IiNkNGFmMzciIHN0cm9rZS13aWR0aD0iMSIvPjxyZWN0IHg9IjkyIiB5PSI0MCIgd2lkdGg9IjgiIGhlaWdodD0iNzAiIGZpbGw9IiMxNDVhMzIiIHN0cm9rZT0iI2Q0YWYzNyIgc3Ryb2tlLXdpZHRoPSIxIi8+PHBvbHlnb24gcG9pbnRzPSI5MCw0MCAxMDIsNDAgOTYsMjAiIGZpbGw9InVybCgjZ3IpIiBzdHJva2U9IiNkNGFmMzciIHN0cm9rZS13aWR0aD0iMSIvPjxsaW5lIHgxPSI1MCIgeTE9IjEwIiB4Mj0iNTAiIHkyPSIwIiBzdHJva2U9IiNkNGFmMzciIHN0cm9rZS13aWR0aD0iMS41Ii8+PGNpcmNsZSBjeD0iNTAiIGN5PSIwIiByPSIxLjUiIGZpbGw9IiNkNGFmMzciLz48cGF0aCBkPSJNNTAgLTIgQTQgNCAwIDEgMSA0NyAtNiBBNSA1IDAgMCAwIDUwIC0yIFoiIGZpbGw9IiNkNGFmMzciLz48L2c+PHBhdGggZD0iTTMwIDQwIEwzMiA0NSBMMzcgNDUgTDMzIDQ4IEwzNSA1MyBMMzAgNTAgTDI1IDUzIEwyNyA0OCBMMjMgNDUgTDI4IDQ1IFoiIGZpbGw9IiNkNGFmMzciIGZpbHRlcj0idXJsKCNnKSIvPjxwYXRoIGQ9Ik0xNzAgNjAgTDE3MiA2NSBMMTc3IDY1IEwxNzMgNjggTDE3NSA3MyBMMTcwIDcwIEwxNjUgNzMgTDE2NyA2OCBMMTYzIDY1IEwxNjggNjUgWiIgZmlsbD0iI2Q0YWYzNyIgZmlsdGVyPSJ1cmwoI2cpIi8+PHRleHQgeD0iMTAwIiB5PSIxODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNkNGFmMzciIGZpbHRlcj0idXJsKCNnKSI+JiN4NjI3OyYjeDY0NDsmI3g2NDU7JiN4NjQ4OyYjeDY0NDsmI3g2MkY7ICYjeDYyNzsmI3g2NDQ7JiN4NjQ2OyYjeDYyODsmI3g2NDg7JiN4NjRBOzwvdGV4dD48L3N2Zz4=" }, // المولد النبوي الشريف
    16: { bg: "", overlay: newYear }, // رأس السنة الميلادية
    17: { bg: "", overlay: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9ImciPgogICAgICA8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIyIiByZXN1bHQ9ImIiLz4KICAgICAgPGZlTWVyZ2U+CiAgICAgICAgPGZlTWVyZ2VOb2RlIGluPSJiIi8+CiAgICAgICAgPGZlTWVyZ2VOb2RlIGluPSJTb3VyY2VHcmFwaGljIi8+CiAgICAgIDwvZmVNZXJnZT4KICAgIDwvZmlsdGVyPgogICAgCiAgICA8ZyBpZD0iZiI+CiAgICAgIDxwYXRoIGQ9Ik0wLDAgUTgsLTEyIDAsLTE1IFEtOCwtMTIgMCwwIiBmaWxsPSIjOWI1OWI2Ii8+CiAgICAgIDxwYXRoIGQ9Ik0wLDAgUTgsLTEyIDAsLTE1IFEtOCwtMTIgMCwwIiBmaWxsPSIjOWI1OWI2IiB0cmFuc2Zvcm09InJvdGF0ZSg3MikiLz4KICAgICAgPHBhdGggZD0iTTAsMCBROCwtMTIgMCwtMTUgUS04LC0xMiAwLDAiIGZpbGw9IiM5YjU5YjYiIHRyYW5zZm9ybT0icm90YXRlKDE0NCkiLz4KICAgICAgPHBhdGggZD0iTTAsMCBROCwtMTIgMCwtMTUgUS04LC0xMiAwLDAiIGZpbGw9IiM5YjU5YjYiIHRyYW5zZm9ybT0icm90YXRlKDIxNikiLz4KICAgICAgPHBhdGggZD0iTTAsMCBROCwtMTIgMCwtMTUgUS04LC0xMiAwLDAiIGZpbGw9IiM5YjU5YjYiIHRyYW5zZm9ybT0icm90YXRlKDI4OCkiLz4KICAgICAgPGNpcmNsZSBjeD0iMCIgY3k9IjAiIHI9IjQiIGZpbGw9IiNkNGFmMzciLz4KICAgIDwvZz4KICAgIAogICAgPGcgaWQ9InMiPgogICAgICA8cGF0aCBkPSJNMCwwIFE2LC05IDAsLTExIFEtNiwtOSAwLDAiIGZpbGw9IiNmZjlmZjMiLz4KICAgICAgPHBhdGggZD0iTTAsMCBRNiwtOSAwLC0xMSBRLTYsLTkgMCwwIiBmaWxsPSIjZmY5ZmYzIiB0cmFuc2Zvcm09InJvdGF0ZSg3MikiLz4KICAgICAgPHBhdGggZD0iTTAsMCBRNiwtOSAwLC0xMSBRLTYsLTkgMCwwIiBmaWxsPSIjZmY5ZmYzIiB0cmFuc2Zvcm09InJvdGF0ZSgxNDQpIi8+CiAgICAgIDxwYXRoIGQ9Ik0wLDAgUTYsLTkgMCwtMTEgUS02LC05IDAsMCIgZmlsbD0iI2ZmOWZmMyIgdHJhbnNmb3JtPSJyb3RhdGUoMjE2KSIvPgogICAgICA8cGF0aCBkPSJNMCwwIFE2LC05IDAsLTExIFEtNiwtOSAwLDAiIGZpbGw9IiNmZjlmZjMiIHRyYW5zZm9ybT0icm90YXRlKDI4OCkiLz4KICAgICAgPGNpcmNsZSBjeD0iMCIgY3k9IjAiIHI9IjMiIGZpbGw9IiNkNGFmMzciLz4KICAgIDwvZz4KICAgIAogICAgPHBhdGggaWQ9InQiIGQ9Ik0wLC00IFExLC0xIDQsMCBRMSwxIDAsNCBRLTEsMSAtNCwwIFEtMSwtMSAwLC00IiBmaWxsPSIjZDRhZjM3Ii8+CiAgPC9kZWZzPgogIAogIDwhLS0g2KfZhNiz2KfZgiDYp9mE2YrYs9ix2YkgLS0+CiAgPHBhdGggZD0iTTAgMzAgUTQwIDMwIDE1IDU1IFQxMCAxMTAgVDAgMTQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNkNGFmMzciIHN0cm9rZS13aWR0aD0iMS41Ii8+CiAgPGVsbGlwc2UgY3g9IjI1IiBjeT0iMzgiIHJ4PSI0IiByeT0iMiIgZmlsbD0iI2Q0YWYzNyIgdHJhbnNmb3JtPSJyb3RhdGUoLTMwIDI1IDM4KSIvPgogIDxlbGxpcHNlIGN4PSIxMiIgY3k9Ijc1IiByeD0iNCIgcnk9IjIiIGZpbGw9IiNkNGFmMzciIHRyYW5zZm9ybT0icm90YXRlKDQ1IDEyIDc1KSIvPgogIDxlbGxpcHNlIGN4PSIyMCIgY3k9Ijk1IiByeD0iNCIgcnk9IjIiIGZpbGw9IiNkNGFmMzciIHRyYW5zZm9ybT0icm90YXRlKC0xMCAyMCA5NSkiLz4KICAKICA8IS0tINin2YTYstmH2YjYsSDYp9mE2YrYs9ix2YkgLS0+CiAgPHVzZSBocmVmPSIjcyIgeD0iMjUiIHk9IjIwIi8+CiAgPHVzZSBocmVmPSIjZiIgeD0iMTUiIHk9IjU1Ii8+CiAgPHVzZSBocmVmPSIjcyIgeD0iMTAiIHk9IjExMCIvPgogIDx1c2UgaHJlZj0iI3QiIHg9IjMwIiB5PSI4MCIvPgogIDx1c2UgaHJlZj0iI3QiIHg9IjgiIHk9IjEzMCIvPgogIAogIDwhLS0g2KfZhNiz2KfZgiDYp9mE2YrZhdmG2YkgLS0+CiAgPHBhdGggZD0iTTIwMCAzMCBRMTYwIDMwIDE4NSA1NSBUMTkwIDExMCBUMjAwIDE0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZDRhZjM3IiBzdHJva2Utd2lkdGg9IjEuNSIvPgogIDxlbGxpcHNlIGN4PSIxNzUiIGN5PSIzOCIgcng9IjQiIHJ5PSIyIiBmaWxsPSIjZDRhZjM3IiB0cmFuc2Zvcm09InJvdGF0ZSgzMCAxNzUgMzgpIi8+CiAgPGVsbGlwc2UgY3g9IjE4OCIgY3k9Ijc1IiByeD0iNCIgcnk9IjIiIGZpbGw9IiNkNGFmMzciIHRyYW5zZm9ybT0icm90YXRlKC00NSAxODggNzUpIi8+CiAgPGVsbGlwc2UgY3g9IjE4MCIgY3k9Ijk1IiByeD0iNCIgcnk9IjIiIGZpbGw9IiNkNGFmMzciIHRyYW5zZm9ybT0icm90YXRlKDEwIDE4MCA5NSkiLz4KICAKICA8IS0tINin2YTYstmH2YjYsSDYp9mE2YrZhdmG2YkgLS0+CiAgPHVzZSBocmVmPSIjcyIgeD0iMTc1IiB5PSIyMCIvPgogIDx1c2UgaHJlZj0iI2YiIHg9IjE4NSIgeT0iNTUiLz4KICA8dXNlIGhyZWY9IiNzIiB4PSIxOTAiIHk9IjExMCIvPgogIDx1c2UgaHJlZj0iI3QiIHg9IjE3MCIgeT0iODAiLz4KICA8dXNlIGhyZWY9IiN0IiB4PSIxOTIiIHk9IjEzMCIvPgogIAogIDwhLS0g2KfZhNmG2LUgLS0+CiAgPHRleHQgeD0iMTAwIiB5PSIxODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNkNGFmMzciIGZpbHRlcj0idXJsKCNnKSI+CiAgICDYstmH2YjYsSDYp9mE2LHYqNmK2LkKICA8L3RleHQ+Cjwvc3ZnPg==" }, // يوم المرأة العالمي
    18: { bg: "", overlay: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9ImciPgogICAgICA8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIwLjUiIHJlc3VsdD0iYiIvPgogICAgICA8ZmVNZXJnZT4KICAgICAgICA8ZmVNZXJnZU5vZGUgaW49ImIiLz4KICAgICAgICA8ZmVNZXJnZU5vZGUgaW49IlNvdXJjZUdyYXBoaWMiLz4KICAgICAgPC9mZU1lcmdlPgogICAgPC9maWx0ZXI+CiAgICA8cGF0aCBpZD0iaCIgZD0iTTAsLTQgQzIsNCA4LDQgMTAsMCBDOCwtNCAyLC00IDAsLTQgWiIvPgogIDwvZGVmcz4KICA8cGF0aCBkPSJNMjAsMjAgUTQwLDYwIDEwLDE0MCBRMCwxNzAgMjAsMjAwIiBmaWxsPSJub25lIiBzdHJva2U9IiNkNGFmMzciIHN0cm9rZS13aWR0aD0iMS41IiBvcGFjaXR5PSIwLjYiLz4KICA8cGF0aCBkPSJNMTgwLDIwIFExNjAsNjAgMTkwLDE0MCBRMjAwLDE3MCAxODAsMjAwIiBmaWxsPSJub25lIiBzdHJva2U9IiNkNGFmMzciIHN0cm9rZS13aWR0aD0iMS41IiBvcGFjaXR5PSIwLjYiLz4KICA8dXNlIGhyZWY9IiNoIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyNSw0NSkgcm90YXRlKDE1KSBzY2FsZSgxLjIpIiBmaWxsPSIjZmY0ZDZkIi8+CiAgPHVzZSBocmVmPSIjaCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzUsODUpIHJvdGF0ZSgtMjApIHNjYWxlKDEuNikiIGZpbGw9IiNkNGFmMzciLz4KICA8dXNlIGhyZWY9IiNoIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMiwxMjUpIHJvdGF0ZSgzNSkgc2NhbGUoMSkiIGZpbGw9IiNmZjRkNmQiLz4KICA8dXNlIGhyZWY9IiNoIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNzUsNDUpIHJvdGF0ZSgtMTUpIHNjYWxlKDEuMikiIGZpbGw9IiNmZjRkNmQiLz4KICA8dXNlIGhyZWY9IiNoIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxNjUsODUpIHJvdGF0ZSgyMCkgc2NhbGUoMS42KSIgZmlsbD0iI2Q0YWYzNyIvPgogIDx1c2UgaHJlZj0iI2giIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE3OCwxMjUpIHJvdGF0ZSgtMzUpIHNjYWxlKDEpIiBmaWxsPSIjZmY0ZDZkIi8+CiAgPGNpcmNsZSBjeD0iNDUiIGN5PSI3MCIgcj0iMS41IiBmaWxsPSIjZmY0ZDZkIiBmaWx0ZXI9InVybCgjZykiLz4KICA8Y2lyY2xlIGN4PSIxNTUiIGN5PSIxMTAiIHI9IjIiIGZpbGw9IiNkNGFmMzciIGZpbHRlcj0idXJsKCNnKSIvPgogIDxjaXJjbGUgY3g9IjM1IiBjeT0iMTUwIiByPSIxLjUiIGZpbGw9IiNkNGFmMzciIGZpbHRlcj0idXJsKCNnKSIvPgogIDxjaXJjbGUgY3g9IjE2NSIgY3k9IjUwIiByPSIxLjUiIGZpbGw9IiNmZjRkNmQiIGZpbHRlcj0idXJsKCNnKSIvPgogIDx0ZXh0IHg9IjEwMCIgeT0iMTg4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjZDRhZjM3IiBmaWx0ZXI9InVybCgjZykiPti52YrYryDYp9mE2KPZhTwvdGV4dD4KPC9zdmc+" }, // عيد الأم
    19: { bg: "", overlay: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9ImciPgogICAgICA8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIxLjUiIHJlc3VsdD0iYiIvPgogICAgICA8ZmVNZXJnZT4KICAgICAgICA8ZmVNZXJnZU5vZGUgaW49ImIiLz4KICAgICAgICA8ZmVNZXJnZU5vZGUgaW49IlNvdXJjZUdyYXBoaWMiLz4KICAgICAgPC9mZU1lcmdlPgogICAgPC9maWx0ZXI+CiAgPC9kZWZzPgogIAogIDxnIHN0cm9rZT0iI2Q0YWYzNyIgZmlsbD0ibm9uZSI+CiAgICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjMwIiByPSIxMiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI0LDMiLz4KICAgIDxjaXJjbGUgY3g9IjIwIiBjeT0iMzAiIHI9IjciIHN0cm9rZS13aWR0aD0iMS41Ii8+CiAgICAKICAgIDxjaXJjbGUgY3g9IjE4MCIgY3k9IjE0MCIgcj0iMTYiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWRhc2hhcnJheT0iNSw0Ii8+CiAgICA8Y2lyY2xlIGN4PSIxODAiIGN5PSIxNDAiIHI9IjkiIHN0cm9rZS13aWR0aD0iMS41Ii8+CiAgICAKICAgIDxjaXJjbGUgY3g9IjE2MCIgY3k9IjE2MCIgcj0iOCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1kYXNoYXJyYXk9IjMsMyIvPgogICAgPGNpcmNsZSBjeD0iMTYwIiBjeT0iMTYwIiByPSI0IiBzdHJva2Utd2lkdGg9IjEiLz4KICA8L2c+CiAgCiAgPHBhdGggZD0iTTAsMTk1IEwyMDAsMTk1IiBzdHJva2U9IiNkNGFmMzciIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWRhc2hhcnJheT0iMTAsNSIgb3BhY2l0eT0iMC42Ii8+CiAgCiAgPGcgZmlsdGVyPSJ1cmwoI2cpIj4KICAgIDxwYXRoIGQ9Ik04NSAxNTAgQzg1IDEzMCAxMTUgMTMwIDExNSAxNTAgTDEyMiAxNTAgQzEyMiAxNTQgNzggMTU0IDc4IDE1MCBaIiBmaWxsPSIjZDRhZjM3Ii8+CiAgICA8cmVjdCB4PSI5OCIgeT0iMTM2IiB3aWR0aD0iNCIgaGVpZ2h0PSIxNCIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iMC41Ii8+CiAgICA8dGV4dCB4PSIxMDAiIHk9IjE4NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI2Q0YWYzNyI+2LnZitivINin2YTYudmF2KfZhDwvdGV4dD4KICA8L2c+Cjwvc3ZnPg==" }, // عيد العمال
    20: { bg: "", overlay: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxmaWx0ZXIgaWQ9ImciPgo8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIzIiByZXN1bHQ9ImIiLz4KPGZlTWVyZ2U+CjxmZU1lcmdlTm9kZSBpbj0iYiIvPgo8ZmVNZXJnZU5vZGUgaW49IlNvdXJjZUdyYXBoaWMiLz4KPC9mZU1lcmdlPgo8L2ZpbHRlcj4KPC9kZWZzPgo8ZyBmaWxsPSJub25lIiBzdHJva2U9IiNmOTAiIHN0cm9rZS13aWR0aD0iMSI+CjxwYXRoIGQ9Ik0wIDBMNTAgME0wIDBMNDAgMjBNMCAwTDIwIDQwTTAgMEwwIDUwTTQwIDBRMzUgMTUgMCA0ME0yMCAwUTE4IDggMCAyMCIvPgo8L2c+CjxnIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y5MCIgc3Ryb2tlLXdpZHRoPSIxIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyMDAsMCkgc2NhbGUoLTEsMSkiPgo8cGF0aCBkPSJNMCAwTDUwIDBNMCAwTDQwIDIwTTAgMEwyMCA0ME0wIDBMMCA1ME00MCAwUTM1IDE1IDAgNDBNMjAgMFExOCA4IDAgMjAiLz4KPC9nPgo8cGF0aCBkPSJNOTAgMTUwUTEwMCAxMzUgMTEwIDE1MFExMTUgMTcwIDEwMCAxNzBRODUgMTcwIDkwIDE1MCBaTTk1IDE0NSBMMTAwIDEzNSBMMTA1IDE0NSBaIiBmaWxsPSIjZjkwIiBmaWx0ZXI9InVybCgjZykiLz4KPHRleHQgeD0iMTAwIiB5PSIxODgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNmOTAiIGZpbHRlcj0idXJsKCNnKSI+2YfYp9mE2YjZitmK2YYg2LPYudmK2K88L3RleHQ+Cjwvc3ZnPg==" }, // الهالوين
    21: { bg: "", overlay: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJnIj48ZmVHdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjMiIHJlc3VsdD0iYiIvPjxmZU1lcmdlPjxmZU1lcmdlTm9kZSBpbj0iYiIvPjxmZU1lcmdlTm9kZSBpbj0iU291cmNlR3JhcGhpYyIvPjwvZmVNZXJnZT48L2ZpbHRlcj48L2RlZnM+PHBhdGggZD0iTTIwIDBWMzBNMTgwIDBWNDAiIHN0cm9rZT0iI2Q0YWYzNyIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjQwIiByPSIxMCIgZmlsbD0iI2U2Mzk0NiIgZmlsdGVyPSJ1cmwoI2cpIi8+PHJlY3QgeD0iMTciIHk9IjI4IiB3aWR0aD0iNiIgaGVpZ2h0PSI0IiBmaWxsPSIjZDRhZjM3Ii8+PGNpcmNsZSBjeD0iMTgwIiBjeT0iNTAiIHI9IjEwIiBmaWxsPSIjZDRhZjM3IiBmaWx0ZXI9InVybCgjZykiLz48cmVjdCB4PSIxNzciIHk9IjM4IiB3aWR0aD0iNiIgaGVpZ2h0PSI0IiBmaWxsPSIjZTYzOTQ2Ii8+PHBhdGggZD0iTTQwIDcwVjgwTTM1IDc1SDQ1TTM2IDcxTDQ0IDc5TTM2IDc5TDQ0IDcxTTE2MCA4MFY5ME0xNTUgODVIMTY1TTE1NiA4MUwxNjQgODlNMTU2IDg5TDE2NCA4MSIgc3Ryb2tlPSIjZmZmIiBmaWx0ZXI9InVybCgjZykiLz48dGV4dCB4PSIxMDAiIHk9IjE4OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjIyIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI2Q0YWYzNyIgZmlsdGVyPSJ1cmwoI2cpIj4mI3g2Mzk7JiN4NjRBOyYjeDYyRjsgJiN4NjQ1OyYjeDY0QTsmI3g2NDQ7JiN4NjI3OyYjeDYyRjsgJiN4NjQ1OyYjeDYyQzsmI3g2NEE7JiN4NjJGOzwvdGV4dD48L3N2Zz4=" }, // عيد الميلاد
    22: { bg: "", overlay: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9ImciPgogICAgICA8ZmVHdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjMiIHJlc3VsdD0iYiIvPgogICAgICA8ZmVNZXJnZT4KICAgICAgICA8ZmVNZXJnZU5vZGUgaW49ImIiLz4KICAgICAgICA8ZmVNZXJnZU5vZGUgaW49IlNvdXJjZUdyYXBoaWMiLz4KICAgICAgPC9mZU1lcmdlPgogICAgPC9maWx0ZXI+CiAgPC9kZWZzPgogIDxnIGZpbGw9IiMwMGZmNDEiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWx0ZXI9InVybCgjZykiPgogICAgPHRleHQgeD0iMTUiIHk9IjQwIiBmb250LXNpemU9IjIyIj4mbHQ7LyZndDsKICAgIDwvdGV4dD4KICAgIDx0ZXh0IHg9IjE4MCIgeT0iNDAiIGZvbnQtc2l6ZT0iMjIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPnsgfQogICAgPC90ZXh0PgogICAgPHRleHQgeD0iMzAiIHk9IjE0MCIgZm9udC1zaXplPSIxMiIgb3BhY2l0eT0iMC42Ij4wMQogICAgPC90ZXh0PgogICAgPHRleHQgeD0iMTcwIiB5PSIxMzAiIGZvbnQtc2l6ZT0iMTIiIG9wYWNpdHk9IjAuNiI+MTAKICAgIDwvdGV4dD4KICA8L2c+CiAgPHRleHQgeD0iMTAwIiB5PSIxODgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMwMEZGNDEiIGZpbHRlcj0idXJsKCNnKSI+JiN4NjM5OyYjeDY0QTsmI3g2MkY7ICYjeDYyNzsmI3g2NDQ7JiN4NjQ1OyYjeDYyODsmI3g2MzE7JiN4NjQ1OyYjeDYyQzsmI3g2NEE7JiN4NjQ2OwogIDwvdGV4dD4KPC9zdmc+" }, // عيد المرمجين
    23: { bg: "", overlay: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9ImciPgogICAgICA8ZmVHdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjMiIHJlc3VsdD0iYiIvPgogICAgICA8ZmVNZXJnZT4KICAgICAgICA8ZmVNZXJnZU5vZGUgaW49ImIiLz4KICAgICAgICA8ZmVNZXJnZU5vZGUgaW49IlNvdXJjZUdyYXBoaWMiLz4KICAgICAgPC9mZU1lcmdlPgogICAgPC9maWx0ZXI+CiAgICA8ZyBpZD0iZiI+CiAgICAgIDxyZWN0IHdpZHRoPSI0NSIgaGVpZ2h0PSIxMCIgZmlsbD0iIzAwN2EzZCIvPgogICAgICA8cmVjdCB5PSIxMCIgd2lkdGg9IjQ1IiBoZWlnaHQ9IjEwIiBmaWxsPSIjZmZmIi8+CiAgICAgIDxyZWN0IHk9IjIwIiB3aWR0aD0iNDUiIGhlaWdodD0iMTAiIGZpbGw9IiMwMDAiLz4KICAgICAgPGcgZmlsbD0iI2YwMCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwxNSkiPgogICAgICAgIDxwb2x5Z29uIHBvaW50cz0iMTEsLTMgMTIsLTEgMTQsLTEgMTIuNSwwLjUgMTMsMi41IDExLDEgOSwyLjUgOS41LDAuNSA4LC0xIDEwLC0xIi8+CiAgICAgICAgPHBvbHlnb24gcG9pbnRzPSIyMi41LC0zIDIzLjUsLTEgMjUuNSwtMSAyNCwwLjUgMjQuNSwyLjUgMjIuNSwxIDIwLjUsMi41IDIxLDAuNSAxOS41LC0xIDIxLjUsLTEiLz4KICAgICAgICA8cG9seWdvbiBwb2ludHM9IjM0LC0zIDM1LC0xIDM3LC0xIDM1LjUsMC41IDM2LDIuNSAzNCwxIDMyLDIuNSAzMi41LDAuNSAzMSwtMSAzMywtMSIvPgogICAgICA8L2c+CiAgICA8L2c+CiAgPC9kZWZzPgogIDx1c2UgaHJlZj0iI2YiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE1LDIzKSByb3RhdGUoLTE1KSIgZmlsdGVyPSJ1cmwoI2cpIi8+CiAgPHVzZSBocmVmPSIjZiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTQwLDIzKSByb3RhdGUoMTUpIiBmaWx0ZXI9InVybCgjZykiLz4KICA8dGV4dCB4PSIxMDAiIHk9IjE4OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjIyIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzAwN2EzZCIgZmlsdGVyPSJ1cmwoI2cpIj7Yqtit2LHZitixINiz2YjYsdmK2KcKICA8L3RleHQ+Cjwvc3ZnPg==" }, // تحرير سوريا
    24: { bg: "", overlay: mestorys }, // عيد ميلاد ميستوريز
    25: { bg: "", overlay: "data:image/svg+xml;base64,PHN2ZyAgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iIzAwNGI4NyIgc3Ryb2tlPSIjZDRhZjM3Ij48cGF0aCBkPSJNMTAgMjBoMTBsLTIgOGw0IDIybC03IDEwbC03LTEwbDQtMjJ6Ii8+PHBhdGggZD0iTTE4MCAyMGgxMGwtMiA4bDQgMjJsLTcgMTBsLTctMTBsNC0yMnoiLz48cGF0aCBkPSJNMTAgNDVxMTAtMTAgMjAgMHEtMTAgMTAtMjAgMHoiIGZpbGw9IiMzMzMiLz48cGF0aCBkPSJNMTcwIDQ1cTEwLTEwIDIwIDBxLTEwIDEwLTIwIDB6IiBmaWxsPSIjMzMzIi8+PC9nPjx0ZXh0IHg9IjEwMCIgeT0iMTg4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzAwNGI4NyI+JiN4NjM5OyYjeDY0QTsmI3g2MkY7ICYjeDYyNzsmI3g2NDQ7JiN4NjMxOyYjeDYyQzsmI3g2NDQ7PC90ZXh0PiAgPC9zdmc+"}, // عيد الرجل
    26: { bg: "", overlay: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJnIj48ZmVHdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjMiIHJlc3VsdD0iYiIvPjxmZU1lcmdlPjxmZU1lcmdlTm9kZSBpbj0iYiIvPjxmZU1lcmdlTm9kZSBpbj0iU291cmNlR3JhcGhpYyIvPjwvZmVNZXJnZT48L2ZpbHRlcj48ZyBpZD0iYiI+PHBvbHlnb24gcG9pbnRzPSIwLDEwIDIwLDAgMjAsMjAiIGZpbGw9IiMwMDRiODciLz48cG9seWdvbiBwb2ludHM9IjQwLDEwIDIwLDAgMjAsMjAiIGZpbGw9IiMwMDRiODciLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjEwIiByPSI0IiBmaWxsPSIjZDRhZjM3Ii8+PC9nPjwvZGVmcz48dXNlIGhyZWY9IiNiIiB4PSIxNSIgeT0iMTUiIGZpbHRlcj0idXJsKCNnKSIvPjx1c2UgaHJlZj0iI2IiIHg9IjE0NSIgeT0iMTUiIGZpbHRlcj0idXJsKCNnKSIvPjx0ZXh0IHg9IjEwMCIgeT0iMTg4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjMDA0Yjg3IiBmaWx0ZXI9InVybCgjZykiPiYjeDYzOTsmI3g2NEE7JiN4NjJGOyAmI3g2Mjc7JiN4NjQ0OyYjeDYyMzsmI3g2Mjg7PC90ZXh0PiAgPC9zdmc+" }, // عيد الأب
    27: { bg: "", overlay: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJnIj48ZmVHdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjMiIHJlc3VsdD0iYiIvPjxmZU1lcmdlPjxmZU1lcmdlTm9kZSBpbj0iYiIvPjxmZU1lcmdlTm9kZSBpbj0iU291cmNlR3JhcGhpYyIvPjwvZmVNZXJnZT48L2ZpbHRlcj48ZyBpZD0iZCI+PHBhdGggZD0iTTEwIDI1IEMxNSAxMCAzMCAxMCAzNSAyMCBDNDUgNSA1MCAxNSA0NSAyNSBDNDAgMzUgMjAgMzUgMTAgMjUgWiIgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjMDBhOGZmIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0zNSAyMCBRNDUgMjUgNTUgMjAiIHN0cm9rZT0iIzJlY2M3MSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTQwIDIyIFE0NSAxNSA0NSAyMiBRNDIgMjUgNDAgMjIgWiIgZmlsbD0iIzJlY2M3MSIvPjxwYXRoIGQ9Ik00OCAyMSBRNTMgMTQgNTMgMjEgUTUwIDI0IDQ4IDIxIFoiIGZpbGw9IiMyZWNjNzEiLz48L2c+PC9kZWZzPjx1c2UgaHJlZj0iI2QiIHg9IjUiIHk9IjUiIGZpbHRlcj0idXJsKCNnKSIvPjx1c2UgaHJlZj0iI2QiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE5NSwgNSkgc2NhbGUoLTEsIDEpIiBmaWx0ZXI9InVybCgjZykiLz48Y2lyY2xlIGN4PSI0NSIgY3k9IjQ1IiByPSIxLjUiIGZpbGw9IiNkNGFmMzciIGZpbHRlcj0idXJsKCNnKSIvPjxjaXJjbGUgY3g9IjE1NSIgY3k9IjQ1IiByPSIxLjUiIGZpbGw9IiNkNGFmMzciIGZpbHRlcj0idXJsKCNnKSIvPjx0ZXh0IHg9IjEwMCIgeT0iMTg4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjIiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjMDBhOGZmIiBmaWx0ZXI9InVybCgjZykiPiYjeDY0QTsmI3g2NDg7JiN4NjQ1OyAmI3g2Mjc7JiN4NjQ0OyYjeDYzMzsmI3g2NDQ7JiN4NjI3OyYjeDY0NTsgJiN4NjI3OyYjeDY0NDsmI3g2Mzk7JiN4NjI3OyYjeDY0NDsmI3g2NDU7JiN4NjRBOzwvdGV4dD48L3N2Zz4=" }, // اليوم العالمي للسلام
    28: { bg: "", overlay: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJnIj48ZmVHdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjMiIHJlc3VsdD0iYiIvPjxmZU1lcmdlPjxmZU1lcmdlTm9kZSBpbj0iYiIvPjxmZU1lcmdlTm9kZSBpbj0iU291cmNlR3JhcGhpYyIvPjwvZmVNZXJnZT48L2ZpbHRlcj48ZyBpZD0iaCI+PHBhdGggZD0iTTAgMTUgQTEwIDEwIDAgMCAxIDIwIDE1IEExMCAxMCAwIDAgMSA0MCAxNSBRNDAgMzAgMjAgNDAgUTAgMzAgMCAxNSBaIiBmaWxsPSIjZmY0NzU3Ii8+PHBhdGggZD0iTTE3IDE4IFYxMiBIMjMgVjE4IEgyOSBWMjQgSDIzIFYzMCBIMTcgVjI0IEgxMSBWMTggWiIgZmlsbD0iI2ZmZiIvPjwvZz48L2RlZnM+PHVzZSBocmVmPSIjaCIgeD0iMTUiIHk9IjE1IiBmaWx0ZXI9InVybCgjZykiLz48dXNlIGhyZWY9IiNoIiB4PSIxNDUiIHk9IjE1IiBmaWx0ZXI9InVybCgjZykiLz48Y2lyY2xlIGN4PSI0NSIgY3k9IjY1IiByPSIyIiBmaWxsPSIjMmVjYzcxIiBmaWx0ZXI9InVybCgjZykiLz48Y2lyY2xlIGN4PSIxNTUiIGN5PSI3MCIgcj0iMS41IiBmaWxsPSIjMzQ5OGRiIiBmaWx0ZXI9InVybCgjZykiLz48dGV4dCB4PSIxMDAiIHk9IjE4OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjIyIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iIzJlY2M3MSIgZmlsdGVyPSJ1cmwoI2cpIj4mI3g2NEE7JiN4NjQ4OyYjeDY0NTsgJiN4NjI3OyYjeDY0NDsmI3g2MzU7JiN4NjJEOyYjeDYyOTsgJiN4NjI3OyYjeDY0NDsmI3g2Mzk7JiN4NjI3OyYjeDY0NDsmI3g2NDU7JiN4NjRBOzwvdGV4dD48L3N2Zz4=" },  // يوم الصحة العالمي
    29: { bg: "", overlay: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxmaWx0ZXIgaWQ9ImciIHg9Ii0yMCUiIHk9Ii0yMCUiIHdpZHRoPSIxNDAlIiBoZWlnaHQ9IjE0MCUiPgogICAgICA8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIxLjUiIHJlc3VsdD0iYiIvPgogICAgICA8ZmVNZXJnZT4KICAgICAgICA8ZmVNZXJnZU5vZGUgaW49ImIiLz4KICAgICAgICA8ZmVNZXJnZU5vZGUgaW49IlNvdXJjZUdyYXBoaWMiLz4KICAgICAgPC9mZU1lcmdlPgogICAgPC9maWx0ZXI+CgogICAgPGcgaWQ9ImJvb2tfcHJvIj4KICAgICAgPHJlY3QgeD0iMiIgeT0iMyIgd2lkdGg9IjIyIiBoZWlnaHQ9IjI2IiByeD0iMiIgZmlsbD0iIzM0OThlYiIgc3Ryb2tlPSIjMjU2ZWFmIiBzdHJva2Utd2lkdGg9IjAuNSIvPgogICAgICA8cGF0aCBkPSJNNCAzIEw0IDI5IiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMC43IiBzdHJva2Utb3BhY2l0eT0iMC4zIi8+CiAgICAgIDxyZWN0IHg9IjIzIiB5PSI0IiB3aWR0aD0iMiIgaGVpZ2h0PSIyNCIgcng9IjAuNSIgZmlsbD0iI2ZjZmNmYyIgc3Ryb2tlPSIjY2NjIiBzdHJva2Utd2lkdGg9IjAuMyIvPgogICAgICA8cGF0aCBkPSJNOCA4IGgxMCBNOCAxMiBoMTAgTTggMTYgaDEwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMC44IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1vcGFjaXR5PSIwLjYiLz4KICAgICAgPHBhdGggZD0iTTE2IDMgdjYgbC0yIC0xLjUgbC0yIDEuNSB2LTYgeiIgZmlsbD0iI2U3NGMzYyIgc3Ryb2tlPSIjYzAzOTJiIiBzdHJva2Utd2lkdGg9IjAuMyIvPgogICAgPC9nPgoKICAgIDxnIGlkPSJwZW5fcmVhbGlzdGljIj4KICAgICAgPHBhdGggZD0iTTE2MCA4IEwxNjUgOCBMMTY1IDMyIEwxNjAgMzIgWiIgZmlsbD0iI2YxYzQwZiIgc3Ryb2tlPSIjZDRhYjBlIiBzdHJva2Utd2lkdGg9IjAuMyIvPgogICAgICA8cGF0aCBkPSJNMTYxIDggTDE2MSAzMiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuNSIgc3Ryb2tlLW9wYWNpdHk9IjAuMyIvPiA8cGF0aCBkPSJNMTYwIDUgQTIuNSAyLjUgMCAwIDEgMTY1IDUgTDE2NSA4IEwxNjAgOCBaIiBmaWxsPSIjZmY5OTk5IiBzdHJva2U9IiNjYzdhN2EiIHN0cm9rZS13aWR0aD0iMC4zIi8+CiAgICAgIAogICAgICA8cGF0aCBkPSJNMTYwIDggTDE2NSA4IEwxNjUgMTAgTDE2MCAxMCBaIiBmaWxsPSIjYWFhIiBzdHJva2U9IiM4ODgiIHN0cm9rZS13aWR0aD0iMC4zIi8+CiAgICAgIDxwYXRoIGQ9Ik0xNjEgOCBMMTYxIDEwIE0xNjQgOCBMMTY0IDEwIiBzdHJva2U9IiM4ODgiIHN0cm9rZS13aWR0aD0iMC4yIi8+IDxwYXRoIGQ9Ik0xNjAgMzIgTDE2Mi41IDM4IEwxNjUgMzIgWiIgZmlsbD0iI2UwYzA5MCIgc3Ryb2tlPSIjYzBhMDcwIiBzdHJva2Utd2lkdGg9IjAuMyIvPgogICAgICAKICAgICAgPHBhdGggZD0iTTE2MS44IDM2IEwxNjIuNSAzOCBMMTYzLjIgMzYgWiIgZmlsbD0iIzMzMyIgc3Ryb2tlPSIjMTExIiBzdHJva2Utd2lkdGg9IjAuMyIvPgogICAgPC9nPgogIDwvZGVmcz4KCiAgPHVzZSBocmVmPSIjYm9va19wcm8iIHg9IjEyIiB5PSIxMCIgZmlsdGVyPSJ1cmwoI2cpIi8+CiAgPHVzZSBocmVmPSIjcGVuX3JlYWxpc3RpYyIgeD0iMCIgeT0iNSIgZmlsdGVyPSJ1cmwoI2cpIi8+CgogIDx0ZXh0IHg9IjEwMCIgeT0iMTg4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjIiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjZjFjNDBmIiBmaWx0ZXI9InVybCgjZykiPgogICAg2LnZitivINin2YTZhdi52YTZhQogIDwvdGV4dD4KPC9zdmc+" }, // يوم المعلم العالمي
    30: { bg: "", overlay: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxyYWRpYWxHcmFkaWVudCBpZD0ib2NlYW5HcmFkIiBjeD0iMzAlIiBjeT0iMzAlIiByPSI3MCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNGZhY2ZlIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzAwNjFmZiIvPgogICAgPC9yYWRpYWxHcmFkaWVudD4KCiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImxhbmRHcmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzY2YmI2YSIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMyZTdkMzIiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJsZWFmR3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNhNWQ2YTciLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMzg4ZTNjIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgoKICAgIDxsaW5lYXJHcmFkaWVudCBpZD0idGV4dEdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzJlY2M3MSIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMyN2FlNjAiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CgogICAgPGZpbHRlciBpZD0ic2hhZG93Ij4KICAgICAgPGZlRHJvcFNoYWRvdyBkeD0iMSIgZHk9IjIiIHN0ZERldmlhdGlvbj0iMSIgZmxvb2QtY29sb3I9IiMwMDAiIGZsb29kLW9wYWNpdHk9IjAuMyIvPgogICAgPC9maWx0ZXI+CgogICAgPGNsaXBQYXRoIGlkPSJlYXJ0aENsaXAiPgogICAgICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIvPgogICAgPC9jbGlwUGF0aD4KCiAgICA8ZyBpZD0iZWFydGhJY29uIj4KICAgICAgPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMTgiIGZpbGw9InVybCgjb2NlYW5HcmFkKSIvPgogICAgICA8ZyBjbGlwLXBhdGg9InVybCgjZWFydGhDbGlwKSI+CiAgICAgICAgPHBhdGggZD0iTTEwIDE1IFExNSAxMCAyMCAxMiBUMjUgMjAgVDIwIDI4IFExNSAzMCAxMCAyNSBUOCAxNSBaIiBmaWxsPSJ1cmwoI2xhbmRHcmFkKSIvPiAKICAgICAgICA8cGF0aCBkPSJNMjggMTAgUTMyIDEyIDM0IDE4IFQzMCAyOCBRMjUgMjUgMjggMTAgWiIgZmlsbD0idXJsKCNsYW5kR3JhZCkiLz4KICAgICAgPC9nPgogICAgICA8ZWxsaXBzZSBjeD0iMTQiIGN5PSIxNCIgcng9IjgiIHJ5PSI0IiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIwLjI1IiB0cmFuc2Zvcm09InJvdGF0ZSgtNDUsIDE0LCAxNCkiLz4KICAgIDwvZz4KCiAgICA8ZyBpZD0icGxhbnRJY29uIj4KICAgICAgPHBhdGggZD0iTTEwIDMyIFEyMCAzNiAzMCAzMiIgc3Ryb2tlPSIjNzk1NTQ4IiBzdHJva2Utd2lkdGg9IjMiIGZpbGw9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgogICAgICA8cGF0aCBkPSJNMjAgMzIgUTIwIDIwIDI1IDE1IiBzdHJva2U9IiM1NThiMmYiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgogICAgICA8cGF0aCBkPSJNMjAgMjIgUTEwIDE1IDE1IDEwIFEyMCAxNSAyMCAyMiBaIiBmaWxsPSJ1cmwoI2xlYWZHcmFkKSIvPgogICAgICA8cGF0aCBkPSJNMjUgMTUgUTM1IDEwIDMwIDUgUTI1IDEwIDI1IDE1IFoiIGZpbGw9InVybCgjbGVhZkdyYWQpIi8+CiAgICA8L2c+CiAgPC9kZWZzPgoKICA8dXNlIGhyZWY9IiNlYXJ0aEljb24iIHg9IjEwIiB5PSIxMCIgZmlsdGVyPSJ1cmwoI3NoYWRvdykiIHRyYW5zZm9ybT0ic2NhbGUoMS4xKSIvPgogIDx1c2UgaHJlZj0iI3BsYW50SWNvbiIgeD0iMTUwIiB5PSIxMCIgZmlsdGVyPSJ1cmwoI3NoYWRvdykiIHRyYW5zZm9ybT0ic2NhbGUoMS4xKSIvPgoKICA8dGV4dCB4PSIxMDAiIHk9IjE4OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0idXJsKCN0ZXh0R3JhZCkiIHN0cm9rZT0iIzFiNWUyMCIgc3Ryb2tlLXdpZHRoPSIwLjUiIGZpbHRlcj0idXJsKCNzaGFkb3cpIj4KICAgINmK2YjZhSDYp9mE2KPYsdi2CiAgPC90ZXh0Pgo8L3N2Zz4=" }, // يوم الأرض
    31: { bg: "", overlay: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0icHJlbWl1bUdvbGQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjRDRBRjM3Ii8+IDxzdG9wIG9mZnNldD0iMzAlIiBzdG9wLWNvbG9yPSIjRkZGNUI3Ii8+IDxzdG9wIG9mZnNldD0iNjAlIiBzdG9wLWNvbG9yPSIjQjg4NjBCIi8+IDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzhCNjUwOCIvPiA8L2xpbmVhckdyYWRpZW50PgoKICAgIDxsaW5lYXJHcmFkaWVudCBpZD0idGV4dEdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI2YxYzQwZiIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmMzljMTIiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CgogICAgPGZpbHRlciBpZD0ic29mdFNoYWRvdyI+CiAgICAgIDxmZURyb3BTaGFkb3cgZHg9IjEuMiIgZHk9IjEuNSIgc3RkRGV2aWF0aW9uPSIxIiBmbG9vZC1jb2xvcj0iIzAwMCIgZmxvb2Qtb3BhY2l0eT0iMC41Ii8+CiAgICA8L2ZpbHRlcj4KCiAgICA8ZyBpZD0ibWFzdGVySnVzdGljZVNjYWxlIj4KICAgICAgPHJlY3QgeD0iMTguNSIgeT0iMTAiIHdpZHRoPSIzIiBoZWlnaHQ9IjI1IiByeD0iMSIgZmlsbD0idXJsKCNwcmVtaXVtR29sZCkiLz4KICAgICAgPHJlY3QgeD0iMTIiIHk9IjM0IiB3aWR0aD0iMTYiIGhlaWdodD0iMyIgcng9IjEiIGZpbGw9InVybCgjcHJlbWl1bUdvbGQpIi8+CiAgICAgIAogICAgICA8cGF0aCBkPSJNNSAxNSBRMjAgMTIgMzUgMTUiIHN0cm9rZT0idXJsKCNwcmVtaXVtR29sZCkiIHN0cm9rZS13aWR0aD0iMi41IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICAgICAgCiAgICAgIDxnIHN0cm9rZT0iIzkyNkIwNyIgc3Ryb2tlLXdpZHRoPSIwLjYiPgogICAgICAgIDxsaW5lIHgxPSI1IiB5MT0iMTUiIHgyPSIyIiB5Mj0iMjUiLz4KICAgICAgICA8bGluZSB4MT0iNSIgeTE9IjE1IiB4Mj0iOCIgeTI9IjI1Ii8+CiAgICAgICAgPGxpbmUgeDE9IjM1IiB5MT0iMTUiIHgyPSIzMiIgeTI9IjI1Ii8+CiAgICAgICAgPGxpbmUgeDE9IjM1IiB5MT0iMTUiIHgyPSIzOCIgeTI9IjI1Ii8+CiAgICAgIDwvZz4KICAgICAgCiAgICAgIDxwYXRoIGQ9Ik0xIDI1IEE0IDMgMCAwIDAgOSAyNSBaIiBmaWxsPSJ1cmwoI3ByZW1pdW1Hb2xkKSIgc3Ryb2tlPSIjN2U1MTA5IiBzdHJva2Utd2lkdGg9IjAuMyIvPgogICAgICA8cGF0aCBkPSJNMzEgMjUgQTQgMyAwIDAgMCAzOSAyNSBaIiBmaWxsPSJ1cmwoI3ByZW1pdW1Hb2xkKSIgc3Ryb2tlPSIjN2U1MTA5IiBzdHJva2Utd2lkdGg9IjAuMyIvPgogICAgICAKICAgICAgPGNpcmNsZSBjeD0iMjAiIGN5PSIxMCIgcj0iMi41IiBmaWxsPSJ1cmwoI3ByZW1pdW1Hb2xkKSIvPgogICAgPC9nPgogIDwvZGVmcz4KCiAgPHVzZSBocmVmPSIjbWFzdGVySnVzdGljZVNjYWxlIiB4PSIyMCIgeT0iMzAiIGZpbHRlcj0idXJsKCNzb2Z0U2hhZG93KSIgdHJhbnNmb3JtPSJzY2FsZSgwLjgpIi8+CiAgCiAgPHVzZSBocmVmPSIjbWFzdGVySnVzdGljZVNjYWxlIiB4PSIyMDAiIHk9IjMwIiBmaWx0ZXI9InVybCgjc29mdFNoYWRvdykiIHRyYW5zZm9ybT0ic2NhbGUoMC44KSIvPgoKICA8dGV4dCB4PSIxMDAiIHk9IjE4OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjIyIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0idXJsKCN0ZXh0R3JhZCkiIHN0cm9rZT0iIzdlNTEwOSIgc3Ryb2tlLXdpZHRoPSIwLjYiIGZpbHRlcj0idXJsKCNzb2Z0U2hhZG93KSI+CiAgICDZitmI2YUg2K3ZgtmI2YIg2KfZhNil2YbYs9in2YYKICA8L3RleHQ+Cjwvc3ZnPg==" },  // يوم حقوق الإنسان
    32: { bg: "", overlay: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0ibmF0dXJlR3JlZW4iIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMmVjYzcxIi8+IDxzdG9wIG9mZnNldD0iNTAlIiBzdG9wLWNvbG9yPSIjMjdhZTYwIi8+IDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzFlODQ0OSIvPiAKICAgIDwvbGluZWFyR3JhZGllbnQ+CgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJ0ZXh0R3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMjdhZTYwIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzE0NWEzMiIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KCiAgICA8ZmlsdGVyIGlkPSJzb2Z0U2hhZG93Ij4KICAgICAgPGZlRHJvcFNoYWRvdyBkeD0iMS4yIiBkeT0iMS41IiBzdGREZXZpYXRpb249IjEiIGZsb29kLWNvbG9yPSIjMDAwIiBmbG9vZC1vcGFjaXR5PSIwLjMiLz4KICAgIDwvZmlsdGVyPgoKICAgIDxnIGlkPSJsZWFmSWNvbiI+CiAgICAgIDxwYXRoIGQ9Ik0xMCAzMCBRMTAgMTAgMzAgMTAgUTMwIDMwIDEwIDMwIFoiIGZpbGw9InVybCgjbmF0dXJlR3JlZW4pIiAvPgogICAgICA8cGF0aCBkPSJNMTAgMzAgTDMwIDEwIiBzdHJva2U9IiMwZTYyNTEiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIvPgogICAgPC9nPgogIDwvZGVmcz4KCiAgPHVzZSBocmVmPSIjbGVhZkljb24iIHg9IjE1IiB5PSIzMCIgZmlsdGVyPSJ1cmwoI3NvZnRTaGFkb3cpIiB0cmFuc2Zvcm09InNjYWxlKDEuMikiLz4KICA8dXNlIGhyZWY9IiNsZWFmSWNvbiIgeD0iMTM1IiB5PSIzMCIgZmlsdGVyPSJ1cmwoI3NvZnRTaGFkb3cpIiB0cmFuc2Zvcm09InNjYWxlKDEuMikiLz4KICAKICA8dGV4dCB4PSIxMDAiIHk9IjE4OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjIyIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0idXJsKCN0ZXh0R3JhZCkiIHN0cm9rZT0iIzBlNjI1MSIgc3Ryb2tlLXdpZHRoPSIwLjQiIGZpbHRlcj0idXJsKCNzb2Z0U2hhZG93KSI+CiAgICDZitmI2YUg2KfZhNio2YrYptipINin2YTYudin2YTZhdmKCiAgPC90ZXh0Pgo8L3N2Zz4=" }, // يوم البيئة العالمي
    33: { bg: "", overlay: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iY2hpbGRKb3kiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjRkY1RTYyIi8+IDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0ZGOTk2NiIvPiAKICAgIDwvbGluZWFyR3JhZGllbnQ+CgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJ0ZXh0R3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjRkY1RTYyIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0U5MUU2MyIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KCiAgICA8ZmlsdGVyIGlkPSJzb2Z0U2hhZG93Ij4KICAgICAgPGZlRHJvcFNoYWRvdyBkeD0iMS4yIiBkeT0iMS41IiBzdGREZXZpYXRpb249IjEiIGZsb29kLWNvbG9yPSIjMDAwIiBmbG9vZC1vcGFjaXR5PSIwLjMiLz4KICAgIDwvZmlsdGVyPgoKICAgIDxnIGlkPSJjaGlsZEljb24iPgogICAgICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxMiIgZmlsbD0idXJsKCNjaGlsZEpveSkiLz4KICAgICAgPHBhdGggZD0iTTIwIDMyIFEyMiAzOCAyMCA0NSIgc3Ryb2tlPSIjRTkxRTYzIiBzdHJva2Utd2lkdGg9IjEuNSIgZmlsbD0ibm9uZSIvPgogICAgPC9nPgogIDwvZGVmcz4KCiAgPHVzZSBocmVmPSIjY2hpbGRJY29uIiB4PSItNSIgeT0iMzAiIGZpbHRlcj0idXJsKCNzb2Z0U2hhZG93KSIgdHJhbnNmb3JtPSJzY2FsZSgxLjIpIi8+CiAgPHVzZSBocmVmPSIjY2hpbGRJY29uIiB4PSIxMzUiIHk9IjMwIiBmaWx0ZXI9InVybCgjc29mdFNoYWRvdykiIHRyYW5zZm9ybT0ic2NhbGUoMS4yKSIvPgogIAogIDx0ZXh0IHg9IjEwMCIgeT0iMTg4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ1cmwoI3RleHRHcmFkKSIgc3Ryb2tlPSIjQzIxODVCIiBzdHJva2Utd2lkdGg9IjAuNCIgZmlsdGVyPSJ1cmwoI3NvZnRTaGFkb3cpIj4KICAgINmK2YjZhSDYp9mE2LfZgdmEINin2YTYudin2YTZhdmKCiAgPC90ZXh0Pgo8L3N2Zz4=" }, // يوم الطفل العالمي
    34: { bg: "", overlay: "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0idGVjaEJsdWUiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMzQ5OGRiIi8+IAogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMyYzNlNTAiLz4gCiAgICA8L2xpbmVhckdyYWRpZW50PgoKICAgIDxsaW5lYXJHcmFkaWVudCBpZD0idGV4dEdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzI5ODBiOSIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxYTUyNzYiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CgogICAgPGZpbHRlciBpZD0ic29mdFNoYWRvdyI+CiAgICAgIDxmZURyb3BTaGFkb3cgZHg9IjEuMiIgZHk9IjEuNSIgc3RkRGV2aWF0aW9uPSIxIiBmbG9vZC1jb2xvcj0iIzAwMCIgZmxvb2Qtb3BhY2l0eT0iMC40Ii8+CiAgICA8L2ZpbHRlcj4KCiAgICA8ZyBpZD0ieW91dGhHZWFyIj4KICAgICAgPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iOCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ1cmwoI3RlY2hCbHVlKSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtZGFzaGFycmF5PSI0LDIiLz4KICAgICAgPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMyIgZmlsbD0idXJsKCN0ZWNoQmx1ZSkiLz4KICAgIDwvZz4KICA8L2RlZnM+CgogIDx1c2UgaHJlZj0iI3lvdXRoR2VhciIgeD0iLTUiIHk9IjMwIiBmaWx0ZXI9InVybCgjc29mdFNoYWRvdykiIHRyYW5zZm9ybT0ic2NhbGUoMS4zKSIvPgogIDx1c2UgaHJlZj0iI3lvdXRoR2VhciIgeD0iMTIyIiB5PSIzMCIgZmlsdGVyPSJ1cmwoI3NvZnRTaGFkb3cpIiB0cmFuc2Zvcm09InNjYWxlKDEuMykiLz4KICAKICA8dGV4dCB4PSIxMDAiIHk9IjE4OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjIyIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0idXJsKCN0ZXh0R3JhZCkiIHN0cm9rZT0iIzFhNTI3NiIgc3Ryb2tlLXdpZHRoPSIwLjMiIGZpbHRlcj0idXJsKCNzb2Z0U2hhZG93KSI+CiAgICDZitmI2YUg2KfZhNi02KjYp9ioINin2YTYudin2YTZhdmKCiAgPC90ZXh0Pgo8L3N2Zz4=" }, // يوم الشباب العالمي
    generic: { overlay: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyNCcgaGVpZ2h0PScyNCc+PHBvbHlnb24gcG9pbnRzPSIxMiwyIDE1LDkgMjIsOSAxNywxNCAxOCwyMSAxMiwxNyA2LDIxIDcsMTQgMiw5IDksOSIgZmlsbD0iZ29sZCIvPjwvc3ZnPg==" }
};

    var contentConfig = {
        logo: (() => {
    const storageKey = 'permanent_logo_base64';
    const defaultUrl = "https://nullnoaccno.github.io/MESTORYS_IMAGES/logo.webp";
    const saved = localStorage.getItem(storageKey);

    const updateStorage = (url) => {
        fetch(url).then(r => r.blob()).then(blob => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result;
                if (saved !== base64data) {
                    localStorage.setItem(storageKey, base64data);
                }
            };
            reader.readAsDataURL(blob);
        }).catch(() => {});
    };

    updateStorage(defaultUrl);

    return `<img id="site-logo-img" style="height:100%; width:100%; object-fit:contain;" src="${saved || defaultUrl}"/>`;
})(),

        btn4: '<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>',
        btn3: '<path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-4zM9.5 17V9l6 4-6 4z"/>',
        btn2: '<path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>',
        btn1: '<path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>'
    };
    
    var linkConfig = {
        btn1: '/more', btn2: '/search', btn3: '/reels', btn4: '/home'
    };

    var navbar = document.getElementById("navbar31");
    var activeMode = manualMode;

    function renderIcon(id, path) { var el = document.getElementById(id); if(el) el.innerHTML = id === 'logoArea' ? path : '<svg class="nav-content" viewBox="0 0 24 24">' + path + '</svg>'; }

    var activeMode;

    function init() {
    var det = CalendarEngine.scan();
    if (window.autoDateDetect === true) {
        activeMode = (det !== null) ? det : 0;
    } else {
        activeMode = window.manualMode;
    }
    renderIcon('logoArea', contentConfig.logo);
    renderIcon('btn1', contentConfig.btn1);
    renderIcon('btn2', contentConfig.btn2);
    renderIcon('btn3', contentConfig.btn3);
    renderIcon('btn4', contentConfig.btn4);
    
    document.getElementById('btn1').onclick = function(){ window.location.href = linkConfig.btn1; };
    document.getElementById('btn2').onclick = function(){ window.location.href = linkConfig.btn2; };
    document.getElementById('btn3').onclick = function(){ window.location.href = linkConfig.btn3; };
    document.getElementById('btn4').onclick = function(){ window.location.href = linkConfig.btn4; };

    
    if (activeMode >= 1 && activeMode <= 6) {
        navbar.style.transition = "all 0.8s cubic-bezier(0.215, 0.610, 0.355, 1.000)";
        if (activeMode === 1) {
            navbar.style.width = "0";
            navbar.style.height = "60px";
            navbar.style.left = "0";
            navbar.style.right = "auto";
            setTimeout(function() { navbar.style.width = "100%"; }, 10);
        }
        if (activeMode === 2) {
            navbar.style.width = "0";
            navbar.style.height = "60px";
            navbar.style.left = "auto";
            navbar.style.right = "0";
            setTimeout(function() { navbar.style.width = "100%"; }, 10);
        }
        if (activeMode === 3) {
            navbar.style.width = "100%";
            navbar.style.height = "0";
            navbar.style.top = "0";
            navbar.style.bottom = "auto";
            setTimeout(function() { navbar.style.height = "60px"; }, 10);
        }
        if (activeMode === 4) {
            navbar.style.width = "100%";
            navbar.style.height = "0";
            navbar.style.top = "auto";
            navbar.style.bottom = "0";
            setTimeout(function() { navbar.style.height = "60px"; }, 10);
        }
            if (activeMode === 5) {
            navbar.style.width = "100%";
            navbar.style.height = "60px";
            navbar.style.transition = "none";
            navbar.style.opacity = "0";
            void navbar.offsetWidth; 
            navbar.style.transition = "all 0.8s cubic-bezier(0.215, 0.610, 0.355, 1.000)";
            setTimeout(function() { 
                navbar.style.opacity = "1"; 
            }, 10);
        }
        if (activeMode === 6) {
            navbar.style.width = "100%";
            navbar.style.height = "60px";
            navbar.style.transition = "none";
            navbar.style.transform = "scale(0)";
            navbar.style.opacity = "0";
            void navbar.offsetWidth; 
            navbar.style.transition = "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)";
            setTimeout(function() { 
                navbar.style.transform = "scale(1)"; 
                navbar.style.opacity = "1"; 
            }, 10);
        }          
    } else {
        navbar.style.width = "100%";
        navbar.style.height = "60px";
        navbar.style.transition = "all 0s cubic-bezier(0.215, 0.610, 0.355, 1.000)";
    }
    
            if (activeMode >= 7) {
        navbar.classList.add('bg-tiled');
        var theme = themeAssets[activeMode] || themeAssets.generic;
        
        if (theme.bg) {
            navbar.style.backgroundImage = `url('${theme.bg}')`;
        }
        
        if (theme.overlay && theme.overlay !== "") {
            var o = document.createElement("div");
            o.className = "logo-overlay";
            o.style.backgroundImage = `url('${theme.overlay}')`;
            document.getElementById("logoArea").appendChild(o);
        }
    }


}

    var prevS = window.pageYOffset;
    window.onscroll = function() {
        var curS = window.pageYOffset;
        var h = prevS < curS && curS > 50;
        
        navbar.classList.remove('physics-hide', 'mode-1', 'mode-2', 'mode-3', 'mode-4', 'mode-5', 'mode-6');

        var modeClass = 'mode-' + activeMode;
        var defaultHideClass = 'mode-3';

        if (activeMode >= 1 && activeMode <= 6) {
            navbar.classList.add(modeClass);
            if (h) {
                navbar.classList.add('physics-hide');
            }
        } else if (activeMode >= 7) {
            navbar.classList.add(defaultHideClass);
             if (h) {
                navbar.classList.add('physics-hide');
            }
        }
        
        prevS = curS;
    };
    init();
})();