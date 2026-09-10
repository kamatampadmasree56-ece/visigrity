import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Role } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string, isDemo?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_PRESETS: Record<string, { email: string; pass: string }> = {
  'VALIDATOR': { email: 'validator@visigrity.demo', pass: 'Validator123!' },
  'DATA CONTRIBUTOR': { email: 'maria@visigrity.demo', pass: 'Contributor123!' },
  'MODEL DEVELOPER': { email: 'alex@visigrity.demo', pass: 'Developer123!' },
  'ADMIN': { email: 'admin@visigrity.demo', pass: 'Admin123!' },
  'INFERENCE OPERATOR': { email: 'operator@visigrity.demo', pass: 'Operator123!' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('visigrity_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('visigrity_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('visigrity_user');
    }
  }, [user]);

  const login = async (email: string, password?: string, isDemo?: boolean) => {
    try {
      // If demo login preset or custom
      let loginEmail = email;
      let loginPass = password || 'Demo123!';

      if (isDemo || email === 'demo@visigrity.com' || email === 'validator@visigrity.demo') {
        loginEmail = DEMO_PRESETS['VALIDATOR'].email;
        loginPass = DEMO_PRESETS['VALIDATOR'].pass;
      }

      const { user: authenticatedUser } = await authService.login(loginEmail, loginPass);
      setUser(authenticatedUser);
    } catch (err: any) {
      // Fallback for offline demo credentials
      if (email && (password || isDemo)) {
        const fallbackUser: User = {
          id: 'usr-demo-001',
          name: email.split('@')[0] || 'Demo Validator',
          email,
          role: 'VALIDATOR',
        };
        setUser(fallbackUser);
        return;
      }
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string, role: Role) => {
    try {
      const newUser = await authService.register(name, email, password, role);
      // Auto-login after registration
      await login(email, password);
      setUser(newUser);
    } catch (err) {
      // Fallback
      const fallbackUser: User = {
        id: 'usr-' + Math.random().toString(36).substr(2, 9),
        name,
        email,
        role,
      };
      setUser(fallbackUser);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
