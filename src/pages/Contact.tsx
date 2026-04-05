import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import SectionHeading from "@/components/ui/SectionHeading";
import { photo } from "@/data/siteMedia";
import { toast } from "sonner";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.7 },
};

type ContactLocationState = { subject?: string; body?: string };

const Contact = () => {
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const s = location.state as ContactLocationState | null | undefined;
    if (!s?.subject && !s?.body) return;
    setForm((f) => ({
      ...f,
      ...(s.subject ? { subject: s.subject } : {}),
      ...(s.body ? { message: s.body } : {}),
    }));
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim() || null,
      message: form.message.trim(),
    });
    setSending(false);
    if (error) {
      toast.error("Failed to send message. Please try again.");
    } else {
      toast.success("Thank you! Your message has been sent successfully.");
      setForm({ name: "", email: "", subject: "", message: "" });
    }
  };

  return (
    <Layout>
      <section className="relative h-[50vh] min-h-[350px] flex items-center justify-center overflow-hidden">
        <img src={photo.heroMain} alt="Dar Lys" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
        <div className="overlay-dark" />
        <div className="relative z-10 text-center px-4">
          <p className="text-gold-light text-sm tracking-[0.4em] uppercase font-body mb-4">Get in Touch</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-cream">Contact Us</h1>
        </div>
      </section>

      <section className="section-padding bg-cream">
        <div className="container-luxury">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <motion.div {...fadeUp}>
              <span className="text-sm tracking-[0.3em] uppercase font-body text-gold block mb-3">Reach Out</span>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-charcoal mb-6">We'd Love to Hear From You</h2>
              <div className="moroccan-divider !mx-0 mb-8" />

              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gold/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-charcoal mb-1">Address</h4>
                    <p className="text-sm text-muted-foreground font-body">13 Derb Bennis, Douh<br />Fès Medina 30110, Morocco</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gold/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-charcoal mb-1">Phone</h4>
                    <a href="tel:+212535555555" className="text-sm text-muted-foreground font-body hover:text-gold transition-colors">+212 5 35 55 55 55</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gold/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-charcoal mb-1">Email</h4>
                    <a href="mailto:contact@darlys.com" className="text-sm text-muted-foreground font-body hover:text-gold transition-colors">contact@darlys.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gold/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-charcoal mb-1">Reception</h4>
                    <p className="text-sm text-muted-foreground font-body">24/7 — We're always here for you</p>
                  </div>
                </div>
              </div>

              <div className="aspect-video w-full bg-cream-dark overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.0!2d-4.9778!3d34.0617!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDAzJzQyLjEiTiA0wrA1OCczOS44Ilc!5e0!3m2!1sen!2sma!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Dar Lys location map"
                />
              </div>
            </motion.div>

            <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.7 }}>
              <form onSubmit={handleSubmit} className="bg-cream-dark p-8 lg:p-10 space-y-6">
                <h3 className="text-2xl font-display font-semibold text-charcoal mb-2">Send a Message</h3>
                <p className="text-sm text-muted-foreground font-body mb-6">Fill in the form below and we'll get back to you within 24 hours.</p>

                <div>
                  <label htmlFor="name" className="block text-xs tracking-[0.15em] uppercase font-body text-charcoal-light mb-2">Name *</label>
                  <input id="name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-cream border border-border px-4 py-3 text-sm font-body text-charcoal focus:outline-none focus:border-gold transition-colors" required maxLength={100} />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs tracking-[0.15em] uppercase font-body text-charcoal-light mb-2">Email *</label>
                  <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-cream border border-border px-4 py-3 text-sm font-body text-charcoal focus:outline-none focus:border-gold transition-colors" required maxLength={255} />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-xs tracking-[0.15em] uppercase font-body text-charcoal-light mb-2">Subject</label>
                  <input id="subject" type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full bg-cream border border-border px-4 py-3 text-sm font-body text-charcoal focus:outline-none focus:border-gold transition-colors" maxLength={200} />
                </div>
                <div>
                  <label htmlFor="message" className="block text-xs tracking-[0.15em] uppercase font-body text-charcoal-light mb-2">Message *</label>
                  <textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full bg-cream border border-border px-4 py-3 text-sm font-body text-charcoal focus:outline-none focus:border-gold transition-colors resize-none" required maxLength={1000} />
                </div>
                <button type="submit" disabled={sending} className="btn-luxury w-full flex items-center justify-center gap-2 disabled:opacity-50">
                  {sending ? "Sending..." : <><Send className="w-4 h-4" /> Send Message</>}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
