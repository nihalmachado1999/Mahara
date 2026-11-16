import { useEffect, useState } from "react";
import { CheckIcon } from "./icons";

/* ---------------------------------------------------------------
   Staged loading state for itinerary generation.

   Every stage names something supabase/functions/generate-itinerary
   really does, in the order it does it:
     1. getBahrainHeatContext      — Open-Meteo 7-day forecast, 3s timeout
     2. getCausewayRamadanContext  — Thu–Sat causeway days, Ramadan ranges
     3. the model call             — up to 120s, one retry

   The client gets no progress events. Stages advance on timers that
   follow that order (the weather call cannot outlive its 3s timeout);
   the last stage holds until the response arrives. Do not add stages
   the backend does not perform, and do not add a percentage.
------------------------------------------------------------------ */

const STAGES = [
  { id: "weather", label: "Checking the 7-day forecast for Manama", ms: 3500 },
  { id: "dates", label: "Checking your dates for causeway weekends and Ramadan", ms: 1200 },
  { id: "plan", label: "Writing your day-by-day plan", ms: null },
];
const SLOW_NOTE_MS = 15000;

export default function PlannerLoading() {
  const [stage, setStage] = useState(0);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timers = [];
    let elapsed = 0;
    STAGES.forEach((s, i) => {
      if (s.ms == null) return;
      elapsed += s.ms;
      timers.push(setTimeout(() => setStage(i + 1), elapsed));
    });
    timers.push(setTimeout(() => setSlow(true), SLOW_NOTE_MS));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="planner-loading">
      <span className="planner-eyebrow">Building your itinerary</span>
      <p className="ui-sr-only" role="status">
        Step {stage + 1} of {STAGES.length}: {STAGES[stage].label}
      </p>
      <ol className="planner-loading__steps" aria-hidden="true">
        {STAGES.map((s, i) => {
          const state = i < stage ? "done" : i === stage ? "active" : "pending";
          return (
            <li key={s.id} className={`planner-loading__step is-${state}`}>
              <span className="planner-loading__node">{state === "done" && <CheckIcon />}</span>
              <span className="planner-loading__label">{s.label}</span>
            </li>
          );
        })}
      </ol>
      {slow && (
        <p className="planner-loading__note">Still writing. Longer trips can take a minute or two.</p>
      )}
    </div>
  );
}
