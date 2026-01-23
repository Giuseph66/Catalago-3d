import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ProductCard from '../../components/public/ProductCard';
import TestimonialCard from '../../components/public/TestimonialCard';
import CategoryGrid from '../../components/public/CategoryGrid';
import { ProductGridSkeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { FaMapMarkerAlt, FaShoppingCart, FaWhatsapp, FaPalette, FaAward, FaTruck, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import { generateWhatsAppLink } from '../../utils/whatsapp';
import { PRODUCT_STATUS } from '../../lib/constants';

export default function Home() {
  const navigate = useNavigate();
  const [destaques, setDestaques] = useState([]);
  const [categories, setCategories] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState('');
  const [heroCategory, setHeroCategory] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, categoriesRes, testimonialsRes, configRes] = await Promise.all([
          api.get('/products?destaque=true&limit=8'),
          api.get('/categories'),
          api.get('/testimonials?limit=6'),
          api.get('/config')
        ]);

        setDestaques(productsRes.data.products || []);
        setCategories(categoriesRes.data || []);
        setTestimonials(testimonialsRes.data || []);
        setConfig(configRes.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleWhatsApp = () => {
    if (!config?.whatsappNumero) return;
    const url = generateWhatsAppLink(
      'seus produtos',
      'Sinop-MT',
      'PRONTA_ENTREGA',
      config.whatsappNumero,
      config.whatsappTemplate
    );
    if (url && url !== '#') {
      window.open(url, '_blank');
    }
  };

  const handleCatalogSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    const trimmedSearch = heroSearch.trim();
    if (trimmedSearch) params.append('search', trimmedSearch);
    if (heroCategory) params.append('categoria', heroCategory);
    const query = params.toString();
    navigate(query ? `/catalogo?${query}` : '/catalogo');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, var(--primary-soft) 0%, #FFFFFF 55%, var(--accent-soft) 100%)'
          }}
        ></div>
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/70 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/70 blur-3xl"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 py-20 md:py-28">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <div>
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-semibold uppercase tracking-wider"
                style={{ backgroundColor: 'var(--surface)', color: 'var(--primary)', border: '1px solid var(--border)' }}
              >
                Catálogo de impressão 3D
              </div>
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight text-balance"
                style={{ color: 'var(--text)' }}
              >
                Impressão 3D com acabamento profissional
              </h1>
              <p
                className="text-lg md:text-xl mb-8 max-w-xl leading-relaxed text-balance"
                style={{ color: 'var(--text-2)' }}
              >
                Produtos personalizados e prontos para entrega em Sinop – Mato Grosso.
                Soluções sob medida para presentes, decoração e uso profissional.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button as={Link} to="/catalogo" size="lg" className="min-w-[220px]">
                  Explorar catálogo
                  <FaArrowRight className="ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<FaWhatsapp />}
                  onClick={handleWhatsApp}
                  className="min-w-[220px]"
                >
                  Falar no WhatsApp
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap gap-3 text-sm">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
                  style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
                >
                  <FaCheckCircle size={14} style={{ color: 'var(--success)' }} />
                  Entrega local rápida
                </div>
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
                  style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
                >
                  <FaCheckCircle size={14} style={{ color: 'var(--success)' }} />
                  Qualidade garantida
                </div>
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
                  style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
                >
                  <FaCheckCircle size={14} style={{ color: 'var(--success)' }} />
                  Personalização completa
                </div>
              </div>
            </div>
            <div>
              <Card className="border border-white/60">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                        Busca rápida
                      </p>
                      <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                        Encontre no catálogo
                      </h2>
                    </div>
                    <Button as={Link} to="/catalogo" variant="ghost" size="sm">
                      Ver tudo
                    </Button>
                  </div>

                  <form onSubmit={handleCatalogSearch} className="grid gap-3 sm:grid-cols-[1fr_200px_auto] sm:items-end">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} size={18} />
                      <input
                        type="text"
                        value={heroSearch}
                        onChange={(e) => setHeroSearch(e.target.value)}
                        placeholder="Buscar produtos, temas ou ideias..."
                        className="input-base pl-10"
                        aria-label="Buscar no catálogo"
                      />
                    </div>
                    <Select
                      value={heroCategory}
                      onChange={(e) => setHeroCategory(e.target.value)}
                      aria-label="Categoria"
                    >
                      <option value="">Todas as categorias</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.slug}>
                          {category.nome}
                        </option>
                      ))}
                    </Select>
                    <Button type="submit" size="md">
                      Buscar no catálogo
                    </Button>
                  </form>

                  <div className="mt-6">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                      Filtros rápidos
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm">
                      <Link
                        to={`/catalogo?status=${PRODUCT_STATUS.PRONTA_ENTREGA}`}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold"
                        style={{ backgroundColor: 'var(--success-soft)', color: 'var(--success)' }}
                      >
                        Pronta entrega
                      </Link>
                      <Link
                        to={`/catalogo?status=${PRODUCT_STATUS.SOB_ENCOMENDA}`}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold"
                        style={{ backgroundColor: 'var(--info-soft)', color: 'var(--info)' }}
                      >
                        Sob encomenda
                      </Link>
                      <Link
                        to="/catalogo?orderBy=views&orderDir=DESC"
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold"
                        style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}
                      >
                        Mais vistos
                      </Link>
                      <Link
                        to="/catalogo?orderBy=createdAt&orderDir=DESC"
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold"
                        style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
                      >
                        Novidades
                      </Link>
                    </div>
                  </div>

                  {categories.length > 0 && (
                    <div className="mt-6">
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                        Categorias populares
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-sm">
                        {categories.slice(0, 5).map((category) => (
                          <Link
                            key={category.id}
                            to={`/catalogo?categoria=${category.slug}`}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full font-medium"
                            style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}
                          >
                            {category.nome}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Destaques - Mais Profissional */}
      {destaques.length > 0 && (
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>
                  Catálogo
                </p>
                <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight" style={{ color: 'var(--text)' }}>
                  Produtos em Destaque
                </h2>
                <p className="text-lg max-w-2xl" style={{ color: 'var(--text-2)' }}>
                  Seleção especial de produtos de alta qualidade
                </p>
              </div>
              <Button
                as={Link}
                to="/catalogo"
                variant="outline"
                size="lg"
                className="min-w-[220px]"
              >
                Ver Catálogo Completo
                <FaArrowRight className="ml-2" />
              </Button>
            </div>
            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {destaques.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Seção de Valor - Mais Profissional */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight" style={{ color: 'var(--text)' }}>
              Nossos Diferenciais
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-2)' }}>
              Comprometidos com excelência em cada projeto
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <Card className="text-center border border-gray-100 hover:border-primary-100 transition-all duration-300">
              <CardContent className="pt-12 pb-12 px-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" style={{ backgroundColor: 'var(--primary-soft)' }}>
                  <FaPalette size={24} style={{ color: 'var(--primary)' }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text)' }}>Personalização</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                  Cada produto é desenvolvido exclusivamente para atender suas necessidades específicas
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border border-gray-100 hover:border-primary-100 transition-all duration-300">
              <CardContent className="pt-12 pb-12 px-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" style={{ backgroundColor: 'var(--accent-soft)' }}>
                  <FaAward size={24} style={{ color: 'var(--accent)' }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text)' }}>Qualidade</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                  Utilizamos materiais de alta qualidade e processos rigorosos de controle
                </p>
              </CardContent>
            </Card>
            <Card className="text-center border border-gray-100 hover:border-primary-100 transition-all duration-300">
              <CardContent className="pt-12 pb-12 px-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6" style={{ backgroundColor: 'var(--success-soft)' }}>
                  <FaTruck size={24} style={{ color: 'var(--success)' }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text)' }}>Entrega</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                  Retire em Sinop sem custo adicional ou receba em todo Brasil via Mercado Livre
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Localização - Mais Profissional */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <Card className="border border-gray-200">
            <CardContent className="p-10 md:p-12">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-10">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary-soft)' }}>
                    <FaMapMarkerAlt style={{ color: 'var(--primary)' }} size={32} />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight" style={{ color: 'var(--text)' }}>
                    Localização
                  </h2>
                  <p className="text-lg mb-2 font-medium" style={{ color: 'var(--text)' }}>
                    Sinop – Mato Grosso
                  </p>
                  <p className="mb-6 leading-relaxed" style={{ color: 'var(--text-2)' }}>
                    {config?.politicaLocal || 'Entregas locais sem frete / combine pelo WhatsApp'}
                  </p>
                  <p className="mb-8 leading-relaxed" style={{ color: 'var(--text-2)' }}>
                    Compre localmente e retire sem pagar frete, ou combine a entrega pelo WhatsApp. 
                    Também enviamos via Mercado Livre para todo o Brasil com frete calculado automaticamente.
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    leftIcon={<FaWhatsapp />}
                    onClick={handleWhatsApp}
                  >
                    Entrar em Contato
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Categorias - Mais Profissional */}
      {categories.length > 0 && (
        <section className="py-24 md:py-32" style={{ backgroundColor: 'var(--bg)' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight" style={{ color: 'var(--text)' }}>
                Categorias
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-2)' }}>
                Explore nossos produtos organizados por categoria
              </p>
            </div>
            <CategoryGrid categories={categories} />
          </div>
        </section>
      )}

      {/* Depoimentos - Mais Profissional */}
      {testimonials.length > 0 && (
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight" style={{ color: 'var(--text)' }}>
                Depoimentos
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-2)' }}>
                O que nossos clientes têm a dizer sobre nossos produtos
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Como Comprar - Mais Profissional */}
      <section className="py-24 md:py-32" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight" style={{ color: 'var(--text)' }}>
              Formas de Compra
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-2)' }}>
              Escolha a opção que melhor se adequa às suas necessidades
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border border-gray-200 hover:border-primary-200 transition-all duration-300">
              <CardContent className="p-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--accent-soft)' }}>
                    <FaShoppingCart style={{ color: 'var(--accent)' }} size={24} />
                  </div>
                  <h3 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Mercado Livre</h3>
                </div>
                <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--text-2)' }}>
                  Compre diretamente pelo Mercado Livre com segurança e facilidade. 
                  Frete calculado automaticamente para todo o Brasil.
                </p>
                <ul className="space-y-3 text-sm" style={{ color: 'var(--text-2)' }}>
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="mt-0.5 flex-shrink-0" style={{ color: 'var(--success)' }} size={16} />
                    <span>Pagamento seguro e protegido</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="mt-0.5 flex-shrink-0" style={{ color: 'var(--success)' }} size={16} />
                    <span>Frete calculado automaticamente</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="mt-0.5 flex-shrink-0" style={{ color: 'var(--success)' }} size={16} />
                    <span>Entrega para todo o Brasil</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 hover:border-success-200 transition-all duration-300">
              <CardContent className="p-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--success-soft)' }}>
                    <FaWhatsapp style={{ color: 'var(--success)' }} size={24} />
                  </div>
                  <h3 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>WhatsApp</h3>
                </div>
                <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--text-2)' }}>
                  Entre em contato pelo WhatsApp para combinar entrega local sem frete, 
                  personalizações ou esclarecer dúvidas sobre nossos produtos.
                </p>
                <ul className="space-y-3 text-sm" style={{ color: 'var(--text-2)' }}>
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="mt-0.5 flex-shrink-0" style={{ color: 'var(--success)' }} size={16} />
                    <span>Atendimento personalizado e direto</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="mt-0.5 flex-shrink-0" style={{ color: 'var(--success)' }} size={16} />
                    <span>Entrega local sem custo adicional</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FaCheckCircle className="mt-0.5 flex-shrink-0" style={{ color: 'var(--success)' }} size={16} />
                    <span>Personalizações sob medida</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
