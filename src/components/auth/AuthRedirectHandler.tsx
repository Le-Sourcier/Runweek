// src/components/auth/AuthRedirectHandler.tsx
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useUserContext } from "../../hooks/useUser";
import { ROUTES } from "../../hooks/useAppNavigation";

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
  const { isAuthenticated, isLoading } = useUserContext();
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
      ROUTES.LOGIN,
      ROUTES.REGISTER,
      ROUTES.VERIFY_EMAIL,
      ROUTES.FORGOT_PASSWORD,
      ROUTES.RESET_PASSWORD,
      ROUTES.PASSWORD_RECOVERY,
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
      return <Navigate to={buildAuthUrl(ROUTES.REGISTER)} replace />;
    case "verify-email":
      return <Navigate to={buildAuthUrl(ROUTES.VERIFY_EMAIL)} replace />;
    case "forgot-password":
      return <Navigate to={buildAuthUrl(ROUTES.FORGOT_PASSWORD)} replace />;
    case "reset-password":
      return <Navigate to={buildAuthUrl(ROUTES.RESET_PASSWORD, true)} replace />;
    case "password-recovery":
      return <Navigate to={buildAuthUrl(ROUTES.PASSWORD_RECOVERY)} replace />;
    default: // "login"
      return <Navigate to={buildAuthUrl(ROUTES.LOGIN)} replace />;
  }
};
