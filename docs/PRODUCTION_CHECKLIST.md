# Production-readiness checklist

This repository is a company-grade **starter structure**, not ready to host sensitive business/payroll data as-is.

1. Disable `REACT_APP_DEMO_MODE`, remove default test credentials, and implement database/identity-provider backed staff accounts with safe onboarding and password reset.
2. Use HTTPS, HTTP-only Secure session cookies, secret storage, restrictive CORS origins, CSRF testing, session rotation, and an effective logout policy.
3. Restrict each API by permission and record scope. Audit HR, payroll, inventory, payment, and approval changes. Staff must not read management-only data.
4. Design normalized tables with JPA relationships for orders, products, stock movements, payroll, staff, attendance and delivery transactions. This starter's generic JSON workspace records are transitional.
5. Implement transactional stock updates and inventory consistency; reconcile cold room movements, orders, wastage, returns and cash/bank payments.
6. Apply input validation on the backend. Add rate limits/CAPTCHA or equivalent anti-bot controls on registration and authentication.
7. Add wholesale verification: email confirmation, business approval evidence, notifications, account recovery and customer-specific sign-in + ordering portal.
8. Replace `hibernate ddl-auto=update` with Flyway/Liquibase migrations and proper backups. Use restricted MySQL database credentials.
9. Add integration tests, security tests, usability accessibility tests, and production deployment CI before accepting real data.
10. Remove placeholder/example names, suppliers, stock/salary information, and use real factory data under a suitable privacy policy.

Current system: sessions + CSRF, staff role separation, wholesale pending/approval, password hashing on wholesale registrations, server-side workspace role checks, dashboard UX, demo mode. Gaps listed above should be addressed before real-world operations.
