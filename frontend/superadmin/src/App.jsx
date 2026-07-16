import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Families from './pages/Families';
import FamilyDetails from './pages/FamilyDetails';
import Members from './pages/Members';
import FamilyAdmins from './pages/FamilyAdmins';
import Subscriptions from './pages/Subscriptions';
import Plans from './pages/Plans';
import Revenue from './pages/Revenue';
import Billing from './pages/Billing';
import Analytics from './pages/Analytics';
import Support from './pages/Support';
import Broadcast from './pages/Broadcast';
import AuditLogs from './pages/AuditLogs';
import Roles from './pages/Roles';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

const queryClient = new QueryClient();

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('superadmin_token');
  const user = localStorage.getItem('superadmin_user');
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  
  const role = JSON.parse(user).role?.toUpperCase();
  if (role !== 'SUPER_ADMIN') {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/families" element={<Families />} />
            <Route path="/families/:id" element={<FamilyDetails />} />
            <Route path="/admins" element={<FamilyAdmins />} />
            <Route path="/members" element={<Members />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/revenue" element={<Revenue />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/support" element={<Support />} />
            <Route path="/broadcast" element={<Broadcast />} />
            <Route path="/audit" element={<AuditLogs />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
