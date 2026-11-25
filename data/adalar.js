// Ada tanıtım sayfası verisi. Sıra: Ekinlik, Marmara, Avşa, Paşalimanı.
// iskeleler: sefer verisindeki iskele kodları (seferler.js). Sayfa bu iskelelere sefer yapan firmaları kendisi bulur.
// dernekAdi: dernekler sayfasındaki "ada" değeri (o adanın derneklerine bağlantı için)
window.ADA_VERISI = {
  adalar: [
    {
      id: "ekinlik",
      ad: "Ekinlik Adası",
      slogan: "Marmara’nın Saklı Cenneti",
      simge: "🌾",
      renk: "#2b7a5c",
      ozet: "Erdek Körfezi'nin hemen açığında, yaklaşık 1,5 km²'lik küçük ve samimi bir ada. Kalabalıktan uzak, taş evleri, yel değirmenleri ve dingin koylarıyla yıl boyunca huzur arayanların adresi.",
      bilgiler: [
        ["Bağlı olduğu yer", "Marmara ilçesi, Balıkesir"],
        ["Eski adı", "Koutali (Rumca, \"kaşık\")"],
        ["Büyüklük", "Yaklaşık 1,5 km²"]
      ],
      onecikanlar: [
        "Bizans döneminden beri yerleşim gören adada, o döneme ait bir manastırın kalıntıları bulunuyor.",
        "Adada üç yel değirmeni var; biri 1877 tarihli. Yel değirmeni, adanın ve derneğinin simgesi.",
        "Eski Rum köyünün taş evleri ve dar sokakları, adanın tarihi dokusunu yaşatıyor.",
        "Yazın Uçurtma Festivali, kermes ve açık hava etkinlikleriyle ada halkı ve misafirler bir araya geliyor.",
        "Kalben Çocuk Köyü, devlet koruması altındaki çocuklara her yaz adada bir tatil kampı sunuyor."
      ],
      iskeleler: ["EKINLIK"],
      dernekAdi: "Ekinlik Adası",
      seferNereden: "ERDEK"
    },
    {
      id: "marmara",
      ad: "Marmara Adası",
      slogan: "Mermerin ve zeytinin adası",
      simge: "🏛️",
      renk: "#0b6fa4",
      ozet: "Marmara Denizi'nin en büyük adası ve Marmara ilçesinin merkezi. Antik çağdan bu yana çıkarılan mermeri, zeytinlikleri, sakin köyleri ve kültür etkinlikleriyle adalar arasında en köklü yaşama sahip olanı.",
      bilgiler: [
        ["Bağlı olduğu yer", "Marmara ilçe merkezi, Balıkesir"],
        ["Antik adı", "Prokonnesos"],
        ["Köyleri", "Saraylar, Gündoğdu, Çınarlı, Asmalı, Topağaç"]
      ],
      onecikanlar: [
        "Ada, adını yüzyıllardır işlenen ünlü mermerinden alıyor. Prokonnesos mermeri antik çağda İstanbul başta olmak üzere birçok yapıda kullanıldı.",
        "Saraylar'daki açık hava müzesinde antik döneme ait mermer eserler sergileniyor.",
        "Zeytin, adanın ekonomisinin ve mutfağının temeli. Ada zeytinciliği kooperatif çatısı altında sürdürülüyor.",
        "Her yıl Ağustos'un ilk hafta sonu Marmara Adası Edebiyat Günleri düzenleniyor.",
        "Gündoğdu, Çınarlı, Asmalı ve Topağaç gibi köyler sakin koyları ve doğal yaşamıyla öne çıkıyor."
      ],
      iskeleler: ["MARMARA", "SARAYLAR"],
      dernekAdi: "Marmara Adası",
      seferNereden: "ERDEK"
    },
    {
      id: "avsa",
      ad: "Avşa Adası",
      slogan: "Plajların ve bağların adası",
      simge: "🍇",
      renk: "#c26a00",
      ozet: "İnce kumlu plajları, berrak denizi ve canlı yaz hayatıyla Güney Marmara'nın en bilinen tatil adası. Bağlarında yetişen Adakarası üzümü ve şaraplarıyla da tanınıyor.",
      bilgiler: [
        ["Bağlı olduğu yer", "Marmara ilçesi, Balıkesir"],
        ["Antik adı", "Aphousia"],
        ["Yerleşimler", "Avşa merkez, Yiğitler"]
      ],
      onecikanlar: [
        "Altınkum başta olmak üzere ince kumlu plajları, yaz aylarında adayı en kalabalık tatil noktalarından biri yapıyor.",
        "Adaya özgü Adakarası üzümü ve şarapları adanın simgesi; bağ bozumu döneminde tadım ve etkinlikler yapılıyor.",
        "Bizans döneminde Aphousia adıyla bilinen ada, o dönemde bir sürgün yeri olarak kullanıldı.",
        "Adanın arka yüzündeki Yiğitler köyü, eski taş yapıları ve sakin atmosferiyle merkezin kalabalığından uzak bir köşe."
      ],
      iskeleler: ["AVSA"],
      dernekAdi: "Avşa Adası",
      seferNereden: "ERDEK"
    },
    {
      id: "pasalimani",
      ad: "Paşalimanı Adası",
      slogan: "Sakin köyleri ve doğal koylarıyla saklı ada",
      simge: "⚓",
      renk: "#5b6abf",
      ozet: "Erdek'in hemen açığında, kalabalık turizmden uzak kalmış küçük köyleriyle sakin bir ada. Doğal koyları, zeytinlikleri ve taze balığıyla sessiz bir tatil arayanların gözdesi.",
      bilgiler: [
        ["Bağlı olduğu yer", "Erdek ilçesi, Balıkesir"],
        ["Antik adı", "Halone"],
        ["Köyleri", "Paşalimanı, Harmanlı, Balıklı, Poyrazlı, Tuzla"]
      ],
      onecikanlar: [
        "Adada ilk yerleşimin Kalkolitik çağa uzandığı biliniyor; antik çağdaki adı Halone.",
        "Rivayete göre ada, bugünkü adını Kıbrıs dönüşünde fırtınadan korunmak için buraya sığınan Lala Mustafa Paşa'dan alıyor.",
        "Ada; Paşalimanı, Harmanlı, Balıklı, Poyrazlı ve Tuzla olmak üzere beş küçük köyden oluşuyor.",
        "Yerel zeytin ve zeytinyağı, ada üzümlerinden yapılan şaraplar ve günlük tutulan taze balık ada mutfağının temeli.",
        "Kalabalıktan uzak koyları ve el değmemiş doğasıyla dinlenmek isteyenlerin adası."
      ],
      iskeleler: ["BALIKLI"],
      dernekAdi: "Paşalimanı Adası",
      seferNereden: "ERDEK"
    }
  ]
};
