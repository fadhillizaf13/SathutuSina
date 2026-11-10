# SATHUTU SINA DAIRIES — Factory Management & Wholesale Registration

**A cohesive React.js + Java Spring Boot + MySQL project with two modes: a zero-backend frontend demo and a database-backed connected app.**

The **workspace and dashboard layout are retained from the ORIGINAL `App.js` + `App.css`**, while the login retains the UPGRADED design. Wholesale customer registration and admin approval are added separately. The four files you uploaded were used as the starting point; `data.js`, `validation.js`, `package.json` and artwork assets are bundled to make this downloadable folder standalone.

> This is a robust **development-ready starter**, not a certified production system. For production, replace demo users, review access controls, add domain-specific database relations/audits, email verification, anti-abuse, HTTPS, tests and secure deployment. See `docs/PRODUCTION_CHECKLIST.md`.

## EASIEST WAY: PREVIEW WITHOUT ANY BACKEND

1. Extract the ZIP on Windows and open `SathutuSina_Professional_Full_Project` in VS Code.
2. Install **Node.js LTS** (verify `node -v` and `npm -v`).
3. Open a PowerShell terminal **inside the extracted root folder**, then run:

   ```powershell
   cd frontend
   npm install
   npm start
   ```

   Or double-click `frontend/START_DEMO.bat`.
4. Open **http://localhost:3000**. The included `frontend/.env` has `REACT_APP_DEMO_MODE=true` by default.
5. Staff login examples for **DEMO MODE ONLY**:

   | Email | Role dropdown | Password |
   | --- | --- | --- |
   | `admin@demo.test` | Admin | `Admin123` |
   | `manager@demo.test` | Manager | `Manager123` |
   | `staff@demo.test` | Staff | `Staff123` |

6. Use the **Register as a wholesale customer** link. Submit a business application. Return to staff login and sign in as Admin. Click **Wholesale Customers** in the sidebar to review and Approve/Reject it.
7. Demo records are kept in your browser (not MySQL). Demo application details are stored locally **without their submitted passwords**. Preview mode is **not secure authentication**.

**The app should run without Java or XAMPP in this preview mode.**

## CONNECT REACT TO SPRING BOOT (H2, NO MYSQL INSTALLATION)

Install **Java JDK 21** and **Apache Maven** and confirm:

```powershell
java -version
mvn -version
```

In a **new** PowerShell terminal from the project root:

```powershell
cd backend
$env:SPRING_PROFILES_ACTIVE="demo"
mvn spring-boot:run
```

Or run `backend/START_H2_DEMO.bat`. Maven downloads dependencies on the first run, so you need internet access. Backend starts at **http://localhost:8080**. Test **http://localhost:8080/api/health**.

Open `frontend/.env` and change:

```ini
REACT_APP_API_URL=http://localhost:8080
REACT_APP_DEMO_MODE=false
```

**Stop the React server with Ctrl+C and restart `npm start`**. Changes to `.env` are not picked up until React restarts. Use these **BACKEND DEMO ACCOUNTS** (different from offline preview credentials):

| Email | Role | Password |
| --- | --- | --- |
| `admin@sathutusina.test` | Admin | `AdminDemo@123` |
| `manager@sathutusina.test` | Manager | `ManagerDemo@123` |
| `staff@sathutusina.test` | Staff | `StaffDemo@123` |

The connected React workspace now calls Spring Boot for loading, creating, editing and deleting **factory module records**. Wholesale registration and approval use Spring Boot and H2. **H2 demo data is lost when the backend restarts.**

## PERSIST REAL LOCAL DEVELOPMENT DATA IN MYSQL / XAMPP

