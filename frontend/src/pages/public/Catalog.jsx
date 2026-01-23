import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import ProductCard from '../../components/public/ProductCard';
import { ProductGridSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Drawer } from '../../components/ui/Drawer';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { FiFilter, FiSearch, FiX } from 'react-icons/fi';
import { PRODUCT_STATUS } from '../../lib/constants';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filtros
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoria') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const [orderBy, setOrderBy] = useState(searchParams.get('orderBy') || 'createdAt');
  const [orderDir, setOrderDir] = useState(searchParams.get('orderDir') || 'DESC');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [search, selectedCategory, selectedStatus, orderBy, orderDir, page]);

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('categoria', selectedCategory);
      if (selectedStatus) params.append('status', selectedStatus);
      params.append('orderBy', orderBy);
      params.append('orderDir', orderDir);
      params.append('page', page.toString());
      params.append('limit', '12');

      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data.products || []);
      setPagination(res.data.pagination);

      // Atualizar URL
      const newParams = new URLSearchParams();
      if (search) newParams.set('search', search);
      if (selectedCategory) newParams.set('categoria', selectedCategory);
      if (selectedStatus) newParams.set('status', selectedStatus);
      if (orderBy !== 'createdAt') newParams.set('orderBy', orderBy);
      if (orderDir !== 'DESC') newParams.set('orderDir', orderDir);
      if (page > 1) newParams.set('page', page.toString());
      setSearchParams(newParams);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setPage(1);
    if (key === 'category') setSelectedCategory(value);
    if (key === 'status') setSelectedStatus(value);
    if (key === 'orderBy') setOrderBy(value);
    if (key === 'orderDir') setOrderDir(value);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedStatus('');
    setOrderBy('createdAt');
    setOrderDir('DESC');
    setPage(1);
    setFiltersOpen(false);
  };

  const hasActiveFilters = selectedCategory || selectedStatus || search;
  const totalProducts = pagination?.total ?? 0;
  const resultsLabel = loading
    ? 'Carregando produtos...'
    : `${totalProducts} ${totalProducts === 1 ? 'produto' : 'produtos'} ${
        hasActiveFilters
          ? (totalProducts === 1 ? 'encontrado' : 'encontrados')
          : (totalProducts === 1 ? 'disponível' : 'disponíveis')
      }`;
  const FiltersContent = ({ onApply } = {}) => (
    <div className="p-6 space-y-6">
      <Select
        label="Categoria"
        value={selectedCategory}
        onChange={(e) => handleFilterChange('category', e.target.value)}
      >
        <option value="">Todas as categorias</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.slug}>
            {cat.nome}
          </option>
        ))}
      </Select>

      <Select
        label="Status"
        value={selectedStatus}
        onChange={(e) => handleFilterChange('status', e.target.value)}
      >
        <option value="">Todos os status</option>
        <option value={PRODUCT_STATUS.PRONTA_ENTREGA}>Pronta Entrega</option>
        <option value={PRODUCT_STATUS.SOB_ENCOMENDA}>Sob Encomenda</option>
      </Select>

      <div className="grid gap-3">
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="w-full"
          >
            Limpar filtros
          </Button>
        )}
        {onApply && (
          <Button onClick={onApply} className="w-full">
            Aplicar filtros
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <section className="border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-4 md:py-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text)' }}>
                  Produtos
                </h1>
                <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
                  {resultsLabel}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:grid md:grid-cols-[1.2fr_220px_220px_220px]">
              <div className="flex gap-2 md:block">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} size={18} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Buscar produtos..."
                    className="input-base pl-10"
                    aria-label="Buscar produtos"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setFiltersOpen(true)}
                  leftIcon={<FiFilter />}
                  size="sm"
                  className="md:hidden"
                >
                  Filtros
                </Button>
              </div>
              <Select
                value={selectedCategory}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="hidden md:block"
                aria-label="Categoria"
              >
                <option value="">Todas as categorias</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.nome}
                  </option>
                ))}
              </Select>
              <Select
                value={selectedStatus}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="hidden md:block"
                aria-label="Status"
              >
                <option value="">Todos os status</option>
                <option value={PRODUCT_STATUS.PRONTA_ENTREGA}>Pronta Entrega</option>
                <option value={PRODUCT_STATUS.SOB_ENCOMENDA}>Sob Encomenda</option>
              </Select>
              <Select
                value={`${orderBy}-${orderDir}`}
                onChange={(e) => {
                  const [by, dir] = e.target.value.split('-');
                  handleFilterChange('orderBy', by);
                  handleFilterChange('orderDir', dir);
                }}
                className="w-full"
                aria-label="Ordenar catálogo"
              >
                <option value="createdAt-DESC">Novidades</option>
                <option value="peso-ASC">Menor preço</option>
                <option value="peso-DESC">Maior preço</option>
                <option value="views-DESC">Mais vistos</option>
              </Select>
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2">
                {search && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm" style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}>
                    Busca: {search}
                    <button onClick={() => setSearch('')}>
                      <FiX size={16} />
                    </button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm" style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}>
                    {categories.find(c => c.slug === selectedCategory)?.nome}
                    <button onClick={() => setSelectedCategory('')}>
                      <FiX size={16} />
                    </button>
                  </span>
                )}
                {selectedStatus && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm" style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}>
                    {selectedStatus === PRODUCT_STATUS.PRONTA_ENTREGA ? 'Pronta Entrega' : 'Sob Encomenda'}
                    <button onClick={() => setSelectedStatus('')}>
                      <FiX size={16} />
                    </button>
                  </span>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Grid de produtos */}
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : products.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="Nenhum produto encontrado"
              description={hasActiveFilters ? "Tente ajustar os filtros ou limpar a busca." : "Não há produtos disponíveis no momento."}
              action={
                hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline">
                    Limpar filtros
                  </Button>
                )
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} variant="catalog" />
                ))}
              </div>

              {/* Paginação */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm" style={{ color: 'var(--text-2)' }}>
                    Página <strong>{pagination.page}</strong> de <strong>{pagination.totalPages}</strong>
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Drawer de Filtros Mobile */}
      <Drawer
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filtros"
        variant="modal"
      >
        <FiltersContent onApply={() => setFiltersOpen(false)} />
      </Drawer>
    </div>
  );
}
