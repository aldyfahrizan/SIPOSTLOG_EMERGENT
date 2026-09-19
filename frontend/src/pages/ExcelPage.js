import { useRef, useState } from "react";
import { Download, FileSpreadsheet, FileUp, History, Package, Truck, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { API, downloadFile, errorMessage } from "../lib/api";
import { PageHeader, Panel } from "../components/StatCard";
import DateRangePicker from "../components/DateRangePicker";
import { fmtNum, todayYMD } from "../lib/format";

function ExportCard({ icon: Icon, title, desc, onClick, busy, testId }) {
  return (
    <div className="dark-panel p-5 flex flex-col gap-4 hover:border-amber-brand/40 transition-colors" data-testid={testId}>
      <div className="flex items-start gap-3"><div className="rounded-lg bg-amber-brand/15 p-2.5 text-amber-brand"><Icon size={20} /></div><div><div className="font-bold text-white">{title}</div><p className="mt-1 text-xs text-slate-400 leading-relaxed">{desc}</p></div></div>
      <button onClick={onClick} disabled={busy} className="btn-primary mt-auto self-start !py-2 text-xs" data-testid={`${testId}-button`}><Download size={13} /> Unduh .xlsx</button>
    </div>
  );
}

export default function ExcelPage() {
  const [range, setRange] = useState({ start: todayYMD(-29), end: todayYMD() });
  const [busy, setBusy] = useState("");
  const [importResult, setImportResult] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const dl = async (key, path) => {
    setBusy(key);
    try { const n = await downloadFile(path, "laporan.xlsx"); toast.success(`Berkas ${n} diunduh`); }
    catch (e) { toast.error(e.message); } finally { setBusy(""); }
  };

  const upload = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".xlsx")) { toast.error("Berkas harus .xlsx"); return; }
    setBusy("import"); setImportResult(null);
    const fd = new FormData(); fd.append("file", file);
    try {
      const res = await fetch(`${API}/excel/import`, { method: "POST", body: fd, credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Gagal mengimpor");
      setImportResult(data);
      toast.success(`${data.updated.length} item dikoreksi dari Excel`);
    } catch (e) { toast.error(errorMessage(e, e.message)); } finally { setBusy(""); if (fileRef.current) fileRef.current.value = ""; }
  };

  return (
    <div data-testid="excel-page">
      <PageHeader eyebrow="Laporan" title="Ekspor & Impor Excel" description="Unduh laporan siap cetak dalam format .xlsx, atau perbarui stok hasil opname secara massal dengan mengunggah kembali template Excel." />

      <div className="mb-4 flex flex-wrap items-center gap-3"><span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Rentang laporan:</span><DateRangePicker value={range} onChange={setRange} /></div>
      <div className="grid gap-4 md:grid-cols-3 stagger">
        <ExportCard testId="export-stock" icon={Package} title="Laporan Stok" desc="33 item: nama, kategori, stok, satuan, ambang minimum, status, dan pembaruan terakhir." busy={busy === "stock"} onClick={() => dl("stock", "/export/stock")} />
        <ExportCard testId="export-distribution" icon={Truck} title="Laporan Penyaluran" desc="Rekap per item, per tujuan, dan rincian transaksi penyaluran pada rentang tanggal terpilih." busy={busy === "dist"} onClick={() => dl("dist", `/export/distribution?start=${range.start}&end=${range.end}`)} />
        <ExportCard testId="export-transactions" icon={History} title="Riwayat Transaksi" desc="Seluruh mutasi stok (masuk, penyaluran, koreksi) pada rentang tanggal terpilih." busy={busy === "tx"} onClick={() => dl("tx", `/export/transactions?start=${range.start}&end=${range.end}`)} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Panel title="Update Stok via Excel" subtitle="Stock opname massal dalam 3 langkah" testId="excel-import-panel">
          <ol className="space-y-3 text-sm text-slate-300">
            <li className="flex gap-3"><span className="num h-6 w-6 shrink-0 rounded-full bg-amber-brand text-ink-900 font-bold text-xs flex items-center justify-center">1</span><div>Unduh template berisi 33 item dan stok sistem saat ini.<div className="mt-2"><button onClick={() => dl("tpl", "/excel/template")} disabled={busy === "tpl"} className="btn-ghost !py-1.5 text-xs" data-testid="excel-template-button"><FileSpreadsheet size={13} /> Unduh Template Opname</button></div></div></li>
            <li className="flex gap-3"><span className="num h-6 w-6 shrink-0 rounded-full bg-amber-brand text-ink-900 font-bold text-xs flex items-center justify-center">2</span><div>Isi kolom <b className="text-white">Stok Fisik (Isi)</b> di Excel. Kosongkan baris yang tidak berubah. Kolom Keterangan opsional untuk alasan.</div></li>
            <li className="flex gap-3"><span className="num h-6 w-6 shrink-0 rounded-full bg-amber-brand text-ink-900 font-bold text-xs flex items-center justify-center">3</span><div>Unggah berkas. Setiap selisih dicatat sebagai transaksi <b className="text-white">Koreksi</b> dengan jejak audit lengkap.</div></li>
          </ol>
          <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()} data-testid="excel-dropzone"
            className={`mt-5 cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${dragging ? "border-amber-brand bg-amber-brand/10" : "border-ink-700 hover:border-amber-brand/60"}`}>
            <FileUp size={28} className="mx-auto text-amber-brand" />
            <div className="mt-3 text-sm font-semibold text-white">{busy === "import" ? "Memproses…" : "Tarik berkas .xlsx ke sini atau klik untuk memilih"}</div>
            <div className="mt-1 text-xs text-slate-500">Gunakan template dari langkah 1</div>
            <input ref={fileRef} type="file" accept=".xlsx" className="hidden" onChange={(e) => upload(e.target.files[0])} data-testid="excel-upload-input" />
          </div>
        </Panel>

        <Panel title="Hasil Impor" subtitle={importResult ? `${importResult.processed} baris diproses` : "Belum ada impor pada sesi ini"} testId="excel-import-result">
          {!importResult ? <div className="py-10 text-center text-sm text-slate-500">Hasil impor akan muncul di sini.</div> : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3"><div className="num text-2xl font-bold text-emerald-400" data-testid="import-updated-count">{importResult.updated.length}</div><div className="text-[11px] uppercase tracking-wider text-slate-400">Dikoreksi</div></div>
                <div className="rounded-lg bg-ink-900/60 border border-ink-700 p-3"><div className="num text-2xl font-bold text-slate-200">{importResult.unchanged}</div><div className="text-[11px] uppercase tracking-wider text-slate-400">Tidak berubah</div></div>
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3"><div className="num text-2xl font-bold text-red-400">{importResult.errors.length}</div><div className="text-[11px] uppercase tracking-wider text-slate-400">Galat</div></div>
              </div>
              {importResult.updated.length > 0 && <ul className="divide-y divide-ink-700/60">{importResult.updated.map((t) => <li key={t.transaction_id} className="flex items-center justify-between gap-2 py-2 text-sm"><span className="flex items-center gap-2 text-slate-200"><CheckCircle2 size={14} className="text-emerald-400" />{t.item_name}</span><span className="num text-xs text-slate-400">{fmtNum(t.previous_quantity)} → <b className="text-white">{fmtNum(t.new_quantity)}</b> {t.unit}</span></li>)}</ul>}
              {importResult.errors.length > 0 && <ul className="space-y-1">{importResult.errors.map((e, i) => <li key={i} className="flex items-center gap-2 text-xs text-red-300"><AlertCircle size={13} /> {e.item_id}: {e.error}</li>)}</ul>}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
