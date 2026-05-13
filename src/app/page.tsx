import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthState } from '../lib/auth';

export default function Page() {
  const { isAuth, role } = getAuthState();
  
  if (isAuth) {
    return <Navigate to={role === 'admin' ? "/admin" : "/user"} replace />;
  }
  
  return <Navigate to="/landing" replace />;
}
