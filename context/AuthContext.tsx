import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../types';
import { MOCK_ATUMWA, MOCK_CLIENT, MOCK_ADMIN } from '../constants';

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  verifyUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole) => {
    switch (role) {
      case 'client':
        setUser(MOCK_CLIENT);
        break;
      case 'atumwa':
        setUser(MOCK_ATUMWA);
        break;
      case 'admin':
        setUser(MOCK_ADMIN);
        break;
    }
  };

  const logout = () => {
    setUser(null);
  };

  const verifyUser = () => {
    if (user) {
        setUser({ ...user, isVerified: true });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, verifyUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};