"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  applyDocumentLanguage,
  AppLanguage,
  DEFAULT_LANGUAGE,
  getStoredLanguage,
  LANGUAGE_STORAGE_KEY,
  normalizeLanguage,
  setStoredLanguage,
  translate,
} from "@/app/i18n/translations";

type LanguageContextValue = {
  isReady: boolean;
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (message: string) => string;
};

const LanguageContext = createContext<LanguageContextValue>({
  isReady: false,
  language: DEFAULT_LANGUAGE,
  setLanguage: () => undefined,
  t: (message) => message,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(DEFAULT_LANGUAGE);
  const [isReady, setIsReady] = useState(false);

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    setStoredLanguage(nextLanguage);
    applyDocumentLanguage(nextLanguage);
  }, []);

  useEffect(() => {
    const storedLanguage = getStoredLanguage();
    setLanguageState(storedLanguage);
    applyDocumentLanguage(storedLanguage);
    setIsReady(true);

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== LANGUAGE_STORAGE_KEY) return;
      const nextLanguage = normalizeLanguage(event.newValue);
      setLanguageState(nextLanguage);
      applyDocumentLanguage(nextLanguage);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const t = useCallback(
    (message: string) => translate(language, message),
    [language],
  );

  const value = useMemo(
    () => ({ isReady, language, setLanguage, t }),
    [isReady, language, setLanguage, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
