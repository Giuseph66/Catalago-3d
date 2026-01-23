import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { BADGE_VARIANTS, PRODUCT_STATUS } from '../../lib/constants';
import { FaArrowRight, FaImage, FaShoppingCart } from 'react-icons/fa';
import { cn } from '../../lib/utils';

export default function ProductCard({ product, variant = 'default' }) {
  const capa = product.media?.find(m => m.isCapa) || product.media?.[0];
  const isDestaque = Boolean(product.destaque);
  const isProntaEntrega = product.status === PRODUCT_STATUS.PRONTA_ENTREGA;
  const isCatalog = variant === 'catalog';
  const statusLabel = isProntaEntrega ? 'Pronta entrega' : 'Sob encomenda';

  return (
    <Link
      to={`/produto/${product.slug}`}
      className={cn('product-card group block', isCatalog && 'product-card--catalog')}
      aria-label={`Ver detalhes de ${product.nome}`}
    >
      <div className={cn('relative', !isCatalog && 'mb-4')}>
        {capa ? (
          <div className={cn('card-img-container overflow-hidden', isCatalog ? 'aspect-[4/5]' : 'aspect-[4/3]')}>
            <img
              src={capa.url}
              alt={product.nome}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className={cn('card-img-container flex items-center justify-center', isCatalog ? 'aspect-[4/5]' : 'aspect-[4/3]')} style={{ backgroundColor: '#F1F5F9' }}>
            <EmptyState
              icon={<FaImage size={isCatalog ? 64 : 48} style={{ color: 'var(--muted)' }} />}
              title="Sem imagem"
              className={cn('py-4', isCatalog && 'py-8')}
            />
          </div>
        )}
        
        {!isCatalog && (
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isDestaque && (
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
        )}
      </div>
      
      <div className={cn(isCatalog && 'product-card-content')}>
        {isCatalog && (
          <div className="flex flex-wrap items-center gap-2">
            {isDestaque && (
              <span
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: 'var(--warning-soft)', color: '#92400E', border: '1px solid var(--border)' }}
              >
                Destaque
              </span>
            )}
            <span
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: isProntaEntrega ? 'var(--success-soft)' : 'var(--info-soft)',
                color: isProntaEntrega ? 'var(--success)' : 'var(--info)',
                border: '1px solid var(--border)'
              }}
            >
              {statusLabel}
            </span>
          </div>
        )}
        <h3 
          className={cn(
            'font-semibold mb-2 line-clamp-2 transition-colors',
            isCatalog ? 'text-base md:text-lg' : 'text-lg'
          )}
          style={{ color: 'var(--text)' }}
          onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text)'}
        >
          {product.nome}
        </h3>
        {product.descricaoCurta && (
          <p className={cn('text-sm line-clamp-2', isCatalog ? 'mb-3' : 'mb-4')} style={{ color: 'var(--text-2)' }}>
            {product.descricaoCurta}
          </p>
        )}
        {isCatalog ? (
          <div className="flex items-end justify-between gap-4">
            <div className="flex-1">
              <p className="text-xl md:text-2xl font-bold mb-1" style={{ color: 'var(--primary)' }}>
                {formatPrice(product.preco || product.peso)}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {product.peso}g
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-2)' }}>
              Ver detalhes
              <FaArrowRight size={12} />
            </span>
          </div>
        ) : (
          <div className="flex items-end justify-between gap-4">
            <div className="flex-1">
              <p className="text-2xl font-bold mb-1" style={{ color: 'var(--primary)' }}>
                {formatPrice(product.preco || product.peso)}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {product.peso}g
              </p>
            </div>
            <Button
              size="sm"
              leftIcon={<FaShoppingCart />}
              onClick={(e) => {
                e.preventDefault();
                window.location.href = `/produto/${product.slug}`;
              }}
              className="flex-shrink-0"
            >
              Ver
            </Button>
          </div>
        )}
      </div>
    </Link>
  );
}
