$ErrorActionPreference = "Stop"
$env:SPRING_PROFILES_ACTIVE = "demo"
Write-Host "Launching Sathutu Sina backend (H2 demo) at http://localhost:8080"
mvn spring-boot:run
