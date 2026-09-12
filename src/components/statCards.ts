// src/components/statCards.ts
// Kartu statistik — muncul berurutan (fade-in), statis jika prefers-reduced-motion
import { ALL_LOGISTICS_ITEMS } from "../data/initialData";
import { getCategoryCounts, getLowStockItems, getUnitCounts } from "../utils/stats";

export function renderStatCards(container: HTMLElement): void {
  const categories = getCategoryCounts();
  const lowStock = getLowStockItems().length;
  const units = getUnitCounts().length;

  const stats = [
    { value: String(ALL_LOGISTICS_ITEMS.length), label: "Jenis Item", sub: "validasi: wajib 33" },
    { value: String(categories.length), label: "Kategori", sub: "komposisi per kategori" },
    { value: String(units), label: "Jenis Satuan", sub: "satuan asli dipertahankan" },
    { value: String(lowStock), label: "Stok Rendah", sub: "stok ≤ ambang minimum" },
  ];

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  container.innerHTML = stats
    .map((s, i) => {
      // Kartu muncul berurutan; tanpa animasi jika user memilih reduced motion
      const delay = prefersReduced ? "" : ` style="animation-delay:${i * 120}ms"`;
      return `
      <div class="stat-card"${delay}>
        <div class="stat-value">${s.value}</div>
        <div class="stat-label">${s.label}</div>
        <div class="stat-sub">${s.sub}</div>
      </div>`;
    })
    .join("");
}
