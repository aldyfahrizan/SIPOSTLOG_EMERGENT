import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "./StatCard";

export default function ProtectedRoute({ children, allowPending = false, adminOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen bg-paper"><Spinner /></div>;
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.role === "pending" || !user.active) {
    return allowPending ? children : <Navigate to="/menunggu" replace />;
  }
  if (allowPending) return <Navigate to="/app/stok" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/app/stok" replace />;
  return children;
}
