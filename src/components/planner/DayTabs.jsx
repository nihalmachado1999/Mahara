import { useEffect, useRef } from "react";
import { CheckIcon } from "./icons";

/* Sticky day tabs for long trips. One day panel is visible at a time.
   Standard tab pattern: roving tabindex, Left / Right / Home / End. */

export default function DayTabs({ days, activeIdx, onChange, idBase }) {
  const listRef = useRef(null);
  const tabRefs = useRef([]);

  // Keep the active tab visible inside the strip. Adjusts the strip's own
  // scrollLeft rather than calling scrollIntoView, which would also move
  // the page.
  useEffect(() => {
    const list = listRef.current;
    const tab = tabRefs.current[activeIdx];
    if (!list || !tab) return;
    const target = tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2;
    list.scrollLeft = Math.max(0, target);
  }, [activeIdx]);

  function handleKeyDown(e) {
    let next = null;
    if (e.key === "ArrowRight") next = (activeIdx + 1) % days.length;
    else if (e.key === "ArrowLeft") next = (activeIdx - 1 + days.length) % days.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = days.length - 1;
    if (next === null) return;
    e.preventDefault();
    onChange(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="planner-tabs-wrap">
      <div
        ref={listRef}
        className="planner-tabs"
        role="tablist"
        aria-label="Days of the trip"
        onKeyDown={handleKeyDown}
      >
        {days.map((day, i) => {
          const acts = day.activities || [];
          const allDone = acts.length > 0 && acts.every((a) => a.done);
          const selected = i === activeIdx;
          return (
            <button
              key={i}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${idBase}-tab-${i}`}
              aria-selected={selected}
              aria-controls={`${idBase}-panel-${i}`}
              tabIndex={selected ? 0 : -1}
              className={`planner-tab ${selected ? "is-active" : ""}`}
              onClick={() => onChange(i)}
            >
              Day {day.day ?? i + 1}
              {allDone && (
                <span className="planner-tab__done">
                  <CheckIcon size={11} />
                  <span className="ui-sr-only">, all stops done</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
