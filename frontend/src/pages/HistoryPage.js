import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { api, downloadFile } from "../lib/api";
import { EmptyState, PageHeader, Panel, Spinner } from "../components/StatCard";
import { TypeBadge } from "../components/StatusBadge";
import { useItems } from "../components/FormBits";
import DateRangePicker from "../components/DateRangePicker";
import { fmtDateTime, fmtNum, todayYMD } from "../lib/format";

export default function HistoryPage() {
  const [items] = useItems();
  const [range, setRange] = useState({ start: todayYMD(-29), end: todayYMD() });
  const [type, setType] = useState("");
  const [itemId, setItemId] = useState("");
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    if (!range.start || !range.end) return;
    setRows(null);
    api.get("/transactions", { params: { ...range, type: type || undefined, item_id: itemId || undefined, limit: 500 } }).then((r) => setRows(r.data)).catch((e) => toast.error(e.response?.data?.detail || "Gagal memuat"));
  }, [range, type, itemId]);

  const exportFile = async (key, path, name) => {
    setBusy(key);
    try { const n = await downloadFile(path, name); toast.success(`Berkas ${n} diunduh`); }
    catch (e) { toast.error(e.message); } finally { setBusy(""); }
  };

  return (
    <div data-testid="history-page">
      <PageHeader eyebrow="Audit Trail" title="Riwayat Transaksi" description="Seluruh perubahan stok tercatat permanen: waktu, jenis, item, stok sebelum → sesudah, petugas, dan alasan. Tidak dapat diubah atau dihapus."
        actions={<>
          <button onClick={() => exportFile("pdf", `/export/transactions/pdf?start=${range.start}&end=${range.end}`, "riwayat.pdf")} disabled={!!busy} className="btn-ghost" data-testid="history-export-pdf-button"><FileText size={14} /> {busy === "pdf" ? "Mencetak…" : "Cetak PDF"}</button>
          <button onClick={() => exportFile("xlsx", `/export/transactions?start=${range.start}&end=${range.end}`, "riwayat.xlsx")} disabled={!!busy} className="btn-primary" data-testid="history-export-button"><Download size={14} /> Ekspor Excel</button>
        </>} />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <DateRangePicker value={range} onChange={setRange} />
        <select value={type} onChange={(e) => setType(e.target.value)} className="field !w-auto !py-1.5 text-xs" data-testid="history-type-filter"><option value="">Semua jenis</option><option value="IN">Barang Masuk</option><option value="OUT">Penyaluran</option><option value="ADJUSTMENT">Koreksi</option></select>
        <select value={itemId} onChange={(e) => setItemId(e.target.value)} className="field !w-auto !py-1.5 text-xs max-w-[240px]" data-testid="history-item-filter"><option value="">Semua item</option>{items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select>
      </div>
      <Panel testId="history-table-panel" title={rows ? `${rows.length} transaksi` : "Memuat…"}>
        {!rows ? <Spinner /> : rows.length === 0 ? <EmptyState text="Tidak ada transaksi pada filter ini." /> : (
          <div className="overflow-x-auto scrollbar-thin -mx-2">
            <table className="tbl">
              <thead><tr><th>Waktu</th><th>Jenis</th><th>Item</th><th className="text-right">Sebelum</th><th className="text-right">Sesudah</th><th className="text-right">Perubahan</th><th>Keterangan</th><th>Petugas</th></tr></thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.transaction_id} data-testid={`history-row-${t.transaction_id}`}>
                    <td className="text-xs text-slate-400 whitespace-nowrap">{fmtDateTime(t.occurred_at)}</td>
                    <td><TypeBadge type={t.type} /></td>
                    <td><div className="font-semibold text-white">{t.item_name}</div><div className="text-[11px] text-slate-500">{t.unit}</div></td>
                    <td className="text-right num text-slate-400">{fmtNum(t.previous_quantity)}</td>
                    <td className="text-right num font-bold text-white">{fmtNum(t.new_quantity)}</td>
                    <td className={`text-right num font-bold ${t.change_quantity >= 0 ? "text-emerald-400" : "text-amber-400"}`}>{t.change_quantity > 0 ? "+" : ""}{fmtNum(t.change_quantity)}</td>
                    <td className="text-xs text-slate-300 max-w-[260px]">
                      {t.type === "OUT" && <><span className="text-white">{t.destination}</span> · {t.incident_type}</>}
                      {t.type === "IN" && <span className="text-white">{t.source}</span>}
                      {t.type === "ADJUSTMENT" && <span className="text-white">{t.reason}</span>}
                      {t.notes && <div className="text-slate-500 mt-0.5">{t.notes}</div>}
                    </td>
                    <td className="text-xs text-slate-400 whitespace-nowrap">{t.user_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