1. Open **XAMPP Control Panel** and start **MySQL** (Apache only needed if you use phpMyAdmin).
2. In phpMyAdmin (usually `http://localhost/phpmyadmin`) open SQL and run:

   ```sql
   CREATE DATABASE IF NOT EXISTS sathutu_sina CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. Stop the H2 backend with Ctrl+C. In a **new backend PowerShell terminal**, remove the H2 demo profile and configure your MySQL account:

   ```powershell
   cd backend
   Remove-Item Env:SPRING_PROFILES_ACTIVE -ErrorAction SilentlyContinue
   $env:DB_USER="root"
   $env:DB_PASSWORD=""
   mvn spring-boot:run
   ```

   These credentials are for a **local XAMPP installation with an empty root password** only. Change them to match your setup. Never expose the root account or an empty password on a deployed server. `application.properties` uses `spring.jpa.hibernate.ddl-auto=update` for *local development*, so the tables will be created automatically. Migrations are required before deploying.
4. Keep `REACT_APP_DEMO_MODE=false` in `frontend/.env`, and run `npm start` in the frontend terminal.
5. Register a wholesale customer -> sign in as Admin -> **Wholesale Customers** -> Approve/Reject. Applications now persist to MySQL between restarts. Workspace add/edit/delete operations also persist to the MySQL database.

## WHAT IS INCLUDED

- **Login:** attractive upgraded Sathutu Sina design, Email + Role + Password, role-specific workspace access.
- **Dashboard:** original workspace layout, metrics, charts, top products, alerts, quick actions and recent orders.
- **Admin/Manager/Staff:** role-restricted menu navigation and server-side workspace API restrictions.
- **Modules:** Employees, Attendance, Leave Requests, Payroll, Meal Preferences, Production, Products, Raw Materials, Cool Rooms, Stock Transfers, Orders, Deliveries, Sales, Payments, Vehicles, Outlets, Returns & Wastage, Reports, Notifications.
- **Wholesale registration:** business name/contact/email/phone/business registration optional/address/password confirmation.
- **Admin wholesale approvals:** pending requests, list/search/filter, approve/reject. Customers never gain staff access.
- **Backend:** Spring Security session authentication with CSRF and credentialed CORS, password-hashed wholesale application storage, Spring Data JPA + H2/MySQL, protected CRUD endpoints, validation.
- **Developer conveniences:** seed demonstration factory data in frontend preview mode, CSV export, responsive mobile styles, Windows launch `.bat` files, runbook and troubleshooting.

## DIRECTORY LAYOUT

```text
SathutuSina_Professional_Full_Project/
├── frontend/
│   ├── public/
│   │   ├── IMG_2313.PNG            # Sathutu Sina logo placeholder (replace with your own)
│   │   └── index.html
│   ├── src/
│   │   ├── assets/                  # 3 login-panel images
│   │   ├── App.js                   # Login, dashboard, wholesale registration, admin approvals
│   │   ├── App.css                  # Original workspace CSS + upgraded login + wholesale CSS
│   │   ├── data.js                  # Original module names, seed records, access map, schema
│   │   ├── validation.js            # Form and CSV validation
│   │   └── index.js
│   ├── package.json
│   ├── .env                         # Demo or backend mode
│   └── START_DEMO.bat
├── backend/
│   ├── src/main/java/com/sathutusina/
│   │   ├── auth/                    # Staff session login/logout/CSRF
│   │   ├── wholesale/               # Customer registration & admin approval
│   │   ├── controller/              # Workspace CRUD + starter REST APIs
│   │   ├── config/                  # Spring Security + CORS + roles
│   │   ├── entity/                  # MySQL/H2 JPA entities
│   │   └── repository/              # Spring Data persistence
│   ├── src/main/resources/application.properties
│   ├── src/main/resources/application-demo.properties
│   ├── database/create_database.sql
│   ├── pom.xml
│   ├── START_H2_DEMO.bat
│   └── START_MYSQL.bat
└── docs/
    ├── WINDOWS_SETUP.md
    ├── TROUBLESHOOTING.md
    └── PRODUCTION_CHECKLIST.md
```

## NOTES

- Default logo `IMG_2313.PNG` is a **clean Sathutu Sina branding placeholder**, sourced from the earlier project. Replace `frontend/public/IMG_2313.PNG` with your exact company logo while keeping the same filename if you prefer.
- The upgraded login uses assets **relative to `frontend/src/App.css`** inside `frontend/src/assets`; do not move these to public or change their relative paths.
- Wholesale approval only changes application status. **Customer sign-in and wholesale ordering portal are not implemented**. A wholesale user has no Admin/Manager/Staff role.
- The old starter backend contains some alternative CRUD endpoints for employees/products/production. The current React interface uses the new `/api/workspace` endpoint to avoid changing the original dashboard screens.
- Spring Boot staff credentials in configuration are **development defaults**, not appropriate for production.
- Make sure your React `.env` has the right mode and **restart React** after switching it.

### Testing disclosures

TypeScript's JSX parser checked frontend files for syntax; a CSS parser checked the stylesheet. Maven-based integration tests and an actual browser render could not run in this environment because remote package registries are unavailable. Follow the Windows guide to run the complete project and report any terminal errors if you encounter them.
