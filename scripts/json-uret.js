// data/*.js dosyalarını mobil uygulamanın okuyacağı düz JSON'a çevirir: api/v1/*.json
// Site data/*.js dosyalarını kullanmaya devam eder; elle düzenlenecek yer yine data/ klasörüdür.
// Çalıştırma: node scripts/json-uret.js   (GitHub Actions her veri güncellemesinde çalıştırır)
//
// Uygulama adresleri (GitHub Pages):
//   https://ermtmn.github.io/guney-marmara-adalari/api/v1/index.json   (dosya listesi ve güncelleme zamanları)
//   .../api/v1/seferler.json  adalar.json  dernekler.json  duyurular.json  hava.json
// Dosyalardaki "assets/..." gibi göreli yollar tabanAdres ile birleştirilir.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const kok = path.join(__dirname, "..");
const hedef = path.join(kok, "api", "v1");
const TABAN = "https://ermtmn.github.io/guney-marmara-adalari/";

// dosya -> içinde tanımlanan window değişkeni
const KAYNAKLAR = {
  seferler: "SEFER_VERISI",
  adalar: "ADA_VERISI",
  dernekler: "DERNEK_VERISI",
  duyurular: "DUYURU_VERISI",
  hava: "HAVA_VERISI",
  tarifeler: "TARIFE_VERISI",
};
const Motor = require(path.join(kok, "assets", "sefer-motoru.js"));
const okunan = {};

fs.mkdirSync(hedef, { recursive: true });

const liste = {};
for (const [ad, degisken] of Object.entries(KAYNAKLAR)) {
  const kaynak = path.join(kok, "data", ad + ".js");
  const window = {};
  vm.runInNewContext(fs.readFileSync(kaynak, "utf8"), { window }, { filename: kaynak });
  okunan[ad] = window[degisken];
  if (!okunan[ad]) throw new Error(`${ad}.js içinde window.${degisken} bulunamadı`);
}

for (const ad of Object.keys(KAYNAKLAR)) {
  // seferler.json: elle girilmiş veri + siteden çekilen güncel tarifeler (uygulama doğrudan bunu kullanır)
  const veri = ad === "seferler" ? Motor.tarifeUygula(okunan.seferler, okunan.tarifeler) : okunan[ad];

  const metin = JSON.stringify(veri, null, 1) + "\n";
  const dosya = path.join(hedef, ad + ".json");
  // İçerik değişmediyse dosyaya dokunma (gereksiz commit olmasın)
  if (!fs.existsSync(dosya) || fs.readFileSync(dosya, "utf8") !== metin) fs.writeFileSync(dosya, metin);
  liste[ad] = { adres: `api/v1/${ad}.json`, guncelleme: veri.guncelleme || null };
  console.log(`api/v1/${ad}.json`);
}

const index = JSON.stringify({ surum: 1, tabanAdres: TABAN, motor: "assets/sefer-motoru.js", dosyalar: liste }, null, 1) + "\n";
const indexDosya = path.join(hedef, "index.json");
if (!fs.existsSync(indexDosya) || fs.readFileSync(indexDosya, "utf8") !== index) fs.writeFileSync(indexDosya, index);
console.log("api/v1/index.json");
