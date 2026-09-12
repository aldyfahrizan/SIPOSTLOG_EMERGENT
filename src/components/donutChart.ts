// src/components/donutChart.ts
// Donut chart SVG — jumlah ITEM per kategori (bukan volume stok, agar tidak menyesatkan lintas satuan)
import { getCategoryCounts } from "../utils/stats";

const PALETTE = [
  "#1a365d", "#2b6cb0", "#2f855a", "#c05621",
  "#805ad5", "#319795", "#d53f8c", "#d69e2e",
];

export function renderDonutChart(container: HTMLElement): void {
  const counts = getCategoryCounts();
  const total = counts.reduce((sum, c) => sum + c.count, 0);

  const R = 70;
  const CIRC = 2 * Math.PI * R;
  let offset = 0;

  const segments = counts
    .map((c, i) => {
      const dash = (c.count / total) * CIRC;
      const color = PALETTE[i % PALETTE.length];
      const seg = `<circle r="${R}" cx="90" cy="90" fill="none" stroke="${color}" stroke-width="28" stroke-dasharray="${dash.toFixed(2)} ${(CIRC - dash).toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}" transform="rotate(-90 90 90)"><title>${c.category}: ${c.count} item</title></circle>`;
      offset += dash;
      return seg;
    })
    .join("");

  const legend = counts
    .map(
      (c, i) => `
      <li class="legend-item">
        <span class="legend-dot" style="background:${PALETTE[i % PALETTE.length]}"></span>
        <span>${c.category} — <strong>${c.count}</strong> item</span>
      </li>`
    )
    .join("");

  container.innerHTML = `
    <div class="donut-wrap">
      <svg viewBox="0 0 180 180" role="img" aria-label="Jumlah item per kategori, total ${total} item" class="donut">
        ${segments}
        <text x="90" y="88" text-anchor="middle" class="donut-total">${total}</text>
        <text x="90" y="106" text-anchor="middle" class="donut-label">item</text>
      </svg>
      <ul class="legend">${legend}</ul>
    </div>`;
}
