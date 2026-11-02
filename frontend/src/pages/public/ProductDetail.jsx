import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../services/api';
import ProductViewer from '../../components/public/ProductViewer';
import SectionHeader from '../../components/public/SectionHeader';
import { useSiteConfig } from '../../hooks/useSiteConfig';
import { formatPrice, formatWeight, normalizeMediaUrl } from '../../utils/formatters';
import { generateWhatsAppLink } from '../../utils/whatsapp';
import { PRODUCT_STATUS } from '../../lib/constants';
import { cn } from '../../lib/utils';

export default function ProductDetail() {
  const { slug } = useParams();
  const config = useSiteConfig();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${slug}`);
        setProduct(res.data);
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-paper">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-10 sm:px-8 lg:grid-cols-12" aria-hidden="true">
          <div className="aspect-square animate-pulse bg-ink/[0.07] lg:col-span-7" />
          <div className="space-y-4 lg:col-span-5">
            <div className="h-5 w-1/3 animate-pulse bg-ink/[0.07]" />
            <div className="h-16 w-4/5 animate-pulse bg-ink/[0.07]" />
            <div className="h-8 w-1/4 animate-pulse bg-ink/[0.07]" />
            <div className="h-40 w-full animate-pulse bg-ink/[0.07]" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-paper">
        <div className="mx-auto max-w-[1440px] px-4 py-24 sm:px-8">
          <p className="font-display text-6xl font-black leading-[0.9] md:text-8xl">Peça não encontrada.</p>
          <p className="mt-5 max-w-lg font-serif text-xl leading-relaxed text-ink/70">
            Ela pode ter saído do catálogo ou o endereço está errado.
          </p>
          <Link
            to="/catalogo"
            className="mt-8 inline-block font-display text-2xl font-extrabold text-cobalt underline decoration-2 underline-offset-[6px] hover:text-ink"
          >
            Ver o catálogo
          </Link>
        </div>
      </div>
    );
  }

  const pronta = product.status === PRODUCT_STATUS.PRONTA_ENTREGA;
  const mercadoLivre = product.linkMercadoLivre?.trim() || config?.linkLojaMercadoLivre?.trim() || '';
  const whatsapp = config?.whatsappNumero
    ? generateWhatsAppLink(
        product.nome,
        'Sinop-MT',
        product.status,
        config.whatsappNumero,
        product.mensagemWhatsAppTemplate || config.whatsappTemplate
      )
    : null;

  const dimensoes = [product.altura, product.largura, product.profundidade].every(Boolean)
    ? `${product.altura} × ${product.largura} × ${product.profundidade} cm`
    : [
        product.altura && `${product.altura} cm de altura`,
        product.largura && `${product.largura} cm de largura`,
        product.profundidade && `${product.profundidade} cm de profundidade`,
      ]
        .filter(Boolean)
        .join(', ');
  const ficha = [
    { label: 'Dimensões', value: dimensoes, hint: dimensoes.includes('×') ? 'altura, largura e profundidade' : null },
    { label: 'Peso', value: product.peso ? formatWeight(product.peso) : null },
    { label: 'Material', value: product.material },
    { label: 'Cor', value: product.cor },
  ].filter((item) => item.value);
  const hasHistoria = product.historiaTitulo || product.historiaTexto;

  return (
    <div className="bg-paper text-ink">
      <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-6 sm:px-8 md:pb-28">
        <Link to="/catalogo" className="font-serif text-base text-ink/60 underline decoration-ink/20 underline-offset-4 hover:text-ink">
          Voltar ao catálogo
        </Link>

        <div className="mt-5 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <ProductViewer
              media={product.media || []}
              modelo={product.modeloUrl ? { url: product.modeloUrl, arquivo: product.modeloArquivo, tamanho: product.modeloTamanho } : null}
              productName={product.nome}
            />
          </div>

          <aside className="self-start lg:sticky lg:top-24 lg:col-span-5">
            <p className={cn('font-serif text-lg italic', pronta ? 'text-ok' : 'text-ink/60')}>
              {pronta ? 'Pronta entrega' : 'Sob encomenda'}
            </p>
            <h1 className="mt-2 font-display text-5xl font-black leading-[0.9] md:text-7xl">{product.nome}</h1>
            {product.preco > 0 && <p className="mt-4 font-serif text-3xl">{formatPrice(product.preco)}</p>}
            {product.descricaoCurta && (
              <p className="mt-5 font-serif text-xl leading-relaxed text-ink/80">{product.descricaoCurta}</p>
            )}

            <div className="mt-8 flex flex-col gap-3">
              {whatsapp && whatsapp !== '#' && (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-14 items-center justify-center rounded-full bg-ink px-8 font-display text-xl font-extrabold text-paper transition-colors hover:bg-primary-700"
                >
                  {pronta ? 'Comprar pelo WhatsApp' : 'Encomendar pelo WhatsApp'}
                </a>
              )}
              {mercadoLivre && (
                <a
                  href={mercadoLivre}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-14 items-center justify-center rounded-full border-2 border-ink px-8 font-display text-xl font-extrabold transition-colors hover:bg-ink hover:text-paper"
                >
                  Comprar no Mercado Livre
                </a>
              )}
            </div>
            <p className="mt-4 font-serif text-base leading-relaxed text-ink/60">
              {pronta
                ? config?.politicaLocal || 'Retire em Sinop sem frete ou combine a entrega pelo WhatsApp.'
                : 'Feita depois do pedido. O prazo e a cor são combinados pelo WhatsApp.'}
            </p>

            {ficha.length > 0 && (
              <dl className="mt-10 border-t-[3px] border-ink">
                {ficha.map((item) => (
                  <div key={item.label} className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-ink/15 py-3">
                    <dt className="font-serif italic text-ink/55">{item.label}</dt>
                    <dd className="font-serif text-lg">
                      {item.value}
                      {item.hint && <span className="block text-sm text-ink/50">{item.hint}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </aside>
        </div>

        {product.descricaoCompleta && (
          <section className="mt-24">
            <SectionHeader title="Sobre a peça" />
            <p className="drop-cap mt-8 max-w-[65ch] whitespace-pre-line font-serif text-xl leading-[1.7] text-ink/85">
              {product.descricaoCompleta}
            </p>
          </section>
        )}

        {hasHistoria && (
          <section className="mt-24">
            <SectionHeader title={product.historiaTitulo || 'Onde ela fica bem'}>
              {product.historiaTexto && <p className="whitespace-pre-line">{product.historiaTexto}</p>}
            </SectionHeader>
            {product.historiaMidia?.length > 0 && (
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {product.historiaMidia.map((url, i) => (
                  <img
                    key={url}
                    src={normalizeMediaUrl(url)}
                    alt={`${product.nome} em uso, foto ${i + 1}`}
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover"
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {product.tags?.length > 0 && (
          <p className="mt-16 font-serif text-lg">
            <span className="italic text-ink/55">Assuntos: </span>
            {product.tags.map((tag, index) => (
              <span key={tag}>
                <Link
                  to={`/catalogo?search=${encodeURIComponent(tag)}`}
                  className="underline decoration-ink/25 underline-offset-4 hover:text-cobalt hover:decoration-cobalt"
                >
                  {tag}
                </Link>
                {index < product.tags.length - 1 && ', '}
              </span>
            ))}
          </p>
        )}

        {product.testimonials?.length > 0 && (
          <section className="mt-24">
            <SectionHeader title="Quem comprou" />
            <div className="mt-10 grid gap-12 md:grid-cols-2">
              {product.testimonials.map((testimonial) => (
                <blockquote key={testimonial.id} className="max-w-xl">
                  <p className="font-serif text-2xl italic leading-snug">“{testimonial.texto}”</p>
                  <footer className="mt-4 font-display text-xl font-extrabold">
                    {testimonial.nome}
                    {testimonial.cidade && (
                      <span className="ml-2 font-serif text-base font-normal italic text-ink/55">{testimonial.cidade}</span>
                    )}
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
