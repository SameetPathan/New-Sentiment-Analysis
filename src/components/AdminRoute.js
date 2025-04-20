// AdminRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

// This component handles routes that should only be accessible to admin users
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  
  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  // If user is not logged in or not an admin, redirect to login
  if (!user || user.userType !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  
  // If user is logged in and is an admin, render the protected component
  return children;
}

export default AdminRoute;