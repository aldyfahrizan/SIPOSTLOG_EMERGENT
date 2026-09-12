---
name: sipostlog-motion-dashboard
description: Prinsip animasi dan motion untuk dashboard SIPOSTLOG. Pastikan grafik menampilkan nilai asli, satuan tidak diubah, dan gerakan mendukung aksesibilitas (keyboard, reduced motion).
---

# Prinsip Motion Dashboard — SIPOSTLOG

## Tujuan

Animasi hanya untuk membantu membaca data, **bukan dekorasi**. Semua angka/grafik harus **sama persis dengan sumber** (INITIAL_LOGISTICS_ITEMS).

## Data Source

- Sumber utama: \src/data/initialData.ts\ atau database Supabase
- Jangan mengubah \currentStock\, \unit\, \category\, \minThreshold\ dari data awal
- Jika ada ketidakcocokan antara kode dan data, **stop** dan laporkan

## Aturan Grafik & Animasi

### Yang DBOLEH
✅ Angka/kartu muncul bertahap saat pertama load
✅ Bar chart tumbuh ke nilai akhir pada viewport pertama
✅ Tooltip muncul smooth saat hover/focus
✅ Tab switching dengan transisi pendek

### YANG TIDAK BOLEH
❌ Grafik berputar otomatis tanpa interaksi
❌ Efek 3D berat mengganggu fokus
❌ Animasi panjang mengaburkan konten penting
❌ Number counter terus bergerak

### Rasio vs Threshold

Untuk visualisasi stok per kategori dengan unit berbeda:
- **Bar chart**: tinggi = \currentStock / minThreshold × 100\%\) (persentase dari batas aman)
- **Warna**:
  - Hijau: \(currentStock >= minThreshold) ? 'emerald' : neutral'\
  - Merah: \currentStock < minThreshold * 0.25 ? 'red' : neutral'\
- Label selalu menampilkan **nilai absolut** (misal "150 kg" bukan "60%")

### Aksesibilitas

- Keyboard navigasi berfungsi di semua grafik
- \prefers-reduced-motion: reduce\ → gunakan fallback tabel statis
- Tooltips dapat difokuskan via keyboard
- Kontras warna teks ≥ 4.5:1

### Validasi

Setiap render grafiks harus:
1. Verifikasi jumlah bar = \data.items.length === 33\
2. Cocokkan \id\, \
ame\, \category\, \unit\ setiap item
3. Tampilkan alert/error jika ada mismatch sebelum user bisa lanjut

## Implementasi Contoh (Recharts + framer-motion)

\\\	ypescript
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const AnimationSafeBar = ({ dataKey, value }) => {
  const isCritical = value < THRESHOLD_MINIMUM;
  
  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: (value / maxAllowed) * 100 }}
      transition={{ duration: 0.3 }}
      className={isCritical ? 'bg-red-500' : 'bg-emerald-500'}
      aria-label={${dataKey}:  units}
    >
      {/* Tooltip accessible via tab */}
    </motion.div>
  );
};
\\\

## Testing Checklist

- [ ] 33 bar sesuai jumlah item data awal
- [ ] Setiap label menampilkan satuan yang benar
- [ ] Reduced motion respected (tab test tanpa animasi)
- [ ] Keyboard focus visible pada grafik interaktif
- [ ] Tooltip text sama dengan bar chart

---

**Version:** 1.0.0  
**Last Updated:** {{CURRENT_DATE}}  
**Project:** SIPOSTLOG
