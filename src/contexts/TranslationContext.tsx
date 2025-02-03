// src/contexts/TranslationContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import enTranslations from "../translations/en.json";
import nlTranslations from "../translations/nl.json";

interface Translations {
  [namespace: string]: {
    [key: string]: string;
  };
}

interface TranslationContextType {
  translations: Translations;
  language: string;
  setLanguage: (lang: string) => void;
}

const translationFiles: { [lang: string]: Translations } = {
  en: enTranslations,
  nl: nlTranslations,
};

const defaultLanguage = "en";

const TranslationContext = createContext<TranslationContextType>({
  translations: translationFiles[defaultLanguage],
  language: defaultLanguage,
  setLanguage: () => {},
});

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState(defaultLanguage);
  const [translations, setTranslations] = useState<Translations>(translationFiles[defaultLanguage]);

  const setLanguageHandler = (lang: string) => {
    setLanguage(lang);
    setTranslations(translationFiles[lang]);
  };

  return (
    <TranslationContext.Provider value={{ translations, language, setLanguage: setLanguageHandler }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslations = (namespace: string) => {
  const { translations } = useContext(TranslationContext);
  const t = (key: string) => {
    return translations[namespace]?.[key] || key;
  };
  return t;
};

// Hook to change the language
export const useSetLanguage = () => {
  const { setLanguage } = useContext(TranslationContext);
  return setLanguage;
};

// Hook to read the current language
export const useCurrentLanguage = () => {
  const { language } = useContext(TranslationContext);
  return language;
};
