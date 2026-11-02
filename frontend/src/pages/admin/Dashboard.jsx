import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FaPlus } from 'react-icons/fa';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

const numero = new Intl.NumberFormat('pt-BR');

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    testimonials: 0,
    totalViews: 0
  });
  const [maisVistos, setMaisVistos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [productsRes, categoriesRes, testimonialsRes] = await Promise.all([
        api.get('/products?limit=1000&orderBy=views&orderDir=DESC'),
        api.get('/categories'),
        api.get('/testimonials')
      ]);

      const products = productsRes.data.products || [];
      const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);

      setStats({
        products: productsRes.data.pagination?.total || products.length,
        categories: categoriesRes.data?.length || 0,
        testimonials: testimonialsRes.data?.length || 0,
        totalViews
      });
      setMaisVistos(products.filter((p) => p.views > 0).slice(0, 5));
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    { label: 'Produtos', value: stats.products, link: '/admin/produtos' },
    { label: 'Categorias', value: stats.categories, link: '/admin/categorias' },
    { label: 'Depoimentos', value: stats.testimonials, link: '/admin/depoimentos' },
    { label: 'Visualizações no site', value: stats.totalViews, link: null },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-[3px] border-ink pb-4">
        <div>
          <h1 className="text-5xl leading-[0.9] md:text-6xl">Visão geral</h1>
          <p className="mt-2 font-serif text-lg text-ink/60">O catálogo em números.</p>
        </div>
        <Button as={Link} to="/admin/produtos/novo" leftIcon={<FaPlus size={12} />}>
          Novo produto
        </Button>
      </div>

      {loading ? (
        <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <dl className="mt-2 grid grid-cols-2 lg:grid-cols-4">
          {statItems.map((stat) => {
            const content = (
              <>
                <dd className="font-display text-6xl font-black leading-none text-ink">{numero.format(stat.value)}</dd>
                <dt className="mt-2 text-sm font-medium text-ink/60">{stat.label}</dt>
              </>
            );
            return (
              <div key={stat.label} className="border-b border-ink/10 py-6 pr-4 lg:border-b-0 lg:border-r lg:pl-6 lg:first:pl-0 lg:last:border-r-0">
                {stat.link ? (
                  <Link to={stat.link} className="flex flex-col-reverse hover:[&_dd]:text-cobalt">
                    {content}
                  </Link>
                ) : (
                  <div className="flex flex-col-reverse">{content}</div>
                )}
              </div>
            );
          })}
        </dl>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <h2 className="text-3xl">Mais vistos no site</h2>
          {maisVistos.length === 0 ? (
            <p className="mt-4 font-serif text-lg text-ink/60">
              Ainda não há visitas registradas. Os produtos aparecem aqui conforme forem abertos no site.
            </p>
          ) : (
            <ol className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
              {maisVistos.map((product, index) => (
                <li key={product.id}>
                  <Link
                    to={`/admin/produtos/${product.id}`}
                    className="flex items-center gap-4 py-3 hover:bg-white/60"
                  >
                    <span className="w-6 font-display text-2xl font-black text-ink/30">{index + 1}</span>
                    <span className="flex-1 truncate font-medium">{product.nome}</span>
                    <span className="text-sm tabular-nums text-ink/60">
                      {numero.format(product.views)} {product.views === 1 ? 'visita' : 'visitas'}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="lg:col-span-4 lg:col-start-9">
          <h2 className="text-3xl">Atalhos</h2>
          <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
            {[
              { to: '/admin/fila-producao', label: 'Ver a fila de produção' },
              { to: '/admin/filamentos', label: 'Conferir estoque de filamento' },
              { to: '/admin/categorias', label: 'Organizar categorias' },
              { to: '/admin/depoimentos', label: 'Adicionar depoimento' },
              { to: '/admin/configuracoes', label: 'Ajustar WhatsApp e loja' },
            ].map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="block py-3 font-medium hover:text-cobalt">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
