import { useEffect, useState } from "react";
import { ShieldCheck, UserX, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { api, errorMessage } from "../lib/api";
import { EmptyState, PageHeader, Panel, Spinner } from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { fmtDateTime, ROLE_LABEL } from "../lib/format";

const ROLE_STYLE = { admin: "bg-amber-brand/15 text-amber-brand border-amber-brand/30", petugas: "bg-sky-500/15 text-sky-300 border-sky-500/30", pending: "bg-slate-500/15 text-slate-300 border-slate-500/30" };

export default function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState(null);
  const load = () => api.get("/users").then((r) => setUsers(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const patch = async (u, body) => {
    try { await api.patch(`/users/${u.user_id}`, body); toast.success(`Akun ${u.email} diperbarui`); load(); }
    catch (err) { toast.error(errorMessage(err)); }
  };

  const pending = (users || []).filter((u) => u.role === "pending").length;

  return (
    <div data-testid="users-page">
      <PageHeader eyebrow="Administrasi" title="Kelola Pengguna" description="Akun Google yang pernah masuk. Berikan peran Petugas atau Admin, atau nonaktifkan akun. Akun baru berstatus Menunggu hingga disetujui." />
      {pending > 0 && <div className="mb-5 flex items-center gap-2 rounded-lg border border-amber-brand/40 bg-amber-brand/10 p-3 text-sm text-amber-200" data-testid="pending-users-alert"><ShieldCheck size={16} /> {pending} akun menunggu persetujuan.</div>}
      <Panel testId="users-table-panel">
        {!users ? <Spinner /> : users.length === 0 ? <EmptyState text="Belum ada pengguna." /> : (
          <div className="overflow-x-auto scrollbar-thin -mx-2">
            <table className="tbl">
              <thead><tr><th>Pengguna</th><th>Peran</th><th>Status</th><th>Terakhir Masuk</th><th className="text-right">Tindakan</th></tr></thead>
              <tbody>
                {users.map((u) => {
                  const self = u.user_id === me.user_id;
                  return (
                    <tr key={u.user_id} data-testid={`user-row-${u.user_id}`}>
                      <td><div className="flex items-center gap-3">{u.picture ? <img src={u.picture} alt="" className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" /> : <div className="h-8 w-8 rounded-full bg-ink-700" />}<div><div className="font-semibold text-white">{u.name || "—"} {self && <span className="text-[10px] text-amber-brand">(Anda)</span>}</div><div className="text-xs text-slate-400">{u.email}</div></div></div></td>
                      <td>
                        <select value={u.role} disabled={self} onChange={(e) => patch(u, { role: e.target.value })} data-testid={`user-role-select-${u.user_id}`} className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider focus:outline-none disabled:opacity-60 ${ROLE_STYLE[u.role]}`} style={{ background: "transparent" }}>
                          {Object.entries(ROLE_LABEL).map(([k, v]) => <option key={k} value={k} className="bg-ink-900 text-white normal-case">{v}</option>)}
                        </select>
                      </td>
                      <td><span className={`text-xs font-bold ${u.active ? "text-emerald-400" : "text-red-400"}`} data-testid={`user-status-${u.user_id}`}>{u.active ? "Aktif" : "Nonaktif"}</span></td>
                      <td className="text-xs text-slate-400 whitespace-nowrap">{fmtDateTime(u.last_login)}</td>
                      <td className="text-right">
                        {!self && (u.active
                          ? <button onClick={() => patch(u, { active: false })} className="btn-ghost !py-1 text-xs hover:!border-red-500/60 hover:!text-red-400" data-testid={`user-deactivate-${u.user_id}`}><UserX size={13} /> Nonaktifkan</button>
                          : <button onClick={() => patch(u, { active: true })} className="btn-ghost !py-1 text-xs" data-testid={`user-activate-${u.user_id}`}><UserCheck size={13} /> Aktifkan</button>)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
