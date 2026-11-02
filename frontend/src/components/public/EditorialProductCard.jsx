import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, normalizeMediaUrl } from '../../utils/formatters';
import { PRODUCT_STATUS } from '../../lib/constants';
import { cn } from '../../lib/utils';

export default function EditorialProductCard({ product, large = false }) {
  const capa = product.media?.find((m) => m.isCapa) || product.media?.[0];
  const pronta = product.status === PRODUCT_STATUS.PRONTA_ENTREGA;
  const [fotoFalhou, setFotoFalhou] = useState(false);

  return (
    <Link to={`/produto/${product.slug}`} className="group block focus-visible:outline-none">
      <div
        className={cn(
          'overflow-hidden bg-soft ring-cobalt ring-offset-4 ring-offset-paper group-focus-visible:ring-2',
          large ? 'aspect-[4/5]' : 'aspect-square'
        )}
      >
        {capa && !fotoFalhou ? (
          <img
            src={normalizeMediaUrl(capa.url)}
            alt={product.nome}
            loading="lazy"
            onError={() => setFotoFalhou(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : product.modeloUrl ? (
          <div className="flex h-full flex-col items-center justify-center bg-cover text-on-cover">
            <span className="font-display text-6xl font-black leading-none">3D</span>
            <span className="mt-2 font-serif text-sm italic text-on-cover/70">Gire a peça na página</span>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center font-serif italic text-ink/40">Foto em breve</div>
        )}
      </div>
      <h3
        className={cn(
          'mt-3 font-display font-extrabold leading-[0.95] text-ink group-hover:text-cobalt',
          large ? 'text-4xl' : 'text-xl sm:text-2xl'
        )}
      >
        {product.nome}
      </h3>
      {product.descricaoCurta && (
        <p className="mt-1.5 hidden font-serif text-base leading-snug text-ink/70 line-clamp-2 sm:block">
          {product.descricaoCurta}
        </p>
      )}
      <p className="mt-1.5 flex flex-wrap items-baseline gap-x-3 font-serif">
        {product.preco > 0 && <span className="text-lg text-ink">{formatPrice(product.preco)}</span>}
        <span className={cn('text-sm italic', pronta ? 'text-ok' : 'text-ink/55')}>
          {pronta ? 'Pronta entrega' : 'Sob encomenda'}
        </span>
      </p>
    </Link>
  );
}
