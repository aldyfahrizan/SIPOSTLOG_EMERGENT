# Aturan Proyek SIPOSTLOG — Selalu Aktif

## Prinsip Utama

**Data sumber tidak boleh diubah kecuali melalui mekanisme transaksi resmi.** Ini adalah aturan tertinggi yang harus dipatuhi setiap saat.

---

## 1. Data Integrity Rules

### A. Dilarang Mengubah \INITIAL_LOGISTICS_ITEMS\

- Semua nilai \currentStock\, \unit\, \category\, \minThreshold\ di \src/data/initialData.ts\ **hanya boleh dibaca** (read-only)
- Jika ada perubahan stok: gunakan API endpoint \POST /api/inventory/update\ dengan audit trail
- Jangan edit file TypeScript secara manual untuk mengubah jumlah barang

### B. Validasi Jumlah Item Setiap Load

`	ypescript
// ✅ WAJIB dilakukan setiap kali load data
if (data.items.length !== 33) {
  console.error('❌ Mismatch: Expected 33 items, got', data.items.length);
  throw new Error('Data integrity violation');
}
`

### C. Satuan Berbeda Tidak Boleh Disamakan

- Tampilkan satuan asli: "150 KG", "24 DOS", "8 LAMPU"
- **Tidak boleh** agregat jadi "200 units" atau "500 items" dalam satu total tunggal
- Dashboard hanya tampilkan **komposisi per kategori**, bukan volume gabungan

---

## 2. Transaction Security

### A. Server-Side Validation Wajib

`	ypescript
// ✅ AMAN
async function deductStock(itemId: string, quantity: number, userId: string): Promise<void> {
  // 1. Cek stok valid server-side
  const stock = await db.inventory.find(itemId);
  if (!stock || stock.currentQuantity < quantity) {
    throw new Error('Insufficient stock');
  }

  // 2. Prevent double-spending via single transaction
  await db.(async (tx) => {
    await tx.inventory.update({ itemId, currentQuantity: stock.currentQuantity - quantity });
    await tx.transactions.create({ itemId, quantity, userId, type: 'OUT' });
  });
}
`

❌ **DILARANG**: Update langsung tanpa validasi server

`	ypescript
// ❌ BERBAHAYA – client-side update langsung
async function unsafeUpdate(itemId: string, newQuantity: number): Promise<void> {
  await db.inventory.update({ id: itemId, currentStock: newQuantity });
  // No audit trail! No validation!
}
`

---

## 3. Environment & Secrets Management

### A. Jangan Commit .env ke Git

Pastikan \.gitignore\ berisi:

`gitignore
.env
.env.local
.env.production
*.key.json
secrets.json
`

### B. Variabel Penting di Railway

Setelah deploy ke Railway, pastikan variabel ini tersedia:

| Variable | Type | Required |
|----------|------|----------|
| SUPABASE_URL | secret | ✅ |
| SUPABASE_ANON_KEY | public | ✅ |
| SUPABASE_SERVICE_ROLE_KEY | secret | ✅ |
| GOOGLE_CLIENT_ID | secret | ✅ |
| GOOGLE_CLIENT_SECRET | secret | ✅ |
| GEMINI_API_KEY | secret | ✅ |
| DATABASE_URL | managed | ✅ |

---

## 4. Role-Based Access Control

### A. Role Levels

1. **public** — akses halaman landing/login saja
2. **petugas** — bisa input catat-barang-masuk, penyaluran, request opname
3. **supervisor** — approve/reject request petugas
4. **admin** — manage user, role, export laporan, konfigurasi sistem

### B. RLS Policy Example (Supabase)

`sql
-- Hanya petugas dan above yang bisa insert stock
CREATE POLICY "Petugas can insert inventory transactions" 
ON inventory_transactions FOR INSERT 
WITH CHECK (auth.jwt()->>'role' IN ('petugas', 'supervisor', 'admin'));
`

---

## 5. Audit Trail Requirements

### A. Semua Perubahan Harus Dicatat

Format wajib untuk setiap operasi stok:

`json
{
  "transactionId": "uuid-v4",
  "type": "IN | OUT | ADJUSTMENT",
  "itemId": "string-id",
  "previousQuantity": number,
  "newQuantity": number,
  "changeQuantity": number,
  "unit": "KG | DOS | BUAH | METER",
  "userId": "user-uid",
  "role": "petugas|supervisor|admin",
  "reason": "string",
  "timestamp": "ISO-8601",
  "ipAddress": "IPv4/IPv6"
}
`

### B. Retention Policy

- Log transaksi disimpan minimal **3 tahun** (untuk keperluan inspeksi BPBD)
- Backup harian database (simpan di S3/minio dengan lifecycle policy)

---

## 6. Operational Checklist

### Pre-Deployment

- [ ] Semua endpoint API melakukan role check server-side
- [ ] RLS aktif di Supabase untuk semua tabel publik
- [ ] Environment variables sudah dipisahkan (.env.test vs .env.production)
- [ ] Initial data checksum tersimpan di \system_config.last_known_hash\
- [ ] Backup database otomatis dikonfigurasi

### Post-Deployment Monitoring

- [ ] Healthcheck endpoint /api/health return 200 OK
- [ ] Error logging terintegrasi dengan monitoring tool
- [ ] Alert on failed auth attempts > 5x/hour
- [ ] Disk usage monitoring (backup retention)

---

## 7. Violation Protocol

Jika ditemukan pelanggaran data integrity:

1. **STOP** proses apapun yang melibatkan perubahan data
2. **SNAPSHOT** data terbaru (copy folder/database state)
3. **REPORT** ke admin + screenshot error/output
4. **ROLLBACK** ke versi backup terakhir yang valid
5. **DOCUMENT** root cause + solusi preventif

**TIDAK BOLEH** mencoba "memperbaiki" sendiri tanpa konfirmasi!

---

## 8. References

- Skill: \sipostlog-data-integrity\
- Skill: \sipostlog-motion-dashboard\
- Dokumen: \docs/integration-patterns.md\
- Repo: https://github.com/aldyfahrizan/SIPOSTLOG

---

**Version:** 1.0.0  
**Effective Date:** September 12, 2026  
**Project:** SIPOSTLOG  
**Approved By:** BPBD Kabupaten Banjar Team
