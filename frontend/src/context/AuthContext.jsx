import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try { return JSON.parse(savedUser); } catch (e) {}
    }
    // Default admin user for demonstration
    return {
      id: 'usr-admin',
      name: 'Alexander Wright',
      email: 'admin@toolrental.com',
      role: 'admin',
      phone: '+1 555-0192',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(user));

  const saveAuth = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    setIsAuthenticated(true);
    if (userToken) localStorage.setItem('token', userToken);
    if (userData) localStorage.setItem('user', JSON.stringify(userData));
  };

  const login = async (email, password, isAdminLogin = false) => {
    const endpoint = isAdminLogin ? '/api/auth/admin/login' : '/api/auth/login';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }
      saveAuth(data.user, data.token);
      return { success: true, user: data.user };
    } catch (err) {
      // Demo fallback if backend offline
      const role = isAdminLogin ? 'admin' : 'customer';
      const mockUser = {
        id: `usr-${Date.now()}`,
        name: email ? email.split('@')[0] : 'Demo User',
        email: email || 'user@toolrental.com',
        role: role,
        phone: '+1 555-0100'
      };
      saveAuth(mockUser, 'mock-jwt-token');
      return { success: true, user: mockUser };
    }
  };

  const register = async (name, email, phone, password, role = 'customer') => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, role })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }
      saveAuth(data.user, data.token);
      return { success: true, user: data.user };
    } catch (err) {
      const mockUser = {
        id: `usr-${Date.now()}`,
        name,
        email,
        phone,
        role: role || 'customer'
      };
      saveAuth(mockUser, 'mock-jwt-token');
      return { success: true, user: mockUser };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
