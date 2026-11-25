# Firmaların sefer tarifelerini kendi sitelerinden çeker ve data/tarifeler.js dosyasına yazar.
# Site bu dosyadaki saatleri data/seferler.js'teki elle girilmiş saatlerin yerine kullanır.
# Çalıştırma (Windows): powershell -ExecutionPolicy Bypass -File C:\Proje\scripts\tarife-guncelle.ps1
# GitHub'da .github/workflows/veri-guncelle.yml saatte bir pwsh ile çalıştırır.
#
# Firma başına durum:
#   ok          : tarife siteden okundu, sitede bu saatler gösterilir
#   eski        : bu sefer okunamadı, en son başarıyla okunan saatler gösterilir
#   hata        : hiç okunamadı, data/seferler.js'teki elle girilmiş saatler gösterilir
#   yeni-gorsel : (Marmara RoRo) tarife resim olarak yayımlanıyor, otomatik okunamaz;
#                 sitede bilinmeyen yeni bir tarife resmi görüldü, elle güncellenmeli
# Yeni bir sorun çıktığında $env:TARIFE_UYARI ile verilen dosyaya açıklama yazılır
# (GitHub iş akışı bu dosyadan bir "issue" açar, depo sahibine e-posta gider).

$ErrorActionPreference = "Stop"
$kok = Split-Path $PSScriptRoot -Parent
$cikti = Join-Path (Join-Path $kok "data") "tarifeler.js"
$seferDosyasi = Join-Path (Join-Path $kok "data") "seferler.js"
$UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
$simdi = (Get-Date).ToString("yyyy-MM-ddTHH:mm")
$tr = [Globalization.CultureInfo]::GetCultureInfo("tr-TR")

function Get-Sayfa([string]$url) {
  $r = Invoke-WebRequest $url -UseBasicParsing -UserAgent $UA -TimeoutSec 30
  [Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray())
}

function ConvertTo-Hucre([string]$html) {
  $t = [System.Net.WebUtility]::HtmlDecode(($html -replace '<[^>]+>', ' '))
  ($t -replace '\s+', ' ').Trim()
}

# Siteden gelen iskele adı -> data/seferler.js iskele kodu. Bilinmeyen ad -> $null
$ISKELE = @{
  AVSA = "AVSA"; EKINLIK = "EKINLIK"; MARMARA = "MARMARA"; BALIKLI = "BALIKLI"; PASALIMANI = "BALIKLI"
  ERDEK = "ERDEK"; SARAYLAR = "SARAYLAR"; BADALAN = "BADALAN"; TEKIRDAG = "TEKIRDAG"; BANDIRMA = "BANDIRMA"
}
function Get-IskeleKodu([string]$ad) {
  $n = $ad -replace '\(.*?\)', '' -replace '(?i)İSKELESİ|LİMANI|CEYPORT', ''
  $n = $n.Replace('İ', 'I').Replace('ı', 'i').Replace('Ş', 'S').Replace('ş', 's').Replace('Ğ', 'G').Replace('ğ', 'g')
  $n = $n.Replace('Ç', 'C').Replace('ç', 'c').Replace('Ö', 'O').Replace('ö', 'o').Replace('Ü', 'U').Replace('ü', 'u')
  $n = ($n -creplace '[^A-Za-z]', '').ToUpperInvariant()
  if ($ISKELE.ContainsKey($n)) { $ISKELE[$n] } else { $null }
}

# "6:00" / "06.00" -> "06:00"; "-", "—", boş -> $null; başka bir şey -> hata
function ConvertTo-Saat([string]$s) {
  if ($s -match '^\s*[-—–]?\s*$') { return $null }
  $m = [regex]::Match($s, '^(\d{1,2})[:.](\d{2})$')
  if (-not $m.Success) { throw "Saat anlaşılamadı: '$s'" }
  "{0:D2}:{1}" -f [int]$m.Groups[1].Value, $m.Groups[2].Value
}

