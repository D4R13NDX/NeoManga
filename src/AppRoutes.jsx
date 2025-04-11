import { Routes, Route, Navigate} from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingSpinner from './Components/loadingspinner';
import Login from './Pages/Login/Login';
import Home from './Pages/Home/Home';
import Register from './Pages/Register/Register';
import NotFound from './Pages/404/404';
import Contact from './Pages/Contact/Contact';
import Profile from './Pages/Profile/Profile';
import AdminPanel from './Pages/AdminPanel/AdminPanel';
import ProtectedRoute from './Components/ProtectedRoute';
import MangasPage from './Pages/MangasPage/MangasPage'; 
import ComicsPage from './Pages/ComicsPage/ComicsPage';
import ProductDetail from './Pages/ProductDetail/ProductDetail';
import WishlistPage from './Pages/WishlistPage/WishlistPage';
import CartPage from './Pages/CartPage/CartPage';
import OrderConfirmation from './Components/OrderConfirmation';
import SearchResults from './Pages/SearchResults/SearchResults';
import ForgotPassword from './Pages/Login/Components/ForgotPassword';
import TwoFactorAuth from './Pages/Login/Components/TwoFactorAuth';

const AppRoutes = () => {
    const { currentUser, userRole, loading } = useAuth();
    
    if (loading) {
        return <LoadingSpinner />;
      }

  return (
    <Routes>
      {/* Ruta raíz */}
      <Route path="/" element={
  <Navigate to={currentUser ? (userRole === 'admin' ? "/admin" : "/home") : "/login"} replace />
      } />
      
      {/* Rutas públicas */}
      <Route path="/contact" element={<Contact />} />
      <Route path="/mangas" element={<MangasPage />} />
      <Route path="/comics" element={<ComicsPage />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/two-factor-auth" element={<TwoFactorAuth />} />
      
      {/* Rutas de autenticación */}
      <Route path="/login" element={
  !currentUser ? <Login /> : <Navigate to="/" replace />
} />
<Route path="/register" element={
  !currentUser ? <Register /> : <Navigate to="/" replace />
} />
      
      {/* Rutas protegidas */}
      <Route path="/home" element={
  <ProtectedRoute>
    <Home />
  </ProtectedRoute>
} />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/preventas" element={
        <ProtectedRoute>
          <div>Página de Preventas</div>
        </ProtectedRoute>
      } />
      <Route path="/wishlist" element={
                <ProtectedRoute>
                    <WishlistPage />
                </ProtectedRoute>
            } />
      <Route path="/cart" element={
                <ProtectedRoute>
                    <CartPage />
                </ProtectedRoute>
            } />
      <Route path="/order-confirmation/:orderId" element={
  <ProtectedRoute>
    <OrderConfirmation />
  </ProtectedRoute>
} />
      {/* Ruta de administrador */}
      <Route path="/admin" element={
  <ProtectedRoute requiredRole="admin">
    <AdminPanel />
  </ProtectedRoute>
} />
      
      {/* Ruta 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;