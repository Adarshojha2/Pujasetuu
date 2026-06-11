import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-spiritual-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron-600"></div>
        <span className="ml-3 font-semibold text-saffron-700">Loading PujaSetu...</span>
      </div>
    );
  }

  if (!user) {
    // Redirect to login, saving the target location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in but not authorized for this route
    if (user.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (user.role === 'pandit') {
      return <Navigate to="/pandit-dashboard" replace />;
    } else {
      return <Navigate to="/user-dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
