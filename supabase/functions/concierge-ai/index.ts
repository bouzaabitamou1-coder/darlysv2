import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FAQ = `
Cancellation: Free up to 7 days before check-in. Within 7 days: 50% of first night. No-show: full first night.
Breakfast: Traditional Moroccan breakfast included with every room.
Dietary: Vegetarian, vegan, gluten-free, halal available with 24h notice.
Private events: Riad privatization possible up to 30 guests.
Families: Welcome; extra beds & cribs available; open courtyard with fountain.
Cooking class: Daily 10:00, 60€/person, book 24h ahead.
Languages spoken: Arabic, French, English, some Spanish/Italian.
Airport transfer: Fès-Saïss airport ~15km, private transfer 25€/way.
Phone: +212 535 366 423.
Location: Medina of Fès, Morocco.
Private driver: Rate 10 MAD per km from the riad (lat 34.0625, lng -4.9745). Recommended if guest plans day trips (Chefchaouen, Meknès, Volubilis, Sahara), arrives late, or has heavy luggage. Not needed for medina walking tours.
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: rooms } = await supabase
      .from("rooms")
      .select("name,category,price_per_night,max_guests,size,description,amenities")
      .eq("is_available", true);

    const roomsCtx = (rooms ?? [])
      .map((r: any) => `- ${r.name} (${r.category}): ${r.price_per_night} MAD/night, up to ${r.max_guests} guests, ${r.size}. ${r.description ?? ""} Amenities: ${(r.amenities ?? []).join(", ")}`)
      .join("\n");

    const system = `You are Lys, the concierge AI of Dar Lys riad in Fès, Morocco. Be warm, concise (max ~120 words), and helpful.
You help guests with three things:
1) Recommend the perfect room based on their budget (in MAD or EUR ~1€=11 MAD), group size, and preferences. Always name a specific room.
2) Advise whether they should book a private driver (rate 10 MAD/km from the riad). Ask about their plans if unclear.
3) Answer FAQs about the riad.

AVAILABLE ROOMS:
${roomsCtx || "(no rooms loaded)"}

RIAD INFO:
${FAQ}

Respond in the user's language (English, French, or Arabic). Use markdown sparingly. Suggest /rooms, /transport, or /booking links when relevant.`;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      return new Response(JSON.stringify({ error: `AI error ${aiRes.status}: ${txt}` }), {
        status: aiRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const reply = data?.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});