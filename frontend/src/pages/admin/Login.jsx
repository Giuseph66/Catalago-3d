import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import api from '../../services/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Mostrar URL da API para debug (usando a mesma lógica do api.js)
    let url = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    
    // Se estiver em HTTPS e a URL for HTTP (exceto localhost), converter
    if (window.location.protocol === 'https:' && url.startsWith('http://') && !url.includes('localhost')) {
      url = url.replace('http://', 'https://');
    }
    
    setApiUrl(url);
    console.log('🔍 Login: URL da API configurada:', url);
    console.log('🔍 Login: Protocolo do site:', window.location.protocol);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/admin', { replace: true });
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--primary)' }}>
            Admin - Catálogo 3D
          </h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div 
                className="px-4 py-3 rounded-input text-sm"
                style={{ 
                  backgroundColor: 'var(--danger-soft)', 
                  color: 'var(--danger)',
                  border: '1px solid var(--danger)'
                }}
                role="alert"
              >
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              className="w-full"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                API URL: {apiUrl}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
