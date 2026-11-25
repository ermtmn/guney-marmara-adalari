// Ada rehberi: adalar için önemli telefonlar, tek liste (elle girilir).
// Yalnızca resmi kaynaklardan doğrulanan bilgiler girilir; kaynak ve kontrol tarihi "kaynaklar"da yazar.
// Nöbetçi eczaneler ayrı dosyada: data/eczane.js (scripts/eczane-guncelle.ps1 her gün otomatik çeker).
//
// Telefon kalemi: { ad, tel, not }  (tel: "0266 885 50 06" gibi; birden çok numara "|" ile ayrılır)

window.REHBER_VERISI = {
  guncelleme: "2026-11-25",

  // Her yerde geçerli acil numaralar
  acil: [
    { ad: "Acil Çağrı (ambulans, itfaiye, polis, jandarma)", tel: "112" },
    { ad: "Sahil Güvenlik", tel: "158" },
    { ad: "Sağlık Bakanlığı bilgi hattı (hastane, eczane)", tel: "182" }
  ],

  gruplar: [
    { baslik: "Sağlık", kalemler: [
      { ad: "Marmara İlçe Hastanesi", tel: "0266 885 60 60", not: "Marmara Adası merkez" },
      { ad: "Avşa Aile Sağlığı Merkezi (sağlık ocağı)", tel: "0266 896 12 62", not: "Avşa Mahallesi" }
    ] },
    { baslik: "Güvenlik ve deniz", kalemler: [
      { ad: "Marmara İlçe Jandarma Komutanlığı", tel: "0266 885 56 16" },
      { ad: "Marmara İlçe Emniyet Amirliği", tel: "0266 885 61 78" },
      { ad: "Kıyı Emniyet", tel: "0266 885 56 20" },
      { ad: "Marmara Liman Başkanlığı", tel: "0266 885 59 95" }
    ] },
    { baslik: "Belediye hizmet binaları", kalemler: [
      { ad: "Avşa Ek Hizmet Binası", tel: "0266 896 33 01" },
      { ad: "Saraylar Ek Hizmet Binası", tel: "0266 887 73 35", not: "Marmara Adası" }
    ] },
    { baslik: "Altyapı ve hizmetler", kalemler: [
      { ad: "BASKİ (su)", tel: "0266 885 57 50" },
      { ad: "TEDAŞ İşletme Şefliği (elektrik)", tel: "0266 202 22 27" },
      { ad: "PTT", tel: "0266 885 55 01" },
      { ad: "Ziraat Bankası", tel: "0266 885 51 83" }
    ] }
  ],

  not: "Marmara, Avşa ve Ekinlik Marmara ilçesine, Paşalimanı Erdek ilçesine bağlıdır. Paşalimanı için ayrı bir sağlık birimi listelenmiyor; acil durumda 112'yi arayın.",

  kaynaklar: [
    { ad: "Marmara Belediyesi · Önemli Telefonlar", url: "https://www.marmara.bel.tr/sayfalar/onemli-telefonlar", tarih: "2026-11-25" },
    { ad: "Balıkesir İl Sağlık Müdürlüğü · Aile Sağlığı Merkezleri", url: "https://balikesirism.saglik.gov.tr/TR-128167/aile-sagligi-merkezleri-asm.html", tarih: "2026-11-25" }
  ]
};
