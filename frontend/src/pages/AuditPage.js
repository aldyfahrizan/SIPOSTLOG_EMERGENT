import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import { PageHeader, Spinner } from "../components/StatCard";
import { fmtDateTime, fmtNum } from "../lib/format";

const LABELS = { transaction: "Transaksi", item: "Barang", user: "Pengguna" };

export default function AuditPage() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => { setError(""); try { const { data } = await api.get("/admin/audit"); setRows(data); } catch (err) { setError(errorMessage(err)); setRows([]); } }, []);
  useEffect(() => { load(); }, [load]);
  return <div data-testid="audit-page">
    <PageHeader eyebrow="Khusus Admin" title="Riwayat Penghapusan" description="Jejak permanen pembatalan transaksi, penghapusan barang, dan akun pengguna. Alasan, pelaku, waktu, serta perubahan stok tetap dapat diperiksa." actions={<button onClick={load} data-testid="audit-refresh-button" className="btn-ghost"><RefreshCw size={15} /> Muat ulang</button>} />
    {error && <p role="alert" data-testid="audit-load-error" className="mb-4 text-sm text-red-700">{error}</p>}
    {!rows ? <Spinner /> : <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="tbl" data-testid="audit-table"><thead><tr><th>Waktu</th><th>Tindakan</th><th>Data</th><th>Alasan</th><th>Perubahan stok</th><th>Admin</th></tr></thead><tbody>{rows.map((row) => <tr key={row.audit_id} data-testid={`audit-row-${row.audit_id}`}><td data-testid={`audit-time-${row.audit_id}`} className="whitespace-nowrap text-xs">{fmtDateTime(row.at)}</td><td data-testid={`audit-action-${row.audit_id}`} className="text-xs font-semibold">{row.action === "CANCEL" ? "Pembatalan" : "Penghapusan"}<div className="mt-1 text-slate-500">{LABELS[row.entity_type]}</div></td><td data-testid={`audit-label-${row.audit_id}`} className="font-semibold text-brand-blue">{row.label}</td><td data-testid={`audit-reason-${row.audit_id}`} className="min-w-44 max-w-sm whitespace-pre-wrap text-xs break-words">{row.reason}</td><td data-testid={`audit-stock-${row.audit_id}`} className="whitespace-nowrap text-xs num">{row.stock_before == null ? "—" : `${fmtNum(row.stock_before)} → ${fmtNum(row.stock_after)} ${row.unit || ""}`}</td><td data-testid={`audit-actor-${row.audit_id}`} className="text-xs">{row.actor_name}</td></tr>)}</tbody></table>{!rows.length && <p data-testid="audit-empty-state" className="p-10 text-center text-sm text-slate-500">Belum ada pembatalan atau penghapusan.</p>}</div>}
  </div>;
}