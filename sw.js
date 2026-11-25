// Service worker: siteyi telefona uygulama gibi kurulabilir yapar ve internet yokken son kaydedilen
// tarifeyi gösterir. Ayrıca takip edilen yönler için iptal/ek sefer duyurularını arka planda kontrol eder
// (yalnızca destekleyen tarayıcılarda: Android'de yüklenmiş uygulama, Chrome/Edge).
//
// Önbellek stratejisi:
//  - Saatte bir değişen veriler (data/duyurular.js, hava.js, tarifeler.js, api/v1/*): önce internet, yoksa önbellek
//  - Diğer her şey (sayfalar, stil, logolar, tarife): önce önbellek (hızlı açılış), arka planda tazelenir
// Bu dosyada değişiklik yapınca SURUM'u artırın.

const SURUM = "v3";
const ONBELLEK = "adalar-" + SURUM;
const UYGULAMA = [
  "./", "index.html", "adalar.html", "rehber.html", "dernekler.html", "manifest.webmanifest",
  "data/rehber.js", "data/eczane.js",
  "assets/stil.css", "assets/sefer-motoru.js", "assets/pwa.js",
  "assets/logo.svg", "assets/logo-ada.svg", "assets/logo-rehber.svg", "assets/logo-dernek.svg", "assets/ikon/icon-192.png",
  "data/seferler.js", "data/adalar.js", "data/dernekler.js",
  "data/duyurular.js", "data/hava.js", "data/tarifeler.js"
];
const CANLI = /\/(data\/(duyurular|hava|tarifeler|eczane)\.js|api\/)/;
const TAKIP_ADRESI = "__takip.json";    // sayfanın kaydettiği takip listesi ve görülen duyurular

importScripts("assets/sefer-motoru.js");

self.addEventListener("install", e => {
  e.waitUntil(caches.open(ONBELLEK).then(c => c.addAll(UYGULAMA)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const eski = (await caches.keys()).filter(k => k.startsWith("adalar-") && k !== ONBELLEK && k !== "adalar-takip");
    await Promise.all(eski.map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Önbellek anahtarı: sorgu (?t=..., ?nereden=...) olmadan; "./" -> index.html
function anahtar(istek) {
  const u = new URL(istek.url);
  u.search = ""; u.hash = "";
  if (u.pathname.endsWith("/")) u.pathname += "index.html";
  return u.href;
}

self.addEventListener("fetch", e => {
  const istek = e.request;
  if (istek.method !== "GET" || new URL(istek.url).origin !== location.origin) return;
  const k = anahtar(istek);
  if (CANLI.test(new URL(istek.url).pathname)) {
    // Önce internet (4 sn bekle), olmazsa son kaydedilen
    e.respondWith((async () => {
      const c = await caches.open(ONBELLEK);
      try {
        const yanit = await Promise.race([fetch(istek), new Promise((_, r) => setTimeout(() => r(new Error("zaman aşımı")), 4000))]);
        if (yanit.ok) c.put(k, yanit.clone());
        return yanit;
      } catch (err) {
        return (await c.match(k)) || Response.error();
      }
    })());
    return;
  }
  // Önce önbellek, arka planda tazele
  e.respondWith((async () => {
    const c = await caches.open(ONBELLEK);
    const kayitli = await c.match(k);
    const ag = fetch(istek).then(y => { if (y.ok) c.put(k, y.clone()); return y; }).catch(() => null);
    if (kayitli) { e.waitUntil(ag); return kayitli; }
    return (await ag) || (istek.mode === "navigate" ? c.match(new URL("index.html", self.registration.scope).href) : Response.error());
  })());
});

// --- Takip edilen yönler için duyuru kontrolü ---

async function takipOku() {
  const y = await (await caches.open("adalar-takip")).match(TAKIP_ADRESI);
  return y ? y.json() : { takip: [], gorulen: [] };
}
async function takipYaz(v) {
  await (await caches.open("adalar-takip")).put(TAKIP_ADRESI, new Response(JSON.stringify(v), { headers: { "Content-Type": "application/json" } }));
}

async function duyuruKontrol() {
  if (!self.Notification || Notification.permission !== "granted") return;
  const v = await takipOku();
  if (!v.takip.length) return;
  const duyuru = await fetch("api/v1/duyurular.json?t=" + Date.now(), { cache: "no-store" }).then(r => r.json());
  const gorulen = new Set(v.gorulen);
  for (const t of v.takip) {
    for (const d of SeferMotoru.duyuruEslesir(t, duyuru)) {
      if (gorulen.has(d.anahtar)) continue;
      gorulen.add(d.anahtar);
      await self.registration.showNotification(`⚠️ ${t.ad}: ${d.isletmeci} duyurusu`, {
        body: (d.baslik ? d.baslik + " · " : "") + d.metin.slice(0, 180),
        icon: "assets/ikon/icon-192.png", badge: "assets/ikon/icon-192.png", tag: d.anahtar,
        data: { url: `index.html?nereden=${t.nereden}&nereye=${t.nereye}#iptal` }
      });
    }
  }
  v.gorulen = [...gorulen].slice(-200);
  await takipYaz(v);
}

// Android'de yüklenmiş uygulama: tarayıcı uygun gördüğü aralıklarla (en sık saatte bir) çalıştırır
self.addEventListener("periodicsync", e => { if (e.tag === "duyuru-kontrol") e.waitUntil(duyuruKontrol()); });
// Sayfa açıkken sayfanın isteğiyle kontrol
self.addEventListener("message", e => { if (e.data === "duyuru-kontrol") e.waitUntil(duyuruKontrol()); });

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "index.html", self.registration.scope).href;
  e.waitUntil((async () => {
    const pencereler = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const acik = pencereler.find(p => p.url.startsWith(self.registration.scope));
    if (acik) { await acik.navigate(url); return acik.focus(); }
    return self.clients.openWindow(url);
  })());
});
