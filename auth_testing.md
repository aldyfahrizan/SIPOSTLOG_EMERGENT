# SIPOSTLOG — panduan pengujian autentikasi

## Konfigurasi
- Baca `/app/memory/test_credentials.md`. Login lokal username admin/password admin di POST `/api/auth/admin/login`.
- URL eksternal hanya dari frontend/.env REACT_APP_BACKEND_URL; MongoDB hanya dari backend/.env MONGO_URL + DB_NAME.
- Metode username/password mengikuti bcrypt, seed idempoten, pembatasan percobaan masuk MongoDB, HttpOnly cookie, dan validasi Origin. Sesi opaque lama dipertahankan, bukan mengganti arsitektur menjadi JWT.

## Verifikasi database
1. User admin lokal memiliki bcrypt password_hash yang diawali `$2b$`; tidak ada password plaintext.
2. Index users.email unik; users.username unik sparse; login_attempts.identifier unik; expires_at TTL pada login_attempts dan user_sessions.
3. Seed berulang tidak mengubah user_id/created_at/role/status atau data stok.
4. Sesi admin lokal disimpan sebagai hash SHA-256; token mentah hanya dalam cookie. Sesi Google lama tetap terbaca.

## API dan browser
1. Login benar: 200, role admin; tidak mengembalikan hash/token. Cookie session_token HttpOnly, Secure, SameSite=None. Semua auth response no-store.
2. GET /auth/me dan endpoint internal memakai cookie yang sama; reload tetap masuk.
3. Password/username salah: 401 generik. Lima kegagalan diikuti 429; expired lockout dapat mencoba lagi. Bersihkan data throttling uji setelah selesai.
4. Missing/invalid/expired session: 401; pengguna nonaktif: 403; non-admin tidak boleh mengelola pengguna.
5. Origin asing pada POST/PATCH/DELETE ditolak 403. Origin aplikasi diizinkan.
6. Logout menghapus dokumen sesi dan cookie. Replay token setelah logout ditolak.
7. /users dan /users/{id} tidak mengembalikan password_hash.
8. Form kosong, type=password, error terlihat, loading dan keyboard Enter berfungsi; tidak ada petunjuk password di UI.
9. Jalur Google bukan lingkup perbaikan; jangan menyatakan OAuth berhasil tanpa akun Google nyata.