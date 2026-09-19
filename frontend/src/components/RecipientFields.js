export const RecipientFields = ({ form, onChange, disabled }) => (
  <fieldset className="rounded-lg border border-blue-100 bg-blue-50/40 p-4" data-testid="distribution-recipient-fields">
    <legend className="px-1 text-xs font-bold text-brand-blue" data-testid="distribution-recipient-heading">Penerima bantuan</legend>
    <div className="grid gap-4 sm:grid-cols-2">
      <div><label htmlFor="recipient-kk" className="label" data-testid="recipient-kk-label">Jumlah penerima (KK)</label><input id="recipient-kk" type="number" min="0" max="10000000" step="1" className="field num" placeholder="Belum dicatat" value={form.recipient_kk} onChange={onChange("recipient_kk")} disabled={disabled} data-testid="recipient-kk-input" aria-describedby="distribution-recipient-help" /></div>
      <div><label htmlFor="recipient-jiwa" className="label" data-testid="recipient-jiwa-label">Jumlah penerima (jiwa)</label><input id="recipient-jiwa" type="number" min="0" max="10000000" step="1" className="field num" placeholder="Belum dicatat" value={form.recipient_jiwa} onChange={onChange("recipient_jiwa")} disabled={disabled} data-testid="recipient-jiwa-input" aria-describedby="distribution-recipient-help" /></div>
    </div>
    <p id="distribution-recipient-help" className="mt-3 text-xs leading-relaxed text-slate-600" data-testid="distribution-recipient-help">Opsional. Kosongkan jika belum diketahui. Waktu, lokasi, jenis barang, dan jumlah KK/jiwa ditampilkan kepada publik. Jumlah barang dan catatan tetap khusus petugas.</p>
  </fieldset>
);