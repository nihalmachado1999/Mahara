import { useState, useMemo } from "react";
import { useScrollEffects } from "../hooks/useScrollEffects";
import EmptyState from "../components/ui/EmptyState";

/* ---------------------------------------------------------------
   Destinations — converted from destinations.html. Same layout,
   same 12 places, same copy. Two real fixes made during conversion,
   both explicitly sanctioned by DESIGN_RULES.md, not new choices:
   1. Removed the 📍 emoji pins in place-card__loc (the exact
      violation the rules file called out by name) — replaced with
      an inline SVG pin, same icon system as everywhere else.
   2. Filtering and search are now real — the original HTML had the
      markup for both but (like the Events tabs) no working JS.
   "Discover More" stays as "#" honestly — no per-destination detail
   page exists yet, so this isn't pretending otherwise.
------------------------------------------------------------------ */

const PLACES = [
  { id: "fort", cat: ["culture", "nature"], badge: "UNESCO Site", tag: "UNESCO World Heritage", title: "Bahrain Fort", loc: "Karbabad, Northern Governorate", desc: "A 4,000-year-old tell overlooking the Gulf — once the capital of ancient Dilmun, now a quiet ruin with sweeping coastal views.", img: "https://commons.wikimedia.org/wiki/Special:FilePath/Bahrain%20Fort%20March%202015.JPG?width=900", credit: "Martin Falbisoner · CC BY-SA 4.0" },
  { id: "tree", cat: ["nature"], badge: "Natural Wonder", tag: "Desert Icon", title: "Tree of Life", loc: "Jebel Dukhan, Southern Governorate", desc: "A 400-year-old mesquite standing alone in the desert with no visible water source — still unexplained, still thriving.", img: "https://commons.wikimedia.org/wiki/Special:FilePath/Tree%20of%20Life%20in%20Bahrain.JPG?width=900", credit: "Wikimedia Commons" },
  { id: "mosque", cat: ["culture"], badge: "Landmark", tag: "Sacred Space", title: "Al-Fateh Grand Mosque", loc: "Juffair, Manama", desc: "One of the world's largest mosques, its fibreglass dome and Austrian chandeliers open to visitors of every faith.", img: "https://commons.wikimedia.org/wiki/Special:FilePath/Grand%20mosque%20in%20Bahrain.jpg?width=900", credit: "Wikimedia Commons" },
  { id: "souq", cat: ["shopping", "culture", "food"], badge: "Heritage Market", tag: "Living Market", title: "Manama Souq", loc: "Bab Al Bahrain, Manama", desc: "Spice alleys, gold shops, and tailors behind a 1949 gateway — Haji's Café still serves the same breakfast it has since the '50s.", img: "https://commons.wikimedia.org/wiki/Special:FilePath/Manama%20Bab%20al-Bahrain%20Souq%201.jpg?width=900", credit: "CC BY-SA 4.0" },
  { id: "manama", cat: ["culture", "shopping"], badge: "Capital City", tag: "Capital City", title: "Manama", loc: "Capital Governorate", desc: "Glass towers rise where pearl merchants once weighed their catch — rooftop cafés and a waterfront made for evening walks.", img: "https://images.pexels.com/photos/11647418/pexels-photo-11647418.jpeg?auto=compress&cs=tinysrgb&w=900", credit: "YOUSIF · Pexels" },
  { id: "hawar", cat: ["nature", "islands"], badge: "Island Escape", tag: "Marine Reserve", title: "Hawar Islands", loc: "Near Qatari border", desc: "A remote archipelago where dugongs graze and flamingos turn the shallows pink each winter.", scene: "scene-hawar" },
  { id: "museum", cat: ["culture"], badge: "Museum", tag: "Largest in Bahrain", title: "Bahrain National Museum", loc: "Manama Corniche", desc: "Dilmun burial artefacts, pearling history, and traditional life exhibits — start here before exploring the island.", scene: "scene-museum" },
  { id: "amwaj", cat: ["nature", "islands", "food"], badge: "Beach & Marina", tag: "Man-Made Islands", title: "Amwaj Islands", loc: "Muharraq Governorate", desc: "Waterfront dining, beach clubs, and a marina lined with yachts — Bahrain's most relaxed evening out.", scene: "scene-amwaj" },
  { id: "aali", cat: ["culture"], badge: "UNESCO Site", tag: "Ancient Dilmun", title: "A'ali Burial Mounds", loc: "A'ali Village", desc: "One of the world's largest prehistoric cemeteries — thousands of ancient burial mounds dot this quiet village.", scene: "scene-aali" },
  { id: "riffa", cat: ["culture"], badge: "Historic Fort", tag: "19th Century", title: "Riffa Fort", loc: "East Riffa", desc: "Built in 1812 overlooking the Hunainiya Valley, this restored fort hosts cultural events and sweeping valley views.", scene: "scene-riffa" },
  { id: "muharraq", cat: ["culture", "food", "shopping"], badge: "UNESCO Pearl Path", tag: "Old Capital", title: "Muharraq Old Town", loc: "Muharraq Island", desc: "Coral-stone merchant houses and lantern-lit alleys along the historic Pearling Path — Bahrain's first capital.", scene: "scene-souq2" },
  { id: "bic", cat: ["culture"], badge: "F1 Circuit", tag: "Motorsport", title: "Bahrain International Circuit", loc: "Sakhir", desc: "Home of the Gulf's only Formula 1 night race — desert karting and track days run year-round.", gradient: "linear-gradient(155deg, #1A1410 0%, #3A1418 40%, #6E1322 75%, #9B1B30 100%)" },
];

