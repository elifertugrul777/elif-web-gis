# Local-only static web server. Binds loopback, not the local network.
$ErrorActionPreference = 'Stop'
$siteRoot = [System.IO.Path]::GetFullPath($PSScriptRoot)
$listener = $null
foreach ($sitePort in 8765..8790) {
  try {
    $candidate = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $sitePort)
    $candidate.Start()
    $listener = $candidate
    break
  } catch { }
}
if ($null -eq $listener) { throw 'No available local port. Use VS Code Go Live.' }
Write-Host "Elif website: http://127.0.0.1:$sitePort/index.html"
Write-Host 'Keep this window open. Close it to stop the local server.'
Start-Process "http://127.0.0.1:$sitePort/index.html"
$types = @{'.html'='text/html; charset=utf-8';'.css'='text/css; charset=utf-8';'.js'='text/javascript; charset=utf-8';'.svg'='image/svg+xml';'.png'='image/png';'.json'='application/json';'.ttf'='font/ttf';'.woff2'='font/woff2'}
try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    $client.ReceiveTimeout = 5000
    $stream = $client.GetStream()
    try {
      $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $request = $reader.ReadLine()
      if ([string]::IsNullOrWhiteSpace($request)) { continue }
      do { $headerLine = $reader.ReadLine() } while (-not [string]::IsNullOrEmpty($headerLine))
      $parts = $request.Split(' ')
      if ($parts.Length -lt 2) { continue }
      $relative = [System.Uri]::UnescapeDataString(($parts[1].Split('?')[0])).TrimStart('/')
      if ($relative -eq '') { $relative = 'index.html' }
      $path = [System.IO.Path]::GetFullPath((Join-Path $siteRoot $relative))
      $underRoot = $path.StartsWith($siteRoot + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)
      if (-not $underRoot -or -not [System.IO.File]::Exists($path)) {
        $status = '404 Not Found'
        $mime = 'text/plain; charset=utf-8'
        $bytes = [System.Text.Encoding]::UTF8.GetBytes('Not found')
      } else {
        $status = '200 OK'
        $ext = [System.IO.Path]::GetExtension($path).ToLowerInvariant()
        $mime = $types[$ext]
        if (-not $mime) { $mime = 'application/octet-stream' }
        $bytes = [System.IO.File]::ReadAllBytes($path)
      }
      $response = "HTTP/1.1 $status`r`nContent-Type: $mime`r`nContent-Length: $($bytes.Length)`r`nReferrer-Policy: strict-origin-when-cross-origin`r`nConnection: close`r`n`r`n"
      $prefix = [System.Text.Encoding]::ASCII.GetBytes($response)
      $stream.Write($prefix,0,$prefix.Length)
      if ($parts[0] -ne 'HEAD') { $stream.Write($bytes,0,$bytes.Length) }
      $stream.Flush()
    } catch { Write-Host 'Request skipped.' } finally { $client.Close() }
  }
} finally { $listener.Stop() }
