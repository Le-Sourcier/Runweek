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
import Settings from "./pages/settings/Settings";
import PersonalRecords from "./pages/PersonalRecords";
import Diet from "./pages/Diet";
import TrainingPlan from "./pages/TrainingPlan";

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
import { ROUTES } from "./hooks/useAppNavigation";
import FriendsLayout from "./components/layout/FriendsLayout";
import SocketManager from "./utils/SocketManager";
import { LanguageProvider } from "./providers/LanguageProvider";

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
                    <SocketManager />

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
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      <Route path={ROUTES.REGISTER} element={<RegistrationPage />} />

      <Route
        path={ROUTES.FORGOT_PASSWORD}
        element={<PasswordRecoveryRequestPage />}
      />

      <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />

      <Route path={ROUTES.RESET_PASSWORD} element={<PasswordResetPage />} />

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
        <Route path={ROUTES.TRAINING_PLAN} element={<TrainingPlan />} />
        <Route path="friends" element={<FriendsLayout />} />
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
      <LanguageProvider>
        <MessageProvider>
          <UserProvider>
            <AuthRoutesHandler />
          </UserProvider>
        </MessageProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
