import { useState } from "react";
import { AlertTriangle, LoaderCircle } from "lucide-react";
import { errorMessage } from "../lib/api";
import { useDialogFocus } from "./useDialogFocus";

export const ReasonDialog = ({ title, description, confirmLabel, action, onClose, onSuccess, testId = "admin-action-dialog" }) => {
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const close = () => { if (!busy) onClose(); };
  const ref = useDialogFocus(true, close);
  const submit = async (event) => {
    event.preventDefault();
    if (busy || !confirmed || reason.trim().length < 3) return;
    setBusy(true); setError("");
    try { const result = await action(reason.trim()); onSuccess?.(result); onClose(); }
    catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); }
  };
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/45 backdrop-blur-sm p-4" data-testid={testId} onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <section ref={ref} role="dialog" aria-modal="true" aria-labelledby={`${testId}-title`} className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
      <div className="mb-4 inline-flex rounded-full bg-red-50 p-3 text-red-700"><AlertTriangle size={22} /></div>
      <h2 id={`${testId}-title`} data-testid={`${testId}-title`} className="text-lg font-bold text-brand-blue">{title}</h2>
      <p data-testid={`${testId}-description`} className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <div><label className="label" htmlFor={`${testId}-reason`} data-testid={`${testId}-reason-label`}>Alasan (wajib)</label><textarea id={`${testId}-reason`} data-testid={`${testId}-reason`} rows={3} required minLength={3} maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} disabled={busy} className="field" placeholder="Jelaskan kesalahan atau alasan penghapusan" /></div>
        <label className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600" data-testid={`${testId}-ack-label`}><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} disabled={busy} data-testid={`${testId}-ack`} className="mt-1 accent-red-700" />Saya telah memeriksa data dan memahami dampak tindakan ini.</label>
        {error && <p role="alert" data-testid={`${testId}-error`} className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4"><button type="button" onClick={close} disabled={busy} data-testid={`${testId}-cancel`} className="btn-ghost">Kembali</button><button type="submit" disabled={busy || !confirmed || reason.trim().length < 3} data-testid={`${testId}-confirm`} className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50 transition-colors">{busy && <LoaderCircle size={15} className="animate-spin" />}{busy ? "Memproses…" : confirmLabel}</button></div>
      </form>
    </section>
  </div>;
};