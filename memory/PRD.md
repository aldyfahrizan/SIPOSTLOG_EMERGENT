# SIPOSTLOG — PRD & Progress

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
