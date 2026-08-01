import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  // Not an admin - send them home rather than showing the admin shell at all
  if (!user.isAdmin) return <Navigate to="/" replace />;

  return children;
}