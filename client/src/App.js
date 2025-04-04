import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Layout } from 'antd';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CalendarPage from './pages/CalendarPage';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/Navbar';
import RemindersPage from './pages/RemindersPage';
import SettingsPage from './pages/SettingsPage';

const { Content } = Layout;

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      <Content>
        {children}
      </Content>
    </Layout>
  );
};

// Public route component (redirects to calendar if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/calendar" />;
  }
  
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route 
      path="/login" 
      element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } 
    />
    <Route 
      path="/register" 
      element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      } 
    />
    <Route 
      path="/calendar" 
      element={
        <ProtectedRoute>
          <CalendarPage />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/profile" 
      element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/reminders" 
      element={
        <ProtectedRoute>
          <RemindersPage />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/settings" 
      element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      } 
    />
    <Route path="/" element={<Navigate to="/calendar" />} />
  </Routes>
);

const App = () => {
  return (
    <ConfigProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;