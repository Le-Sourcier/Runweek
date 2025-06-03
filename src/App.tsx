import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Statistics from './pages/Statistics';
import Coach from './pages/Coach';
import Calendar from './pages/Calendar';
import Goals from './pages/Goals';
import Achievements from './pages/Achievements';
import Profile from './pages/Profile';
import Support from './pages/Support';
import Settings from './pages/Settings';
import PersonalRecords from './pages/PersonalRecords';
import { UserProvider } from './context/UserContext';
import { SearchProvider } from './context/SearchContext';
import { NotificationProvider } from './context/NotificationContext';
import { PRProvider } from './context/PRContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <UserProvider>
      <SearchProvider>
        <NotificationProvider>
          <PRProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/coach" element={<Coach />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/personal-records" element={<PersonalRecords />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/support" element={<Support />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          </PRProvider>
          <ToastContainer
            position="top-right" // Using template's props
            autoClose={3000}    // Using template's props
            hideProgressBar={false}
            newestOnTop={false} // Using template's props
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </NotificationProvider>
      </SearchProvider>
    </UserProvider>
  );
}

export default App;