import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Pujas from './pages/Pujas';
import PujaDetail from './pages/PujaDetail';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import UserDashboard from './pages/UserDashboard';
import PanditDashboard from './pages/PanditDashboard';
import AdminDashboard from './pages/AdminDashboard';

const App = () => {
  return (
    <div className="flex flex-col min-h-screen bg-spiritual-cream font-outfit">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pujas" element={<Pujas />} />
          <Route path="/pujas/:type" element={<PujaDetail />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:id" element={<ProductDetail />} />
          <Route path="/wishlist" element={<Wishlist />} />

          {/* User Protected Routes */}
          <Route path="/cart" element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/user-dashboard" element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboard />
            </ProtectedRoute>
          } />

          {/* Pandit Protected Routes */}
          <Route path="/pandit-dashboard" element={
            <ProtectedRoute allowedRoles={['pandit']}>
              <PanditDashboard />
            </ProtectedRoute>
          } />

          {/* Admin Protected Routes */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Fallback Route */}
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
              <span className="text-6xl">🧘</span>
              <h1 className="text-3xl font-bold mt-4 text-saffron-800">404 - Path to Divinity Lost</h1>
              <p className="text-gray-600 mt-2">The page you are looking for does not exist on PujaSetu.</p>
              <a href="/" className="mt-6 bg-saffron-500 hover:bg-saffron-600 text-white font-bold px-6 py-2 rounded-full transition-colors">
                Return to Home
              </a>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
