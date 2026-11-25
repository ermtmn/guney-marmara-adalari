// Tüm sayfalarda: service worker kaydı (çevrimdışı çalışma), "Uygulamayı yükle" önerisi ve internet yok uyarısı.
(function () {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }

  const kaydet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const oku = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const yuklu = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

  // --- İnternet yok uyarısı ---
  function baglantiCiz() {
    let s = document.getElementById("cevrimdisi");
    if (navigator.onLine) { if (s) s.remove(); return; }
    if (s) return;
    s = document.createElement("div");
    s.id = "cevrimdisi"; s.className = "cevrimdisi"; s.setAttribute("role", "status");
    s.textContent = "📴 İnternet yok. En son kaydedilen tarife ve bilgiler gösteriliyor.";
    document.body.prepend(s);
  }
  window.addEventListener("online", baglantiCiz);
  window.addEventListener("offline", baglantiCiz);
  document.addEventListener("DOMContentLoaded", baglantiCiz);

  // --- "Uygulamayı yükle" ---
  if (yuklu || oku("adalar-yukle-kapat")) return;
  let istem = null;

  function seritGoster(metin, dugme) {
    if (document.getElementById("yukleSerit")) return;
    const s = document.createElement("div");
    s.id = "yukleSerit"; s.className = "yukle-serit";
    s.innerHTML = `<img src="assets/ikon/icon-192.png" alt="" width="36" height="36"><div class="yukle-metin">${metin}</div>`
      + (dugme ? `<button type="button" class="yukle-evet">Yükle</button>` : "")
      + `<button type="button" class="yukle-kapat" aria-label="Kapat">✕</button>`;
    document.body.appendChild(s);
    s.querySelector(".yukle-kapat").onclick = () => { s.remove(); kaydet("adalar-yukle-kapat", "1"); };
    const evet = s.querySelector(".yukle-evet");
    if (evet) evet.onclick = async () => {
      s.remove();
      if (!istem) return;
      istem.prompt();
      const secim = await istem.userChoice;
      if (secim.outcome !== "accepted") kaydet("adalar-yukle-kapat", "1");
      istem = null;
    };
  }

  // Android, Windows, Mac: tarayıcı yüklemeye hazır olduğunu bildirir
  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault();
    istem = e;
    seritGoster("<b>Uygulama olarak yükleyin</b><br>Ana ekrandan açılır, internet yokken de tarifeyi gösterir.", true);
  });
  window.addEventListener("appinstalled", () => { const s = document.getElementById("yukleSerit"); if (s) s.remove(); });

  // iPhone/iPad Safari: yükleme düğmesi yok, nasıl yapılacağını anlat
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (ios) document.addEventListener("DOMContentLoaded", () =>
    seritGoster("<b>Ana ekrana ekleyin</b><br>Alttaki Paylaş <span aria-hidden=\"true\">⬆️</span> düğmesine, sonra <b>Ana Ekrana Ekle</b>'ye dokunun.", false));
})();
