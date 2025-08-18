// src/components/auth/AuthRedirectHandler.tsx
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useUser } from "../../hooks/useUser";

export const AuthRedirectHandler = ({
  authType = "login",
}: {
  authType:
    | "login"
    | "register"
    | "password-recovery"
    | "verify-email"
    | "reset-password"
    | "forgot-password";
}) => {
  const { isAuthenticated, isLoading } = useUser();
  const location = useLocation();
  const params = useParams();
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get("redirect") || "/";

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        Loading application...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const buildAuthUrl = (path: string, keepToken = false) => {
    const currentPath = location.pathname;
    const isAuthPath = [
      "/login",
      "/register",
      "/verify-email",
      "/forgot-password",
      "/reset-password",
      "/password-recovery",
    ].some((authPath) => currentPath.startsWith(authPath));

    const originalRedirect = isAuthPath
      ? redirectTo
      : currentPath + location.search;

    const baseUrl =
      keepToken && params.token ? `${path}/${params.token}` : path;

    return `${baseUrl}?redirect=${encodeURIComponent(originalRedirect)}`;
  };

  switch (authType) {
    case "register":
      return <Navigate to={buildAuthUrl("/register")} replace />;
    case "verify-email":
      return <Navigate to={buildAuthUrl("/verify-email")} replace />;
    case "forgot-password":
      return <Navigate to={buildAuthUrl("/forgot-password")} replace />;
    case "reset-password":
      return <Navigate to={buildAuthUrl("/reset-password", true)} replace />;
    case "password-recovery":
      return <Navigate to={buildAuthUrl("/password-recovery")} replace />;
    default: // "login"
      return <Navigate to={buildAuthUrl("/login")} replace />;
  }
};
