$ErrorActionPreference = "Stop"

$containerName = "matplant-test-db"
$image = "postgres:16"
$hostPort = "5433"
$dbName = "matplant_test"
$dbUser = "postgres"
$dbPassword = "password"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Error "Docker is not installed or not available in PATH. Install Docker Desktop, then rerun this script."
}

$running = docker ps -q -f "name=$containerName"
if ($running) {
  Write-Host "Test database container '$containerName' is already running on localhost:$hostPort."
  exit 0
}

$existing = docker ps -aq -f "name=$containerName"
if ($existing) {
  docker start $containerName | Out-Null
  Write-Host "Started existing test database container '$containerName' on localhost:$hostPort."
  exit 0
}

docker run `
  --name $containerName `
  -e "POSTGRES_PASSWORD=$dbPassword" `
  -e "POSTGRES_USER=$dbUser" `
  -e "POSTGRES_DB=$dbName" `
  -p "${hostPort}:5432" `
  -d $image | Out-Null

Write-Host "Created test database container '$containerName' on localhost:$hostPort."
