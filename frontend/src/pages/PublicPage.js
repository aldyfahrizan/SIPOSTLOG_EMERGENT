import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LogIn, Search, ShieldAlert, Boxes, CheckCircle2, Clock3 } from "lucide-react";
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import { api } from "../lib/api";
import { Brand, Logos } from "../components/Logos";
import { StatusBadge } from "../components/StatusBadge";
import { fmtDateTime } from "../lib/format";

function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target == null) return;
    let raf, start;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(target * p);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function CountUp({ value }) {
  const n = useCountUp(typeof value === "number" ? value : null);
  if (typeof value !== "number") return value;
  return Math.round(n);
}

function ReadinessGauge({ score }) {
  const animated = useCountUp(score, 1400);
  const color = score >= 70 ? "#34D399" : score >= 30 ? "#F59E0B" : "#F87171";
  return (
    <div className="relative h-52 w-52 sm:h-60 sm:w-60 shrink-0" data-testid="public-readiness-gauge">
      <ResponsiveContainer>
        <RadialBarChart innerRadius="72%" outerRadius="100%" data={[{ value: animated, fill: color }]} startAngle={90} endAngle={-270} barSize={14}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar background={{ fill: "rgba(255,255,255,0.08)" }} dataKey="value" cornerRadius={20} isAnimationActive={false} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="num text-4xl sm:text-5xl font-extrabold text-white leading-none" data-testid="public-readiness-score">{Math.round(animated)}%</div>
        <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 text-center px-4">Indeks Ketersediaan Logistik</div>
      </div>
    </div>
  );
}

function StatusBar({ counts, total }) {
  const [play, setPlay] = useState(false);
  useEffect(() => { const t = setTimeout(() => setPlay(true), 150); return () => clearTimeout(t); }, [counts]);
  const pct = (n) => (total ? (n / total) * 100 : 0);
  const segs = [
    { key: "aman", cls: "bg-emerald-400" },
    { key: "menipis", cls: "bg-amber-400" },
    { key: "habis", cls: "bg-red-500" },
  ];
  return (
    <div className="mt-6" data-testid="public-status-bar">
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10 flex">
        {segs.map((s) => <div key={s.key} className={`h-full ${s.cls} transition-[width] duration-[1400ms] ease-out`} style={{ width: `${play ? pct(counts[s.key]) : 0}%` }} />)}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-4 text-[11px] font-semibold text-slate-400">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Aman {counts.aman}</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> Menipis {counts.menipis}</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Habis {counts.habis}</span>
      </div>
    </div>
  );
}

