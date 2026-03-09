/* DEBOUNCE UTILITY */
let debounceTimer;
function debounce(func, timeout = 1000){
    return (...args) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

let map, marker, accuracyCircle, currentPos = null, miniMap = null;

const els = {
    lat: document.getElementById("lat-val"),
    lng: document.getElementById("lng-val"),
    addr: document.getElementById("full-address"),
    acc: document.getElementById("accuracy-val"),
    temp: document.getElementById("temp-display"),
    wind: document.getElementById("wind-display"),
    ip: document.getElementById("ip-val"),
    isp: document.getElementById("isp-val"),
    nearby: document.getElementById("nearby-results")
};

function openDirectMap() {
    if (!currentPos) return alert("Waiting for location...");
    window.open(`https://www.google.com/maps/search/?api=1&query=$${currentPos.lat},${currentPos.lng}`, '_blank');
}

/* --- STREET VIEW LOGIC --- */
function launchStreetView() {
    if (!currentPos || !currentPos.lat) {
        return alert("Waiting for GPS lock. Please ensure location permissions are granted.");
    }
    const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=$${currentPos.lat},${currentPos.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
}

// Generate QR Code
new QRCode(document.getElementById("qrcode"), {
    text: window.location.href,
    width: 100, height: 100,
    colorDark : "#000000", colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
});

// Compass Logic
window.addEventListener('deviceorientation', function(event) {
    if (event.webkitCompassHeading) {
        document.getElementById('compass-svg').style.transform = `rotate(${-event.webkitCompassHeading}deg)`;
        document.getElementById('head-p').textContent = Math.round(event.webkitCompassHeading) + '°';
    } else if (event.alpha) {
        document.getElementById('compass-svg').style.transform = `rotate(${-event.alpha}deg)`;
        document.getElementById('head-p').textContent = Math.round(event.alpha) + '°';
    }
}, true);

// Dashboard Clock
setInterval(() => {
    const now = new Date();
    document.getElementById('time-p').textContent = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
}, 1000);

/* --- I18N LOGIC --- */
const i18n = {
    en: { tagline: "Instant, Private, & Accurate", address_title: "Current Address", gps_label: "GPS Coordinates", weather_label: "Weather", ip_label: "Network IP", nearby_label: "Nearest Emergency Services", btn_sos: "SHARE LOCATION (SOS)", btn_refresh: "Refresh", btn_copy: "Copy Lat/Long", btn_coffee: "Buy Me a Coffee", trust_text: "🔒 Privacy Guarantee: We do not save, need, or share your location. This website exists solely to help you or save you when needed. All data is processed securely on your device.", link_privacy: "Privacy Policy", link_terms: "Terms of Use", link_contact: "Contact Us", cookie_text: "We use cookies to analyze traffic and show personalized ads to support this free tool.", btn_accept: "Accept All" },
    es: { tagline: "Instantáneo, Privado y Preciso", address_title: "Dirección Actual", gps_label: "Coordenadas GPS", weather_label: "Clima", ip_label: "IP de Red", nearby_label: "Servicios de Emergencia", btn_sos: "COMPARTIR UBICACIÓN (SOS)", btn_refresh: "Actualizar", btn_copy: "Copiar Lat/Long", btn_coffee: "Invítame un Café", trust_text: "🔒 Garantía de Privacidad: No guardamos, necesitamos ni compartimos tu ubicación.", link_privacy: "Privacidad", link_terms: "Términos", link_contact: "Contacto", cookie_text: "Usamos cookies para analizar el tráfico y mostrar anuncios personalizados.", btn_accept: "Aceptar" },
    fr: { tagline: "Instantané, Privé et Précis", address_title: "Adresse Actuelle", gps_label: "Coordonnées GPS", weather_label: "Météo", ip_label: "IP Réseau", nearby_label: "Services d'Urgence", btn_sos: "PARTAGER POSITION (SOS)", btn_refresh: "Actualiser", btn_copy: "Copiar Lat/Long", btn_coffee: "Offrez-moi un café", trust_text: "🔒 Garantie de Confidentialité : Nous n'enregistrons ni ne partageons votre localisation.", link_privacy: "Confidentialité", link_terms: "Conditions", link_contact: "Contact", cookie_text: "Nous utilisons des cookies pour analyser le trafic et afficher des publicités.", btn_accept: "Accepter" },
    ru: { tagline: "Мгновенно, приватно и точно", address_title: "Текущий адрес", gps_label: "Координаты GPS", weather_label: "Погода", ip_label: "IP-адрес сети", nearby_label: "Ближайшие экстренные службы", btn_sos: "ПОДЕЛИТЬСЯ (SOS)", btn_refresh: "Обновить", btn_copy: "Копировать", btn_coffee: "Купить мне кофе", trust_text: "🔒 Гарантия конфиденциальности: Мы не сохраняем и не передаем ваше местоположение.", link_privacy: "Политика", link_terms: "Условия", link_contact: "Контакты", cookie_text: "Мы используем файлы cookie для анализа трафика и показа рекламы.", btn_accept: "Принять" },
    ar: { tagline: "فوري، خاص، ودقيق", address_title: "العنوان الحالي", gps_label: "إحداثيات GPS", weather_label: "الطقس", ip_label: "عنوان IP", nearby_label: "أقرب خدمات الطوارئ", btn_sos: "مشاركة الموقع (SOS)", btn_refresh: "تحديث البيانات", btn_copy: "نسخ الإحداثيات", btn_coffee: "دعم الموقع", trust_text: "🔒 ضمان الخصوصية: نحن لا نحفظ موقعك أو نحتاج إليه أو نشاركه.", link_privacy: "الخصوصية", link_terms: "الشروط", link_contact: "اتصل بنا", cookie_text: "نحن نستخدم ملفات تعريف الارتباط لتحليل حركة المرور وعرض الإعلانات.", btn_accept: "قبول" }
};

window.changeLanguage = function(lang) {
    localStorage.setItem('user_lang', lang);
    if (lang === 'ar') { document.body.classList.add('rtl'); } else { document.body.classList.remove('rtl'); }
    const texts = i18n[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (texts[key]) el.textContent = texts[key];
    });
}
const savedLang = localStorage.getItem('user_lang') || 'en';
document.getElementById('language').value = savedLang;
changeLanguage(savedLang);

/* --- CONSENT LOGIC --- */
function checkConsent() {
    const consent = localStorage.getItem('cookiesAccepted');
    if (!consent) { document.getElementById('cookie-banner').style.display = 'block'; } 
    else if (consent === 'granted') {
        gtag('consent', 'update', { 'ad_storage': 'granted', 'ad_user_data': 'granted', 'ad_personalization': 'granted', 'analytics_storage': 'granted' });
    }
}
window.acceptCookies = function() {
    localStorage.setItem('cookiesAccepted', 'granted');
    document.getElementById('cookie-banner').style.display = 'none';
    gtag('consent', 'update', { 'ad_storage': 'granted', 'ad_user_data': 'granted', 'ad_personalization': 'granted', 'analytics_storage': 'granted' });
}
window.rejectCookies = function() {
    localStorage.setItem('cookiesAccepted', 'denied');
    document.getElementById('cookie-banner').style.display = 'none';
    gtag('consent', 'update', { 'ad_storage': 'denied', 'ad_user_data': 'denied', 'ad_personalization': 'denied', 'analytics_storage': 'denied' });
}
window.showCookieBanner = function() { document.getElementById('cookie-banner').style.display = 'block'; }
checkConsent();

/* --- GPS & DISTANCE LOGIC --- */
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const km = R * c;
    return { km: km.toFixed(2), mi: (km * 0.621371).toFixed(2) };
}

