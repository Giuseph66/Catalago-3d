import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, MotionConfig } from 'framer-motion';
import api from '../../services/api';
import Turntable from '../../components/public/home/Turntable';
import EditorialProductCard from '../../components/public/EditorialProductCard';
import SectionHeader from '../../components/public/SectionHeader';
import { generateWhatsAppLink } from '../../utils/whatsapp';

const SWATCHES = [
  { name: 'Laranja', hex: '#FF5A1F' },
  { name: 'Azul cobalto', hex: '#2340C8' },
  { name: 'Branco', hex: '#F4F4F2' },
  { name: 'Preto', hex: '#1C1C1E' },
  { name: 'Vermelho', hex: '#D7263D' },
  { name: 'Amarelo', hex: '#F6C445' },
  { name: 'Verde', hex: '#2F9E62' },
  { name: 'Cinza', hex: '#8A9099' },
  { name: 'Rosa', hex: '#F29BB8' },
  { name: 'Dourado silk', hex: '#C9A24A' },
];

const STEPS = [
  {
    title: 'Modelagem',
    text: 'Desenhamos a peça ou ajustamos um modelo pronto ao tamanho, à cor e ao nome que você pediu.',
  },
  {
    title: 'Fatiamento',
    text: 'O programa divide o modelo em centenas de camadas e calcula o caminho que o bico vai fazer em cada uma.',
  },
  {
    title: 'Impressão',
    text: 'O plástico derrete a cerca de 210 °C e é depositado camada por camada. Uma peça leva de minutos a muitas horas.',
  },
  {
    title: 'Acabamento',
    text: 'Tiramos os suportes, revisamos a peça e embalamos para você retirar ou receber.',
  },
];

const COVER_LINES = [
  { href: '#como-e-feita', title: 'Como uma peça é feita', text: 'Do arquivo ao acabamento, em quatro etapas.' },
  { href: '#cores', title: 'Cores', text: 'Escolha o filamento da sua peça.' },
  { href: '#onde-comprar', title: 'Onde comprar', text: 'Retirada em Sinop ou envio pelo Mercado Livre.' },
];

