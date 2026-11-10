@echo off
cd /d "%~dp0"
where mvn >nul 2>nul
if errorlevel 1 (echo Install Apache Maven and configure PATH first. & pause & exit /b 1)
set SPRING_PROFILES_ACTIVE=
echo Starting Spring Boot using MySQL. Start MySQL in XAMPP and create sathutu_sina first.
echo Set DB_USER and DB_PASSWORD in environment if different from XAMPP defaults.
mvn spring-boot:run
pause
