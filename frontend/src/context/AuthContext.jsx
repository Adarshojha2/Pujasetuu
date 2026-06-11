import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Set API base URL. Using relative or port 5000 based on development configuration
  const API_URL = 'https://backend-six-chi-zyle1aqkkw.vercel.app/api';

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/auth/profile`);
      setUser(res.data);
    } catch (err) {
      console.error('Error fetching user profile:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      setToken(res.data.token);
      setUser(res.data);
      return { success: true, user: res.data };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Invalid credentials' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, userData);
      setToken(res.data.token);
      setUser(res.data);
      return { success: true, user: res.data };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
  };

  const addAddress = async (addressData) => {
    try {
      const res = await axios.post(`${API_URL}/auth/addresses`, addressData);
      setUser(prev => prev ? { ...prev, savedAddresses: res.data } : null);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to add address' };
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      const res = await axios.delete(`${API_URL}/auth/addresses/${addressId}`);
      setUser(prev => prev ? { ...prev, savedAddresses: res.data } : null);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to delete address' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, addAddress, deleteAddress, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};
