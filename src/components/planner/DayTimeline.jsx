import { TimeIcon, PinIcon, UndoIcon } from "./icons";
import Button from "../ui/Button";
import TextLink from "../ui/TextLink";

/* ---------------------------------------------------------------
   One day of the itinerary as a vertical timeline.

   The rail is a strand and each node on it is a pearl; the pearl is
   also the "done" checkbox. All state lives in ItineraryPlanner —
   this component only renders it and calls back.

   Swap and replan state stays keyed by index (`${dayIdx}-${aIdx}`
   and dayIdx), exactly as the handlers in ItineraryPlanner expect.
------------------------------------------------------------------ */

// Display only. Costs come from the model as floats.
function formatBD(amount) {
  return String(parseFloat(amount.toFixed(3)));
}

function submitOnEnter(e, busy, submit) {
  if (e.key !== "Enter" || e.nativeEvent.isComposing || busy) return;
  e.preventDefault();
  submit();
}

export default function DayTimeline({
  day,
  dayIdx,
  idBase,
  changedIndices,
  changeNonce,
  onToggleDone,
  swap,
  replan,
  undo,
  onUndo,
}) {
  const activities = day.activities || [];
  const doneCount = activities.filter((a) => a.done).length;
  const remainingCount = activities.length - doneCount;
  const dayLabel = day.day ?? dayIdx + 1;
  const titleId = `${idBase}-day-${dayIdx}`;
  const replanInputId = `${idBase}-replan-${dayIdx}`;
  const swapBusyOnThisDay = typeof swap.busyKey === "string" && swap.busyKey.startsWith(`${dayIdx}-`);

  return (
    <section className="planner-day" aria-labelledby={titleId}>
      <header className="planner-day__head">
        <div>
          <span className="planner-day__label">Day {dayLabel}</span>
          <h3 className="planner-day__title" id={titleId} tabIndex={-1}>
            {day.title || `${activities.length} stops planned`}
          </h3>
        </div>
        {activities.length > 0 && (
          <span className="planner-day__count">
            <b>{doneCount}</b> of {activities.length} done
          </span>
        )}
      </header>

      {day.lastChangeNote && <p className="planner-day__note">{day.lastChangeNote}</p>}

      <ol className="planner-stops">
        {activities.map((act, aIdx) => {
          const swapKey = `${dayIdx}-${aIdx}`;
          const swapInputId = `${idBase}-swap-${swapKey}`;
          const swapping = swap.busyKey === swapKey;
          const changed = Boolean(changedIndices && changedIndices.includes(aIdx));
          return (
            <li
              key={aIdx}
              id={`${idBase}-stop-${swapKey}`}
              tabIndex={-1}
              className={`planner-stop ${act.done ? "is-done" : ""} ${changed ? "is-changed" : ""}`}
            >
              <input
                type="checkbox"
                className="planner-stop__check"
                checked={!!act.done}
                onChange={() => onToggleDone(dayIdx, aIdx)}
                aria-label={`Mark "${act.title}" as done`}
              />
              <div className="planner-stop__body">
                {changed && <span key={changeNonce} className="planner-stop__flash" aria-hidden="true"></span>}

                <div className="planner-stop__main">
                  <div className="planner-stop__meta">
                    <span className="planner-stop__time">
                      <TimeIcon time={act.time} />
                      {act.time}
                    </span>
                    {changed && (
                      <span className="planner-stop__updated" aria-hidden="true">
                        Updated
                      </span>
                    )}
                    {typeof act.costEstimate === "number" && (
                      <span className="planner-stop__cost">~{formatBD(act.costEstimate)} BD</span>
                    )}
                  </div>
                  <h4 className="planner-stop__title">{act.title}</h4>
                  {act.description && <p className="planner-stop__desc">{act.description}</p>}
                  {act.location && (
                    <p className="planner-stop__loc">
                      <PinIcon />
                      {act.location}
                    </p>
                  )}
                </div>

                {!act.done && (
                  <div className="planner-stop__swap">
                    {swap.openKey === swapKey ? (
                      <div className="planner-inline-form">
                        <label className="ui-sr-only" htmlFor={swapInputId}>
                          Why swap {act.title}? Optional.
                        </label>
                        <input
                          id={swapInputId}
                          type="text"
                          className="ui-input"
                          value={swap.drafts[swapKey] || ""}
                          onChange={(e) => swap.setDrafts((prev) => ({ ...prev, [swapKey]: e.target.value }))}
                          onKeyDown={(e) => submitOnEnter(e, swapping, () => swap.onConfirm(dayIdx, aIdx))}
                          placeholder="Why swap this? (optional)"
                        />
                        <div className="planner-inline-form__actions">
                          <Button
                            size="sm"
                            onClick={() => swap.onConfirm(dayIdx, aIdx)}
                            disabled={swapping}
                          >
                            {swapping ? "Swapping…" : "Confirm swap"}
                          </Button>
                          <Button
                            variant="quiet"
                            size="sm"
                            onClick={() => swap.setOpenKey(null)}
                            disabled={swapping}
                          >
                            Cancel
                          </Button>
                        </div>
                        {swap.errors[swapKey] && (
                          <p className="ui-field__error" role="alert">
                            {swap.errors[swapKey]}
                          </p>
                        )}
                      </div>
                    ) : (
                      <TextLink arrow={false} onClick={() => swap.setOpenKey(swapKey)}>
                        Swap this
                      </TextLink>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <footer className="planner-day__foot">
        {replan.isOpen ? (
          <div className="planner-inline-form">
            <label className="ui-field__label" htmlFor={replanInputId}>
              What changed?
            </label>
            <input
              id={replanInputId}
              type="text"
              className="ui-input"
              value={replan.draft}
              onChange={(e) => replan.setDrafts((prev) => ({ ...prev, [dayIdx]: e.target.value }))}
              onKeyDown={(e) => submitOnEnter(e, replan.busy, () => replan.onConfirm(dayIdx))}
              placeholder="What changed? e.g. running late, too hot, want something different"
            />
            <p className="ui-field__hint">Stops you have ticked off stay as they are.</p>
            <div className="planner-inline-form__actions">
              <Button
                size="sm"
                onClick={() => replan.onConfirm(dayIdx)}
                disabled={replan.busy}
              >
                {replan.busy ? "Replanning…" : "Confirm replan"}
              </Button>
              <Button
                variant="quiet"
                size="sm"
                onClick={() => replan.setOpenDay(null)}
                disabled={replan.busy}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="planner-day__actions">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => replan.setOpenDay(dayIdx)}
              disabled={remainingCount === 0}
            >
              Replan rest of this day
            </Button>
            {undo && (
              <Button
                variant="quiet"
                size="sm"
                onClick={() => onUndo(dayIdx)}
                disabled={replan.busy || swapBusyOnThisDay}
              >
                <UndoIcon />
                Undo last {undo.kind === "swap" ? "swap" : "replan"}
              </Button>
            )}
          </div>
        )}

        {replan.error && (
          <p className="ui-field__error" role="alert">
            {replan.error}
          </p>
        )}
      </footer>
    </section>
  );
}
