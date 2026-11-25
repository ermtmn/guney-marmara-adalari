# Balıkesir Eczacı Odası'nın günlük nöbet listesinden yalnızca adalardaki nöbetçi eczaneleri seçer
# ve data/eczane.js dosyasına yazar.
# Çalıştırma (Windows): powershell -ExecutionPolicy Bypass -File C:\Proje\scripts\eczane-guncelle.ps1
# GitHub'da .github/workflows/veri-guncelle.yml saatte bir pwsh ile çalıştırır (liste günde bir değişir).
#
# Not (25.11.2026): Marmara ilçesi (Marmara, Avşa, Ekinlik) odanın nöbet çizelgesinde yer almıyor;
# Paşalimanı Erdek ilçesine bağlı. Ada adresli bir nöbetçi eczane görünürse sitede gösterilir.

$ErrorActionPreference = "Stop"
$kok = Split-Path $PSScriptRoot -Parent
$cikti = Join-Path (Join-Path $kok "data") "eczane.js"
$UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
$KAYNAK = "https://www.balikesireczaciodasi.org.tr/nobetci-eczaneler"

# Eczanenin hangi adada olduğu: ilçe ya da adresteki yer adı
$ADALAR = [ordered]@{
  ekinlik    = '(?i)ekinlik'
  avsa       = '(?i)avşa|avsa|türkeli|yiğitler'
  pasalimani = '(?i)paşalimanı|pasalimani|balıklı|harmanlı|poyrazlı'
  marmara    = '(?i)marmara adası|saraylar|gündoğdu|çınarlı|topağaç|asmalı|abroz|^marmara$'
}

function ConvertTo-Duz([string]$h) {
  ([System.Net.WebUtility]::HtmlDecode(($h -replace '<[^>]+>', ' ')) -replace '\s+', ' ').Trim()
}

$veri = [ordered]@{ guncelleme = (Get-Date).ToString("yyyy-MM-ddTHH:mm"); durum = "ok"; kaynak = $KAYNAK; toplam = 0; eczaneler = @() }
try {
  $r = Invoke-WebRequest $KAYNAK -UseBasicParsing -UserAgent $UA -TimeoutSec 30
  $c = [Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray())
  $bloklar = [regex]::Matches($c, '(?s)<h4 class="red border">\s*<strong>(.*?)</strong>\s*-\s*(.*?)</h4>(.*?)<hr')
  # Sayfa yapısı değiştiyse boş liste "adalarda nöbetçi yok" sanılmasın
  if ($bloklar.Count -lt 10) { throw "Nöbet listesi okunamadı ($($bloklar.Count) eczane)" }
  $veri.toplam = $bloklar.Count
  foreach ($b in $bloklar) {
    $ad = ConvertTo-Duz $b.Groups[1].Value
    $ilce = ConvertTo-Duz $b.Groups[2].Value
    $govde = $b.Groups[3].Value
    $adres = ConvertTo-Duz ([regex]::Match($govde, "(?s)fa-home[^>]*></i>(.*?)<br").Groups[1].Value)
    $tel = [regex]::Match($govde, 'href="tel:([^"]+)"').Groups[1].Value.Trim()
    $konum = [regex]::Match($govde, 'maps\?q=([-\d.]+,[-\d.]+)').Groups[1].Value
    $ada = $null
    foreach ($k in $ADALAR.Keys) {
      if ($ilce -match $ADALAR[$k] -or $adres -match $ADALAR[$k]) { $ada = $k; break }
    }
    if (-not $ada) { continue }
    $veri.eczaneler += [ordered]@{ ada = $ada; ad = $ad; ilce = $ilce; adres = $adres; tel = $tel; konum = $konum }
  }
} catch {
  $veri.durum = "hata"; $veri.hata = $_.Exception.Message
}

$icerik = "// Bu dosya scripts/eczane-guncelle.ps1 tarafından otomatik oluşturulur. Elle düzenlemeyin. Kaynak: Balıkesir Eczacı Odası.`nwindow.ECZANE_VERISI = $($veri | ConvertTo-Json -Depth 5);`n"
[IO.File]::WriteAllText($cikti, $icerik, (New-Object System.Text.UTF8Encoding $false))
"Eczane        durum=$($veri.durum) toplam=$($veri.toplam) ada=$($veri.eczaneler.Count)$(if ($veri.hata) { "  ($($veri.hata))" })"
"Yazıldı: $cikti"
