import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Customer pages
import Home from './pages/Home';
import Menu from './pages/Menu';
import DishDetails from './pages/DishDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import TrackOrder from './pages/TrackOrder';
import Login from './pages/Login';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageMenu from './pages/admin/ManageMenu';
import ManageOrders from './pages/admin/ManageOrders';
import ManageCategories from './pages/admin/ManageCategories';
import QRCodes from './pages/admin/QRCodes';
import TableOrders from './pages/admin/TableOrders';
import TableHistory from './pages/admin/TableHistory';

// Protected admin route
const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0A', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '2.5rem', animation: 'spin 2s linear infinite', display: 'inline-block' }}>🍽️</div>
      <p style={{ color: '#6B6560', fontSize: '0.9rem' }}>Loading...</p>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!user || !isAdmin) return <Navigate to="/login" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    {/* ── Customer Routes ── */}
    <Route path="/" element={<Home />} />
    <Route path="/menu" element={<Menu />} />
    <Route path="/dish/:slug" element={<DishDetails />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/track/:orderId" element={<TrackOrder />} />
    <Route path="/login" element={<Login />} />

    {/* ── Admin Routes ── */}
    <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
    <Route path="/admin/tables" element={<AdminRoute><TableOrders /></AdminRoute>} />
    <Route path="/admin/tables/history" element={<AdminRoute><TableHistory /></AdminRoute>} />
    <Route path="/admin/menu" element={<AdminRoute><ManageMenu /></AdminRoute>} />
    <Route path="/admin/orders" element={<AdminRoute><ManageOrders /></AdminRoute>} />
    <Route path="/admin/categories" element={<AdminRoute><ManageCategories /></AdminRoute>} />
    <Route path="/admin/qr-codes" element={<AdminRoute><QRCodes /></AdminRoute>} />

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <CartProvider>
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1A1A1A', color: '#F5F0E8',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '0.9rem',
            maxWidth: '90vw',
          },
        }}
      />
      <AppRoutes />
    </CartProvider>
  </AuthProvider>
);

export default App;
