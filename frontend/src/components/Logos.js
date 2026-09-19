export function Logos({ size = 44, className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`} data-testid="brand-logos">
      <img src="/logo/kab-banjar.png" alt="Lambang Kabupaten Banjar" style={{ height: size }} className="w-auto drop-shadow-sm" />
      <img src="/logo/bpbd-banjar.png" alt="Logo BPBD Kabupaten Banjar" style={{ height: size }} className="w-auto drop-shadow-sm" />
    </div>
  );
}

export function Brand({ dark = true, compact = false }) {
  return (
    <div className="flex items-center gap-3" data-testid="public-header-logo">
      <Logos size={compact ? 36 : 44} />
      <div className="leading-tight">
        <div className={`font-display font-extrabold tracking-tight ${compact ? "text-base" : "text-lg"} ${dark ? "text-white" : "text-ink-900"}`}>SIPOSTLOG</div>
        {!compact && (
          <div className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${dark ? "text-amber-brand" : "text-amber-600"}`}>BPBD Kabupaten Banjar</div>
        )}
      </div>
    </div>
  );
}
