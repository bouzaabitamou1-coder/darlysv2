import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";
import { BarChart3, Lock, ShieldCheck, Sparkles } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [justSignedIn, setJustSignedIn] = useState(false);
  const { signIn, isAdmin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (justSignedIn && isAdmin) {
      navigate("/admin");
    }
  }, [justSignedIn, isAdmin, navigate]);

  // If already logged in as admin, redirect
  useEffect(() => {
    if (user && isAdmin) {
      navigate("/admin");
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error("Invalid credentials. Please try again.");
    } else {
      toast.success("Welcome back!");
      setJustSignedIn(true);
    }
  };

  return (
    <Layout>
      <section className="min-h-screen bg-charcoal pt-28 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 zellige-pattern" />
        <div className="container-luxury px-4 relative z-10">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] min-h-[72vh] border border-gold/20 bg-charcoal-light/30 shadow-elevated">
            <div className="hidden lg:flex flex-col justify-between p-10 xl:p-12 border-r border-gold/20">
              <div>
                <p className="text-gold-light text-xs tracking-[0.35em] uppercase font-body mb-6">Dar Lys Control Center</p>
                <h1 className="text-4xl xl:text-5xl font-display font-bold text-cream leading-tight max-w-lg">
                  Secure access for reservations, transport, and revenue operations.
                </h1>
              </div>
              <div className="grid gap-4 max-w-lg">
                {[
                  { icon: BarChart3, title: "Live operations", text: "Bookings, transport requests, and payment status in one professional workspace." },
                  { icon: ShieldCheck, title: "Protected area", text: "Admin privileges are checked securely before opening the dashboard." },
                  { icon: Sparkles, title: "Presentation ready", text: "A distinct back-office identity separate from the guest website." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 p-4 border border-cream/10 bg-cream/5">
                    <item.icon className="w-5 h-5 text-gold shrink-0 mt-1" />
                    <div>
                      <p className="font-display text-cream font-semibold">{item.title}</p>
                      <p className="text-sm text-cream/55 font-body mt-1 leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center p-6 sm:p-10">
              <div className="w-full max-w-md bg-cream p-8 lg:p-10 shadow-elevated">
                <div className="mb-8">
                  <div className="w-14 h-14 bg-gold/10 flex items-center justify-center mb-5">
                    <Lock className="w-7 h-7 text-gold" />
                  </div>
                  <p className="text-xs tracking-[0.25em] uppercase font-body text-gold mb-2">Admin Portal</p>
                  <h2 className="text-3xl font-display font-bold text-charcoal">Welcome back</h2>
                  <p className="text-sm text-muted-foreground font-body mt-2">Sign in to open the Dar Lys management dashboard.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-xs tracking-[0.15em] uppercase font-body text-charcoal-light mb-2">Email</label>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-background border border-border px-4 py-3 text-sm font-body text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors" required />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-xs tracking-[0.15em] uppercase font-body text-charcoal-light mb-2">Password</label>
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-background border border-border px-4 py-3 text-sm font-body text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-colors" required />
                  </div>
                  <button type="submit" disabled={loading} className="btn-luxury w-full disabled:opacity-50 h-12">
                    {loading ? "Signing in..." : "Enter Dashboard"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AdminLogin;
