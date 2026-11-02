import { useEffect, useState } from 'react';

// 'system' segue o aparelho; 'light'/'dark' é escolha manual (o index.html aplica antes do primeiro paint)
const KEY = 'tema';
const ORDER = ['system', 'light', 'dark'];
const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

function readStored() {
  try {
    const value = localStorage.getItem(KEY);
    return value === 'light' || value === 'dark' ? value : 'system';
  } catch {
    return 'system';
  }
}

export function useTheme() {
  const [theme, setTheme] = useState(readStored);
  const [systemDark, setSystemDark] = useState(() => darkQuery().matches);

  useEffect(() => {
    const query = darkQuery();
    const onChange = (event) => setSystemDark(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    try {
      if (theme === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, theme);
    } catch {
      // sem armazenamento: vale só nesta visita
    }
  }, [theme]);

  const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  // Automático → Claro → Escuro → Automático
  const cycle = () => setTheme((current) => ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]);

  return { theme, resolved, cycle };
}
