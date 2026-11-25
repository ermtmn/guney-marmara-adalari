# Projeyi yerelde görüntülemek için basit sunucu: http://localhost:8080
param([int]$Port = 8080)
$kok = $PSScriptRoot
$tipler = @{ ".html" = "text/html; charset=utf-8"; ".js" = "text/javascript; charset=utf-8"; ".json" = "application/json; charset=utf-8"; ".css" = "text/css; charset=utf-8"; ".png" = "image/png"; ".svg" = "image/svg+xml"; ".webmanifest" = "application/manifest+json" }
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
Write-Host "Sunucu calisiyor: http://localhost:$Port/"
while ($l.IsListening) {
  $c = $l.GetContext()
  $yol = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath.TrimStart('/'))
  if ($yol -eq "") { $yol = "index.html" }
  $dosya = [IO.Path]::GetFullPath((Join-Path $kok $yol))
  if ($dosya.StartsWith($kok) -and (Test-Path $dosya -PathType Leaf)) {
    $b = [IO.File]::ReadAllBytes($dosya)
    $t = $tipler[[IO.Path]::GetExtension($dosya).ToLower()]
    if ($t) { $c.Response.ContentType = $t }
    $c.Response.OutputStream.Write($b, 0, $b.Length)
  } else { $c.Response.StatusCode = 404 }
  $c.Response.Close()
}
