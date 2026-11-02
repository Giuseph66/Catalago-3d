import { Link } from 'react-router-dom';
import { useSiteConfig, whatsappUrl } from '../../hooks/useSiteConfig';

const LINKS = [
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/#como-e-feita', label: 'Como uma peça é feita' },
  { to: '/#cores', label: 'Cores' },
  { to: '/#onde-comprar', label: 'Onde comprar' },
];

// 5566999998888 -> (66) 99999-8888
function formatPhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
  const match = digits.match(/^(\d{2})(\d{4,5})(\d{4})$/);
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : raw;
}

export default function Footer() {
  const config = useSiteConfig();
  const whatsapp = whatsappUrl(config, 'Olá! Vi o catálogo de vocês e quero tirar uma dúvida.');

  return (
    <footer className="overflow-hidden bg-ink text-paper">
      <div className="mx-auto max-w-[1440px] px-4 pt-16 sm:px-8 md:pt-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-4xl font-extrabold leading-[0.95] md:text-5xl">
              Impressão 3D feita em Sinop, Mato Grosso.
            </p>
            <p className="mt-4 max-w-sm font-serif text-lg leading-relaxed text-paper/65">
              {config?.politicaLocal || 'Entregas locais sem frete. Combine pelo WhatsApp.'}
            </p>
          </div>

          <nav aria-label="Rodapé" className="md:col-span-3 md:col-start-7">
            <h2 className="font-serif text-base italic text-paper/45">Navegue</h2>
            <ul className="mt-4 space-y-2">
              {LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="font-display text-2xl font-extrabold hover:text-[#8FA2FF]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <h2 className="font-serif text-base italic text-paper/45">Contato</h2>
            <ul className="mt-4 space-y-3 font-serif text-lg">
              {whatsapp && (
                <li>
                  <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="underline decoration-paper/30 underline-offset-4 hover:decoration-paper">
                    WhatsApp {formatPhone(config.whatsappNumero)}
                  </a>
                </li>
              )}
              {config?.linkLojaMercadoLivre && (
                <li>
                  <a
                    href={config.linkLojaMercadoLivre}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-paper/30 underline-offset-4 hover:decoration-paper"
                  >
                    Loja no Mercado Livre
                  </a>
                </li>
              )}
              <li className="text-paper/65">Sinop, MT</li>
            </ul>
          </div>
        </div>

        <p
          aria-hidden="true"
          className="mt-16 -mb-[3.5vw] select-none whitespace-nowrap text-center font-display font-black uppercase leading-[0.8] text-paper/[0.08] text-[18.5vw] min-[1440px]:-mb-12 min-[1440px]:text-[266px]"
        >
          Catálogo 3D
        </p>
      </div>

      <div className="relative border-t border-paper/10 bg-ink">
        <div className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-2 px-4 py-5 font-serif text-sm text-paper/50 sm:px-8">
          <span>© {new Date().getFullYear()} Catálogo 3D</span>
          <span>Feito camada por camada.</span>
        </div>
      </div>
    </footer>
  );
}
