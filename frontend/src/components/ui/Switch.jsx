import { cn } from '../../lib/utils';

export function Switch({ checked, onChange, label, hint, disabled, className, ...props }) {
  const switchId = `switch-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={label ? `${switchId}-label` : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          checked ? 'bg-primary-500' : 'bg-gray-300'
        )}
        {...props}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
      {label && (
        <div>
          <label
            id={`${switchId}-label`}
            htmlFor={switchId}
            className="text-sm font-medium cursor-pointer"
            style={{ color: 'var(--text)' }}
            onClick={() => !disabled && onChange(!checked)}
          >
            {label}
          </label>
          {hint && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
              {hint}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

