import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use authentication context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Authentication Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Configure axios with token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      fetchUserProfile();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false); // ✅ Only set loading false here if no token
    }
  }, [token]);

  // Check if token is expired
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          logout();
          message.error('Your session has expired. Please login again.');
        }
      } catch (error) {
        logout();
      }
    }
  }, [token]);

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/users/me');
      setUser(response.data.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
    } finally {
      setLoading(false); // ✅ Done after fetch (success or fail)
    }
  };

  // Register a new user
  const register = async (userData) => {
    try {
      const response = await axios.post('/api/users/register', userData);
      setToken(response.data.data.token);
      setUser(response.data.data.user);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Registration failed');
    }
  };

  // Login a user
  const login = async (credentials) => {
    try {
      const response = await axios.post('/api/users/login', credentials);
      setToken(response.data.data.token);
      setUser(response.data.data.user);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Login failed');
    }
  };

  // Logout a user
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await axios.patch('/api/users/me', userData);
      setUser(response.data.data);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Profile update failed');
    }
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
