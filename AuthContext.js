import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,  setUser]  = useState(() => { try { return JSON.parse(localStorage.getItem('q_user')); } catch { return null; } });
  const [token, setToken] = useState(() => localStorage.getItem('q_token') || null);

  const loginUser = (userData, tok) => {
    setUser(userData); setToken(tok);
    localStorage.setItem('q_user',  JSON.stringify(userData));
    localStorage.setItem('q_token', tok);
  };

  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem('q_user');
    localStorage.removeItem('q_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loginUser, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
