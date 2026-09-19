# Test Credentials — SIPOSTLOG

Auth: Google login via Emergent-managed OAuth (no app-managed passwords).

## Real admin allowlist
- `aldyfahrizan@gmail.com` → role `admin` automatically on first Google login (ADMIN_EMAIL in /app/backend/.env)

## Seeded test sessions (MongoDB db `sipostlog`) — use as `Authorization: Bearer <token>` or `session_token` cookie
| Role | user_id | email | session_token |
|---|---|---|---|
| admin | test-admin-001 | test.user.admin@example.com | `test_session_admin_001` |
| petugas | test-petugas-001 | test.user.petugas@example.com | `test_session_petugas_001` |
| pending | test-pending-001 | test.user.pending@example.com | `test_session_pending_001` |

Re-create if missing: see /app/auth_testing.md (Step 1).
