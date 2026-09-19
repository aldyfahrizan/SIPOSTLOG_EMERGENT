import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
  const hasProcessed = useRef(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const sessionId = params.get("session_id");
    if (!sessionId) { navigate("/login", { replace: true }); return; }
    api.post("/auth/session", { session_id: sessionId })
      .then(({ data }) => {
        setUser(data);
        window.history.replaceState(null, "", window.location.pathname);
        navigate(data.role === "pending" ? "/menunggu" : "/app/stok", { replace: true, state: { user: data } });
      })
      .catch(() => setError("Gagal memproses sesi masuk. Silakan coba lagi."));
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center text-slate-300" data-testid="auth-callback">
      {error ? (
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button className="btn-primary" onClick={() => navigate("/login", { replace: true })}>Kembali ke Masuk</button>
        </div>
      ) : (
        <div className="h-8 w-8 rounded-full border-2 border-ink-700 border-t-amber-brand animate-spin" />
      )}
    </div>
  );
}
