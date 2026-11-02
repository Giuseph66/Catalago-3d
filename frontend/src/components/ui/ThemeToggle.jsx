import { FiMonitor, FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../lib/utils';

const MODES = {
  system: { icon: FiMonitor, label: 'Tema automático', next: 'claro' },
  light: { icon: FiSun, label: 'Tema claro', next: 'escuro' },
  dark: { icon: FiMoon, label: 'Tema escuro', next: 'automático' },
};

// Um botão que alterna Automático (segue o aparelho), Claro e Escuro
export function ThemeToggle({ className, withLabel = false }) {
  const { theme, cycle } = useTheme();
  const mode = MODES[theme];
  const Icon = mode.icon;
  const description = `${mode.label}. Tocar muda para ${mode.next}.`;

  return (
    <button type="button" onClick={cycle} aria-label={description} title={description} className={cn('inline-flex items-center gap-3', className)}>
      <Icon size={withLabel ? 15 : 19} aria-hidden="true" />
      {withLabel && mode.label}
    </button>
  );
}
