// Default tenant for the platform's apex domain (Dar Lys)
export const DEFAULT_TENANT_SLUG = "dar-lys";
export const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-00000000da75";

const APEX_HOSTS = new Set([
  "darlys.site",
  "www.darlys.site",
  "darlysv2.lovable.app",
  "localhost",
  "127.0.0.1",
]);

/**
 * Resolve the active tenant slug from:
 * 1. `?tenant=slug` query param (preview / impersonation)
 * 2. Subdomain (e.g. riad-x.darlys.site)
 * 3. Default → "dar-lys"
 */
export function resolveTenantSlug(): string {
  if (typeof window === "undefined") return DEFAULT_TENANT_SLUG;

  const params = new URLSearchParams(window.location.search);
  const qp = params.get("tenant");
  if (qp) return qp.toLowerCase();

  const host = window.location.hostname.toLowerCase();
  if (APEX_HOSTS.has(host)) return DEFAULT_TENANT_SLUG;

  // strip lovable preview prefixes
  if (host.endsWith(".lovable.app")) {
    // id-preview--<id>.lovable.app or <project>.lovable.app → apex
    return DEFAULT_TENANT_SLUG;
  }

  const parts = host.split(".");
  if (parts.length >= 3) {
    // subdomain.darlys.site → "subdomain"
    const sub = parts[0];
    if (sub && sub !== "www") return sub;
  }
  return DEFAULT_TENANT_SLUG;
}