import { cn } from '../../lib/utils';
import { BADGE_VARIANTS } from '../../lib/constants';

export function Badge({ variant, children, className, ...props }) {
  const variants = {
    [BADGE_VARIANTS.DESTAQUE]: 'chip-destaque',
    [BADGE_VARIANTS.PRONTA_ENTREGA]: 'chip-pronta-entrega',
    [BADGE_VARIANTS.SOB_ENCOMENDA]: 'chip-sob-encomenda',
  };

  return (
    <span
      className={cn(variants[variant] || 'chip-destaque', className)}
      {...props}
    >
      {children}
    </span>
  );
}

