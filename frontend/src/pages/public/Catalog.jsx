import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import EditorialProductCard from '../../components/public/EditorialProductCard';
import { useSiteConfig, whatsappUrl } from '../../hooks/useSiteConfig';
import { FiSearch, FiX } from 'react-icons/fi';
import { PRODUCT_STATUS } from '../../lib/constants';
import { cn } from '../../lib/utils';

const STATUS_OPTIONS = [
  { value: '', label: 'Tudo' },
  { value: PRODUCT_STATUS.PRONTA_ENTREGA, label: 'Pronta entrega' },
  { value: PRODUCT_STATUS.SOB_ENCOMENDA, label: 'Sob encomenda' },
];

const SORT_OPTIONS = [
  { value: 'createdAt-DESC', label: 'Novidades' },
  { value: 'peso-ASC', label: 'Menor preço' },
  { value: 'peso-DESC', label: 'Maior preço' },
  { value: 'views-DESC', label: 'Mais vistos' },
];

function pecas(total) {
  return `${total} ${total === 1 ? 'peça' : 'peças'}`;
}

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const config = useSiteConfig();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  // Filtros
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoria') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const [orderBy, setOrderBy] = useState(searchParams.get('orderBy') || 'createdAt');
  const [orderDir, setOrderDir] = useState(searchParams.get('orderDir') || 'DESC');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  useEffect(() => {
    loadCategories();
  }, []);

  // Espera a pessoa parar de digitar antes de buscar
  useEffect(() => {
    const timer = setTimeout(() => {
      const termo = searchInput.trim();
      if (termo !== search) {
        setSearch(termo);
        setPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

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
      setSearchParams(newParams, { replace: true });
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
    setSearchInput('');
    setSearch('');
    setSelectedCategory('');
    setSelectedStatus('');
    setOrderBy('createdAt');
    setOrderDir('DESC');
    setPage(1);
  };

  const goToPage = (next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = selectedCategory || selectedStatus || search;
  const totalProducts = pagination?.total ?? 0;
  const resultsLabel = loading
    ? 'Carregando…'
    : hasActiveFilters
      ? `${pecas(totalProducts)} ${totalProducts === 1 ? 'encontrada' : 'encontradas'}`
      : pecas(totalProducts);
  const sobMedida = whatsappUrl(config, 'Olá! Não achei no catálogo a peça que eu queria. Vocês fazem sob medida? Sou de Sinop-MT.');

  return (
    <div className="bg-paper text-ink">
      <section className="mx-auto max-w-[1440px] px-4 pt-10 sm:px-8 md:pt-14">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b-[3px] border-ink pb-3">
          <h1 className="font-display text-[22vw] font-black uppercase leading-[0.8] sm:text-[9rem] lg:text-[11rem]">
            Catálogo
          </h1>
          <p className="pb-2 font-serif text-lg text-ink/65 md:text-xl" aria-live="polite">
            {resultsLabel}
          </p>
        </div>

        {categories.length > 0 && (
          <nav aria-label="Categorias" className="-mx-4 overflow-x-auto border-b border-ink/15 px-4 sm:-mx-8 sm:px-8">
            <ul className="flex gap-7 whitespace-nowrap py-4">
              {[{ id: 'todas', slug: '', nome: 'Todas' }, ...categories].map((category) => {
                const ativa = selectedCategory === category.slug;
                return (
                  <li key={category.id}>
                    <button
                      type="button"
                      onClick={() => handleFilterChange('category', category.slug)}
                      aria-pressed={ativa}
                      className={cn(
                        'font-display text-2xl font-extrabold transition-colors md:text-3xl',
                        ativa
                          ? 'text-cobalt underline decoration-[3px] underline-offset-[10px]'
                          : 'text-ink/40 hover:text-ink'
                      )}
                    >
                      {category.nome}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        <div className="grid gap-5 py-6 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center md:gap-8">
          <label className="flex items-center gap-3 border-b-2 border-ink pb-2 focus-within:border-cobalt">
            <FiSearch size={20} className="shrink-0 text-ink/50" />
            <span className="sr-only">Buscar no catálogo</span>
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Procurar uma peça"
              className="min-w-0 flex-1 bg-transparent font-serif text-xl placeholder:italic placeholder:text-ink/40 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                aria-label="Limpar busca"
                className="rounded-full p-1 text-ink/50 hover:bg-ink/5 hover:text-ink"
              >
                <FiX size={18} />
              </button>
            )}
          </label>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Disponibilidade">
            {STATUS_OPTIONS.map((option) => {
              const ativo = selectedStatus === option.value;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleFilterChange('status', option.value)}
                  aria-pressed={ativo}
                  className={cn(
                    'h-10 rounded-full px-4 font-serif text-base transition-colors',
                    ativo ? 'bg-ink text-paper' : 'border border-ink/20 text-ink/75 hover:border-ink/50'
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <label className="flex items-center gap-2 font-serif text-base">
            <span className="italic text-ink/55">Ordenar por</span>
            <select
              value={`${orderBy}-${orderDir}`}
              onChange={(e) => {
                const [by, dir] = e.target.value.split('-');
                handleFilterChange('orderBy', by);
                handleFilterChange('orderDir', dir);
              }}
              className="cursor-pointer border-b border-ink/30 bg-transparent py-1 pr-1 text-ink focus:border-cobalt focus:outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-20 pt-4 sm:px-8 md:pb-28">
        {loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4" aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i}>
                <div className="aspect-square animate-pulse bg-ink/[0.07]" />
                <div className="mt-3 h-6 w-3/4 animate-pulse bg-ink/[0.07]" />
                <div className="mt-2 h-4 w-1/3 animate-pulse bg-ink/[0.07]" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="max-w-xl py-10">
            <p className="font-display text-4xl font-extrabold leading-none md:text-5xl">
              {search ? `Nada encontrado para “${search}”.` : 'Nenhuma peça nesta seção ainda.'}
            </p>
            <p className="mt-4 font-serif text-lg leading-relaxed text-ink/70">
              {hasActiveFilters
                ? 'Tente outra palavra ou veja o catálogo inteiro. Se a peça não existir, a gente pode fazer sob medida.'
                : 'As peças aparecem aqui assim que forem cadastradas.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 font-display text-2xl font-extrabold text-cobalt underline decoration-2 underline-offset-[6px] hover:text-ink"
              >
                Ver o catálogo inteiro
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4 lg:gap-y-14">
              {products.map((product) => (
                <EditorialProductCard key={product.id} product={product} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <nav
                aria-label="Paginação"
                className="mt-16 flex items-center justify-between border-t border-ink/15 pt-5 font-display text-2xl font-extrabold"
              >
                <button
                  type="button"
                  onClick={() => goToPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="hover:text-cobalt disabled:text-ink/25"
                >
                  Anterior
                </button>
                <span className="font-serif text-base font-normal text-ink/65">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => goToPage(Math.min(pagination.totalPages, page + 1))}
                  disabled={page === pagination.totalPages}
                  className="hover:text-cobalt disabled:text-ink/25"
                >
                  Próxima
                </button>
              </nav>
            )}
          </>
        )}
      </section>

      <section className="bg-cobalt text-paper">
        <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-16 sm:px-8 md:grid-cols-12 md:items-end md:py-20">
          <h2 className="font-display text-5xl font-black leading-[0.88] text-paper md:col-span-6 md:text-7xl">
            Não achou a peça? A gente faz sob medida.
          </h2>
          <div className="md:col-span-5 md:col-start-8">
            <p className="font-serif text-xl leading-relaxed text-paper/85">
              Mande uma foto, um desenho ou a medida que você precisa. Respondemos com orçamento e prazo.
            </p>
            <a
              href={sobMedida || '/'}
              target={sobMedida ? '_blank' : undefined}
              rel={sobMedida ? 'noopener noreferrer' : undefined}
              className="mt-6 inline-flex h-14 items-center rounded-full bg-paper px-8 font-display text-xl font-extrabold text-cobalt transition-colors hover:bg-white"
            >
              Pedir orçamento pelo WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
