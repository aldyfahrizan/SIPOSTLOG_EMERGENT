import { useEffect, useState } from "react";
import { Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DistributionCustomTooltip, DistributionEventDetails } from "./DistributionEventDetails";
import { fmtDateTime } from "../lib/format";

const shortDate = (value) => new Date(value).toLocaleDateString("id-ID", { day: "2-digit", month: "short", timeZone: "Asia/Makassar" });

const EventMarker = ({ cx, cy, payload, selectedId, onSelect }) => {
  if (!Number.isFinite(cx) || !Number.isFinite(cy) || !payload?.event_id) return null;
  return <circle cx={cx} cy={cy} r={selectedId === payload.event_id ? 7 : 5} fill={selectedId === payload.event_id ? "#C2410C" : "#1E3A8A"} stroke="#FFFFFF" strokeWidth={2}
    role="button" tabIndex={0} aria-label={`${fmtDateTime(payload.occurred_at)}, ${payload.location}, ${payload.item_names.join(", ")}`}
    data-testid={`distribution-event-${payload.event_id}`} style={{ cursor: "pointer" }}
    onFocus={() => onSelect(payload.event_id)} onClick={() => onSelect(payload.event_id)} onKeyDown={(event) => { if (["Enter", " "].includes(event.key)) { event.preventDefault(); onSelect(payload.event_id); } }} />;
};

export const PublicDistributionChart = ({ events }) => {
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState(events[0]?.event_id);
  const [small, setSmall] = useState(() => window.matchMedia("(max-width: 640px)").matches);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");
    const change = () => { setSmall(media.matches); setPage(0); };
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  const pageSize = small ? 5 : 12;
  const lastPage = Math.max(0, Math.ceil(events.length / pageSize) - 1);
  const currentPage = Math.min(page, lastPage);
  const visible = events.slice(currentPage * pageSize, (currentPage + 1) * pageSize).reverse().map((event) => ({ ...event, event_marker: 0 }));
  const selected = visible.find((event) => event.event_id === selectedId) || visible[visible.length - 1];
  const hasRecipients = visible.some((event) => event.recipient_kk != null || event.recipient_jiwa != null);
  const selectBar = (entry) => { const id = entry?.event_id || entry?.payload?.event_id; if (id) setSelectedId(id); };

  return <>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
      <p data-testid="distribution-chart-axis-label">Penerima per catatan penyaluran</p>
      <div className="flex flex-wrap gap-4" data-testid="distribution-chart-legend"><span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-brand-blue" />KK</span><span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-brand-orange" />Jiwa</span></div>
    </div>
    <div className="h-72 sm:h-80 min-w-0" data-testid="distribution-chart-container" aria-label="Grafik penerima bantuan per waktu penyaluran">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={visible} barGap={8} margin={{ top: 15, right: 12, bottom: 12, left: small ? -18 : 0 }}>
          <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="3 5" />
          <XAxis dataKey="event_id" tickFormatter={(id) => shortDate(visible.find((event) => event.event_id === id)?.occurred_at)} tick={{ fill: "#475569", fontSize: 11 }} axisLine={{ stroke: "#CBD5E1" }} tickLine={false} interval="preserveStartEnd" minTickGap={10} tickMargin={14} />
          <YAxis hide={!hasRecipients} allowDecimals={false} tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} width={50} domain={[0, (max) => Math.max(1, max)]} />
          <Tooltip content={<DistributionCustomTooltip />} cursor={{ fill: "#F8FAFC" }} wrapperStyle={{ zIndex: 10 }} />
          <Bar dataKey="recipient_kk" name="KK" fill="#1E3A8A" radius={[4, 4, 0, 0]} barSize={small ? 16 : 28} onClick={selectBar} isAnimationActive={false} />
          <Bar dataKey="recipient_jiwa" name="Jiwa" fill="#C2410C" radius={[4, 4, 0, 0]} barSize={small ? 16 : 28} onClick={selectBar} isAnimationActive={false} />
          <Scatter dataKey="event_marker" name="Catatan penyaluran" shape={(props) => <EventMarker {...props} selectedId={selected?.event_id} onSelect={setSelectedId} />} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
    <p data-testid="distribution-chart-help" className="mt-2 text-xs leading-relaxed text-slate-500">Klik batang atau titik tanggal untuk melihat rincian. Data penerima yang belum dicatat tidak dianggap nol dan tidak dijumlahkan antarcatatan.</p>
    {lastPage > 0 && <div className="mt-4 flex flex-wrap items-center justify-between gap-3" data-testid="distribution-chart-pagination"><span data-testid="distribution-page-label" className="text-xs text-slate-500">Bagian {currentPage + 1} dari {lastPage + 1}</span><div className="flex gap-2"><button data-testid="distribution-newer-button" disabled={currentPage === 0} onClick={() => { setPage(currentPage - 1); setSelectedId(null); }} className="btn-ghost !py-1.5 !px-3 text-xs"><ChevronLeft size={14} /> Lebih baru</button><button data-testid="distribution-older-button" disabled={currentPage === lastPage} onClick={() => { setPage(currentPage + 1); setSelectedId(null); }} className="btn-ghost !py-1.5 !px-3 text-xs">Lebih lama <ChevronRight size={14} /></button></div></div>}
    <div className="mt-5 border-t border-slate-200 pt-4" aria-live="polite" data-testid="distribution-chart-annotation"><p data-testid="distribution-selected-heading" className="mb-3 text-xs font-bold text-brand-orange">{selected?.event_id === events[0]?.event_id ? "Penyaluran terakhir dalam periode" : "Rincian penyaluran terpilih"}</p><DistributionEventDetails event={selected} /></div>
  </>;
};