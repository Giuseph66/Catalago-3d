import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import WhatsAppButton from './components/public/WhatsAppButton';
import Home from './pages/public/Home';
import Catalog from './pages/public/Catalog';
import ProductDetail from './pages/public/ProductDetail';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminProductEdit from './pages/admin/ProductEdit';
import AdminCategories from './pages/admin/Categories';
import AdminTestimonials from './pages/admin/Testimonials';
import AdminSettings from './pages/admin/Settings';
import AdminProductionQueue from './pages/admin/ProductionQueue';
import AdminFilaments from './pages/admin/Filaments';
import AdminUsers from './pages/admin/Users';
import AdminImportGithub from './pages/admin/ImportGithub';
import { Toaster } from 'react-hot-toast';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!user) {
    console.log('🔒 PrivateRoute: Não autenticado, redirecionando para login');
    return <Navigate to="/admin/login" replace />;
  }

  console.log('✅ PrivateRoute: Autenticado, permitindo acesso');
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="catalogo" element={<Catalog />} />
            <Route path="produto/:slug" element={<ProductDetail />} />
          </Route>

          {/* Rotas admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/*"
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="produtos" element={<AdminProducts />} />
            <Route path="produtos/novo" element={<AdminProductEdit />} />
            <Route path="produtos/:id" element={<AdminProductEdit />} />
            <Route path="importar" element={<AdminImportGithub />} />
            <Route path="categorias" element={<AdminCategories />} />
            <Route path="fila-producao" element={<AdminProductionQueue />} />
            <Route path="filamentos" element={<AdminFilaments />} />
            <Route path="usuarios" element={<AdminUsers />} />
            <Route path="depoimentos" element={<AdminTestimonials />} />
            <Route path="configuracoes" element={<AdminSettings />} />
          </Route>
        </Routes>
        <WhatsAppButton />
        <Toaster position="bottom-center" toastOptions={{ style: { background: '#16181D', color: '#ECEEF1' } }} />
      </Router>
    </AuthProvider>
  );
}

export default App;
