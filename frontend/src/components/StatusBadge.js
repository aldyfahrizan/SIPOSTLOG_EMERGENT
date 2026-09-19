import { STATUS_LABEL, TYPE_LABEL } from "../lib/format";

const STATUS_STYLE = {
  aman: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  menipis: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  habis: "bg-red-500/15 text-red-400 border-red-500/30",
};
const STATUS_STYLE_LIGHT = {
  aman: "bg-emerald-50 text-emerald-700 border-emerald-200",
  menipis: "bg-amber-50 text-amber-700 border-amber-300",
  habis: "bg-red-50 text-red-700 border-red-200",
};
const DOT = { aman: "bg-emerald-400", menipis: "bg-amber-400", habis: "bg-red-500" };

export function StatusBadge({ status, light = false, testId }) {
  const style = (light ? STATUS_STYLE_LIGHT : STATUS_STYLE)[status] || "";
  return (
    <span data-testid={testId} data-status={status} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${style}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[status]} ${status !== "aman" ? "animate-pulseDot" : ""}`} />
      {STATUS_LABEL[status] || status}
    </span>
  );
}

const TYPE_STYLE = {
  IN: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  OUT: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  ADJUSTMENT: "bg-violet-500/15 text-violet-300 border-violet-500/30",
};

export function TypeBadge({ type }) {
  return (
    <span className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${TYPE_STYLE[type] || ""}`}>
      {TYPE_LABEL[type] || type}
    </span>
  );
}
