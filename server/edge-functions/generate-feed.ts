// Supabase Edge Function: Feed Ranking Algorithm
// Deploy to: /functions/generate-feed/

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface FeedItem {
  id: string;
  type: string;
  score: number;
  created_at: string;
}

function calculateScore(item: any): number {
  let score = 0;

  // Recency (newer = higher score)
  const ageHours = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60);
  score += Math.max(0, 100 - ageHours * 5);

  // Engagement
  const interactions = (item.likes_count || 0) + (item.comments_count || 0);
  score += interactions * 10;

  // Creator reputation
  const creatorRating = item.creator_average_rating || 3;
  score += creatorRating * 15;

  // Category boost
  if (item.category === "popular") score += 20;
  if (item.category === "trending") score += 40;

  return score;
}

serve(async (req: Request) => {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get user activity to understand preferences
    const { data: activities } = await supabase
      .from("user_activity")
      .select("entity_type, activity_type")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    // Fetch relevant posts, marketplace items, meals
    const { data: posts } = await supabase
      .from("feed_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    const { data: items } = await supabase
      .from("marketplace_items")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    const { data: meals } = await supabase
      .from("meals")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    // Combine and score
    const feedItems: FeedItem[] = [
      ...(posts || []).map((p: any) => ({
        id: p.id,
        type: "post",
        score: calculateScore(p),
        created_at: p.created_at,
      })),
      ...(items || []).map((i: any) => ({
        id: i.id,
        type: "marketplace_item",
        score: calculateScore(i),
        created_at: i.created_at,
      })),
      ...(meals || []).map((m: any) => ({
        id: m.id,
        type: "meal",
        score: calculateScore(m),
        created_at: m.created_at,
      })),
    ];

    // Sort by score
    feedItems.sort((a, b) => b.score - a.score);

    // Cache results (24 hours)
    await supabase.from("feed_cache").insert({
      user_id: userId,
      feed_items: feedItems.slice(0, 50),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    return new Response(JSON.stringify(feedItems.slice(0, 50)), {
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
