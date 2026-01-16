import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
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
  { value: "fr-FR", label: "Français", labelAbbr: "FR" },
  { value: "de-DE", label: "Deutsch", labelAbbr: "DE" },
  { value: "zh-CN", label: "简体中文", labelAbbr: "简中" },
  { value: "zh-TW", label: "繁体中文", labelAbbr: "繁中" },
]

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translation;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // 增加服务端渲染/环境检查，防止 localStorage 报错（如果是 Next.js 等框架）
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language') as Language;
      // 读取浏览器支持的语言列表
      const navigatorLanguage = navigator.languages.find((lang) => SupportedLanguages.some((supportedLang) => supportedLang.value === lang));
      return (SupportedLanguages.find((lang) => lang.value === saved || lang.value === navigatorLanguage)?.value || SupportedLanguages[0].value);
    }
    return SupportedLanguages[0].value;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // --- 修改重点开始 ---
  
  // 使用 useMemo 缓存 Proxy 对象，避免每次渲染都重新创建
  const t = useMemo(() => {
    const currentTranslations = translations[language];

    // 创建 Proxy 代理
    return new Proxy(currentTranslations, {
      get(target, prop) {
        // 1. 如果属性存在于翻译对象中，直接返回
        if (prop in target) {
          return target[prop as keyof Translation];
        }

        // 2. 如果属性不存在，且属性名是字符串（排除 Symbol 等内部属性），返回默认文案
        if (typeof prop === 'string') {
          // 你也可以在这里 console.warn 提示哪个 key 缺失了，方便调试
          // console.warn(`Missing translation for key: ${prop}`);
          return 'Translation Required';
        }

        // 3. 其他情况（如 Symbol）返回 undefined
        return undefined;
      }
    });
  }, [language]);

  // --- 修改重点结束 ---

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
