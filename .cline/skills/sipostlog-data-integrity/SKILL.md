---
name: sipostlog-data-integrity
description: Larangan mengubah data sumber SIPOSTLOG. Pastikan 33 item logistik tetap utuh, satuan tidak dijumlahkan sembarangan, dan semua perubahan hanya melalui transaksi resmi dengan audit trail.
---

# Integritas Data — SIPASTLOG

## Prinsip Utama

**Data sumber adalah kebenaran mutlak.** Semua visualisasi/grafik harus menampilkan nilai yang sama persis dengan \src/data/initialData.ts\ atau database Supabase.

## Aturan Ketat

### 1. Dilarang Mengubah Nilai Awal

- Tidak boleh mengubah \currentStock\, \unit\, \category\, \minThreshold\ dari data awal
- Jika menemukan ketidakcocokan: **stop**, snapshot, laporkan sebelum proceed
- Jangan "perbaiki" berdasarkan estimasi manual

### 2. Satuan Berbeda Tidak Boleh Disamakan

- **KG** (beras, gula), **BUAH** (lampu, APD), **DOS** (tisu), **METER** (seprei)
- **TIDAK BOLEH** dibuat total agregat seperti "500 units" — ini menyesatkan
- Grafik harus menampilkan:
  - Per kategori (donut chart = jumlah item per kategori, bukan volume)
  - Per item dengan satuan asli (bar chart = stok vs threshold per barang)

### 3. Perubahan Hanya Via Transaksi Sah

- Stok bertambah via catat-barang-masuk dengan approval supervisor
- Stok berkurang via penyaluran atau consumption dengan audit trail
- Setiap perubahan:
  - Harus punya \userId\, \	imestamp\, \itemId\, \quantity\, \eason\
  - Record disimpan di \	ransactions\ tabel
  - Immutable (tidak bisa delete, hanya add counter-balance entry)

### 4. Verifikasi Impor Database

Setiap kali import ulang atau seed:
1. Hitung checksum data awal: \sha256(JSON.stringify(INITIAL_LOGISTICS_ITEMS))\
2. Bandingkan dengan stored hash (simpan di \system_config\)
3. Mismatch → alert + rollback otomatis ke versi backup terakhir

### 5. Pemisahan Data Testing vs Production

- .env.test → menggunakan dataset dummy dengan nama berbeda (misal "Test Item #1")
- .env.production → wajib menggunakan dataset asli BPBD
- Script seeding production **harus** require konfirmasi dua tahap (y/n + admin signature)

## Audit Trail

Semua perubahan harus dicatat dalam format:

`json
{
  "transactionId": "uuid-v4",
  "type": "IN | OUT | ADJUSTMENT",
  "itemId": "unique-string-id",
  "previousQuantity": 500,
  "newQuantity": 450,
  "changeQuantity": -50,
  "unit": "KG",
  "userId": "user-supabase-uid",
  "role": "petugas|supervisor|admin",
  "reason": "Penyaluran ke Posko A",
  "timestamp": "2026-09-12T14:30:00Z",
  "ipAddress": "xxx.xxx.xxx.xxx",
  "signature": "base64-signature-if-required"
}
`

## Validasi Otomatis

Sebelum deploy/approve PR:
- [ ] Jumlah items == 33 (dari \INITIAL_LOGISTICS_ITEMS\)
- [ ] Tidak ada field null pada required fields (\id\, \
ame\, \unit\, \currentStock\)
- [ ] Semua \categoryId\ valid (link ke \categories\ table)
- [ ] No negative stock values (validation server-side)
- [ ] Audit trail lengkap untuk perubahan > 1 hari terakhir

## Contoh Kode Aman

\\\	ypescript
// ✅ AMAN
async function deductStock(itemId: string, quantity: number, userId: string): Promise<void> {
  // 1. Server-side validation
  const stock = await db.inventory.find(itemId);
  if (!stock || stock.currentQuantity < quantity) {
    throw new Error('Insufficient stock');
  }

  // 2. Prevent double-spending (single transaction)
  await db.(async (tx) => {
    // Deduct inventory
    await tx.inventory.update({ 
      itemId, 
      currentQuantity: stock.currentQuantity - quantity 
    });
    
    // Create audit record
    await tx.transactions.create({
      type: 'OUT',
      itemId,
      previousQuantity: stock.currentQuantity,
      newQuantity: stock.currentQuantity - quantity,
      changeQuantity: -quantity,
      unit: stock.unit,
      userId,
      reason: 'User deduction request'
    });
  });
}
\\\

❌ TIDAK BOLEH:
\\\	ypescript
// ❌ BERBAHAYA – client dapat langsung update tanpa validasi
async function unsafeUpdate(itemId: string, quantity: number): Promise<void> {
  await db.inventory.update({ 
    id: itemId, 
    currentStock: quantity 
  });
  // Tidak ada audit trail!
}
\\\

## Checklist Keamanan Sebelum Deploy

- [ ] Semua endpoint API melakukan role check server-side (RLS aktif di Supabase)
- [ ] Admin-only operations require two-factor confirmation
- [ ] Backup harian database dijalankan otomatis
- [ ] Environment variables sudah dipisahkan: \SUPABASE_SERVICE_ROLE_KEY\, \DATABASE_URL\
- [ ] .env tidak commit ke Git (pastikan \.gitignore\ benar)
- [ ] Initial data hash stored di \system_config.last_known_hash\

---

**Version:** 1.0.0  
**Last Updated:** {{CURRENT_DATE}}  
**Project:** SIPOSTLOG  
**Approval Required by:** BPBD Kabupaten Banjar Team
