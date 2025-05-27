import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';

// Initialize auth state from localStorage
const getInitialState = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return {
    user: user ? JSON.parse(user) : null,
    token,
    isAuthenticated: !!token
  };
};

export const useAuth = () => {
  const [authState, setAuthState] = useState(getInitialState);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Initial token check:', token ? 'Token exists' : 'No token');
    if (token) {
      fetchUser(token);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      console.log('Fetching user with token:', token.substring(0, 10) + '...');
      const response = await axios.get('/auth/me');
      console.log('User fetch successful:', response.data);
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setAuthState({
        user: response.data.user,
        token,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Error fetching user:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        const errorMessage = error.response.data.error;
        console.log('Authentication error:', errorMessage);
        
        if (errorMessage === 'Invalid authentication token' || 
            errorMessage === 'No authentication token provided') {
          console.log('Logging out due to invalid token');
          logout();
        } else {
          console.log('Keeping token but marking as not authenticated');
          setAuthState({
            user: null,
            token,
            isAuthenticated: false,
          });
        }
      } else {
        console.log('Non-auth error, keeping token');
        setAuthState({
          user: null,
          token,
          isAuthenticated: false,
        });
      }
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', {
        email,
        password,
      });
      const { token, user } = response.data;
      console.log('Login successful, storing token:', token.substring(0, 10) + '...');
      
      // Store both token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setAuthState({
        user,
        token,
        isAuthenticated: true,
      });
      navigate('/');
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
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
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    navigate('/login');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.patch('/auth/me', profileData);
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
      await axios.post('/auth/change-password', {
        currentPassword,
        newPassword,
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