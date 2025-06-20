import { Route, Routes, Navigate, Outlet, useLocation } from "react-router-dom";

// Layout and Page Components
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Statistics from "./pages/Statistics";
import Coach from "./pages/Coach";
import Calendar from "./pages/Calendar";
import Goals from "./pages/Goals";
import Achievements from "./pages/Achievements";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import Settings from "./pages/Settings";
import PersonalRecords from "./pages/PersonalRecords";

// Auth Page Components
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";
import PasswordRecoveryRequestPage from "./pages/PasswordRecoveryRequestPage";
import PasswordResetPage from "./pages/PasswordResetPage";

// Context Providers
import { ThemeProvider, useTheme } from "./context/ThemeContext"; // Added useTheme import
import { FloatingCoachProvider } from "./context/FloatingCoachContext"; // Import FloatingCoachProvider
import { UserProvider, useUser } from "./context/UserContext";
import { SearchProvider } from "./context/SearchContext";
import { NotificationProvider } from "./context/NotificationContext";
import { PRProvider } from "./context/PRContext";

// Other Imports
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// This component wraps the main application layout and its specific context providers
const MainAppLayoutContent: React.FC = () => {
  const { theme: appTheme } = useTheme(); // Get current app theme

  return (
    <SearchProvider>
      <NotificationProvider>
        <PRProvider>
          <Layout>
            {" "}
            {/* Layout should contain an <Outlet /> for the nested routes */}
            <Outlet />
          </Layout>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={appTheme} // Dynamically set theme
          />
        </PRProvider>
      </NotificationProvider>
    </SearchProvider>
  );
};

// This component defines the application's routing structure
const AppRoutes: React.FC = () => {
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

  return (
    <Routes>
      {/* Public Authentication Routes: Redirect if already authenticated */}
      <Route
        path="/login"
        element={
          isLoading ? (
            loadingScreen
          ) : isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/register"
        element={
          isLoading ? (
            loadingScreen
          ) : isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <RegistrationPage />
          )
        }
      />
      <Route
        path="/forgot-password"
        element={
          isLoading ? (
            loadingScreen
          ) : isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <PasswordRecoveryRequestPage />
          )
        }
      />
      <Route
        path="/reset-password/:token"
        element={
          isLoading ? (
            loadingScreen
          ) : isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <PasswordResetPage />
          )
        }
      />

      {/* Protected Application Routes */}
      <Route
        path="/*" // This will match all paths not caught by the auth routes above
        element={
          isLoading ? (
            loadingScreen
          ) : isAuthenticated ? (
            <MainAppLayoutContent />
          ) : (
            <Navigate
              to={`/login?redirect=${encodeURIComponent(
                `${location.pathname}${location.search}${location.hash}`
              )}`}
              replace
            />
          )
        }
      >
        {/* These routes are children of MainAppLayoutContent and render inside its <Outlet /> */}
        <Route index element={<Dashboard />} />{" "}
        {/* Default route for "/" after login */}
        <Route path="statistics" element={<Statistics />} />
        <Route path="coach" element={<Coach />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="goals" element={<Goals />} />
        <Route path="achievements" element={<Achievements />} />
        <Route path="personal-records" element={<PersonalRecords />} />
        <Route path="profile" element={<Profile />} />
        <Route path="support" element={<Support />} />
        <Route path="settings" element={<Settings />} />
        {/* Fallback for any unmatched protected routes - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

// Main App component: Sets up UserProvider and renders the AppRoutes
function App() {
  return (
    <ThemeProvider>
      {" "}
      {/* Added ThemeProvider wrapper */}
      <FloatingCoachProvider>
        {" "}
        {/* Add the new provider here */}
        <UserProvider>
          <AppRoutes />
        </UserProvider>
      </FloatingCoachProvider>
    </ThemeProvider>
  );
}

export default App;
