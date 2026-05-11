import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Users, CreditCard, ChevronRight, AlertCircle, Tag, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// EUR -> MAD conversion rate (approximate)
const EUR_TO_MAD = 10.8;
const dh = (eur: number) => `${(eur * EUR_TO_MAD).toFixed(0)} DH`;

const addOns = [
  { id: "breakfast", label: "Extra Breakfast", price: 15 },
  { id: "spa", label: "Spa Treatment", price: 70 },
  { id: "transfer", label: "Airport Transfer", price: 25 },
  { id: "late-checkout", label: "Late Check-out", price: 30 },
  { id: "romantic", label: "Romantic Setup", price: 50 },
];

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const roomParam = searchParams.get("room") || "";
  const navigate = useNavigate();

  const [form, setForm] = useState({
    guestName: "", guestEmail: "", guestPhone: "",
    checkIn: "", checkOut: "", numGuests: 1,
    specialRequests: "", selectedAddOns: [] as string[],
  });
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [inventoryWarning, setInventoryWarning] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [unavailableRanges, setUnavailableRanges] = useState<{ start: string; end: string }[]>([]);
  const [lockSessionId, setLockSessionId] = useState<string | null>(null);
  const [lockExpiresAt, setLockExpiresAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const releasingLockRef = useRef(false);

  useEffect(() => {
    if (!roomParam) return;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(roomParam);
    const q = isUuid
      ? supabase.from("rooms").select("*").eq("id", roomParam).single()
      : supabase.from("rooms").select("*").eq("slug", roomParam).single();
    q.then(({ data }) => { if (data) setRoom(data); });
  }, [roomParam]);

  // Fetch unavailable date ranges (existing bookings + active locks) for the selected room
  useEffect(() => {
    if (!room?.id) { setUnavailableRanges([]); return; }
    const today = new Date().toISOString().split("T")[0];
    (async () => {
      const [{ data: bookings }, { data: locks }] = await Promise.all([
        supabase
          .from("bookings")
          .select("check_in, check_out")
          .eq("room_id", room.id)
          .in("status", ["pending", "confirmed"])
          .gte("check_out", today),
        supabase
          .from("reservation_locks")
          .select("check_in, check_out, expires_at")
          .eq("room_id", room.id)
          .gt("expires_at", new Date().toISOString()),
      ]);
      const ranges = [
        ...(bookings ?? []).map((b: any) => ({ start: b.check_in, end: b.check_out })),
        ...(locks ?? []).map((l: any) => ({ start: l.check_in, end: l.check_out })),
      ];
      setUnavailableRanges(ranges);
    })();
  }, [room?.id]);

  // Returns true if [ci, co) overlaps any unavailable range [s, e)
  const overlapsUnavailable = (ci: string, co: string) =>
    unavailableRanges.some((r) => ci < r.end && co > r.start);

  const dateInUnavailable = (d: string) =>
    unavailableRanges.some((r) => d >= r.start && d < r.end);

  const handleDateChange = (field: "checkIn" | "checkOut", value: string) => {
    const next = { ...form, [field]: value };
    setAvailabilityError(null);
    setIsAvailable(false);

    // Validate the date itself
    if (value && dateInUnavailable(value)) {
      toast.error("That date is already booked. Please pick another.");
      setForm({ ...form, [field]: "" });
      return;
    }
    // Validate the full range when both dates set
    if (next.checkIn && next.checkOut && next.checkIn < next.checkOut) {
      if (overlapsUnavailable(next.checkIn, next.checkOut)) {
        toast.error("Your selected dates overlap an existing reservation.");
        setForm({ ...form, [field]: "" });
        return;
      }
    }
    setForm(next);
  };

  const nights = form.checkIn && form.checkOut
    ? Math.max(1, Math.ceil((new Date(form.checkOut).getTime() - new Date(form.checkIn).getTime()) / 86400000))
    : 0;

  // Bulk pricing: if nights >= threshold, apply group discount
  const baseRoomPrice = room ? Number(room.price_per_night) * nights : 0;
  const bulkDiscountApplied = room && nights >= (room.group_discount_threshold || 5);
  const discountPercent = bulkDiscountApplied ? Number(room.group_discount_percent || 10) : 0;
  const discountAmount = baseRoomPrice * (discountPercent / 100);
  const discountedRoomPrice = baseRoomPrice - discountAmount;

  const addOnTotal = form.selectedAddOns.reduce((sum, id) => {
    const addon = addOns.find((a) => a.id === id);
    return sum + (addon?.price || 0);
  }, 0);

  const totalPrice = discountedRoomPrice + addOnTotal;

  const toggleAddOn = (id: string) => {
    setForm((prev) => ({
      ...prev,
      selectedAddOns: prev.selectedAddOns.includes(id)
        ? prev.selectedAddOns.filter((a) => a !== id)
        : [...prev.selectedAddOns, id],
    }));
  };

  const checkAvailability = async (): Promise<boolean> => {
    if (!room || !form.checkIn || !form.checkOut) return false;
    setCheckingAvailability(true);
    setAvailabilityError(null);
    setInventoryWarning(null);
    setIsAvailable(false);
    try {
      const { data, error } = await supabase.functions.invoke("check-availability", {
        body: { roomId: room.id, checkIn: form.checkIn, checkOut: form.checkOut },
      });
      if (error) throw error;
      if (!data?.available) {
        setAvailabilityError("This room is not available for the selected dates.");
        return false;
      }

      // Check inventory
      if (room.inventory_count !== undefined && room.inventory_count <= 0) {
        setInventoryWarning("This room type is currently out of stock.");
        return false;
      }
      setIsAvailable(true);
      return true;
    } catch {
      setAvailabilityError("Could not verify availability. Please try again.");
      return false;
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Auto-check availability when room and both dates are selected
  useEffect(() => {
    if (room && form.checkIn && form.checkOut && nights > 0) {
      checkAvailability();
    } else {
      setIsAvailable(false);
      setAvailabilityError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id, form.checkIn, form.checkOut]);

  const handleStep1Continue = async () => {
    if (!room || !form.checkIn || !form.checkOut) {
      toast.error("Please select dates and room.");
      return;
    }
    const available = await checkAvailability();
    if (!available) return;

    // Create a 15-minute reservation hold so no other client can book the same dates
    try {
      const sessionId = lockSessionId ?? crypto.randomUUID();
      // Refresh / extend any previous lock for this session
      await supabase.from("reservation_locks").delete().eq("session_id", sessionId);
      const { error: lockErr } = await supabase.from("reservation_locks").insert({
        room_id: room.id,
        check_in: form.checkIn,
        check_out: form.checkOut,
        session_id: sessionId,
      });
      if (lockErr) throw lockErr;
      setLockSessionId(sessionId);
      setLockExpiresAt(Date.now() + 15 * 60 * 1000);
      setStep(2);
    } catch (e: any) {
      toast.error("Could not hold these dates. Please try again.");
    }
  };

  // Countdown timer for the 15-minute reservation hold
  useEffect(() => {
    if (!lockExpiresAt) { setSecondsLeft(0); return; }
    const tick = () => {
      const s = Math.max(0, Math.floor((lockExpiresAt - Date.now()) / 1000));
      setSecondsLeft(s);
      if (s === 0) {
        // Hold expired — release and send the user back to step 1
        if (lockSessionId) {
          supabase.from("reservation_locks").delete().eq("session_id", lockSessionId);
        }
        setLockSessionId(null);
        setLockExpiresAt(null);
        setStep(1);
        setIsAvailable(false);
        toast.error("Your 15-minute reservation hold expired. Please choose your dates again.");
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockExpiresAt, lockSessionId]);

  // Release the hold when leaving the page (unless we're heading to Stripe checkout)
  useEffect(() => {
    return () => {
      if (lockSessionId && !releasingLockRef.current) {
        supabase.from("reservation_locks").delete().eq("session_id", lockSessionId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  const handleSubmit = async () => {
    if (!room || !form.checkIn || !form.checkOut || !form.guestName || !form.guestEmail) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const bookingId = crypto.randomUUID();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const { error } = await supabase.from("bookings").insert({
        id: bookingId,
        room_id: room.id,
        user_id: session?.user?.id ?? null,
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
      });

      if (error) throw error;
      toast.success("Booking created successfully!");

      // The booking is now created — keep the lock alive through Stripe via the edge
      // function (which creates its own lock keyed by bookingId). Release our hold.
      if (lockSessionId) {
        releasingLockRef.current = true;
        await supabase.from("reservation_locks").delete().eq("session_id", lockSessionId);
      }

      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke("create-checkout", {
        body: {
          bookingId,
          roomName: room.name,
          totalPrice,
          nights,
          guestEmail: form.guestEmail,
          guestName: form.guestName,
          guestPhone: form.guestPhone,
          roomId: room.id,
          checkIn: form.checkIn,
          checkOut: form.checkOut,
        },
      });

      if (checkoutError || !checkoutData?.url) {
        toast.info("We'll contact you for payment.");
        navigate(`/booking-confirmation?id=${bookingId}`);
        return;
      }
      window.location.href = checkoutData.url;
    } catch (err: any) {
      if (err.message?.includes("no_double_booking")) {
        toast.error("This room is already booked for the selected dates.");
      } else {
        toast.error(err.message || "Failed to create booking.");
      }
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const inputClass = "w-full bg-background border border-border px-4 py-3 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors rounded-md";
  const labelClass = "block text-xs tracking-[0.15em] uppercase font-body text-muted-foreground mb-2";

  return (
    <Layout>
      <section className="min-h-screen bg-background pt-28 pb-16">
        <div className="container-luxury px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-sm tracking-[0.3em] uppercase font-body text-primary block mb-3">Reservation</span>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">Book Your Stay</h1>
              <div className="moroccan-divider mt-4" />
            </div>

            {/* Step indicators */}
            <div className="flex items-center justify-center gap-4 mb-10">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-body transition-colors ${step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {s}
                  </div>
                  {s < 3 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              ))}
            </div>

            <Card className="border-border">
              <CardContent className="p-6 lg:p-10">
                {step === 1 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <h2 className="text-xl font-display font-semibold text-foreground flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" /> Dates & Room
                    </h2>

                    {!roomParam && <RoomSelector onSelect={(r: any) => setRoom(r)} />}

                    {room && (
                      <div className="bg-muted/30 p-4 border border-border rounded-md">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-display font-semibold text-foreground">{room.name}</p>
                            <p className="text-sm text-muted-foreground font-body">{room.category} · {room.size} · €{room.price_per_night} ({dh(Number(room.price_per_night))})/night</p>
                          </div>
                          {room.inventory_count !== undefined && (
                            <Badge variant={room.inventory_count > 0 ? "secondary" : "destructive"} className="text-xs">
                              {room.inventory_count > 0 ? `${room.inventory_count} available` : "Out of stock"}
                            </Badge>
                          )}
                        </div>
                        {room.group_discount_threshold && (
                          <p className="text-xs text-primary mt-2 flex items-center gap-1">
                            <Tag className="w-3 h-3" /> Book {room.group_discount_threshold}+ nights for {room.group_discount_percent}% off
                          </p>
                        )}
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Check-in *</label>
                        <input type="date" min={today} value={form.checkIn}
                          onChange={(e) => handleDateChange("checkIn", e.target.value)}
                          className={inputClass} required />
                      </div>
                      <div>
                        <label className={labelClass}>Check-out *</label>
                        <input type="date" min={form.checkIn || today} value={form.checkOut}
                          onChange={(e) => handleDateChange("checkOut", e.target.value)}
                          className={inputClass} required />
                      </div>
                    </div>

                    {room && unavailableRanges.length > 0 && (
                      <div className="p-3 bg-muted/40 border border-border rounded-md text-xs font-body text-muted-foreground">
                        <p className="uppercase tracking-[0.15em] mb-2 text-foreground/80">Unavailable dates for this room</p>
                        <ul className="space-y-1">
                          {unavailableRanges
                            .slice()
                            .sort((a, b) => a.start.localeCompare(b.start))
                            .map((r, i) => (
                              <li key={i}>
                                {r.start} → {r.end} <span className="opacity-60">(check-out day free)</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}

                    {bulkDiscountApplied && (
                      <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-md text-sm font-body text-primary">
                        <Tag className="w-4 h-4 shrink-0" />
                        Bulk discount applied! {discountPercent}% off for {nights} nights. You save €{discountAmount.toFixed(2)} ({dh(discountAmount)})
                      </div>
                    )}

                    {availabilityError && (
                      <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm font-body text-destructive">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {availabilityError}
                      </div>
                    )}

                    {isAvailable && !availabilityError && !inventoryWarning && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-sm font-body text-green-700">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        Great news — this room is available for your selected dates. You can proceed with your reservation.
                      </div>
                    )}

                    {inventoryWarning && (
                      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm font-body text-amber-700">
                        <AlertTriangle className="w-4 h-4 shrink-0" /> {inventoryWarning}
                      </div>
                    )}

                    <div>
                      <label className={labelClass}>Number of Guests</label>
                      <select value={form.numGuests} onChange={(e) => setForm({ ...form, numGuests: parseInt(e.target.value) })} className={inputClass}>
                        {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} Guest{n > 1 ? "s" : ""}</option>)}
                      </select>
                    </div>

                    <Button onClick={handleStep1Continue} disabled={checkingAvailability} className="w-full" size="lg">
                      {checkingAvailability ? "Checking availability..." : "Continue"}
                    </Button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <h2 className="text-xl font-display font-semibold text-foreground flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" /> Guest Details
                    </h2>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Full Name *</label>
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
                      <label className={labelClass}>Special Requests</label>
                      <textarea rows={3} value={form.specialRequests} onChange={(e) => setForm({ ...form, specialRequests: e.target.value })} className={`${inputClass} resize-none`} maxLength={500} />
                    </div>

                    <div>
                      <h3 className="text-sm tracking-[0.15em] uppercase font-body text-muted-foreground mb-3">Optional Add-ons</h3>
                      <div className="space-y-2">
                        {addOns.map((addon) => (
                          <label key={addon.id} className="flex items-center justify-between p-3 bg-background border border-border rounded-md cursor-pointer hover:border-primary transition-colors">
                            <div className="flex items-center gap-3">
                              <input type="checkbox" checked={form.selectedAddOns.includes(addon.id)} onChange={() => toggleAddOn(addon.id)} className="accent-primary w-4 h-4" />
                              <span className="text-sm font-body text-foreground">{addon.label}</span>
                            </div>
                            <span className="text-sm font-body text-primary font-medium">+€{addon.price} ({dh(addon.price)})</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                      <Button onClick={() => { if (form.guestName && form.guestEmail) setStep(3); else toast.error("Please fill in name and email."); }} className="flex-1">Continue</Button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <h2 className="text-xl font-display font-semibold text-foreground flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" /> Review & Pay
                    </h2>

                    <div className="space-y-4">
                      <div className="bg-muted/30 p-4 border border-border rounded-md space-y-2">
                        <h3 className="font-display font-semibold text-foreground">{room?.name}</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm font-body text-muted-foreground">
                          <p>Check-in: <span className="text-foreground">{form.checkIn}</span></p>
                          <p>Check-out: <span className="text-foreground">{form.checkOut}</span></p>
                          <p>Guests: <span className="text-foreground">{form.numGuests}</span></p>
                          <p>Nights: <span className="text-foreground">{nights}</span></p>
                        </div>
                      </div>

                      <div className="bg-muted/30 p-4 border border-border rounded-md space-y-2">
                        <p className="text-sm font-body text-muted-foreground">{form.guestName} · {form.guestEmail}</p>
                        {form.guestPhone && <p className="text-sm font-body text-muted-foreground">{form.guestPhone}</p>}
                        {form.specialRequests && <p className="text-sm font-body text-muted-foreground italic">"{form.specialRequests}"</p>}
                      </div>

                      <div className="bg-muted/30 p-4 border border-border rounded-md">
                        <div className="space-y-1 text-sm font-body">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Room ({nights} night{nights > 1 ? "s" : ""} × €{room?.price_per_night})</span>
                            <span className="text-foreground">€{baseRoomPrice.toFixed(2)} <span className="text-muted-foreground">({dh(baseRoomPrice)})</span></span>
                          </div>
                          {bulkDiscountApplied && (
                            <div className="flex justify-between text-primary">
                              <span>Bulk discount ({discountPercent}%)</span>
                              <span>-€{discountAmount.toFixed(2)} ({dh(discountAmount)})</span>
                            </div>
                          )}
                          {form.selectedAddOns.map((id) => {
                            const addon = addOns.find((a) => a.id === id);
                            return addon ? (
                              <div key={id} className="flex justify-between">
                                <span className="text-muted-foreground">{addon.label}</span>
                                <span className="text-foreground">€{addon.price.toFixed(2)} <span className="text-muted-foreground">({dh(addon.price)})</span></span>
                              </div>
                            ) : null;
                          })}
                          <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold">
                            <span className="text-foreground">Total</span>
                            <span className="text-primary text-lg">€{totalPrice.toFixed(2)} <span className="text-sm text-muted-foreground">({dh(totalPrice)})</span></span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground font-body">
                        Free cancellation up to 7 days before check-in. By proceeding, you agree to our terms.
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
                      <Button onClick={handleSubmit} disabled={loading} className="flex-1" size="lg">
                        {loading ? "Processing..." : `Pay €${totalPrice.toFixed(2)} (${dh(totalPrice)})`}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

const RoomSelector = ({ onSelect }: { onSelect: (room: any) => void }) => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("rooms").select("*").eq("is_available", true).then(({ data }) => {
      if (data) setRooms(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-sm text-muted-foreground font-body p-4">Loading rooms...</div>;
  if (rooms.length === 0) return <div className="text-sm text-muted-foreground font-body p-4">No rooms available.</div>;

  return (
    <div className="space-y-2">
      {rooms.map((room) => (
        <button key={room.id} onClick={() => onSelect(room)} className="w-full text-left p-4 bg-background border border-border rounded-md hover:border-primary transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display font-semibold text-foreground">{room.name}</p>
              <p className="text-sm text-muted-foreground font-body">{room.category} · {room.size} · €{room.price_per_night} ({dh(Number(room.price_per_night))})/night</p>
            </div>
            {room.inventory_count !== undefined && (
              <Badge variant={room.inventory_count > 0 ? "secondary" : "destructive"} className="text-xs">
                {room.inventory_count > 0 ? `${room.inventory_count} left` : "Sold out"}
              </Badge>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default BookingPage;
