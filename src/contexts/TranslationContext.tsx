import React, { createContext, useContext, ReactNode } from "react";
import enTranslations from "../translations/en.json";

interface Translations {
  [namespace: string]: {
    [key: string]: string;
  };
}

const defaultTranslations: Translations = enTranslations;

const TranslationContext = createContext<Translations>(defaultTranslations);

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <TranslationContext.Provider value={defaultTranslations}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslations = (namespace: string) => {
  const translations = useContext(TranslationContext);
  const t = (key: string) => {
    return translations[namespace]?.[key] || key;
  };
  return t;
};
