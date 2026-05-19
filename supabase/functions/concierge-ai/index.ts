import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEFAULT_FAQ = `
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
    const { messages: messagesRaw, lang: langRaw, tenantSlug: slugRaw } = await req.json();
    const lang: "en" | "fr" | "ar" = langRaw === "fr" || langRaw === "ar" ? langRaw : "en";
    const tenantSlug = typeof slugRaw === "string" && slugRaw.length > 0 ? slugRaw : "dar-lys";
    if (!Array.isArray(messagesRaw)) {
      return new Response(JSON.stringify({ error: "messages required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Abuse caps: max 20 turns, 2000 chars per message, 20000 total
    if (messagesRaw.length > 20) {
      return new Response(JSON.stringify({ error: "Too many messages" }), { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const messages = messagesRaw.slice(-10).map((m: any) => ({
      role: m?.role === "assistant" ? "assistant" : "user",
      content: typeof m?.content === "string" ? m.content.slice(0, 2000) : "",
    })).filter((m: any) => m.content.length > 0);
    const totalChars = messages.reduce((s: number, m: any) => s + m.content.length, 0);
    if (totalChars > 20000) {
      return new Response(JSON.stringify({ error: "Conversation too long" }), { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Load tenant by slug
    const { data: tenant } = await supabase
      .from("tenants")
      .select("id, name, concierge_name, concierge_persona, faq, driver_rate_per_km, default_currency, location_lat, location_lng, phone, address, allowed_origins, allow_cross_recommendations")
      .eq("slug", tenantSlug)
      .eq("is_active", true)
      .maybeSingle();

    if (!tenant) {
      return new Response(JSON.stringify({ error: "tenant not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Per-tenant CORS: if Origin is in allowed_origins, reflect it
    const origin = req.headers.get("origin") ?? "";
    const allowed: string[] = tenant.allowed_origins ?? [];
    const tenantCors = {
      ...corsHeaders,
      "Access-Control-Allow-Origin":
        allowed.includes(origin) || allowed.length === 0 ? (origin || "*") : "*",
    };

    const { data: rooms } = await supabase
      .from("rooms")
      .select("name,category,price_per_night,max_guests,size,description,amenities")
      .eq("is_available", true)
      .eq("tenant_id", tenant.id);

    const roomsCtx = (rooms ?? [])
      .map((r: any) => `- ${r.name} (${r.category}): ${r.price_per_night} MAD/night, up to ${r.max_guests} guests, ${r.size}. ${r.description ?? ""} Amenities: ${(r.amenities ?? []).join(", ")}`)
      .join("\n");

    // Optional cross-property recommendations: load sibling properties' rooms
    // (only properties that have ALSO opted in to cross recommendations).
    let peersCtx = "";
    if (tenant.allow_cross_recommendations) {
      const { data: peers } = await supabase
        .from("tenants")
        .select("id, name, slug, default_currency, rooms:rooms(name,category,price_per_night,max_guests,size,is_available)")
        .neq("id", tenant.id)
        .eq("is_active", true)
        .eq("allow_cross_recommendations", true);
      const lines: string[] = [];
      for (const p of peers ?? []) {
        const avail = (p.rooms ?? []).filter((r: any) => r.is_available);
        if (avail.length === 0) continue;
        const cur = p.default_currency || "MAD";
        lines.push(`• ${p.name} (slug: ${p.slug}):`);
        for (const r of avail.slice(0, 4)) {
          lines.push(`   - ${r.name} (${r.category}): ${r.price_per_night} ${cur}/night, up to ${r.max_guests} guests, ${r.size}`);
        }
      }
      peersCtx = lines.join("\n");
    }

    const conciergeName = tenant.concierge_name || "Lys";
    const hotelName = tenant.name;
    const rate = Number(tenant.driver_rate_per_km ?? 10);
    const currency = tenant.default_currency || "MAD";
    const faqText = (tenant.faq && tenant.faq.trim().length > 0 ? tenant.faq : DEFAULT_FAQ);
    const persona = tenant.concierge_persona ? `\nPERSONA: ${tenant.concierge_persona}\n` : "";

    const system = `You are ${conciergeName}, the concierge AI of ${hotelName}. Warm, precise, concise (~150 words max).${persona}

ROOM RECOMMENDATION RULES (very important):
- Convert budget to ${currency} if given in another currency (1€≈11 MAD, 1$≈10 MAD when applicable). Treat budget as PER NIGHT unless the user gives total + nights (then divide).
- Filter rooms strictly: price_per_night must fit budget AND max_guests must fit the party size.
- If multiple rooms fit, recommend the BEST value: the highest category (Suite > Deluxe > Standard) within budget, then the one whose amenities best match stated preferences (romantic, family, work, view, etc.).
- Always name ONE primary recommendation with: name, category, exact price/night in ${currency}, capacity, 1-line why it fits, and 2-3 key amenities. Optionally mention 1 alternative.
- If NO room fits the budget, say so honestly and suggest the cheapest available room with its price, or recommend reducing nights / increasing budget. Never invent rooms or prices.
- If budget or guest count is missing, ask ONE short clarifying question before recommending.
- End room replies with a link suggestion: "See details: /rooms" or "Book now: /booking".

PRIVATE DRIVER RULES:
- Rate is ${rate} ${currency} per km from the hotel. Recommend it for: airport arrival/late nights, day trips, heavy luggage, families with kids, or guests with limited time.
- NOT needed for medina sightseeing (pedestrian-only).
- If recommending, give a rough cost estimate (km × ${rate} ${currency} round-trip) and link /transport.

FAQ: answer directly from the HOTEL INFO below. If unknown, say so and suggest contacting ${tenant.phone ?? "the hotel"}.

AVAILABLE ROOMS at ${hotelName} (use ONLY these — do not invent):
${roomsCtx || "(no rooms loaded)"}
${peersCtx ? `\nSISTER PROPERTIES (only suggest these if NO room at ${hotelName} fits the guest's budget or party size; never invent):\n${peersCtx}\nWhen recommending a sister property, name it and add: "(another property in our network — link: /?tenant=<slug>)".\n` : ""}

HOTEL INFO:
${faqText}
${tenant.phone ? `Phone: ${tenant.phone}\n` : ""}${tenant.address ? `Address: ${tenant.address}\n` : ""}

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
        headers: { ...tenantCors, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const reply = data?.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ reply }), {
      headers: { ...tenantCors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});