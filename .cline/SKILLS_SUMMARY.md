# SIPOSTLOG — Skill Set Structure

## Overview

Proyek SIPOSTLOG (Sistem Informasi Pemantauan Stock Opname Logistik BPBD Kabupaten Banjar) telah dikonfigurasi dengan 6 skill dan 1 aturan aktif di `.cline/skills/` dan `.clinerules/`.

> **Catatan penting:** URL `https://github.com/aldyfahrizan/SIPOSTLOG.git` tidak dapat ditemukan (repository tidak ada atau bersifat privat). Folder `sipostlog/` dibuat manual di `C:\Users\ASUS\.gemini\antigravity\scratch\sipostlog`. Jika repo asli tersedia, clone dapat dilakukan ulang dan folder `.cline/` dipindahkan ke dalamnya.

## Struktur Direktori

```text
sipostlog/
├── .cline/
│   ├── skills/
│   │   ├── curate-professional-ui/
│   │   │   └── SKILL.md      ← Komponen UI profesional (dari AutoDocs lokal)
│   │   ├── frontend-design/
│   │   │   ├── SKILL.md      ← Desain UI khas BPBD (Apache-2.0)
│   │   │   └── LICENSE.txt   ← Lisensi Apache-2.0
│   │   ├── sipostlog-data-integrity/
│   │   │   └── SKILL.md      ← Larangan mengubah data sumber
│   │   ├── sipostlog-motion-dashboard/
│   │   │   └── SKILL.md      ← Prinsip animasi grafik
│   │   ├── vercel-react-best-practices/
│   │   │   └── SKILL.md      ← Optimasi performa React (MIT)
│   │   └── web-design-guidelines/
│   │       └── SKILL.md      ← Audit aksesibilitas (MIT)
│   └── SKILLS_SUMMARY.md     ← Dokumen ini
├── .clinerules/
│   └── 01-sipostlog-project.md  ← Aturan always-active (data integrity & security)
└── ...
```

## Daftar Skill (dengan Sumber)

| Skill | Deskripsi | Sumber/Lisensi | Catatan |
|-------|-----------|----------------|---------|
| `curate-professional-ui` | Memilih komponen UI tanpa template generik | Lokal (AutoDocs) | Gunakan sebelum membuat/mengubah komponen |
| `frontend-design` | Panduan tipografi, warna, layout khas BPBD | Anthropic / Apache-2.0 | Disesuaikan untuk dashboard logistik pemerintah |
| `web-design-guidelines` | Aksesibilitas UI + best practices | Vercel Labs / MIT | Skip Next.js-only rules |
| `vercel-react-best-practices` | Performa React/Vite (filtered) | Vercel Labs / MIT | Hanya terapkan aturan relevan untuk SPA |
| `sipostlog-motion-dashboard` | Animasi grafik dengan nilai asli | Custom SIPOSTLOG | Pastikan tidak mengubah satuan/stok |
| `sipostlog-data-integrity` | Larangan perubahan data sembarangan | Custom SIPOSTLOG | Aturan tertinggi proyek |

## Aturan Selalu Aktif (`01-sipostlog-project.md`)

### Prinsip Utama
1. **Data sumber read-only**: `src/data/initialData.ts` tidak boleh diubah manual
2. **33 items wajib valid**: Verifikasi jumlah item setiap load
3. **Satuan berbeda tetap terpisah**: Tidak boleh agregat jadi satu total misleading
4. **Server-side validation wajib**: Semua API endpoint harus cek role & stok
5. **Audit trail lengkap**: Setiap transaksi stok harus punya jejak immutable
6. **RLS aktif di Supabase**: Role-based access control wajib diterapkan
7. **Environment secrets aman**: Jangan commit `.env`, gunakan Railway secrets

### Violation Protocol
Jika menemukan ketidakcocokan data:
1. STOP proses apapun
2. SNAPSHOT data terbaru
3. REPORT ke admin
4. ROLLBACK ke backup valid
5. DOCUMENT root cause

## License & Attribution

| Paket | Lisensi | Atribusi Wajib |
|-------|---------|----------------|
| `frontend-design` | Apache-2.0 | "Adapted from anthropics/skills" + link ke LICENSE.txt |
| `web-design-guidelines` | MIT | "Based on Vercel Labs agent-skills" |
| `vercel-react-best-practices` | MIT | "Based on Vercel Engineering React Best Practices" |
| Custom SIPOSTLOG | MIT (default) | Copyright © BPBD Kabupaten Banjar, 2026 |

## Next Steps

Setelah konfigurasi ini selesai:
1. Clone/isi repo aplikasi SIPOSTLOG yang asli (URL saat ini 404 — perlu konfirmasi)
2. Setup Supabase instance untuk staging
3. Buat initial seed script (33 items)
4. Implementasi halaman login + OAuth callback localhost
5. Build landing page dengan grafik statis (validasi 33 items)
6. Deploy staging ke Railway (healthcheck enabled)
7. Verify semua skill terdeteksi di menu Cline Skills panel

## Contact

Project Lead: @aldyfahrizan
Approved by: BPBD Kabupaten Banjar Team
Version: 1.0.0
Date: September 12, 2026
