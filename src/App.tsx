import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import React from "react";

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
import Diet from "./pages/Diet";

// Auth Page Components
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";
import PasswordRecoveryRequestPage from "./pages/PasswordRecoveryRequestPage";
import PasswordResetPage from "./pages/PasswordResetPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";

// Context Providers
import { ThemeProvider } from "./context/ThemeContext";
import { FloatingCoachProvider } from "./context/FloatingCoachContext";
import { SearchProvider } from "./context/SearchContext";
import { NotificationProvider } from "./context/NotificationContext";
import { PRProvider } from "./context/PRContext";
import { DietProvider } from "./context/DietContext";
import { SocialProvider } from "./context/SocialContext";
import { UserProvider } from "./providers/UserProvider";
import { MessageProvider } from "./providers/MessageProvider";

// Components
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/layout/ProtectRouteLayout";

const MainAppLayoutContent: React.FC = () => {
  return (
    <div className="">
      <SearchProvider>
        <NotificationProvider>
          <PRProvider>
            <DietProvider>
              <SocialProvider>
                <FloatingCoachProvider>
                  <Layout>
                    <Outlet />
                  </Layout>
                </FloatingCoachProvider>
              </SocialProvider>
            </DietProvider>
          </PRProvider>
        </NotificationProvider>
      </SearchProvider>
    </div>
  );
};

const AuthRoutesHandler = () => {
  // const location = useLocation();

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegistrationPage />} />

      <Route
        path="/forgot-password"
        element={<PasswordRecoveryRequestPage />}
      />

      <Route path="/verify-mail" element={<VerifyEmailPage />} />

      <Route path="/reset-password/:token" element={<PasswordResetPage />} />

      {/* Protected App Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainAppLayoutContent />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="coach" element={<Coach />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="goals" element={<Goals />} />
        <Route path="achievements" element={<Achievements />} />
        <Route path="personal-records" element={<PersonalRecords />} />
        <Route path="diet" element={<Diet />} />
        <Route path="profile" element={<Profile />} />
        <Route path="support" element={<Support />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <MessageProvider>
        <UserProvider>
          <AuthRoutesHandler />
        </UserProvider>
      </MessageProvider>
    </ThemeProvider>
  );
}

export default App;
