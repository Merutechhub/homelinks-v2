// Supabase Edge Function: Ad Injection into Feed
// Deploy to: /functions/inject-ads/

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req: Request) => {
  try {
    const { feedItems, position } = await req.json();

    // Get active ads
    const now = new Date().toISOString();
    const { data: ads } = await supabase
      .from("ads")
      .select("*")
      .eq("status", "active")
      .lt("start_date", now)
      .gt("end_date", now);

    if (!ads || ads.length === 0) {
      return new Response(JSON.stringify(feedItems), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Select random ad
    const ad = ads[Math.floor(Math.random() * ads.length)];

    // Inject ad at specified position
    const injected = [...feedItems];
    const adItem = {
      id: ad.id,
      type: "ad",
      title: ad.title,
      description: ad.description,
      image_url: ad.image_url,
      destination_url: ad.destination_url,
    };

    const insertPos = Math.min(position || 5, injected.length);
    injected.splice(insertPos, 0, adItem);

    return new Response(JSON.stringify(injected), {
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
