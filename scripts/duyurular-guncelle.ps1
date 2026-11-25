# Firmaların iptal/ek sefer duyurularını toplar ve data/duyurular.js dosyasına yazar.
# Çalıştırma (Windows): powershell -ExecutionPolicy Bypass -File C:\Proje\scripts\duyurular-guncelle.ps1
# GitHub'da .github/workflows/veri-guncelle.yml saatte bir pwsh ile çalıştırır.
# Site bu dosyayı okur; tarayıcı başka sitelerden doğrudan veri çekemediği için bu betik gerekir.

$ErrorActionPreference = "Stop"
$kok = Split-Path $PSScriptRoot -Parent
$cikti = Join-Path (Join-Path $kok "data") "duyurular.js"
$UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"

# Güney Marmara adalarıyla ilgili duyuruları seçmek için anahtar kelimeler
$ADA = '(?i)Avşa|Avsa|Marmara|Ekinlik|Balıklı|Paşalimanı|Erdek|Tekirdağ|Saraylar|Adalar'
# Sefer durumu bildiren duyurular
$SEFER = '(?i)iptal|ek sefer|hava|fırtına|muhalefet|yapılamay|sefer'

function Get-Sayfa([string]$url) {
  $r = Invoke-WebRequest $url -UseBasicParsing -UserAgent $UA -TimeoutSec 30
  [Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray())
}

function ConvertTo-Metin([string]$html) {
  $t = $html -replace '(?i)<br\s*/?>|</p>|</li>|</div>', "`n" -replace '<[^>]+>', ''
  $t = [System.Net.WebUtility]::HtmlDecode($t)
  ($t -split "`n" | ForEach-Object { ($_ -replace '\s+', ' ').Trim() } | Where-Object { $_ }) -join "`n"
}

function New-Firma($isletmeci, $renk) {
  [ordered]@{ isletmeci = $isletmeci; renk = $renk; durum = "ok"; duyurular = @() }
}

$firmalar = @()

# --- Gestaş: duyurular sayfasındaki "İPTAL/EK SEFER BİLGİSİ" kutusu ---
$f = New-Firma "Gestaş" "#0b6fa4"
try {
  $c = Get-Sayfa "https://gdu.com.tr/gduonline/duyurular"
  $m = [regex]::Match($c, '(?s)<h5[^>]*>\s*İPTAL/EK SEFER BİLGİSİ\s*</h5>(.*?)</div>\s*</div>')
  if ($m.Success) {
    $metin = ConvertTo-Metin $m.Groups[1].Value
    if ($metin -match $ADA) {
      $f.duyurular += [ordered]@{ tur = "Duyuru"; baslik = "İptal/Ek Sefer Bilgisi"; metin = $metin; tarih = "" }
    }
  }
} catch { $f.durum = "hata" }
$firmalar += $f

# --- Marmara RoRo: duyurular sayfasındaki duyuru listesi ---
$f = New-Firma "Marmara RoRo" "#c8372d"
try {
  $c = Get-Sayfa "https://www.marmararoro.com/duyurular.html"
  $gorulen = @{}
  foreach ($m in [regex]::Matches($c, '(?s)<a[^>]+href="https://www\.marmararoro\.com/duyurular/(\d+)"[^>]*>(.*?)</a>')) {
    $no = $m.Groups[1].Value
    $metin = ConvertTo-Metin $m.Groups[2].Value
    if (-not $metin -or $gorulen.ContainsKey($no)) { continue }
    $gorulen[$no] = $true
    if ($metin -match $SEFER) {
      $f.duyurular += [ordered]@{ tur = "Duyuru"; baslik = ""; metin = $metin; tarih = "" }
    }
  }
} catch { $f.durum = "hata" }
$firmalar += $f

