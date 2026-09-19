# SIPOSTLOG — PRD & Progress

## Status terbaru — 19 September 2026, perbaikan login diprioritaskan

### Permintaan pengguna saat ini (asli)
Back End Repo Sipostlog masih membuat saya tidak bisa login, tolong buatkan agar saya bisa login menggunakan akun dengan password admin dan username admin, serta tambahkan menu penambahan barang, penghapusan barang, pembuatan Berita Acara Penyaluran secara otomatis di dalam website ,buatkan agar admin bisa membuat akun pengguna sesuai tugas, contoh pencatatan stock opname dan lain lain. juga admin bisa mengupload daftar stock opname terbaru ke dalam dashboard (sediakan menu dengan AI ) sehingga AI bisa membaca file excel stock opnamenya dan otomatis mengupdate data, dan tambahkan menu manual bagi petugas gudang.

Pengguna kemudian memprioritaskan: “Asal permintaan tidak diizinkan ketika mencoba login dengan menggunakan admin, temukan penyebabnya. dan bersihkan sehingga saya bisa login”.

### Pilihan yang dikonfirmasi
- Repo sudah berada di proyek ini. Kredensial admin utama tetap admin/admin.
- Peran: admin seluruh data/akun; petugas gudang barang dan penyaluran; petugas stock opname pencatatan pemeriksaan.
- Excel dan Berita Acara menggunakan format standar, wajib pemeriksaan sebelum perubahan stok, dokumen dapat dicetak.
- AI yang diminta: Gemini 3.8 Flash, API key sendiri sudah disampaikan di percakapan. Rahasia tidak disalin ke dokumentasi dan belum digunakan/disimpan/diintegrasikan; endpoint penyedianya belum diverifikasi. Jangan mengganti model atau memakai kunci lain tanpa izin.

### Penyebab login dan perbaikan terverifikasi
- Browser/proxy meneruskan Origin alamat internal cluster aplikasi, sementara backend hanya mengizinkan alamat publik. Bcrypt admin/admin sudah benar; 403 terjadi sebelum pemeriksaan kredensial.
- backend/.env CORS_ORIGINS kini memuat dua alamat eksplisit milik aplikasi: alamat publik dan alias internal cluster. Tidak ada wildcard.
- server.py membaca .env sebelum import auth dengan override=True. ALLOWED_ORIGINS yang sama dipakai pemeriksaan Origin dan CORSMiddleware; regex yang mengizinkan semua proyek preview dihapus. Backend direstart melalui supervisor setelah perubahan .env.
- Alias POST /api/auth/login ditambahkan, endpoint lama POST /api/auth/admin/login tetap dipakai UI.
- Pengujian pertama menemukan penghitung login gagal terfragmentasi oleh IP proxy. Diperbaiki menjadi penghitung atomik per username ternormalisasi, SHA-256, maksimal lima percobaan; percobaan keenam 429; login sukses menghapus hanya penghitung akun itu.
- Sesi tetap opaque cookie HttpOnly/Secure/SameSite=None, hash token di MongoDB. Tidak mengganti arsitektur ke JWT.
- Laporan pengujian final `/app/test_reports/iteration_4.json`: 9/9 pengujian backend lulus; browser admin/admin masuk dashboard, reload mempertahankan sesi, logout menolak akses selanjutnya. Origin asing tetap ditolak. Tidak ada masalah tersisa dalam lingkup login. OAuth Google tidak diuji.

### Fondasi permintaan besar yang mulai dikerjakan (belum selesai sebagai alur UI)
- backend/management.py: create/delete barang stok nol dengan audit, create akun peran admin/petugas/opname, reset password petugas dan pencabutan sesi. Endpoint utama tercakup regression dasar.
- backend/auth.py, admin_login.py dan format.js mengenali peran opname serta username. Barang masuk/keluar backend dibatasi admin/petugas; opname diizinkan koreksi.
- backend/stock_lock.py disiapkan untuk operasi stok multi-baris; belum dihubungkan ke impor/BA.
- Startup tidak lagi menghapus data operasional ketika versi katalog berubah dan tidak menolak startup karena jumlah barang dinamis. Katalog dasar saat ini 37, bukan catatan lama 33.
- Design blueprint diperbarui di design_guidelines.json dengan mempertahankan tema terang Sipostlog yang ada.