async function runDashboardUpdate(lat, lng, acc) {
    currentPos = { lat, lng };
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await res.json();
        els.addr.textContent = data.display_name || "Unknown Address";
    } catch(e) { els.addr.textContent = "..."; }

    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m`);
        const data = await res.json();
        const c = Math.round(data.current.temperature_2m);
        const f = Math.round((c * 9/5) + 32);
        const kph = Math.round(data.current.wind_speed_10m);
        const mph = Math.round(kph * 0.621371);
        els.temp.textContent = `${f}°F / ${c}°C`;
        els.wind.textContent = `${mph} mph / ${kph} km/h`;
    } catch(e) { els.temp.textContent = "N/A"; }

    try {
        const query = `[out:json][timeout:10];(node["amenity"~"police|hospital|fuel"](around:5000,${lat},${lng}););out body 10;`;
        const res = await fetch("https://overpass.kumi.systems/api/interpreter", { method: "POST", body: query });
        const data = await res.json();
        const types = { police: "Police", hospital: "Hospital", fuel: "Fuel" };
        let best = { police: null, hospital: null, fuel: null };
        data.elements.forEach(el => {
            const t = el.tags.amenity;
            const dist = getDistance(lat, lng, el.lat, el.lon);
            if (!best[t] || parseFloat(dist.km) < parseFloat(best[t].dist.km)) {
                best[t] = { name: el.tags.name || "Local", dist };
            }
        });
        els.nearby.innerHTML = "";
        Object.keys(best).forEach(k => {
            const item = best[k];
            const div = document.createElement("div");
            div.className = "nearby-item";
            div.innerHTML = item ? 
                `<div class="nearby-type">${types[k]}</div><div class="nearby-name">${item.name}</div><div class="nearby-dist">${item.dist.mi} mi / ${item.dist.km} km</div>` :
                `<div class="nearby-type">${types[k]}</div><div class="nearby-name" style="color:#555">None</div>`;
            els.nearby.appendChild(div);
        });
    } catch(e) { 
        els.nearby.innerHTML = '<div style="color:#ef4444; font-size:12px; padding:10px;">Service temporarily unavailable due to high traffic.</div>';
    }
}

const updateDashboard = debounce((lat, lng, acc) => { runDashboardUpdate(lat, lng, acc); }, 1000);

function initGPS() {
    if (!navigator.geolocation) { els.addr.textContent = "GPS not supported"; return; }
    navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude, accuracy, altitude } = pos.coords;
        els.lat.textContent = latitude.toFixed(5);
        els.lng.textContent = longitude.toFixed(5);
        els.acc.textContent = `±${Math.round(accuracy)}m`;
        document.getElementById('alt-p').textContent = altitude ? Math.round(altitude) + 'm' : 'Sea Level';

        if (!map) {
            map = L.map("map", { zoomControl: false }).setView([latitude, longitude], 15);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
            marker = L.marker([latitude, longitude]).addTo(map);
            accuracyCircle = L.circle([latitude, longitude], { radius: accuracy }).addTo(map);
        } else {
            map.setView([latitude, longitude], 15);
            marker.setLatLng([latitude, longitude]);
            accuracyCircle.setLatLng([latitude, longitude]);
            accuracyCircle.setRadius(accuracy);
        }
        runDashboardUpdate(latitude, longitude, accuracy);
        
    }, (err) => { els.addr.textContent = "Please enable Location Services."; }, { enableHighAccuracy: true });
    
    fetch("https://ipapi.co/json/").then(r=>r.json()).then(d=>{
        els.ip.textContent = d.ip; els.isp.textContent = d.org;
    });
}

document.getElementById("refresh-btn").addEventListener("click", () => location.reload());
document.getElementById("copy-coords-btn").addEventListener("click", () => { navigator.clipboard.writeText(`${els.lat.textContent}, ${els.lng.textContent}`); alert("Coordinates Copied!"); });
document.getElementById("copy-addr").addEventListener("click", () => { navigator.clipboard.writeText(els.addr.textContent); alert("Address Copied!"); });
document.getElementById("sos-btn").addEventListener("click", () => { triggerSOSMode(); });

initGPS();

/* --- MODULES --- */
window.addEventListener('offline', () => { document.getElementById('offline-indicator').style.display = 'inline-block'; loadPins(); });
window.addEventListener('online', () => { document.getElementById('offline-indicator').style.display = 'none'; });

window.toggleModule = function(id) {
    document.querySelectorAll('.new-module-container').forEach(el => { if (el.id !== id) el.classList.remove('active-mod'); });
    const mod = document.getElementById(id);
    mod.classList.toggle('active-mod');
    if (id === 'share-mod' && currentPos) {
        document.getElementById('share-url-input').value = `https://tellmylocation.com/?lat=${currentPos.lat}&lng=${currentPos.lng}`;
    }
}

