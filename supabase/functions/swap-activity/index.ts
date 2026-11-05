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
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/rpc/check_rate_limit`,
            {
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
            },
        );
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
    console.log("STEP 1: swap-activity invoked");

    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (!(await checkRateLimit(req))) {
        console.log("STEP: rate limit exceeded, rejecting");
        return new Response(
            JSON.stringify({
                error:
                    "Too many requests — please wait a moment and try again.",
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
            activityToReplace,
            otherActivities,
            reason,
            budget,
            interests,
            pace,
            familyType,
        } = await req.json();

        console.log("STEP 2: request body parsed", {
            day,
            activityToReplace: activityToReplace?.title,
            otherCount: otherActivities?.length,
            reason,
        });

        const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
        if (!GEMINI_API_KEY) {
            throw new Error("Missing Gemini API key in Supabase secrets");
        }

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
                    const isTimeout = err instanceof Error &&
                        err.name === "AbortError";
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
wants to replace ONE specific stop on Day ${day} of their trip ("${dayTitle}")
with a single alternative — everything else on this day is staying exactly
as planned, so do not suggest anything that duplicates or overlaps with it.

Do not reference the former Pearl Monument, Pearl Roundabout, or "Lulu
Roundabout" under any name — it was demolished in 2011 and the site is not a
tourist attraction. Never invent a name for it.

Only name a specific restaurant, cafe, or monument if you are confident it is
real. If unsure, describe the type of venue or neighborhood generally.

costEstimate must be a number in Bahraini Dinar, no currency symbols.

Keep the new stop in roughly the same time slot as the one being replaced,
unless the reason given clearly calls for a different time of day.`;

        const userPrompt =
            `Day ${day} — the rest of the plan, staying exactly as-is:
${JSON.stringify(otherActivities ?? [])}

The one stop being replaced:
${JSON.stringify(activityToReplace ?? {})}

Reason for the swap: ${reason || "wants something different"}

Traveler type: ${familyType}. Budget level: ${budget}.
Interests: ${(interests || []).join(", ")}. Pace: ${pace}.

Suggest ONE replacement activity only.`;

        const responseSchema = {
            type: "OBJECT",
            properties: {
                note: { type: "STRING" },
                activity: {
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
            required: ["note", "activity"],
        };

        console.log("STEP 3: calling Gemini");
        const response = await callGeminiWithRetry(
            {
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                    maxOutputTokens: 1200,
                    thinkingConfig: { thinkingLevel: "MINIMAL" },
                },
            },
            45000,
        );
        console.log("STEP 4: Gemini responded, status:", response.status);

        const data = await response.json();
        if (!response.ok || data.error) {
            throw new Error(
                "Gemini Error: " + JSON.stringify(data.error ?? data),
            );
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
        if (
            !parsed || !parsed.activity || typeof parsed.activity !== "object"
        ) {
            console.log(
                "STEP 4B: content that failed to parse:",
                content.slice(0, 1000),
            );
            throw new Error(
                "Could not extract a valid replacement activity from the model response.",
            );
        }

        const BLOCKED_SITE_PATTERN =
            /pearl\s*(monument|roundabout)|lulu\s*roundabout|al[\s-]?farooq/i;
        const act = parsed.activity;
        const text = `${act?.title ?? ""} ${act?.description ?? ""} ${
            act?.location ?? ""
        }`;
        if (BLOCKED_SITE_PATTERN.test(text)) {
            console.log(
                "STEP 5: replacement hit blocked-site filter, rejecting:",
                JSON.stringify(act),
            );
            throw new Error(
                "The model's suggested replacement referenced a blocked site. Try again.",
            );
        }

        console.log("STEP 6: returning replacement activity:", act.title);

        return new Response(
            JSON.stringify({ note: parsed.note ?? "", activity: act }),
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
