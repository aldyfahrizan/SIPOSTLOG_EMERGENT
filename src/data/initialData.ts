// src/data/initialData.ts
// Data sumber read-only untuk SIPOSTLOG - Dilarang diubah manual!

export const ALL_LOGISTICS_ITEMS = [
  { id: "item-001", name: "Beras 50kg", categoryId: "logistik-dapur", category: "Logistik Dapur", currentStock: 500, minThreshold: 100, unit: "KG", description: "Beras sebagai bahan makanan utama", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-002", name: "Mie Instan Kemasan", categoryId: "logistik-dapur", category: "Logistik Dapur", currentStock: 200, minThreshold: 50, unit: "DOS", description: "Mie instan kondisi baik", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-003", name: "Sabun Cuci Baju", categoryId: "logistik-kebersihan", category: "Logistik Kebersihan", currentStock: 300, minThreshold: 80, unit: "BUAH", description: "Sabun cuci baju cair/kotak", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-004", name: "Lampu Sorot 10W", categoryId: "logistik-listrik", category: "Logistik Listrik", currentStock: 50, minThreshold: 20, unit: "BUAH", description: "Lampu sorot LED 10 watt", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-005", name: "Masker Medis 3 Lapis", categoryId: "logistik-kesehatan", category: "Logistik Kesehatan", currentStock: 1000, minThreshold: 200, unit: "DOS", description: "Masker medis 3 lapis sekali pakai", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-006", name: "Seprei Polos 120x200cm", categoryId: "logistik-pembersihan", category: "Logistik Pembersihan", currentStock: 150, minThreshold: 50, unit: "METER", description: "Seprei polos kain katun", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-007", name: "Agar Botol Minum 500ml", categoryId: "logistik-air-minum", category: "Logistik Air Minum", currentStock: 1000, minThreshold: 300, unit: "BOTOL", description: "Botol minum stainless steel 500ml", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-008", name: "Tisu Basah Sanitasi", categoryId: "logistik-sanitasi", category: "Logistik Sanitasi", currentStock: 400, minThreshold: 100, unit: "PACK", description: "Tisu basah antiseptik", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-009", name: "Apar Kecil 5KG", categoryId: "logistik-apar", category: "Logistik Apar", currentStock: 25, minThreshold: 10, unit: "BUAH", description: "Apar 5KG emergency", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-010", name: "Peralatan Makan Set 10 Porsi", categoryId: "logistik-makanan", category: "Logistik Makanan", currentStock: 80, minThreshold: 30, unit: "SET", description: "Peralatan makan stainless 10 porsi", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-011", name: "Kain Pencuci Kasur", categoryId: "logistik-pembersihan", category: "Logistik Pembersihan", currentStock: 120, minThreshold: 30, unit: "METER", description: "Kain pencuci kasur", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-012", name: "Bantuan Peralatan Medis", categoryId: "logistik-kesehatan", category: "Logistik Kesehatan", currentStock: 45, minThreshold: 15, unit: "BUAH", description: "Bantuan peralatan medis darurat", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-013", name: "Senter Cadangan LED", categoryId: "logistik-listrik", category: "Logistik Listrik", currentStock: 75, minThreshold: 25, unit: "BUAH", description: "Senter cadangan LED", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-014", name: "Baterai AA 1.5V", categoryId: "logistik-listrik", category: "Logistik Listrik", currentStock: 500, minThreshold: 200, unit: "BUAH", description: "Baterai AA 1.5V", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-015", name: "Tali Pengaman Kecil", categoryId: "logistik-peralatan", category: "Logistik Peralatan", currentStock: 200, minThreshold: 50, unit: "METER", description: "Tali pengaman kecil", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-016", name: "Masker N95", categoryId: "logistik-kesehatan", category: "Logistik Kesehatan", currentStock: 300, minThreshold: 100, unit: "DOS", description: "Masker N95", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-017", name: "Hand Sanitizer 500ml", categoryId: "logistik-sanitasi", category: "Logistik Sanitasi", currentStock: 250, minThreshold: 80, unit: "BUAH", description: "Hand sanitizer 500ml", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-018", name: "Sarung Tangan Medis", categoryId: "logistik-kesehatan", category: "Logistik Kesehatan", currentStock: 400, minThreshold: 150, unit: "DOS", description: "Sarung tangan medis", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-019", name: "Kotak Pertolongan Pertama", categoryId: "logistik-kesehatan", category: "Logistik Kesehatan", currentStock: 60, minThreshold: 20, unit: "BUAH", description: "Kotak pertolongan pertama (P3K)", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-020", name: "Kertas Toilet Perkantoran", categoryId: "logistik-perkantoran", category: "Logistik Perkantoran", currentStock: 800, minThreshold: 300, unit: "ROLL", description: "Kertas toilet perkantoran", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-021", name: "Tisu Toilet Premium", categoryId: "logistik-perkantoran", category: "Logistik Perkantoran", currentStock: 600, minThreshold: 200, unit: "PACK", description: "Tisu toilet premium", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-022", name: "Galon Air Minum 5L", categoryId: "logistik-air-minum", category: "Logistik Air Minum", currentStock: 200, minThreshold: 80, unit: "GALON", description: "Galon air minum 5 liter", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-023", name: "Water Filter Portable", categoryId: "logistik-air-minum", category: "Logistik Air Minum", currentStock: 40, minThreshold: 15, unit: "BUAH", description: "Water filter portable", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-024", name: "Kantong Plastik Medis", categoryId: "logistik-sanitasi", category: "Logistik Sanitasi", currentStock: 500, minThreshold: 200, unit: "DOS", description: "Kantong plastik medis", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-025", name: "Kantong Plastik Sampah", categoryId: "logistik-sanitasi", category: "Logistik Sanitasi", currentStock: 300, minThreshold: 100, unit: "DOS", description: "Kantong plastik sampah", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-026", name: "Handuk Mandi Putih", categoryId: "logistik-pembersihan", category: "Logistik Pembersihan", currentStock: 250, minThreshold: 80, unit: "BUAH", description: "Handuk mandi putih", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-027", name: "Deterjen Cair", categoryId: "logistik-pembersihan", category: "Logistik Pembersihan", currentStock: 400, minThreshold: 150, unit: "KG", description: "Deterjen cair", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-028", name: "Sabun Mandi Antiseptik", categoryId: "logistik-kesehatan", category: "Logistik Kesehatan", currentStock: 350, minThreshold: 120, unit: "BUAH", description: "Sabun mandi antiseptik", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-029", name: "Shower Cap", categoryId: "logistik-perkantoran", category: "Logistik Perkantoran", currentStock: 200, minThreshold: 60, unit: "BUAH", description: "Shower cap", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-030", name: "Hair Dryer Portabel", categoryId: "logistik-perkantoran", category: "Logistik Perkantoran", currentStock: 30, minThreshold: 10, unit: "BUAH", description: "Hair dryer portabel", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-031", name: "Setrika Listrik", categoryId: "logistik-perkantoran", category: "Logistik Perkantoran", currentStock: 25, minThreshold: 8, unit: "BUAH", description: "Setrika listrik", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-032", name: "Kipas Angin Mini", categoryId: "logistik-perkantoran", category: "Logistik Perkantoran", currentStock: 40, minThreshold: 15, unit: "BUAH", description: "Kipas angin mini", lastUpdated: "2026-09-10T14:30:00Z" },
  { id: "item-033", name: "AC Portabel", categoryId: "logistik-perkantoran", category: "Logistik Perkantoran", currentStock: 15, minThreshold: 5, unit: "BUAH", description: "AC portabel", lastUpdated: "2026-09-10T14:30:00Z" },
];

// ✅ Validasi jumlah item — WAJIB tepat 33 (lihat .clinerules/01-sipostlog-project.md §1.B)
if (ALL_LOGISTICS_ITEMS.length !== 33) {
  throw new Error(`Data integrity violation: Expected 33 items, got ${ALL_LOGISTICS_ITEMS.length}`);
}

export type LogisticsItem = (typeof ALL_LOGISTICS_ITEMS)[number];
