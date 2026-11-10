@echo off
cd /d "%~dp0"
where java >nul 2>nul
if errorlevel 1 (echo Install JDK 21 first. & pause & exit /b 1)
where mvn >nul 2>nul
if errorlevel 1 (echo Install Apache Maven and configure PATH first. & pause & exit /b 1)
set SPRING_PROFILES_ACTIVE=demo
mvn spring-boot:run
pause
