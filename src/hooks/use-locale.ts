"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getTranslation,
  type Locale,
  defaultLocale,
} from "@/i18n";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: defaultLocale,
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "darslinker-locale",
    }
  )
);

/**
 * Hook to get current locale
 */
export function useLocale() {
  return useLocaleStore((state) => state.locale);
}

/**
 * Hook to set locale
 */
export function useSetLocale() {
  return useLocaleStore((state) => state.setLocale);
}

/**
 * Hook to get translation function
 */
export function useTranslations() {
  const locale = useLocale();

  return function t(key: string, params?: Record<string, string | number>) {
    return getTranslation(locale, key, params);
  };
}

/**
 * Hook to get both locale and translation function
 */
export function useI18n() {
  const locale = useLocale();
  const setLocale = useSetLocale();

  const t = (key: string, params?: Record<string, string | number>) => {
    return getTranslation(locale, key, params);
  };

  return { locale, setLocale, t };
}
