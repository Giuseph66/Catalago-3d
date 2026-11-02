import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { useSiteConfig, whatsappUrl } from '../../hooks/useSiteConfig';
import { cn } from '../../lib/utils';

const LINKS = [
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/#como-e-feita', label: 'Como é feita' },
  { to: '/#cores', label: 'Cores' },
  { to: '/#onde-comprar', label: 'Onde comprar' },
];

export default function Header() {
  const config = useSiteConfig();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const encomendar = whatsappUrl(config, 'Olá! Quero encomendar uma peça impressa em 3D. Sou de Sinop-MT.');

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  const linkClass = ({ isActive }) =>
    cn(
      'font-serif text-[17px] text-ink/75 transition-colors hover:text-ink',
      isActive && 'text-ink underline decoration-cobalt decoration-2 underline-offset-[6px]'
    );

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 text-ink backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-4 sm:px-8">
        <Link to="/" className="font-display text-[28px] font-black uppercase leading-none tracking-tight">
          Catálogo 3D
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) =>
            link.to.includes('#') ? (
              <Link key={link.to} to={link.to} className={linkClass({ isActive: false })}>
                {link.label}
              </Link>
            ) : (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={encomendar || '/catalogo'}
            target={encomendar ? '_blank' : undefined}
            rel={encomendar ? 'noopener noreferrer' : undefined}
            className="hidden h-10 items-center rounded-full bg-ink px-5 font-display text-lg font-extrabold text-paper transition-colors hover:bg-cobalt sm:inline-flex"
          >
            Encomendar
          </a>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink/5 md:hidden"
          >
            {open ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="menu-mobile" aria-label="Principal" className="border-t border-ink/10 bg-paper px-4 pb-8 pt-4 md:hidden">
          <ul className="space-y-1">
            {LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="block py-1.5 font-display text-4xl font-extrabold">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <a
            href={encomendar || '/catalogo'}
            target={encomendar ? '_blank' : undefined}
            rel={encomendar ? 'noopener noreferrer' : undefined}
            className="mt-6 flex h-12 items-center justify-center rounded-full bg-ink font-display text-xl font-extrabold text-paper"
          >
            Encomendar pelo WhatsApp
          </a>
        </nav>
      )}
    </header>
  );
}
