import { useState } from "react";
import { UserPlus, X, LoaderCircle } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import { useDialogFocus } from "./useDialogFocus";

const INITIAL_FORM = { name: "", username: "", password: "", role: "petugas" };
const ROLE_HELP = {
  admin: "Mengelola seluruh data dan akun pengguna.",
  petugas: "Mencatat barang masuk dan penyaluran, serta mengelola data gudang.",
  opname: "Mencatat hasil pemeriksaan dan penyesuaian stock opname.",
};

export const UserCreateDialog = ({ capacity, onClose, onCreated, onRefresh }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const close = () => { if (!busy) onClose(); };
  const ref = useDialogFocus(true, close);
  const set = (key) => (event) => setForm((value) => ({ ...value, [key]: event.target.value }));
  const full = !capacity || capacity.remaining === 0;

  const submit = async (event) => {
    event.preventDefault();
    if (busy || full) return;
    if (form.password !== confirmPassword) { setError("Konfirmasi kata sandi tidak sama."); return; }
    setError(""); setBusy(true);
    try {
      const { data } = await api.post("/users", { ...form, name: form.name.trim(), username: form.username.trim().toLowerCase() });
      setForm(INITIAL_FORM); setConfirmPassword("");
      onCreated(data);
    } catch (err) {
      setError(errorMessage(err));
      onRefresh();
    } finally { setBusy(false); }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" data-testid="user-create-dialog" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <section ref={ref} role="dialog" aria-modal="true" aria-labelledby="user-create-title" className="w-full max-w-xl max-h-[90dvh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 sm:p-7 shadow-2xl animate-rise">
      <div className="flex items-start justify-between gap-3">
        <div><h2 id="user-create-title" data-testid="user-create-title" className="text-lg font-bold text-brand-blue">Tambah Pengguna</h2><p data-testid="user-create-description" className="mt-1 text-sm text-slate-500">Buat akun masuk dan tentukan tugas pengguna.</p></div>
        <button type="button" onClick={close} disabled={busy} aria-label="Tutup formulir pengguna" data-testid="user-create-close-button" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"><X size={19} /></button>
      </div>
      <form onSubmit={submit} data-testid="user-create-form" className="mt-6 space-y-4">
        <div><label htmlFor="user-create-name" data-testid="user-create-name-label" className="label">Nama lengkap</label><input id="user-create-name" data-testid="user-create-name-input" className="field" value={form.name} onChange={set("name")} required minLength={2} maxLength={100} autoComplete="name" disabled={busy} placeholder="Nama petugas" /></div>
        <div><label htmlFor="user-create-username" data-testid="user-create-username-label" className="label">Username</label><input id="user-create-username" data-testid="user-create-username-input" className="field" value={form.username} onChange={set("username")} required minLength={3} maxLength={40} pattern="[a-zA-Z0-9_.\-]+" autoComplete="off" autoCapitalize="none" spellCheck={false} disabled={busy} placeholder="contoh: petugas.gudang" aria-describedby="user-create-username-hint" /><p id="user-create-username-hint" data-testid="user-create-username-hint" className="mt-1.5 text-xs text-slate-500">3–40 karakter: huruf, angka, titik, tanda hubung, atau garis bawah.</p></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="user-create-password" data-testid="user-create-password-label" className="label">Kata sandi</label><input id="user-create-password" data-testid="user-create-password-input" type="password" className="field" required minLength={6} maxLength={72} value={form.password} onChange={set("password")} autoComplete="new-password" disabled={busy} placeholder="Minimal 6 karakter" /></div>
          <div><label htmlFor="user-create-confirm" data-testid="user-create-confirm-label" className="label">Ulangi kata sandi</label><input id="user-create-confirm" data-testid="user-create-confirm-password-input" type="password" className="field" required minLength={6} maxLength={72} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" disabled={busy} placeholder="Ketik ulang kata sandi" /></div>
        </div>
        <div><label htmlFor="user-create-role" data-testid="user-create-role-label" className="label">Tugas / peran</label><select id="user-create-role" data-testid="user-create-role-select" className="field" value={form.role} onChange={set("role")} disabled={busy}><option value="petugas">Petugas Gudang</option><option value="opname">Petugas Stock Opname</option><option value="admin">Admin</option></select><p data-testid="user-create-role-description" className="mt-2 text-xs leading-relaxed text-slate-500">{ROLE_HELP[form.role]}</p></div>
        {error && <p role="alert" data-testid="user-create-error" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {full && <p role="alert" data-testid="user-create-limit-error" className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">Batas 10 akun sudah tercapai, termasuk admin utama. Pengguna baru tidak dapat ditambahkan.</p>}
        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-5"><button type="button" onClick={close} disabled={busy} data-testid="user-create-cancel-button" className="btn-ghost">Batal</button><button type="submit" disabled={busy || full} data-testid="user-create-submit-button" className="btn-primary">{busy ? <LoaderCircle size={16} className="animate-spin" /> : <UserPlus size={16} />}{busy ? "Menyimpan…" : "Simpan Pengguna"}</button></div>
      </form>
    </section>
  </div>;
};