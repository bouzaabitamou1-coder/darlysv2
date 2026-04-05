import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId, roomName, totalPrice, nights, guestEmail, roomId, checkIn, checkOut } = await req.json();

    if (!bookingId || !totalPrice || !guestEmail) {
      throw new Error("Missing required fields");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check availability if room/dates provided
    if (roomId && checkIn && checkOut) {
      const { data: available } = await supabaseAdmin.rpc("check_availability", {
        _room_id: roomId,
        _check_in: checkIn,
        _check_out: checkOut,
      });

      if (!available) {
        return new Response(
          JSON.stringify({ error: "Room is not available for the selected dates" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 409 }
        );
      }

      // Create reservation lock
      await supabaseAdmin.from("reservation_locks").insert({
        room_id: roomId,
        check_in: checkIn,
        check_out: checkOut,
        session_id: bookingId,
      });
    }

    // Clean up expired locks
    await supabaseAdmin.rpc("cleanup_expired_locks");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing customer
    const customers = await stripe.customers.list({ email: guestEmail, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : guestEmail,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${roomName} - ${nights} night${nights > 1 ? "s" : ""}`,
              description: `Booking at Dar Lys, Fès`,
            },
            unit_amount: Math.round(totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/booking-confirmation?id=${bookingId}`,
      cancel_url: `${origin}/booking?room=`,
      metadata: {
        booking_id: bookingId,
      },
    });

    // Update booking with payment intent
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await supabaseAdmin
      .from("bookings")
      .update({
        stripe_checkout_session_id: session.id,
        payment_intent_id: session.payment_intent as string,
      })
      .eq("id", bookingId);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
