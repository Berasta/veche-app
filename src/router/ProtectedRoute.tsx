import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@store/hooks/useAuth";

export function ProtectedRoute({
  redirectPath = "/auth/login",
}: { redirectPath?: string } = {}) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const target = location.pathname === "/" ? "/app" : location.pathname + location.search;
    const encoded = encodeURIComponent(target);
    return <Navigate to={`${redirectPath}?redirect=${encoded}`} replace />;
  }

  if (location.pathname === "/") {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
