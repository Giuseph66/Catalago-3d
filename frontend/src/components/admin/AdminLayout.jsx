import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaHome, 
  FaBox, 
  FaTags, 
  FaComments, 
  FaCog, 
  FaSignOutAlt 
} from 'react-icons/fa';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin', icon: FaHome, label: 'Dashboard' },
    { path: '/admin/produtos', icon: FaBox, label: 'Produtos' },
    { path: '/admin/categorias', icon: FaTags, label: 'Categorias' },
    { path: '/admin/depoimentos', icon: FaComments, label: 'Depoimentos' },
    { path: '/admin/configuracoes', icon: FaCog, label: 'Configurações' },
  ];

  return (
    <div className="admin-layout">
      <nav className="bg-white" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container mx-auto px-4" style={{ maxWidth: '1200px' }}>
          <div className="flex items-center justify-between h-16">
            <Link to="/admin" className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
              Admin - Catálogo 3D
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 transition-colors"
              style={{ color: 'var(--text-2)' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--danger)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-2)'}
            >
              <FaSignOutAlt />
              Sair
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6" style={{ maxWidth: '1200px' }}>
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 bg-white rounded-card shadow-card p-4 h-fit sticky top-6">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                  (item.path !== '/admin' && location.pathname.startsWith(item.path));
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-3 px-4 py-2 rounded-input transition-colors"
                    style={{
                      backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                      color: isActive ? 'white' : 'var(--text-2)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.target.style.backgroundColor = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Icon />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Conteúdo */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}

