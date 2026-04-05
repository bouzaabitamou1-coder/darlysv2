import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";

const BookingConfirmation = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("id");
  const [booking, setBooking] = useState<any>(null);
  const [verifying, setVerifying] = useState(true);
  const pollCount = useRef(0);

  useEffect(() => {
    if (!bookingId) {
      setVerifying(false);
      return;
    }

    const fetchBooking = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*, rooms(name)")
        .eq("id", bookingId)
        .single();

      if (data) {
        setBooking(data);
        if (data.payment_status === "paid" || data.status === "confirmed") {
          setVerifying(false);
          return true;
        }
      }
      return false;
    };

    // Poll for payment confirmation (webhook may take a few seconds)
    const poll = async () => {
      const confirmed = await fetchBooking();
      if (confirmed || pollCount.current >= 15) {
        setVerifying(false);
        return;
      }
      pollCount.current++;
      setTimeout(poll, 2000);
    };

    poll();
  }, [bookingId]);

  return (
    <Layout>
      <section className="min-h-[70vh] flex items-center justify-center bg-cream pt-24 pb-16">
        <div className="max-w-lg mx-auto text-center px-4">
          {verifying ? (
            <>
              <Loader2 className="w-16 h-16 text-gold mx-auto mb-6 animate-spin" />
              <h1 className="text-3xl font-display font-bold text-charcoal mb-4">Verifying Payment...</h1>
              <p className="text-muted-foreground font-body mb-6">
                Please wait while we confirm your payment. This usually takes a few seconds.
              </p>
            </>
          ) : (
            <>
              <CheckCircle className="w-16 h-16 text-gold mx-auto mb-6" />
              <h1 className="text-3xl font-display font-bold text-charcoal mb-4">
                {booking?.payment_status === "paid" ? "Booking Confirmed!" : "Booking Received!"}
              </h1>
              <p className="text-muted-foreground font-body mb-6">
                {booking?.payment_status === "paid"
                  ? "Thank you for choosing Dar Lys. A confirmation email will be sent to your inbox shortly."
                  : "Your booking has been received. We'll confirm it once payment is verified."}
              </p>
            </>
          )}

          {booking && !verifying && (
            <div className="bg-cream-dark p-6 text-left mb-8 space-y-2 text-sm font-body">
              <p><span className="text-muted-foreground">Booking ID:</span> <span className="text-charcoal font-medium">{booking.id.slice(0, 8)}</span></p>
              <p><span className="text-muted-foreground">Room:</span> <span className="text-charcoal font-medium">{booking.rooms?.name}</span></p>
              <p><span className="text-muted-foreground">Check-in:</span> <span className="text-charcoal font-medium">{booking.check_in}</span></p>
              <p><span className="text-muted-foreground">Check-out:</span> <span className="text-charcoal font-medium">{booking.check_out}</span></p>
              <p><span className="text-muted-foreground">Total:</span> <span className="text-gold font-semibold">€{booking.total_price}</span></p>
              <p><span className="text-muted-foreground">Status:</span> <span className="text-charcoal font-medium capitalize">{booking.status}</span></p>
              <p><span className="text-muted-foreground">Payment:</span> <span className="text-charcoal font-medium capitalize">{booking.payment_status}</span></p>
            </div>
          )}

          {!verifying && <Link to="/" className="btn-luxury">Return Home</Link>}
        </div>
      </section>
    </Layout>
  );
};

export default BookingConfirmation;
