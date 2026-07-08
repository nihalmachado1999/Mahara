const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { days, budget, interests, pace, familyType } = await req.json();

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) {
      throw new Error("Missing OpenRouter API key in Supabase secrets");
    }

    const systemPrompt =
      `You are an expert Bahrain travel guide. Build a realistic,
day-by-day itinerary for a tourist. Consider prayer times, opening hours, and
realistic travel distances within Bahrain. Respond ONLY with valid JSON in this
shape: { "days": [ { "day": 1, "activities": [ { "time": "09:00", "title": "...",
"description": "...", "location": "..." } ] } ] }`;

    const userPrompt = `Build a ${days}-day Bahrain itinerary.
Traveler type: ${familyType}. Budget level: ${budget}.
Interests: ${interests}. Pace: ${pace}.`;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      },
    );

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "{}";

    return new Response(content, {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
