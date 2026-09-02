function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TourFallbackList({ stops, playedStopIds, currentStopId, onPlay }) {
  return (
    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {stops.map((stop, i) => {
        const played = playedStopIds.includes(stop.id);
        const playing = currentStopId === stop.id;
        return (
          <li
            key={stop.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem 1.25rem",
              borderRadius: "8px",
              border: `1px solid ${playing ? "#9B1B30" : "rgba(26,20,16,0.12)"}`,
              background: playing ? "rgba(155,27,48,0.05)" : "#ffffffaa",
              transition: "border-color 0.25s, background 0.25s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
              <span
                className="font-label"
                style={{ fontSize: "11px", color: "#B8924A", minWidth: "20px" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-heading" style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1A1410" }}>
                {stop.title}
              </span>
              {played && !playing && (
                <span style={{ color: "#B8924A", display: "flex", alignItems: "center" }}>
                  <CheckIcon />
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => onPlay(stop.id)}
              className="font-label"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "11px",
                fontWeight: 600,
                padding: "0.5rem 0.9rem",
                borderRadius: "8px",
                background: playing ? "#9B1B30" : "transparent",
                color: playing ? "#FAF6EF" : "#9B1B30",
                border: "1px solid #9B1B30",
              }}
            >
              <PlayIcon />
              {playing ? "Playing" : played ? "Replay" : "Play"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
