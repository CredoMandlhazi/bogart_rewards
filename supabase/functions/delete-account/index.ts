import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create client with user's token to get their ID
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // Use service role client for cascade deletion
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get loyalty account ID for dependent deletions
    const { data: loyaltyData } = await adminClient
      .from("loyalty_accounts")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (loyaltyData) {
      // Delete all dependent rows
      await adminClient.from("redemptions").delete().eq("loyalty_account_id", loyaltyData.id);
      await adminClient.from("purchases").delete().eq("loyalty_account_id", loyaltyData.id);
      await adminClient.from("points_ledger").delete().eq("loyalty_account_id", loyaltyData.id);
      await adminClient.from("loyalty_accounts").delete().eq("user_id", userId);
    }

    // Delete other user data
    await adminClient.from("notifications").delete().eq("user_id", userId);
    await adminClient.from("notification_preferences").delete().eq("user_id", userId);
    await adminClient.from("user_roles").delete().eq("user_id", userId);

    // Write audit log before deleting profile
    await adminClient.from("audit_logs").insert({
      user_id: userId,
      action: "account_hard_deleted",
      entity_type: "profile",
      entity_id: userId,
      details: { email: user.email, method: "self_service" },
    });

    await adminClient.from("profiles").delete().eq("user_id", userId);

    // Delete auth user permanently via admin API
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.error("Failed to delete auth user:", deleteAuthError);
      return new Response(JSON.stringify({ error: "Failed to delete auth account" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Delete account error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