function Get-Satirlar([string]$tablo) {
  foreach ($satir in [regex]::Matches($tablo, '(?is)<tr[^>]*>(.*?)</tr>')) {
    , @([regex]::Matches($satir.Groups[1].Value, '(?is)<t[dh][^>]*>(.*?)</t[dh]>') | ForEach-Object { ConvertTo-Hucre $_.Groups[1].Value })
  }
}

# Önceki çalıştırmanın sonucu (okuma başarısız olursa son başarılı tarife korunur)
$onceki = @{}
if (Test-Path $cikti) {
  try {
    $eski = [IO.File]::ReadAllText($cikti)
    $j = ($eski.Substring($eski.IndexOf("=") + 1).Trim().TrimEnd(";")) | ConvertFrom-Json
    foreach ($p in $j.hatlar.PSObject.Properties) { $onceki[$p.Name] = $p.Value }
  } catch { }
}

$hatlar = [ordered]@{}
$uyarilar = @()

# Okunan tarifeyi kaydet; okunamadıysa son başarılı tarifeyi "eski" olarak koru
function Save-Sonuc($id, $ad, $sonuc, $hataMesaji) {
  $o = $onceki[$id]
  if ($sonuc) {
    $sonuc.durum = "ok"
    $sonuc.sonBasarili = $script:simdi
    # Saatler değiştiyse değişiklik zamanını işaretle
    $yeniIcerik = ($sonuc.Keys | Where-Object { $_ -in "duraklar", "saatler", "seferler" } | ForEach-Object { $sonuc[$_] | ConvertTo-Json -Depth 6 -Compress }) -join "|"
    $eskiIcerik = if ($o) { (@("duraklar", "saatler", "seferler") | Where-Object { $null -ne $o.$_ } | ForEach-Object { $o.$_ | ConvertTo-Json -Depth 6 -Compress }) -join "|" } else { "" }
    $sonuc.sonDegisiklik = if ($o -and $o.sonDegisiklik -and $yeniIcerik -eq $eskiIcerik) { $o.sonDegisiklik } else { $script:simdi }
    $script:hatlar[$id] = $sonuc
  } else {
    if ($o -and ($o.duraklar -or $o.seferler)) {
      $k = [ordered]@{ durum = "eski"; hata = $hataMesaji; sonBasarili = $o.sonBasarili; sonDegisiklik = $o.sonDegisiklik }
      foreach ($alan in "duraklar", "saatler", "seferler") { if ($null -ne $o.$alan) { $k[$alan] = $o.$alan } }
      $script:hatlar[$id] = $k
    } else {
      $script:hatlar[$id] = [ordered]@{ durum = "hata"; hata = $hataMesaji }
    }
    if (-not $o -or $o.durum -eq "ok") {
      $script:uyarilar += "**${ad}** tarifesi firmanın sitesinden okunamadı: $hataMesaji. Sitede en son okunan saatler gösteriliyor."
    }
  }
}