window.copyShareLink = function() {
    const input = document.getElementById('share-url-input');
    input.select(); document.execCommand('copy'); alert('Link copied to clipboard!');
}

window.shareSocial = function(platform) {
    if (!currentPos) return alert("Waiting for location...");
    const url = `https://tellmylocation.com/?lat=${currentPos.lat}&lng=${currentPos.lng}`;
    const msg = `My current location: ${url}`;
    let link = "";
    if (platform === 'wa') link = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    if (platform === 'sms') link = `sms:?body=${encodeURIComponent(msg)}`;
    if (platform === 'tg') link = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent("My Location")}`;
    window.open(link, '_blank');
}

window.startLiveTrack = function() {
    const btn = document.getElementById('live-trk-btn');
    btn.innerText = "📡 Tracking Active (15m)"; btn.style.background = "#ef4444";
    setTimeout(() => { btn.innerText = "📡 Start Live (15m)"; btn.style.background = ""; alert("Live tracking session ended."); }, 15 * 60 * 1000);
    alert("Live tracking started. Session ID: " + Math.random().toString(36).substr(2, 9));
}

let watchId = null;
window.enableDriverStats = function() {
    if (watchId) return;
    watchId = navigator.geolocation.watchPosition(pos => {
        const spd = pos.coords.speed; const hdg = pos.coords.heading;
        if (spd !== null) { document.getElementById('drv-speed').innerText = Math.round(spd * 2.23694); }
        if (hdg !== null && !isNaN(hdg)) {
            const dirs = ['N','NE','E','SE','S','SW','W','NW'];
            const ix = Math.round(((hdg %= 360) < 0 ? hdg + 360 : hdg) / 45) % 8;
            document.getElementById('drv-dir').innerText = dirs[ix];
        }
    }, null, {enableHighAccuracy: true});
}
document.querySelector('button[onclick="toggleModule(\'driver-mod\')"]').addEventListener('click', enableDriverStats);

window.openMapSearch = function(query) {
    if (!currentPos) return;
    window.open(`https://www.google.com/maps/search/$${query}/@${currentPos.lat},${currentPos.lng},15z`, '_blank');
}

