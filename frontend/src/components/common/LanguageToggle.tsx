import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { cn } from '../../utils/cn';

export const LanguageToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useAppStore();

  const handleToggle = (newLang: 'en' | 'hi') => {
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <div
      role="group"
      aria-label="Language selector"
      className={cn(
        'inline-flex items-center bg-surface-muted border border-surface-border rounded-full p-0.5 text-xs font-heading font-medium',
        className
      )}
    >
      <Languages className="w-3.5 h-3.5 ml-2 text-slate-500 mr-1" />
      <button
        onClick={() => handleToggle('en')}
        className={cn(
          'px-2.5 py-1 rounded-full transition-all min-h-[32px]',
          language === 'en'
            ? 'bg-brand-teal text-white shadow-xs font-semibold'
            : 'text-slate-600 hover:text-slate-900'
        )}
        aria-pressed={language === 'en'}
      >
        English
      </button>
      <button
        onClick={() => handleToggle('hi')}
        className={cn(
          'px-2.5 py-1 rounded-full transition-all min-h-[32px]',
          language === 'hi'
            ? 'bg-brand-teal text-white shadow-xs font-semibold'
            : 'text-slate-600 hover:text-slate-900'
        )}
        aria-pressed={language === 'hi'}
      >
        हिंदी
      </button>
    </div>
  );
};
