// Ada rehberi: önemli telefonlar (elle girilir).
// Yalnızca resmi kaynaklardan doğrulanan bilgiler girilir; her adanın kaynağı ve kontrol tarihi "kaynaklar"da yazar.
// Nöbetçi eczaneler ayrı dosyada: data/eczane.js (scripts/eczane-guncelle.ps1 her gün otomatik çeker).
//
// Ada anahtarları data/adalar.js'teki id'lerle aynıdır: ekinlik, marmara, avsa, pasalimani.
// Telefon kalemi: { ad, tel, not }  (tel: "0266 885 50 06" gibi; birden çok numara "|" ile ayrılır)

(function () {
  // Marmara ilçesine bağlı adalarda (Marmara, Avşa, Ekinlik) ortak ilçe kurumları
  // Kaynak: Marmara Belediyesi "Önemli Telefonlar" sayfası
  const MARMARA_ILCE = [
    { baslik: "Sağlık ve güvenlik", kalemler: [
      { ad: "Marmara İlçe Hastanesi", tel: "0266 885 60 60", not: "Marmara Adası merkez" },
      { ad: "İlçe Jandarma Komutanlığı", tel: "0266 885 56 16" },
      { ad: "İlçe Emniyet Amirliği", tel: "0266 885 61 78" },
      { ad: "Kıyı Emniyet", tel: "0266 885 56 20" },
      { ad: "Liman Başkanlığı", tel: "0266 885 59 95" }
    ] },
    { baslik: "Altyapı ve hizmetler", kalemler: [
      { ad: "BASKİ (su)", tel: "0266 885 57 50" },
      { ad: "TEDAŞ İşletme Şefliği (elektrik)", tel: "0266 202 22 27" },
      { ad: "PTT", tel: "0266 885 55 01" },
      { ad: "Ziraat Bankası", tel: "0266 885 51 83" }
    ] }
  ];

  const KAYNAK_MB_TEL = { ad: "Marmara Belediyesi · Önemli Telefonlar", url: "https://www.marmara.bel.tr/sayfalar/onemli-telefonlar", tarih: "2026-11-25" };
  const KAYNAK_ISM_ASM = { ad: "Balıkesir İl Sağlık Müdürlüğü · Aile Sağlığı Merkezleri", url: "https://balikesirism.saglik.gov.tr/TR-128167/aile-sagligi-merkezleri-asm.html", tarih: "2026-11-25" };

  window.REHBER_VERISI = {
    guncelleme: "2026-11-25",

    // Her yerde geçerli acil numaralar
    acil: [
      { ad: "Acil Çağrı (ambulans, itfaiye, polis, jandarma)", tel: "112" },
      { ad: "Sahil Güvenlik", tel: "158" },
      { ad: "Sağlık Bakanlığı bilgi hattı (hastane, eczane)", tel: "182" }
    ],

    adalar: {
      ekinlik: {
        ilce: "Marmara",
        gruplar: [...MARMARA_ILCE],
        kaynaklar: [KAYNAK_MB_TEL]
      },

      marmara: {
        ilce: "Marmara",
        gruplar: [
          { baslik: "Ada içinde", kalemler: [
            { ad: "Saraylar Ek Hizmet Binası (belediye)", tel: "0266 887 73 35" }
          ] },
          ...MARMARA_ILCE
        ],
        kaynaklar: [KAYNAK_MB_TEL]
      },

      avsa: {
        ilce: "Marmara",
        gruplar: [
          { baslik: "Ada içinde", kalemler: [
            { ad: "Avşa Aile Sağlığı Merkezi (sağlık ocağı)", tel: "0266 896 12 62", not: "Marmara 03 Nolu Avşa Nebahat Tanor ASM · Avşa Mahallesi" },
            { ad: "Avşa Ek Hizmet Binası (belediye)", tel: "0266 896 33 01" }
          ] },
          ...MARMARA_ILCE
        ],
        kaynaklar: [KAYNAK_MB_TEL, KAYNAK_ISM_ASM]
      },

      pasalimani: {
        ilce: "Erdek",
        gruplar: [],
        not: "Paşalimanı Erdek ilçesine bağlıdır; ada için ayrı bir hastane ya da sağlık birimi listelenmiyor. Acil durumda 112'yi arayın.",
        kaynaklar: []
      }
    }
  };
})();