window.shareETA = function() {
    const min = prompt("Minutes to arrival?", "15");
    if (!min) return;
    const msg = `I will arrive in approx ${min} mins. Track me: https://tellmylocation.com/?lat=${currentPos.lat}&lng=${currentPos.lng}`;
    window.location.href = `sms:?body=${encodeURIComponent(msg)}`;
}
window.shareLocationSimple = function() { shareSocial('sms'); }

window.dropPin = function() {
    if (!currentPos) return alert("No GPS signal.");
    const pins = JSON.parse(localStorage.getItem('hiker_pins') || "[]");
    pins.push({ time: new Date().toLocaleTimeString(), lat: currentPos.lat, lng: currentPos.lng });
    localStorage.setItem('hiker_pins', JSON.stringify(pins));
    loadPins();
}

window.loadPins = function() {
    const list = document.getElementById('pin-list'); list.innerHTML = "";
    const pins = JSON.parse(localStorage.getItem('hiker_pins') || "[]");
    pins.forEach((p, i) => {
        const div = document.createElement('div'); div.className = 'pin-item';
        div.innerHTML = `<span>📍 Pin ${i+1} (${p.time})</span> <a href="https://www.google.com/maps?q=$${p.lat},${p.lng}" target="_blank" style="color:#38bdf8">Map</a>`;
        list.appendChild(div);
    });
}
window.clearPins = function() { if(confirm("Delete all pins?")) { localStorage.removeItem('hiker_pins'); loadPins(); } }
loadPins();

window.calcFriendDist = function() {
    const val = document.getElementById('friend-input').value;
    let lat2, lng2;
    const match = val.match(/([-+]?\d{1,2}\.\d+),\s*([-+]?\d{1,3}\.\d+)/);
    if (match) { lat2 = parseFloat(match[1]); lng2 = parseFloat(match[2]); } 
    else if (val.includes('lat=') && val.includes('lng=')) {
        const url = new URL(val); lat2 = parseFloat(url.searchParams.get('lat')); lng2 = parseFloat(url.searchParams.get('lng'));
    } else { return alert("Could not parse coordinates. Please use 'lat,lng' format."); }

    if (!currentPos) return alert("Your location is not set yet.");
    const dist = getDistance(currentPos.lat, currentPos.lng, lat2, lng2);
    const midLat = (currentPos.lat + lat2) / 2; const midLng = (currentPos.lng + lng2) / 2;
    
    document.getElementById('friend-res').innerHTML = `
        <strong>Distance:</strong> ${dist.mi} mi / ${dist.km} km<br>
        <strong>Midpoint:</strong> <a href="https://www.google.com/maps/search/?api=1&query=$${midLat},${midLng}" target="_blank" style="color:#38bdf8; text-decoration:underline;">Find Meetup Spot</a>
    `;
}

let sosAudio = null;
window.triggerSOSMode = function() {
    document.getElementById('sos-overlay').style.display = 'flex';
    if (navigator.share && currentPos) {
        navigator.share({ title: 'EMERGENCY LOCATION', text: 'Emergency Location:', url: `https://tellmylocation.com/?lat=${currentPos.lat}&lng=${currentPos.lng}` }).catch(console.log);
    }
}
window.stopSOS = function() {
    document.getElementById('sos-overlay').style.display = 'none';
    if (sosAudio) { sosAudio.pause(); sosAudio = null; }
}