### Backlog terprioritas dan tugas selanjutnya
- P0 selesai: akses login admin, konsistensi Origin/CORS, sesi dan throttle terverifikasi.
- P1: UI kelola barang dan akun pengguna; penyaringan navigasi/perlindungan route sesuai tugas. Jangan mengklaim fitur baru sudah tersedia end-to-end.
- P1: Berita Acara Penyaluran bernomor otomatis, multi-barang, penerima, penandatangan, PDF/cetak; pastikan stok tidak terpotong dua kali.
- P1: impor Excel AI dengan pratinjau dan konfirmasi wajib, deteksi perubahan stok setelah pratinjau, validasi duplikat/nilai negatif/desimal/ID tak dikenal, audit dan idempotensi. Menu Excel lama masih langsung menerapkan impor template; belum ada alur AI.
- P1: lengkapi akses khusus petugas gudang dan stock opname pada UI, hindari membuka menu tindakan yang ditolak backend.
- P2: pergantian sandi admin melalui UI dengan seed yang tidak menimpa sandi baru; pindahkan on_event ke lifespan dan pecah server.py; bersihkan fallback URL/kredensial fixture pengujian lama ke konfigurasi pengujian.
- P2: notifikasi stok rendah dan penguatan transaksi multi-dokumen.

## Riwayat proyek sebelumnya (konteks lama; status terbaru di atas menjadi acuan)

## Problem Statement (asli)
Perbaiki tampilan sipostlog agar bisa di update di Excel, hilangkan seluruh versi AI nya, gunakan skill UI/UX Max, tambahkan dashboard penyaluran hanya di menu dalam web app, jumlah jangan diperlihatkan kepada masyarakat. Lihat repository dan uji semua fungsi backend. Tambahkan logo Kabupaten Banjar dan BPBD Kabupaten Banjar. Hilangkan badge "Transparansi Publik" dan paragraf deskripsi hero di halaman publik.

## Arsitektur
- Backend: FastAPI + MongoDB (Motor) — `/app/backend` (server.py, auth.py, excel_utils.py, seed_data.py)
- Frontend: React 18 CRA + Tailwind + Recharts + lucide-react + sonner — `/app/frontend`
- Auth: Emergent-managed Google OAuth; ADMIN_EMAIL=aldyfahrizan@gmail.com (backend/.env); roles admin/petugas/pending
- Logo: /app/frontend/public/logo/{kab-banjar,bpbd-banjar}.png
- Kode lama (Vite static app, .cline skills AI, .clinerules, Dockerfile, railway.json, Supabase refs) DIHAPUS.

## Personas
- Masyarakat: lihat status Aman/Menipis/Habis 33 item — tanpa angka.
- Petugas: dashboard stok & penyaluran, catat transaksi, ekspor/impor Excel.
- Admin: petugas + kelola pengguna + ubah ambang minimum.

## Core Requirements (static)
- 33 item wajib; stok berubah hanya via transaksi (IN/OUT/ADJUSTMENT) dengan audit trail
- Satuan tidak dijumlahkan lintas item
- Publik tidak melihat jumlah stok/penyaluran (API & UI)
- Dashboard Penyaluran hanya di menu internal

## Implemented (2026-09-19)
- Backend lengkap: public items/summary, auth session/me/logout, items, dashboards (stock, distribution w/ date range), transactions in/out/adjust/list, exports (stock, distribution 3 sheet, transactions), excel template + import (adjustments), users CRUD roles, seeding 33 item + 12 sample penyaluran
- Frontend: Public page (light), Login, Pending, AppShell sidebar (dark amber), Dashboard Stok, Dashboard Penyaluran, Catat Barang Masuk, Catat Penyaluran, Koreksi (+ ambang admin), Riwayat, Ekspor & Impor Excel (drag-drop), Kelola Pengguna
- Testing agent iteration_1: backend 32/32 pass, frontend semua flow pass

## Backlog
- P1: Konfirmasi dialog sebelum nonaktifkan pengguna; pagination riwayat (>500)
- P2: Notifikasi stok menipis (email/WA); impor Excel dibungkus transaksi Mongo; grafik tren stok per item
- P2: Tema cetak PDF laporan

## Test
- /app/auth_testing.md, /app/memory/test_credentials.md, /app/backend/tests/backend_test.py
