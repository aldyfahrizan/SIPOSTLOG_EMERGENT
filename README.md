# SIPOSTLOG

Sistem Informasi Pemantauan Stock Opname Logistik — BPBD Kabupaten Banjar.

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build → dist/
npm run typecheck  # TypeScript validation
```

## Prinsip Proyek

1. **Data sumber read-only** — `src/data/initialData.ts` (33 item) tidak boleh diubah manual. Semua perubahan stok wajib melalui transaksi resmi dengan audit trail.
2. **Validasi 33 item** — aplikasi gagal load jika jumlah item bukan 33.
3. **Satuan tidak dicampur** — KG, DOS, BUAH, METER, dll. tidak pernah diagregasi jadi satu total.

Lihat `.clinerules/01-sipostlog-project.md` untuk aturan lengkap dan `.cline/SKILLS_SUMMARY.md` untuk daftar skill.

## Struktur

```
src/
├── data/initialData.ts   # 33 item logistik (source of truth)
└── main.tsx              # entry point — render daftar item
```

## Deployment

- **Docker**: multi-stage build (`Dockerfile`)
- **Railway**: konfigurasi di `railway.json`
- Secrets via Railway dashboard — jangan commit `.env`.

## Lisensi

MIT — © BPBD Kabupaten Banjar, 2026.
Skill pihak ketiga: lihat atribusi di `.cline/skills/`.