# --- Gestaş: Güney Marmara Adalar Hattı tablosu (satır = iskele, sütun = gün) ---
$sonuc = $null; $hataMesaji = ""
try {
  $c = Get-Sayfa "https://gdu.com.tr/sefer-tarifeleri"
  $GUN_ADLARI = @("PAZARTESI", "SALI", "CARSAMBA", "PERSEMBE", "CUMA", "CUMARTESI", "PAZAR")
  $bulundu = $false
  foreach ($t in [regex]::Matches($c, '(?is)<table[^>]*>(.*?)</table>')) {
    $satirlar = @(Get-Satirlar $t.Groups[1].Value)
    $ilkSutun = ($satirlar | ForEach-Object { $_[0] }) -join " "
    if ($ilkSutun -notmatch 'AVŞA' -or $ilkSutun -notmatch 'ERDEK') { continue }
    $bulundu = $true
    # Başlık satırı gün adları olmalı (Pazartesi ... Pazar)
    $baslik = @($satirlar[0] | Select-Object -Skip 1 | ForEach-Object {
      ($_.Replace('İ', 'I').Replace('Ş', 'S').Replace('Ç', 'C') -creplace '[^A-Za-z]', '').ToUpperInvariant() })
    if (($baslik -join ",") -ne ($GUN_ADLARI -join ",")) { throw "Gün başlıkları beklenenden farklı: $($satirlar[0] -join ', ')" }
    $duraklar = @(); $sutunlar = @(0..6 | ForEach-Object { , @() })
    foreach ($s in ($satirlar | Select-Object -Skip 1)) {
      if (-not ($s -join "").Trim()) { continue }
      if ($s.Count -ne 8) { throw "Satırda 8 hücre yok: $($s -join ', ')" }
      $kod = Get-IskeleKodu $s[0]
      if (-not $kod) { throw "Bilinmeyen iskele: $($s[0])" }
      $duraklar += $kod
      for ($g = 0; $g -lt 7; $g++) { $sutunlar[$g] += , (ConvertTo-Saat $s[$g + 1]) }
    }
    if ($duraklar.Count -lt 4) { throw "Tabloda çok az durak var ($($duraklar.Count))" }
    for ($g = 0; $g -lt 7; $g++) {
      if (@($sutunlar[$g] | Where-Object { $_ }).Count -lt 2) { throw "$($GUN_ADLARI[$g]) günü için saat yok" }
    }
    $sonuc = [ordered]@{ duraklar = $duraklar; saatler = $sutunlar }
    break
  }
  if (-not $bulundu) { throw "Güney Marmara tablosu sayfada bulunamadı" }
} catch { $sonuc = $null; $hataMesaji = $_.Exception.Message }
Save-Sonuc "gestas" "Gestaş" $sonuc $hataMesaji

# --- CNR RoRo: "Sefer Saatleri" bölümü (her tablo bir sefer: iskele, varış, kalkış) ---
$sonuc = $null; $hataMesaji = ""
try {
  $c = Get-Sayfa "https://cnrroro.com/"
  $bolum = [regex]::Match($c, '(?is)<section[^>]*id="saatler"[^>]*>(.*?)</section>').Groups[1].Value
  if (-not $bolum) { throw "Sefer Saatleri bölümü bulunamadı" }
  $seferler = @()
  foreach ($a in [regex]::Matches($bolum, '(?is)<article[^>]*class="route"[^>]*>(.*?)</article>')) {
    $art = $a.Groups[1].Value
    $hat = ConvertTo-Hucre ([regex]::Match($art, '(?is)<h3[^>]*>(.*?)</h3>').Groups[1].Value)
    $gemi = ConvertTo-Hucre ([regex]::Match($art, '(?is)<div class="ship"[^>]*>(.*?)</div>').Groups[1].Value)
    if (-not $gemi -or $gemi -match '(?i)sefer saat') { $gemi = $hat -replace '\s*[–—]\s*', ' - ' }
    foreach ($m in [regex]::Matches($art, '(?is)(?:<div class="sched-label"[^>]*>(.*?)</div>\s*)?<table[^>]*class="tt"[^>]*>(.*?)</table>')) {
      $etiket = (ConvertTo-Hucre $m.Groups[1].Value) -replace '(?i)\s*sefer saatleri', ''
      $duraklar = @()
      foreach ($s in (Get-Satirlar $m.Groups[2].Value | Select-Object -Skip 1)) {
        if ($s.Count -lt 3) { continue }
        $kod = Get-IskeleKodu $s[0]
        if (-not $kod) { throw "Bilinmeyen iskele: $($s[0])" }
        $duraklar += , @($kod, (ConvertTo-Saat $s[1]), (ConvertTo-Saat $s[2]))
      }
      if ($duraklar.Count -lt 2) { throw "$hat seferinde yeterli durak yok" }
      $ad = if ($etiket) { "$gemi ($($etiket.ToLower($tr)))" } else { $gemi }
      # Sitede gün bilgisi yok, her gün geçerli kabul edilir
      $seferler += [ordered]@{ gunler = @(0, 1, 2, 3, 4, 5, 6); gemi = $ad; duraklar = $duraklar }
    }
  }
  if (-not $seferler.Count) { throw "Hiç sefer tablosu bulunamadı" }
  $sonuc = [ordered]@{ seferler = $seferler }
} catch { $sonuc = $null; $hataMesaji = $_.Exception.Message }
Save-Sonuc "cnr-roro" "CNR RoRo" $sonuc $hataMesaji

