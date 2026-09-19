import { useDialogFocus } from "./useDialogFocus";

export default function ConfirmDialog({ open, title, description, confirmLabel = "Konfirmasi", tone = "danger", onConfirm, onCancel, testId = "confirm-dialog" }) {
  const ref = useDialogFocus(open, onCancel);
  if (!open) return null;
  const toneStyle = tone === "danger" ? "bg-red-600 hover:bg-red-500 text-white" : "bg-amber-brand hover:bg-amber-400 text-ink-900";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" data-testid={testId} onClick={onCancel}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={`${testId}-title`} className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-2xl animate-rise" onClick={(e) => e.stopPropagation()}>
        <h3 id={`${testId}-title`} data-testid={`${testId}-title`} className="text-lg font-bold text-brand-blue">{title}</h3>
        {description && <p data-testid={`${testId}-description`} className="mt-2 text-sm text-slate-600 leading-relaxed">{description}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="btn-ghost" data-testid={`${testId}-cancel`}>Batal</button>
          <button onClick={onConfirm} className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-bold transition-colors duration-150 active:scale-[0.98] ${toneStyle}`} data-testid={`${testId}-confirm`}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
