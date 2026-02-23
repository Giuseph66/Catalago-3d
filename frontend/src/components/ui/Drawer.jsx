import { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { cn } from '../../lib/utils';

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  className,
  variant = 'side',
  side = 'left' // Default to left as requested
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const isModal = variant === 'modal';
  const isLeft = side === 'left';

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          isModal
            ? 'fixed left-1/2 top-20 -translate-x-1/2 z-50 w-[92vw] max-w-sm bg-white shadow-xl rounded-2xl transition-all duration-300'
            : cn(
              'fixed inset-y-0 z-50 w-full max-w-xs bg-white shadow-2xl transform transition-transform duration-300 ease-in-out',
              isLeft ? 'left-0' : 'right-0'
            ),
          isModal
            ? (isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none')
            : (isOpen ? 'translate-x-0' : (isLeft ? '-translate-x-full' : 'translate-x-full')),
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 id="drawer-title" className="text-xl font-bold font-heading" style={{ color: 'var(--text)' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              aria-label="Fechar"
            >
              <IoClose size={24} />
            </button>
          </div>
        )}
        <div
          className={cn('overflow-y-auto custom-scrollbar', !isModal && 'h-full')}
          style={{ maxHeight: isModal ? 'calc(90vh - 80px)' : '100vh' }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
