import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../services/api';
import ProductViewer from '../../components/public/ProductViewer';
import TestimonialCard from '../../components/public/TestimonialCard';
import { formatPrice, formatWeight } from '../../utils/formatters';
import { generateWhatsAppLink } from '../../utils/whatsapp';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { BADGE_VARIANTS, PRODUCT_STATUS } from '../../lib/constants';
import { FaShoppingCart, FaWhatsapp, FaMapMarkerAlt } from 'react-icons/fa';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProduct();
    loadConfig();
  }, [slug]);

  const loadProduct = async () => {
    try {
      const res = await api.get(`/products/${slug}`);
      setProduct(res.data);
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const res = await api.get('/config');
      setConfig(res.data);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleMercadoLivre = () => {
    if (!product) return;
    const url = product.linkMercadoLivre || config?.linkLojaMercadoLivre || '#';
    if (url && url !== '#') {
      window.open(url, '_blank');
    }
  };

  const handleWhatsApp = () => {
    if (!config?.whatsappNumero || !product) {
      console.warn('WhatsApp: Config ou produto não disponível');
      return;
    }
    
    const url = generateWhatsAppLink(
      product.nome,
      'Sinop-MT',
      product.status,
      config.whatsappNumero,
      product.mensagemWhatsAppTemplate || config.whatsappTemplate
    );
    
    if (url && url !== '#') {
      window.open(url, '_blank');
    } else {
      console.error('WhatsApp: URL inválida gerada');
      alert('Número do WhatsApp não configurado. Configure em Admin → Configurações.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-[500px] w-full" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl text-center">
        <EmptyState
          icon="❌"
          title="Produto não encontrado"
          description="O produto que você está procurando não existe ou foi removido."
        />
      </div>
    );
  }

  const isProntaEntrega = product.status === PRODUCT_STATUS.PRONTA_ENTREGA;
  const hasHistoria = product.historiaTitulo || product.historiaTexto;
  
  const produtoLink = product.linkMercadoLivre?.trim() || '';
  const configLink = config?.linkLojaMercadoLivre?.trim() || '';
  const hasMercadoLivreLink = produtoLink !== '' || configLink !== '';
  const dimensionsLabel = [
    product.altura && `${product.altura} cm (alt)`,
    product.largura && `${product.largura} cm (larg)`,
    product.profundidade && `${product.profundidade} cm (prof)`
  ].filter(Boolean).join(' × ');
  const detailItems = [
    { label: 'Peso', value: product.peso ? formatWeight(product.peso) : null },
    { label: 'Dimensões', value: dimensionsLabel || null },
    { label: 'Material', value: product.material || null },
    { label: 'Cor', value: product.cor || null },
  ].filter(item => item.value);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link
            to="/catalogo"
            className="text-sm font-semibold inline-flex items-center gap-2"
            style={{ color: 'var(--primary)' }}
          >
            ← Voltar ao catálogo
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            {product.destaque && (
              <Badge variant={BADGE_VARIANTS.DESTAQUE}>
                ⭐ Destaque
              </Badge>
            )}
            {isProntaEntrega ? (
              <Badge variant={BADGE_VARIANTS.PRONTA_ENTREGA}>
                ✓ Pronta Entrega
              </Badge>
            ) : (
              <Badge variant={BADGE_VARIANTS.SOB_ENCOMENDA}>
                📦 Sob Encomenda
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 mb-12">
          <div>
            <Card className="border border-gray-100">
              <CardContent className="p-4 md:p-6">
                <ProductViewer media={product.media || []} productName={product.nome} />
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 self-start">
            <Card className="border border-gray-100">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text)' }}>
                    {product.nome}
                  </h1>
                  <p className="text-4xl md:text-5xl font-bold mt-3" style={{ color: 'var(--primary)' }}>
                    {formatPrice(product.preco || product.peso)}
                  </p>
                </div>

                {detailItems.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                      Detalhes rápidos
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {detailItems.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-xl px-3 py-2"
                          style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
                        >
                          <p className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                            {item.label}
                          </p>
                          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {hasMercadoLivreLink && (
                    <Button
                      onClick={handleMercadoLivre}
                      className="w-full"
                      size="lg"
                      leftIcon={<FaShoppingCart />}
                    >
                      Comprar no Mercado Livre
                    </Button>
                  )}
                  <Button
                    onClick={handleWhatsApp}
                    className="w-full"
                    size="lg"
                    leftIcon={<FaWhatsapp />}
                    style={{
                      backgroundColor: 'var(--success)',
                      color: 'white',
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#15803d'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--success)'}
                  >
                    Chamar no WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt style={{ color: 'var(--primary)' }} className="mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>
                      {config?.localizacao || 'Sinop – Mato Grosso'}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                      {config?.politicaLocal || 'Entregas locais sem frete / combine pelo WhatsApp'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>

        {(product.descricaoCurta || product.descricaoCompleta) && (
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: 'var(--text)' }}>
              Sobre o produto
            </h2>
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="space-y-4">
                  {product.descricaoCurta && (
                    <p className="text-lg leading-relaxed" style={{ color: 'var(--text-2)' }}>
                      {product.descricaoCurta}
                    </p>
                  )}
                  {product.descricaoCompleta && (
                    <p className="whitespace-pre-line leading-relaxed" style={{ color: 'var(--text-2)' }}>
                      {product.descricaoCompleta}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {product.tags && product.tags.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: 'var(--text)' }}>
              Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-sm"
                  style={{ 
                    backgroundColor: 'var(--bg)', 
                    color: 'var(--text-2)',
                    border: '1px solid var(--border)'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* História / Caso de Uso */}
        {hasHistoria && (
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: 'var(--text)' }}>
              {product.historiaTitulo || 'Onde fica incrível?'}
            </h2>
            <Card>
              <CardContent className="p-6 md:p-8">
                <p className="whitespace-pre-line leading-relaxed mb-4" style={{ color: 'var(--text-2)' }}>
                  {product.historiaTexto}
                </p>
                {product.historiaMidia && product.historiaMidia.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                    {product.historiaMidia.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`${product.nome} - uso ${i + 1}`}
                        className="rounded-input object-cover h-48 w-full"
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Depoimentos */}
        {product.testimonials && product.testimonials.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: 'var(--text)' }}>
              Depoimentos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {product.testimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
