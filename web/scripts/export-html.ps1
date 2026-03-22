$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$repoRoot = Split-Path -Parent $projectRoot
$deliverablesDir = Join-Path $repoRoot "deliverables"
$outputPath = Join-Path $deliverablesDir "signalsafe_snapshot.html"
$stdoutLog = Join-Path $projectRoot ".snapshot-server.stdout.log"
$stderrLog = Join-Path $projectRoot ".snapshot-server.stderr.log"
$port = 3101
$serverProcess = $null

New-Item -ItemType Directory -Force -Path $deliverablesDir | Out-Null

if (Test-Path $stdoutLog) {
  Remove-Item $stdoutLog -Force
}

if (Test-Path $stderrLog) {
  Remove-Item $stderrLog -Force
}

try {
  Write-Host "Building application..."
  & npm run build

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
        $response.Content | Set-Content -Path $outputPath -Encoding utf8
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
}
