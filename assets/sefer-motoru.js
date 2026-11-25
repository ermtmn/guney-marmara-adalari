// Sefer arama motoru: tarifelerden "A'dan B'ye, şu gün hangi seferler var" hesabı.
// Arayüzden bağımsızdır; hem web sitesi hem ileride mobil uygulama aynı dosyayı kullanır.
// Tarayıcıda window.SeferMotoru olarak, Node/uygulama paketlerinde require/import ile kullanılır.
//
// Tüm fonksiyonlar sefer verisini (data/seferler.js veya api/v1/seferler.json) parametre olarak alır.
// Gün numaraları: 0=Pazartesi ... 6=Pazar.
// filtre: { kapaliFirmalar: ["gestas", ...], sadeceArac: true/false } (isteğe bağlı)

(function (kok, fabrika) {
  if (typeof module === "object" && module.exports) module.exports = fabrika();
  else kok.SeferMotoru = fabrika();
})(typeof self !== "undefined" ? self : this, function () {

  // "dongu" tipi: A'daki her kalkış için sonraki ilk B durağı.
  // Arada gemi yine A'ya uğruyorsa daha geç A kalkışı kullanılır.
  function donguAra(hat, gun, a, b) {
    const saat = hat.saatler[gun], d = hat.duraklar, sonuc = [];
    if (!saat) return sonuc;
    for (let i = 0; i < d.length; i++) {
      if (d[i] !== a || !saat[i]) continue;
      for (let j = i + 1; j < d.length; j++) {
        if (!saat[j]) continue;
        if (d[j] === a) break;
        if (d[j] === b) {
          const ara = [];
          for (let k = i + 1; k < j; k++) if (saat[k]) ara.push(d[k]);
          sonuc.push({ hat, kalkis: saat[i], varis: saat[j], varisKesin: j === d.length - 1, ara });
          break;
        }
      }
    }
    return sonuc;
  }

  // "kalkislar" tipi: A'dan kalkan ve uğrak listesinde B olan seferler (varış saati tarifede yok).
  function kalkisAra(hat, gun, a, b) {
    return hat.kalkislar
      .filter(s => s.gunler.includes(gun) && s.kalkis === a && s.duraklar.includes(b))
      .map(s => ({ hat, kalkis: s.saat, varis: null, ara: s.duraklar.slice(0, s.duraklar.indexOf(b)), sonra: s.duraklar.slice(s.duraklar.indexOf(b) + 1) }));
  }

  // "seferler" tipi: her seferde A'dan sonraki ilk B. Arada yine A varsa daha geç A kullanılır.
  function seferlerAra(hat, gun, a, b) {
    const sonuc = [];
    hat.seferler.filter(s => s.gunler.includes(gun)).forEach(s => {
      const d = s.duraklar;
      for (let i = 0; i < d.length - 1; i++) {
        if (d[i][0] !== a) continue;
        for (let j = i + 1; j < d.length; j++) {
          if (d[j][0] === a) break;
          if (d[j][0] === b) {
            sonuc.push({ hat, kalkis: d[i][2], varis: d[j][1], varisKesin: true, gemi: s.gemi,
              ara: d.slice(i + 1, j).map(x => x[0]) });
            break;
          }
        }
      }
    });
    return sonuc;
  }

  const ARAYICILAR = { dongu: donguAra, kalkislar: kalkisAra, seferler: seferlerAra };
  const siraSaati = s => s.kalkis || s.varis || "99:99";

  // Filtreye göre gösterilecek hatlar
  function aktifHatlar(veri, filtre) {
    const f = filtre || {}, kapali = f.kapaliFirmalar || [];
    return veri.hatlar.filter(h => !kapali.includes(h.id) && (!f.sadeceArac || h.arac));
  }

  // A -> B, seçilen gün: tüm firmaların seferleri, kalkış saatine göre sıralı
  function seferBul(veri, gun, a, b, filtre) {
    return aktifHatlar(veri, filtre)
      .flatMap(h => ARAYICILAR[h.tip] ? ARAYICILAR[h.tip](h, gun, a, b) : [])
      .sort((x, y) => siraSaati(x).localeCompare(siraSaati(y)));
  }

  // Seçilen gün A'dan sefer bulunan varış iskeleleri (Set)
  function gidilebilir(veri, gun, a, filtre) {
    const hedef = new Set();
    Object.keys(veri.iskeleler).forEach(b => { if (b !== a && seferBul(veri, gun, a, b, filtre).length) hedef.add(b); });
    return hedef;
  }

  // Tarifelerde geçen tüm iskele kodları, iskele adına göre sıralı
  function tumIskeleler(veri) {
    const s = new Set();
    veri.hatlar.forEach(h => {
      if (h.tip === "dongu") h.duraklar.forEach(d => s.add(d));
      else if (h.tip === "kalkislar") h.kalkislar.forEach(k => { s.add(k.kalkis); k.duraklar.forEach(d => s.add(d)); });
      else if (h.tip === "seferler") h.seferler.forEach(k => k.duraklar.forEach(d => s.add(d[0])));
    });
    const ad = k => veri.iskeleler[k] || k;
    return [...s].sort((x, y) => ad(x).localeCompare(ad(y), "tr"));
  }

  // Bir seferde aranacak numara: kalkış iskelesinin gişesi, yoksa firmanın genel numarası.
  // Sonuç: { numara, etiket, tel } (tel: "tel:" bağlantısında kullanılacak biçim) ya da null
  function seferTelefonu(veri, hat, iskele) {
    const t = hat.telefon || {};
    let numara, etiket;
    if (t.iskele && t.iskele[iskele]) { numara = t.iskele[iskele]; etiket = `${veri.iskeleler[iskele] || iskele} gişe`; }
    else if (t.genel) { numara = t.genel; etiket = t.genelAd || ""; }
    else return null;
    // "0541 960 99 33" -> +905419609933, "444 0 752" -> 4440752
    const rakam = numara.replace(/\D/g, "");
    return { numara, etiket, tel: rakam.startsWith("0") ? "+90" + rakam.slice(1) : rakam };
  }

  // Bugünün gün numarası (0=Pazartesi)
  const bugunGun = (tarih) => ((tarih || new Date()).getDay() + 6) % 7;

  // "2026-11-25T21:56" -> "25.11.2026"
  const trTarih = s => s ? s.slice(0, 10).split("-").reverse().join(".") : "";

  // Firmaların sitesinden saatte bir çekilen tarifeleri (data/tarifeler.js) elle girilmiş verinin üzerine uygular.
  // Okunamayan firmada elle girilmiş saatler kalır ve hat.uyari ile kullanıcıya not gösterilir.
  function tarifeUygula(veri, tarife) {
    if (!tarife || !tarife.hatlar) return veri;
    const hatlar = veri.hatlar.map(h => {
      const t = tarife.hatlar[h.id];
      if (!t) return h;
      const k = Object.assign({}, h, { tarifeDurum: t.durum });
      if (t.durum === "ok" || t.durum === "eski") {
        if (h.tip === "dongu" && t.duraklar && t.saatler) { k.duraklar = t.duraklar; k.saatler = t.saatler; }
        if (h.tip === "seferler" && t.seferler) k.seferler = t.seferler;
      }
      if (t.durum === "ok" && h.tip !== "kalkislar") k.tarife = "Firmanın sitesinden saatte bir otomatik alınır";
      if (t.durum === "eski") k.uyari = `Tarife ${trTarih(t.sonBasarili)} tarihinde firmanın sitesinden alındı; kesin saat için firmayı arayın.`;
      if (t.durum === "hata") k.uyari = "Tarife şu an firmanın sitesinden alınamadı; kesin saat için firmayı arayın.";
      if (t.durum === "yeni-gorsel") k.uyari = "Firma yeni bir tarife yayımladı, bu saatler henüz güncellenmedi; kesin saat için firmayı arayın.";
      return k;
    });
    return Object.assign({}, veri, { hatlar, guncelleme: tarife.guncelleme ? tarife.guncelleme.slice(0, 10) : veri.guncelleme });
  }

  return { donguAra, kalkisAra, seferlerAra, ARAYICILAR, aktifHatlar, seferBul, gidilebilir, tumIskeleler, seferTelefonu, bugunGun, tarifeUygula };
});
