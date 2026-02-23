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
  FaUsers
} from 'react-icons/fa';
import { Drawer } from '../ui/Drawer';
import { cn } from '../../lib/utils';

const menuItems = [
  { path: '/admin', icon: FaHome, label: 'Dashboard' },
  { path: '/admin/produtos', icon: FaBox, label: 'Produtos' },
  { path: '/admin/categorias', icon: FaTags, label: 'Categorias' },
  { path: '/admin/fila-producao', icon: FaLayerGroup, label: 'Fila de Produção' },
  { path: '/admin/filamentos', icon: FaTshirt, label: 'Filamentos' },
  { path: '/admin/usuarios', icon: FaUsers, label: 'Usuários' },
  { path: '/admin/depoimentos', icon: FaComments, label: 'Depoimentos' },
  { path: '/admin/configuracoes', icon: FaCog, label: 'Configurações' },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-2xl overflow-hidden">
      <div className="p-6 text-center">
        <Link to="/admin" className="inline-flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <FaLayerGroup className="text-white" />
          </div>
          <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 tracking-tight">
            Neurelix 3D
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-2 p-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
            (item.path !== '/admin' && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group',
                isActive
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'text-gray-500 hover:bg-primary-50 hover:text-primary-600'
              )}
            >
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                isActive ? "bg-white/20" : "bg-gray-50 group-hover:bg-white"
              )}>
                <Icon className={isActive ? "text-white" : "text-gray-400 group-hover:text-primary-500"} />
              </div>
              <span className="font-semibold tracking-tight">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-3 w-full px-4 py-3 rounded-2xl text-gray-500 hover:bg-danger-soft hover:text-danger transition-all duration-300 font-semibold group"
        >
          <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
            <FaSignOutAlt />
          </div>
          <span>Sair da Conta</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Topbar for Mobile only */}
      <header className="lg:hidden bg-white/80 backdrop-blur-md border-b sticky top-0 z-40 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <FaBars className="text-gray-600" />
          </button>
          <span className="font-black text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 tracking-tight">
            Neurelix 3D
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl bg-danger-soft text-danger"
          title="Sair"
        >
          <FaSignOutAlt />
        </button>
      </header>

      <div className="flex">
        {/* Sidebar Desktop - Fixed & h-screen */}
        <aside className="hidden lg:block w-72 h-screen sticky top-0 z-50 overflow-hidden">
          <SidebarContent />
        </aside>

        {/* Sidebar Mobile */}
        <Drawer
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          title="Navegação"
          side="left"
        >
          <div className="h-full bg-white pt-2">
            <SidebarContent />
          </div>
        </Drawer>

        {/* Main Content */}
        <main className="flex-1 min-h-screen overflow-x-hidden">
          <div className="px-4 sm:px-8 lg:px-12 py-8 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
