import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Logos } from "../components/Logos";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate(user.role === "pending" ? "/menunggu" : "/app/stok", { replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="relative min-h-screen bg-ink-900 grain overflow-hidden flex items-center justify-center px-4">
      <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-amber-brand/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-[420px] w-[420px] rounded-full bg-sky-500/10 blur-3xl" />
      <div className="relative w-full max-w-md dark-panel p-8 sm:p-10 shadow-glow animate-rise" data-testid="login-card">
        <Logos size={64} className="justify-center mb-6" />
        <div className="text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-brand">Akses Petugas</div>
          <h1 className="mt-2 text-2xl font-extrabold text-white tracking-tight">Masuk ke SIPOSTLOG</h1>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">Sistem Informasi Pemantauan Stock Opname Logistik BPBD Kabupaten Banjar. Gunakan akun Google yang telah didaftarkan.</p>
        </div>
        <button data-testid="google-login-button" onClick={login} className="mt-8 w-full inline-flex items-center justify-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-bold text-ink-900 hover:bg-slate-100 active:scale-[0.98] transition-[background-color,transform] duration-150">
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.8 6C12.3 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.4 28.7A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.8-6z"/><path fill="#34A853" d="M24 48c6.2 0 11.6-2 15.4-5.6l-7.5-5.8c-2.1 1.4-4.8 2.3-7.9 2.3-6.3 0-11.7-4.1-13.6-9.8l-7.8 6C6.5 42.6 14.6 48 24 48z"/></svg>
          Masuk dengan Google
        </button>
        <div className="mt-6 flex items-start gap-2 rounded-lg bg-ink-900/70 border border-ink-700 p-3 text-xs text-slate-400">
          <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          Akun Google baru akan berstatus <span className="text-slate-200 font-semibold">menunggu persetujuan</span> hingga admin memberikan peran.
        </div>
        <Link to="/" data-testid="login-back-link" className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-brand transition-colors"><ArrowLeft size={14} /> Kembali ke halaman publik</Link>
      </div>
    </div>
  );
}
