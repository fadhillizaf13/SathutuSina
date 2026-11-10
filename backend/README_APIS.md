# Sathutu Sina REST API reference

The React client uses session cookies and Spring Security CSRF tokens. Obtain a token from `GET /api/auth/csrf` before any write request.

| Method | Path | Role / purpose |
|--|--|--|
| GET | `/api/health` | Public health check |
| GET | `/api/auth/csrf` | Public CSRF token |
| POST | `/api/auth/login` | Staff email/role/password login |
| GET | `/api/auth/me` | Authenticated current user |
| POST | `/api/auth/logout` | Authenticated logout |
| POST | `/api/wholesale/register` | Public wholesale application |
| GET | `/api/wholesale/applications` | Admin: list applications |
| POST | `/api/wholesale/applications/{id}/approve` | Admin: approve |
| POST | `/api/wholesale/applications/{id}/reject` | Admin: reject |
| GET | `/api/workspace` | Authenticated: role-filtered workspace records |
| POST | `/api/workspace/{module}` | Authenticated: create role-authorized record |
| PUT | `/api/workspace/{module}/{id}` | Authenticated: modify role-authorized record |
| DELETE | `/api/workspace/{module}/{id}` | Authenticated: delete role-authorized record |

The old starter APIs `/api/employees`, `/api/products`, `/api/production/batches` and `/api/modules/.../records` are also included as examples. The React workspace uses `/api/workspace` for its tables in connected mode.

## Known limitations

The generic workspace JSON records are suitable for a starter/prototype but should eventually become typed relational domain entities with database constraints, audit trails, testing, and dedicated business validation. Notifications are displayed from local UI state and their dismissal does not use the server endpoint. No wholesale customer sign-in/order portal is implemented; customer approval does not grant staff access. Demo staff accounts are configured in properties and must be replaced before production. Add email verification, rate limiting, HTTPS, backup policy, and migrations before real deployment.
