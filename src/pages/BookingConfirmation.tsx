import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Loader2, Printer } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { printInvoice } from "@/lib/printInvoice";

const BookingConfirmation = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("id");
  const [booking, setBooking] = useState<any>(null);
  const [verifying, setVerifying] = useState(true);
  const pollCount = useRef(0);

  useEffect(() => {
    if (!bookingId) { setVerifying(false); return; }

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

    const poll = async () => {
      const confirmed = await fetchBooking();
      if (confirmed || pollCount.current >= 15) { setVerifying(false); return; }
      pollCount.current++;
      setTimeout(poll, 2000);
    };
    poll();
  }, [bookingId]);

  const nights = booking ? Math.max(1, Math.ceil(
    (new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / 86400000
  )) : 0;

  return (
    <Layout>
      <section className="min-h-[70vh] flex items-center justify-center bg-background pt-24 pb-16">
        <div className="max-w-lg mx-auto text-center px-4">
          {verifying ? (
            <>
              <Loader2 className="w-16 h-16 text-primary mx-auto mb-6 animate-spin" />
              <h1 className="text-3xl font-display font-bold text-foreground mb-4">Verifying Payment...</h1>
              <p className="text-muted-foreground font-body mb-6">Please wait while we confirm your payment.</p>
            </>
          ) : (
            <>
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
              <h1 className="text-3xl font-display font-bold text-foreground mb-4">
                {booking?.payment_status === "paid" ? "Booking Confirmed!" : "Booking Received!"}
              </h1>
              <p className="text-muted-foreground font-body mb-6">
                {booking?.payment_status === "paid"
                  ? "Thank you for choosing Dar Lys. A confirmation email will be sent shortly."
                  : "Your booking has been received. We'll confirm it once payment is verified."}
              </p>
            </>
          )}

          {booking && !verifying && (
            <>
              <div className="bg-card p-6 text-left mb-6 space-y-3 text-sm font-body border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Booking ID</span>
                  <span className="font-mono font-medium text-foreground">{booking.id.slice(0, 8)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Room</span>
                  <span className="font-medium text-foreground">{booking.rooms?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Check-in</span>
                  <span className="font-medium text-foreground">{booking.check_in}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Check-out</span>
                  <span className="font-medium text-foreground">{booking.check_out}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Nights</span>
                  <span className="font-medium text-foreground">{nights}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold text-primary text-lg">€{Number(booking.total_price).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge status={booking.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <StatusBadge status={booking.payment_status === "paid" ? "confirmed" : booking.payment_status} />
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => printInvoice(booking)} className="gap-2">
                  <Printer className="w-4 h-4" /> Print Invoice
                </Button>
                <Link to="/">
                  <Button>Return Home</Button>
                </Link>
              </div>
            </>
          )}

          {!booking && !verifying && (
            <Link to="/"><Button>Return Home</Button></Link>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default BookingConfirmation;
