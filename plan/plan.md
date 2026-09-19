# Rencana: Review Kesiapan Deploy Sipostlog (Vercel / Railway)

## Tujuan
Meninjau aplikasi Sipostlog (React + FastAPI + MongoDB) yang sudah ada untuk memastikan siap dideploy secara live, lalu menyiapkan konfigurasi yang dibutuhkan agar dapat dijalankan di Vercel dan/atau Railway.app.

## Arsitektur Deploy yang Diusulkan
Karena backend FastAPI ini bersifat stateful (session cookie login) dan terhubung ke MongoDB, sedangkan Vercel dioptimalkan untuk frontend/serverless (tidak ideal untuk backend Python yang selalu aktif dengan koneksi database), disarankan:

- **Frontend (React)** -> **Vercel**
- **Backend (FastAPI)** -> **Railway.app**
- **Database (MongoDB)** -> **MongoDB Atlas** (bukan MongoDB lokal di dalam pod ini). Ini wajib karena database MongoDB yang berjalan di lingkungan preview saat ini tidak persisten/tidak bisa diakses dari luar setelah deploy.

Asumsi: Ini adalah kombinasi paling umum dan stabil untuk stack ini. Jika Anda lebih memilih backend+frontend keduanya di Railway (satu platform saja), itu juga bisa dilakukan — beri tahu jika ini preferensi Anda.

## Cakupan Review
1. **Keamanan kredensial**: Memastikan tidak ada API key, password, atau connection string yang ter-hardcode di kode (termasuk Gemini API key dan kredensial admin), dan semuanya berasal dari environment variable.
2. **Konfigurasi CORS & Cookie Sesi**: Karena frontend (Vercel) dan backend (Railway) akan berada di domain berbeda, konfigurasi CORS dan atribut cookie sesi (`secure`, `samesite=None`) perlu disesuaikan agar login tetap berfungsi di lingkungan production cross-domain.
3. **Environment Variables**: Menyusun daftar lengkap variabel environment yang dibutuhkan di Railway (backend: `MONGO_URL`, `DB_NAME`, Gemini API key, dll) dan di Vercel (frontend: URL backend production).
4. **File konfigurasi deploy**: Menyiapkan file yang dibutuhkan Railway (start command dengan `$PORT`) dan Vercel (build settings untuk React).
5. **Pengecekan umum kesiapan**: Memastikan tidak ada URL localhost yang tertanam permanen di kode, memastikan build frontend berjalan tanpa error, dan endpoint API menggunakan prefix `/api` secara konsisten.

## Yang Tidak Termasuk dalam Task Ini
- Tidak melakukan deploy sesungguhnya (Anda akan melakukan connect repository & klik deploy sendiri di Vercel/Railway, atau menggunakan fitur "Save to GitHub" dari Emergent lalu menyambungkannya).
- Tidak memperbaiki file test lama (`backend_test.py`) yang memang sudah diketahui belum sinkron — ini di luar topik "kesiapan deploy" kecuali diminta terpisah.
- Tidak membuat akun MongoDB Atlas/Railway/Vercel untuk Anda — Anda perlu membuat akun tersebut dan memberikan connection string/kredensial yang dihasilkan.

## Apa yang Anda Perlu Siapkan Setelah Review Ini
- Akun MongoDB Atlas (gratis tier tersedia) beserta connection string-nya.
- Akun Railway.app dan Vercel.
- Gemini API key produksi (boleh pakai yang sama dengan saat ini).

## Hasil Akhir yang Diharapkan
- Kode sudah aman untuk production (tidak ada secret ter-hardcode).
- File konfigurasi deploy (Railway config, Vercel config) sudah tersedia di repo.
- Dokumentasi singkat langkah-langkah connect & deploy ke masing-masing platform beserta daftar environment variable yang perlu diisi manual oleh Anda di dashboard Railway/Vercel.
