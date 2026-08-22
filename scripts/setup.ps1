#requires -Version 7.0
<#
.SYNOPSIS
  First-run setup for the Kanban docker compose stack.

.DESCRIPTION
  - Copies .env.docker to .env if .env is missing
  - Generates a random JWT_SECRET (replaces the placeholder)
  - Generates a random POSTGRES_PASSWORD (replaces the placeholder)
  - Fails loudly if any required `change_me_` placeholder is still set
    (e.g. Google OAuth credentials), so `docker compose up` is never run
    with broken config.

  Re-running is safe: nothing is overwritten once a value differs from
  the template placeholder.
#>

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$envPath      = Join-Path $repoRoot '.env'
$templatePath = Join-Path $repoRoot '.env.docker'

if (-not (Test-Path $templatePath)) {
  Write-Error ".env.docker template not found at $templatePath"
}

if (-not (Test-Path $envPath)) {
  Copy-Item $templatePath $envPath
  Write-Host "[setup] Created .env from .env.docker" -ForegroundColor Green
} else {
  Write-Host "[setup] .env already exists — leaving it alone" -ForegroundColor Yellow
}

function New-RandomHex([int]$bytes) {
  $buf = New-Object byte[] $bytes
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($buf)
  ($buf | ForEach-Object { $_.ToString('x2') }) -join ''
}

function Set-EnvValueIfPlaceholder([string]$key, [string]$placeholder, [string]$newValue) {
  $lines = Get-Content $envPath
  $pattern = "^$([regex]::Escape($key))="
  $changed = $false
  $newLines = foreach ($line in $lines) {
    if ($line -match $pattern) {
      $current = $line -replace $pattern, ''
      if ($current -eq $placeholder) {
        $changed = $true
        "$key=$newValue"
      } else {
        $line
      }
    } else {
      $line
    }
  }
  if ($changed) {
    Set-Content -Path $envPath -Value $newLines -Encoding utf8NoBOM
    Write-Host "[setup] Generated random $key" -ForegroundColor Green
  }
}

Set-EnvValueIfPlaceholder 'JWT_SECRET'        'change_me_very_long_random_secret' (New-RandomHex 64)
Set-EnvValueIfPlaceholder 'POSTGRES_PASSWORD' 'change_me_strong_password'          (New-RandomHex 24)

# Critical placeholders that the script cannot auto-fill — user must edit .env.
$criticalKeys = @('GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET')
$remaining = @()
foreach ($key in $criticalKeys) {
  $match = Select-String -Path $envPath -Pattern "^$key=change_me_" -SimpleMatch:$false
  if ($match) { $remaining += $key }
}

if ($remaining.Count -gt 0) {
  Write-Host ""
  Write-Host "[setup] The following keys still contain placeholders in .env:" -ForegroundColor Red
  $remaining | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
  Write-Host "Edit .env and replace them before running 'docker compose up'." -ForegroundColor Red
  Write-Host "Google credentials: https://console.cloud.google.com/apis/credentials" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "[setup] Ready. Next: docker compose up --build" -ForegroundColor Green
