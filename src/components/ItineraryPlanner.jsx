import { useState, useRef } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const INTERESTS = [
  { id: "heritage", label: "Pearling & Heritage" },
  { id: "food", label: "Food & Souqs" },
  { id: "beaches", label: "Beaches & Coast" },
  { id: "nightlife", label: "Nightlife" },
  { id: "family", label: "Family Fun" },
  { id: "nature", label: "Nature & Outdoors" },
  { id: "shopping", label: "Shopping" },
  { id: "culture", label: "Art & Museums" },
];

const PACE_OPTIONS = [
  { id: "relaxed", label: "Relaxed", desc: "2–3 stops/day" },
  { id: "balanced", label: "Balanced", desc: "4–5 stops/day" },
  { id: "packed", label: "Packed", desc: "6+ stops/day" },
];

const FAMILY_OPTIONS = [
  { id: "solo", label: "Solo" },
  { id: "couple", label: "Couple" },
  { id: "family", label: "Family w/ Kids" },
  { id: "friends", label: "Friends Group" },
];

const BUDGET_TIERS = [
  { id: "budget", label: "Budget", desc: "Under 15 BD/day" },
  { id: "comfort", label: "Comfort", desc: "15–40 BD/day" },
  { id: "luxury", label: "Luxury", desc: "40+ BD/day" },
];

function getCurrentTimeString() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function recomputeItineraryTotal(days) {
  let total = 0;
  for (const day of days) {
    for (const act of day.activities || []) {
      if (typeof act.costEstimate === "number") total += act.costEstimate;
    }
  }
  return total;
}

function extractJSON(str) {
  if (typeof str !== "string") return null;
  try {
    return JSON.parse(str);
  } catch {
    /* fall through */
  }
  const fenced = str.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {
      /* fall through */
    }
  }
  const start = str.indexOf("{");
  const end = str.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(str.slice(start, end + 1));
    } catch {
      /* give up */
    }
  }
  return null;
}

function normalizeItinerary(raw) {
  if (!raw) return null;
  const candidates = [raw, raw.itinerary, raw.data];
  const content = raw?.choices?.[0]?.message?.content;
  if (typeof content === "string") {
    const parsed = extractJSON(content);
    if (parsed) candidates.push(parsed, parsed.itinerary);
  }
  for (const c of candidates) {
    if (c && Array.isArray(c.days) && c.days.length > 0) {
      return c;
    }
  }
  return null;
}

function TimeIconMorning() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3.5" stroke="#B8924A" strokeWidth="1.4" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6L13 13M13 3l-1.4 1.4M4.4 11.6L3 13" stroke="#B8924A" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function TimeIconEvening() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M13 9.5A5.5 5.5 0 1 1 6.5 3a4.2 4.2 0 0 0 6.5 6.5Z" stroke="#9B1B30" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
function TimeIconDefault() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3.5" stroke="#B8924A" strokeWidth="1.4" />
      <path d="M2 8h1.5M12.5 8H14M8 2v1.5M8 12.5V14" stroke="#B8924A" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function TimeIcon({ time = "" }) {
  const t = String(time).toLowerCase();
  const clockMatch = t.match(/^(\d{1,2}):\d{2}/);
  if (clockMatch) {
    const hour = parseInt(clockMatch[1], 10);
    if (hour < 12) return <TimeIconMorning />;
    if (hour < 17) return <TimeIconDefault />;
    return <TimeIconEvening />;
  }
  if (t.includes("morning")) return <TimeIconMorning />;
  if (t.includes("evening") || t.includes("night")) return <TimeIconEvening />;
  return <TimeIconDefault />;
}

function SaduDivider() {
  return <div className="sadu-strip" style={{ margin: "2rem 0" }}></div>;
}

