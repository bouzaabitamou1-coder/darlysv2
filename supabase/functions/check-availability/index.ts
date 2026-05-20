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
    const { roomId, checkIn, checkOut, sessionId } = await req.json();

    if (!roomId || !checkIn || !checkOut) {
      return new Response(
        JSON.stringify({ error: "Missing roomId, checkIn, or checkOut" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const checkInDate = new Date(`${checkIn}T00:00:00Z`);
    const checkOutDate = new Date(`${checkOut}T00:00:00Z`);
    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
      return new Response(
        JSON.stringify({ available: false, error: "Check-out must be after check-in" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Clean up expired locks first
    await supabaseAdmin.rpc("cleanup_expired_locks");

    const [{ data: bookingConflicts, error: bookingError }, { data: lockConflicts, error: lockError }] = await Promise.all([
      supabaseAdmin
        .from("bookings")
        .select("id")
        .eq("room_id", roomId)
        .in("status", ["pending", "confirmed"])
        .lt("check_in", checkOut)
        .gt("check_out", checkIn),
      supabaseAdmin
        .from("reservation_locks")
        .select("id, session_id, expires_at")
        .eq("room_id", roomId)
        .gt("expires_at", new Date().toISOString())
        .lt("check_in", checkOut)
        .gt("check_out", checkIn),
    ]);

    if (bookingError) throw bookingError;
    if (lockError) throw lockError;

    const activeForeignLocks = (lockConflicts ?? []).filter((lock) => lock.session_id !== sessionId);
    const hasBookingConflict = (bookingConflicts ?? []).length > 0;
    const hasLockConflict = activeForeignLocks.length > 0;
    const available = !hasBookingConflict && !hasLockConflict;

    // Surface the soonest lock expiry so the other device can show a countdown
    let lockExpiresAt: string | null = null;
    if (hasLockConflict) {
      const soonest = [...activeForeignLocks]
        .map((l: any) => l.expires_at)
        .sort()[0];
      lockExpiresAt = soonest ?? null;
    }

    return new Response(
      JSON.stringify({
        available,
        reason: available ? null : hasBookingConflict ? "booked" : "held",
        lockExpiresAt,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Availability check error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
