@echo
Set-Location $PSScriptRoot\..
if (-not (Test-Path .env)) {
  Copy-Item .env.example .env
  Write-Host "Created backend/.env from .env.example — add your API keys before running."
}
go run ./cmd/server
