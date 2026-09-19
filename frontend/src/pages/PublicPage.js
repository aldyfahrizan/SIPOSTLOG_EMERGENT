import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LogIn, Search, ShieldAlert, Boxes, CheckCircle2, Clock3, RefreshCw } from "lucide-react";
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
  const color = score >= 70 ? "#059669" : score >= 30 ? "#D97706" : "#DC2626";
  return (
    <div className="relative h-52 w-52 sm:h-60 sm:w-60 shrink-0" data-testid="public-readiness-gauge">
      <ResponsiveContainer>
        <RadialBarChart innerRadius="72%" outerRadius="100%" data={[{ value: animated, fill: color }]} startAngle={90} endAngle={-270} barSize={14}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar background={{ fill: "#E2E8F0" }} dataKey="value" cornerRadius={20} isAnimationActive={false} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="num text-4xl sm:text-5xl font-extrabold text-brand-blue leading-none" data-testid="public-readiness-score">{score == null ? "—" : `${Math.round(animated)}%`}</div>
        <div className="mt-2 text-xs font-semibold text-slate-500 text-center px-4" data-testid="public-gauge-label">Jenis item berstatus aman</div>
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
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 flex">
        {segs.map((s) => <div key={s.key} className={`h-full ${s.cls} transition-[width] duration-[1400ms] ease-out`} style={{ width: `${play ? pct(counts[s.key]) : 0}%` }} />)}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
        <span data-testid="public-legend-aman" className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Aman {counts.aman}</span>
        <span data-testid="public-legend-menipis" className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-400" /> Menipis {counts.menipis}</span>
        <span data-testid="public-legend-habis" className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Habis {counts.habis}</span>
      </div>
    </div>
  );
}

