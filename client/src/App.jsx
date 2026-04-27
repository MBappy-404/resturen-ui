import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';

// Admin Layout
import AdminLayout from './components/layout/AdminLayout';
import CustomerLayout from './components/customer-layout/CustomerLayout';

// Admin Pages
import Login from './pages/admin/Login';
import Register from './pages/admin/Register';
import Dashboard from './pages/admin/Dashboard';
import MenuPage from './pages/admin/MenuPage';
import OrdersPage from './pages/admin/OrdersPage';
import KitchenPage from './pages/admin/KitchenPage';
import TablesPage from './pages/admin/TablesPage';
import ReservationsPage from './pages/admin/ReservationsPage';
import StaffPage from './pages/admin/StaffPage';
import InventoryPage from './pages/admin/InventoryPage';
import CustomersPage from './pages/admin/CustomersPage';
import InvoicesPage from './pages/admin/InvoicesPage';
import ReportsPage from './pages/admin/ReportsPage';
import OrganizationPage from './pages/admin/OrganizationPage';
import SettingsPage from './pages/admin/SettingsPage';
import POSPage from './pages/admin/POSPage';

// Customer Pages
import HomePage from './pages/customer/HomePage';
import ShopMenu from './pages/customer/ShopMenu';
import FoodDetail from './pages/customer/FoodDetail';
import Checkout from './pages/customer/Checkout';
import OrderTracking from './pages/customer/OrderTracking';
import CustomerLogin from './pages/customer/CustomerLogin';
import CustomerProfile from './pages/customer/CustomerProfile';
import MyOrders from './pages/customer/MyOrders';
import AboutPage from './pages/customer/AboutPage';
import ContactPage from './pages/customer/ContactPage';

const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
};

const AdminRoutes = () => (
  <Routes>
    <Route path="login" element={<Login />} />
    <Route path="register" element={<Register />} />
    <Route path="pos" element={<AdminProtectedRoute><POSPage /></AdminProtectedRoute>} />
    <Route element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
      <Route index element={<Dashboard />} />
      <Route path="menu" element={<MenuPage />} />
      <Route path="orders" element={<OrdersPage />} />
      <Route path="kitchen" element={<KitchenPage />} />
      <Route path="tables" element={<TablesPage />} />
      <Route path="reservations" element={<ReservationsPage />} />
      <Route path="staff" element={<StaffPage />} />
      <Route path="inventory" element={<InventoryPage />} />
      <Route path="customers" element={<CustomersPage />} />
      <Route path="invoices" element={<InvoicesPage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="organization" element={<OrganizationPage />} />
      <Route path="settings" element={<SettingsPage />} />
    </Route>
  </Routes>
);

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CustomerAuthProvider>
            <CartProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: { borderRadius: '16px', background: '#1F2937', color: '#fff', fontSize: '14px' },
                }}
              />
              <Routes>
                {/* Admin Routes */}
                <Route path="/admin/*" element={<AdminRoutes />} />

                {/* Customer E-Commerce Routes */}
                <Route element={<CustomerLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/menu" element={<ShopMenu />} />
                  <Route path="/menu/:id" element={<FoodDetail />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-tracking/:id" element={<OrderTracking />} />
                  <Route path="/login" element={<CustomerLogin />} />
                  <Route path="/profile" element={<CustomerProfile />} />
                  <Route path="/orders" element={<MyOrders />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/cart" element={<ShopMenu />} />
                </Route>
              </Routes>
            </CartProvider>
          </CustomerAuthProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
