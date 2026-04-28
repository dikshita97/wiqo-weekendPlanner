// Wiqo AI agent — friendly weekend idea generator (streaming)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  "doing-nothing": "You are Wiqo's gentle, feel-good companion. The user wants to do absolutely nothing this weekend. Validate that choice. In 4-6 short bullets, give them poetic, low-effort ways to enjoy stillness — staring at the ceiling, listening to rain, watching dust dance in sunlight. Make them feel proud of resting. Warm, soft tone. End with a one-line affirmation.",
  "trying-something-new": "You are Wiqo's adventure muse. The user wants to try something new this weekend. Suggest 5 specific, doable, slightly unusual experiences (e.g. 'attend a stranger's open-mic poetry reading', 'learn to throw clay for an hour', 'cook a dish from a country you can't pronounce'). Each suggestion = 1 line bold title + 1 line why it's worth it. Playful, encouraging tone.",
  "visiting-new-places": "You are Wiqo's local explorer. The user wants to visit somewhere new this weekend. Ask one quick clarifier (city/region they're in or budget) if needed, then suggest 5 underrated places — hidden cafés, rooftop spots, quiet parks, lesser-known neighborhoods. Each = bold title + 1 line vibe. End with: 'Tell me your city and I'll get specific.'",
  "planning-next-week": "You are Wiqo's gentle weekly planner. The user wants to set up next week. Generate a calm, structured Sunday-night plan: 3 priorities, 1 self-care commitment, 1 thing to let go of, and a 5-minute Monday-morning ritual. Use markdown headers. Warm, no-pressure tone.",
  "studying-side-projects": "You are Wiqo's creative spark. The user wants to study or build a side project this weekend. Suggest 5 weekend-sized project ideas (each finishable in 6-10 hours), mixing technical, creative, and learning. For each: bold title, 1-line pitch, first concrete step. Inspiring, grounded tone.",
  "solo-dates": "You are Wiqo's romantic-with-yourself coach. The user wants a solo date this weekend. Plan a beautiful 4-stop solo date itinerary (morning → night) with sensory details — what to wear, what to order, what to journal about. Make it feel cinematic. End with: 'You deserve this.'",
  "creative-hobbies": "You are Wiqo's creative companion. The user wants to explore a creative hobby. Suggest 5 hobbies they can start this weekend with under $20, ranging from analog (collage, watercolor, zine-making) to digital (lo-fi music, photo walks, AI art). Each: bold name + first project + where to find supplies/tutorials.",
};

const DEFAULT_PROMPT = "You are Wiqo, a warm weekend planning companion. Help the user have a beautiful, intentional weekend. Keep it short, specific, and inspiring.";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { activity, userMessage, dateRange } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = SYSTEM_PROMPTS[activity] || DEFAULT_PROMPT;
    const dateContext = dateRange ? `\n\nThe user's weekend window: ${dateRange}.` : "";
    const userPrompt = userMessage || `Give me ideas for: ${activity}.${dateContext}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt + dateContext },
          { role: "user", content: userPrompt },
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
