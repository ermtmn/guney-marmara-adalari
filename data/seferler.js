// Sefer verisi. Her işletmeci/hat "hatlar" listesinde bir kayıttır.
// Gün numaraları: 0=Pazartesi, 1=Salı, 2=Çarşamba, 3=Perşembe, 4=Cuma, 5=Cumartesi, 6=Pazar.
//
// İki tarife biçimi var:
//  tip "dongu"    : Bir gemi gün içinde sırayla iskelelere uğrar (Gestaş).
//                   "duraklar" sırası + her gün için aynı sırada "saatler" (null = uğramıyor).
//                   Son durak varış saati, diğerleri kalkış saati.
//  tip "kalkislar": İskele bazlı kalkış listesi (Marmara RoRo).
//                   Her kayıt: hangi günler, saat, kalkış iskelesi, uğradığı iskeleler (sırayla).
//                   Tarifede varış saati yok.
//  tip "seferler" : Her sefer için iskeleler sırasıyla varış ve kalkış saatiyle (CNR RoRo).
//
// "arac": true ise gemi araç da taşır (feribot / ro-ro).
// "telefon": iskele gişe numaraları (iskele kodu: numara) ve/veya genel numara.
//            Telefonlar firmaların kendi sitelerinden alınmıştır (25.11.2026).
//
// İDO: 25.11.2026 kontrolünde ido.com.tr liman listesinde Avşa/Marmara/Tekirdağ yok
//      (ada seferleri yaz sezonuna özel). Sezon açılınca eklenecek.

const HER_GUN = [0, 1, 2, 3, 4, 5, 6];
const HAFTA_ICI = [0, 1, 2, 3, 4];

