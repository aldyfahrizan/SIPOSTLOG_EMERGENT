// src/components/barChart.ts
// Bar chart — stok vs ambang minimum PER ITEM dengan satuan asli.
// Bar tumbuh ke nilai final saat pertama terlihat (IntersectionObserver);
// statis (tanpa transisi) jika prefers-reduced-motion.
import { ALL_LOGISTICS_ITEMS } from "../data/initialData";

export function renderBarChart(container: HTMLElement): void {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const maxStock = Math.max(...ALL_LOGISTICS_ITEMS.map((i) => i.currentStock));

  container.innerHTML = ALL_LOGISTICS_ITEMS.map((item) => {
    const stockPct = (item.currentStock / maxStock) * 100;
    const thresholdPct = Math.min((item.minThreshold / maxStock) * 100, 100);
    const isLow = item.currentStock <= item.minThreshold;
    return `
      <div class="bar-group">
        <div class="bar-values">${item.currentStock} ${item.unit} <span class="bar-threshold">— min ${item.minThreshold}</span></div>
        <div class="bar-track" role="img" aria-label="${item.name}: stok ${item.currentStock} ${item.unit}, ambang minimum ${item.minThreshold} ${item.unit}">
          <div class="bar-fill${isLow ? " bar-low" : ""}" data-final="${stockPct.toFixed(2)}"></div>
          <div class="bar-min-marker" style="left:${thresholdPct.toFixed(2)}%"></div>
        </div>
        <div class="bar-name">${item.name}</div>
      </div>`;
  }).join("");

  const fills = Array.from(container.querySelectorAll<HTMLElement>(".bar-fill"));

  // Fallback statis: reduced motion atau browser tanpa IntersectionObserver
  if (prefersReduced || typeof IntersectionObserver === "undefined") {
    fills.forEach((f) => {
      f.style.width = `${f.dataset.final}%`;
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        el.classList.add("animated");
        el.style.width = `${el.dataset.final}%`;
        observer.unobserve(el);
      });
    },
    { threshold: 0.2 }
  );

  fills.forEach((f) => observer.observe(f));
}
