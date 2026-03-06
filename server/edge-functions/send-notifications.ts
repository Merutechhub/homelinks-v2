// Supabase Edge Function: Send Push Notifications
// Deploy to: /functions/send-notifications/

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req: Request) => {
  try {
    const { userId, title, body, data, notificationType } = await req.json();

    // Create notification record
    await supabase.from("notifications").insert({
      user_id: userId,
      notification_type: notificationType,
      title,
      body,
      data,
    });

    // Get user device tokens
    const { data: devices } = await supabase
      .from("device_tokens")
      .select("device_token, device_type")
      .eq("user_id", userId)
      .eq("push_enabled", true);

    if (!devices || devices.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Send to push service (Firebase Cloud Messaging, etc.)
    // Implementation depends on your push service provider

    return new Response(JSON.stringify({ sent: devices.length }), {
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
