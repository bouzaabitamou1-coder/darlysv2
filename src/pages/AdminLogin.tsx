import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";
import { Lock } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

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
      navigate("/admin");
    }
  };

  return (
    <Layout>
      <section className="min-h-[80vh] flex items-center justify-center bg-cream pt-24 pb-16">
        <div className="w-full max-w-md px-4">
          <div className="bg-cream-dark p-8 lg:p-10">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-gold/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-gold" />
              </div>
              <h1 className="text-2xl font-display font-bold text-charcoal">Admin Login</h1>
              <p className="text-sm text-muted-foreground font-body mt-2">Sign in to access the dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs tracking-[0.15em] uppercase font-body text-charcoal-light mb-2">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-cream border border-border px-4 py-3 text-sm font-body text-charcoal focus:outline-none focus:border-gold transition-colors" required />
              </div>
              <div>
                <label htmlFor="password" className="block text-xs tracking-[0.15em] uppercase font-body text-charcoal-light mb-2">Password</label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-cream border border-border px-4 py-3 text-sm font-body text-charcoal focus:outline-none focus:border-gold transition-colors" required />
              </div>
              <button type="submit" disabled={loading} className="btn-luxury w-full disabled:opacity-50">
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AdminLogin;
