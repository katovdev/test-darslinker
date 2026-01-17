/**
 * Tenant Detection Utility
 * Handles subdomain-based multi-tenancy for teacher subdomains
 *
 * Examples:
 * - ali.darslinker.uz → tenant = "ali" (teacher subdomain)
 * - app.darslinker.uz → tenant = null (main app)
 * - www.darslinker.uz → tenant = null (marketing site)
 * - localhost:3000?tenant=ali → tenant = "ali" (local dev)
 */

// Reserved subdomains that are not teacher subdomains
const RESERVED_SUBDOMAINS = [
  "www",
  "app",
  "api",
  "admin",
  "dashboard",
  "blog",
  "help",
  "support",
  "docs",
  "status",
  "mail",
  "cdn",
  "static",
  "assets",
  "images",
  "dev",
  "staging",
  "test",
  "demo",
  "beta",
];

/**
 * Get the current subdomain (teacher username)
 * Returns null if on main app or reserved subdomain
 */
export function getSubdomain(): string | null {
  if (typeof window === "undefined") return null;

  const host = window.location.hostname;

  // Handle localhost development - use query param
  if (host === "localhost" || host === "127.0.0.1") {
    const url = new URL(window.location.href);
    return url.searchParams.get("tenant");
  }

  // Handle IP addresses
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return null;
  }

  // Parse subdomain from hostname
  const parts = host.split(".");

  // Need at least 3 parts: subdomain.domain.tld
  if (parts.length >= 3) {
    const subdomain = parts[0].toLowerCase();

    // Check if it's a reserved subdomain
    if (RESERVED_SUBDOMAINS.includes(subdomain)) {
      return null;
    }

    return subdomain;
  }

  return null;
}

/**
 * Check if currently on a teacher subdomain
 */
export function isTeacherSubdomain(): boolean {
  return getSubdomain() !== null;
}

/**
 * Check if currently on the main app domain
 */
export function isMainApp(): boolean {
  if (typeof window === "undefined") return true;

  const host = window.location.hostname;

  // Localhost without tenant param is main app
  if (host === "localhost" || host === "127.0.0.1") {
    const url = new URL(window.location.href);
    return !url.searchParams.get("tenant");
  }

  const subdomain = getSubdomain();
  return subdomain === null;
}

/**
 * Build a URL for a specific teacher subdomain
 */
export function buildTeacherUrl(
  username: string,
  path: string = "/"
): string {
  if (typeof window === "undefined") return path;

  const host = window.location.hostname;

  // Localhost - use query param
  if (host === "localhost" || host === "127.0.0.1") {
    const port = window.location.port ? `:${window.location.port}` : "";
    return `${window.location.protocol}//${host}${port}${path}?tenant=${username}`;
  }

  // Production - use subdomain
  const parts = host.split(".");
  const baseDomain = parts.length >= 2 ? parts.slice(-2).join(".") : host;

  return `${window.location.protocol}//${username}.${baseDomain}${path}`;
}

/**
 * Build a URL for the main app
 */
export function buildMainAppUrl(path: string = "/"): string {
  if (typeof window === "undefined") return path;

  const host = window.location.hostname;

  // Localhost - remove tenant param
  if (host === "localhost" || host === "127.0.0.1") {
    const port = window.location.port ? `:${window.location.port}` : "";
    return `${window.location.protocol}//${host}${port}${path}`;
  }

  // Production - use app subdomain
  const parts = host.split(".");
  const baseDomain = parts.length >= 2 ? parts.slice(-2).join(".") : host;

  return `${window.location.protocol}//app.${baseDomain}${path}`;
}

export default {
  getSubdomain,
  isTeacherSubdomain,
  isMainApp,
  buildTeacherUrl,
  buildMainAppUrl,
  RESERVED_SUBDOMAINS,
};
