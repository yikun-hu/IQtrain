import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Language } from '@/types/types';
import { Translation, translations } from '@/i18n/translations';

export interface ITranslatedField<T = any> {
  [key: string]: T;
}

export const SupportedLanguages: {
  value: Language,
  label: string,
  labelAbbr: string,
}[] = [
  { value: "en-US", label: "English", labelAbbr: "EN" },
  { value: "zh-CN", label: "中文", labelAbbr: "中文" },
]

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translation;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (SupportedLanguages.find((lang) => lang.value === saved)?.value || SupportedLanguages[0].value);
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
