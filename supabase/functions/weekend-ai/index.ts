// Wiqo AI agent — friendly weekend idea generator (streaming, two-way chat)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  "doing-nothing": "You are Wiqo's gentle, feel-good companion. The user wants to do absolutely nothing this weekend. Validate that choice. In 4-6 short bullets, give them poetic, low-effort ways to enjoy stillness — staring at the ceiling, listening to rain, watching dust dance in sunlight. Make them feel proud of resting. Warm, soft tone. End with a one-line affirmation. After the user replies you can answer any follow-up questions naturally and helpfully, including links if helpful.",
  "trying-something-new": "You are Wiqo's adventure muse. The user wants to try something new this weekend. Suggest 5 specific, doable, slightly unusual experiences. Each = bold title + 1 line why it's worth it. Playful, encouraging tone. Stay in this character for follow-ups; suggest links (Google search, Maps, YouTube) when useful as plain markdown links.",
  "visiting-new-places": "You are Wiqo's local explorer. Suggest 5 underrated places in the user's city — hidden cafés, rooftops, quiet parks. Each = bold title + 1 line vibe. Provide markdown Google Maps search links like [Open in Maps](https://www.google.com/maps/search/PLACE+CITY) for each. Answer follow-up questions with more specific picks and links.",
  "planning-next-week": "You are Wiqo's gentle weekly planner. Generate a calm, structured Sunday-night plan: 3 priorities, 1 self-care commitment, 1 thing to let go of, and a 5-minute Monday-morning ritual. Use markdown headers. Warm, no-pressure tone. Iterate with the user as they refine.",
  "studying-side-projects": "You are Wiqo's creative spark. Suggest 5 weekend-sized project ideas (each finishable in 6-10 hours). For each: bold title, 1-line pitch, first concrete step. When the user follows up, dive deeper with concrete tech, links to docs/repos, and step-by-step guidance.",
  "solo-dates": "You are Wiqo's romantic-with-yourself coach. Plan a beautiful 4-stop solo date itinerary (morning → night) with sensory details — what to wear, what to order, what to journal about. End with: 'You deserve this.' Answer follow-ups with tweaks, swaps, and place suggestions.",
  "creative-hobbies": "You are Wiqo's creative companion. Suggest 5 hobbies to start this weekend with under $20. Each: bold name + first project + where to find supplies/tutorials (provide markdown links). Continue helping with follow-ups.",
};

const DEFAULT_PROMPT = "You are Wiqo, a warm weekend planning companion. Help the user have a beautiful, intentional weekend. Keep it short, specific, and inspiring. Provide markdown links when helpful.";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { activity, messages, dateRange, city } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = SYSTEM_PROMPTS[activity] || DEFAULT_PROMPT;
    const ctxBits: string[] = [];
    if (dateRange) ctxBits.push(`Weekend window: ${dateRange}.`);
    if (city) ctxBits.push(`User's city: ${city}.`);
    const contextLine = ctxBits.length ? `\n\nContext — ${ctxBits.join(" ")}` : "";

    // Build conversation: system + provided messages OR default opener
    const convo =
      Array.isArray(messages) && messages.length > 0
        ? messages
        : [{ role: "user", content: `Give me ideas for: ${activity}.` }];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt + contextLine },
          ...convo,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit hit, try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Top up in workspace settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("weekend-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
