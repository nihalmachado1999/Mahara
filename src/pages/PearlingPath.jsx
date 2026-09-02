import { useAudioGuide } from "../hooks/useAudioGuide";
import { pearlingPathStops } from "../data/pearlingStops";
import TourFallbackList from "../components/TourFallbackList";

const GPS_STATUS_LABEL = {
  idle: "",
  searching: "Finding your location…",
  tracking: "Tracking — narration will play automatically near each stop",
  "weak-signal": "GPS signal is weak here — use the buttons below to play stops manually",
  unavailable: "Location unavailable — use the buttons below to play stops manually",
};

// Verified real photo: Wikimedia Commons "Muharraq Bayt Siyadi 1.jpg",
// referenced directly on the Bahrain Pearling Trail Wikidata entry.
const HERO_IMAGE =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Muharraq%20Bayt%20Siyadi%201.jpg?width=1400";

function DistanceIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" stroke="#B8924A" strokeWidth="1.4" />
      <circle cx="12" cy="9" r="2.5" stroke="#B8924A" strokeWidth="1.4" />
    </svg>
  );
}
function TimeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="#B8924A" strokeWidth="1.4" />
      <path d="M12 7.5V12l3 2" stroke="#B8924A" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function SunMoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" stroke="#B8924A" strokeWidth="1.4" />
      <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="#B8924A" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}


export default function PearlingPath() {
  const { isActive, playedStopIds, currentStopId, gpsStatus, startTour, endTour, playManual } =
    useAudioGuide();

  const currentStop = pearlingPathStops.find((s) => s.id === currentStopId);

  return (
    <div className="min-h-full w-full" style={{ background: "#FAF6EF" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&family=Space+Grotesk:wght@500;600&family=Cormorant+Garamond:wght@500;600;700&display=swap');
        .font-heading { font-family: 'Plus Jakarta Sans', sans-serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }
        .font-label { font-family: 'Space Grotesk', sans-serif; letter-spacing: 0.04em; text-transform: uppercase; }
        .font-display { font-family: 'Cormorant Garamond', serif; }
      `}</style>

      {/* Hero — real photo of Bayt Siyadi, the Pearling Path's most iconic building */}
      <div
        style={{
          position: "relative",
          height: "46vh",
          minHeight: "320px",
          backgroundImage: `linear-gradient(180deg, rgba(26,20,16,0.15) 0%, rgba(26,20,16,0.75) 100%), url(${HERO_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-2xl mx-auto px-4 h-full flex flex-col justify-end pb-8">
          <div className="font-label text-[11px] mb-2" style={{ color: "#D9B77C" }}>
            Muharraq · UNESCO World Heritage
          </div>
          <h1 className="font-display text-5xl mb-1" style={{ color: "#FAF6EF" }}>
            Pearling Path Audio Guide
          </h1>
          <p className="font-body text-sm" style={{ color: "rgba(250,246,239,0.85)" }}>
            Five stops through Bahrain's pearling history, narrated as you walk.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {!isActive && (
          <>
            <div
              className="p-6 rounded-[8px] border"
              style={{ borderColor: "rgba(26,20,16,0.12)", background: "#ffffffaa" }}
            >
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col gap-1.5">
                  <DistanceIcon />
                  <div className="font-label text-[10px]" style={{ color: "#B8924A" }}>Distance</div>
                  <div className="font-heading font-semibold text-sm" style={{ color: "#1A1410" }}>~3.5 km loop</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <TimeIcon />
                  <div className="font-label text-[10px]" style={{ color: "#B8924A" }}>Time</div>
                  <div className="font-heading font-semibold text-sm" style={{ color: "#1A1410" }}>45–60 min</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <SunMoonIcon />
                  <div className="font-label text-[10px]" style={{ color: "#B8924A" }}>Best time</div>
                  <div className="font-heading font-semibold text-sm" style={{ color: "#1A1410" }}>Early AM / late PM</div>
                </div>
              </div>

              <p className="font-body text-xs mb-6" style={{ color: "rgba(26,20,16,0.6)" }}>
                Narration plays automatically as you approach each stop, using your phone's
                location. You can also play any stop manually at any time — useful if GPS signal
                is weak in the narrow lanes of the old town.
              </p>

              <button
                type="button"
                onClick={startTour}
                className="font-heading font-semibold w-full py-3 rounded-full"
                style={{ background: "#9B1B30", color: "#FAF6EF" }}
              >
                Start Audio Tour
              </button>
            </div>

            <div className="sadu-strip"></div>

            <div className="font-label text-[11px] mb-4" style={{ color: "#B8924A" }}>
              The Route
            </div>
            <div className="space-y-3">
              {pearlingPathStops.map((stop, i) => (
                <div
                  key={stop.id}
                  className="flex items-start gap-4 p-4 rounded-[8px] border"
                  style={{ borderColor: "rgba(26,20,16,0.1)", background: "#ffffffaa" }}
                >
                  <span
                    className="font-display flex-shrink-0"
                    style={{ fontSize: "1.8rem", color: "#B8924A", lineHeight: 1 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className="font-heading font-semibold text-sm mb-1" style={{ color: "#1A1410" }}>
                      {stop.title}
                    </div>
                    <p className="font-body text-xs" style={{ color: "rgba(26,20,16,0.55)" }}>
                      {stop.script.slice(0, 90).trim()}…
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {isActive && (
          <div
            className="p-6 rounded-[8px] border"
            style={{ borderColor: "rgba(26,20,16,0.12)", background: "#ffffffaa" }}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className="font-label text-[10px]"
                style={{ color: gpsStatus === "tracking" ? "#B8924A" : "#9B1B30" }}
              >
                {GPS_STATUS_LABEL[gpsStatus]}
              </span>
              <button
                type="button"
                onClick={endTour}
                className="font-label text-[10px] font-semibold"
                style={{ color: "rgba(26,20,16,0.5)" }}
              >
                End Tour
              </button>
            </div>

            {currentStop && (
              <div className="mb-5 p-4 rounded-[8px]" style={{ background: "#1A1410" }}>
                <div className="font-label text-[10px] mb-1" style={{ color: "#B8924A" }}>
                  Now playing
                </div>
                <div className="font-heading font-semibold text-base" style={{ color: "#FAF6EF" }}>
                  {currentStop.title}
                </div>
              </div>
            )}

            <TourFallbackList
              stops={pearlingPathStops}
              playedStopIds={playedStopIds}
              currentStopId={currentStopId}
              onPlay={playManual}
            />
          </div>
        )}
      </div>
    </div>
  );
}
