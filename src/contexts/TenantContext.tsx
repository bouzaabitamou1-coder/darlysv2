import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resolveTenantSlug, DEFAULT_TENANT_SLUG, DEFAULT_TENANT_ID } from "@/lib/tenant";

export type Tenant = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  images: string[];
  contact_email: string | null;
  phone: string | null;
  address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  logo_url: string | null;
  primary_color: string | null;
  accent_color: string | null;
  font_display: string | null;
  font_body: string | null;
  concierge_name: string | null;
  concierge_persona: string | null;
  faq: string | null;
  driver_rate_per_km: number | null;
  default_currency: string | null;
  allowed_origins: string[] | null;
  is_active: boolean;
};

const FALLBACK_TENANT: Tenant = {
  id: DEFAULT_TENANT_ID,
  slug: DEFAULT_TENANT_SLUG,
  name: "Dar Lys",
  description: null,
  images: [],
  contact_email: null, phone: null, address: null,
  location_lat: 34.0625, location_lng: -4.9745,
  logo_url: null,
  primary_color: "#1e3a5f", accent_color: "#c9a84c",
  font_display: "Playfair Display", font_body: "Cormorant Garamond",
  concierge_name: "Lys", concierge_persona: null, faq: null,
  driver_rate_per_km: 10, default_currency: "MAD",
  allowed_origins: [], is_active: true,
};

type Ctx = { tenant: Tenant; loading: boolean; slug: string };
const TenantContext = createContext<Ctx>({ tenant: FALLBACK_TENANT, loading: true, slug: DEFAULT_TENANT_SLUG });

function hexToHsl(hex: string): string | null {
  const m = hex.trim().replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(m)) return null;
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return `${h.toFixed(0)} ${(s * 100).toFixed(0)}% ${(l * 100).toFixed(0)}%`;
}

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const [tenant, setTenant] = useState<Tenant>(FALLBACK_TENANT);
  const [loading, setLoading] = useState(true);
  const slug = resolveTenantSlug();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("public_tenants")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (!cancelled) {
        setTenant(({ ...FALLBACK_TENANT, ...(data ?? {}) } as Tenant));
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  // Apply branding via CSS variables at the root
  useEffect(() => {
    const root = document.documentElement;
    if (tenant.primary_color) {
      const hsl = hexToHsl(tenant.primary_color);
      if (hsl) root.style.setProperty("--tenant-primary", hsl);
    }
    if (tenant.accent_color) {
      const hsl = hexToHsl(tenant.accent_color);
      if (hsl) root.style.setProperty("--tenant-accent", hsl);
    }
    if (tenant.name) document.title = tenant.name;
  }, [tenant]);

  return (
    <TenantContext.Provider value={{ tenant, loading, slug }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);