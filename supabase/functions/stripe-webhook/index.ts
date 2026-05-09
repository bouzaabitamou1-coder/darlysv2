import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  let event: Stripe.Event;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      // Fallback for testing without webhook secret
      event = JSON.parse(body);
      console.warn("⚠️ No webhook secret configured — skipping signature verification");
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
  }

  console.log(`Received event: ${event.type} (${event.id})`);

  try {
    // Log all events
    await supabaseAdmin.from("payment_events").insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event.data.object as any,
      booking_id: (event.data.object as any)?.metadata?.booking_id || null,
    });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;

      if (bookingId) {
        // Update booking to confirmed + paid
        await supabaseAdmin
          .from("bookings")
          .update({
            status: "confirmed",
            payment_status: "paid",
            payment_intent_id: session.payment_intent as string,
            stripe_checkout_session_id: session.id,
          })
          .eq("id", bookingId);

        // Clean up reservation lock
        await supabaseAdmin
          .from("reservation_locks")
          .delete()
          .eq("session_id", bookingId);

        console.log(`✅ Booking ${bookingId} confirmed and paid`);

        // Send Telegram notification (best-effort)
        try {
          const { data: booking } = await supabaseAdmin
            .from("bookings")
            .select("guest_name, guest_email, guest_phone, check_in, check_out, num_guests, total_price, rooms(name)")
            .eq("id", bookingId)
            .single();

          const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
          const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
          const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

          if (booking && TELEGRAM_API_KEY && LOVABLE_API_KEY && TELEGRAM_CHAT_ID) {
            const roomName = (booking as any).rooms?.name ?? "Room";
            const nights = Math.max(1, Math.round(
              (new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / 86400000
            ));
            const text =
              `🔔 <b>New booking at Dar Lys</b>\n\n` +
              `👤 ${booking.guest_name}\n` +
              `✉️ ${booking.guest_email}\n` +
              (booking.guest_phone ? `📞 ${booking.guest_phone}\n` : "") +
              `🛏 ${roomName}\n` +
              `📅 ${booking.check_in} → ${booking.check_out} (${nights} night${nights > 1 ? "s" : ""})\n` +
              `👥 ${booking.num_guests} guest(s)\n` +
              `💶 ${booking.total_price} MAD`;

            const tgRes = await fetch("https://connector-gateway.lovable.dev/telegram/sendMessage", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${LOVABLE_API_KEY}`,
                "X-Connection-Api-Key": TELEGRAM_API_KEY,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text,
                parse_mode: "HTML",
              }),
            });
            if (!tgRes.ok) {
              console.error("Telegram send failed:", tgRes.status, await tgRes.text());
            }
          } else {
            console.warn("Telegram notification skipped — missing env or booking");
          }
        } catch (tgErr) {
          console.error("Telegram notify failed (non-blocking):", tgErr);
        }

        // Trigger Opera PMS sync (best-effort)
        try {
          const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
          await fetch(`${supabaseUrl}/functions/v1/opera-sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({ bookingId, action: "create" }),
          });
        } catch (syncErr) {
          console.error("Opera sync trigger failed (non-blocking):", syncErr);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
