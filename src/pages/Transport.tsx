import { useState } from "react";
import { motion } from "framer-motion";
import { Car, Crosshair, Loader2, Plane, MapPin, Users, Clock, CheckCircle2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SectionHeading from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { toast } from "sonner";
import {
  DAR_LYS_LAT,
  DAR_LYS_LNG,
  RATE_PER_KM,
  haversineKm,
  geocodeAddress,
  reverseGeocode,
} from "@/lib/transport";

const Transport = () => {
  const [form, setForm] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    pickupAddress: "",
    pickupDate: "",
    pickupTime: "",
    passengers: 1,
    flightOrTrainNo: "",
    notes: "",
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [estimate, setEstimate] = useState<{ km: number; dh: number } | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const computeFromCoords = (lat: number, lng: number, label?: string) => {
    const km = haversineKm(lat, lng, DAR_LYS_LAT, DAR_LYS_LNG);
    setCoords({ lat, lng });
    setEstimate({ km, dh: km * RATE_PER_KM });
    if (label) setForm((f) => ({ ...f, pickupAddress: label }));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by this browser.");
      return;
    }
    setEstimating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const label = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        computeFromCoords(pos.coords.latitude, pos.coords.longitude, label);
        setEstimating(false);
      },
      (err) => {
        toast.error(err.message || "Unable to retrieve your location.");
        setEstimating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const estimateAddress = async () => {
    if (!form.pickupAddress.trim()) return;
    setEstimating(true);
    try {
      const r = await geocodeAddress(form.pickupAddress);
      if (!r) {
        toast.error("Address not found. Try a more specific search.");
        return;
      }
      computeFromCoords(r.lat, r.lng, r.label);
    } finally {
      setEstimating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.guestName || !form.guestEmail || !form.pickupAddress || !form.pickupDate || !form.pickupTime) {
      toast.error("Please fill in your contact, pickup address, and date/time.");
      return;
    }
    if (!estimate) {
      toast.error("Please estimate the distance first.");
      return;
    }
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const pickup = new Date(`${form.pickupDate}T${form.pickupTime}`);
      const { error } = await supabase.from("transport_bookings").insert({
        user_id: session?.user?.id ?? null,
        guest_name: form.guestName,
        guest_email: form.guestEmail,
        guest_phone: form.guestPhone || null,
        pickup_address: form.pickupAddress,
        pickup_lat: coords?.lat ?? null,
        pickup_lng: coords?.lng ?? null,
        pickup_datetime: pickup.toISOString(),
        distance_km: Number(estimate.km.toFixed(2)),
        estimated_fee_dh: Math.round(estimate.dh),
        passengers: form.passengers,
        flight_or_train_no: form.flightOrTrainNo || null,
        notes: form.notes || null,
        status: "pending",
      });
      if (error) throw error;
      toast.success("Transport request sent — the riad will confirm by email.");
      setDone(true);
    } catch (err: any) {
      toast.error(err.message || "Could not submit transport request.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-cream border border-border px-4 py-3 text-sm font-body text-charcoal focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors rounded-sm";
  const labelClass = "block text-xs tracking-[0.15em] uppercase font-body text-muted-foreground mb-2";
  const today = new Date().toISOString().split("T")[0];

  return (
    <Layout>
      <section className="relative h-[36vh] min-h-[260px] flex items-center justify-center overflow-hidden bg-charcoal">
        <div className="absolute inset-0 opacity-10 zellige-pattern" />
        <div className="relative z-10 text-center px-4">
          <p className="text-gold-light text-sm tracking-[0.4em] uppercase font-body mb-4">Concierge</p>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-cream">Private Driver & Transfer</h1>
          <div className="moroccan-divider mt-4" />
        </div>
      </section>

      <section className="section-padding bg-cream">
        <div className="container-luxury max-w-4xl">
          {done ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-cream-dark/30 border border-gold/40 p-10 text-center">
              <CheckCircle2 className="w-12 h-12 text-gold mx-auto mb-4" />
              <h2 className="font-display text-2xl text-charcoal mb-2">Request received</h2>
              <p className="text-sm text-muted-foreground font-body max-w-md mx-auto">
                Thank you {form.guestName}. Our concierge will confirm your private driver pickup shortly at {form.guestEmail}.
              </p>
              <Button onClick={() => { setDone(false); setForm({ ...form, pickupAddress: "", notes: "", flightOrTrainNo: "" }); setEstimate(null); setCoords(null); }} className="mt-6 rounded-none bg-gold hover:bg-gold-dark text-cream px-8">
                New request
              </Button>
            </motion.div>
          ) : (
            <>
              <SectionHeading
                subtitle="Book a transfer"
                title="Private driver pickup"
                description={`Get an instant estimate based on distance to Dar Lys, then send your request to our concierge. Flat rate ${RATE_PER_KM} DH / km.`}
              />

              <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6 mt-10">
                {/* Left: estimator */}
                <div className="lg:col-span-2 bg-cream border border-border p-6 lg:p-8 shadow-card space-y-5">
                  <h3 className="font-display text-lg text-charcoal flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gold" /> Pickup location
                  </h3>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button type="button" onClick={useMyLocation} disabled={estimating} className="bg-gold hover:bg-gold-dark text-cream rounded-none">
                      {estimating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Crosshair className="w-4 h-4 mr-2" />}
                      Use my location
                    </Button>
                  </div>

                  <div>
                    <label className={labelClass}>Pickup address *</label>
                    <div className="flex gap-2">
                      <Input
                        value={form.pickupAddress}
                        onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
                        placeholder="e.g. Fès-Saïss Airport, Terminal 1"
                        className="rounded-none border-border bg-cream"
                      />
                      <Button type="button" variant="outline" onClick={estimateAddress} disabled={estimating || !form.pickupAddress.trim()} className="rounded-none border-gold text-gold hover:bg-gold hover:text-cream shrink-0">
                        Estimate
                      </Button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Pickup date *</label>
                      <input type="date" min={today} value={form.pickupDate} onChange={(e) => setForm({ ...form, pickupDate: e.target.value })} className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Pickup time *</label>
                      <input type="time" value={form.pickupTime} onChange={(e) => setForm({ ...form, pickupTime: e.target.value })} className={inputClass} required />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Passengers</label>
                      <select value={form.passengers} onChange={(e) => setForm({ ...form, passengers: parseInt(e.target.value) })} className={inputClass}>
                        {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Flight / train no.</label>
                      <input type="text" value={form.flightOrTrainNo} onChange={(e) => setForm({ ...form, flightOrTrainNo: e.target.value })} className={inputClass} placeholder="AT201, ONCF…" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Your name *</label>
                      <input type="text" value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} className={inputClass} required maxLength={100} />
                    </div>
                    <div>
                      <label className={labelClass}>Email *</label>
                      <input type="email" value={form.guestEmail} onChange={(e) => setForm({ ...form, guestEmail: e.target.value })} className={inputClass} required maxLength={255} />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Phone</label>
                    <input type="tel" value={form.guestPhone} onChange={(e) => setForm({ ...form, guestPhone: e.target.value })} className={inputClass} maxLength={20} />
                  </div>

                  <div>
                    <label className={labelClass}>Notes</label>
                    <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${inputClass} resize-none`} maxLength={500} placeholder="Luggage, child seat, language preference…" />
                  </div>
                </div>

                {/* Right: summary */}
                <aside className="bg-charcoal text-cream p-6 lg:p-8 shadow-card flex flex-col">
                  <h3 className="font-display text-lg text-gold flex items-center gap-2 mb-6">
                    <Car className="w-5 h-5" /> Estimate
                  </h3>
                  {estimate ? (
                    <div className="space-y-5 flex-1">
                      <div>
                        <p className="text-[11px] tracking-widest uppercase text-cream/60 mb-1">Distance</p>
                        <p className="text-3xl font-display font-semibold">{estimate.km.toFixed(1)} <span className="text-base text-cream/70">km</span></p>
                      </div>
                      <div>
                        <p className="text-[11px] tracking-widest uppercase text-cream/60 mb-1">Estimated fee</p>
                        <p className="text-4xl font-display font-semibold text-gold">{Math.round(estimate.dh)} <span className="text-base text-cream/70">DH</span></p>
                      </div>
                      <div className="text-xs text-cream/55 font-body border-t border-cream/10 pt-4 space-y-1">
                        <p className="flex items-center gap-2"><Clock className="w-3 h-3 text-gold" /> {form.pickupDate || "—"} {form.pickupTime}</p>
                        <p className="flex items-center gap-2"><Users className="w-3 h-3 text-gold" /> {form.passengers} passenger{form.passengers>1?"s":""}</p>
                        <p className="flex items-center gap-2"><Plane className="w-3 h-3 text-gold" /> {form.flightOrTrainNo || "no flight"}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="flex-1 text-sm text-cream/55 font-body">
                      Enter your pickup address or share your location to see an instant fare estimate.
                    </p>
                  )}

                  <Button type="submit" disabled={submitting || !estimate} className="mt-6 bg-gold hover:bg-gold-dark text-cream rounded-none w-full">
                    {submitting ? "Sending…" : "Send transport request"}
                  </Button>
                  <p className="mt-3 text-[11px] text-cream/45 font-body">
                    No charge online — concierge will confirm the route and final fare.
                  </p>
                </aside>
              </form>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Transport;