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
  FaBars
} from 'react-icons/fa';
import { Drawer } from '../ui/Drawer';
import { cn } from '../../lib/utils';

const menuItems = [
  { path: '/admin', icon: FaHome, label: 'Dashboard' },
  { path: '/admin/produtos', icon: FaBox, label: 'Produtos' },
  { path: '/admin/categorias', icon: FaTags, label: 'Categorias' },
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
    <nav className="space-y-1 p-4">
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
              'flex items-center gap-3 px-4 py-2.5 rounded-input transition-colors',
              isActive
                ? 'bg-primary-500 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            )}
            style={isActive ? {} : { color: 'var(--text-2)' }}
          >
            <Icon />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="admin-layout">
      {/* Topbar */}
      <nav className="bg-white border-b sticky top-0 z-30" style={{ borderColor: 'var(--border)' }}>
        <div className="px-4 sm:px-6 lg:px-8" style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                aria-label="Abrir menu"
              >
                <FaBars style={{ color: 'var(--text-2)' }} />
              </button>
              <Link to="/admin" className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
                Admin - Catálogo 3D
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              style={{ color: 'var(--text-2)' }}
            >
              <FaSignOutAlt />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r sticky top-16" style={{ borderColor: 'var(--border)' }}>
          <SidebarContent />
        </aside>

        {/* Sidebar Mobile */}
        <Drawer isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Menu">
          <SidebarContent />
        </Drawer>

        {/* Main Content */}
        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-6" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

