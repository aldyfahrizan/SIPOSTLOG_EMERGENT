import { useState } from "react";
import { ClipboardCheck, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { api, errorMessage } from "../lib/api";
import { PageHeader, Panel } from "../components/StatCard";
import { Field, ItemPreview, ItemSelect, ResultCard, useItems } from "../components/FormBits";
import { useAuth } from "../context/AuthContext";
import { fmtNum, todayYMD } from "../lib/format";

export default function AdjustPage() {
  const { isAdmin } = useAuth();
  const [items, reload] = useItems();
  const [form, setForm] = useState({ item_id: "", new_quantity: "", reason: "", date: todayYMD(), notes: "" });
  const [threshold, setThreshold] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const item = items.find((i) => i.id === form.item_id);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target ? e.target.value : e }));
  const diff = item && form.new_quantity !== "" ? Number(form.new_quantity) - item.currentStock : null;

  const submit = async (e) => {
    e.preventDefault();
    if (diff === 0) { toast.info("Stok fisik sama dengan stok sistem — tidak ada koreksi."); return; }
    setBusy(true);
    try {
      const { data } = await api.post("/transactions/adjust", { ...form, new_quantity: Number(form.new_quantity) });
      setResult(data); toast.success("Koreksi stok tercatat"); reload();
      setForm((f) => ({ ...f, new_quantity: "", reason: "", notes: "" }));
    } catch (err) { toast.error(errorMessage(err)); } finally { setBusy(false); }
  };

  const saveThreshold = async () => {
    try {
      await api.patch(`/items/${item.id}`, { minThreshold: Number(threshold) });
      toast.success("Ambang minimum diperbarui"); reload(); setThreshold("");
    } catch (err) { toast.error(errorMessage(err)); }
  };

  return (
    <div data-testid="adjust-page">
      <PageHeader eyebrow="Transaksi" title="Stock Opname / Koreksi" description="Sesuaikan stok sistem dengan hasil hitung fisik. Alasan wajib diisi; selisih dicatat sebagai penyesuaian yang tidak dapat dihapus." />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Panel testId="adjust-form-panel">
          <form onSubmit={submit} className="space-y-5">
            <ItemSelect items={items} value={form.item_id} onChange={(v) => { set("item_id")(v); setThreshold(""); }} testId="adjust-item-select" />
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label={`Stok fisik hasil opname${item ? ` (${item.unit})` : ""}`} hint={diff !== null && diff !== 0 ? `Selisih: ${diff > 0 ? "+" : ""}${fmtNum(diff)} ${item.unit}` : undefined}>
                <input type="number" min="0" required className="field num" value={form.new_quantity} onChange={set("new_quantity")} placeholder={item ? String(item.currentStock) : "0"} data-testid="adjust-quantity-input" />
              </Field>
              <Field label="Tanggal Opname"><input type="date" required className="field" value={form.date} max={todayYMD()} onChange={set("date")} data-testid="adjust-date-input" /></Field>
            </div>
            <Field label="Alasan (wajib)"><input required minLength={3} className="field" value={form.reason} onChange={set("reason")} placeholder="mis. Hasil stock opname triwulan III, barang rusak, dsb." data-testid="adjust-reason-input" /></Field>
            <Field label="Catatan (opsional)"><textarea rows={2} className="field" value={form.notes} onChange={set("notes")} data-testid="adjust-notes-input" /></Field>
            <button type="submit" disabled={busy || !form.item_id} className="btn-primary w-full sm:w-auto" data-testid="adjust-submit-button"><ClipboardCheck size={15} /> Simpan Koreksi</button>
          </form>
        </Panel>
        <div className="space-y-4">
          <ItemPreview item={item} />
          {isAdmin && item && (
            <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-4" data-testid="threshold-panel">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400"><Settings2 size={13} /> Ubah ambang minimum (Admin)</div>
              <div className="mt-3 flex gap-2">
                <input type="number" min="0" className="field num" placeholder={String(item.minThreshold)} value={threshold} onChange={(e) => setThreshold(e.target.value)} data-testid="threshold-input" />
                <button type="button" onClick={saveThreshold} disabled={threshold === ""} className="btn-ghost whitespace-nowrap" data-testid="threshold-save-button">Simpan</button>
              </div>
            </div>
          )}
          <ResultCard tx={result} onReset={() => setResult(null)} />
        </div>
      </div>
    </div>
  );
}
