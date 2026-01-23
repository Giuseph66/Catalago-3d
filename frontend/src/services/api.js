import axios from 'axios';

// Função para garantir que a URL da API use HTTPS quando o site está em HTTPS
function getApiUrl() {
  let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  
  // Se estiver em produção (HTTPS) e a API URL for HTTP, converter para HTTPS
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    // Se a URL da API começar com http://, converter para https://
    if (apiUrl.startsWith('http://') && !apiUrl.includes('localhost')) {
      apiUrl = apiUrl.replace('http://', 'https://');
      console.warn('⚠️ API: URL convertida de HTTP para HTTPS:', apiUrl);
    }
  }
  
  return apiUrl;
}

const API_URL = getApiUrl();

console.log('🔧 API: URL configurada:', API_URL);
console.log('🔧 API: Protocolo do site:', typeof window !== 'undefined' ? window.location.protocol : 'N/A');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('📡 API: Requisição com token:', config.url);
    } else {
      console.log('📡 API: Requisição sem token:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('❌ API: Erro no interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => {
    console.log('✅ API: Resposta recebida:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API: Erro na resposta:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      code: error.code,
      data: error.response?.data
    });
    
    // Tratamento específico para erro de conteúdo misto (HTTP em site HTTPS)
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      const apiUrl = error.config?.baseURL || API_URL;
      if (apiUrl.startsWith('http://') && window.location.protocol === 'https:') {
        console.error('❌ API: Erro de conteúdo misto detectado!');
        console.error('❌ API: O site está em HTTPS mas a API está configurada como HTTP');
        console.error('❌ API: Configure VITE_API_URL no Vercel com HTTPS:', apiUrl.replace('http://', 'https://'));
      }
    }
    
    // Só redireciona se for 401 em rotas autenticadas (não no login)
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      console.log('🔒 API: Token inválido, limpando localStorage e redirecionando...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Só redireciona se não estiver já na página de login
      if (window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

