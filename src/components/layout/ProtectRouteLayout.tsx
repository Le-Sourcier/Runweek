// // src/components/auth/ProtectedRoute.tsx
// import React from "react";
// import { useLocation, useParams } from "react-router-dom";
// import { useUser } from "../../hooks/useUser";
// import { AuthRedirectHandler } from "../auth/AuthRedirectHandler";

// const loadingScreen = (
//   <div
//     style={{
//       display: "flex",
//       justifyContent: "center",
//       alignItems: "center",
//       height: "100vh",
//       background: "var(--background)",
//       color: "var(--foreground)",
//     }}
//   >
//     Loading application...
//   </div>
// );

// const ProtectedRoute = ({
//   children,
//   authType,
// }: {
//   children: React.ReactNode;
//   authType?:
//     | "login"
//     | "register"
//     | "password-recovery"
//     | "verify-email"
//     | "reset-password"
//     | "forgot-password";
// }) => {
//   const { isAuthenticated, isLoading } = useUser();
//   const location = useLocation();
//   const params = useParams();

//   if (isLoading) {
//     return loadingScreen;
//   }

//   if (!isAuthenticated) {
//     // Détection automatique du type d'auth basée sur le chemin
//     const detectedAuthType =
//       authType ||
//       (() => {
//         const path = location.pathname;

//         if (path.includes("verify")) return "verify-email";
//         if (path.includes("register")) return "register";
//         if (path.includes("forgot-password")) return "forgot-password";
//         if (path.includes("reset-password")) {
//           return params.token ? "reset-password" : "forgot-password";
//         }
//         if (path.includes("settings") || path.includes("dashboard"))
//           return "login";

//         return "login";
//       })();

//     return <AuthRedirectHandler authType={detectedAuthType} />;
//   }

//   return <>{children}</>;
// };

// export default ProtectedRoute;
// src/components/auth/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import { setCookie } from "../../utils/Cookies";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useUser();
  const location = useLocation();

  const loadingScreen = (
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

  if (isLoading) {
    return loadingScreen;
  }

  if (!isAuthenticated) {
    // Enregistre le chemin actuel dans un cookie avant redirection
    const currentPath = location.pathname + location.search;
    setCookie("redirect_path", currentPath, {
      path: "/",
      maxAge: 300, // 5 minutes en secondes
      sameSite: "strict",
      // secure: process.env.NODE_ENV === "production",
    });

    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
