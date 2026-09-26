import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102A43]/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={cn(
          'w-full bg-white rounded-2xl shadow-[6px_6px_0px_#102A43] border-2 border-[#102A43] p-5 sm:p-6 overflow-hidden flex flex-col max-h-[90vh]',
          maxWidths[maxWidth]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b-2 border-[#102A43]/10">
          <div>
            {title && <h3 className="font-heading font-extrabold text-lg sm:text-xl text-[#102A43] tracking-tight">{title}</h3>}
            {description && <p className="text-xs sm:text-sm text-[#486581] mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-[#486581] hover:text-[#102A43] rounded-lg hover:bg-[#EAF0F2] border border-transparent hover:border-[#102A43]/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7490] min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="py-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
