// Ada rehberi: önemli telefonlar, muhtarlıklar ve ada içi ulaşım (elle girilir).
// Yalnızca resmi kaynaklardan doğrulanan bilgiler girilir; her bölümün kaynağı ve kontrol tarihi "kaynaklar"da yazar.
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
    { baslik: "Resmi kurumlar", kalemler: [
      { ad: "Marmara Kaymakamlığı", tel: "0266 885 50 06" },
      { ad: "Marmara Belediyesi", tel: "0266 885 54 89|0266 885 50 50" },
      { ad: "Marmara Adliyesi", tel: "0266 885 51 18" },
      { ad: "Sosyal Yardımlaşma Vakfı (SYDV)", tel: "0266 885 56 60" },
      { ad: "Müftülük", tel: "0266 885 54 32" },
      { ad: "Milli Eğitim Müdürlüğü", tel: "0266 885 58 59" },
      { ad: "Tapu Müdürlüğü", tel: "0266 280 11 14" },
      { ad: "Mal Müdürlüğü", tel: "0266 885 59 96" },
      { ad: "İlçe Tarım", tel: "0266 885 53 94" }
    ] },
    { baslik: "Altyapı ve hizmetler", kalemler: [
      { ad: "BASKİ (su)", tel: "0266 885 57 50" },
      { ad: "TEDAŞ İşletme Şefliği (elektrik)", tel: "0266 202 22 27" },
      { ad: "PTT", tel: "0266 885 55 01" },
      { ad: "Ziraat Bankası", tel: "0266 885 51 83" }
    ] }
  ];

  // Adalar arası ve adaya deniz ulaşımı (Kaynak: Marmara Belediyesi "Ulaşım" sayfası)
  const DENIZ = { baslik: "Adalar arası deniz ulaşımı", kalemler: [
    { ad: "Gestaş", tel: "444 0 752" },
    { ad: "Marmara RoRo", tel: "0541 960 99 33" },
    { ad: "İDO", tel: "0850 222 44 36" },
    { ad: "Adalar 1", tel: "0554 342 52 57" },
    { ad: "Yavuz Naz", tel: "0535 962 77 42" },
    { ad: "Ömer Kaptan", tel: "0266 896 11 01" }
  ] };

  const KAYNAK_MB_TEL = { ad: "Marmara Belediyesi · Önemli Telefonlar", url: "https://www.marmara.bel.tr/sayfalar/onemli-telefonlar", tarih: "2026-11-25" };
  const KAYNAK_MB_ULASIM = { ad: "Marmara Belediyesi · Ulaşım", url: "https://www.marmara.bel.tr/sayfalar/ulasim", tarih: "2026-11-25" };
  const KAYNAK_MB_MUHTAR = { ad: "Marmara Belediyesi · Muhtarlıklar", url: "https://www.marmara.bel.tr/gunluk-bilgi/muhtarlar", tarih: "2026-11-25" };

  const DOLMUS_YOK = "Dolmuş güzergâh ve saatleri belediye ya da kooperatif tarafından internette yayımlanmıyor. "
    + "Yaz sezonunda iskeleden köylere dolmuş çalışır, kalkışlar genelde gemi saatlerine göre ayarlanır. "
    + "Güncel saat için iskeledeki dolmuş durağına ya da belediyeye sorun.";

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
        gruplar: [
          { baslik: "Ada içinde", kalemler: [
            { ad: "Ekinlik Mahallesi muhtarlığı", tel: "", not: "Telefon yayımlanmamış; Marmara Belediyesi üzerinden ulaşılabilir" }
          ] },
          ...MARMARA_ILCE, DENIZ
        ],
        muhtarlar: [{ mahalle: "Ekinlik", muhtar: "Kenan Şengül" }],
        ulasim: { metin: "Ekinlik için yayımlanmış bir dolmuş hattı ya da saati bulunamadı. Adaya ulaşım Gestaş seferleriyledir." },
        kaynaklar: [KAYNAK_MB_TEL, KAYNAK_MB_ULASIM, KAYNAK_MB_MUHTAR]
      },

      marmara: {
        ilce: "Marmara",
        gruplar: [
          { baslik: "Ada içinde", kalemler: [
            { ad: "Saraylar Ek Hizmet Binası (belediye)", tel: "0266 887 73 35" }
          ] },
          ...MARMARA_ILCE, DENIZ
        ],
        muhtarlar: [
          { mahalle: "Okullar", muhtar: "Metin Can" },
          { mahalle: "Cumhuriyet", muhtar: "Yüksel Karakurt" },
          { mahalle: "Hürriyet", muhtar: "Volkan Dinçer" },
          { mahalle: "Yenimahalle", muhtar: "Emre Birinci" },
          { mahalle: "Çınarlı", muhtar: "Bekir Köse" },
          { mahalle: "Gündoğdu", muhtar: "Fehmi Bayraktar" },
          { mahalle: "Topağaç", muhtar: "Ramazan Dağ" },
          { mahalle: "Asmalı", muhtar: "Yavuz Balta" },
          { mahalle: "Saraylar", muhtar: "Recep Budak" },
          { mahalle: "Abroz", muhtar: "Sultan Yıldız" }
        ],
        ulasim: { metin: DOLMUS_YOK + " Kışın taksi daha yaygın." },
        kaynaklar: [KAYNAK_MB_TEL, KAYNAK_MB_ULASIM, KAYNAK_MB_MUHTAR]
      },

      avsa: {
        ilce: "Marmara",
        gruplar: [
          { baslik: "Ada içinde", kalemler: [
            { ad: "Avşa Ek Hizmet Binası (belediye)", tel: "0266 896 33 01" }
          ] },
          ...MARMARA_ILCE, DENIZ
        ],
        muhtarlar: [
          { mahalle: "Avşa", muhtar: "Bintuğ Yasakçı" },
          { mahalle: "Deniz", muhtar: "Huzur Üstün" },
          { mahalle: "Yiğitler", muhtar: "Korhan Uygut" }
        ],
        ulasim: { metin: DOLMUS_YOK },
        kaynaklar: [KAYNAK_MB_TEL, KAYNAK_MB_ULASIM, KAYNAK_MB_MUHTAR]
      },

      pasalimani: {
        ilce: "Erdek",
        gruplar: [
          { baslik: "Resmi kurumlar", kalemler: [
            { ad: "Erdek Kaymakamlığı", tel: "0266 835 10 01" }
          ] },
          { baslik: "Adaya deniz ulaşımı", kalemler: [{ ad: "Gestaş", tel: "444 0 752" }] }
        ],
        muhtarlar: [
          { mahalle: "Paşalimanı", muhtar: "Hasan Hüseyin Uçar" },
          { mahalle: "Balıklı", muhtar: "Deniz Kıran" },
          { mahalle: "Harmanlı", muhtar: "Cemal Ülker" },
          { mahalle: "Poyrazlı", muhtar: "Nihat Karışık" }
        ],
        ulasim: { metin: "Paşalimanı için yayımlanmış bir dolmuş hattı ya da saati bulunamadı. Köyler arası ulaşım için muhtarlıklara danışın." },
        not: "Paşalimanı Erdek ilçesine bağlıdır; ada için ayrı bir hastane ya da belediye birimi listelenmiyor. Acil durumda 112'yi arayın.",
        kaynaklar: [
          { ad: "Erdek Kaymakamlığı · İletişim", url: "https://www.erdek.gov.tr/iletisim1", tarih: "2026-11-25" },
          { ad: "Erdek Belediyesi · Muhtarlıklarımız", url: "https://www.erdek.bel.tr/muhtarliklarimiz", tarih: "2026-11-25" }
        ]
      }
    }
  };
})();
