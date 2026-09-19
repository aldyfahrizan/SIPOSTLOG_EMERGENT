import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { fmtNum } from "../lib/format";
import { StatusBadge } from "./StatusBadge";

export function useItems() {
  const [items, setItems] = useState([]);
  const reload = () => api.get("/items").then((r) => setItems(r.data)).catch(() => {});
  useEffect(() => { reload(); }, []);
  return [items, reload];
}

export function ItemSelect({ items, value, onChange, testId = "item-select" }) {
  return (
    <div>
      <label className="label">Item Logistik</label>
      <select className="field" value={value} onChange={(e) => onChange(e.target.value)} data-testid={testId} required>
        <option value="">— Pilih item —</option>
        {items.map((i) => <option key={i.id} value={i.id}>{i.name} · {i.category}</option>)}
      </select>
    </div>
  );
}

export function ItemPreview({ item }) {
  if (!item) return <div className="rounded-xl border border-dashed border-ink-700 p-6 text-center text-sm text-slate-500">Pilih item untuk melihat posisi stok saat ini.</div>;
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-5" data-testid="item-preview">
      <div className="flex items-start justify-between gap-3">
        <div><div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{item.category}</div><div className="mt-1 font-display text-lg font-bold text-white">{item.name}</div></div>
        <StatusBadge status={item.status} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div><div className="text-[11px] uppercase tracking-wider text-slate-500">Stok saat ini</div><div className="num text-2xl font-bold text-white" data-testid="item-preview-stock">{fmtNum(item.currentStock)} <span className="text-sm text-slate-400">{item.unit}</span></div></div>
        <div><div className="text-[11px] uppercase tracking-wider text-slate-500">Ambang minimum</div><div className="num text-2xl font-bold text-slate-300">{fmtNum(item.minThreshold)} <span className="text-sm text-slate-500">{item.unit}</span></div></div>
      </div>
      {item.description && <p className="mt-3 text-xs text-slate-400">{item.description}</p>}
    </div>
  );
}

export function Field({ label, children, hint }) {
  return <div><label className="label">{label}</label>{children}{hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}</div>;
}

export function ResultCard({ tx, onReset }) {
  if (!tx) return null;
  return (
    <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5 animate-rise" data-testid="transaction-result">
      <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Transaksi tercatat</div>
      <div className="mt-1 font-mono text-xs text-slate-400">{tx.transaction_id}</div>
      <div className="mt-3 text-sm text-slate-200">{tx.item_name}: <span className="num">{fmtNum(tx.previous_quantity)}</span> → <b className="num text-white">{fmtNum(tx.new_quantity)}</b> {tx.unit} <span className={tx.change_quantity >= 0 ? "text-emerald-400" : "text-amber-400"}>({tx.change_quantity > 0 ? "+" : ""}{fmtNum(tx.change_quantity)})</span></div>
      <button onClick={onReset} className="btn-ghost mt-4 !py-1.5 text-xs" data-testid="transaction-result-reset">Catat lagi</button>
    </div>
  );
}
