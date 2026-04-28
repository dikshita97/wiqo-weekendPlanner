// Wiqo trending movies — uses Lovable AI to surface currently-trending movies
// across streaming platforms and returns structured JSON via tool calling.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { city } = await req.json().catch(() => ({}));
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const region = city ? ` for a viewer in ${city}` : "";
    const today = new Date().toISOString().slice(0, 10);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are a streaming-platform expert. Return 8 movies that are genuinely trending or buzzy to watch this week (as of " +
              today +
              ")" +
              region +
              ". Mix recent releases, newly-added catalog gems, and fan favourites. For each, pick the SINGLE primary platform it's most prominently on (Netflix, Prime Video, Disney+ / Hotstar, Apple TV+, JioCinema, Max, Hulu, or Theatres). Be honest if it's a theatrical release.",
          },
          { role: "user", content: "Give me this week's trending movies." },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_trending_movies",
              description: "Return trending movies with platform info.",
              parameters: {
                type: "object",
                properties: {
                  movies: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        year: { type: "string" },
                        genre: { type: "string" },
                        why: { type: "string", description: "One short line on why it's trending or worth watching." },
                        platform: {
                          type: "string",
                          enum: ["Netflix", "Prime Video", "Disney+", "Hotstar", "Apple TV+", "JioCinema", "Max", "Hulu", "Theatres"],
                        },
                      },
                      required: ["title", "year", "genre", "why", "platform"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["movies"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_trending_movies" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    let movies: unknown[] = [];
    try { movies = JSON.parse(args || "{}").movies || []; } catch { movies = []; }

    return new Response(JSON.stringify({ movies }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("trending-movies error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