function SummaryTile({ label, value, sub, icon: Icon, tone, testId }) {
  const tones = {
    slate: "bg-white border-blue-200 text-brand-blue",
    green: "bg-emerald-50 border-emerald-200 text-emerald-800",
    amber: "bg-orange-50 border-orange-200 text-orange-800",
    blue: "bg-sky-50 border-sky-200 text-sky-800",
  };
  return (
    <div data-testid={testId} className={`min-w-0 rounded-lg border p-4 sm:p-5 hover:-translate-y-0.5 transition-transform duration-200 ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-bold">{label}</span>
        <Icon size={18} className="shrink-0 opacity-70" />
      </div>
      <div className="num mt-3 text-2xl sm:text-4xl font-extrabold leading-none"><CountUp value={value} /></div>
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
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setError(false); setLoading(true);
    Promise.all([api.get("/public/items"), api.get("/public/summary")])
      .then(([i, s]) => { setItems(i.data); setSummary(s.data); })
      .catch(() => setError(true)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const categories = useMemo(() => ["Semua", ...(summary?.categories || []).map((c) => c.category)], [summary]);
  const filtered = useMemo(() => items.filter((i) =>
    (category === "Semua" || i.category === category) &&
    (status === "semua" || i.status === status) &&
    i.name.toLowerCase().includes(query.toLowerCase())
  ), [items, category, status, query]);

  const low = (summary?.status_counts.menipis || 0) + (summary?.status_counts.habis || 0);
  const score = summary ? (summary.total_items ? Math.round((summary.status_counts.aman / summary.total_items) * 100) : 0) : null;

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-3 items-center justify-between px-4 sm:px-6 py-3">
          <Brand dark={false} />
          <Link to="/login" data-testid="public-login-button" className="btn-primary !px-4 !py-2">
            <LogIn size={15} /> Masuk Admin
          </Link>
        </div>
      </header>

      <section className="relative border-b border-blue-100 bg-white" data-testid="public-overview">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-9 sm:py-12 grid md:grid-cols-[1fr_auto] gap-5 sm:gap-10 items-center">
          <div className="animate-rise min-w-0">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-orange" data-testid="public-live-badge">
              <span className={`h-2 w-2 rounded-full ${loading || error ? "bg-slate-400" : "bg-emerald-500 animate-pulseDot"}`} /> {loading ? "Memuat data…" : error ? "Data belum tersedia" : "Pemantauan Logistik · Kabupaten Banjar"}
            </div>
            <h1 className="mt-4 font-extrabold text-brand-blue" data-testid="public-app-title"><span className="block text-4xl sm:text-5xl lg:text-6xl">SIPOSTLOG</span><span className="mt-3 block max-w-2xl text-lg sm:text-2xl font-bold leading-relaxed">Sistem Informasi Pemantauan<br className="hidden sm:block" /> Stock Opname Logistik</span></h1>
            {summary && <StatusBar counts={summary.status_counts} total={summary.total_items} />}
          </div>
          <div className="hidden md:flex justify-center animate-rise" style={{ animationDelay: "120ms" }}>
            <ReadinessGauge score={score} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
          <SummaryTile testId="public-summary-total-items" label="Jenis Item" value={summary?.total_items ?? "—"} sub="logistik terdaftar" icon={Boxes} tone="slate" />
          <SummaryTile testId="public-summary-safe-items" label="Status Aman" value={summary?.status_counts.aman ?? "—"} sub="item di atas ambang" icon={CheckCircle2} tone="green" />
          <SummaryTile testId="public-summary-low-items" label="Perlu Perhatian" value={summary ? low : "—"} sub="menipis / habis" icon={ShieldAlert} tone="amber" />
          <SummaryTile testId="public-summary-last-updated" label="Pembaruan" value={summary?.last_updated ? new Date(summary.last_updated).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }) : "—"} sub={summary?.last_updated ? fmtDateTime(summary.last_updated) : "—"} icon={Clock3} tone="blue" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        {error && <div role="alert" data-testid="public-load-error" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Data stok belum dapat dimuat.<button onClick={load} data-testid="public-retry-button" className="inline-flex items-center gap-2 font-bold"><RefreshCw size={15} /> Coba lagi</button></div>}
        <h2 className="mb-5 text-base md:text-lg font-bold text-brand-blue" data-testid="public-items-heading">Status Logistik</h2>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" data-testid="public-category-filters">
            {categories.map((c) => (
              <button key={c} onClick={() => setCategory(c)} data-testid={c === "Semua" ? "public-category-filter-all" : `public-category-filter-${c.toLowerCase().replace(/\s+/g, "-")}`}
                aria-pressed={category === c} className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors duration-150 border ${category === c ? "bg-blue-50 text-brand-blue border-blue-300" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>{c}</button>
            ))}
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-2 min-w-0">
            <select aria-label="Filter status stok" value={status} onChange={(e) => setStatus(e.target.value)} data-testid="public-status-filter" className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-600">
              <option value="semua">Semua status</option><option value="aman">Aman</option><option value="menipis">Menipis</option><option value="habis">Habis</option>
            </select>
            <label className="relative min-w-0 flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input aria-label="Cari item logistik" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari item…" data-testid="public-search-input" className="w-full sm:w-56 rounded-full border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
            </label>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 stagger" data-testid="public-item-grid">
          {filtered.map((item) => (
            <div key={item.id} data-testid={`public-item-card-${item.id}`} className="group min-w-0 rounded-lg border border-slate-200 bg-white p-4 hover:-translate-y-0.5 hover:border-orange-300 transition-[transform,border-color] duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-display font-bold text-ink-900 leading-snug">{item.name}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.category} · <span className="font-mono">{item.unit}</span></div>
                </div>
                <StatusBadge status={item.status} light testId={`public-item-card-status-${item.id}`} />
              </div>
            </div>
          ))}
          {loading && <div data-testid="public-loading" className="col-span-full py-10 text-center text-sm text-slate-500">Memuat status logistik…</div>}
          {!loading && !error && filtered.length === 0 && <div data-testid="public-empty-state" className="col-span-full py-12 text-center text-sm text-slate-500">Tidak ada item yang cocok.</div>}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3"><Logos size={32} testId="public-footer-logos" /><span>© {new Date().getFullYear()} BPBD Kabupaten Banjar — SIPOSTLOG</span></div>
          <span>Status <b>Menipis</b> berarti stok berada pada atau di bawah ambang minimum.</span>
        </div>
      </footer>
    </div>
  );
}
