import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
const TOKEN_CHECK_INTERVAL_MS = 60 * 1000;

const clearStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const decodeTokenPayload = (token) => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (normalizedPayload.length % 4)) % 4);
    const decoded = atob(`${normalizedPayload}${padding}`);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  if (!token) return true;

  const payload = decodeTokenPayload(token);
  if (!payload?.exp) return false;

  return Date.now() >= payload.exp * 1000;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyAuthSession = useCallback((token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    clearStorage();
    setUser(null);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      applyAuthSession(token, userData);

      return { success: true, user: userData };
    } catch (error) {
      const apiError = error.response?.data?.error;
      const validationError = error.response?.data?.errors?.[0]?.msg;
      return {
        success: false,
        error: apiError || validationError || 'Erro ao fazer login',
      };
    }
  };

  const register = async (nome, email, password) => {
    try {
      const response = await api.post('/auth/register', { nome, email, password });
      const { token, user: userData } = response.data;

      applyAuthSession(token, userData);

      return { success: true, user: userData };
    } catch (error) {
      const apiError = error.response?.data?.error;
      const validationError = error.response?.data?.errors?.[0]?.msg;
      return {
        success: false,
        error: apiError || validationError || 'Erro ao cadastrar usuário',
      };
    }
  };

  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser) {
        setLoading(false);
        return;
      }

      if (isTokenExpired(token)) {
        logout();
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/verify');
        const verifiedUser = res.data?.user;

        if (!verifiedUser) {
          logout();
          setLoading(false);
          return;
        }

        applyAuthSession(token, verifiedUser);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, [applyAuthSession, logout]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token && isTokenExpired(token)) {
        logout();
      }
    }, TOKEN_CHECK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
