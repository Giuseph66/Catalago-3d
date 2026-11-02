import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

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
      setError('Não foi possível entrar. Confira sua conexão e tente de novo.');
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-paper lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-cobalt text-paper lg:block">
        <p className="absolute left-10 top-8 font-display text-[40px] font-black uppercase leading-none tracking-tight">
          Neurelix 3D
        </p>
        <img
          src="/editorial/vaso-00.webp"
          alt=""
          className="turntable-still absolute inset-x-0 bottom-0 mx-auto h-[82%] object-contain"
        />
        <p className="absolute bottom-8 left-10 max-w-xs font-serif text-lg italic text-paper/80">
          Produtos, fila de produção e filamentos em um lugar só.
        </p>
      </div>

      <div className="flex items-center justify-center px-4 py-16 sm:px-8">
        <div className="w-full max-w-sm">
          <p className="font-display text-3xl font-black uppercase leading-none tracking-tight lg:hidden">Neurelix 3D</p>
          <h1 className="mt-8 text-5xl leading-[0.9] lg:mt-0">Entrar no painel</h1>
          <p className="mt-3 font-serif text-lg text-ink/65">Use o e-mail e a senha de administrador.</p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            {error && (
              <div
                className="rounded-input border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger"
                role="alert"
              >
                {error}
              </div>
            )}

            <Input
              label="E-mail"
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
              {loading ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>

          <a href="/" className="mt-8 inline-block font-serif text-base text-ink/60 underline decoration-ink/20 underline-offset-4 hover:text-ink">
            Voltar ao site
          </a>

          {import.meta.env.DEV && (
            <p className="mt-6 border-t border-ink/10 pt-4 text-xs text-ink/45">API: {apiUrl}</p>
          )}
        </div>
      </div>
    </div>
  );
}
