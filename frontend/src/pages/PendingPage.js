import { Clock, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Logos } from "../components/Logos";

export default function PendingPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const inactive = user && !user.active;
  return (
    <div className="min-h-screen bg-ink-900 grain relative flex items-center justify-center px-4">
      <div className="relative w-full max-w-md dark-panel p-8 text-center animate-rise" data-testid="pending-card">
        <Logos size={56} className="justify-center mb-6" />
        <div className="mx-auto h-14 w-14 rounded-full bg-amber-brand/15 border border-amber-brand/30 flex items-center justify-center text-amber-brand"><Clock size={26} /></div>
        <h1 className="mt-5 text-xl font-extrabold text-white">{inactive ? "Akun Dinonaktifkan" : "Menunggu Persetujuan"}</h1>
        <p className="mt-3 text-sm text-slate-400 leading-relaxed">
          {inactive
            ? "Akun Anda telah dinonaktifkan oleh admin. Hubungi admin BPBD Kabupaten Banjar untuk informasi lebih lanjut."
            : "Akun Google Anda telah tercatat. Admin BPBD Kabupaten Banjar perlu memberikan peran Petugas sebelum Anda dapat mengakses data stok."}
        </p>
        <div className="mt-5 rounded-lg bg-ink-900/70 border border-ink-700 p-3 text-left text-xs">
          <div className="text-slate-500 uppercase tracking-wider font-semibold">Akun</div>
          <div className="mt-1 text-slate-200 font-semibold" data-testid="pending-user-email">{user?.email}</div>
        </div>
        <button data-testid="pending-logout-button" onClick={async () => { await logout(); navigate("/", { replace: true }); }} className="btn-ghost mt-6"><LogOut size={14} /> Keluar</button>
      </div>
    </div>
  );
}
