import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Users, CreditCard, ChevronRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const addOns = [
  { id: "breakfast", label: "Extra Breakfast", price: 15 },
  { id: "spa", label: "Spa Treatment", price: 70 },
  { id: "transfer", label: "Airport Transfer", price: 25 },
  { id: "late-checkout", label: "Late Check-out", price: 30 },
  { id: "romantic", label: "Romantic Setup", price: 50 },
];

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const roomSlug = searchParams.get("room") || "";
  const navigate = useNavigate();

  const [form, setForm] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    checkIn: "",
    checkOut: "",
    numGuests: 1,
    specialRequests: "",
    selectedAddOns: [] as string[],
  });
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Load room data
  useEffect(() => {
    if (roomSlug) {
      supabase.from("rooms").select("*").eq("slug", roomSlug).single().then(({ data }) => {
        if (data) setRoom(data);
      });
    } else {
      // Try loading by ID (from query param)
      const roomId = searchParams.get("room");
      if (roomId) {
        supabase.from("rooms").select("*").eq("id", roomId).single().then(({ data }) => {
          if (data) setRoom(data);
        });
      }
    }
  }, [roomSlug]);

  const nights = form.checkIn && form.checkOut
    ? Math.max(1, Math.ceil((new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const addOnTotal = form.selectedAddOns.reduce((sum, id) => {
    const addon = addOns.find((a) => a.id === id);
    return sum + (addon?.price || 0);
  }, 0);

  const totalPrice = room ? (Number(room.price_per_night) * nights) + addOnTotal : 0;

  const toggleAddOn = (id: string) => {
    setForm((prev) => ({
      ...prev,
      selectedAddOns: prev.selectedAddOns.includes(id)
        ? prev.selectedAddOns.filter((a) => a !== id)
        : [...prev.selectedAddOns, id],
    }));
  };

  const handleSubmit = async () => {
    if (!room || !form.checkIn || !form.checkOut || !form.guestName || !form.guestEmail) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const { data: booking, error } = await supabase.from("bookings").insert({
        room_id: room.id,
        guest_name: form.guestName,
        guest_email: form.guestEmail,
        guest_phone: form.guestPhone || null,
        check_in: form.checkIn,
        check_out: form.checkOut,
        num_guests: form.numGuests,
        special_requests: form.specialRequests || null,
        total_price: totalPrice,
        add_ons: form.selectedAddOns,
        status: "pending",
        payment_status: "unpaid",
      }).select().single();

      if (error) throw error;

      // Create Stripe checkout
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke("create-checkout", {
        body: {
          bookingId: booking.id,
          roomName: room.name,
          totalPrice,
          nights,
          guestEmail: form.guestEmail,
        },
      });

      if (checkoutError || !checkoutData?.url) {
        // Fallback: navigate to confirmation without payment
        toast.success("Booking submitted! We'll contact you for payment.");
        navigate(`/booking-confirmation?id=${booking.id}`);
        return;
      }

      window.location.href = checkoutData.url;
    } catch (err: any) {
      toast.error(err.message || "Failed to create booking.");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Layout>
      <section className="min-h-screen bg-cream pt-28 pb-16">
        <div className="container-luxury px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-sm tracking-[0.3em] uppercase font-body text-gold block mb-3">Reservation</span>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-charcoal">Book Your Stay</h1>
              <div className="moroccan-divider mt-4" />
            </div>

            {/* Progress steps */}
            <div className="flex items-center justify-center gap-4 mb-10">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-body ${step >= s ? "bg-gold text-cream" : "bg-cream-dark text-muted-foreground"}`}>
                    {s}
                  </div>
                  {s < 3 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              ))}
            </div>

            <div className="bg-cream-dark p-6 lg:p-10">
              {step === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <h2 className="text-xl font-display font-semibold text-charcoal flex items-center gap-2"><Calendar className="w-5 h-5 text-gold" /> Dates & Room</h2>

                  {!roomSlug && (
                    <div>
                      <label className="block text-xs tracking-[0.15em] uppercase font-body text-charcoal-light mb-2">Select Room *</label>
                      <RoomSelector onSelect={(r: any) => setRoom(r)} />
                    </div>
                  )}

                  {room && (
                    <div className="bg-cream p-4 border border-border">
                      <p className="font-display font-semibold text-charcoal">{room.name}</p>
                      <p className="text-sm text-muted-foreground font-body">{room.category} · {room.size} · €{room.price_per_night}/night</p>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs tracking-[0.15em] uppercase font-body text-charcoal-light mb-2">Check-in *</label>
                      <input type="date" min={today} value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} className="w-full bg-cream border border-border px-4 py-3 text-sm font-body text-charcoal focus:outline-none focus:border-gold transition-colors" required />
                    </div>
                    <div>
                      <label className="block text-xs tracking-[0.15em] uppercase font-body text-charcoal-light mb-2">Check-out *</label>
                      <input type="date" min={form.checkIn || today} value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} className="w-full bg-cream border border-border px-4 py-3 text-sm font-body text-charcoal focus:outline-none focus:border-gold transition-colors" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase font-body text-charcoal-light mb-2">Number of Guests</label>
                    <select value={form.numGuests} onChange={(e) => setForm({ ...form, numGuests: parseInt(e.target.value) })} className="w-full bg-cream border border-border px-4 py-3 text-sm font-body text-charcoal focus:outline-none focus:border-gold transition-colors">
                      {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} Guest{n > 1 ? "s" : ""}</option>)}
                    </select>
                  </div>

                  <button onClick={() => { if (room && form.checkIn && form.checkOut) setStep(2); else toast.error("Please select dates and room."); }} className="btn-luxury w-full">
                    Continue
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <h2 className="text-xl font-display font-semibold text-charcoal flex items-center gap-2"><Users className="w-5 h-5 text-gold" /> Guest Details</h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs tracking-[0.15em] uppercase font-body text-charcoal-light mb-2">Full Name *</label>
                      <input type="text" value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} className="w-full bg-cream border border-border px-4 py-3 text-sm font-body text-charcoal focus:outline-none focus:border-gold transition-colors" required maxLength={100} />
                    </div>
                    <div>
                      <label className="block text-xs tracking-[0.15em] uppercase font-body text-charcoal-light mb-2">Email *</label>
                      <input type="email" value={form.guestEmail} onChange={(e) => setForm({ ...form, guestEmail: e.target.value })} className="w-full bg-cream border border-border px-4 py-3 text-sm font-body text-charcoal focus:outline-none focus:border-gold transition-colors" required maxLength={255} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase font-body text-charcoal-light mb-2">Phone</label>
                    <input type="tel" value={form.guestPhone} onChange={(e) => setForm({ ...form, guestPhone: e.target.value })} className="w-full bg-cream border border-border px-4 py-3 text-sm font-body text-charcoal focus:outline-none focus:border-gold transition-colors" maxLength={20} />
                  </div>

                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase font-body text-charcoal-light mb-2">Special Requests</label>
                    <textarea rows={3} value={form.specialRequests} onChange={(e) => setForm({ ...form, specialRequests: e.target.value })} className="w-full bg-cream border border-border px-4 py-3 text-sm font-body text-charcoal focus:outline-none focus:border-gold transition-colors resize-none" maxLength={500} />
                  </div>

                  <div>
                    <h3 className="text-sm tracking-[0.15em] uppercase font-body text-charcoal-light mb-3">Optional Add-ons</h3>
                    <div className="space-y-2">
                      {addOns.map((addon) => (
                        <label key={addon.id} className="flex items-center justify-between p-3 bg-cream border border-border cursor-pointer hover:border-gold transition-colors">
                          <div className="flex items-center gap-3">
                            <input type="checkbox" checked={form.selectedAddOns.includes(addon.id)} onChange={() => toggleAddOn(addon.id)} className="accent-gold" />
                            <span className="text-sm font-body text-charcoal">{addon.label}</span>
                          </div>
                          <span className="text-sm font-body text-gold">+€{addon.price}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="btn-outline-luxury flex-1">Back</button>
                    <button onClick={() => { if (form.guestName && form.guestEmail) setStep(3); else toast.error("Please fill in name and email."); }} className="btn-luxury flex-1">Continue</button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <h2 className="text-xl font-display font-semibold text-charcoal flex items-center gap-2"><CreditCard className="w-5 h-5 text-gold" /> Review & Pay</h2>

                  <div className="space-y-4">
                    <div className="bg-cream p-4 border border-border space-y-2">
                      <h3 className="font-display font-semibold text-charcoal">{room?.name}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm font-body text-muted-foreground">
                        <p>Check-in: <span className="text-charcoal">{form.checkIn}</span></p>
                        <p>Check-out: <span className="text-charcoal">{form.checkOut}</span></p>
                        <p>Guests: <span className="text-charcoal">{form.numGuests}</span></p>
                        <p>Nights: <span className="text-charcoal">{nights}</span></p>
                      </div>
                    </div>

                    <div className="bg-cream p-4 border border-border space-y-2">
                      <p className="text-sm font-body text-muted-foreground">{form.guestName} · {form.guestEmail}</p>
                      {form.guestPhone && <p className="text-sm font-body text-muted-foreground">{form.guestPhone}</p>}
                      {form.specialRequests && <p className="text-sm font-body text-muted-foreground italic">"{form.specialRequests}"</p>}
                    </div>

                    <div className="bg-cream p-4 border border-border">
                      <div className="space-y-1 text-sm font-body">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Room ({nights} night{nights > 1 ? "s" : ""} × €{room?.price_per_night})</span>
                          <span className="text-charcoal">€{(Number(room?.price_per_night || 0) * nights).toFixed(2)}</span>
                        </div>
                        {form.selectedAddOns.map((id) => {
                          const addon = addOns.find((a) => a.id === id);
                          return addon ? (
                            <div key={id} className="flex justify-between">
                              <span className="text-muted-foreground">{addon.label}</span>
                              <span className="text-charcoal">€{addon.price.toFixed(2)}</span>
                            </div>
                          ) : null;
                        })}
                        <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold">
                          <span className="text-charcoal">Total</span>
                          <span className="text-gold text-lg">€{totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground font-body">
                      Free cancellation up to 7 days before check-in. By proceeding, you agree to our terms and cancellation policy.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setStep(2)} className="btn-outline-luxury flex-1">Back</button>
                    <button onClick={handleSubmit} disabled={loading} className="btn-luxury flex-1 disabled:opacity-50">
                      {loading ? "Processing..." : `Pay €${totalPrice.toFixed(2)}`}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

// Room selector for when no room is pre-selected
const RoomSelector = ({ onSelect }: { onSelect: (room: any) => void }) => {
  const [rooms, setRooms] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("rooms").select("*").eq("is_available", true).then(({ data }) => {
      if (data) setRooms(data);
    });
  }, []);

  return (
    <div className="space-y-2">
      {rooms.map((room) => (
        <button key={room.id} onClick={() => onSelect(room)} className="w-full text-left p-4 bg-cream border border-border hover:border-gold transition-colors">
          <p className="font-display font-semibold text-charcoal">{room.name}</p>
          <p className="text-sm text-muted-foreground font-body">{room.category} · {room.size} · €{room.price_per_night}/night</p>
        </button>
      ))}
    </div>
  );
};

export default BookingPage;
