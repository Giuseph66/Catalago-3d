import { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import { cn } from '../../lib/utils';

export function Modal({ isOpen, onClose, children, title, className }) {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={cn('bg-white rounded-card shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto', className)}
        onClick={(e) => e.stopPropagation()}
        style={{ borderRadius: '16px' }}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 id="modal-title" className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Fechar"
            >
              <IoClose size={24} style={{ color: 'var(--text-2)' }} />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

