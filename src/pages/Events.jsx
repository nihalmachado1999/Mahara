import { useState, useMemo } from "react";
import { useScrollEffects } from "../hooks/useScrollEffects";
import EmptyState from "../components/ui/EmptyState";

/* ---------------------------------------------------------------
   Events — converted from events.html. Same 7 events, same tags,
   same copy. Two real fixes, same category as Destinations/Food:
   1. This Week / This Month / Festivals tabs now actually filter
      by real dates instead of being decorative (the original bug
      that started this whole investigation weeks ago).
   2. Category filters (Cultural/Sports/Food/Family/Free) also now
      work for real.
   Honest note: since these are demo dates (Nov/Dec), viewing this
   page any time outside that window will correctly show most
   one-time events as NOT "this week"/"this month" — that's the
   filter working correctly, not a new bug. Recurring weekly events
   (the Friday market, Saturday safari) always show under both,
   since there's always an instance coming up.
------------------------------------------------------------------ */

const YEAR = new Date().getFullYear();

const EVENTS = [
  { id: "heritage-market", cat: ["cultural", "free"], festival: true, scene: "scene-heritage", month: 10, day: 14, dateLabel: { b: "14", s: "Nov" }, price: "Free", tag: "Cultural", title: "Muharraq Heritage Night Market", loc: "Muharraq Old Town", desc: "Evening guided walk through the historic souq with craft stalls and street food." },
  { id: "spring-culture", cat: ["cultural"], festival: true, scene: "scene-culture", month: 11, day: 5, dateLabel: { b: "05", s: "Dec" }, price: "15 BHD", tag: "Cultural · Festival", title: "Spring of Culture: Opening Night", loc: "Bahrain National Theatre", desc: "The island's biggest annual arts festival — music, theatre, and visual art from across the region." },
  { id: "national-day", cat: ["family", "free"], festival: true, scene: "scene-national", month: 11, day: 16, dateLabel: { b: "16", s: "Dec" }, price: "Free", tag: "Family · Fireworks", title: "National Day Fireworks & Parade", loc: "Manama Corniche", desc: "The whole island turns out — fireworks over the bay and a parade along the Corniche." },
  { id: "block338", cat: ["food", "free"], recurring: true, scene: "scene-food-event", dateLabel: { b: "Fri", s: "Weekly" }, price: "Free entry", tag: "Food & Drink", title: "Block 338 Night Market", loc: "Adliya", desc: "A rotating lineup of local food vendors, live music, and craft stalls every Friday evening." },
  { id: "museum-exhibit", cat: ["cultural"], scene: "scene-art", month: 10, day: 22, dateLabel: { b: "22", s: "Nov" }, price: "Free", tag: "Art & Design", title: "Bahrain National Museum: New Exhibit", loc: "Manama Corniche", desc: "A new contemporary exhibit exploring Dilmun-era artefacts through a modern lens." },
  { id: "bic-karting", cat: ["sports"], scene: "scene-f1", month: 10, day: 30, dateLabel: { b: "30", s: "Nov" }, price: "15 BHD", tag: "Sports", title: "BIC Karting Night Session", loc: "Sakhir · BIC", desc: "Floodlit karting on the real F1 support track — open to all skill levels, book a slot in advance." },
  { id: "al-areen", cat: ["family"], recurring: true, scene: "scene-family", dateLabel: { b: "Sat", s: "Weekly" }, price: "5 BHD", tag: "Family · Outdoor", title: "Al Areen Wildlife Safari", loc: "Al Areen Wildlife Park", desc: "Morning safari through Bahrain's wildlife reserve — Arabian oryx, gazelle, and native birdlife." },
];

const CATEGORY_FILTERS = [
  { id: "all", label: "All" },
  { id: "cultural", label: "Cultural" },
  { id: "sports", label: "Sports" },
  { id: "food", label: "Food & Drink" },
  { id: "family", label: "Family" },
  { id: "free", label: "Free" },
];

const TABS = [
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "festivals", label: "Festivals" },
];

function matchesTab(event, tab) {
  if (tab === "festivals") return !!event.festival;
  if (event.recurring) return true; // always has an upcoming instance

  const today = new Date();
  const eventDate = new Date(YEAR, event.month, event.day);
  // If the date already passed this year, assume next year's occurrence
  if (eventDate < today) eventDate.setFullYear(YEAR + 1);

  if (tab === "week") {
    const weekFromNow = new Date(today);
    weekFromNow.setDate(today.getDate() + 7);
    return eventDate >= today && eventDate <= weekFromNow;
  }
  if (tab === "month") {
    return eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear();
  }
  return true;
}

