$ErrorActionPreference = "Stop"

$containerName = "matplant-test-db"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Error "Docker is not installed or not available in PATH."
}

$existing = docker ps -aq -f "name=$containerName"
if (-not $existing) {
  Write-Host "No test database container named '$containerName' exists."
  exit 0
}

docker stop $containerName | Out-Null
Write-Host "Stopped test database container '$containerName'."
