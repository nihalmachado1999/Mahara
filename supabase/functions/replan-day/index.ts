const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function checkRateLimit(
  req: Request,
  limit = 10,
  windowSeconds = 60,
): Promise<boolean> {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.log("STEP: rate limit check skipped, missing built-in config");
    return true;
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown";

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/check_rate_limit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        p_key: ip,
        p_limit: limit,
        p_window_seconds: windowSeconds,
      }),
    });
    if (!res.ok) {
      console.log("STEP: rate limit RPC failed, failing open");
      return true;
    }
    return (await res.json()) === true;
  } catch {
    console.log("STEP: rate limit check errored, failing open");
    return true;
  }
}

Deno.serve(async (req) => {
  console.log("STEP 1: replan-day invoked");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!(await checkRateLimit(req))) {
    console.log("STEP: rate limit exceeded, rejecting");
    return new Response(
      JSON.stringify({
        error: "Too many requests — please wait a moment and try again.",
      }),
      {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    const {
      day,
      dayTitle,
      completedActivities,
      remainingActivities,
      reason,
      currentTime,
      budget,
      interests,
      pace,
      familyType,
    } = await req.json();

    console.log("STEP 2: request body parsed", {
      day,
      completedCount: completedActivities?.length,
      remainingCount: remainingActivities?.length,
      reason,
      currentTime,
    });

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("Missing Gemini API key in Supabase secrets");
    }

    async function getBahrainHeatContext(): Promise<string> {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=26.2285&longitude=50.5860&daily=temperature_2m_max,apparent_temperature_max&timezone=Asia/Bahrain&forecast_days=1",
          { signal: controller.signal },
        );
        clearTimeout(timeout);
        if (!res.ok) return "";
        const weather = await res.json();
        const maxTemps: number[] = weather?.daily?.temperature_2m_max ?? [];
        const feelsLike: number[] = weather?.daily?.apparent_temperature_max ??
          [];
        if (maxTemps.length === 0) return "";
        const avgMax = Math.round(maxTemps[0]);
        const avgFeels = feelsLike.length > 0
          ? Math.round(feelsLike[0])
          : avgMax;
        return `Current forecast: today's high is around ${avgMax}°C (feels like roughly ${avgFeels}°C).`;
      } catch {
        return "";
      }
    }

    const heatContext = await getBahrainHeatContext();
    console.log("STEP 2B: heat context:", heatContext || "(unavailable)");

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

    const systemPrompt = `You are an expert Bahrain travel guide. A traveler
is partway through Day ${day} of their trip ("${dayTitle}") and conditions
have changed. Adjust the REMAINING part of the day only — do not touch or
re-list anything already completed.

Do not reference the former Pearl Monument, Pearl Roundabout, or "Lulu
Roundabout" under any name — it was demolished in 2011 and the site is not a
tourist attraction. Never invent a name for it.

Only name specific restaurants, cafes, or monuments if you are confident they
are real. If unsure, describe the type of venue or neighborhood generally.

costEstimate must be a number in Bahraini Dinar, no currency symbols.

Keep the spirit of what was originally planned where it still makes sense —
this is an adjustment, not a brand new day. In changeNote, briefly explain
what changed and why, in one sentence a traveler would actually want to read.`;

    const userPrompt = `Day ${day} so far — already completed:
${JSON.stringify(completedActivities ?? [])}

Originally planned for the rest of the day (before the change):
${JSON.stringify(remainingActivities ?? [])}

Current time: ${currentTime || "unknown, assume afternoon"}
Reason for replanning: ${reason || "plans changed"}
${heatContext}

Traveler type: ${familyType}. Budget level: ${budget}.
Interests: ${(interests || []).join(", ")}. Pace: ${pace}.

Generate a replacement plan for ONLY the remaining part of the day.`;

    const responseSchema = {
      type: "OBJECT",
      properties: {
        changeNote: { type: "STRING" },
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
      required: ["changeNote", "activities"],
    };

    console.log("STEP 3: calling Gemini");
    const response = await callGeminiWithRetry(
      {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          maxOutputTokens: 2000,
          thinkingConfig: { thinkingLevel: "MINIMAL" },
        },
      },
      60000,
    );
    console.log("STEP 4: Gemini responded, status:", response.status);

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error("Gemini Error: " + JSON.stringify(data.error ?? data));
    }

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

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
          // fenced block wasn't valid JSON either
        }
      }
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start !== -1 && end !== -1 && end > start) {
        try {
          return JSON.parse(raw.slice(start, end + 1));
        } catch {
          // last resort failed too
        }
      }
      return null;
    }

    const parsed = extractJSON(content);

    if (!parsed || !Array.isArray(parsed.activities)) {
      console.log(
        "STEP 4B: content that failed to parse:",
        content.slice(0, 1000),
      );
      throw new Error(
        "Could not extract a valid replan from the model response.",
      );
    }

    const BLOCKED_SITE_PATTERN =
      /pearl\s*(monument|roundabout)|lulu\s*roundabout|al[\s-]?farooq/i;

    // deno-lint-ignore no-explicit-any
    const safeActivities = parsed.activities.filter((act: any) => {
      const text = `${act?.title ?? ""} ${act?.description ?? ""} ${
        act?.location ?? ""
      }`;
      const blocked = BLOCKED_SITE_PATTERN.test(text);
      if (blocked) {
        console.log("STEP 5: removed blocked activity:", JSON.stringify(act));
      }
      return !blocked;
    });

    console.log(
      "STEP 6: returning",
      safeActivities.length,
      "replanned activities",
    );

    return new Response(
      JSON.stringify({
        changeNote: parsed.changeNote ?? "",
        activities: safeActivities,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
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
