import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/login/LoginCard';
import { CallProvider } from './context/CallContext';
import { CallOverlay } from './components/common/CallOverlay';

// New App Structure Pages
import RootPage from './app/page';
import LandingRoute from './app/landing/page';
import LoginRoute from './app/login/page';
import UserRoute from './app/user/page';
import AdminRoute from './app/admin/page';
import DashboardRoute from './app/user/dashboard/page';
import ExploreRoute from './app/user/explore/page';
import MessagesRoute from './app/user/messages/page';
import ProfileRoute from './app/user/profile/page';
import MyProfileRoute from './app/user/my-profile/page';

import AdminDashboardRoute from './app/admin/dashboard/page';
import AdminUsersRoute from './app/admin/users/page';
import AdminAnalyticsRoute from './app/admin/analytics/page';
import AdminSupportRoute from './app/admin/support/page';
import AdminProfileRoute from './app/admin/profile/page';
import { useParams } from 'react-router-dom';

function MessagesRedirect() {
  const { id } = useParams();
  return <Navigate to={`/user/messages/${id}`} replace />;
}

function App() {
  return (
    <ToastProvider>
      <CallProvider>
        <CallOverlay />
        <Router>
          <Routes>
            {/* Redirect Root to Landing */}
            <Route path="/" element={<RootPage />} />
            
            {/* New App Routes */}
            <Route path="/landing" element={<LandingRoute />} />
            <Route path="/login" element={<LoginRoute />} />
            
            {/* Protected Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminRoute />
                </ProtectedRoute>
              } 
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardRoute />} />
              <Route path="users" element={<AdminUsersRoute />} />
              <Route path="analytics" element={<AdminAnalyticsRoute />} />
              <Route path="support" element={<AdminSupportRoute />} />
              <Route path="profile" element={<AdminProfileRoute />} />
            </Route>
            
            {/* Protected User Routes */}
            <Route 
              path="/user" 
              element={
                <ProtectedRoute requiredRole="user">
                  <UserRoute />
                </ProtectedRoute>
              } 
            >
              <Route index element={<Navigate to="/user/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardRoute />} />
              <Route path="explore" element={<ExploreRoute />} />
              <Route path="messages" element={<MessagesRoute />} />
              <Route path="messages/:id" element={<MessagesRoute />} />
              <Route path="my-profile" element={<MyProfileRoute />} />
            </Route>
            
            <Route path="/profile/:id" element={<ProfileRoute />} />

            {/* Alias/Legacy Routes */}
            <Route path="/dashboard" element={<Navigate to="/user/dashboard" replace />} />
            <Route path="/explore" element={<Navigate to="/user/explore" replace />} />
            <Route path="/messages" element={<Navigate to="/user/messages" replace />} />
            <Route path="/messages/:id" element={<MessagesRedirect />} />
            <Route path="/profile/:id" element={<ProfileRoute />} />
            <Route path="/my-profile" element={<Navigate to="/user/my-profile" replace />} />
          </Routes>
        </Router>
      </CallProvider>
    </ToastProvider>
  );
}

export default App;
