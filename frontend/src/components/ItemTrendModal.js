import { useEffect, useState } from "react";
import { X, TrendingUp } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../lib/api";
import { fmtDateTime, fmtNum } from "../lib/format";
import { Spinner } from "./StatCard";

export default function ItemTrendModal({ itemId, onClose }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!itemId) return;
    setData(null);
    api.get(`/items/${itemId}/history-chart`).then((r) => setData(r.data)).catch(() => {});
  }, [itemId]);

  if (!itemId) return null;
  const points = (data?.points || []).map((p) => ({ ...p, label: fmtDateTime(p.date) }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" data-testid="item-trend-modal" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl border border-ink-700 bg-ink-900 p-6 shadow-2xl animate-rise" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-amber-brand"><TrendingUp size={14} /> Tren Stok Per Item</div>
            <h3 className="mt-1 text-lg font-bold text-white" data-testid="item-trend-title">{data?.item_name || "Memuat…"}</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-ink-700/60" data-testid="item-trend-close"><X size={18} /></button>
        </div>
        {!data ? <Spinner /> : points.length === 0 ? (
          <div className="py-14 text-center text-sm text-slate-500" data-testid="item-trend-empty">Belum ada riwayat transaksi untuk item ini.</div>
        ) : (
          <div className="mt-5 h-64">
            <ResponsiveContainer>
              <LineChart data={points} margin={{ left: -20, right: 12, top: 8 }}>
                <XAxis dataKey="label" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={40} />
                <YAxis allowDecimals={false} tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [`${fmtNum(v)} ${data.unit}`, "Stok"]} labelFormatter={(l) => l} />
                <Line type="monotone" dataKey="stock" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3, fill: "#F59E0B" }} isAnimationActive activationDuration={600} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
