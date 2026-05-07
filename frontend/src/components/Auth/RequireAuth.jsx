import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  const infoRaw = typeof window !== 'undefined' ? localStorage.getItem('adminInfo') : null;
  const info = infoRaw ? JSON.parse(infoRaw) : null;

  if (!token || !info || info.role !== 'admin') {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
};

export default RequireAuth;
