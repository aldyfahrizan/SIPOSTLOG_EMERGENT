import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, UserPlus, Users, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { api, errorMessage } from "../lib/api";
import { PageHeader, Spinner } from "../components/StatCard";
import ConfirmDialog from "../components/ConfirmDialog";
import { UserCreateDialog } from "../components/UserCreateDialog";
import { UsersTable } from "../components/UsersTable";
import { useAuth } from "../context/AuthContext";
import { ROLE_LABEL } from "../lib/format";

export default function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState(null);
  const [capacity, setCapacity] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setError(""); setLoading(true);
    try {
      const [list, quota] = await Promise.all([api.get("/users"), api.get("/users/capacity")]);
      setUsers(list.data); setCapacity(quota.data);
    } catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const patch = async (user, body) => {
    try { await api.patch(`/users/${user.user_id}`, body); toast.success(`Akun ${user.name} diperbarui`); await load(); }
    catch (err) { toast.error(errorMessage(err)); }
    finally { setPendingAction(null); }
  };
  const confirmDeactivate = (user) => setPendingAction({
    title: "Nonaktifkan pengguna ini?",
    description: `Akun ${user.name} tidak dapat masuk sampai diaktifkan kembali. Akun nonaktif tetap dihitung dalam batas 10 pengguna.`,
    confirmLabel: "Nonaktifkan", tone: "danger", onConfirm: () => patch(user, { active: false }),
  });
  const confirmRoleChange = (user, role) => setPendingAction({
    title: "Ubah peran pengguna ini?", description: `Peran ${user.name} akan diubah dari ${ROLE_LABEL[user.role]} menjadi ${ROLE_LABEL[role]}.`,
    confirmLabel: "Ubah Peran", tone: "warn", onConfirm: () => patch(user, { role }),
  });
  const pending = (users || []).filter((user) => user.role === "pending").length;
  const full = capacity?.remaining === 0;

  return <div data-testid="users-page">
    <PageHeader eyebrow="Administrasi" title="Kelola Pengguna" description="Buat akun dan atur tugas setiap pengguna SIPOSTLOG." actions={
      <button onClick={() => setCreateOpen(true)} disabled={loading || !!error || !capacity || full} data-testid="user-add-button" className="btn-primary"><UserPlus size={16} /> Tambah Pengguna</button>
    } />

    <section className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-xl border border-blue-100 bg-white p-5 sm:p-6" data-testid="users-capacity-panel">
      <div className="flex items-center gap-4"><div className="rounded-xl bg-blue-50 p-3 text-brand-blue"><Users size={23} /></div><div><h2 className="text-sm font-semibold text-slate-600" data-testid="users-capacity-title">Kapasitas pengguna</h2><p data-testid="users-capacity-count" className="mt-1 font-mono text-2xl font-bold text-brand-blue">{capacity ? `${capacity.total} / ${capacity.limit}` : "— / 10"}<span className="ml-2 font-body text-sm font-medium text-slate-500">akun</span></p></div></div>
      <div className="sm:max-w-xs sm:w-full"><p className="text-sm font-semibold text-brand-blue" data-testid="users-capacity-remaining">{capacity ? (full ? "Kapasitas penuh" : `${capacity.remaining} slot pengguna tersisa`) : "Menghitung kapasitas…"}</p><div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden" aria-hidden="true"><div className="h-full rounded-full bg-brand-blue transition-[width] duration-300" style={{ width: `${capacity ? Math.min(100, (capacity.total / capacity.limit) * 100) : 0}%` }} /></div><p className="mt-2 text-xs leading-relaxed text-slate-500" data-testid="users-capacity-description">Termasuk admin utama, akun nonaktif, dan akun yang menunggu persetujuan.</p></div>
    </section>

    {full && <p role="status" data-testid="users-limit-alert" className="mb-5 rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">Batas maksimal 10 pengguna telah tercapai. Akun baru tidak dapat ditambahkan.</p>}
    {pending > 0 && <p data-testid="pending-users-alert" className="mb-5 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-brand-blue"><ShieldCheck size={16} /> {pending} akun menunggu persetujuan.</p>}
    {error && <div role="alert" data-testid="users-load-error" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}<button onClick={load} data-testid="users-retry-button" className="inline-flex items-center gap-2 font-semibold"><RefreshCw size={15} /> Coba lagi</button></div>}
    {loading && !users ? <Spinner /> : users && <UsersTable users={users} currentUserId={me.user_id} onRoleChange={confirmRoleChange} onDeactivate={confirmDeactivate} onActivate={(user) => patch(user, { active: true })} onDeleted={load} />}

    {createOpen && <UserCreateDialog capacity={capacity} onClose={() => setCreateOpen(false)} onRefresh={load} onCreated={(user) => { setCreateOpen(false); toast.success(`Pengguna ${user.name} berhasil ditambahkan`); load(); }} />}
    <ConfirmDialog open={!!pendingAction} title={pendingAction?.title} description={pendingAction?.description} confirmLabel={pendingAction?.confirmLabel} tone={pendingAction?.tone} onConfirm={pendingAction?.onConfirm} onCancel={() => setPendingAction(null)} testId="user-action-confirm-dialog" />
  </div>;
}