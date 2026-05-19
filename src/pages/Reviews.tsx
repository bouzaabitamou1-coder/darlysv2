import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Sparkles, Quote } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/i18n/LanguageContext";

type Survey = {
  id: string;
  guest_name: string | null;
  overall_rating: number;
  cleanliness: number | null;
  service: number | null;
  comfort: number | null;
  food: number | null;
  would_recommend: boolean | null;
  comments: string | null;
  photo_url: string | null;
  created_at: string;
};

const Stars = ({ value }: { value: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} className={`w-4 h-4 ${n <= value ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
    ))}
  </div>
);

const Reviews = () => {
  const { formatDate } = useLanguage();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("public_stay_surveys")
      .select("id, guest_name, overall_rating, cleanliness, service, comfort, food, would_recommend, comments, photo_url, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setSurveys((data as Survey[]) || []);
        setLoading(false);
      });
  }, []);

  const avg = surveys.length
    ? surveys.reduce((s, x) => s + x.overall_rating, 0) / surveys.length
    : 0;
  const recommendRate = surveys.length
    ? Math.round((surveys.filter((s) => s.would_recommend).length / surveys.length) * 100)
    : 0;

  return (
    <Layout>
      <section className="min-h-screen bg-background pt-28 pb-16">
        <div className="container-luxury px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 text-sm tracking-[0.3em] uppercase font-body text-primary mb-3">
                <Sparkles className="w-4 h-4" /> Guest Reviews
              </span>
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground">What our guests say</h1>
              <div className="moroccan-divider mt-4 mx-auto" />
              <p className="text-muted-foreground font-body mt-4 max-w-xl mx-auto">
                Honest impressions from travellers who shared their stay at Dar Lys.
              </p>
            </div>

            {surveys.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
                <div className="text-center p-5 bg-card border border-border rounded-lg">
                  <p className="text-3xl font-display font-bold text-primary">{avg.toFixed(1)}</p>
                  <Stars value={Math.round(avg)} />
                  <p className="text-xs text-muted-foreground mt-1">Average rating</p>
                </div>
                <div className="text-center p-5 bg-card border border-border rounded-lg">
                  <p className="text-3xl font-display font-bold text-primary">{surveys.length}</p>
                  <p className="text-xs text-muted-foreground mt-3">Reviews</p>
                </div>
                <div className="text-center p-5 bg-card border border-border rounded-lg">
                  <p className="text-3xl font-display font-bold text-primary">{recommendRate}%</p>
                  <p className="text-xs text-muted-foreground mt-3">Would recommend</p>
                </div>
              </div>
            )}

            <div className="flex justify-center mb-10">
              <Link to="/feedback">
                <Button className="gap-2"><Star className="w-4 h-4" /> Share your experience</Button>
              </Link>
            </div>

            {loading ? (
              <p className="text-center text-muted-foreground">Loading reviews...</p>
            ) : surveys.length === 0 ? (
              <p className="text-center text-muted-foreground italic">No reviews yet — be the first to share yours.</p>
            ) : (
              <div className="space-y-5">
                {surveys.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card border border-border rounded-lg p-6 relative"
                  >
                    <Quote className="absolute top-4 right-4 w-6 h-6 text-primary/20" />
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div>
                        <p className="font-display font-semibold text-foreground">{s.guest_name || "Anonymous guest"}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(s.created_at)}</p>
                      </div>
                      <Stars value={s.overall_rating} />
                    </div>
                    {s.comments && (
                      <p className="text-sm text-foreground/80 italic font-body leading-relaxed mb-3">"{s.comments}"</p>
                    )}
                    {s.photo_url && (
                      <a href={s.photo_url} target="_blank" rel="noopener noreferrer" className="block mb-3">
                        <img
                          src={s.photo_url}
                          alt={`Photo shared by ${s.guest_name || "guest"}`}
                          loading="lazy"
                          className="max-h-80 w-auto rounded-md border border-border hover:opacity-90 transition-opacity"
                        />
                      </a>
                    )}
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      {[
                        ["Cleanliness", s.cleanliness],
                        ["Service", s.service],
                        ["Comfort", s.comfort],
                        ["Food", s.food],
                      ].filter(([, v]) => v).map(([k, v]) => (
                        <span key={k as string} className="px-2 py-1 bg-primary/5 border border-primary/15 rounded text-muted-foreground">
                          {k}: <span className="text-foreground font-medium">{v}/5</span>
                        </span>
                      ))}
                      {s.would_recommend && (
                        <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-700 dark:text-emerald-400">
                          Recommends Dar Lys
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Reviews;