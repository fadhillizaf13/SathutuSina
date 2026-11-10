# Troubleshooting

**`npm` / `node` not recognized:** Install Node.js LTS, close and reopen VS Code/PowerShell.

**`npm ERR! enoent package.json`:** You're in the wrong folder. Run `cd frontend` from the project root, then `dir` (look for package.json).

**`npm install` cannot connect:** Internet access is required for npm on the first install. Retry when the registry is available.

**`mvn` not recognized:** Install Apache Maven, add `apache-maven-*/bin` to Windows PATH, reopen the terminal.

**`java -version` shows old Java:** Install JDK 21 and set JAVA_HOME/PATH accordingly.

**Port 3000 or 8080 already used:** Stop previous React/Spring processes or update the port and matching `REACT_APP_API_URL`.

**`Cannot connect to the login server`:** In preview mode, set `frontend/.env` `REACT_APP_DEMO_MODE=true` and restart React. In connected mode, start Spring Boot at 8080.

**Demo credentials invalid:** For preview mode use `admin@demo.test / Admin / Admin123`. For Spring Boot use `admin@sathutusina.test / Admin / AdminDemo@123`. They are DIFFERENT sets.

**MySQL `Access denied for user root`:** Correct `DB_USER` and `DB_PASSWORD` or create a dedicated DB user with grants. Check MySQL is running.

**MySQL `Unknown database sathutu_sina`:** Run the database SQL in phpMyAdmin first.

**React blank page / CSS image not resolved:** Confirm `frontend/src/assets` contains the three image files; don't remove them. Confirm `src/data.js` and `src/validation.js` exist.

**Workspace shows original demo data when you expected MySQL:** Check `.env` `REACT_APP_DEMO_MODE=false`, restart React, and log into the Spring Boot staff account.

**Wholesale registration button not working:** Check you're on the staff login screen and that browser URL becomes `/wholesale/register`. In backend mode, check Spring Boot health endpoint and CORS origin. GET `/api/auth/csrf` must be successful.

**Spring Boot gives 403 on POST:** Ensure React uses session cookies and the current CSRF token. Clear browser cookies for localhost and log in again if needed. Do not disable CSRF as a workaround.

**Project builds but screenshot looks different:** Replace `frontend/public/IMG_2313.PNG` with your exact logo. Keep the file name unchanged. Browser screenshots can vary by font availability.
