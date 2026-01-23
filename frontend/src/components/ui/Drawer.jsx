import { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { cn } from '../../lib/utils';

export function Drawer({ isOpen, onClose, title, children, className, variant = 'side' }) {
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

  if (!isOpen) return null;

  const isModal = variant === 'modal';

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div
        className={cn(
          isModal
            ? 'fixed left-1/2 top-20 -translate-x-1/2 z-50 w-[92vw] max-w-sm bg-white shadow-xl rounded-2xl transition-all duration-200'
            : 'fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out',
          isModal ? (isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0') : (isOpen ? 'translate-x-0' : 'translate-x-full'),
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'drawer-title' : undefined}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 id="drawer-title" className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Fechar"
            >
              <IoClose size={20} style={{ color: 'var(--text-2)' }} />
            </button>
          </div>
        )}
        <div
          className={cn('overflow-y-auto', !isModal && 'h-full')}
          style={{ maxHeight: isModal ? 'calc(80vh - 64px)' : 'calc(100vh - 64px)' }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
