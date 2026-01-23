import { cn } from '../../lib/utils';

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}
      {...props}
    >
      {icon && (
        <div className="mb-4 text-6xl opacity-50">
          {icon}
        </div>
      )}
      {title && (
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm max-w-md mb-6" style={{ color: 'var(--text-2)' }}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

