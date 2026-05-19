import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { email, password, displayName } = await req.json();

    if (!email || typeof email !== "string" || !password || typeof password !== "string" || password.length < 8) {
      return new Response(JSON.stringify({ error: "Email and password (min 8 chars) required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Authorization: either (a) one-time bootstrap when no admin exists yet,
    // or (b) a caller proving knowledge of the BOOTSTRAP_SECRET header.
    const providedSecret = req.headers.get("x-bootstrap-secret") ?? "";
    const expectedSecret = Deno.env.get("BOOTSTRAP_SECRET") ?? "";
    const secretOk = expectedSecret.length > 0 && providedSecret === expectedSecret;

    if (!secretOk) {
      const { count, error: countErr } = await admin
        .from("user_roles")
        .select("user_id", { count: "exact", head: true })
        .eq("role", "admin");
      if (countErr) throw countErr;
      if ((count ?? 0) > 0) {
        return new Response(
          JSON.stringify({ error: "Bootstrap already completed. Provide x-bootstrap-secret to override." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // Find existing user by email
    let userId: string | null = null;
    const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listErr) throw listErr;
    const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (existing) {
      userId = existing.id;
      const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
      });
      if (updErr) throw updErr;
    } else {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: displayName || "Admin" },
      });
      if (createErr) throw createErr;
      userId = created.user!.id;
    }

    // Ensure admin role
    const { error: roleErr } = await admin
      .from("user_roles")
      .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
    if (roleErr) throw roleErr;

    return new Response(JSON.stringify({ success: true, userId, email }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("admin-bootstrap error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
