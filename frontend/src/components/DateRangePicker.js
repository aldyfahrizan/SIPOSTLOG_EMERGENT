import { useState } from "react";
import { todayYMD } from "../lib/format";

const PRESETS = [
  { id: "7d", label: "7 Hari", start: () => todayYMD(-6) },
  { id: "30d", label: "30 Hari", start: () => todayYMD(-29) },
  { id: "month", label: "Bulan Ini", start: () => todayYMD().slice(0, 8) + "01" },
  { id: "custom", label: "Kustom" },
];

export default function DateRangePicker({ value, onChange }) {
  const [preset, setPreset] = useState("30d");
  const pick = (p) => {
    setPreset(p.id);
    if (p.start) onChange({ start: p.start(), end: todayYMD() });
  };
  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="date-range-picker">
      <div className="inline-flex rounded-full border border-ink-700 bg-ink-900/60 p-1">
        {PRESETS.map((p) => (
          <button key={p.id} onClick={() => pick(p)} data-testid={`range-preset-${p.id}`} className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${preset === p.id ? "bg-amber-brand text-ink-900" : "text-slate-300 hover:text-white"}`}>{p.label}</button>
        ))}
      </div>
      {preset === "custom" && (
        <div className="flex items-center gap-2">
          <input type="date" value={value.start} onChange={(e) => onChange({ ...value, start: e.target.value })} className="field !w-auto !py-1.5 text-xs" data-testid="range-start-input" />
          <span className="text-slate-500 text-xs">s/d</span>
          <input type="date" value={value.end} onChange={(e) => onChange({ ...value, end: e.target.value })} className="field !w-auto !py-1.5 text-xs" data-testid="range-end-input" />
        </div>
      )}
    </div>
  );
}
