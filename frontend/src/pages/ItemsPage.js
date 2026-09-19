import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PackagePlus, Search, History, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { api, errorMessage } from "../lib/api";
import { PageHeader, Spinner } from "../components/StatCard";
import { DeleteEntityButton } from "../components/AdminDeleteControls";
import { ItemCreateDialog } from "../components/ItemCreateDialog";
import { fmtNum } from "../lib/format";

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const load = useCallback(async () => { setError(""); setLoading(true); try { const { data } = await api.get("/items"); setItems(data); } catch (err) { setError(errorMessage(err)); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  const rows = useMemo(() => items.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(query.trim().toLowerCase())), [items, query]);
  return <div data-testid="items-page">
    <PageHeader eyebrow="Administrasi" title="Kelola Barang" description="Tambah jenis barang atau hapus barang dengan stok nol. Selesaikan kesalahan transaksi sebelum menghapus barang; seluruh tindakan dicatat untuk audit." actions={<button onClick={() => setCreateOpen(true)} data-testid="item-add-button" className="btn-primary"><PackagePlus size={16} /> Tambah Barang</button>} />
    <label className="relative mb-5 block max-w-sm"><Search size={16} className="absolute left-3 top-3 text-slate-400" /><input className="field !pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau kategori barang…" aria-label="Cari barang" data-testid="items-search-input" /></label>
    {error && <div data-testid="items-load-error" role="alert" className="mb-4 text-sm text-red-700">{error}<button onClick={load} data-testid="items-retry-button" className="btn-ghost ml-3"><RefreshCw size={14} /> Coba lagi</button></div>}
    {loading ? <Spinner /> : <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="tbl" data-testid="items-table"><thead><tr><th>Nama barang</th><th>Kategori</th><th>Satuan</th><th className="text-right">Stok</th><th className="text-right">Tindakan admin</th></tr></thead><tbody>{rows.map((item) => <tr key={item.id} data-testid={`managed-item-${item.id}`}><td data-testid={`managed-item-name-${item.id}`} className="font-semibold text-brand-blue">{item.name}</td><td data-testid={`managed-item-category-${item.id}`} className="text-xs">{item.category}</td><td data-testid={`managed-item-unit-${item.id}`} className="text-xs">{item.unit}</td><td data-testid={`managed-item-stock-${item.id}`} className="text-right num font-bold">{fmtNum(item.currentStock)}</td><td><div className="flex flex-wrap justify-end gap-2"><Link to={`/app/riwayat?item_id=${encodeURIComponent(item.id)}`} data-testid={`managed-item-history-${item.id}`} className="btn-ghost !px-3 !py-1.5 text-xs"><History size={13} /> Transaksi</Link><DeleteEntityButton kind="item" entity={item} onDeleted={load} disabled={item.currentStock !== 0} disabledReason={item.currentStock !== 0 ? "Stok wajib nol sebelum barang dihapus" : ""} /></div></td></tr>)}</tbody></table>{!rows.length && <p className="p-8 text-center text-sm text-slate-500" data-testid="items-empty-state">Tidak ada barang yang cocok.</p>}</div>}
    {createOpen && <ItemCreateDialog categories={[...new Set(items.map((item) => item.category))]} onClose={() => setCreateOpen(false)} onCreated={() => { toast.success("Barang berhasil ditambahkan"); load(); }} />}
  </div>;
}