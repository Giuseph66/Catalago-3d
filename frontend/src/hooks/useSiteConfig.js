import { useEffect, useState } from 'react';
import api from '../services/api';

// Header, rodapé e páginas pedem a mesma config: uma requisição só
let pending = null;

export function useSiteConfig() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    let alive = true;
    pending ??= api
      .get('/config')
      .then((res) => res.data)
      .catch(() => {
        pending = null;
        return null;
      });
    pending.then((data) => {
      if (alive) setConfig(data);
    });
    return () => {
      alive = false;
    };
  }, []);

  return config;
}

export function whatsappUrl(config, message) {
  const numero = String(config?.whatsappNumero || '').replace(/\D/g, '');
  return numero ? `https://wa.me/${numero}?text=${encodeURIComponent(message)}` : null;
}