window.SEFER_VERISI = {
  guncelleme: "2026-11-25",

  // Günlük hava tahmini için iskelenin bağlı olduğu MGM istasyonu (ilçe).
  // Avşa, Ekinlik ve Saraylar Marmara ilçesine, Paşalimanı (Balıklı) Erdek ilçesine bağlıdır. Badalan için istasyon yok.
  mgmIstasyon: {
    ERDEK: "91008", MARMARA: "91018", AVSA: "91018", EKINLIK: "91018", SARAYLAR: "91018", BALIKLI: "91008",
    BANDIRMA: "91003", TEKIRDAG: "95901"
  },

  // Tüm iskeleler (kod: görünen ad)
  iskeleler: {
    AVSA: "Avşa",
    EKINLIK: "Ekinlik",
    MARMARA: "Marmara",
    SARAYLAR: "Saraylar (Marmara Adası)",
    BALIKLI: "Paşalimanı (Balıklı)",
    BADALAN: "Badalan",
    ERDEK: "Erdek",
    TEKIRDAG: "Tekirdağ (Ceyport)",
    BANDIRMA: "Bandırma"
  },

  hatlar: [
    {
      id: "gestas",
      tip: "dongu",
      isletmeci: "Gestaş",
      renk: "#0b6fa4",
      arac: true,
      ad: "Güney Marmara Adalar Hattı",
      aciklama: "Erdek - Avşa - Marmara - Paşalimanı (Balıklı) - Ekinlik",
      tarife: "Yürürlük tarihi belirtilmemiş",
      kaynak: "https://gdu.com.tr/sefer-tarifeleri",
      duyurular: "https://www.gdu.com.tr/gduonline/duyurular",
      bilet: "https://online.gdu.com.tr/bilet-al#bilet",
      telefon: { genel: "444 0 752", genelAd: "Çağrı merkezi (7/24)", iskele: {} },
      duraklar: [
        "AVSA", "EKINLIK", "MARMARA", "BALIKLI", "ERDEK", "BALIKLI", "AVSA", "EKINLIK", "MARMARA",
        "EKINLIK", "AVSA", "BALIKLI", "ERDEK", "BALIKLI", "MARMARA", "EKINLIK", "AVSA"
      ],
      saatler: [
        // Pazartesi
        ["06:00", "06:20", "07:00", "08:00", "11:00", "12:00", "13:00", "13:20", "16:00", "16:30", "17:00", "18:00", "19:30", "20:30", "21:30", "22:00", "22:15"],
        // Salı
        ["06:00", null, "06:45", "07:45", "11:00", "12:00", "13:00", null, "16:00", null, "16:45", "17:45", "19:15", "20:15", "21:15", null, "22:00"],
        // Çarşamba
        ["06:00", null, "06:45", "07:45", "11:00", "12:00", "13:00", null, "16:00", null, "16:45", "17:45", "19:15", "20:15", "21:15", null, "22:00"],
        // Perşembe
        ["06:00", "06:20", "07:00", "08:00", "11:00", "12:00", "13:00", "13:20", "16:00", "16:30", "17:00", "18:00", "19:30", "20:30", "21:30", "22:00", "22:15"],
        // Cuma
        ["06:00", null, "06:45", "07:45", "11:00", "12:00", "13:00", null, "16:00", null, "16:45", "17:45", "19:15", "20:15", "21:15", "21:45", "22:00"],
        // Cumartesi
        ["06:00", null, "06:45", "07:45", "11:00", "12:00", "13:00", null, "16:00", null, "16:45", "17:45", "19:15", "20:15", "21:15", null, "22:00"],
        // Pazar
        ["06:00", null, "06:45", null, "11:00", "12:00", "13:00", null, "16:00", "16:30", "17:00", "18:00", "19:30", null, "21:00", null, "21:45"]
      ]
    },

    {
      id: "marmara-roro",
      tip: "kalkislar",
      isletmeci: "Marmara RoRo",
      renk: "#c8372d",
      arac: true,
      ad: "Marmara RoRo",
      aciklama: "Tekirdağ - Erdek - Marmara Adası - Avşa - Bandırma",
      tarife: "01.11.2026 tarihli kış tarifesi",
      kaynak: "https://www.marmararoro.com/seferlerimiz.html",
      duyurular: "https://www.marmararoro.com/seferlerimiz.html",
      bilet: "https://bilet.erdekroro.com/",
      telefon: {
        iskele: {
          ERDEK: "0541 960 99 33", TEKIRDAG: "0541 960 99 66", MARMARA: "0530 042 18 41",
          SARAYLAR: "0530 042 18 42", AVSA: "0530 042 18 47", BANDIRMA: "0533 059 60 93"
        }
      },
      kalkislar: [
        // Tekirdağ Ceyport Limanı
        { gunler: [2], saat: "03:00", kalkis: "TEKIRDAG", duraklar: ["SARAYLAR"] },
        { gunler: HER_GUN, saat: "10:00", kalkis: "TEKIRDAG", duraklar: ["SARAYLAR"] },
        { gunler: HER_GUN, saat: "16:00", kalkis: "TEKIRDAG", duraklar: ["SARAYLAR", "ERDEK"] },
        { gunler: HAFTA_ICI, saat: "16:00", kalkis: "TEKIRDAG", duraklar: ["BANDIRMA"] },
        { gunler: [0, 1, 2, 3, 5], saat: "17:00", kalkis: "TEKIRDAG", duraklar: ["MARMARA", "ERDEK"] },
        { gunler: [4, 6], saat: "16:00", kalkis: "TEKIRDAG", duraklar: ["MARMARA", "AVSA", "ERDEK"] },
        { gunler: HAFTA_ICI, saat: "21:00", kalkis: "TEKIRDAG", duraklar: ["ERDEK"] },
        { gunler: HAFTA_ICI, saat: "23:00", kalkis: "TEKIRDAG", duraklar: ["ERDEK"] },

        // Erdek İskelesi
        { gunler: HER_GUN, saat: "02:30", kalkis: "ERDEK", duraklar: ["SARAYLAR"] },
        { gunler: HER_GUN, saat: "05:00", kalkis: "ERDEK", duraklar: ["SARAYLAR", "TEKIRDAG"] },
        { gunler: [2, 4, 6], saat: "05:30", kalkis: "ERDEK", duraklar: ["BADALAN"] },
        { gunler: [0], saat: "15:30", kalkis: "ERDEK", duraklar: ["SARAYLAR", "TEKIRDAG"] },
        { gunler: [0, 1, 2, 3, 5], saat: "17:00", kalkis: "ERDEK", duraklar: ["MARMARA", "TEKIRDAG"] },
        { gunler: [4, 6], saat: "17:00", kalkis: "ERDEK", duraklar: ["AVSA", "MARMARA", "TEKIRDAG"] },
        { gunler: HAFTA_ICI, saat: "23:00", kalkis: "ERDEK", duraklar: ["TEKIRDAG"] },

        // Marmara İskelesi
        { gunler: [0, 1, 2, 3, 5], saat: "18:40", kalkis: "MARMARA", duraklar: ["TEKIRDAG"] },
        { gunler: [4, 6], saat: "19:40", kalkis: "MARMARA", duraklar: ["TEKIRDAG"] },
        { gunler: [0, 1, 2, 3, 5], saat: "19:20", kalkis: "MARMARA", duraklar: ["ERDEK"] },
        { gunler: [4, 6], saat: "18:20", kalkis: "MARMARA", duraklar: ["AVSA", "ERDEK"] },

        // Saraylar İskelesi
        { gunler: [0], saat: "06:30", kalkis: "SARAYLAR", duraklar: ["ERDEK"] },
        { gunler: HER_GUN, saat: "08:00", kalkis: "SARAYLAR", duraklar: ["TEKIRDAG"] },
        { gunler: [0, 1, 2, 3, 5, 6], saat: "13:30", kalkis: "SARAYLAR", duraklar: ["ERDEK"] },
        { gunler: [2], saat: "14:00", kalkis: "SARAYLAR", duraklar: ["TEKIRDAG"] },
        { gunler: [1, 2, 3, 4, 5, 6], saat: "16:00", kalkis: "SARAYLAR", duraklar: ["TEKIRDAG"] },
        { gunler: [0], saat: "18:15", kalkis: "SARAYLAR", duraklar: ["TEKIRDAG"] },
        { gunler: HER_GUN, saat: "19:00", kalkis: "SARAYLAR", duraklar: ["ERDEK"] },

        // Avşa İskelesi
        { gunler: [4, 6], saat: "19:00", kalkis: "AVSA", duraklar: ["MARMARA", "TEKIRDAG"] },
        { gunler: [4, 6], saat: "19:00", kalkis: "AVSA", duraklar: ["ERDEK"] },

        // Badalan İskelesi
        { gunler: [2, 4, 6], saat: "13:00", kalkis: "BADALAN", duraklar: ["ERDEK"] },

        // Bandırma Limanı
        { gunler: HAFTA_ICI, saat: "23:00", kalkis: "BANDIRMA", duraklar: ["TEKIRDAG"] }
      ],
      notlar: ["Gerekli hallerde (aşırı yoğunluk, geminin bir tarafta kalması gibi) ek sefer düzenlenir."]
    },

    {
      id: "cnr-roro",
      tip: "seferler",
      isletmeci: "CNR RoRo",
      renk: "#c26a00",
      arac: true,
      ad: "Ciner Ro-Ro",
      aciklama: "Erdek - Marmara - Avşa · Saraylar - Bandırma · Tekirdağ - Avşa",
      tarife: "Sitede tarih ve gün bilgisi yok, her gün geçerli kabul edildi",
      kaynak: "https://cnrroro.com/#saatler",
      duyurular: "https://cnrroro.com/",
      bilet: "https://ciner.biletin.org",
      telefon: {
        iskele: {
          BANDIRMA: "0533 457 80 09", SARAYLAR: "0533 457 50 09", TEKIRDAG: "0536 833 22 53",
          MARMARA: "0536 833 22 46", AVSA: "0530 942 00 11", ERDEK: "0530 942 00 44"
        }
      },
      // Her sefer: hangi günler, gemi adı, iskeleler sırasıyla [iskele, varış, kalkış] (null = yok)
      seferler: [
        { gunler: HER_GUN, gemi: "Aydın Kaptan 2 (sabah)", duraklar: [
          ["ERDEK", null, "07:30"], ["MARMARA", "09:00", "09:15"], ["AVSA", "09:45", "11:00"],
          ["MARMARA", "11:30", "12:00"], ["ERDEK", "13:30", null]] },
        { gunler: HER_GUN, gemi: "Aydın Kaptan 2 (akşam)", duraklar: [
          ["ERDEK", null, "14:30"], ["MARMARA", "16:00", "16:15"], ["AVSA", "16:45", "17:00"],
          ["MARMARA", "17:30", "17:45"], ["ERDEK", "19:15", null]] },
        { gunler: HER_GUN, gemi: "Saraylar - Bandırma", duraklar: [
          ["BANDIRMA", null, "04:00"], ["SARAYLAR", "07:00", "09:00"], ["BANDIRMA", "12:00", "13:30"],
          ["SARAYLAR", "16:30", "17:30"], ["BANDIRMA", "20:30", null]] },
        // Sitede Avşa'dan dönüş kalkış saati yazmıyor.
        { gunler: HER_GUN, gemi: "Adalar 1", duraklar: [
          ["TEKIRDAG", null, "12:00"], ["AVSA", "14:30", null], ["TEKIRDAG", "18:30", null]] }
      ]
    }
  ]
};
