import React from 'react';
import LandingPage from '../../components/landing-page/LandingPage';
import { Navigate } from 'react-router-dom';
import { getAuthState } from '../../lib/auth';

export default function Landing() {
  const { isAuth, role } = getAuthState();
  
  // If user is already logged in and hits /landing, we can either let them see it
  // or redirect them. Given the user's feedback, redirection is better for UX.
  if (isAuth) {
    return <Navigate to={role === 'admin' ? "/admin" : "/user"} replace />;
  }

  return <LandingPage />;
}
