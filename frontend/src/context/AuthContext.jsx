import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('cbserp_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser({
          ...res.data.user,
          userType: res.data.userType
        });
      } else {
        logout();
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const loginAdmin = async (email, password) => {
    const res = await api.post('/auth/admin/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('cbserp_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const registerAdmin = async (payload) => {
    const res = await api.post('/auth/admin/register', payload);
    if (res.data.success) {
      localStorage.setItem('cbserp_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const loginStudent = async (email, password, institutionName) => {
    const res = await api.post('/auth/student/login', { email, password, institutionName });
    if (res.data.success) {
      localStorage.setItem('cbserp_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const registerStudentRequest = async (payload) => {
    const res = await api.post('/auth/student/register-request', payload);
    return res.data;
  };

  const updateAdminProfile = async (payload) => {
    const res = await api.put('/auth/admin/profile', payload);
    if (res.data.success) {
      setUser(prev => ({ ...prev, ...res.data.user }));
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('cbserp_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        loginAdmin,
        registerAdmin,
        loginStudent,
        registerStudentRequest,
        updateAdminProfile,
        logout,
        fetchCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
