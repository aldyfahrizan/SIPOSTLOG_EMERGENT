export function Logos({ size = 44, className = "", testId = "brand-logos" }) {
  return (
    <div className={`flex shrink-0 items-center gap-2 ${className}`} data-testid={testId}>
      <img src="/logo/kab-banjar.png" alt="Lambang Kabupaten Banjar" style={{ height: size }} className="w-auto drop-shadow-sm" />
      <img src="/logo/bpbd-banjar.png" alt="Logo BPBD Kabupaten Banjar" style={{ height: size }} className="w-auto drop-shadow-sm" />
    </div>
  );
}

export function Brand({ dark = false, compact = false, testId = "public-header-logo" }) {
  return (
    <div className="flex min-w-0 items-center gap-3" data-testid={testId}>
      <Logos size={compact ? 32 : 40} testId={`${testId}-logos`} />
      <div className="leading-tight">
        <div className={`font-display font-extrabold ${compact ? "text-base" : "text-lg"} ${dark ? "text-white" : "text-brand-blue"}`}>SIPOSTLOG</div>
        {!compact && (
          <div className="text-[10px] font-semibold text-brand-orange">BPBD Kabupaten Banjar</div>
        )}
      </div>
    </div>
  );
}
