import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function ProtectedRoute({ requiredRole }) {
  const { token, role } = useAuth();

  if (!token) return <Navigate to="/" replace />;
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/events" replace />;
  }
  return <Outlet />;
}
