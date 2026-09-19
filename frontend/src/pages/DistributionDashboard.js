import { useEffect, useState } from "react";
import { Download, MapPin, Truck, Boxes, Flame } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { api, downloadFile } from "../lib/api";
import StatCard, { EmptyState, PageHeader, Panel, Spinner } from "../components/StatCard";
import DateRangePicker from "../components/DateRangePicker";
import { fmtDateTime, fmtNum, fmtShortDay, todayYMD } from "../lib/format";

const PALETTE = ["#F59E0B", "#38BDF8", "#34D399", "#F472B6", "#A78BFA", "#FB923C"];
const TT = { background: "#0F172A", border: "1px solid #334155", borderRadius: 8, fontSize: 12 };

export default function DistributionDashboard() {
  const [range, setRange] = useState({ start: todayYMD(-29), end: todayYMD() });
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!range.start || !range.end) return;
    setData(null);
    api.get("/dashboard/distribution", { params: range }).then((r) => setData(r.data)).catch((e) => toast.error(e.response?.data?.detail || "Gagal memuat"));
  }, [range]);

  const exportXlsx = async () => {
    setBusy(true);
    try { const n = await downloadFile(`/export/distribution?start=${range.start}&end=${range.end}`, "penyaluran.xlsx"); toast.success(`Berkas ${n} diunduh`); }
    catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  return (
    <div data-testid="distribution-dashboard">
      <PageHeader eyebrow="Dashboard Internal" title="Dashboard Penyaluran" description="Rekapitulasi penyaluran logistik ke posko dan wilayah terdampak. Data ini hanya tersedia bagi petugas dan tidak ditampilkan ke publik."
        actions={<button onClick={exportXlsx} disabled={busy} className="btn-primary" data-testid="distribution-export-button"><Download size={14} /> Ekspor Excel</button>} />
      <div className="mb-6"><DateRangePicker value={range} onChange={setRange} /></div>

      {!data ? <Spinner /> : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
            <StatCard testId="dist-stat-total" label="Transaksi Penyaluran" value={fmtNum(data.total_transactions)} sub={`${data.range.start} s/d ${data.range.end}`} accent="amber" icon={Truck} />
            <StatCard testId="dist-stat-destinations" label="Tujuan" value={fmtNum(data.unique_destinations)} sub="posko / desa / kecamatan" accent="blue" icon={MapPin} />
            <StatCard testId="dist-stat-items" label="Jenis Item Disalurkan" value={fmtNum(data.unique_items)} sub="dari 33 item" accent="green" icon={Boxes} />
            <StatCard testId="dist-stat-incidents" label="Jenis Kejadian" value={fmtNum(data.per_incident.length)} sub={data.per_incident[0] ? `terbanyak: ${data.per_incident[0].incident_type}` : "—"} accent="red" icon={Flame} />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <Panel title="Tren Penyaluran Harian" subtitle="Jumlah transaksi penyaluran per hari" testId="panel-daily-trend">
              <div className="h-60">
                <ResponsiveContainer>
                  <AreaChart data={data.daily} margin={{ left: -20, right: 8, top: 8 }}>
                    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F59E0B" stopOpacity={0.5} /><stop offset="100%" stopColor="#F59E0B" stopOpacity={0} /></linearGradient></defs>
                    <XAxis dataKey="date" tickFormatter={fmtShortDay} tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
                    <YAxis allowDecimals={false} tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TT} labelFormatter={(l) => `Tanggal ${l}`} formatter={(v) => [`${v} transaksi`, ""]} />
                    <Area type="monotone" dataKey="count" stroke="#F59E0B" strokeWidth={2} fill="url(#g)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel title="Per Jenis Kejadian" subtitle="Proporsi transaksi" testId="panel-incidents">
              {data.per_incident.length === 0 ? <EmptyState text="Belum ada penyaluran." /> : (
                <div className="flex items-center gap-4">
                  <div className="h-44 w-44 shrink-0">
                    <ResponsiveContainer><PieChart><Pie data={data.per_incident} dataKey="count" nameKey="incident_type" innerRadius={48} outerRadius={70} paddingAngle={3} stroke="none">
                      {data.per_incident.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}</Pie><Tooltip contentStyle={TT} /></PieChart></ResponsiveContainer>
                  </div>
                  <ul className="space-y-2 text-sm flex-1">
                    {data.per_incident.map((p, i) => <li key={p.incident_type} className="flex items-center justify-between gap-2"><span className="flex items-center gap-2 text-slate-300"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />{p.incident_type}</span><span className="num font-bold text-white">{p.count}</span></li>)}
                  </ul>
                </div>
              )}
            </Panel>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <Panel title="Total per Item" subtitle="Dalam satuan asli masing-masing item" testId="panel-per-item">
              {data.per_item.length === 0 ? <EmptyState text="Belum ada penyaluran pada rentang ini." /> : (
                <div className="overflow-x-auto scrollbar-thin -mx-2"><table className="tbl"><thead><tr><th>Item</th><th className="text-right">Total</th><th className="text-right">Transaksi</th></tr></thead>
                  <tbody>{data.per_item.map((p) => <tr key={p.item_id} data-testid={`dist-item-${p.item_id}`}><td><div className="font-semibold text-white">{p.name}</div><div className="text-[11px] text-slate-500">{p.category}</div></td><td className="text-right num font-bold text-amber-brand">{fmtNum(p.quantity)} <span className="text-slate-500 text-xs font-normal">{p.unit}</span></td><td className="text-right num text-slate-300">{p.count}</td></tr>)}</tbody></table></div>
              )}
            </Panel>
            <Panel title="Per Tujuan" subtitle="Posko, desa, atau kecamatan penerima" testId="panel-per-destination">
              {data.per_destination.length === 0 ? <EmptyState text="Belum ada tujuan pada rentang ini." /> : (
                <>
                  <div className="h-40 mb-4">
                    <ResponsiveContainer><BarChart data={data.per_destination.slice(0, 6)} margin={{ left: -24, right: 8 }}>
                      <XAxis dataKey="destination" tick={{ fill: "#64748B", fontSize: 9 }} axisLine={false} tickLine={false} interval={0} tickFormatter={(v) => (v.length > 14 ? v.slice(0, 13) + "…" : v)} />
                      <YAxis allowDecimals={false} tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={TT} cursor={{ fill: "rgba(245,158,11,0.06)" }} formatter={(v) => [`${v} transaksi`, ""]} />
                      <Bar dataKey="count" fill="#38BDF8" radius={[6, 6, 0, 0]} barSize={22} /></BarChart></ResponsiveContainer>
                  </div>
                  <ul className="divide-y divide-ink-700/60">
                    {data.per_destination.map((d) => (
                      <li key={d.destination} className="py-2.5" data-testid={`dist-dest-${d.destination.replace(/\s+/g, "-").toLowerCase()}`}>
                        <div className="flex items-center justify-between"><span className="text-sm font-semibold text-white flex items-center gap-1.5"><MapPin size={13} className="text-sky-400" />{d.destination}</span><span className="text-xs text-slate-400">{d.count} transaksi</span></div>
                        <div className="mt-1 flex flex-wrap gap-1.5">{d.items.map((it) => <span key={it.name + it.unit} className="rounded-md bg-ink-900/70 border border-ink-700 px-2 py-0.5 text-[11px] text-slate-300"><b className="num text-white">{fmtNum(it.quantity)}</b> {it.unit} {it.name}</span>)}</div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Panel>
          </div>

          <Panel className="mt-6" title="Penyaluran Terbaru" subtitle="15 transaksi terakhir dalam rentang" testId="panel-recent-distributions">
            {data.recent.length === 0 ? <EmptyState text="Belum ada data." /> : (
              <div className="overflow-x-auto scrollbar-thin -mx-2"><table className="tbl"><thead><tr><th>Waktu</th><th>Item</th><th className="text-right">Jumlah</th><th>Tujuan</th><th>Kejadian</th><th>Petugas</th></tr></thead>
                <tbody>{data.recent.map((t) => <tr key={t.transaction_id}><td className="text-xs text-slate-400 whitespace-nowrap">{fmtDateTime(t.occurred_at)}</td><td className="font-semibold text-white">{t.item_name}</td><td className="text-right num font-bold text-amber-brand">{fmtNum(-t.change_quantity)} <span className="text-slate-500 text-xs font-normal">{t.unit}</span></td><td className="text-slate-300">{t.destination}</td><td className="text-slate-400 text-xs">{t.incident_type}</td><td className="text-slate-400 text-xs">{t.user_name}</td></tr>)}</tbody></table></div>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}
