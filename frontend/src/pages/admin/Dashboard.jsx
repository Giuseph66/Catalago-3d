import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FaBox, FaTags, FaComments, FaEye, FaPlus } from 'react-icons/fa';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    testimonials: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [productsRes, categoriesRes, testimonialsRes] = await Promise.all([
        api.get('/products?limit=1'),
        api.get('/categories'),
        api.get('/testimonials')
      ]);

      const products = productsRes.data.products || [];
      const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);

      setStats({
        products: productsRes.data.pagination?.total || 0,
        categories: categoriesRes.data?.length || 0,
        testimonials: testimonialsRes.data?.length || 0,
        totalViews
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: FaBox,
      label: 'Produtos',
      value: stats.products,
      color: 'var(--primary)',
      bgColor: 'var(--primary-soft)',
      link: '/admin/produtos'
    },
    {
      icon: FaTags,
      label: 'Categorias',
      value: stats.categories,
      color: 'var(--accent)',
      bgColor: 'var(--accent-soft)',
      link: '/admin/categorias'
    },
    {
      icon: FaComments,
      label: 'Depoimentos',
      value: stats.testimonials,
      color: 'var(--warning)',
      bgColor: 'var(--warning-soft)',
      link: '/admin/depoimentos'
    },
    {
      icon: FaEye,
      label: 'Visualizações',
      value: stats.totalViews,
      color: 'var(--info)',
      bgColor: 'var(--info-soft)',
      link: null
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          Dashboard
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-2)' }}>
          Visão geral do seu catálogo
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            const content = (
              <Card className="hover:shadow-card-hover transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: stat.bgColor }}
                    >
                      <Icon size={24} style={{ color: stat.color }} />
                    </div>
                  </div>
                  <div className="mb-1">
                    <span className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            );

            return stat.link ? (
              <Link key={i} to={stat.link} className="block">
                {content}
              </Link>
            ) : (
              <div key={i}>{content}</div>
            );
          })}
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--text)' }}>
            Ações Rápidas
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button
              as={Link}
              to="/admin/produtos/novo"
              leftIcon={<FaPlus />}
            >
              Novo Produto
            </Button>
            <Button
              as={Link}
              to="/admin/categorias"
              variant="secondary"
              leftIcon={<FaPlus />}
            >
              Nova Categoria
            </Button>
            <Button
              as={Link}
              to="/admin/depoimentos"
              variant="outline"
              leftIcon={<FaPlus />}
            >
              Novo Depoimento
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
