import { useEffect, useState } from "react";
import { Truck } from "lucide-react";
import { toast } from "sonner";
import { api, errorMessage } from "../lib/api";
import { PageHeader, Panel } from "../components/StatCard";
import { Field, ItemPreview, ItemSelect, ResultCard, useItems } from "../components/FormBits";
import { todayYMD } from "../lib/format";

export default function DistributionPage() {
  const [items, reload] = useItems();
  const [incidents, setIncidents] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [form, setForm] = useState({ item_id: "", quantity: "", destination: "", incident_type: "", date: todayYMD(), notes: "" });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const item = items.find((i) => i.id === form.item_id);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target ? e.target.value : e }));
  const exceeds = item && Number(form.quantity) > item.currentStock;

  useEffect(() => {
    api.get("/meta/incident-types").then((r) => { setIncidents(r.data); setForm((f) => ({ ...f, incident_type: f.incident_type || r.data[0] })); });
    api.get("/meta/destinations").then((r) => setDestinations(r.data)).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/transactions/out", { ...form, quantity: Number(form.quantity) });
      setResult(data); toast.success("Penyaluran tercatat"); reload();
      setForm((f) => ({ ...f, quantity: "", notes: "" }));
    } catch (err) { toast.error(errorMessage(err)); } finally { setBusy(false); }
  };

  return (
    <div data-testid="distribution-page">
      <PageHeader eyebrow="Transaksi" title="Catat Penyaluran" description="Distribusi logistik ke posko atau wilayah terdampak. Server menolak otomatis jika jumlah melebihi stok tersedia." />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Panel testId="distribution-form-panel">
          <form onSubmit={submit} className="space-y-5">
            <ItemSelect items={items} value={form.item_id} onChange={set("item_id")} testId="distribution-item-select" />
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label={`Jumlah${item ? ` (${item.unit})` : ""}`} hint={exceeds ? `Melebihi stok tersedia (${item.currentStock} ${item.unit})` : undefined}>
                <input type="number" min="1" required className={`field num ${exceeds ? "!border-red-500" : ""}`} value={form.quantity} onChange={set("quantity")} placeholder="0" data-testid="distribution-quantity-input" />
              </Field>
              <Field label="Tanggal"><input type="date" required className="field" value={form.date} max={todayYMD()} onChange={set("date")} data-testid="distribution-date-input" /></Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Tujuan / Penerima" hint="Kecamatan, desa, atau nama posko">
                <input list="dest-list" required minLength={2} className="field" value={form.destination} onChange={set("destination")} placeholder="mis. Posko Martapura Timur" data-testid="distribution-destination-input" />
                <datalist id="dest-list">{destinations.map((d) => <option key={d} value={d} />)}</datalist>
              </Field>
              <Field label="Jenis Kejadian"><select className="field" value={form.incident_type} onChange={set("incident_type")} data-testid="distribution-incident-select">{incidents.map((s) => <option key={s}>{s}</option>)}</select></Field>
            </div>
            <Field label="Catatan (opsional)"><textarea rows={3} className="field" value={form.notes} onChange={set("notes")} placeholder="Nama penerima, no. surat tugas, dsb." data-testid="distribution-notes-input" /></Field>
            <button type="submit" disabled={busy || !form.item_id} className="btn-primary w-full sm:w-auto" data-testid="distribution-submit-button"><Truck size={15} /> Simpan Penyaluran</button>
          </form>
        </Panel>
        <div className="space-y-4"><ItemPreview item={item} /><ResultCard tx={result} onReset={() => setResult(null)} /></div>
      </div>
    </div>
  );
}
