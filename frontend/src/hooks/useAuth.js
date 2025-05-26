import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const useAuth = () => {
  const [authState, setAuthState] = useState({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuthState({
        user: response.data.user,
        token,
        isAuthenticated: true,
      });
    } catch (error) {
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setAuthState({
        user,
        token,
        isAuthenticated: true,
      });
      navigate('/');
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setAuthState({
        user,
        token,
        isAuthenticated: true,
      });
      navigate('/');
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    navigate('/login');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.patch('/api/auth/me', profileData, {
        headers: { Authorization: `Bearer ${authState.token}` }
      });
      setAuthState({
        ...authState,
        user: response.data.user,
      });
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.post('/api/auth/change-password', {
        currentPassword,
        newPassword,
      }, {
        headers: { Authorization: `Bearer ${authState.token}` }
      });
    } catch (error) {
      throw error;
    }
  };

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };
}; 