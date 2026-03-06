// Supabase Edge Function: Track Ad Impression
// Deploy to: /functions/track-ad-impression/

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req: Request) => {
  try {
    const { adId, viewerId, context } = await req.json();

    await supabase.from("ad_impressions").insert({
      ad_id: adId,
      viewer_id: viewerId,
      context,
    });

    // Update ad spend if CPM model
    await supabase
      .from("ads")
      .update({ spent: supabase.rpc("increment_ad_spend", { id: adId }) })
      .eq("id", adId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