function PinIcon() {
  return <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 1.5a5 5 0 015 5c0 3.5-5 8-5 8s-5-4.5-5-8a5 5 0 015-5z" stroke="currentColor" strokeWidth="1.3" /><circle cx="8" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.3" /></svg>;
}
function ArrowIcon() {
  return <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function Events() {
  const [activeTab, setActiveTab] = useState("week");
  const [activeCat, setActiveCat] = useState("all");

  const filtered = useMemo(() => {
    return EVENTS.filter((e) => matchesTab(e, activeTab) && (activeCat === "all" || e.cat.includes(activeCat)));
  }, [activeTab, activeCat]);

  useScrollEffects([filtered]);

  return (
    <div>
      <style>{`
        .page-header { padding: clamp(3rem,6vw,4.5rem) var(--pad-x) clamp(2rem,4vw,3rem); }
        .page-header__eyebrow { font-family: var(--font-label); font-size: .65rem; font-weight: 600; letter-spacing: .3em; text-transform:uppercase; color: var(--crimson); margin-bottom: .6rem; display:block; }
        .page-header__title { font-family: var(--font-heading); font-weight: 800; font-size: clamp(2.5rem, 6vw, 4.5rem); line-height: 1.02; color: var(--ink); letter-spacing: -.02em; margin-bottom: .9rem; }
        .page-header__title em { font-style: normal; color: var(--crimson); }
        .page-header__sub { font-size: .95rem; font-weight: 300; color: var(--ink-soft); max-width: 560px; line-height: 1.7; }

        .tab-row { display:flex; gap: .5rem; padding: 0 var(--pad-x); margin-bottom: 1rem; }
        .tab { font-family: var(--font-label); font-size: .74rem; font-weight: 600; letter-spacing: .05em; padding: .7rem 1.3rem; border-radius: 8px; color: var(--ink-soft); transition: background .25s, color .25s; background:none; border:none; }
        .tab.active { background: var(--ink); color: var(--cream); }
        .tab:not(.active):hover { background: var(--cream-warm); color: var(--ink); }

        .filter-bar { position: sticky; top: 72px; z-index: 50; background: var(--cream); border-bottom: 1px solid rgba(26,20,16,.08); padding: 0 var(--pad-x); }
        .filter-bar__inner { display:flex; align-items:center; justify-content:space-between; gap: 1.5rem; flex-wrap: wrap; padding: 1rem 0; }
        .filters { display:flex; gap: clamp(1.25rem, 3vw, 2.5rem); overflow-x:auto; scrollbar-width:none; }
        .filters::-webkit-scrollbar{display:none;}
        .filter { flex-shrink:0; font-family: var(--font-label); font-size: .72rem; font-weight: 600; color: var(--ink-soft); cursor:pointer; transition: color .25s; padding: .4rem .85rem; border-radius: 8px; background: none; border: none; }
        .filter.active { color: var(--white); background: var(--crimson); }
        .filter:not(.active):hover { color: var(--ink); background: var(--cream-warm); }
        .result-count { font-family: var(--font-label); font-size: .68rem; font-weight: 500; letter-spacing: .05em; color: var(--ink-soft); white-space: nowrap; }
        .result-count b { color: var(--crimson); font-weight: 700; }

        .events-grid-section { padding: clamp(2rem,4vw,3rem) var(--pad-x) clamp(4rem,7vw,6rem); }
        .events-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.75rem; }
        .event-card { display:flex; flex-direction:column; transition: transform .4s var(--ease); }
        .event-card__photo { position: relative; height: 240px; border-radius: 8px; margin-bottom: 1.1rem; transition: transform .5s var(--ease); }
        .event-card:hover .event-card__photo { transform: translateY(-5px); }
        .event-card__date { position:absolute; top:0; left:0; z-index:3; background: var(--crimson); color: var(--cream); padding: .7rem 1rem; min-width:58px; border-radius: 0 0 8px 0; }
        .event-card__date b { display:block; font-family: var(--font-display); font-size: 1.7rem; font-weight:500; line-height:1; }
        .event-card__date span { display:block; font-family: var(--font-label); font-size: .56rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; margin-top:.2rem; }
        .event-card__price { position:absolute; top: .85rem; right: .85rem; z-index: 3; background: rgba(26,20,16,.55); backdrop-filter: blur(6px); color: var(--gold); font-family: var(--font-label); font-size: .68rem; font-weight: 700; padding: .3rem .65rem; border-radius: 6px; }
        .event-card__tag { font-family: var(--font-label); font-size: .6rem; font-weight: 600; letter-spacing: .2em; text-transform:uppercase; color: var(--crimson); display:flex; align-items:center; gap:.4rem; margin-bottom:.4rem; }
        .event-card__tag::before { content:''; width:12px; height:1px; background:var(--crimson); }
        .event-card__title { font-family: var(--font-heading); font-size: 1.05rem; font-weight: 800; color: var(--ink); margin-bottom: .35rem; letter-spacing: -.01em; line-height: 1.25; }
        .event-card__loc { display:flex; align-items:center; gap:.35rem; font-family: var(--font-label); font-size: .68rem; font-weight: 500; color: var(--ink-soft); margin-bottom:.55rem; }
        .event-card__desc { font-size: .8rem; font-weight: 300; color: var(--ink-soft); line-height: 1.6; margin-bottom: .7rem; flex:1; }
        .event-card__link { font-family: var(--font-label); font-size: .64rem; font-weight: 600; letter-spacing: .14em; text-transform:uppercase; color: var(--crimson); display:inline-flex; align-items:center; gap:.4rem; align-self:flex-start; border-bottom: 1px solid rgba(155,27,48,.25); padding-bottom: 2px; transition: gap .3s var(--ease), border-color .3s; }
        .event-card:hover .event-card__link { gap: .75rem; border-color: var(--crimson); }
        @media (max-width: 1100px) { .events-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .events-grid { grid-template-columns: 1fr; } }

        .photo { position: relative; overflow: hidden; }
        .photo::after { content: ''; position: absolute; inset: 0; background: linear-gradient(160deg, rgba(155,27,48,.14) 0%, rgba(26,20,16,.08) 55%, rgba(26,20,16,.32) 100%); mix-blend-mode: multiply; pointer-events: none; }
        .photo-reveal { clip-path: inset(0 0 100% 0); transform: scale(1.08); transition: clip-path 1s var(--ease), transform 1.2s var(--ease); }
        .revealed .photo-reveal { clip-path: inset(0 0 0% 0); transform: scale(1); }

        .scene-f1 { background: linear-gradient(155deg, #1A1410 0%, #3A1418 40%, #6E1322 75%, #9B1B30 100%); }
        .scene-culture { background: radial-gradient(ellipse 55% 45% at 50% 25%, rgba(255,255,255,.35) 0%, transparent 55%), linear-gradient(165deg, #0A1525 0%, #1A3A60 40%, #2A6090 75%, #4890BC 100%); }
        .scene-heritage { background: radial-gradient(ellipse 50% 45% at 60% 25%, rgba(255,200,140,.4) 0%, transparent 55%), linear-gradient(160deg, #3A1E10 0%, #6E3A18 40%, #B0712E 75%, #D9A24E 100%); }
        .scene-national { background: radial-gradient(ellipse 55% 45% at 50% 20%, rgba(255,220,180,.35) 0%, transparent 55%), linear-gradient(155deg, #241008 0%, #522A10 40%, #8A5220 75%, #C4863E 100%); }
        .scene-art { background: radial-gradient(ellipse 50% 40% at 45% 20%, rgba(230,200,255,.3) 0%, transparent 55%), linear-gradient(165deg, #1E1226 0%, #3E2450 40%, #6A4080 75%, #9868AC 100%); }
        .scene-food-event { background: radial-gradient(ellipse 50% 45% at 55% 25%, rgba(255,190,120,.4) 0%, transparent 55%), linear-gradient(155deg, #221812 0%, #4A342A 40%, #7A5A44 75%, #A88868 100%); }
        .scene-family { background: radial-gradient(ellipse 55% 45% at 50% 20%, rgba(180,235,220,.4) 0%, transparent 55%), linear-gradient(165deg, #0C2426 0%, #1E4A4E 40%, #3A7478 75%, #5C9EA0 100%); }
      `}</style>

      <header className="page-header">
        <span className="page-header__eyebrow reveal">This Month</span>
        <h1 className="page-header__title reveal d1">What's <em>On</em></h1>
        <p className="page-header__sub reveal d2">From F1 night races to souq night markets — everything worth showing up for, updated as it happens.</p>
      </header>

      <div className="tab-row reveal d3">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={`tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="filter-bar">
        <div className="filter-bar__inner">
          <div className="filters">
            {CATEGORY_FILTERS.map((f) => (
              <button key={f.id} type="button" className={`filter ${activeCat === f.id ? "active" : ""}`} onClick={() => setActiveCat(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
          <span className="result-count"><b>{filtered.length}</b> events</span>
        </div>
      </div>

      <section className="events-grid-section">
        {filtered.length > 0 ? (
          <div className="events-grid">
            {filtered.map((e, i) => (
              <article key={e.id} className={`event-card reveal d${i % 6}`}>
                <div className={`event-card__photo photo photo-reveal ${e.scene}`}>
                  <div className="event-card__date"><b>{e.dateLabel.b}</b><span>{e.dateLabel.s}</span></div>
                  <span className="event-card__price">{e.price}</span>
                </div>
                <p className="event-card__tag">{e.tag}</p>
                <h3 className="event-card__title">{e.title}</h3>
                <p className="event-card__loc"><PinIcon /> {e.loc}</p>
                <p className="event-card__desc">{e.desc}</p>
                <a href="#" className="event-card__link">Details <ArrowIcon /></a>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState icon="search" title="Nothing here yet">
            Try a different tab or category — or check back as new events get added.
          </EmptyState>
        )}
      </section>
    </div>
  );
}
