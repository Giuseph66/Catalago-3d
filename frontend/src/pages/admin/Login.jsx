import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let url = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    if (window.location.protocol === 'https:' && url.startsWith('http://') && !url.includes('localhost')) {
      url = url.replace('http://', 'https://');
    }

    setApiUrl(url);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return;
      }

      navigate('/admin', { replace: true });
    } catch {
      setError('Erro ao fazer login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg)' }}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center" style={{ color: 'var(--primary)' }}>
            Admin - Catálogo 3D
          </h1>
          <p className="text-sm text-center mt-2" style={{ color: 'var(--text-2)' }}>
            Entrar no painel
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                className="px-4 py-3 rounded-input text-sm"
                style={{
                  backgroundColor: 'var(--danger-soft)',
                  color: 'var(--danger)',
                  border: '1px solid var(--danger)',
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
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />

            <Button type="submit" disabled={loading} loading={loading} className="w-full">
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {import.meta.env.DEV && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">API URL: {apiUrl}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
