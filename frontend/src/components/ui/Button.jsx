import { cn } from '../../lib/utils';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  leftIcon,
  loading,
  disabled,
  as: Component = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-700 focus-visible:ring-primary-500',
    secondary: 'bg-primary-100 text-primary-700 border border-primary-200 hover:bg-primary-100 focus-visible:ring-primary-500',
    ghost: 'bg-transparent text-primary-500 hover:bg-primary-100 focus-visible:ring-primary-500',
    outline: 'bg-transparent text-primary-500 border border-primary-500 hover:bg-primary-100 focus-visible:ring-primary-500',
    danger: 'bg-danger text-white hover:bg-[#B91C1C] focus-visible:ring-danger',
  };

  const sizes = {
    sm: 'h-10 px-4 text-sm rounded-button',
    md: 'h-12 px-6 text-base rounded-button',
    lg: 'h-14 px-8 text-lg rounded-button',
  };

  const classes = cn(
    baseStyles,
    variants[variant],
    sizes[size],
    className
  );

  if (Component === 'button') {
    return (
      <button
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {children}
          </>
        ) : (
          <>
            {leftIcon && leftIcon}
            {children}
          </>
        )}
      </button>
    );
  }

  return (
    <Component
      className={classes}
      {...props}
    >
      {leftIcon && leftIcon}
      {children}
    </Component>
  );
}

