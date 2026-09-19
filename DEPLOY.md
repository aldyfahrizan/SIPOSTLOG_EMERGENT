# Panduan Deploy Sipostlog (Vercel + Railway + MongoDB Atlas)

Dokumen ini adalah panduan langkah demi langkah untuk membawa Sipostlog dari lingkungan preview ke production. Tidak ada langkah di sini yang otomatis dijalankan oleh agent — semua koneksi akun dan klik "Deploy" dilakukan oleh Anda sendiri di dashboard masing-masing platform.

## Arsitektur
- **Frontend (React/CRA)** → Vercel
- **Backend (FastAPI)** → Railway.app
- **Database** → MongoDB Atlas (bukan MongoDB lokal di pod ini — data di pod tidak persisten setelah deploy)

## Status Review Keamanan & Kesiapan (sudah diperbaiki di kode)
- ✅ Tidak ada API key, password, atau connection string yang ter-hardcode di kode. Semua berasal dari environment variable.
- ✅ Tidak ada URL localhost/internal yang tertanam permanen — frontend hanya memakai `REACT_APP_BACKEND_URL`, backend hanya memakai `os.environ`.
- ✅ Cookie sesi login sudah `secure=True, samesite="none"` — sudah benar untuk domain berbeda (Vercel ≠ Railway).
- ✅ Build frontend (`yarn build`) berhasil tanpa error.
- ✅ Endpoint backend konsisten memakai prefix `/api`.
- ✅ Diperbaiki: `backend/server.py` memuat `.env` dengan `override=False` (sebelumnya `True`), sehingga environment variable yang Anda isi di dashboard Railway tidak akan tertimpa file `.env` lokal.
- ✅ Ditambahkan `memory/test_credentials.md` ke `.gitignore` (berisi kredensial uji, tidak untuk ikut ter-push ke repo publik).

File konfigurasi deploy yang ditambahkan:
- `backend/Procfile` dan `backend/railway.json` — start command Railway (`uvicorn server:app --host 0.0.0.0 --port $PORT`)
- `backend/.python-version` — pin Python 3.11.16 di Railway
- `frontend/vercel.json` — build settings + rewrite untuk client-side routing (React Router)

## Langkah 1 — Buat Database MongoDB Atlas
1. Daftar di https://www.mongodb.com/cloud/atlas/register (tier gratis M0 cukup untuk awal).
2. Buat Cluster baru (pilih region terdekat, misalnya Singapore).
3. Database Access → buat user database baru (username/password, simpan baik-baik).
4. Network Access → Add IP Address → pilih "Allow Access from Anywhere" (0.0.0.0/0), karena Railway memakai IP dinamis.
5. Connect → Drivers → copy connection string, bentuknya seperti:
   `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority`
6. Simpan connection string ini — akan dipakai sebagai `MONGO_URL` di Railway.

## Langkah 2 — Deploy Backend ke Railway
1. Daftar/login di https://railway.app, hubungkan akun GitHub Anda.
2. Push kode terbaru ke GitHub lewat fitur **"Save to GitHub"** di chat Emergent (bukan lewat agent ini).
3. Railway → New Project → Deploy from GitHub Repo → pilih repo Sipostlog.
4. Karena repo ini monorepo (folder `backend/` dan `frontend/` sejajar), di Service Settings Railway:
   - Set **Root Directory** = `backend`
   - Railway akan otomatis mendeteksi `railway.json`/`Procfile` di folder tersebut dan menjalankan `uvicorn server:app --host 0.0.0.0 --port $PORT`.
5. Isi Environment Variables di tab **Variables** Railway (lihat daftar lengkap di bawah).
6. Deploy. Setelah selesai, Railway akan memberi Anda URL publik, misalnya `https://sipostlog-backend.up.railway.app`. Simpan URL ini.
7. Test cepat: buka `https://<url-railway-anda>/api/public/items` di browser — harus mengembalikan JSON daftar barang tanpa jumlah stok.