const ease = [0.22, 1, 0.36, 1];

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [produtos, setProdutos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, categoriesRes, testimonialsRes, configRes] = await Promise.all([
          api.get('/products?destaque=true&limit=5'),
          api.get('/categories'),
          api.get('/testimonials?limit=4'),
          api.get('/config')
        ]);

        let lista = productsRes.data.products || [];
        // Sem destaques marcados, a vitrine mostra os mais recentes
        if (lista.length === 0) {
          const recentes = await api.get('/products?limit=5&orderBy=createdAt&orderDir=DESC');
          lista = recentes.data.products || [];
        }

        setProdutos(lista);
        setCategories(categoriesRes.data || []);
        setTestimonials(testimonialsRes.data || []);
        setConfig(configRes.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadData();
  }, []);

  // Links do header/rodapé chegam como /#secao: rola depois que a página monta
  useEffect(() => {
    if (!location.hash) return;
    const alvo = document.getElementById(location.hash.slice(1));
    alvo?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash, produtos.length]);

  const openWhatsApp = (message) => {
    const numero = String(config?.whatsappNumero || '').replace(/\D/g, '');
    if (!numero) {
      navigate('/catalogo');
      return;
    }
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleWhatsApp = () => {
    if (!config?.whatsappNumero) {
      navigate('/catalogo');
      return;
    }
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

  const edicao = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date());
  const [principal, ...demais] = produtos;

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-paper text-ink">
        {/* Capa */}
        <section className="relative overflow-hidden bg-cover text-on-cover">
          <div className="mx-auto max-w-[1440px] px-4 pb-12 pt-5 sm:px-8 lg:pb-16">
            <div className="flex items-baseline justify-between font-serif text-sm text-on-cover/80 md:text-base">
              <span>Sinop, Mato Grosso</span>
              <span className="first-letter:uppercase">{edicao}</span>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease }}
              className="relative z-0 mt-4 whitespace-nowrap text-center font-display font-black uppercase leading-[0.8] tracking-[-0.01em] text-on-cover text-[18.5vw] min-[1440px]:text-[266px]"
            >
              Catálogo 3D
            </motion.h1>

            <div className="relative grid gap-8 lg:grid-cols-12 lg:gap-6">
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, delay: 0.25, ease }}
                className="relative z-10 order-1 -mt-[24vw] sm:-mt-[16vw] lg:order-2 lg:col-span-4 lg:col-start-5 lg:-mt-[12vw] min-[1440px]:-mt-44"
              >
                <Turntable
                  alt="Vaso torcido impresso em PLA laranja"
                  className="mx-auto aspect-[3/4] w-[78%] sm:w-[60%] lg:w-full"
                />
                <p className="-mt-6 text-center font-serif text-sm italic text-on-cover/75">
                  Na capa: vaso torcido em PLA laranja. Arraste para girar.
                </p>
              </motion.div>

              <div className="order-2 lg:order-1 lg:col-span-4 lg:pt-10">
                <p className="font-display text-5xl font-extrabold leading-[0.92] md:text-6xl">
                  Feito camada por camada, aqui em Sinop.
                </p>
                <p className="mt-5 max-w-md font-serif text-lg leading-relaxed text-on-cover/85 md:text-xl">
                  Presentes, decoração e peças sob medida em impressão 3D. Escolha no catálogo ou mande a sua ideia.
                </p>
                <div className="mt-8 flex flex-col gap-3 whitespace-nowrap sm:flex-row sm:flex-wrap">
                  <Link
                    to="/catalogo"
                    className="inline-flex h-14 items-center justify-center rounded-full bg-ink px-8 font-display text-xl font-extrabold text-paper transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-cover"
                  >
                    Ver o catálogo
                  </Link>
                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    className="inline-flex h-14 items-center justify-center rounded-full border-2 border-on-cover/60 px-8 font-display text-xl font-extrabold text-on-cover transition-colors hover:border-on-cover hover:bg-on-cover/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-cover"
                  >
                    Pedir pelo WhatsApp
                  </button>
                </div>
              </div>

              <nav aria-label="Nesta página" className="order-3 lg:col-span-3 lg:col-start-10 lg:pt-10">
                <ul className="space-y-6 lg:text-right">
                  {COVER_LINES.map((line) => (
                    <li key={line.href}>
                      <a href={line.href} className="group block">
                        <span className="block font-display text-3xl font-extrabold leading-none group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">
                          {line.title}
                        </span>
                        <span className="mt-1 block font-serif text-base text-on-cover/75">{line.text}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </section>

        {/* Em destaque */}
        {produtos.length > 0 && (
          <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-8 md:py-28">
            <SectionHeader id="destaques" title="Em destaque">
              <p>Peças do catálogo para levar prontas ou pedir em outra cor e tamanho.</p>
              {categories.length > 0 && (
                <p className="mt-3 text-base">
                  <span className="italic text-ink/55">Seções: </span>
                  {categories.map((category, index) => (
                    <span key={category.id}>
                      <Link
                        to={`/catalogo?categoria=${category.slug}`}
                        className="text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-cobalt hover:text-cobalt"
                      >
                        {category.nome}
                      </Link>
                      {index < categories.length - 1 && ', '}
                    </span>
                  ))}
                </p>
              )}
            </SectionHeader>

            <div className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-12">
              <div className="md:col-span-6 lg:col-span-5">
                <EditorialProductCard product={principal} large />
              </div>
              {demais.length > 0 && (
                <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 md:col-span-6 lg:col-span-6 lg:col-start-7">
                  {demais.map((product) => (
                    <EditorialProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/catalogo"
              className="mt-14 inline-block font-display text-2xl font-extrabold text-cobalt underline decoration-2 underline-offset-[6px] hover:text-ink"
            >
              Ver o catálogo completo
            </Link>
          </section>
        )}

        {/* Matéria: como uma peça é feita */}
        <section className="bg-white">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-20 sm:px-8 md:py-28 lg:grid-cols-12 lg:gap-12">
            <figure className="lg:col-span-7">
              <img
                src="/editorial/macro-camadas.webp"
                alt="Detalhe das linhas de camada de um vaso impresso em PLA laranja"
                loading="lazy"
                className="aspect-[7/5] w-full object-cover"
              />
              <figcaption className="mt-3 font-serif text-sm italic text-ink/60">
                Linhas de camada vistas de perto. Cada faixa é uma passada do bico.
              </figcaption>
            </figure>

            <article id="como-e-feita" className="scroll-mt-24 lg:col-span-5">
              <h2 className="font-display text-5xl font-extrabold leading-[0.9] md:text-7xl">Como uma peça é feita</h2>
              <p className="drop-cap mt-8 font-serif text-xl leading-[1.65] text-ink/85">
                Toda peça começa como um arquivo 3D e termina na sua mão. No meio do caminho, a impressora
                deposita plástico derretido em camadas de dois décimos de milímetro, uma sobre a outra, até a
                forma aparecer.
              </p>
              <ol className="mt-10 border-t border-ink/15">
                {STEPS.map((step, index) => (
                  <li key={step.title} className="grid grid-cols-[3rem_1fr] gap-2 border-b border-ink/15 py-5">
                    <span className="font-display text-3xl font-black leading-none text-filament">{index + 1}</span>
                    <div>
                      <h3 className="font-display text-2xl font-extrabold leading-none">{step.title}</h3>
                      <p className="mt-2 font-serif text-base leading-relaxed text-ink/75">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </article>
          </div>
        </section>

        {/* Cores */}
        <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-8 md:py-28">
          <SectionHeader id="cores" title="Cores">
            <p>
              Algumas cores de filamento que usamos. A disponibilidade muda, então confirme pelo WhatsApp antes
              de encomendar.
            </p>
          </SectionHeader>

          <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-5">
            {SWATCHES.map((swatch) => (
              <li key={swatch.hex}>
                <button
                  type="button"
                  onClick={() => openWhatsApp(`Olá! Quero encomendar uma peça na cor ${swatch.name}. Sou de Sinop-MT.`)}
                  className="group block w-full text-left focus-visible:outline-none"
                >
                  <span
                    className="block aspect-[4/5] w-full shadow-[inset_0_0_0_1px_rgba(22,24,29,0.08)] ring-cobalt ring-offset-4 ring-offset-paper transition-transform duration-300 group-hover:-translate-y-1 group-focus-visible:ring-2"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <span className="mt-3 block font-display text-2xl font-extrabold leading-none">{swatch.name}</span>
                  <span className="mt-1 block font-serif text-sm italic text-ink/55 group-hover:text-cobalt">
                    Pedir nessa cor
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Onde comprar */}
        <section className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-8 md:pb-28">
          <SectionHeader id="onde-comprar" title="Onde comprar" />
          <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-0 md:divide-x md:divide-ink/15">
            <div className="md:pr-8">
              <h3 className="font-display text-3xl font-extrabold">Retirada em Sinop</h3>
              <p className="mt-3 font-serif text-lg leading-relaxed text-ink/75">
                {config?.politicaLocal || 'Entregas locais sem frete. Combine pelo WhatsApp.'}
              </p>
              <button
                type="button"
                onClick={() => openWhatsApp('Olá! Quero combinar uma retirada em Sinop-MT.')}
                className="mt-4 font-serif text-lg text-cobalt underline underline-offset-4 hover:text-ink"
              >
                Combinar retirada
              </button>
            </div>
            <div className="md:px-8">
              <h3 className="font-display text-3xl font-extrabold">Mercado Livre</h3>
              <p className="mt-3 font-serif text-lg leading-relaxed text-ink/75">
                Envio para todo o Brasil, com frete calculado na hora da compra.
              </p>
              {config?.linkLojaMercadoLivre && (
                <a
                  href={config.linkLojaMercadoLivre}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block font-serif text-lg text-cobalt underline underline-offset-4 hover:text-ink"
                >
                  Abrir a loja
                </a>
              )}
            </div>
            <div className="md:pl-8">
              <h3 className="font-display text-3xl font-extrabold">WhatsApp</h3>
              <p className="mt-3 font-serif text-lg leading-relaxed text-ink/75">
                Orçamento, personalização e prazo direto com quem imprime.
              </p>
              <button
                type="button"
                onClick={handleWhatsApp}
                className="mt-4 font-serif text-lg text-cobalt underline underline-offset-4 hover:text-ink"
              >
                Chamar no WhatsApp
              </button>
            </div>
          </div>
        </section>

        {/* Cartas dos leitores */}
        {testimonials.length > 0 && (
          <section className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-8 md:pb-28">
            <SectionHeader id="cartas" title="Cartas dos leitores" />
            <div className="mt-10 grid gap-12 md:grid-cols-2">
              {testimonials.map((testimonial) => (
                <blockquote key={testimonial.id} className="max-w-xl">
                  <p className="font-serif text-2xl italic leading-snug text-ink md:text-[1.7rem]">
                    “{testimonial.texto}”
                  </p>
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

        {/* Contracapa */}
        <section className="overflow-hidden bg-cover text-on-cover">
          <div className="mx-auto grid max-w-[1440px] items-center gap-6 px-4 pt-16 sm:px-8 lg:grid-cols-12 lg:pt-0">
            <div className="lg:col-span-5 lg:py-24">
              <h2 className="font-display text-6xl font-black leading-[0.86] md:text-8xl">
                Mande a ideia. A gente devolve a peça.
              </h2>
              <p className="mt-6 max-w-md font-serif text-xl leading-relaxed text-ink/80">
                Uma foto, um desenho ou só uma descrição já bastam para o orçamento.
              </p>
              <button
                type="button"
                onClick={() => openWhatsApp('Olá! Tenho uma ideia de peça para imprimir. Sou de Sinop-MT.')}
                className="mt-9 inline-flex h-14 items-center justify-center rounded-full bg-ink px-8 font-display text-xl font-extrabold text-paper transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-cover"
              >
                Pedir orçamento pelo WhatsApp
              </button>
            </div>
            <img
              src="/editorial/natureza-morta.webp"
              alt="Vaso laranja, escultura em nó branca e chaveiro azul escrito Sinop, todos impressos em 3D"
              loading="lazy"
              className="still-life w-full lg:col-span-7"
            />
          </div>
        </section>
      </div>
    </MotionConfig>
  );
}
