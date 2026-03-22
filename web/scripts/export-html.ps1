$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$repoRoot = Split-Path -Parent $projectRoot
$deliverablesDir = Join-Path $repoRoot "deliverables"
$outputPath = Join-Path $deliverablesDir "signalsafe_snapshot.html"
$tempPrefix = "signalsafe-snapshot-$(Get-Date -Format 'yyyyMMddHHmmssfff')"
$stdoutLog = Join-Path $env:TEMP "$tempPrefix.stdout.log"
$stderrLog = Join-Path $env:TEMP "$tempPrefix.stderr.log"
$port = 3101
$serverProcess = $null

function New-StandaloneSnapshot {
  param(
    [string]$Html,
    [string]$BaseUrl
  )

  $stylePattern = '<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*>'
  $standaloneStyles = New-Object System.Collections.Generic.List[string]

  foreach ($match in [regex]::Matches($Html, $stylePattern)) {
    $href = $match.Groups[1].Value
    if ($href.StartsWith("http")) {
      $styleUrl = $href
    } else {
      $styleUrl = "$BaseUrl$href"
    }

    $styleResponse = Invoke-WebRequest -Uri $styleUrl -UseBasicParsing
    $standaloneStyles.Add($styleResponse.Content)
  }

  $htmlWithoutStyles = [regex]::Replace($Html, $stylePattern, "")
  $htmlWithoutPreloads = [regex]::Replace($htmlWithoutStyles, '<link[^>]+rel="preload"[^>]*>', "")
  $htmlWithoutScripts = [regex]::Replace($htmlWithoutPreloads, '<script\b[^>]*>.*?</script>', "", [System.Text.RegularExpressions.RegexOptions]::Singleline)
  $htmlWithoutHiddenReact = $htmlWithoutScripts.Replace('<div hidden=""><!--$--><!--/$--></div>', "")
  $htmlWithoutFavicons = [regex]::Replace($htmlWithoutHiddenReact, '<link[^>]+rel="icon"[^>]*>', "")

  $fallbackStyle = @"
<style>
html, body {
  margin: 0;
  min-height: 100%;
  font-family: "Segoe UI", Inter, Arial, sans-serif;
  background: #edf3fb;
}

body {
  color: #0f172a;
}
</style>
"@

  $inlinedStyles = ($standaloneStyles | ForEach-Object { "<style>`n$_`n</style>" }) -join "`n"
  $styleBlock = "$fallbackStyle`n$inlinedStyles"

  return $htmlWithoutFavicons -replace '</head>', "$styleBlock`n</head>"
}

New-Item -ItemType Directory -Force -Path $deliverablesDir | Out-Null

try {
  Write-Host "Building application..."
  & npm.cmd run build

  Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object {
      Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
    }

  Write-Host "Starting temporary server on port $port..."
  $serverProcess = Start-Process `
    -FilePath "cmd.exe" `
    -ArgumentList "/c", "npm run start -- --hostname 127.0.0.1 --port $port" `
    -WorkingDirectory $projectRoot `
    -PassThru `
    -RedirectStandardOutput $stdoutLog `
    -RedirectStandardError $stderrLog

  $ready = $false
  for ($attempt = 0; $attempt -lt 40; $attempt++) {
    Start-Sleep -Milliseconds 500
    try {
      $response = Invoke-WebRequest -Uri "http://127.0.0.1:$port" -UseBasicParsing
      if ($response.StatusCode -eq 200) {
        $standaloneHtml = New-StandaloneSnapshot -Html $response.Content -BaseUrl "http://127.0.0.1:$port"
        $standaloneHtml | Set-Content -Path $outputPath -Encoding utf8
        $ready = $true
        break
      }
    } catch {
      if ($serverProcess.HasExited) {
        throw "Snapshot server exited early. See $stdoutLog and $stderrLog."
      }
    }
  }

  if (-not $ready) {
    throw "Timed out waiting for Next.js server on port $port."
  }

  Write-Host "Saved HTML snapshot to $outputPath"
} finally {
  if ($serverProcess -and -not $serverProcess.HasExited) {
    Stop-Process -Id $serverProcess.Id -Force
  }

  foreach ($tempLog in @($stdoutLog, $stderrLog)) {
    if (Test-Path $tempLog) {
      try {
        Remove-Item $tempLog -Force
      } catch {
      }
    }
  }
}
