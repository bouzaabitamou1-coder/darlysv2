import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, Plus, ExternalLink } from "lucide-react";

type Tenant = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  images: string[] | null;
  contact_email: string | null;
  primary_color: string | null;
  accent_color: string | null;
  is_active: boolean;
  allowed_origins: string[] | null;
  allow_cross_recommendations: boolean | null;
};

const SuperAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const [isSuper, setIsSuper] = useState<boolean | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [form, setForm] = useState({
    slug: "",
    name: "",
    description: "",
    images: "",
    contact_email: "",
    primary_color: "#1e3a5f",
    accent_color: "#c9a84c",
    allowed_origins: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!user) { setIsSuper(false); return; }
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      setIsSuper(!!data?.some((r) => r.role === "super_admin"));
    })();
  }, [user]);

  const loadTenants = async () => {
    const { data } = await supabase
      .from("tenants")
      .select("id, slug, name, description, images, contact_email, primary_color, accent_color, is_active, allowed_origins, allow_cross_recommendations")
      .order("created_at", { ascending: false });
    setTenants((data as Tenant[]) ?? []);
  };

  const toggleCrossRecs = async (t: Tenant) => {
    const next = !t.allow_cross_recommendations;
    const { error } = await supabase
      .from("tenants")
      .update({ allow_cross_recommendations: next })
      .eq("id", t.id);
    if (error) { toast.error(error.message); return; }
    toast.success(next ? "Cross recommendations ON" : "Cross recommendations OFF");
    loadTenants();
  };

  useEffect(() => { if (isSuper) loadTenants(); }, [isSuper]);

  if (authLoading || isSuper === null) return <div className="p-8">Loading…</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isSuper) return <div className="p-8">Access denied — super admin only.</div>;

  const createTenant = async () => {
    if (!form.slug.trim() || !form.name.trim()) {
      toast.error("Slug and name are required.");
      return;
    }
    setCreating(true);
    const origins = form.allowed_origins
      .split(",").map((s) => s.trim()).filter(Boolean);
    const images = form.images
      .split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
    const { error } = await supabase.from("tenants").insert({
      slug: form.slug.trim().toLowerCase(),
      name: form.name.trim(),
      description: form.description.trim() || null,
      images,
      contact_email: form.contact_email || null,
      primary_color: form.primary_color,
      accent_color: form.accent_color,
      allowed_origins: origins,
    });
    setCreating(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Property created");
    setForm({ slug: "", name: "", description: "", images: "", contact_email: "", primary_color: "#1e3a5f", accent_color: "#c9a84c", allowed_origins: "" });
    loadTenants();
  };

  const embedSnippet = (slug: string) =>
    `<script src="${window.location.origin}/embed/concierge.js" data-tenant="${slug}" async></script>`;

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-display">Super Admin · Properties</h1>
        <p className="text-sm text-muted-foreground">Manage hotels & riads on the platform.</p>
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-display flex items-center gap-2"><Plus className="w-5 h-5" /> Create property</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Slug *</Label>
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="riad-zahra" />
          </div>
          <div>
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Riad Zahra" />
          </div>
          <div>
            <Label>Contact email</Label>
            <Input value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
          </div>
          <div>
            <Label>Allowed origins (comma-separated)</Label>
            <Input value={form.allowed_origins} onChange={(e) => setForm({ ...form, allowed_origins: e.target.value })} placeholder="https://riadzahra.com" />
          </div>
          <div className="sm:col-span-2">
            <Label>Description</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short tagline shown on the public site" />
          </div>
          <div className="sm:col-span-2">
            <Label>Image URLs (comma or newline-separated)</Label>
            <Input value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="https://…/hero.jpg, https://…/courtyard.jpg" />
          </div>
          <div>
            <Label>Primary color</Label>
            <Input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} />
          </div>
          <div>
            <Label>Accent color</Label>
            <Input type="color" value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} />
          </div>
        </div>
        <Button onClick={createTenant} disabled={creating}>Create property</Button>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-display">Properties ({tenants.length})</h2>
        {tenants.map((t) => (
          <Card key={t.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.slug} · {t.contact_email ?? "—"}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border" style={{ background: t.primary_color ?? "#000" }} />
                <div className="w-6 h-6 rounded border" style={{ background: t.accent_color ?? "#000" }} />
                <a href={`/?tenant=${t.slug}`} target="_blank" rel="noreferrer" className="text-xs underline flex items-center gap-1">
                  Preview <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <div className="bg-muted p-2 rounded text-xs font-mono break-all flex items-start gap-2">
              <code className="flex-1">{embedSnippet(t.slug)}</code>
              <button onClick={() => copy(embedSnippet(t.slug))} className="shrink-0 p-1 hover:text-primary">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SuperAdmin;