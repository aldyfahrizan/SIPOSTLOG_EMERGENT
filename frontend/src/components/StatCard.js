const ACCENT = {
  amber: "border-l-amber-brand",
  green: "border-l-emerald-400",
  red: "border-l-red-500",
  blue: "border-l-sky-400",
  slate: "border-l-slate-500",
};

export default function StatCard({ label, value, sub, accent = "amber", icon: Icon, testId }) {
  return (
    <div data-testid={testId} className={`dark-panel border-l-4 ${ACCENT[accent]} p-5 flex items-start justify-between gap-3 hover:border-amber-brand/40 transition-colors duration-200`}>
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</div>
        <div className="num mt-2 text-3xl font-bold text-white leading-none">{value}</div>
        {sub && <div className="mt-2 text-xs text-slate-400">{sub}</div>}
      </div>
      {Icon && <div className="rounded-lg bg-ink-900/70 p-2 text-amber-brand"><Icon size={18} /></div>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8 animate-rise">
      <div>
        {eyebrow && <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-brand mb-2">{eyebrow}</div>}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-slate-400 leading-relaxed">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, subtitle, children, className = "", actions, testId }) {
  return (
    <section data-testid={testId} className={`dark-panel p-5 sm:p-6 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-base font-bold text-white">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({ text }) {
  return <div className="py-10 text-center text-sm text-slate-500">{text}</div>;
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16" data-testid="loading-spinner">
      <div className="h-8 w-8 rounded-full border-2 border-ink-700 border-t-amber-brand animate-spin" />
    </div>
  );
}
