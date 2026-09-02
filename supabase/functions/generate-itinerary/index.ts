const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  console.log("STEP 1: function invoked");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { days, budget, interests, pace, familyType } = await req.json();
    console.log("STEP 2: request body parsed", {
      days,
      budget,
      interests,
      pace,
      familyType,
    });

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("Missing Gemini API key in Supabase secrets");
    }
    console.log("STEP 3: API key found, length:", GEMINI_API_KEY.length);

    // Manama, Bahrain coordinates — fixed, since this app only covers Bahrain.
    async function getBahrainHeatContext(): Promise<string> {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=26.2285&longitude=50.5860&daily=temperature_2m_max,apparent_temperature_max&timezone=Asia/Bahrain&forecast_days=7",
          { signal: controller.signal },
        );
        clearTimeout(timeout);
        if (!res.ok) return "";

        const weather = await res.json();
        const maxTemps: number[] = weather?.daily?.temperature_2m_max ?? [];
        const feelsLike: number[] = weather?.daily?.apparent_temperature_max ??
          [];
        if (maxTemps.length === 0) return "";

        const avgMax = Math.round(
          maxTemps.reduce((a, b) => a + b, 0) / maxTemps.length,
        );
        const avgFeels = feelsLike.length > 0
          ? Math.round(feelsLike.reduce((a, b) => a + b, 0) / feelsLike.length)
          : avgMax;

        return `Real current forecast: expected daytime highs around ${avgMax}°C ` +
          `(feels like roughly ${avgFeels}°C). If this exceeds 38°C, schedule ` +
          `outdoor or walking activities before 10:00 or after 16:00, and prefer ` +
          `indoor, shaded, or air-conditioned venues between 12:00 and 16:00.`;
      } catch {
        return "";
      }
    }

    const heatContext = await getBahrainHeatContext();
    console.log(
      "STEP 3B: heat context:",
      heatContext || "(unavailable, skipped)",
    );

    async function callGeminiWithRetry(
      requestBody: unknown,
      timeoutMs: number,
      maxAttempts = 2,
    ): Promise<Response> {
      let lastErr: unknown;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const res = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": GEMINI_API_KEY,
              },
              body: JSON.stringify(requestBody),
              signal: controller.signal,
            },
          );
          clearTimeout(timeout);
          // Only retry on a transient overload signal — a real error (bad key,
          // malformed request) would just fail the same way again instantly,
          // so retrying it would only waste time.
          if (res.status === 503 && attempt < maxAttempts) {
            console.log(
              `STEP: Gemini returned 503 on attempt ${attempt}, retrying in 1.5s`,
            );
            await new Promise((r) => setTimeout(r, 1500));
            continue;
          }
          return res;
        } catch (err) {
          clearTimeout(timeout);
          lastErr = err;
          const isTimeout = err instanceof Error && err.name === "AbortError";
          if (attempt < maxAttempts) {
            console.log(
              `STEP: Gemini call ${
                isTimeout ? "timed out" : "failed"
              } on attempt ${attempt}, retrying`,
            );
            continue;
          }
          if (isTimeout) {
            throw new Error(
              `Gemini took longer than ${
                timeoutMs / 1000
              }s to respond, twice in a row. Try again shortly.`,
            );
          }
          throw err;
        }
      }
      throw lastErr instanceof Error
        ? lastErr
        : new Error("Gemini call failed after retries.");
    }

    const systemPrompt =
      `You are an expert Bahrain travel guide. Build a realistic,
day-by-day itinerary for a tourist. Consider prayer times, opening hours, and
realistic travel distances within Bahrain.

Do not reference the former Pearl Monument, Pearl Roundabout, or "Lulu
Roundabout" under any name — it was demolished in 2011 and the site (now
Al Farooq Junction) is not a tourist attraction. Never invent a name for it.

Only name specific restaurants, cafes, or monuments if you are confident they
are real. If unsure, describe the type of venue or the neighborhood generally
(e.g. "a cafe in the souq area") instead of inventing a specific name.

costEstimate and totalEstimatedCost must be numbers in Bahraini Dinar, no
currency symbols.`;

    const userPrompt = `Build a ${days}-day Bahrain itinerary.
Traveler type: ${familyType}. Budget level: ${budget}.
Interests: ${interests.join(", ")}. Pace: ${pace}.
${heatContext}`;

    // Gemini's native structured output — this constrains what the model can
    // generate at the token level, not just a formatting request in the
    // prompt. This is the actual fix for the class of bug we kept hitting
    // with the free-model router: unparseable, fenced, or truncated JSON.
    const responseSchema = {
      type: "OBJECT",
      properties: {
        destination: { type: "STRING" },
        summary: { type: "STRING" },
        days: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              day: { type: "INTEGER" },
              title: { type: "STRING" },
              activities: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    time: { type: "STRING" },
                    title: { type: "STRING" },
                    description: { type: "STRING" },
                    location: { type: "STRING" },
                    costEstimate: { type: "NUMBER" },
                  },
                  required: [
                    "time",
                    "title",
                    "description",
                    "location",
                    "costEstimate",
                  ],
                },
              },
            },
            required: ["day", "title", "activities"],
          },
        },
        totalEstimatedCost: { type: "NUMBER" },
        tips: {
          type: "ARRAY",
          items: { type: "STRING" },
        },
      },
      required: [
        "destination",
        "summary",
        "days",
        "totalEstimatedCost",
        "tips",
      ],
    };

    console.log("STEP 4: about to call Gemini");
    const response = await callGeminiWithRetry(
      {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          maxOutputTokens: 6000,
          thinkingConfig: { thinkingLevel: "MINIMAL" },
        },
      },
      120000,
    );
    console.log("STEP 5: Gemini responded, status:", response.status);

    const data = await response.json();
    console.log(
      "STEP 6: finishReason:",
      data.candidates?.[0]?.finishReason,
      "| response body parsed:",
      JSON.stringify(data).slice(0, 500),
    );

    if (!response.ok || data.error) {
      throw new Error("Gemini Error: " + JSON.stringify(data.error ?? data));
    }

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

    // Kept as a safety net, not the primary mechanism anymore — responseSchema
    // should make this unnecessary almost every time, but "almost" isn't
    // "always," and this costs nothing to leave in place.
    // deno-lint-ignore no-explicit-any
    function extractJSON(raw: string): any {
      try {
        return JSON.parse(raw);
      } catch {
        // not valid JSON as-is, try the next strategy
      }

      const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
      if (fenced) {
        try {
          return JSON.parse(fenced[1].trim());
        } catch {
          // fenced block wasn't valid JSON either, try the next strategy
        }
      }

      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start !== -1 && end !== -1 && end > start) {
        try {
          return JSON.parse(raw.slice(start, end + 1));
        } catch {
          // last resort failed too, fall through to null
        }
      }

      return null;
    }

    const parsedItinerary = extractJSON(content);

    if (!parsedItinerary) {
      console.log(
        "STEP 6b: content that failed to parse:",
        content.slice(0, 1000),
      );
      throw new Error("Could not extract valid JSON from model response.");
    }

    // Hard backstop, independent of the model — responseSchema guarantees
    // valid JSON *shape*, not safe *content*. The model can still put a
    // blocked site name inside an otherwise perfectly valid location field.
    const BLOCKED_SITE_PATTERN =
      /pearl\s*(monument|roundabout)|lulu\s*roundabout|al[\s-]?farooq/i;

    // deno-lint-ignore no-explicit-any
    function sanitizeItinerary(itinerary: any): any {
      if (!Array.isArray(itinerary?.days)) return itinerary;
      for (const day of itinerary.days) {
        if (!Array.isArray(day.activities)) continue;
        // deno-lint-ignore no-explicit-any
        day.activities = day.activities.filter((act: any) => {
          const text = `${act?.title ?? ""} ${act?.description ?? ""} ${
            act?.location ?? ""
          }`;
          const blocked = BLOCKED_SITE_PATTERN.test(text);
          if (blocked) {
            console.log(
              "STEP 7B: removed blocked activity:",
              JSON.stringify(act),
            );
          }
          return !blocked;
        });
      }
      return itinerary;
    }

    const safeItinerary = sanitizeItinerary(parsedItinerary);

    // The model's self-reported totalEstimatedCost isn't reliable — confirmed
    // by a real test where it was off by 73 BD on a 7-day itinerary.
    // responseSchema guarantees valid JSON shape, not correct arithmetic.
    // Computing it ourselves is deterministic and costs nothing.
    if (Array.isArray(safeItinerary?.days)) {
      let recalculatedTotal = 0;
      for (const day of safeItinerary.days) {
        if (!Array.isArray(day.activities)) continue;
        for (const act of day.activities) {
          if (typeof act?.costEstimate === "number") {
            recalculatedTotal += act.costEstimate;
          }
        }
      }
      console.log(
        "STEP 7C: model reported total:",
        safeItinerary.totalEstimatedCost,
        "| recalculated total:",
        recalculatedTotal,
      );
      safeItinerary.totalEstimatedCost = recalculatedTotal;
    }

    console.log(
      "STEP 7: parsed itinerary:",
      JSON.stringify(safeItinerary).slice(0, 800),
    );

    return new Response(JSON.stringify(safeItinerary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.log(
      "CRASH CAUGHT:",
      err instanceof Error ? err.message : String(err),
    );
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
