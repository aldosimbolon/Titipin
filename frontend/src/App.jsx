import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import LegalPage from './pages/legal/LegalPage';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/customer/Dashboard';
import OrderCreate from './pages/customer/OrderCreate';
import OrderHistory from './pages/customer/OrderHistory';
import OrderDetail from './pages/customer/OrderDetail';
import Profile from './pages/customer/Profile';
import Warehouse from './pages/customer/Warehouse';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';

// Seed data on first load

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner lg"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner lg"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/syarat-ketentuan" element={<LegalPage type="terms" />} />
            <Route path="/kebijakan-privasi" element={<LegalPage type="privacy" />} />

            {/* Customer */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/order/create" element={<ProtectedRoute><DashboardLayout><OrderCreate /></DashboardLayout></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><DashboardLayout><OrderHistory /></DashboardLayout></ProtectedRoute>} />
            <Route path="/warehouse" element={<ProtectedRoute><DashboardLayout><Warehouse /></DashboardLayout></ProtectedRoute>} />
            <Route path="/order/:id" element={<ProtectedRoute><DashboardLayout><OrderDetail /></DashboardLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><DashboardLayout><Profile /></DashboardLayout></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><DashboardLayout isAdmin><AdminDashboard /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute adminOnly><DashboardLayout isAdmin><AdminOrders /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute adminOnly><DashboardLayout isAdmin><AdminUsers /></DashboardLayout></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute adminOnly><DashboardLayout isAdmin><AdminSettings /></DashboardLayout></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
