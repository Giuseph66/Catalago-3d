import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  FaHome,
  FaBox,
  FaTags,
  FaComments,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaLayerGroup,
  FaTshirt,
  FaUsers,
  FaExternalLinkAlt,
  FaGithub
} from 'react-icons/fa';
import { Drawer } from '../ui/Drawer';
import { cn } from '../../lib/utils';
import { ThemeToggle } from '../ui/ThemeToggle';

const menuItems = [
  { path: '/admin', icon: FaHome, label: 'Visão geral' },
  { path: '/admin/produtos', icon: FaBox, label: 'Produtos' },
  { path: '/admin/importar', icon: FaGithub, label: 'Importar do GitHub' },
  { path: '/admin/categorias', icon: FaTags, label: 'Categorias' },
  { path: '/admin/fila-producao', icon: FaLayerGroup, label: 'Fila de produção' },
  { path: '/admin/filamentos', icon: FaTshirt, label: 'Filamentos' },
  { path: '/admin/usuarios', icon: FaUsers, label: 'Usuários' },
  { path: '/admin/depoimentos', icon: FaComments, label: 'Depoimentos' },
  { path: '/admin/configuracoes', icon: FaCog, label: 'Configurações' },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-night text-on-night">
      <div className="px-6 pb-6 pt-7">
        <Link to="/admin" className="block font-display text-[32px] font-black uppercase leading-none tracking-tight">
          Neurelix 3D
        </Link>
        <p className="mt-1 font-serif text-base italic text-on-night/50">Painel de gestão</p>
      </div>

      <nav aria-label="Painel" className="flex-1 overflow-y-auto px-3">
        <ul className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path !== '/admin' && location.pathname.startsWith(item.path));

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors',
                    isActive ? 'bg-on-night/10 text-on-night' : 'text-on-night/60 hover:bg-on-night/5 hover:text-on-night'
                  )}
                >
                  {isActive && <span className="absolute -left-3 top-2 bottom-2 w-1 rounded-r bg-filament" />}
                  <Icon size={15} className={isActive ? 'text-filament' : 'text-on-night/40'} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-1 border-t border-on-night/10 p-3">
        <ThemeToggle
          withLabel
          className="w-full rounded-lg px-3 py-2.5 text-left text-[15px] font-medium text-on-night/60 hover:bg-on-night/5 hover:text-on-night"
        />
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium text-on-night/60 hover:bg-on-night/5 hover:text-on-night"
        >
          <FaExternalLinkAlt size={13} className="text-on-night/40" />
          Ver o site
        </a>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[15px] font-medium text-on-night/60 hover:bg-on-night/5 hover:text-on-night"
        >
          <FaSignOutAlt size={14} className="text-on-night/40" />
          Sair
          {user?.email && <span className="ml-auto truncate text-xs text-on-night/35">{user.email}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-night px-4 text-on-night lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="-ml-2 rounded-lg p-2 hover:bg-on-night/10"
          aria-label="Abrir menu"
        >
          <FaBars />
        </button>
        <span className="font-display text-2xl font-black uppercase tracking-tight">Neurelix 3D</span>
        <button
          type="button"
          onClick={handleLogout}
          className="-mr-2 rounded-lg p-2 hover:bg-on-night/10"
          aria-label="Sair"
        >
          <FaSignOutAlt />
        </button>
      </header>

      <div className="flex">
        <aside className="sticky top-0 z-50 hidden h-screen w-64 shrink-0 lg:block">
          <SidebarContent />
        </aside>

        <Drawer
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          side="left"
          className="max-w-[17rem] bg-night"
        >
          <div className="h-full">
            <SidebarContent />
          </div>
        </Drawer>

        <main className="min-h-screen min-w-0 flex-1">
          <div className="admin-page mx-auto max-w-[1400px] px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
