/* Planner icons. One system (DESIGN_RULES §3): inline SVG, 1.5px stroke,
   stroke="currentColor". Colour is always set by the parent. */

const svgProps = { fill: "none", "aria-hidden": true, focusable: "false" };

function TimeIconMorning() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" {...svgProps}>
      <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6L13 13M13 3l-1.4 1.4M4.4 11.6L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function TimeIconEvening() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" {...svgProps}>
      <path d="M13 9.5A5.5 5.5 0 1 1 6.5 3a4.2 4.2 0 0 0 6.5 6.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
function TimeIconDefault() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" {...svgProps}>
      <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 8h1.5M12.5 8H14M8 2v1.5M8 12.5V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Same decision logic as before the redesign: clock times first, then words.
export function TimeIcon({ time = "" }) {
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

export function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" {...svgProps}>
      <path d="M8 1.5c-2.5 0-4.5 2-4.5 4.5C3.5 9.5 8 14.5 8 14.5S12.5 9.5 12.5 6C12.5 3.5 10.5 1.5 8 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="8" cy="6" r="1.6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function CheckIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...svgProps}>
      <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MinusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" {...svgProps}>
      <path d="M3.5 8h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" {...svgProps}>
      <path d="M3.5 8h9M8 3.5v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function UndoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" {...svgProps}>
      <path d="M5.5 3L2.5 6l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 6h6.5a4 4 0 0 1 0 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