# --- Marmara RoRo: tarife resim olarak yayımlanıyor; resimler izlenir ---
# data/seferler.js'teki "tarifeGorselleri" elle girilmiş saatlerin hangi resimlerden alındığını söyler.
$o = $onceki["marmara-roro"]
try {
  $bilinen = @([regex]::Matches(([regex]::Match([IO.File]::ReadAllText($seferDosyasi), '(?s)tarifeGorselleri:\s*\[(.*?)\]').Groups[1].Value), '"([^"]+)"') | ForEach-Object { $_.Groups[1].Value })
  $c = Get-Sayfa "https://www.marmararoro.com/seferlerimiz.html"
  $gorseller = @([regex]::Matches($c, 'https://www\.marmararoro\.com/uploads/images/(\d{4}-\d{2})/x?([0-9a-f]+)\.(jpe?g|png|webp)') |
    ForEach-Object { "https://www.marmararoro.com/uploads/images/$($_.Groups[1].Value)/$($_.Groups[2].Value).$($_.Groups[3].Value)" } | Select-Object -Unique)
  if (-not $gorseller.Count) { throw "Sefer sayfasında tarife resmi bulunamadı" }
  $yeni = @($gorseller | Where-Object { $_ -notin $bilinen })
  $k = [ordered]@{ durum = $(if ($yeni.Count) { "yeni-gorsel" } else { "ok" }); gorseller = $gorseller; yeniGorseller = $yeni; sonBasarili = $simdi }
  $oncekiYeni = if ($o -and $o.yeniGorseller) { @($o.yeniGorseller) -join "," } else { "" }
  if ($yeni.Count -and ($yeni -join ",") -ne $oncekiYeni) {
    $uyarilar += "**Marmara RoRo** sitesine yeni bir tarife resmi koydu. Resim otomatik okunamadığı için saatlerin elle güncellenmesi gerekiyor (data/seferler.js, ardından resmi tarifeGorselleri listesine ekleyin):`n" + (($yeni | ForEach-Object { "- $_" }) -join "`n")
  }
  $hatlar["marmara-roro"] = $k
} catch {
  $hatlar["marmara-roro"] = [ordered]@{ durum = "hata"; hata = $_.Exception.Message }
  if (-not $o -or $o.durum -ne "hata") { $uyarilar += "**Marmara RoRo** tarife sayfası okunamadı: $($_.Exception.Message)" }
}

