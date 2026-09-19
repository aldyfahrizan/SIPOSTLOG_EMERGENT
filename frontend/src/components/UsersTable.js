import { UserCheck, UserX, UserRound } from "lucide-react";
import { fmtDateTime, ROLE_LABEL } from "../lib/format";
import { DeleteEntityButton } from "./AdminDeleteControls";

export const UsersTable = ({ users, currentUserId, onRoleChange, onDeactivate, onActivate, onDeleted }) => (
  <div className="overflow-x-auto scrollbar-thin rounded-lg border border-slate-200 bg-white" data-testid="users-table-panel">
    <table className="tbl" data-testid="users-table">
      <thead><tr><th>Pengguna</th><th>Tugas / peran</th><th>Status akun</th><th>Terakhir masuk</th><th className="text-right">Tindakan</th></tr></thead>
      <tbody>{users.map((user) => {
        const self = user.user_id === currentUserId;
        return <tr key={user.user_id} data-testid={`user-row-${user.user_id}`}>
          <td><div className="flex items-center gap-3"><div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-brand-blue shrink-0"><UserRound size={17} /></div><div><div className="font-semibold text-brand-blue" data-testid={`user-name-${user.user_id}`}>{user.name || "—"} {self && <span className="text-xs font-normal text-brand-orange">(Anda)</span>}</div><div className="mt-0.5 text-xs text-slate-500 break-all" data-testid={`user-username-${user.user_id}`}>{user.username ? `@${user.username}` : user.email}</div></div></div></td>
          <td><select aria-label={`Peran ${user.name}`} value={user.role} disabled={self} onChange={(event) => onRoleChange(user, event.target.value)} data-testid={`user-role-select-${user.user_id}`} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-brand-blue disabled:opacity-60"><>{Object.entries(ROLE_LABEL).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</></select></td>
          <td><span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${user.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`} data-testid={`user-status-${user.user_id}`}>{user.active ? "Aktif" : "Nonaktif"}</span></td>
          <td className="text-xs text-slate-500 whitespace-nowrap" data-testid={`user-last-login-${user.user_id}`}>{fmtDateTime(user.last_login)}</td>
          <td className="text-right"><div className="flex justify-end gap-2">{!self && (user.active
            ? <button onClick={() => onDeactivate(user)} className="btn-ghost !py-1.5 text-xs hover:!border-red-300 hover:!text-red-700" data-testid={`user-deactivate-${user.user_id}`}><UserX size={13} /> Nonaktifkan</button>
            : <button onClick={() => onActivate(user)} className="btn-ghost !py-1.5 text-xs" data-testid={`user-activate-${user.user_id}`}><UserCheck size={13} /> Aktifkan</button>)}<DeleteEntityButton kind="user" entity={user} onDeleted={onDeleted} disabled={self || user.is_primary} disabledReason={self ? "Akun yang sedang digunakan dilindungi" : user.is_primary ? "Admin utama dilindungi" : ""} /></div></td>
        </tr>;
      })}</tbody>
    </table>
  </div>
);