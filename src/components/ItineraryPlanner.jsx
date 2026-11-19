import { useState, useRef, useEffect, useId } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import PlannerForm from "./planner/PlannerForm";
import PlannerLoading from "./planner/PlannerLoading";
import DayTabs from "./planner/DayTabs";
import DayTimeline from "./planner/DayTimeline";
import { PearlIcon, CheckIcon } from "./planner/icons";
import Toast from "./ui/Toast";
import { useToast } from "./ui/useToast";
import Button from "./ui/Button";
import "./planner/planner.css";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Trips longer than this switch from stacked days to sticky day tabs.
const DAY_TABS_THRESHOLD = 3;
// How long a swapped / replanned stop stays marked as changed.
const CHANGE_MARK_MS = 6000;

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

// Display only. A sum of model-supplied floats can come out as 12.100000000000001.
function formatBD(amount) {
  return String(parseFloat(amount.toFixed(3)));
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollToStart(el) {
  el.scrollIntoView({ block: "start", behavior: prefersReducedMotion() ? "instant" : "smooth" });
}

function isAboveViewport(el) {
  const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 72;
  return el.getBoundingClientRect().top < navH;
}

// Bring the results column into view when its content changes out of sight.
// Stacked (below 900px) the results sit under the form, so always scroll.
// Side by side, the loading card is pinned in view by CSS; scroll only when
// a result or an error lands and its top has already been scrolled past.
function revealResults(el, status) {
  if (!el) return;
  const stacked = window.matchMedia("(max-width: 899px)").matches;
  if (!stacked && (status === "loading" || !isAboveViewport(el))) return;
  scrollToStart(el);
}

export default function ItineraryPlanner() {
  const location = useLocation();
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

  const [openSwapKey, setOpenSwapKey] = useState(null);
  const [swapReasonDrafts, setSwapReasonDrafts] = useState({});
  const [swappingKey, setSwappingKey] = useState(null);
  const [swapError, setSwapError] = useState({});

  // "idle" | "saving" | "saved" | "needs-login" | "error"
  const [saveState, setSaveState] = useState("idle");
  const [saveError, setSaveError] = useState("");

  // ---- Results view state (presentation only) --------------------------
  const idBase = useId();
  const rootRef = useRef(null);
  const resultsRef = useRef(null);
  const { toast, showToast, dismissToast } = useToast();
  // "form" when the trip was generated here, "saved" when it came from Profile.
  const [resultSource, setResultSource] = useState(null);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  // One level of undo per day: { [dayIdx]: { kind, activities, hadNote, lastChangeNote } }
  const [undoByDay, setUndoByDay] = useState({});
  // Stops to highlight after a swap / replan: { dayIdx, indices, nonce }
  const [changed, setChanged] = useState(null);
  const changeTimerRef = useRef(null);
  const [focusRequest, setFocusRequest] = useState(null);

  // Latest committed values, for code that runs after an await or from a
  // toast button created during an earlier render.
  const itineraryRef = useRef(itinerary);
  const undoRef = useRef(undoByDay);
  useEffect(() => {
    itineraryRef.current = itinerary;
    undoRef.current = undoByDay;
  });

  useEffect(() => () => clearTimeout(changeTimerRef.current), []);

  // A new itinerary invalidates everything that was keyed to the old one's
  // day and stop indices.
  function resetResultView(source) {
    setResultSource(source);
    setActiveDayIdx(0);
    setUndoByDay({});
    setChanged(null);
    clearTimeout(changeTimerRef.current);
    setOpenSwapKey(null);
    setOpenReplanFormDay(null);
    setSwapError({});
    setReplanError({});
  }

  // Called by the replan and swap handlers once their change is applied.
  // previousDay is the day exactly as it was before the change.
  function recordChange(dayIdx, kind, previousDay, indices) {
    if (previousDay) {
      setUndoByDay((prev) => ({
        ...prev,
        [dayIdx]: {
          kind,
          activities: previousDay.activities,
          hadNote: Object.prototype.hasOwnProperty.call(previousDay, "lastChangeNote"),
          lastChangeNote: previousDay.lastChangeNote,
        },
      }));
    }

    setChanged({ dayIdx, indices, nonce: Date.now() });
    clearTimeout(changeTimerRef.current);
    changeTimerRef.current = setTimeout(() => setChanged(null), CHANGE_MARK_MS);

    const dayLabel = previousDay?.day ?? dayIdx + 1;
    showToast({
      tone: "success",
      message: kind === "swap" ? `Stop swapped on day ${dayLabel}.` : `Day ${dayLabel} replanned.`,
      action: previousDay ? { label: "Undo", onClick: () => handleUndoDay(dayIdx) } : undefined,
    });

    // The confirm button that had focus is about to unmount.
    setFocusRequest({
      id: kind === "swap" ? `${idBase}-stop-${dayIdx}-${indices[0]}` : `${idBase}-day-${dayIdx}`,
    });
  }

  // Restores the day to how it was before its most recent swap or replan,
  // and recalculates the total. Reads refs, not state, because it is also
  // called from the toast's Undo button.
  function handleUndoDay(dayIdx) {
    const entry = undoRef.current[dayIdx];
    if (!entry) return;
    const dayLabel = itineraryRef.current?.days?.[dayIdx]?.day ?? dayIdx + 1;

    setItinerary((prev) => {
      if (!prev) return prev;
      const nextDays = prev.days.map((d, dIdx) => {
        if (dIdx !== dayIdx) return d;
        const restored = { ...d, activities: entry.activities };
        if (entry.hadNote) restored.lastChangeNote = entry.lastChangeNote;
        else delete restored.lastChangeNote;
        return restored;
      });
      return {
        ...prev,
        days: nextDays,
        totalEstimatedCost: recomputeItineraryTotal(nextDays),
      };
    });

    setUndoByDay((prev) => {
      const next = { ...prev };
      delete next[dayIdx];
      return next;
    });
    // Stop indices on this day may point at different stops again.
    setOpenSwapKey((key) => (typeof key === "string" && key.startsWith(`${dayIdx}-`) ? null : key));
    setChanged(null);
    clearTimeout(changeTimerRef.current);
    setActiveDayIdx(dayIdx);
    showToast({ message: `Day ${dayLabel} is back to how it was.` });
    setFocusRequest({ id: `${idBase}-day-${dayIdx}` });
  }

  // Restore focus only if it was dropped (the focused control unmounted).
  // Never pull focus away from something the user has moved on to.
  useEffect(() => {
    if (!focusRequest) return;
    const active = document.activeElement;
    if (active && active !== document.body && document.body.contains(active)) return;
    document.getElementById(focusRequest.id)?.focus({ preventScroll: true });
  }, [focusRequest]);

  // Save status used to be inline text next to the button. It is now a
  // toast, driven from saveState so handleSaveItinerary stays untouched.
  useEffect(() => {
    if (saveState === "saved") {
      showToast({ tone: "success", message: "Saved to your profile." });
    } else if (saveState === "needs-login") {
      showToast({ message: "Log in to save this trip.", link: { label: "Log in", to: "/login" } });
    } else if (saveState === "error") {
      showToast({ tone: "error", message: saveError || "Couldn't save this itinerary." });
    } else if (saveState === "saving") {
      dismissToast();
    }
  }, [saveState, saveError, showToast, dismissToast]);

  // Bring the results into view when something happens there out of sight
  // (loading, result, error, a saved trip opened from Profile).
  useEffect(() => {
    if (status === "idle") return;
    revealResults(resultsRef.current, status);
  }, [status]);

  // Arriving here from Profile's "View" button — render the saved trip
  // directly instead of showing the empty planning form.
  useEffect(() => {
    if (location.state?.loadedItinerary) {
      setItinerary(location.state.loadedItinerary);
      setStatus("success");
      resetResultView("saved");
    }
  }, [location.state]);

  async function handleSaveItinerary() {
    setSaveState("saving");
    setSaveError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaveState("needs-login");
      return;
    }

    const { error: insertError } = await supabase
      .from("saved_itineraries")
      .insert({ user_id: user.id, itinerary });

    if (insertError) {
      setSaveState("error");
      setSaveError(insertError.message);
      return;
    }

    setSaveState("saved");
  }

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

      const previousDay = itineraryRef.current?.days?.[dayIdx]; // undo snapshot

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

      recordChange(
        dayIdx,
        "replan",
        previousDay,
        data.activities.map((_, i) => completedActivities.length + i),
      );

      setOpenReplanFormDay(null);
      setReasonDrafts((prev) => ({ ...prev, [dayIdx]: "" }));
    } catch (err) {
      console.error("replan-day failed:", err);
      setReplanError((prev) => ({ ...prev, [dayIdx]: err.message || "Something went wrong replanning this day." }));
    } finally {
      setReplanningDay(null);
    }
  }

  async function handleSwapActivity(dayIdx, aIdx) {
    const key = `${dayIdx}-${aIdx}`;
    const day = itinerary.days[dayIdx];
    const activityToReplace = day.activities[aIdx];
    const otherActivities = day.activities.filter((_, i) => i !== aIdx);

    setSwappingKey(key);
    setSwapError((prev) => ({ ...prev, [key]: null }));

    const payload = {
      day: day.day,
      dayTitle: day.title,
      activityToReplace,
      otherActivities,
      reason: swapReasonDrafts[key] || "wants something different",
      budget: budgetTier,
      interests,
      pace,
      familyType,
    };

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/swap-activity`, {
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
      if (!data.activity) {
        throw new Error("Got a response back but couldn't find a replacement activity in it.");
      }

      const previousDay = itineraryRef.current?.days?.[dayIdx]; // undo snapshot

      setItinerary((prev) => {
        const nextDays = prev.days.map((d, dIdx) => {
          if (dIdx !== dayIdx) return d;
          const nextActivities = d.activities.map((a, i) =>
            i === aIdx ? { ...data.activity, done: false } : a,
          );
          return { ...d, activities: nextActivities };
        });
        return {
          ...prev,
          days: nextDays,
          totalEstimatedCost: recomputeItineraryTotal(nextDays),
        };
      });

      recordChange(dayIdx, "swap", previousDay, [aIdx]);

      setOpenSwapKey(null);
      setSwapReasonDrafts((prev) => ({ ...prev, [key]: "" }));
    } catch (err) {
      console.error("swap-activity failed:", err);
      setSwapError((prev) => ({ ...prev, [key]: err.message || "Something went wrong swapping this activity." }));
    } finally {
      setSwappingKey(null);
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
      resetResultView("form");
    } catch (err) {
      console.error("generate-itinerary failed:", err);
      setErrorMsg(err.message || "Something went wrong talking to the itinerary service.");
      setStatus("error");
    }
  }

  const daysMismatch =
    status === "success" && itinerary && itinerary.days.length !== requestedDaysRef.current;

  // requestedDaysRef is only set by the form, so a saved trip opened from
  // Profile would always "mismatch" the default of 3 days.
  const showDaysMismatch = daysMismatch && resultSource === "form";

  const dayList = status === "success" && itinerary ? itinerary.days : [];
  const useTabs = dayList.length > DAY_TABS_THRESHOLD;
  const shownDayIdx = Math.min(activeDayIdx, Math.max(dayList.length - 1, 0));

  return (
    <div className="planner" ref={rootRef}>
      <header className="planner-head">
        <span className="planner-eyebrow">Plan your trip</span>
        <h1 className="planner-head__title">
          Build your Bahrain <em>itinerary</em>
        </h1>
        <p className="planner-head__sub">
          Tell us the shape of the trip, we'll hand back a day-by-day plan.
        </p>
      </header>

      <div className="planner-grid">
        <div className="planner-form-col">
          <PlannerForm
            days={days}
            setDays={setDays}
            startDate={startDate}
            setStartDate={setStartDate}
            budgetTier={budgetTier}
            setBudgetTier={setBudgetTier}
            pace={pace}
            setPace={setPace}
            familyType={familyType}
            setFamilyType={setFamilyType}
            interests={interests}
            toggleInterest={toggleInterest}
            status={status}
            onSubmit={handleSubmit}
          />
        </div>

        <section
          className="planner-results"
          ref={resultsRef}
          aria-label="Your itinerary"
          aria-busy={status === "loading"}
        >
          <p className="ui-sr-only" role="status">
            {status === "success" && itinerary
              ? `Itinerary ready: ${itinerary.days.length} ${itinerary.days.length === 1 ? "day" : "days"}.`
              : ""}
          </p>

          {status !== "success" && (
            <div className="planner-results__pin">
              {status === "idle" && (
                <div className="ui-empty planner-idle">
                  <PearlIcon className="ui-empty__icon" />
                  <p className="ui-empty__title">No plan yet</p>
                  <p className="ui-empty__desc">
                    Set the trip up on the left. Before writing each day we check this week's Manama
                    forecast, and whether your dates land on a causeway weekend or in Ramadan.
                  </p>
                </div>
              )}

              {status === "loading" && <PlannerLoading />}

              {status === "error" && (
                <div className="planner-error" role="alert">
                  <h2 className="planner-error__title">Couldn't generate that itinerary</h2>
                  <p className="planner-error__msg">{errorMsg}</p>
                  <Button size="sm" onClick={handleSubmit}>
                    Try again
                  </Button>

                  {rawDebug && (
                    <details className="planner-debug">
                      <summary>Raw response (debug)</summary>
                      <pre>{JSON.stringify(rawDebug, null, 2)}</pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          )}

          {status === "success" && itinerary && (
            <>
              {showDaysMismatch && (
                <p className="planner-notice">
                  You asked for {requestedDaysRef.current}{" "}
                  {requestedDaysRef.current === 1 ? "day" : "days"}. This plan covers{" "}
                  {itinerary.days.length}.
                </p>
              )}

              <div className="planner-results__head">
                <span className="planner-eyebrow">Your itinerary</span>
                <h2 className="planner-results__title">{itinerary.destination || "Bahrain"}</h2>
                {itinerary.summary && <p className="planner-results__summary">{itinerary.summary}</p>}
              </div>

              {useTabs && (
                <DayTabs
                  days={dayList}
                  activeIdx={shownDayIdx}
                  onChange={setActiveDayIdx}
                  idBase={idBase}
                />
              )}

              <div className="planner-days">
                {dayList.map((day, dayIdx) => {
                  if (useTabs && dayIdx !== shownDayIdx) return null;
                  return (
                    <div
                      key={dayIdx}
                      role={useTabs ? "tabpanel" : undefined}
                      id={useTabs ? `${idBase}-panel-${dayIdx}` : undefined}
                      aria-labelledby={useTabs ? `${idBase}-tab-${dayIdx}` : undefined}
                    >
                      <DayTimeline
                        day={day}
                        dayIdx={dayIdx}
                        idBase={idBase}
                        changedIndices={changed && changed.dayIdx === dayIdx ? changed.indices : null}
                        changeNonce={changed ? changed.nonce : 0}
                        onToggleDone={toggleActivityDone}
                        swap={{
                          openKey: openSwapKey,
                          setOpenKey: setOpenSwapKey,
                          drafts: swapReasonDrafts,
                          setDrafts: setSwapReasonDrafts,
                          busyKey: swappingKey,
                          errors: swapError,
                          onConfirm: handleSwapActivity,
                        }}
                        replan={{
                          isOpen: openReplanFormDay === dayIdx,
                          setOpenDay: setOpenReplanFormDay,
                          draft: reasonDrafts[dayIdx] || "",
                          setDrafts: setReasonDrafts,
                          busy: replanningDay === dayIdx,
                          error: replanError[dayIdx],
                          onConfirm: handleReplanDay,
                        }}
                        undo={undoByDay[dayIdx] || null}
                        onUndo={handleUndoDay}
                      />
                    </div>
                  );
                })}
              </div>

              {typeof itinerary.totalEstimatedCost === "number" && (
                <div className="planner-total">
                  <span className="planner-total__label">Estimated total</span>
                  <span className="planner-total__value">{formatBD(itinerary.totalEstimatedCost)} BD</span>
                </div>
              )}

              {itinerary.tips && itinerary.tips.length > 0 && (
                <div className="planner-tips">
                  <span className="planner-eyebrow">Tips</span>
                  <ul className="planner-tips__list">
                    {itinerary.tips.map((tip, i) => (
                      <li key={i} className="planner-tips__item">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="planner-actions">
                <Button
                  variant="quiet"
                  onClick={() => {
                    setStatus("idle");
                    setItinerary(null);
                    setSaveState("idle");
                    resetResultView(null);
                    dismissToast();
                    if (rootRef.current && isAboveViewport(rootRef.current)) scrollToStart(rootRef.current);
                  }}
                >
                  Plan another trip
                </Button>

                {saveState === "needs-login" ? (
                  <Button to="/login" variant="secondary">
                    Log in to save
                  </Button>
                ) : (
                  <Button
                    onClick={handleSaveItinerary}
                    disabled={saveState === "saving" || saveState === "saved"}
                  >
                    {saveState === "saved" && <CheckIcon />}
                    {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : "Save this itinerary"}
                  </Button>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      <div className="sadu-strip planner-sadu"></div>

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
