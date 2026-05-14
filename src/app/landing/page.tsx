import React from 'react';
import LandingPage from '../../components/landing-page/LandingPage';
import { Navigate } from 'react-router-dom';
import { getAuthState } from '../../lib/auth';

export default function Landing() {
  const { isAuth, role } = getAuthState();
  
  // If user is already logged in and hits /landing, we can either let them see it
  // or redirect them. Given the user's feedback, redirection is better for UX.
  // Only redirect standard users to their dashboard. 
  // Let admins see the landing page so they can use the AdminToolbar/Editor.
  if (isAuth && role !== 'admin') {
    return <Navigate to="/user" replace />;
  }

  return <LandingPage />;
}
