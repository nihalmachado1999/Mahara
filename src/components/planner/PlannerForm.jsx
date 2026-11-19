import { useId } from "react";
import { MinusIcon, PlusIcon } from "./icons";
import Button from "../ui/Button";

/* The trip form. Presentational only: every value and setter comes from
   ItineraryPlanner, which still owns the state and builds the payload.
   The option ids below are sent to the edge functions — do not rename. */

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

function Segmented({ legend, options, value, onChange }) {
  // Four options read badly four-across in a 400px column, so they go 2 × 2.
  const cols = options.length > 3 ? 2 : options.length;
  return (
    <fieldset className="ui-field">
      <legend className="ui-field__label">{legend}</legend>
      <div className="planner-seg" style={{ "--planner-seg-cols": cols }}>
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className="planner-seg__btn"
            aria-pressed={value === opt.id}
            onClick={() => onChange(opt.id)}
          >
            <span className="planner-seg__label">{opt.label}</span>
            {opt.desc && <span className="planner-seg__desc">{opt.desc}</span>}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function PlannerForm({
  days,
  setDays,
  startDate,
  setStartDate,
  budgetTier,
  setBudgetTier,
  pace,
  setPace,
  familyType,
  setFamilyType,
  interests,
  toggleInterest,
  status,
  onSubmit,
}) {
  const dateId = useId();

  return (
    <form className="planner-form" onSubmit={onSubmit} aria-label="Trip details">
      <fieldset className="ui-field">
        <legend className="ui-field__label">Trip length</legend>
        <div className="planner-stepper">
          <button
            type="button"
            className="planner-stepper__btn"
            aria-label="One day fewer"
            disabled={days <= 1}
            onClick={() => setDays((d) => Math.max(1, d - 1))}
          >
            <MinusIcon />
          </button>
          <output className="planner-stepper__value" aria-live="polite">
            {days} {days === 1 ? "day" : "days"}
          </output>
          <button
            type="button"
            className="planner-stepper__btn"
            aria-label="One day more"
            disabled={days >= 14}
            onClick={() => setDays((d) => Math.min(14, d + 1))}
          >
            <PlusIcon />
          </button>
        </div>
      </fieldset>

      <div className="ui-field">
        <label className="ui-field__label" htmlFor={dateId}>
          Start date
        </label>
        <input
          id={dateId}
          type="date"
          className="ui-input"
          value={startDate}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <Segmented legend="Budget tier" options={BUDGET_TIERS} value={budgetTier} onChange={setBudgetTier} />
      <Segmented legend="Pace" options={PACE_OPTIONS} value={pace} onChange={setPace} />
      <Segmented legend="Traveling as" options={FAMILY_OPTIONS} value={familyType} onChange={setFamilyType} />

      <fieldset className="ui-field">
        <legend className="ui-field__label">Interests</legend>
        <div className="planner-chips">
          {INTERESTS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className="planner-chip"
              aria-pressed={interests.includes(opt.id)}
              onClick={() => toggleInterest(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      <Button type="submit" fullWidth disabled={status === "loading"}>
        {status === "loading" ? "Building your itinerary…" : "Generate itinerary"}
      </Button>
    </form>
  );
}
