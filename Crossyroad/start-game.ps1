$ErrorActionPreference = 'Stop'

$projectRoot = [System.IO.Path]::GetFullPath($PSScriptRoot)
$server = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 8080)
$server.Start()

Write-Host ''
Write-Host '  Blocky Crossing is running!' -ForegroundColor Green
Write-Host '  Open http://localhost:8080 in your browser.' -ForegroundColor Cyan
Write-Host '  Press Ctrl+C here to stop the server.' -ForegroundColor DarkGray
Write-Host ''

$contentTypes = @{
  '.html' = 'text/html; charset=utf-8'
  '.js'   = 'text/javascript; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.svg'  = 'image/svg+xml'
}

try {
  while ($true) {
    $client = $server.AcceptTcpClient()
    $stream = $client.GetStream()
    $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
    $requestLine = $reader.ReadLine()
    while ($reader.ReadLine()) { }

    $requestTarget = if ($requestLine -match '^GET\s+([^\s]+)') { $Matches[1] } else { '/' }
    $requestPath = $requestTarget.Split('?')[0]
    $relativePath = [System.Uri]::UnescapeDataString($requestPath.TrimStart('/'))
    if ([string]::IsNullOrWhiteSpace($relativePath)) { $relativePath = 'index.html' }

    $filePath = [System.IO.Path]::GetFullPath((Join-Path $projectRoot $relativePath))
    if (-not $filePath.StartsWith($projectRoot, [System.StringComparison]::OrdinalIgnoreCase) -or
        -not [System.IO.File]::Exists($filePath)) {
      $status = '404 Not Found'
      $contentType = 'text/plain; charset=utf-8'
      $bytes = [System.Text.Encoding]::UTF8.GetBytes('404 - Not Found')
    } else {
      $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
      $contentType = if ($contentTypes.ContainsKey($extension)) {
        $contentTypes[$extension]
      } else {
        'application/octet-stream'
      }
      $bytes = [System.IO.File]::ReadAllBytes($filePath)
      $status = '200 OK'
    }

    $headers = "HTTP/1.1 $status`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`n`r`n"
    Write-Host "$status  $requestPath" -ForegroundColor DarkGray
    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
    $stream.Write($headerBytes, 0, $headerBytes.Length)
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Dispose()
    $client.Dispose()
  }
} finally {
  $server.Stop()
}
