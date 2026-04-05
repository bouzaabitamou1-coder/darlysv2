import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const { bookingId, action } = await req.json();

    if (!bookingId || !action) {
      return new Response(
        JSON.stringify({ error: "Missing bookingId or action" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch booking details
    const { data: booking, error: bookingErr } = await supabaseAdmin
      .from("bookings")
      .select("*, rooms(name, slug, category)")
      .eq("id", bookingId)
      .single();

    if (bookingErr || !booking) {
      throw new Error(`Booking not found: ${bookingId}`);
    }

    // Build Opera PMS payload (HTNG/OXI format stub)
    const operaPayload = {
      reservation: {
        resortId: "DARLYS",
        profileId: {
          firstName: booking.guest_name?.split(" ")[0] || "",
          lastName: booking.guest_name?.split(" ").slice(1).join(" ") || "",
          email: booking.guest_email,
          phone: booking.guest_phone || "",
        },
        roomStay: {
          roomType: booking.rooms?.slug?.toUpperCase() || "STD",
          arrivalDate: booking.check_in,
          departureDate: booking.check_out,
          rateCode: "BAR",
          adults: booking.num_guests,
          totalAmount: booking.total_price,
          currency: "MAD",
        },
        paymentMethod: {
          type: "ONLINE_PAYMENT",
          reference: booking.payment_intent_id || "",
        },
        externalReferenceId: booking.id,
        action: action,
      },
    };

    // Log the sync attempt
    // TODO: Replace with actual Opera PMS API call when credentials are available
    // const operaApiUrl = Deno.env.get("OPERA_API_URL");
    // const operaApiKey = Deno.env.get("OPERA_API_KEY");

    const syncStatus = "pending"; // Will be "success" or "failed" once real API is connected
    const errorMessage = "Opera PMS not configured — stub mode. Configure OPERA_API_URL and OPERA_API_KEY to enable.";

    await supabaseAdmin.from("opera_sync_log").insert({
      booking_id: bookingId,
      action,
      request_payload: operaPayload,
      response_payload: { message: errorMessage },
      status: syncStatus,
      error_message: errorMessage,
    });

    console.log(`Opera sync stub for booking ${bookingId}, action: ${action}`);

    return new Response(
      JSON.stringify({
        synced: false,
        message: "Opera PMS integration is in stub mode. Configure API credentials to enable.",
        payload: operaPayload,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Opera sync error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
