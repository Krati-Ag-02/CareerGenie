import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const data = await authAPI.me();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email, password) => {
    const data = await authAPI.login({ email, password });
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await authAPI.register({ name, email, password });
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return 'CG';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, getInitials }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}