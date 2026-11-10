# Windows 10/11 run instructions (VS Code + PowerShell)

## Minimum software

- For preview: Node.js LTS, npm (bundled), VS Code.
- For Java backend: JDK 21, Apache Maven 3.9+, optionally XAMPP with MySQL.

## A. First run, without backend

1. Download the ZIP, right-click → **Extract All**.
2. Open VS Code → File → Open Folder → select the extracted **SathutuSina_Professional_Full_Project**.
3. Open Terminal → New Terminal → select PowerShell.
4. Run from root: `cd frontend` then `npm install` (first time only), then `npm start`.
5. Open `http://localhost:3000`. You should see the upgraded login page.
6. Enter Email=`admin@demo.test`, Role=`Admin`, Password=`Admin123`, click Enter Dashboard.
7. Navigate the original workspace. Test an Add Record modal, Edit, Delete, Export CSV.
8. Click logout. Click **Register as a wholesale customer**; submit sample wholesale data.
9. Go back, sign in as Admin and open **Wholesale Customers** in the sidebar. Approve or reject the registration.

**Expected:** The admin approval section and dashboard function without Java/MySQL. Demo registrations and data stay in the same browser's localStorage.

## B. Java with H2 (recommended next)

1. In a fresh PowerShell window: `java -version` and `mvn -version` to verify JDK 21 + Maven.
2. From root: `cd backend`.
3. Execute: `$env:SPRING_PROFILES_ACTIVE="demo"`.
4. Execute: `mvn spring-boot:run`. Leave this terminal running.
5. Open `http://localhost:8080/api/health`, verify status UP.
6. In `frontend/.env` set `REACT_APP_DEMO_MODE=false`.
7. Restart `npm start` in frontend terminal (Ctrl+C then run).
8. Login `admin@sathutusina.test` / `Admin` / `AdminDemo@123`. Test wholesale registration & approval again.

## C. Java with MySQL (persistent)

1. Start XAMPP MySQL. Use phpMyAdmin to run `CREATE DATABASE IF NOT EXISTS sathutu_sina;`.
2. Stop backend H2 with Ctrl+C.
3. From backend terminal: `Remove-Item Env:SPRING_PROFILES_ACTIVE -ErrorAction SilentlyContinue`.
4. Run `$env:DB_USER="root"` and `$env:DB_PASSWORD=""` (local default example only).
5. Run `mvn spring-boot:run`. Leave this terminal running.
6. Leave frontend mode `false` and run `npm start`.
7. Register a wholesale company and approve it. Refresh the admin page; it should still be present. Add a Product in workspace; it should persist through reload in connected mode.

## Directory commands from anywhere

If Windows says folder not found, right-click your extracted project folder → Copy as path, then in PowerShell: `cd "C:\the\copied\path\SathutuSina_Professional_Full_Project"`.

## Common short commands

```
# frontend terminal
cd frontend
npm install
npm start

# backend terminal (different terminal)
cd backend
$env:SPRING_PROFILES_ACTIVE="demo"
mvn spring-boot:run
```

**Don't type JavaScript imports in PowerShell.** Put source code inside the files and execute `npm start` / `mvn spring-boot:run`.
