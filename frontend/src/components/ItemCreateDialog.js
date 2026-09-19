import { useState } from "react";
import { PackagePlus } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import { useDialogFocus } from "./useDialogFocus";

export const ItemCreateDialog = ({ onClose, onCreated, categories }) => {
  const [form, setForm] = useState({ name: "", category: "", unit: "", currentStock: "0", minThreshold: "0", description: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const close = () => { if (!busy) onClose(); };
  const ref = useDialogFocus(true, close);
  const change = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError("");
    try { const { data } = await api.post("/items", { ...form, currentStock: Number(form.currentStock), minThreshold: Number(form.minThreshold) }); onCreated(data); onClose(); }
    catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" data-testid="item-create-dialog">
    <section ref={ref} role="dialog" aria-modal="true" aria-labelledby="item-create-title" className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
      <h2 id="item-create-title" data-testid="item-create-title" className="text-lg font-bold text-brand-blue">Tambah Barang</h2><p data-testid="item-create-description" className="mt-2 text-sm text-slate-500">Daftarkan jenis baru. Gunakan Barang Masuk untuk menambah stok barang yang sudah ada.</p>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <div><label htmlFor="item-name" className="label" data-testid="item-create-name-label">Nama jenis barang</label><input id="item-name" data-testid="item-create-name-input" className="field" value={form.name} onChange={change("name")} required minLength={2} maxLength={120} disabled={busy} /></div>
        <div className="grid grid-cols-2 gap-4"><div><label htmlFor="item-category" className="label" data-testid="item-create-category-label">Kategori</label><input id="item-category" list="item-category-options" data-testid="item-create-category-input" className="field" value={form.category} onChange={change("category")} required minLength={2} maxLength={80} disabled={busy} /><datalist id="item-category-options">{categories.map((category) => <option key={category} value={category} />)}</datalist></div><div><label htmlFor="item-unit" className="label" data-testid="item-create-unit-label">Satuan</label><input id="item-unit" data-testid="item-create-unit-input" className="field" value={form.unit} onChange={change("unit")} required maxLength={20} placeholder="mis. pcs" disabled={busy} /></div></div>
        <div className="grid grid-cols-2 gap-4"><div><label htmlFor="item-stock" className="label" data-testid="item-create-stock-label">Stok awal</label><input id="item-stock" data-testid="item-create-stock-input" type="number" min="0" max="100000000" step="1" className="field num" value={form.currentStock} onChange={change("currentStock")} required disabled={busy} /></div><div><label htmlFor="item-threshold" className="label" data-testid="item-create-threshold-label">Ambang minimum</label><input id="item-threshold" data-testid="item-create-threshold-input" type="number" min="0" max="100000000" step="1" className="field num" value={form.minThreshold} onChange={change("minThreshold")} required disabled={busy} /></div></div>
        <div><label htmlFor="item-description" className="label" data-testid="item-create-notes-label">Catatan (opsional)</label><textarea id="item-description" data-testid="item-create-notes-input" className="field" rows={2} maxLength={300} value={form.description} onChange={change("description")} disabled={busy} /></div>
        {error && <p role="alert" data-testid="item-create-error" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4"><button type="button" onClick={close} disabled={busy} data-testid="item-create-cancel-button" className="btn-ghost">Batal</button><button type="submit" disabled={busy} data-testid="item-create-submit-button" className="btn-primary"><PackagePlus size={15} /> {busy ? "Menyimpan…" : "Simpan Barang"}</button></div>
      </form>
    </section>
  </div>;
};