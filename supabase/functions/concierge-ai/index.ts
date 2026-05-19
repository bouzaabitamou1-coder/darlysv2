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
    const { messages, lang: langRaw } = await req.json();
    const lang: "en" | "fr" | "ar" = langRaw === "fr" || langRaw === "ar" ? langRaw : "en";
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

    const system = `You are Lys, the concierge AI of Dar Lys riad in Fès, Morocco. Warm, precise, concise (~150 words max).

ROOM RECOMMENDATION RULES (very important):
- Convert budget to MAD if given in EUR/USD (1€≈11 MAD, 1$≈10 MAD). Treat budget as PER NIGHT unless the user gives total + nights (then divide).
- Filter rooms strictly: price_per_night must fit budget AND max_guests must fit the party size.
- If multiple rooms fit, recommend the BEST value: the highest category (Suite > Deluxe > Standard) within budget, then the one whose amenities best match stated preferences (romantic, family, work, view, etc.).
- Always name ONE primary recommendation with: name, category, exact price/night in MAD, capacity, 1-line why it fits, and 2-3 key amenities. Optionally mention 1 alternative.
- If NO room fits the budget, say so honestly and suggest the cheapest available room with its price, or recommend reducing nights / increasing budget. Never invent rooms or prices.
- If budget or guest count is missing, ask ONE short clarifying question before recommending.
- End room replies with a link suggestion: "See details: /rooms" or "Book now: /booking".

PRIVATE DRIVER RULES:
- Rate is 10 MAD per km from the riad. Recommend it for: airport arrival/late nights, day trips (Chefchaouen ~200km, Meknès ~60km, Volubilis ~80km, Sahara/Merzouga ~470km), heavy luggage, families with kids, or guests with limited time.
- NOT needed for medina sightseeing (pedestrian-only).
- If recommending, give a rough cost estimate (km × 10 MAD round-trip) and link /transport.

FAQ: answer directly from the RIAD INFO below. If unknown, say so and suggest contacting +212 535 366 423.

AVAILABLE ROOMS (use ONLY these — do not invent):
${roomsCtx || "(no rooms loaded)"}

RIAD INFO:
${FAQ}

CRITICAL LANGUAGE RULE — NON-NEGOTIABLE:
You MUST write the ENTIRE response in ${lang === "fr" ? "FRENCH (français)" : lang === "ar" ? "ARABIC (العربية)" : "ENGLISH"} only.
Do NOT mix languages. Do NOT reply in English when the required language is French or Arabic.
Even if the user writes in another language, your reply MUST be in ${lang === "fr" ? "French" : lang === "ar" ? "Arabic" : "English"}.
${lang === "fr" ? "Exemple: 'Je vous recommande la chambre **Yasmine**...'" : lang === "ar" ? "مثال: 'أنصحك بـ **غرفة الياسمين**...'" : ""}

Use light markdown (bold room names, short bullets).`;

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
        messages: [
          { role: "system", content: system },
          ...messages,
          {
            role: "system",
            content: `Reminder: respond ONLY in ${lang === "fr" ? "French" : lang === "ar" ? "Arabic" : "English"}.`,
          },
        ],
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