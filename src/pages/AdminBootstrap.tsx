import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

const AdminBootstrap = () => {
  const [email, setEmail] = useState("admin@darlys.ma");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters.");
    if (password !== confirm) return toast.error("Passwords don't match.");
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-bootstrap", {
      body: { email, password, displayName: "Admin" },
    });
    setLoading(false);
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error || error?.message || "Bootstrap failed");
      return;
    }
    toast.success("Admin ready. You can sign in now.");
    navigate("/admin/login");
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-charcoal py-16">
        <div className="w-full max-w-md px-4">
          <div className="bg-charcoal-light/40 border border-gold/20 p-8 lg:p-10">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-gold/10 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-7 h-7 text-gold" />
              </div>
              <h1 className="text-2xl font-display font-bold text-cream">Admin Bootstrap</h1>
              <p className="text-sm text-cream/60 font-body mt-2">
                Create or reset the admin credentials. Requires the bootstrap secret stored in the backend.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Field label="Admin Email" type="email" value={email} onChange={setEmail} />
              <Field label="New Password" type="password" value={password} onChange={setPassword} />
              <Field label="Confirm Password" type="password" value={confirm} onChange={setConfirm} />
              <button type="submit" disabled={loading} className="btn-luxury w-full disabled:opacity-50">
                {loading ? "Working..." : "Create / Reset Admin"}
              </button>
            </form>
          </div>
        </div>
    </section>
  );
};

const Field = ({ label, type, value, onChange }: { label: string; type: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <label className="block text-xs tracking-[0.15em] uppercase font-body text-charcoal-light mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-cream border border-border px-4 py-3 text-sm font-body text-charcoal focus:outline-none focus:border-gold transition-colors"
      required
    />
  </div>
);

export default AdminBootstrap;