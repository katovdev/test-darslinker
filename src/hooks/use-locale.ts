"use client";

import { useCallback, useSyncExternalStore } from "react";
import { getTranslation, type Locale, defaultLocale } from "@/i18n";

const LOCALE_KEY = "darslinker-locale";

function getStoredLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  const stored = localStorage.getItem(LOCALE_KEY);
  if (stored && (stored === "uz" || stored === "ru" || stored === "en")) {
    return stored as Locale;
  }
  return defaultLocale;
}

function setStoredLocale(locale: Locale): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCALE_KEY, locale);
}

let globalLocale: Locale = defaultLocale;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Locale {
  return globalLocale;
}

function getServerSnapshot(): Locale {
  return defaultLocale;
}

function setGlobalLocale(locale: Locale) {
  globalLocale = locale;
  setStoredLocale(locale);
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  globalLocale = getStoredLocale();
}

export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useSetLocale() {
  return useCallback((locale: Locale) => {
    setGlobalLocale(locale);
  }, []);
}

export function useTranslations() {
  const locale = useLocale();

  return useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return getTranslation(locale, key, params);
    },
    [locale]
  );
}

export function useI18n() {
  const locale = useLocale();
  const setLocale = useSetLocale();

  const t = (key: string, params?: Record<string, string | number>) => {
    return getTranslation(locale, key, params);
  };

  return { locale, setLocale, t };
}

export const useLocaleStore = {
  getState: () => ({ locale: globalLocale, setLocale: setGlobalLocale }),
};
