// src/main.tsx — Entry point SIPOSTLOG
// Memuat statistik, donut chart, bar chart dengan animasi grow-on-intersect
import { ALL_LOGISTICS_ITEMS } from "./data/initialData";
import { renderStatCards } from "./components/statCards";
import { renderDonutChart } from "./components/donutChart";
import { renderBarChart } from "./components/barChart";

function renderItemsList(): void {
  const listEl = document.getElementById("item-list");
  if (!listEl) return;

  // Guardrail: harus tepat 33 item (aturan .clinerules §1.B)
  if (ALL_LOGISTICS_ITEMS.length !== 33) {
    listEl.innerHTML = `<p style="color:#c53030;padding:16px;">
      ❌ Data integrity violation: expected 33 items, got ${ALL_LOGISTICS_ITEMS.length}.
      Proses dihentikan sesuai aturan proyek.
    </p>`;
    return;
  }

  listEl.innerHTML = ALL_LOGISTICS_ITEMS.map((item) => {
    const isLow = item.currentStock <= item.minThreshold;
    return `
      <div class="item-row">
        <div>
          <div class="item-name">${item.name}</div>
          <span class="category-tag">${item.category}</span>
        </div>
        <div class="item-stock" style="color:${isLow ? "#c53030" : "#2f855a"}">
          ${item.currentStock} <span class="item-unit">${item.unit}</span>
        </div>
      </div>`;
  }).join("");
}

function main(): void {
  // Data validation guardrail
  if (ALL_LOGISTICS_ITEMS.length !== 33) {
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<p style="color:#c53030;padding:16px;background:#fff5f5;">
        ❌ Data integrity violation: expected 33 items, got ${ALL_LOGISTICS_ITEMS.length}.
        Render dihentikan.
      </p>`
    );
    return;
  }

  const statsGrid = document.getElementById("stat-cards");
  if (statsGrid) renderStatCards(statsGrid);

  const barScroll = document.getElementById("bar-chart");
  if (barScroll) renderBarChart(barScroll);

  const donutDiv = document.getElementById("donut-chart");
  if (donutDiv) renderDonutChart(donutDiv);

  renderItemsList();
}

main();