# --- İDO: ada seferleri yalnızca yaz sezonunda. Liman listesinde ada iskelesi görününce seferler otomatik eklenir ---
# Kaynak: İDO'nun kendi sitesinin kullandığı servis (api.ido.com.tr). Önümüzdeki 7 günün seferleri haftanın günlerine çevrilir.
# Deneme için: $env:IDO_DENEME_DESEN = "Bandırma" (ada yerine bu limanları ada sayar, çıktıyı göndermeyin)
$ekHatlar = @(); $ekIskeleler = [ordered]@{}
$o = $onceki["ido"]
try {
  $IDO = "https://api.ido.com.tr/idows/v2/ido"
  $basliklar = @{ Origin = "https://www.ido.com.tr"; Referer = "https://www.ido.com.tr/" }
  function Get-Ido([string]$yol) {
    $r = Invoke-WebRequest "$IDO/$yol" -UseBasicParsing -UserAgent $UA -TimeoutSec 30 -Headers $basliklar
    [Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray()) | ConvertFrom-Json
  }
  $ADA_DESENI = if ($env:IDO_DENEME_DESEN) { $env:IDO_DENEME_DESEN } else { '(?i)avşa|avsa|marmara|ekinlik|saraylar|paşalimanı|balıklı' }
  $limanlar = @((Get-Ido "locations").results | ForEach-Object { $_.port })
  if ($limanlar.Count -lt 3) { throw "Liman listesi okunamadı" }
  $adaLimanlari = @($limanlar | Where-Object { "$($_.name) $($_.displayName)" -match $ADA_DESENI })

  if (-not $adaLimanlari.Count) {
    $hatlar["ido"] = [ordered]@{ durum = "sezon-disi"; sonBasarili = $simdi; limanlar = @($limanlar | ForEach-Object { $_.name }) }
  } else {
    # İskele kodu: bilinen iskele ya da İDO liman adından yeni kod (YENIKAPI gibi)
    $kodlar = @{}
    function Get-IdoKodu($liman) {
      if ($kodlar.ContainsKey($liman.code)) { return $kodlar[$liman.code] }
      # Sefer kaydındaki limanda yalnızca kod ve ad var; görünen ad için liman listesindeki kaydı kullan
      $tam = $limanlar | Where-Object { $_.code -eq $liman.code } | Select-Object -First 1
      if ($tam) { $liman = $tam }
      $k = Get-IskeleKodu $liman.name
      if (-not $k) {
        $n = $liman.name.Replace('İ', 'I').Replace('ı', 'i').Replace('Ş', 'S').Replace('ş', 's').Replace('Ğ', 'G').Replace('ğ', 'g')
        $n = $n.Replace('Ç', 'C').Replace('ç', 'c').Replace('Ö', 'O').Replace('ö', 'o').Replace('Ü', 'U').Replace('ü', 'u')
        $k = ($n -creplace '[^A-Za-z]', '').ToUpperInvariant()
        $script:ekIskeleler[$k] = if ($liman.displayName -and $liman.displayName -ne $liman.name) { "$($liman.displayName) ($($liman.name))" } else { $liman.name }
      }
      $kodlar[$liman.code] = $k; $k
    }
    # Ada limanına giden ve ada limanından kalkan hatlar
    $ciftler = @{}
    foreach ($a in $adaLimanlari) {
      foreach ($h in (Get-Ido "locations/$($a.code)/routes").results) {
        $ciftler["$($a.code)>$($h.port.code)"] = $true
        $ciftler["$($h.port.code)>$($a.code)"] = $true
      }
    }
    $bugun = Get-Date
    $bas = $bugun.ToString("yyyy-MM-dd"); $son = $bugun.AddDays(6).ToString("yyyy-MM-dd")
    $gruplar = [ordered]@{}; $aracli = $false
    foreach ($cift in $ciftler.Keys) {
      $kalkis, $varis = $cift.Split(">")
      $j = Get-Ido "voyages?arrivalLocation=$varis&departureLocation=$kalkis&fromDate=$bas&toDate=$son"
      foreach ($v in @($j.voyages)) {
        if (-not $v -or "$($v.status)" -match '(?i)iptal') { continue }
        $gun = ([datetime]::ParseExact("$($v.date)".Substring(0, 10), "yyyy-MM-dd", $null).DayOfWeek.value__ + 6) % 7
        $nereden = Get-IdoKodu $v.fromLocation; $nereye = Get-IdoKodu $v.toLocation
        # Hat adındaki ara limanlar ("Yenikapı-Marmara-Avşa"): saatleri bilinmez
        $parcalar = @("$($v.name)" -split '\s*-\s*')
        $ara = @()
        for ($i = 1; $i -lt $parcalar.Count - 1; $i++) {
          $limanAdi = $parcalar[$i]
          $l = $limanlar | Where-Object { $_.name -eq $limanAdi } | Select-Object -First 1
          if ($l) { $ara += Get-IdoKodu $l }
        }
        # (Windows PowerShell'de "@(, @(...))" JSON'a {"value":..} diye yazılıyor; += ile kurulur)
        $duraklar = @()
        $duraklar += , @($nereden, $null, (ConvertTo-Saat "$($v.departureTime)"))
        foreach ($x in $ara) { $duraklar += , @($x, $null, $null) }
        $duraklar += , @($nereye, (ConvertTo-Saat "$($v.arrivalTime)"), $null)
        if ($v.vessel.carriesVehicles) { $aracli = $true }
        $anahtar = "$($v.name)|$($duraklar | ConvertTo-Json -Compress)"
        if (-not $gruplar.Contains($anahtar)) { $gruplar[$anahtar] = [ordered]@{ gunler = @(); gemi = "$($v.name)"; duraklar = $duraklar } }
        if ($gun -notin $gruplar[$anahtar].gunler) { $gruplar[$anahtar].gunler += $gun }
      }
    }
    $seferler = @($gruplar.Values | ForEach-Object { $_.gunler = @($_.gunler | Sort-Object); $_ })
    if (-not $seferler.Count) { throw "Ada limanı var ama önümüzdeki 7 gün için sefer bulunamadı" }
    $ekHatlar += [ordered]@{
      id = "ido"; tip = "seferler"; isletmeci = "İDO"; renk = "#1a3d8f"; arac = $aracli
      ad = "İDO Adalar"; aciklama = (($adaLimanlari | ForEach-Object { $_.name }) -join ", ")
      tarife = "İDO'nun sitesinden saatte bir otomatik alınır (önümüzdeki 7 gün)"
      kaynak = "https://www.ido.com.tr/tr/sefer-saatleri"; bilet = "https://www.ido.com.tr/"
      telefon = [ordered]@{ genel = "0850 222 44 36"; genelAd = "Çağrı merkezi" }
      seferler = $seferler
    }
    $hatlar["ido"] = [ordered]@{ durum = "ok"; sonBasarili = $simdi; adaLimanlari = @($adaLimanlari | ForEach-Object { $_.name }); sefer = $seferler.Count }
    if (-not $o -or $o.durum -ne "ok") {
      $uyarilar += "**İDO** ada seferleri başladı ($(($adaLimanlari | ForEach-Object { $_.name }) -join ', ')). $($seferler.Count) sefer sitede otomatik gösterilmeye başlandı; bir göz atmanız iyi olur."
    }
  }
} catch {
  $hatlar["ido"] = [ordered]@{ durum = "hata"; hata = $_.Exception.Message }
  if ($o -and $o.durum -eq "ok") { $uyarilar += "**İDO** seferleri okunamadı: $($_.Exception.Message)" }
}

$veri = [ordered]@{ guncelleme = $simdi; hatlar = $hatlar; ekHatlar = $ekHatlar; ekIskeleler = $ekIskeleler }
$icerik = "// Bu dosya scripts/tarife-guncelle.ps1 tarafından otomatik oluşturulur. Elle düzenlemeyin.`nwindow.TARIFE_VERISI = $($veri | ConvertTo-Json -Depth 8);`n"
[IO.File]::WriteAllText($cikti, $icerik, (New-Object System.Text.UTF8Encoding $false))

foreach ($id in $hatlar.Keys) { "{0,-14} durum={1}{2}" -f $id, $hatlar[$id].durum, $(if ($hatlar[$id].hata) { "  ($($hatlar[$id].hata))" } else { "" }) }
"Yazıldı: $cikti"

if ($uyarilar.Count -and $env:TARIFE_UYARI) {
  [IO.File]::WriteAllText($env:TARIFE_UYARI, ($uyarilar -join "`n`n"), (New-Object System.Text.UTF8Encoding $false))
  "Uyarı: $($uyarilar.Count) yeni sorun"
}