function Segmented({ options, value, onChange }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className="font-body text-left px-3 py-2.5 rounded-[8px] border transition-colors"
            style={{
              borderColor: active ? "#9B1B30" : "rgba(26,20,16,0.15)",
              background: active ? "#9B1B30" : "transparent",
              color: active ? "#FAF6EF" : "#1A1410",
            }}
          >
            <div className="font-heading text-sm font-semibold">{opt.label}</div>
            {opt.desc && (
              <div className="font-label text-[11px] mt-0.5" style={{ color: active ? "#FAF6EF" : "rgba(26,20,16,0.55)" }}>
                {opt.desc}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function ItineraryPlanner() {
  const [days, setDays] = useState(3);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [budgetTier, setBudgetTier] = useState("comfort");
  const [interests, setInterests] = useState([]);
  const [pace, setPace] = useState("balanced");
  const [familyType, setFamilyType] = useState("couple");
  const [status, setStatus] = useState("idle");
  const [itinerary, setItinerary] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [rawDebug, setRawDebug] = useState(null);
  const requestedDaysRef = useRef(days);

  const [openReplanFormDay, setOpenReplanFormDay] = useState(null);
  const [reasonDrafts, setReasonDrafts] = useState({});
  const [replanningDay, setReplanningDay] = useState(null);
  const [replanError, setReplanError] = useState({});

  const toggleInterest = (id) => {
    setInterests((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  function toggleActivityDone(dayIdx, aIdx) {
    setItinerary((prev) => {
      if (!prev) return prev;
      const nextDays = prev.days.map((day, dIdx) => {
        if (dIdx !== dayIdx) return day;
        const nextActivities = day.activities.map((act, i) =>
          i === aIdx ? { ...act, done: !act.done } : act,
        );
        return { ...day, activities: nextActivities };
      });
      return { ...prev, days: nextDays };
    });
  }

  async function handleReplanDay(dayIdx) {
    const day = itinerary.days[dayIdx];
    const completedActivities = (day.activities || []).filter((a) => a.done);
    const remainingActivities = (day.activities || []).filter((a) => !a.done);

    if (remainingActivities.length === 0) {
      setReplanError((prev) => ({ ...prev, [dayIdx]: "Nothing left to replan — every stop on this day is already marked done." }));
      return;
    }

    setReplanningDay(dayIdx);
    setReplanError((prev) => ({ ...prev, [dayIdx]: null }));

    const payload = {
      day: day.day,
      dayTitle: day.title,
      completedActivities,
      remainingActivities,
      reason: reasonDrafts[dayIdx] || "plans changed",
      currentTime: getCurrentTimeString(),
      budget: budgetTier,
      interests,
      pace,
      familyType,
    };

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/replan-day`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Edge function returned ${res.status}. ${text.slice(0, 200)}`);
      }

      const data = await res.json();
      if (!Array.isArray(data.activities)) {
        throw new Error("Got a response back but couldn't find an activities list in it.");
      }

      setItinerary((prev) => {
        const nextDays = prev.days.map((d, dIdx) => {
          if (dIdx !== dayIdx) return d;
          const mergedActivities = [
            ...completedActivities,
            ...data.activities.map((a) => ({ ...a, done: false })),
          ];
          return { ...d, activities: mergedActivities, lastChangeNote: data.changeNote || "" };
        });
        return {
          ...prev,
          days: nextDays,
          totalEstimatedCost: recomputeItineraryTotal(nextDays),
        };
      });

      setOpenReplanFormDay(null);
      setReasonDrafts((prev) => ({ ...prev, [dayIdx]: "" }));
    } catch (err) {
      console.error("replan-day failed:", err);
      setReplanError((prev) => ({ ...prev, [dayIdx]: err.message || "Something went wrong replanning this day." }));
    } finally {
      setReplanningDay(null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (interests.length === 0) {
      setErrorMsg("Pick at least one interest — the model needs something to build around.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");
    setRawDebug(null);
    requestedDaysRef.current = days;

    const payload = { days, startDate, budget: budgetTier, interests, pace, familyType };

    try {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.warn("⚠️ Supabase env vars missing — showing mock itinerary data.");
        setItinerary(null);
        setStatus("error");
        setErrorMsg("Supabase env vars are not configured.");
        return;
      }

      const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-itinerary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Edge function returned ${res.status}. ${text.slice(0, 200)}`);
      }

      const data = await res.json();
      const normalized = normalizeItinerary(data);

      if (!normalized) {
        setRawDebug(data);
        throw new Error("Got a response back but couldn't match a known shape — raw payload is below so you can see what actually came back.");
      }

      setItinerary(normalized);
      setStatus("success");
    } catch (err) {
      console.error("generate-itinerary failed:", err);
      setErrorMsg(err.message || "Something went wrong talking to the itinerary service.");
      setStatus("error");
    }
  }

  const daysMismatch =
    status === "success" && itinerary && itinerary.days.length !== requestedDaysRef.current;

  return (
    <div className="min-h-full w-full" style={{ background: "#FAF6EF" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&family=Space+Grotesk:wght@500;600&family=Cormorant+Garamond:wght@500;600;700&display=swap');
        .font-heading { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }
        .font-label { font-family: 'Space Grotesk', sans-serif; letter-spacing: 0.04em; text-transform: uppercase; }
        .font-display { font-family: 'Cormorant Garamond', serif; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .activity-checkbox { width: 16px; height: 16px; margin-top: 2px; accent-color: #9B1B30; cursor: pointer; flex-shrink: 0; }
      `}</style>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="font-label text-[11px] mb-2" style={{ color: "#B8924A" }}>
          Plan your trip
        </div>
        <h1 className="font-display text-4xl mb-1" style={{ color: "#1A1410" }}>
          Build your Bahrain itinerary
        </h1>
        <p className="font-body text-sm mb-8" style={{ color: "rgba(26,20,16,0.65)" }}>
          Tell us the shape of the trip, we'll hand back a day-by-day plan.
        </p>

        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-[8px] border"
          style={{ borderColor: "rgba(26,20,16,0.12)", background: "#ffffffaa" }}
        >
          <div className="mb-6">
            <label className="font-label text-[11px] block mb-2" style={{ color: "#1A1410" }}>
              Trip length
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDays((d) => Math.max(1, d - 1))}
                className="w-9 h-9 rounded-lg border font-heading text-lg"
                style={{ borderColor: "rgba(26,20,16,0.2)", color: "#1A1410" }}
              >
                –
              </button>
              <div className="font-heading text-xl w-20 text-center" style={{ color: "#1A1410" }}>
                {days} {days === 1 ? "day" : "days"}
              </div>
              <button
                type="button"
                onClick={() => setDays((d) => Math.min(14, d + 1))}
                className="w-9 h-9 rounded-lg border font-heading text-lg"
                style={{ borderColor: "rgba(26,20,16,0.2)", color: "#1A1410" }}
              >
                +
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="font-label text-[11px] block mb-2" style={{ color: "#1A1410" }}>
              Start date
            </label>
            <input
              type="date"
              value={startDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setStartDate(e.target.value)}
              className="font-body px-3 py-2.5 rounded-[8px] border w-full"
              style={{ borderColor: "rgba(26,20,16,0.2)", color: "#1A1410", background: "transparent" }}
            />
          </div>

          <div className="mb-6">
            <label className="font-label text-[11px] block mb-2" style={{ color: "#1A1410" }}>
              Budget tier
            </label>
            <Segmented options={BUDGET_TIERS} value={budgetTier} onChange={setBudgetTier} />
          </div>

          <div className="mb-6">
            <label className="font-label text-[11px] block mb-2" style={{ color: "#1A1410" }}>
              Pace
            </label>
            <Segmented options={PACE_OPTIONS} value={pace} onChange={setPace} />
          </div>

          <div className="mb-6">
            <label className="font-label text-[11px] block mb-2" style={{ color: "#1A1410" }}>
              Traveling as
            </label>
            <Segmented options={FAMILY_OPTIONS} value={familyType} onChange={setFamilyType} />
          </div>

          <div className="mb-2">
            <label className="font-label text-[11px] block mb-2" style={{ color: "#1A1410" }}>
              Interests
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {INTERESTS.map((opt) => {
                const active = interests.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleInterest(opt.id)}
                    className="font-body text-xs px-2.5 py-2 rounded-[8px] border text-center transition-colors"
                    style={{
                      borderColor: active ? "#9B1B30" : "rgba(26,20,16,0.18)",
                      background: active ? "#9B1B30" : "transparent",
                      color: active ? "#FAF6EF" : "#1A1410",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="font-heading font-semibold w-full mt-8 py-3 rounded-full transition-opacity"
            style={{
              background: "#9B1B30",
              color: "#FAF6EF",
              opacity: status === "loading" ? 0.6 : 1,
            }}
          >
            {status === "loading" ? "Building your itinerary…" : "Generate itinerary"}
          </button>
        </form>

        {status === "loading" && (
          <div className="mt-8 space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-20 rounded-[8px] animate-pulse"
                style={{ background: "rgba(26,20,16,0.06)" }}
              />
            ))}
          </div>
        )}

        {status === "error" && (
          <div
            className="mt-8 p-5 rounded-[8px] border"
            style={{ borderColor: "#9B1B30", background: "rgba(155,27,48,0.05)" }}
          >
            <div className="font-heading font-semibold text-sm mb-1" style={{ color: "#9B1B30" }}>
              Couldn't generate that itinerary
            </div>
            <p className="font-body text-sm mb-3" style={{ color: "#1A1410" }}>
              {errorMsg}
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              className="font-heading text-sm font-semibold px-4 py-2 rounded-lg"
              style={{ background: "#9B1B30", color: "#FAF6EF" }}
            >
              Try again
            </button>

            {rawDebug && (
              <details className="mt-4">
                <summary className="font-label text-[11px] cursor-pointer" style={{ color: "rgba(26,20,16,0.6)" }}>
                  Raw response (debug)
                </summary>
                <pre
                  className="mt-2 p-3 rounded-lg text-[11px] overflow-auto max-h-64"
                  style={{ background: "#1A1410", color: "#FAF6EF" }}
                >
                  {JSON.stringify(rawDebug, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        {status === "success" && itinerary && (
          <>
            <SaduDivider />

            {daysMismatch && (
              <div
                className="mb-4 p-3 rounded-[8px] font-body text-xs"
                style={{ background: "rgba(184,146,74,0.12)", color: "#1A1410" }}
              >
                Heads up — you asked for {requestedDaysRef.current} days, the model returned{" "}
                {itinerary.days.length}. Worth checking the prompt in your edge function.
              </div>
            )}

            <div className="mb-6">
              <div className="font-label text-[11px] mb-1" style={{ color: "#B8924A" }}>
                Your itinerary
              </div>
              <h2 className="font-display text-3xl mb-1" style={{ color: "#1A1410" }}>
                {itinerary.destination || "Bahrain"}
              </h2>
              {itinerary.summary && (
                <p className="font-body text-sm" style={{ color: "rgba(26,20,16,0.65)" }}>
                  {itinerary.summary}
                </p>
              )}
            </div>

            <div className="space-y-4">
              {itinerary.days.map((day, dayIdx) => {
                const remainingCount = (day.activities || []).filter((a) => !a.done).length;
                return (
                  <div
                    key={dayIdx}
                    className="p-5 rounded-[8px] border"
                    style={{ borderColor: "rgba(26,20,16,0.12)", background: "#ffffffaa" }}
                  >
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="font-label text-[11px]" style={{ color: "#9B1B30" }}>
                        Day {day.day ?? dayIdx + 1}
                      </span>
                      <span className="font-heading font-semibold text-base" style={{ color: "#1A1410" }}>
                        {day.title || `${(day.activities || []).length} stops planned`}
                      </span>
                    </div>

                    {day.lastChangeNote && (
                      <div
                        className="mb-4 p-3 rounded-[8px] font-body text-xs"
                        style={{ background: "rgba(184,146,74,0.12)", color: "#1A1410" }}
                      >
                        {day.lastChangeNote}
                      </div>
                    )}

                    <div className="space-y-3">
                      {(day.activities || []).map((act, aIdx) => (
                        <div key={aIdx} className="flex gap-3">
                          <input
                            type="checkbox"
                            className="activity-checkbox"
                            checked={!!act.done}
                            onChange={() => toggleActivityDone(dayIdx, aIdx)}
                            aria-label={`Mark "${act.title}" as done`}
                          />
                          <div className="mt-1 flex-shrink-0">
                            <TimeIcon time={act.time} />
                          </div>
                          <div className="flex-1" style={{ opacity: act.done ? 0.5 : 1 }}>
                            <div className="flex items-baseline justify-between gap-2">
                              <span
                                className="font-heading text-sm font-semibold"
                                style={{
                                  color: "#1A1410",
                                  textDecoration: act.done ? "line-through" : "none",
                                }}
                              >
                                {act.title}
                              </span>
                              {typeof act.costEstimate === "number" && (
                                <span className="font-label text-[11px]" style={{ color: "rgba(26,20,16,0.5)" }}>
                                  ~{act.costEstimate} BD
                                </span>
                              )}
                            </div>
                            {act.description && (
                              <p className="font-body text-xs mt-0.5" style={{ color: "rgba(26,20,16,0.7)" }}>
                                {act.description}
                              </p>
                            )}
                            {act.location && (
                              <p className="font-label text-[10px] mt-1" style={{ color: "#B8924A" }}>
                                {act.location}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(26,20,16,0.08)" }}>
                      {openReplanFormDay === dayIdx ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={reasonDrafts[dayIdx] || ""}
                            onChange={(e) =>
                              setReasonDrafts((prev) => ({ ...prev, [dayIdx]: e.target.value }))
                            }
                            placeholder="What changed? e.g. running late, too hot, want something different"
                            className="font-body text-xs px-3 py-2 rounded-[8px] border w-full"
                            style={{ borderColor: "rgba(26,20,16,0.2)", color: "#1A1410", background: "transparent" }}
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleReplanDay(dayIdx)}
                              disabled={replanningDay === dayIdx}
                              className="font-heading text-xs font-semibold px-3 py-2 rounded-lg"
                              style={{
                                background: "#9B1B30",
                                color: "#FAF6EF",
                                opacity: replanningDay === dayIdx ? 0.6 : 1,
                              }}
                            >
                              {replanningDay === dayIdx ? "Replanning…" : "Confirm replan"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setOpenReplanFormDay(null)}
                              disabled={replanningDay === dayIdx}
                              className="font-heading text-xs font-semibold px-3 py-2 rounded-lg border"
                              style={{ borderColor: "#1A1410", color: "#1A1410" }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setOpenReplanFormDay(dayIdx)}
                          disabled={remainingCount === 0}
                          className="font-heading text-xs font-semibold px-3 py-2 rounded-lg border transition-opacity"
                          style={{
                            borderColor: "#9B1B30",
                            color: "#9B1B30",
                            opacity: remainingCount === 0 ? 0.4 : 1,
                          }}
                        >
                          Replan rest of this day
                        </button>
                      )}

                      {replanError[dayIdx] && (
                        <p className="font-body text-xs mt-2" style={{ color: "#9B1B30" }}>
                          {replanError[dayIdx]}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {typeof itinerary.totalEstimatedCost === "number" && (
              <div
                className="mt-4 p-5 rounded-[8px] flex items-center justify-between"
                style={{ background: "#1A1410" }}
              >
                <span className="font-heading text-sm font-semibold" style={{ color: "#FAF6EF" }}>
                  Estimated total
                </span>
                <span className="font-display text-2xl" style={{ color: "#FAF6EF" }}>
                  {itinerary.totalEstimatedCost} BD
                </span>
              </div>
            )}

            {itinerary.tips && itinerary.tips.length > 0 && (
              <div className="mt-4 space-y-2">
                {itinerary.tips.map((tip, i) => (
                  <div
                    key={i}
                    className="font-body text-xs pl-3 py-1"
                    style={{ borderLeft: "2px solid #B8924A", color: "rgba(26,20,16,0.75)" }}
                  >
                    {tip}
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setStatus("idle");
                setItinerary(null);
              }}
              className="font-heading text-sm font-semibold mt-6 px-4 py-2 rounded-lg border"
              style={{ borderColor: "#1A1410", color: "#1A1410" }}
            >
              Plan another trip
            </button>
          </>
        )}
      </div>
    </div>
  );
}