### Environment Variables wajib di Railway (backend)
| Key | Contoh Nilai | Keterangan |
|---|---|---|
| `MONGO_URL` | `mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority` | Dari MongoDB Atlas (Langkah 1) |
| `DB_NAME` | `sipostlog` | Nama database, bebas asal konsisten |
| `CORS_ORIGINS` | `https://sipostlog.vercel.app` | Domain frontend Vercel Anda (isi setelah Langkah 3 selesai, boleh lebih dari satu dipisah koma) |
| `ADMIN_USERNAME` | `admin` | Username login admin utama |
| `ADMIN_PASSWORD_HASH` | `$2b$12$...` | Hash bcrypt password admin (gunakan nilai yang sudah ada, atau generate ulang jika ingin ganti password produksi) |
| `LOCAL_ADMIN_EMAIL` | `admin@sipostlog.local` | Email internal akun admin lokal |
| `ADMIN_EMAIL` | `aldyfahrizan@gmail.com` | Email yang otomatis mendapat role admin saat login Google |
| `PORT` | *(otomatis diisi Railway)* | Jangan diisi manual — Railway inject otomatis |

> Catatan: Jika ingin mengganti password admin produksi, generate hash bcrypt baru sebelum deploy (`python3 -c "import bcrypt; print(bcrypt.hashpw(b'PASSWORD_BARU', bcrypt.gensalt()).decode())"`), lalu masukkan hasilnya ke `ADMIN_PASSWORD_HASH`.

## Langkah 3 — Deploy Frontend ke Vercel
1. Daftar/login di https://vercel.com, hubungkan akun GitHub yang sama.
2. Add New Project → pilih repo Sipostlog.
3. Karena monorepo, set **Root Directory** = `frontend` di konfigurasi project Vercel.
4. Framework Preset akan otomatis terdeteksi sebagai "Create React App" (karena `vercel.json` sudah ditambahkan).
5. Isi Environment Variable:

| Key | Nilai |
|---|---|
| `REACT_APP_BACKEND_URL` | URL backend Railway Anda dari Langkah 2, contoh `https://sipostlog-backend.up.railway.app` (tanpa trailing slash) |

6. Deploy. Vercel akan memberi domain seperti `https://sipostlog.vercel.app`.
7. **Kembali ke Railway** → update `CORS_ORIGINS` dengan domain Vercel ini, lalu redeploy backend (Railway auto-redeploy saat env var diubah).

## Langkah 4 — Verifikasi End-to-End
1. Buka domain Vercel Anda di browser.
2. Cek halaman publik tampil (katalog barang tanpa jumlah stok, dashboard penyaluran grafik).
3. Login admin (`/login`) dengan username `admin` dan password sesuai `ADMIN_PASSWORD_HASH` yang dipasang.
4. Pastikan setelah login masuk ke dashboard, reload halaman tetap login (cookie sesi bekerja cross-domain).
5. Coba tambah/hapus transaksi untuk memastikan koneksi ke MongoDB Atlas berfungsi.

## Troubleshooting Umum
- **Login gagal / "Asal permintaan tidak diizinkan"**: `CORS_ORIGINS` di Railway belum memuat domain Vercel yang benar (persis, termasuk `https://` tanpa trailing slash).
- **Cookie tidak tersimpan setelah login**: pastikan backend Railway diakses lewat HTTPS (otomatis oleh Railway) — cookie `secure=True` tidak akan tersimpan di HTTP biasa.
- **500 error terkait database**: cek `MONGO_URL` benar dan Network Access di Atlas sudah mengizinkan IP Railway (0.0.0.0/0).
- **Frontend blank / 404 saat reload halaman dalam**: pastikan `vercel.json` (rewrite ke index.html) ikut ter-deploy — sudah disediakan di `frontend/vercel.json`.

## Di Luar Cakupan Task Ini
- Agent tidak melakukan deploy sesungguhnya — Anda perlu klik connect & deploy sendiri di Railway/Vercel.
- Agent tidak membuat akun MongoDB Atlas/Railway/Vercel untuk Anda.
- `backend/tests/backend_test.py` (unit test lama) belum diperbaiki — di luar topik kesiapan deploy, aplikasi utama tetap berjalan normal.
