import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string) => Promise<boolean>;
  register: (name: string, email: string, grade?: string) => Promise<boolean>;
  logout: () => void;
  toggleRole: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  loading: boolean;
}

const DEFAULT_USER: User = {
  id: 'user-student-1',
  name: 'Doniyor Ahmedov',
  email: 'axmedovdoniyor931@gmail.com',
  role: 'student',
  grade: '10-sinf',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  xp: 2840,
  streak: 5,
  createdAt: '2026-09-01T08:00:00Z',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(DEFAULT_USER);
  const [token, setToken] = useState<string | null>('user:user-student-1');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial fetch from server
    fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token || 'user:user-student-1'}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(err => {
        console.warn('Could not fetch server auth state, using defaults', err);
      });
  }, []);

  const login = async (email: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.user && data.token) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('nexora_token', data.token);
        return true;
      }
    } catch (err) {
      console.error('Login error', err);
    } finally {
      setLoading(false);
    }
    return false;
  };

  const register = async (name: string, email: string, grade: string = '10-sinf') => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, grade }),
      });
      const data = await res.json();
      if (data.user && data.token) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('nexora_token', data.token);
        return true;
      }
    } catch (err) {
      console.error('Register error', err);
    } finally {
      setLoading(false);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('nexora_token');
  };

  // Instant role switch between Student & Admin to test and verify RBAC
  const toggleRole = () => {
    if (!user) return;
    const newRole: 'student' | 'admin' = user.role === 'admin' ? 'student' : 'admin';
    const updated: User = {
      ...user,
      role: newRole,
      grade: newRole === 'admin' ? 'Administrator' : '10-sinf',
    };
    setUser(updated);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    try {
      await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error('Failed to update profile on server', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        toggleRole,
        updateProfile,
        loading,
      }}
    >
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
