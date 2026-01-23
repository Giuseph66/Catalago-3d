import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      console.log('🔍 AuthContext: Carregando usuário do localStorage...');
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      console.log('🔍 AuthContext: Token existe?', !!token);
      console.log('🔍 AuthContext: UserData existe?', !!userData);
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('🔍 AuthContext: Usuário carregado:', parsedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('❌ AuthContext: Erro ao carregar usuário:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        console.log('⚠️ AuthContext: Nenhum usuário encontrado no localStorage');
      }
      
      setLoading(false);
      console.log('✅ AuthContext: Carregamento concluído');
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    console.log('🔐 AuthContext: Iniciando login...', { email });
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('✅ AuthContext: Resposta do servidor:', response.data);
      
      const { token, user } = response.data;
      
      // Salvar no localStorage primeiro
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('💾 AuthContext: Dados salvos no localStorage');
      
      // Atualizar estado
      setUser(user);
      console.log('👤 AuthContext: Estado do usuário atualizado:', user);
      
      return { success: true, user };
    } catch (error) {
      console.error('❌ AuthContext: Erro no login:', error);
      console.error('❌ AuthContext: Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao fazer login'
      };
    }
  };

  const logout = () => {
    console.log('🚪 AuthContext: Fazendo logout...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    console.log('✅ AuthContext: Logout concluído');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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