function SummaryTile({ label, value, sub, icon: Icon, tone, testId }) {
  const tones = {
    slate: "bg-white border-slate-200 text-ink-900",
    green: "bg-emerald-600 border-emerald-700 text-white",
    amber: "bg-amber-brand border-amber-500 text-ink-900",
    dark: "bg-ink-900 border-ink-800 text-white",
  };
  return (
    <div data-testid={testId} className={`rounded-2xl border p-5 shadow-card hover:-translate-y-0.5 transition-transform duration-200 ${tones[tone]}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] opacity-70">{label}</span>
        <Icon size={18} className="opacity-70" />
      </div>
      <div className="num mt-3 text-4xl font-extrabold leading-none"><CountUp value={value} /></div>
      {sub && <div className="mt-2 text-xs opacity-75">{sub}</div>}
    </div>
  );
}

export default function PublicPage() {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [status, setStatus] = useState("semua");

  useEffect(() => {
    Promise.all([api.get("/public/items"), api.get("/public/summary")])
      .then(([i, s]) => { setItems(i.data); setSummary(s.data); })
      .catch(() => {});
  }, []);

  const categories = useMemo(() => ["Semua", ...(summary?.categories || []).map((c) => c.category)], [summary]);
  const filtered = useMemo(() => items.filter((i) =>
    (category === "Semua" || i.category === category) &&
    (status === "semua" || i.status === status) &&
    i.name.toLowerCase().includes(query.toLowerCase())
  ), [items, category, status, query]);

  const low = (summary?.status_counts.menipis || 0) + (summary?.status_counts.habis || 0);
  const score = summary ? Math.round((summary.status_counts.aman / summary.total_items) * 100) : 0;

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3">
          <Brand dark={false} />
          <Link to="/login" data-testid="public-login-button" className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-4 py-2 text-sm font-bold text-white hover:bg-ink-800 active:scale-[0.98] transition-[background-color,transform]">
            <LogIn size={15} /> Masuk Petugas
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-ink-900 grain">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.22),transparent_55%)]" />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-14 pb-14 grid lg:grid-cols-[1.3fr_auto] gap-10 items-center">
          <div className="animate-rise">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300" data-testid="public-live-badge">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulseDot" /> Data Live
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.05] text-white">Status Kesiapan <span className="text-amber-brand">Logistik Bencana</span> Kabupaten Banjar</h1>
            {summary && <StatusBar counts={summary.status_counts} total={summary.total_items} />}
            <div className="mt-7 hidden sm:flex"><Logos size={44} /></div>
          </div>
          <div className="flex justify-center lg:justify-end animate-rise" style={{ animationDelay: "120ms" }}>
            <ReadinessGauge score={score} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
          <SummaryTile testId="public-summary-total-items" label="Jenis Item" value={summary?.total_items ?? "—"} sub="logistik terdaftar" icon={Boxes} tone="slate" />
          <SummaryTile testId="public-summary-safe-items" label="Status Aman" value={summary?.status_counts.aman ?? "—"} sub="item di atas ambang" icon={CheckCircle2} tone="green" />
          <SummaryTile testId="public-summary-low-items" label="Perlu Perhatian" value={summary ? low : "—"} sub="menipis / habis" icon={ShieldAlert} tone="amber" />
          <SummaryTile testId="public-summary-last-updated" label="Pembaruan" value={summary?.last_updated ? new Date(summary.last_updated).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }) : "—"} sub={summary?.last_updated ? fmtDateTime(summary.last_updated) : "—"} icon={Clock3} tone="dark" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" data-testid="public-category-filters">
            {categories.map((c) => (
              <button key={c} onClick={() => setCategory(c)} data-testid={c === "Semua" ? "public-category-filter-all" : `public-category-filter-${c.toLowerCase().replace(/\s+/g, "-")}`}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors duration-150 border ${category === c ? "bg-ink-900 text-white border-ink-900" : "bg-white text-slate-600 border-slate-200 hover:border-ink-900"}`}>{c}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <select value={status} onChange={(e) => setStatus(e.target.value)} data-testid="public-status-filter" className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-ink-900">
              <option value="semua">Semua status</option><option value="aman">Aman</option><option value="menipis">Menipis</option><option value="habis">Habis</option>
            </select>
            <label className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari item…" data-testid="public-search-input" className="w-48 sm:w-64 rounded-full border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-ink-900 focus:ring-2 focus:ring-ink-900/10" />
            </label>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 stagger" data-testid="public-item-grid">
          {filtered.map((item) => (
            <div key={item.id} data-testid={`public-item-card-${item.id}`} className="group rounded-xl border border-slate-200 bg-white p-4 shadow-card hover:-translate-y-0.5 hover:border-amber-400 transition-[transform,border-color] duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-display font-bold text-ink-900 leading-snug">{item.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.category} · <span className="font-mono">{item.unit}</span></div>
                </div>
                <StatusBadge status={item.status} light testId="public-item-card-status" />
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="col-span-full py-12 text-center text-sm text-slate-500">Tidak ada item yang cocok.</div>}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3"><Logos size={32} /><span>© {new Date().getFullYear()} BPBD Kabupaten Banjar — SIPOSTLOG</span></div>
          <span>Status <b>Menipis</b> berarti stok berada pada atau di bawah ambang minimum.</span>
        </div>
      </footer>
    </div>
  );
}
