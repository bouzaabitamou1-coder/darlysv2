import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, CheckCircle2, Loader2, Sparkles, ImagePlus, X } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { toast } from "sonner";

type RatingKey = "overall" | "cleanliness" | "service" | "comfort" | "food";

const categories: { key: RatingKey; label: string; hint: string }[] = [
  { key: "overall", label: "Overall experience", hint: "How would you summarise your stay?" },
  { key: "cleanliness", label: "Cleanliness", hint: "Room and common spaces" },
  { key: "service", label: "Service & staff", hint: "Concierge, housekeeping, reception" },
  { key: "comfort", label: "Comfort", hint: "Bed, ambience, quiet" },
  { key: "food", label: "Restaurant & breakfast", hint: "Optional if you didn't dine with us" },
];

const Stars = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        aria-label={`${n} star${n > 1 ? "s" : ""}`}
        className="transition-transform hover:scale-110"
      >
        <Star
          className={`w-7 h-7 ${n <= value ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
        />
      </button>
    ))}
  </div>
);

const StaySurvey = () => {
  const { tenant } = useTenant();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking") || null;

  const [form, setForm] = useState({
    guestName: "",
    guestEmail: "",
    overall: 0,
    cleanliness: 0,
    service: 0,
    comfort: 0,
    food: 0,
    wouldRecommend: null as boolean | null,
    comments: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Please choose an image file."); return; }
    if (f.size > 8 * 1024 * 1024) { toast.error("Image must be under 8MB."); return; }
    setPhotoFile(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const clearPhoto = () => { setPhotoFile(null); setPhotoPreview(null); };

  const setRating = (key: RatingKey, n: number) => setForm((f) => ({ ...f, [key]: n }));

  const submit = async () => {
    if (!form.guestEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guestEmail)) {
      toast.error("Please enter a valid email so we can recognise your stay.");
      return;
    }
    if (!form.overall) {
      toast.error("Please rate your overall experience.");
      return;
    }
    setSubmitting(true);
    try {
      let photo_url: string | null = null;
      if (photoFile) {
        const ext = photoFile.name.split(".").pop() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("survey-photos").upload(path, photoFile, {
          contentType: photoFile.type,
          upsert: false,
        });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("survey-photos").getPublicUrl(path);
        photo_url = pub.publicUrl;
      }
      const { error } = await supabase.from("stay_surveys").insert({
        tenant_id: tenant.id,
        booking_id: bookingId,
        guest_name: form.guestName || null,
        guest_email: form.guestEmail.trim(),
        overall_rating: form.overall,
        cleanliness: form.cleanliness || null,
        service: form.service || null,
        comfort: form.comfort || null,
        food: form.food || null,
        would_recommend: form.wouldRecommend,
        comments: form.comments || null,
        photo_url,
      });
      if (error) throw error;
      setDone(true);
    } catch (e: any) {
      toast.error(e.message || "Could not send your feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="min-h-screen bg-background pt-28 pb-16">
        <div className="container-luxury px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 text-sm tracking-[0.3em] uppercase font-body text-primary mb-3">
                <Sparkles className="w-4 h-4" /> Guest Feedback
              </span>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">How was your stay?</h1>
              <div className="moroccan-divider mt-4" />
              <p className="text-muted-foreground font-body mt-4">
                A few moments to share your impressions. Your honest words help us refine every detail at Dar Lys.
              </p>
            </div>

            {done ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-lg p-10 text-center"
              >
                <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-display font-semibold text-foreground mb-3">Shukran 🙏</h2>
                <p className="text-muted-foreground font-body mb-6">
                  Your feedback was received with gratitude. We can't wait to welcome you back.
                </p>
                <Link to="/"><Button>Return Home</Button></Link>
              </motion.div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-6 sm:p-10 space-y-8">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase font-body text-muted-foreground mb-2">Your name</label>
                    <input
                      type="text"
                      value={form.guestName}
                      onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                      maxLength={120}
                      className="w-full bg-background border border-border px-4 py-3 text-sm font-body rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase font-body text-muted-foreground mb-2">Email *</label>
                    <input
                      type="email"
                      value={form.guestEmail}
                      onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
                      maxLength={255}
                      required
                      className="w-full bg-background border border-border px-4 py-3 text-sm font-body rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  {categories.map((c) => (
                    <div key={c.key} className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-b-0">
                      <div>
                        <p className="font-display text-foreground">{c.label}{c.key === "overall" ? " *" : ""}</p>
                        <p className="text-xs text-muted-foreground font-body">{c.hint}</p>
                      </div>
                      <Stars value={form[c.key]} onChange={(n) => setRating(c.key, n)} />
                    </div>
                  ))}
                </div>

                <div>
                  <p className="font-display text-foreground mb-3">Would you recommend Dar Lys?</p>
                  <div className="flex gap-3">
                    {[
                      { v: true, label: "Yes, absolutely" },
                      { v: false, label: "Not really" },
                    ].map((o) => (
                      <button
                        key={String(o.v)}
                        type="button"
                        onClick={() => setForm({ ...form, wouldRecommend: o.v })}
                        className={`px-5 py-2.5 rounded-md text-sm font-body border transition-colors ${
                          form.wouldRecommend === o.v
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground border-border hover:border-primary"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs tracking-[0.15em] uppercase font-body text-muted-foreground mb-2">Comments</label>
                  <textarea
                    rows={5}
                    value={form.comments}
                    onChange={(e) => setForm({ ...form, comments: e.target.value })}
                    maxLength={2000}
                    placeholder="Tell us what enchanted you, and what we can improve."
                    className="w-full bg-background border border-border px-4 py-3 text-sm font-body rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs tracking-[0.15em] uppercase font-body text-muted-foreground mb-2">
                    Add a photo (optional)
                  </label>
                  {photoPreview ? (
                    <div className="relative inline-block">
                      <img src={photoPreview} alt="Preview" className="max-h-56 rounded-md border border-border" />
                      <button
                        type="button"
                        onClick={clearPhoto}
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-background border border-border shadow flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        aria-label="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-border hover:border-primary rounded-md py-8 px-4 text-muted-foreground hover:text-primary transition-colors">
                      <ImagePlus className="w-7 h-7" />
                      <span className="text-sm font-body">Click to upload a photo of your stay</span>
                      <span className="text-xs opacity-70">JPG / PNG — up to 8MB</span>
                      <input type="file" accept="image/*" onChange={onPhotoChange} className="hidden" />
                    </label>
                  )}
                </div>

                <Button onClick={submit} disabled={submitting} className="w-full" size="lg">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending…</> : "Send my feedback"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default StaySurvey;