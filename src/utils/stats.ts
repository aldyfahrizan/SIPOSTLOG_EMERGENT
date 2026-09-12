// src/utils/stats.ts
// Statistik agregat — HANYA counts, tidak pernah menjumlahkan nilai stok lintas satuan.
// Lihat .clinerules/01-sipostlog-project.md §1.C (satuan berbeda tidak boleh diagregasi)
import { ALL_LOGISTICS_ITEMS, type LogisticsItem } from "../data/initialData";

export interface CategoryCount {
  category: string;
  count: number;
}

export interface UnitCount {
  unit: string;
  count: number;
}

/** Jumlah item per kategori (untuk donut chart) */
export function getCategoryCounts(): CategoryCount[] {
  const map = new Map<string, number>();
  for (const item of ALL_LOGISTICS_ITEMS) {
    map.set(item.category, (map.get(item.category) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));
}

/** Item dengan stok <= ambang minimum */
export function getLowStockItems(): LogisticsItem[] {
  return ALL_LOGISTICS_ITEMS.filter((i) => i.currentStock <= i.minThreshold);
}

/** Jumlah jenis satuan yang dipakai (mis. BUAH, DOS, KG) */
export function getUnitCounts(): UnitCount[] {
  const map = new Map<string, number>();
  for (const item of ALL_LOGISTICS_ITEMS) {
    map.set(item.unit, (map.get(item.unit) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([unit, count]) => ({ unit, count }))
    .sort((a, b) => b.count - a.count);
}

// ⚠️ DELIBERATELY NOT PROVIDED: total stok gabungan lintas satuan.
// Menjumlahkan KG + DOS + BUAH menghasilkan angka menyesatkan — dilarang aturan proyek.