# --- CNR RoRo: ana sayfadaki duyuru şeridi ---
$f = New-Firma "CNR RoRo" "#c26a00"
try {
  $c = Get-Sayfa "https://cnrroro.com/"
  $m = [regex]::Match($c, '(?s)<div class="notice".*?<p[^>]*>(.*?)</p>')
  if ($m.Success) {
    $metin = (ConvertTo-Metin $m.Groups[1].Value) -replace '\s*🚢\s*', ' '
    $metin = ($metin -replace '\s+', ' ').Trim()
    if ($metin) { $f.duyurular += [ordered]@{ tur = "Duyuru"; baslik = ""; metin = $metin; tarih = "" } }
  }
} catch { $f.durum = "hata" }
$firmalar += $f

# --- İDO: iptal ve ek sefer duyuruları (yalnızca ada hatları) ---
$f = New-Firma "İDO" "#1a3d8f"
try {
  foreach ($tip in @("CANCEL_VOYAGE", "ADDITIONAL_VOYAGE")) {
    $r = Invoke-WebRequest "https://api.ido.com.tr/idows/v2/announcements?searchType=$tip" -Method Post `
      -ContentType "application/json" -Body "{}" -UseBasicParsing -UserAgent $UA -TimeoutSec 30
    $j = [Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray()) | ConvertFrom-Json
    foreach ($d in $j.results) {
      if ("$($d.announcementTitle) $($d.announcementContent)" -match $ADA) {
        $f.duyurular += [ordered]@{
          tur = $d.creationType; baslik = ($d.announcementTitle -replace '\s+', ' ').Trim()
          metin = $d.announcementContent; tarih = $d.announcementDate
        }
      }
    }
  }
} catch { $f.durum = "hata" }
$firmalar += $f

$veri = [ordered]@{ guncelleme = (Get-Date).ToString("yyyy-MM-ddTHH:mm"); firmalar = $firmalar }
$json = $veri | ConvertTo-Json -Depth 6
$icerik = "// Bu dosya scripts/duyurular-guncelle.ps1 tarafından otomatik oluşturulur. Elle düzenlemeyin.`nwindow.DUYURU_VERISI = $json;`n"
[IO.File]::WriteAllText($cikti, $icerik, (New-Object System.Text.UTF8Encoding $false))

foreach ($x in $firmalar) { "{0,-14} durum={1,-5} duyuru={2}" -f $x.isletmeci, $x.durum, $x.duyurular.Count }
"Yazıldı: $cikti"

# --- MGM 3 günlük deniz tahmin bülteni: Marmara bölgesi -> data/hava.js ---
$havaCikti = Join-Path (Join-Path $kok "data") "hava.js"
$AYLAR = @{ "Ocak"=1; "Şubat"=2; "Mart"=3; "Nisan"=4; "Mayıs"=5; "Haziran"=6; "Temmuz"=7; "Ağustos"=8; "Eylül"=9; "Ekim"=10; "Kasım"=11; "Aralık"=12 }
try {
  $c = Get-Sayfa "https://www.mgm.gov.tr/mobile/denizcilik-3-gunluk-haritali.aspx"
  $yayin = [regex]::Match($c, 'Yayın Tarihi:</strong>\s*([\d.]+)').Groups[1].Value
  $gunler = @()
  # Her gün bir <h2> başlığıyla başlar
  $parcalar = [regex]::Split($c, '<h2>') | Select-Object -Skip 1
  foreach ($p in $parcalar) {
    $baslik = [regex]::Match($p, '^(.*?)</h2>').Groups[1].Value.Trim()
    $tm = [regex]::Match($baslik, '(\d+)\s+(\S+)\s+(\d{4})')
    if (-not $tm.Success -or -not $AYLAR.ContainsKey($tm.Groups[2].Value)) { continue }
    $tarih = "{0}-{1:D2}-{2:D2}" -f [int]$tm.Groups[3].Value, $AYLAR[$tm.Groups[2].Value], [int]$tm.Groups[1].Value
    $firtina = ConvertTo-Metin ([regex]::Match($p, '(?s)<h3>Fırtına</h3>\s*<p>(.*?)</p>').Groups[1].Value)
    $blok = [regex]::Match($p, '(?s)<h4>Marmara</h4>(.*?)(<h4>|<h2>|$)').Groups[1].Value
    $alan = { param($ad) ConvertTo-Metin ([regex]::Match($blok, "(?s)<strong>$ad</strong>:\s*<em>(.*?)</em>").Groups[1].Value) }
    $gunler += [ordered]@{
      tarih = $tarih; baslik = $baslik
      firtina = $firtina; firtinaMarmara = [bool]($firtina -match 'Marmara')
      hava = (& $alan "Hava Durumu"); ruzgar = (& $alan "Rüzgar"); dalga = (& $alan "Dalga"); gorus = (& $alan "Görüş")
    }
  }
  $hv = [ordered]@{ guncelleme = (Get-Date).ToString("yyyy-MM-ddTHH:mm"); yayin = $yayin; durum = "ok"; gunler = $gunler }
} catch {
  $hv = [ordered]@{ guncelleme = (Get-Date).ToString("yyyy-MM-ddTHH:mm"); yayin = ""; durum = "hata"; gunler = @() }
}
# --- MGM konum bazlı 5 günlük tahmin (iskelelerin bağlı olduğu ilçeler) ---
# istNo -> ilçe adı (MGM servis.mgm.gov.tr/web/merkezler/ililcesi listesinden)
$ISTASYONLAR = [ordered]@{ "91008" = "Erdek"; "91018" = "Marmara"; "91003" = "Bandırma"; "95901" = "Süleymanpaşa" }
$lokasyon = [ordered]@{}
foreach ($ist in $ISTASYONLAR.Keys) {
  try {
    $r = Invoke-WebRequest "https://servis.mgm.gov.tr/web/tahminler/gunluk?istno=$ist" -UseBasicParsing -UserAgent $UA -TimeoutSec 30 `
      -Headers @{ Origin = "https://www.mgm.gov.tr"; Referer = "https://www.mgm.gov.tr/" }
    $t = ([Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray()) | ConvertFrom-Json)[0]
    $gunler = @()
    $gorulen = @{}
    # Gün0 bugündür; MGM öğleden sonra Gün1'i yarına kaydırdığı için Gün0 da alınır
    foreach ($n in 0..5) {
      $ham = [string]$t."tarihGun$n"
      if (-not $ham -or $ham.Length -lt 10) { continue }
      $tarihStr = $ham.Substring(0, 10)
      if ($gorulen.ContainsKey($tarihStr)) { continue }
      $gorulen[$tarihStr] = $true
      $gunler += [ordered]@{
        tarih = $tarihStr
        enDusuk = $t."enDusukGun$n"; enYuksek = $t."enYuksekGun$n"; hadise = $t."hadiseGun$n"
        ruzgarHiz = $t."ruzgarHizGun$n"; ruzgarYon = $t."ruzgarYonGun$n"
        nemMin = $t."enDusukNemGun$n"; nemMax = $t."enYuksekNemGun$n"
      }
    }
    $lokasyon[$ist] = [ordered]@{ ad = $ISTASYONLAR[$ist]; gunler = $gunler }
  } catch { }
}
$hv.lokasyon = $lokasyon
"MGM lokasyon  istasyon=$($lokasyon.Count)/$($ISTASYONLAR.Count)"

$icerik = "// Bu dosya scripts/duyurular-guncelle.ps1 tarafından otomatik oluşturulur. Kaynak: MGM (deniz bülteni ve konum bazlı günlük tahmin).`nwindow.HAVA_VERISI = $($hv | ConvertTo-Json -Depth 5);`n"
[IO.File]::WriteAllText($havaCikti, $icerik, (New-Object System.Text.UTF8Encoding $false))
"MGM hava      durum=$($hv.durum) gün=$($hv.gunler.Count)"
"Yazıldı: $havaCikti"