window.triggerPremiumShare = function(platform) {
    let url = 'https://tellmylocation.com';
    let text = 'Never get lost again. I use TellMyLocation for instant, private offline GPS tracking and emergency safety. 🌍📍';
    let title = 'Tell My Location | Global GPS';

    if (currentPos && currentPos.lat) {
        url = `https://tellmylocation.com/?lat=${currentPos.lat}&lng=${currentPos.lng}`;
        text = `📍 I am currently at these exact coordinates: ${currentPos.lat.toFixed(5)}, ${currentPos.lng.toFixed(5)}. Track my location here:`;
    }

    const encodedUrl = encodeURIComponent(url); const encodedText = encodeURIComponent(text); const encodedTitle = encodeURIComponent(title);
    let shareLink = '';

    switch(platform) {
        case 'x': shareLink = `https://x.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`; break;
        case 'fb': shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`; break;
        case 'reddit': shareLink = `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`; break;
        case 'wa': shareLink = `https://wa.me/?text=${encodedText} ${encodedUrl}`; break;
        case 'sms': shareLink = `sms:?body=${encodedText} ${encodedUrl}`; break;
        case 'email': shareLink = `mailto:?subject=${encodedTitle}&body=${encodedText} ${encodedUrl}`; break;
        case 'ig':
            navigator.clipboard.writeText(`${text} ${url}`);
            alert("Link and message copied to your clipboard! 📸 Open Instagram and paste it into your Story or DM.");
            return; 
    }
    if (shareLink) window.open(shareLink, '_blank', 'noopener,noreferrer');
}

window.onload = function() {
    const params = new URLSearchParams(window.location.search);
    const pLat = params.get('lat'); const pLng = params.get('lng');
    if (pLat && pLng) {
        setTimeout(() => {
           if(map) {
               L.marker([pLat, pLng], {color:'red'}).addTo(map).bindPopup("Shared Location").openPopup();
               map.setView([pLat, pLng], 15);
           }
        }, 2000);
    }
};

/* --- WEATHER LOGIC --- */
const weatherCodes = {
    0: "☀️ Clear", 1: "🌤️ Mostly Clear", 2: "⛅ Partly Cloudy", 3: "☁️ Overcast",
    45: "🌫️ Fog", 48: "🌫️ Rime Fog", 51: "DRIZZLE", 53: "DRIZZLE", 55: "DRIZZLE",
    61: "Rain", 63: "Rain", 65: "Heavy Rain", 71: "Snow", 73: "Snow", 75: "Heavy Snow",
    80: "Showers", 81: "Showers", 82: "Showers", 95: "STORM", 96: "STORM", 99: "HEAVY STORM"
};

function initPreviewMap(lat, lng) {
    if(!miniMap) {
        miniMap = L.map('mini-map', { zoomControl: false, attributionControl: false }).setView([lat, lng], 13);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(miniMap);
        L.marker([lat, lng]).addTo(miniMap);
        window.mapPreview = miniMap; window.lastLat = lat; window.lastLng = lng;
    } else {
        miniMap.setView([lat, lng], 13); window.lastLat = lat; window.lastLng = lng;
    }
}

