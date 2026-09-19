# Test Credentials — SIPOSTLOG

## Perbaikan login terbaru (19 September 2026)
- Kredensial tetap username `admin`, password `admin`; sudah sesuai bcrypt hash konfigurasi.
- URL browser: baca REACT_APP_BACKEND_URL dari frontend/.env.
- Kedua Origin resmi aplikasi tercantum dalam CORS_ORIGINS backend/.env, termasuk alamat internal cluster yang diteruskan proxy.
- Endpoint utama tetap POST `/api/auth/admin/login`; alias POST `/api/auth/login` tersedia.
- API key AI milik pengguna tidak disimpan di dokumen ini dan belum diintegrasikan. Jangan tampilkan atau salin rahasia ke laporan uji.

Auth utama (2026-09-19): akun admin lokal dengan cookie session_token HttpOnly/Secure/SameSite=None. Password disimpan sebagai bcrypt hash; token lokal di-hash dalam MongoDB. UI tidak menampilkan kredensial.

## Admin lokal aktif
- Username: `admin`
- Password: `admin`
- Email internal: `admin@sipostlog.local`
- Nama: Administrator SIPOSTLOG
- Role: admin
- Halaman: `/login` dari menu Masuk Admin di bar atas
- Endpoint: POST `/api/auth/admin/login` JSON `{ "username": "admin", "password": "admin" }`
- Sesi: GET `/api/auth/me`; keluar: POST `/api/auth/logout`
- Kredensial dipilih pengguna. Hindari menguji >5 password salah untuk akun ini tanpa membersihkan login_attempts sesudah uji.
- Tidak ada password akun Google; jalur OAuth lama dipertahankan untuk kompatibilitas dan tidak menjadi login utama.

## Real admin allowlist
- `aldyfahrizan@gmail.com` → role `admin` automatically on first Google login (ADMIN_EMAIL in /app/backend/.env)

## Seeded test sessions (MongoDB db `sipostlog`) — use as `Authorization: Bearer <token>` or `session_token` cookie
| Role | user_id | email | session_token |
|---|---|---|---|
| admin | test-admin-001 | test.user.admin@example.com | `test_session_admin_001` |
| petugas | test-petugas-001 | test.user.petugas@example.com | `test_session_petugas_001` |
| pending | test-pending-001 | test.user.pending@example.com | `test_session_pending_001` |

Re-create if missing: see /app/auth_testing.md (Step 1).
