import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/context/AuthContext';
import { NotificationsProvider } from './lib/context/NotificationsContext';
import { LoadingOverlay } from './components/layout/LoadingStates';

// Styles
import './styles/mobile.css';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Customer Pages
import ServicesPage from './pages/customer/ServicesPage';
import MarketPage from './pages/customer/MarketPage';
import OrdersPage from './pages/customer/OrdersPage';
import ProfilePage from './pages/customer/ProfilePage';
import NotificationsPage from './pages/customer/NotificationsPage';
import CreateQuotePage from './pages/customer/CreateQuotePage';
import QuotesListPage from './pages/customer/QuotesListPage';
import QuoteDetailsPage from './pages/customer/QuoteDetailsPage';
import BookingDetailsPage from './pages/customer/BookingDetailsPage';

// Garage Pages
import GaragePage from './pages/customer/GaragePage';
import AddVehiclePage from './pages/customer/AddVehiclePage';
import VehicleDetailsPage from './pages/customer/VehicleDetailsPage';

// Discovery Pages
import MapPage from './pages/customer/MapPage';
import OrganizationDetailsPage from './pages/customer/OrganizationDetailsPage';
import FavoritesPage from './pages/customer/FavoritesPage';

// Provider Pages
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProviderQuotesPage from './pages/provider/ProviderQuotesPage';
import ProviderQuoteDetailsPage from './pages/provider/ProviderQuoteDetailsPage';
import ProviderBookingsPage from './pages/provider/ProviderBookingsPage';
import ProviderBookingDetailsPage from './pages/provider/ProviderBookingDetailsPage';
import ProviderServicesPage from './pages/provider/ProviderServicesPage';
import ProviderProfilePage from './pages/provider/ProviderProfilePage';
import ProviderStatsPage from './pages/provider/ProviderStatsPage';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingOverlay />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
}

// Public Route - redirects to home if authenticated
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingOverlay />;
  }

  if (isAuthenticated) {
    return <Navigate to="/services" replace />;
  }

  return children;
}

// App Routes
function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/auth/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/auth/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Customer Routes */}
      <Route path="/services" element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
      <Route path="/market" element={<ProtectedRoute><MarketPage /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      
      {/* Quotes */}
      <Route path="/quotes" element={<ProtectedRoute><QuotesListPage /></ProtectedRoute>} />
      <Route path="/quotes/create" element={<ProtectedRoute><CreateQuotePage /></ProtectedRoute>} />
      <Route path="/quotes/:id" element={<ProtectedRoute><QuoteDetailsPage /></ProtectedRoute>} />

      {/* Bookings */}
      <Route path="/bookings/:id" element={<ProtectedRoute><BookingDetailsPage /></ProtectedRoute>} />

      {/* Garage / Vehicles */}
      <Route path="/vehicles" element={<ProtectedRoute><GaragePage /></ProtectedRoute>} />
      <Route path="/vehicles/add" element={<ProtectedRoute><AddVehiclePage /></ProtectedRoute>} />
      <Route path="/vehicles/:id" element={<ProtectedRoute><VehicleDetailsPage /></ProtectedRoute>} />

      {/* Discovery */}
      <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
      <Route path="/organization/:id" element={<ProtectedRoute><OrganizationDetailsPage /></ProtectedRoute>} />
      <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />

      {/* Provider Routes */}
      <Route path="/provider/dashboard" element={<ProtectedRoute><ProviderDashboard /></ProtectedRoute>} />
      <Route path="/provider/quotes" element={<ProtectedRoute><ProviderQuotesPage /></ProtectedRoute>} />
      <Route path="/provider/quotes/:id" element={<ProtectedRoute><ProviderQuoteDetailsPage /></ProtectedRoute>} />
      <Route path="/provider/bookings" element={<ProtectedRoute><ProviderBookingsPage /></ProtectedRoute>} />
      <Route path="/provider/bookings/:id" element={<ProtectedRoute><ProviderBookingDetailsPage /></ProtectedRoute>} />
      <Route path="/provider/services" element={<ProtectedRoute><ProviderServicesPage /></ProtectedRoute>} />
      <Route path="/provider/profile" element={<ProtectedRoute><ProviderProfilePage /></ProtectedRoute>} />
      <Route path="/provider/stats" element={<ProtectedRoute><ProviderStatsPage /></ProtectedRoute>} />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/services" replace />} />
      <Route path="*" element={<Navigate to="/services" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationsProvider>
          <AppRoutes />
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
