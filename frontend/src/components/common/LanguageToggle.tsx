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
        'inline-flex items-center bg-[#EAF0F2] border border-[#B8C5CC] rounded-xl p-0.5 text-xs font-heading font-medium',
        className
      )}
    >
      <Languages className="w-3.5 h-3.5 ml-2 text-[#486581] mr-1" />
      <button
        onClick={() => handleToggle('en')}
        className={cn(
          'px-2.5 py-1 rounded-lg transition-all min-h-[34px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7490]',
          language === 'en'
            ? 'bg-[#0E7490] text-white shadow-[1px_1px_0px_#102A43] font-bold'
            : 'text-[#102A43] hover:text-[#0E7490] hover:bg-white/80 font-medium'
        )}
        aria-pressed={language === 'en'}
      >
        English
      </button>
      <button
        onClick={() => handleToggle('hi')}
        className={cn(
          'px-2.5 py-1 rounded-lg transition-all min-h-[34px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7490]',
          language === 'hi'
            ? 'bg-[#0E7490] text-white shadow-[1px_1px_0px_#102A43] font-bold'
            : 'text-[#102A43] hover:text-[#0E7490] hover:bg-white/80 font-medium'
        )}
        aria-pressed={language === 'hi'}
      >
        हिंदी
      </button>
    </div>
  );
};
