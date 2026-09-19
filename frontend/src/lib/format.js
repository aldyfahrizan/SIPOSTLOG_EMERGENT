export const STATUS_LABEL = { aman: "Aman", menipis: "Menipis", habis: "Habis" };
export const TYPE_LABEL = { IN: "Barang Masuk", OUT: "Penyaluran", ADJUSTMENT: "Koreksi" };
export const ROLE_LABEL = { admin: "Admin", petugas: "Petugas", pending: "Menunggu" };

export function fmtDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Makassar" }) + " WITA";
}

export function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Makassar" });
}

export function fmtShortDay(ymd) {
  const [, m, d] = ymd.split("-");
  return `${d}/${m}`;
}

export function todayYMD(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function fmtNum(n) {
  return new Intl.NumberFormat("id-ID").format(n ?? 0);
}
