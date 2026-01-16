import { en } from "./locales/en";
import { uz } from "./locales/uz";
import { ru } from "./locales/ru";
import type { Translations } from "./types";

export type Locale = "en" | "uz" | "ru";

export const locales: Record<Locale, Translations> = {
  en,
  uz,
  ru,
};

export const defaultLocale: Locale = "uz";

export const localeNames: Record<Locale, string> = {
  en: "English",
  uz: "O'zbekcha",
  ru: "Русский",
};

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: unknown, path: string): string | undefined {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === "string" ? current : undefined;
}

/**
 * Get translation for a key
 */
export function getTranslation(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>
): string {
  const translations = locales[locale] || locales[defaultLocale];
  let value = getNestedValue(translations, key);

  if (!value) {
    // Fallback to English if key not found
    value = getNestedValue(locales.en, key);
  }

  if (!value) {
    // Return key if translation not found
    return key;
  }

  // Replace placeholders like {name} with actual values
  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      value = value!.replace(
        new RegExp(`\\{${paramKey}\\}`, "g"),
        String(paramValue)
      );
    });
  }

  return value;
}

export { en, uz, ru };
export type { Translations };
