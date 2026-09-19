import { useState } from "react";
import { Trash2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { fmtNum, TYPE_LABEL } from "../lib/format";
import { ReasonDialog } from "./ReasonDialog";

export const CancelTransactionButton = ({ transaction, onCancelled, prefix = "cancel-transaction" }) => {
  const { isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  if (!isAdmin || transaction.cancelled || transaction.type === "REVERSAL" || transaction.reversal_of) return null;
  const delta = -transaction.change_quantity;
  const description = `${TYPE_LABEL[transaction.type]} — ${transaction.item_name}. Stok saat ini akan ${delta >= 0 ? "ditambah" : "dikurangi"} ${fmtNum(Math.abs(delta))} ${transaction.unit}. Pembatalan ditolak jika stok menjadi negatif. Catatan asli disimpan untuk audit dan tidak lagi dihitung dalam laporan aktif.`;
  return <><button type="button" data-testid={`${prefix}-${transaction.transaction_id}`} onClick={(event) => { event.stopPropagation(); setOpen(true); }} className="btn-ghost !px-3 !py-1.5 text-xs hover:!border-red-300 hover:!text-red-700"><Undo2 size={13} /> Batalkan</button>
    {open && <ReasonDialog testId={`cancel-dialog-${transaction.transaction_id}`} title="Batalkan transaksi yang salah?" description={description} confirmLabel="Batalkan & sesuaikan stok" onClose={() => setOpen(false)} action={(reason) => api.post(`/transactions/${transaction.transaction_id}/cancel`, { reason })} onSuccess={() => { toast.success("Transaksi dibatalkan dan stok disesuaikan"); window.dispatchEvent(new Event("sipostlog:stock-changed")); onCancelled?.(); }} />}
  </>;
};

export const DeleteEntityButton = ({ kind, entity, onDeleted, disabled = false, disabledReason = "" }) => {
  const { isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  if (!isAdmin) return null;
  const id = kind === "item" ? entity.id : entity.user_id;
  const item = kind === "item";
  const description = item ? `${entity.name} dihapus dari katalog publik dan internal. Stok wajib nol. Riwayat transaksi tetap tersimpan, tetapi transaksi barang ini tidak dapat dibatalkan setelah barang dihapus.` : `${entity.name} dihapus dan tidak dapat masuk lagi dengan akun ini. Seluruh sesi dicabut, slot akun tersedia kembali, dan jejak aktivitas lama tetap tersimpan.`;
  return <><button type="button" disabled={disabled} title={disabledReason || `Hapus ${entity.name}`} data-testid={`delete-${kind}-${id}`} onClick={(event) => { event.stopPropagation(); setOpen(true); }} className="btn-ghost !px-3 !py-1.5 text-xs hover:!border-red-300 hover:!text-red-700"><Trash2 size={13} /> Hapus</button>
    {open && <ReasonDialog testId={`delete-${kind}-dialog-${id}`} title={`Hapus ${item ? "barang" : "pengguna"}?`} description={description} confirmLabel={`Hapus ${item ? "barang" : "akun"}`} onClose={() => setOpen(false)} action={(reason) => api.delete(`/${item ? "items" : "users"}/${id}`, { data: { reason } })} onSuccess={() => { toast.success(`${item ? "Barang" : "Pengguna"} berhasil dihapus`); if (item) window.dispatchEvent(new Event("sipostlog:stock-changed")); onDeleted?.(); }} />}
  </>;
};