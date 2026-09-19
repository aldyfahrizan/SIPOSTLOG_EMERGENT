# Auth-Gated App Testing Playbook (SIPOSTLOG)

DB name: `sipostlog` (see /app/backend/.env). Roles: `admin`, `petugas`, `pending`.

## Step 1: Create Test User & Session
```bash
mongosh --quiet --eval "
use('sipostlog');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({ user_id: userId, email: 'test.user.' + Date.now() + '@example.com', name: 'Test Admin', picture: '', role: 'admin', active: true, created_at: new Date(), last_login: new Date() });
db.user_sessions.insertOne({ user_id: userId, session_token: sessionToken, expires_at: new Date(Date.now() + 7*24*60*60*1000), created_at: new Date() });
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```
Set `role: 'petugas'` or `role: 'pending'` to test other roles.

## Step 2: Test Backend API
```bash
curl -X GET "$API/api/auth/me" -H "Authorization: Bearer YOUR_SESSION_TOKEN"
curl -X GET "$API/api/items" -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## Step 3: Browser Testing
```python
await page.context.add_cookies([{ "name": "session_token", "value": "YOUR_SESSION_TOKEN", "domain": "<app-host>", "path": "/", "httpOnly": True, "secure": True, "sameSite": "None" }])
await page.goto("https://<app-host>/app/stok")
```

## Clean test data
```bash
mongosh --quiet --eval "use('sipostlog'); db.users.deleteMany({email: /test\.user\./}); db.user_sessions.deleteMany({session_token: /test_session/});"
```

## Checklist
- `/api/auth/me` returns user with `user_id`
- Dashboard `/app/stok` loads without redirect to `/login`
- Pending user → redirected to `/menunggu`
- Public `/api/public/*` never returns `currentStock` / `minThreshold`