const FILTERS = [
  { id: "all", label: "All", icon: <path d="M4 12l8 8 8-8M4 12l8-8 8 8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /> },
  { id: "nature", label: "Nature", icon: <><path d="M12 3c3 3 5 6 5 9a5 5 0 01-10 0c0-3 2-6 5-9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M12 21v-6" stroke="currentColor" strokeWidth="1.6" /></> },
  { id: "culture", label: "Culture & History", icon: <path d="M4 20h16M6 20V10l6-5 6 5v10M10 20v-6h4v6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /> },
  { id: "shopping", label: "Shopping", icon: <><path d="M6 8h12l-1 12H7L6 8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M9 8a3 3 0 016 0" stroke="currentColor" strokeWidth="1.6" /></> },
  { id: "food", label: "Food & Drink", icon: <><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></> },
  { id: "islands", label: "Islands", icon: <><path d="M3 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><circle cx="12" cy="9" r="4" stroke="currentColor" strokeWidth="1.6" /></> },
];

function PinIcon() {
  return <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M8 1.5c-2.5 0-4.5 2-4.5 4.5C3.5 9.5 8 14.5 8 14.5S12.5 9.5 12.5 6C12.5 3.5 10.5 1.5 8 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /><circle cx="8" cy="6" r="1.6" stroke="currentColor" strokeWidth="1.3" /></svg>;
}
function ArrowIcon() {
  return <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" /><path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>;
}
function HeartIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 21s-7-4.5-9.5-9C.5 8 2 4 6 4c2 0 4 1.2 6 4 2-2.8 4-4 6-4 4 0 5.5 4 3.5 8-2.5 4.5-9.5 9-9.5 9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>;
}

export default function Destinations() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState(new Set());

  const filtered = useMemo(() => {
    return PLACES.filter((p) => {
      const matchesFilter = activeFilter === "all" || p.cat.includes(activeFilter);
      const matchesQuery = query.trim() === "" || p.title.toLowerCase().includes(query.toLowerCase()) || p.desc.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query]);

  useScrollEffects([filtered]);

  function toggleSave(id) {
    setSaved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div>
      <style>{`
        .page-header { padding: clamp(3rem,6vw,4.5rem) var(--pad-x) clamp(2rem,4vw,3rem); }
        .page-header__eyebrow { font-family: var(--font-label); font-size: .65rem; font-weight: 600; letter-spacing: .3em; text-transform:uppercase; color: var(--crimson); margin-bottom: .6rem; display:block; }
        .page-header__title { font-family: var(--font-heading); font-weight: 800; font-size: clamp(2.5rem, 6vw, 4.5rem); line-height: 1.02; color: var(--ink); letter-spacing: -.02em; margin-bottom: .9rem; }
        .page-header__title em { font-style: normal; color: var(--crimson); }
        .page-header__sub { font-size: .95rem; font-weight: 300; color: var(--ink-soft); max-width: 540px; line-height: 1.7; }
        .search-bar { margin-top: 1.75rem; display:flex; align-items:center; gap: .75rem; max-width: 480px; background: var(--white); border: 1px solid rgba(26,20,16,.1); border-radius: 100px; padding: .2rem .2rem .2rem 1.1rem; }
        .search-bar svg { flex-shrink:0; color: var(--ink-soft); }
        .search-bar input { flex:1; border:none; outline:none; background:none; font-family: var(--font-body); font-size: .85rem; color: var(--ink); padding: .65rem 0; }
        .search-bar input::placeholder { color: rgba(26,20,16,.35); }
        .search-bar button { background: var(--crimson); color: var(--cream); font-family: var(--font-label); font-size: .68rem; font-weight: 600; letter-spacing: .08em; text-transform:uppercase; padding: .65rem 1.3rem; border-radius: 100px; transition: background .25s; }
        .search-bar button:hover { background: var(--crimson-deep); }
        .filter-bar { position: sticky; top: 72px; z-index: 50; background: var(--cream); border-bottom: 1px solid rgba(26,20,16,.08); padding: 0 var(--pad-x); }
        .filter-bar__inner { display:flex; align-items:center; justify-content:space-between; gap: 1.5rem; flex-wrap: wrap; padding: 1rem 0; }
        .filters { display:flex; gap: clamp(1.25rem, 3vw, 2.5rem); overflow-x:auto; scrollbar-width:none; }
        .filters::-webkit-scrollbar{display:none;}
        .filter { display:flex; align-items:center; gap:.5rem; flex-shrink:0; font-family: var(--font-label); font-size: .72rem; font-weight: 600; color: var(--ink-soft); cursor:pointer; transition: color .25s; padding: .4rem .85rem; border-radius: 8px; background: none; border: none; }
        .filter svg { width:18px; height:18px; stroke: var(--ink-soft); transition: stroke .25s; }
        .filter.active { color: var(--white); background: var(--crimson); }
        .filter.active svg { stroke: var(--white); }
        .filter:not(.active):hover { color: var(--ink); background: var(--cream-warm); }
        .result-count { font-family: var(--font-label); font-size: .68rem; font-weight: 500; letter-spacing: .05em; color: var(--ink-soft); white-space: nowrap; }
        .result-count b { color: var(--crimson); font-weight: 700; }
        .dest-grid-section { padding: clamp(2rem,4vw,3rem) var(--pad-x) clamp(4rem,7vw,6rem); }
        .dest-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.75rem; }
        .place-card { display:flex; flex-direction:column; transition: transform .4s var(--ease); }
        .place-card__photo { position: relative; height: 280px; border-radius: 8px; margin-bottom: 1.1rem; transition: transform .5s var(--ease); }
        .place-card:hover .place-card__photo { transform: translateY(-5px); }
        .place-card__badge { position:absolute; top: .85rem; left: .85rem; z-index: 3; background: rgba(26,20,16,.55); backdrop-filter: blur(6px); color: var(--cream); font-family: var(--font-label); font-size: .58rem; font-weight: 600; letter-spacing: .15em; text-transform:uppercase; padding: .35rem .7rem; border-radius: 6px; }
        .place-card__save { position:absolute; top: .85rem; right: .85rem; z-index: 3; width: 32px; height: 32px; border-radius: 50%; background: rgba(26,20,16,.45); backdrop-filter: blur(6px); display:flex; align-items:center; justify-content:center; color: var(--cream); transition: background .25s, color .25s; }
        .place-card__save:hover { background: var(--crimson); }
        .place-card__save.saved { color: var(--crimson); background: var(--cream); }
        .place-card__tag { font-family: var(--font-label); font-size: .6rem; font-weight: 600; letter-spacing: .2em; text-transform:uppercase; color: var(--crimson); display:flex; align-items:center; gap:.4rem; margin-bottom:.4rem; }
        .place-card__tag::before { content:''; width:12px; height:1px; background:var(--crimson); }
        .place-card__title { font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; color: var(--ink); margin-bottom: .35rem; letter-spacing: -.01em; }
        .place-card__loc { font-family: var(--font-label); font-size: .68rem; font-weight: 500; color: var(--ink-soft); margin-bottom: .55rem; display:flex; align-items:center; gap:.35rem; }
        .place-card__desc { font-size: .82rem; font-weight: 300; color: var(--ink-soft); line-height: 1.6; margin-bottom: .7rem; flex:1; }
        .place-card__link { font-family: var(--font-label); font-size: .64rem; font-weight: 600; letter-spacing: .14em; text-transform:uppercase; color: var(--crimson); display:inline-flex; align-items:center; gap:.4rem; align-self: flex-start; border-bottom: 1px solid rgba(155,27,48,.25); padding-bottom: 2px; transition: gap .3s var(--ease), border-color .3s; }
        .place-card:hover .place-card__link { gap: .75rem; border-color: var(--crimson); }
        @media (max-width: 1100px) { .dest-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .dest-grid { grid-template-columns: 1fr; } }

        .photo { position: relative; overflow: hidden; background-size: cover; background-position: center; }
        .photo::after { content: ''; position: absolute; inset: 0; background: linear-gradient(160deg, rgba(155,27,48,.14) 0%, rgba(26,20,16,.08) 55%, rgba(26,20,16,.32) 100%); mix-blend-mode: multiply; pointer-events: none; }
        .photo img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:0; }
        .photo-reveal { clip-path: inset(0 0 100% 0); transform: scale(1.08); transition: clip-path 1s var(--ease), transform 1.2s var(--ease); }
        .revealed .photo-reveal { clip-path: inset(0 0 0% 0); transform: scale(1); }
        .photo-credit { position:absolute; bottom:6px; left:8px; z-index:3; font-family: var(--font-label); font-size:.55rem; color: rgba(255,255,255,.5); }

        .scene-hawar { background: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(220,255,250,.5) 0%, transparent 55%), linear-gradient(180deg, #BFEFEA 0%, #6FCBD0 35%, #1F92AC 70%, #0C5C78 100%); }
        .scene-souq2 { background: radial-gradient(ellipse 50% 55% at 65% 30%, rgba(255,190,110,.45) 0%, transparent 60%), linear-gradient(155deg, #3A1E10 0%, #6E3A18 40%, #B0712E 75%, #D9A24E 100%); }
        .scene-museum { background: radial-gradient(ellipse 55% 45% at 50% 30%, rgba(255,225,180,.4) 0%, transparent 55%), linear-gradient(165deg, #2E2620 0%, #5C4A38 40%, #8A6E4E 75%, #B89568 100%); }
        .scene-amwaj { background: radial-gradient(ellipse 60% 50% at 60% 10%, rgba(255,220,180,.5) 0%, transparent 55%), linear-gradient(180deg, #9FE0DC 0%, #4FB8C4 35%, #2D7A9C 70%, #1A4E70 100%); }
        .scene-aali { background: radial-gradient(ellipse 50% 40% at 50% 25%, rgba(255,210,140,.35) 0%, transparent 55%), linear-gradient(180deg, #E8C892 0%, #C9985E 35%, #9A6E3E 70%, #6E4A28 100%); }
        .scene-riffa { background: radial-gradient(ellipse 65% 50% at 40% 15%, rgba(255,200,150,.4) 0%, transparent 55%), linear-gradient(170deg, #D8B888 0%, #B88A52 35%, #8A5E32 70%, #5C3A1C 100%); }
      `}</style>

      <header className="page-header">
        <span className="page-header__eyebrow reveal">Where To Go</span>
        <h1 className="page-header__title reveal d1">Explore <em>Bahrain</em></h1>
        <p className="page-header__sub reveal d2">Thirty-three islands, four thousand years of history, and a coastline that turns pink every winter. Filter by what moves you — or just start scrolling.</p>
        <div className="search-bar reveal d3">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search forts, beaches, mosques, souqs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button">Search</button>
        </div>
      </header>

      <div className="filter-bar">
        <div className="filter-bar__inner">
          <div className="filters">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`filter ${activeFilter === f.id ? "active" : ""}`}
                onClick={() => setActiveFilter(f.id)}
              >
                <svg viewBox="0 0 24 24" fill="none">{f.icon}</svg>
                {f.label}
              </button>
            ))}
          </div>
          <span className="result-count"><b>{filtered.length}</b> places</span>
        </div>
      </div>

      <section className="dest-grid-section">
        {filtered.length > 0 ? (
          <div className="dest-grid">
            {filtered.map((p, i) => (
              <article key={p.id} className={`place-card reveal d${i % 6}`}>
                <div
                  className={`place-card__photo photo photo-reveal ${p.scene || ""}`}
                  style={p.gradient ? { background: p.gradient } : undefined}
                >
                  {p.img && <img src={p.img} alt="" loading="lazy" />}
                  <span className="place-card__badge">{p.badge}</span>
                  <button
                    type="button"
                    className={`place-card__save ${saved.has(p.id) ? "saved" : ""}`}
                    aria-label="Save place"
                    onClick={() => toggleSave(p.id)}
                  >
                    <HeartIcon />
                  </button>
                  {p.credit && <span className="photo-credit">{p.credit}</span>}
                </div>
                <p className="place-card__tag">{p.tag}</p>
                <h3 className="place-card__title">{p.title}</h3>
                <p className="place-card__loc"><PinIcon /> {p.loc}</p>
                <p className="place-card__desc">{p.desc}</p>
                <a href="#" className="place-card__link">Discover More <ArrowIcon /></a>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState icon="search" title="No places match that filter yet">
            We're adding new spots every week — try a different category.
          </EmptyState>
        )}
      </section>
    </div>
  );
}