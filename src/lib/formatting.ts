/**
 * Formatting utilities for consistent data presentation across the app
 */

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - Currency code (default: "UZS")
 * @param locale - Locale for formatting (default: "uz-UZ")
 */
export function formatCurrency(
  amount: number,
  currency: string = "UZS",
  locale: string = "uz-UZ"
): string {
  return new Intl.NumberFormat(locale).format(amount) + " " + currency;
}

/**
 * Format a number with thousand separators
 * @param num - The number to format
 * @param locale - Locale for formatting (default: "uz-UZ")
 */
export function formatNumber(num: number, locale: string = "uz-UZ"): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format a date to a localized string
 * @param date - Date string or Date object
 * @param options - Intl.DateTimeFormatOptions
 * @param locale - Locale for formatting (default: "uz-UZ")
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  },
  locale: string = "uz-UZ"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Format a date to a short format (e.g., "Jan 15, 2024")
 * @param date - Date string or Date object
 * @param locale - Locale for formatting (default: "uz-UZ")
 */
export function formatShortDate(
  date: string | Date,
  locale: string = "uz-UZ"
): string {
  return formatDate(
    date,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
    locale
  );
}

/**
 * Format a date to include time (e.g., "Jan 15, 2024, 14:30")
 * @param date - Date string or Date object
 * @param locale - Locale for formatting (default: "uz-UZ")
 */
export function formatDateTime(
  date: string | Date,
  locale: string = "uz-UZ"
): string {
  return formatDate(
    date,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
    locale
  );
}

/**
 * Format a date as relative time (e.g., "2 hours ago", "3 days ago")
 * @param date - Date string or Date object
 */
export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  // Future dates
  if (diffInSeconds < 0) {
    return formatShortDate(dateObj);
  }

  // Less than a minute ago
  if (diffInSeconds < 60) {
    return "just now";
  }

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      const suffix = interval === 1 ? "" : "s";
      return `${interval} ${unit}${suffix} ago`;
    }
  }

  return formatShortDate(dateObj);
}

/**
 * Format bytes to human readable format
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Format a duration in minutes to human readable format
 * @param minutes - Duration in minutes
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format a percentage
 * @param value - The value (0-100 or 0-1)
 * @param decimals - Number of decimal places (default: 0)
 * @param isDecimal - If true, value is treated as 0-1 range
 */
export function formatPercentage(
  value: number,
  decimals: number = 0,
  isDecimal: boolean = false
): string {
  const percentage = isDecimal ? value * 100 : value;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length (default: 50)
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Format a phone number (Uzbek format)
 * @param phone - Phone number string
 */
export function formatPhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "");

  // Format as +998 XX XXX XX XX
  if (digits.length === 12 && digits.startsWith("998")) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
  }

  // Return original if doesn't match expected format
  return phone;
}