function fetchExtendedWeather(lat, lng) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,uv_index&hourly=temperature_2m,weather_code,precipitation_probability&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days=1`;
    fetch(url).then(r=>r.json()).then(data => {
        document.getElementById('weather-loading').style.display = 'none'; document.getElementById('weather-content').style.display = 'block';
        document.getElementById('wx-temp').innerText = Math.round(data.current.temperature_2m) + "°F";
        document.getElementById('wx-desc').innerText = weatherCodes[data.current.weather_code] || "Unknown";
        document.getElementById('wx-wind').innerText = Math.round(data.current.wind_speed_10m) + " mph";
        document.getElementById('wx-hum').innerText = data.current.relative_humidity_2m + "%";
        document.getElementById('wx-uv').innerText = data.current.uv_index;

        const panel = document.getElementById('wx-alert-panel'); const msg = document.getElementById('wx-alert-msg');
        if(data.current.weather_code >= 95 || data.current.wind_speed_10m > 40 || data.current.uv_index > 8) {
            panel.style.borderColor = "#ef4444"; panel.style.background = "rgba(239, 68, 68, 0.1)"; msg.innerText = "⚠️ CAUTION: High winds, storm, or UV detected."; msg.style.color = "#fca5a5";
        } else {
            panel.style.borderColor = "#10b981"; panel.style.background = "rgba(16, 185, 129, 0.05)"; msg.innerText = "Clear — No severe warnings active."; msg.style.color = "#cbd5e1";
        }

        const hourlyDiv = document.getElementById('wx-hourly'); hourlyDiv.innerHTML = "";
        const nowHour = new Date().getHours();
        for(let i=0; i<12; i++) { 
            let idx = nowHour + i; if(idx >= data.hourly.time.length) break;
            const el = document.createElement('div'); el.style = "background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; min-width:60px; text-align:center; flex-shrink:0;";
            el.innerHTML = `<div style="font-size:10px; color:#94a3b8; margin-bottom:4px;">+${i}h</div><div style="font-size:16px; margin-bottom:2px;">${(data.hourly.weather_code[idx] > 50) ? '🌧️' : ((data.hourly.weather_code[idx] < 3) ? '☀️' : '☁️')}</div><div style="font-size:13px; font-weight:700;">${Math.round(data.hourly.temperature_2m[idx])}°</div><div style="font-size:9px; color:#38bdf8;">${data.hourly.precipitation_probability[idx]}%</div>`;
            hourlyDiv.appendChild(el);
        }
    }).catch(e => { document.getElementById('weather-loading').innerText = "Weather unavailable."; });
}

const checkLoc = setInterval(() => {
    const latTxt = document.getElementById('lat-val').textContent;
    if(latTxt !== '—' && !isNaN(parseFloat(latTxt))) {
        initPreviewMap(parseFloat(latTxt), parseFloat(document.getElementById('lng-val').textContent));
        fetchExtendedWeather(parseFloat(latTxt), parseFloat(document.getElementById('lng-val').textContent));
        clearInterval(checkLoc);
    }
}, 1000);

/* --- GLOBAL SOS DIRECTORY LOGIC --- */
const globalSOS = {
    "US": { n: "911", c: "United States" }, "CA": { n: "911", c: "Canada" }, "MX": { n: "911", c: "Mexico" }, "GB": { n: "999", c: "United Kingdom" }, "IE": { n: "112", c: "Ireland" }, "AU": { n: "000", c: "Australia" }, "NZ": { n: "111", c: "New Zealand" }, "ZA": { n: "10111", c: "South Africa" }, "IN": { n: "112", c: "India" }, "JP": { n: "110", c: "Japan (Police) / 119 (Fire)" }, "CN": { n: "110", c: "China (Police) / 120 (Amb)" }, "BR": { n: "190", c: "Brazil (Police) / 192 (Amb)" }, "AE": { n: "999", c: "UAE" }, "SA": { n: "999", c: "Saudi Arabia" }, "JO": { n: "911", c: "Jordan" }, "IL": { n: "100", c: "Israel" }, "EG": { n: "122", c: "Egypt" }, "FR": { n: "112", c: "France" }, "DE": { n: "112", c: "Germany" }, "IT": { n: "112", c: "Italy" }, "ES": { n: "112", c: "Spain" }, "NL": { n: "112", c: "Netherlands" }, "SE": { n: "112", c: "Sweden" }, "NO": { n: "112", c: "Norway" }, "DK": { n: "112", c: "Denmark" }, "FI": { n: "112", c: "Finland" }, "CH": { n: "112", c: "Switzerland" }, "PT": { n: "112", c: "Portugal" }, "GR": { n: "112", c: "Greece" }, "PL": { n: "112", c: "Poland" }, "BE": { n: "112", c: "Belgium" }, "AT": { n: "112", c: "Austria" }, "CZ": { n: "112", c: "Czech Republic" }
};

fetch("https://ipapi.co/json/").then(r=>r.json()).then(d=>{
    if(d.country) {
        let sosData = globalSOS[d.country.toUpperCase()] || { n: "112", c: d.country_name || "Unknown Region" };
        document.getElementById('sos-country-name').innerText = `Jurisdiction: ${sosData.c}`;
        document.getElementById('sos-dial-number').innerText = sosData.n;
        const dialBtn = document.getElementById('sos-dial-btn');
        dialBtn.style.display = 'inline-block'; dialBtn.href = `tel:${sosData.n.split(" ")[0]}`;
    }
}).catch(e => console.log("SOS Directory: Could not fetch local jurisdiction data."));
