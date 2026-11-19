import { useState, useMemo } from "react";
import { useScrollEffects } from "../hooks/useScrollEffects";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";

/* Food — converted from food.html. Same 9 restaurants, same spotlight
   four, same delivery utility row. Filtering wired up for real, same
   fix as Destinations (the original markup had no working JS). */

const SPOTS = [
  { num: "01", title: "Haji's Café", loc: "Muharraq · Since the 1950s", desc: "A breakfast institution by the old souq — balaleet, khubz, and eggs cooked the same way for three generations. Go before 9am or queue." },
  { num: "02", title: "Dona's Wonders", loc: "Muharraq", desc: "Home-style Bahraini cooking in a converted house — machboos and muhammar that taste like a grandmother made them, because one did." },
  { num: "03", title: "Villa Mamas", loc: "Adliya", desc: "Bahraini home cooking in a restored heritage house — book ahead, it's where residents take out-of-town family for a proper meal." },
  { num: "04", title: "Block 338 Night Market", loc: "Adliya · Weekly, evenings", desc: "A rotating street-food market of small local vendors — the best way to sample six things in one night without committing to one restaurant." },
];

const PLACES = [
  { id: "hajis", cat: ["bahraini", "street"], scene: "scene-bahraini", badge: "Local Favorite", local: true, price: "$", tag: "Bahraini · Breakfast", title: "Haji's Café", loc: "Muharraq", desc: "The most authentic Bahraini breakfast you'll find — a true local gem since the '50s.", rating: "4.5" },
  { id: "villamamas", cat: ["bahraini"], scene: "scene-arabic", badge: "Local Favorite", local: true, price: "$$", tag: "Arabic · Home Cooking", title: "Villa Mamas", loc: "Adliya", desc: "Tastes just like a Bahraini grandmother's home cooking, warm and delicious.", rating: "4.6" },
  { id: "mashawi", cat: ["bahraini", "street"], scene: "scene-street", badge: "Arabic Grill", price: "$$", tag: "Arabic · Grill", title: "Mashawi Al Khaleej", loc: "Manama", desc: "Huge portions of perfectly grilled meat — great value for a hungry group.", rating: "4.3" },
  { id: "rasoi", cat: ["asian"], scene: "scene-asian", badge: "N. Indian", price: "$$$", tag: "North Indian · Fine Dining", title: "Rasoi by Vineet", loc: "Seef", desc: "Refined Indian fine dining — every dish is plated like art and tastes incredible.", rating: "4.6" },
  { id: "sangeetha", cat: ["asian", "street"], scene: "scene-dessert", badge: "Local Favorite", local: true, price: "$", tag: "South Indian · Quick Bites", title: "Sangeetha Restaurant", loc: "Manama", desc: "Cheap, fast, and tasty — the unlimited meals are genuinely unbeatable value.", rating: "4.2" },
  { id: "lanterns", cat: ["cafe"], scene: "scene-cafe", badge: "Café", price: "$$", tag: "Café · Bakery", title: "Lanterns", loc: "Adliya", desc: "A Bahrain classic — the butter chicken and naan never disappoint.", rating: "4.5" },
  { id: "bukwara", cat: ["bahraini", "street"], scene: "scene-street", badge: "Local Favorite", local: true, price: "$", tag: "Bahraini · Shawarma", title: "Bu Kwara Shawarma", loc: "Manama", desc: "The shawarma spot every Bahraini has an opinion about — thin-cut, char-grilled, no shortcuts.", rating: "4.7" },
  { id: "wharf", cat: ["seafood"], scene: "scene-seafood", badge: "Seafood", price: "$$$", tag: "Seafood · Fresh Catch", title: "Fisherman's Wharf", loc: "Amwaj Islands", desc: "Waterfront grilled hammour and prawns, straight off the boats that morning.", rating: "4.4" },
  { id: "karak", cat: ["dessert", "cafe"], scene: "scene-dessert", badge: "Local Favorite", local: true, price: "$", tag: "Sweets · Karak", title: "Karak House Muharraq", loc: "Muharraq", desc: "The karak tea and freshly baked kunafa locals grab on their way to work.", rating: "4.8" },
];

const FILTERS = [
  { id: "all", label: "All" },
  { id: "bahraini", label: "Bahraini & Arabic" },
  { id: "asian", label: "Asian" },
  { id: "cafe", label: "Cafés & Bakeries" },
  { id: "street", label: "Street Food" },
  { id: "seafood", label: "Seafood" },
  { id: "dessert", label: "Desserts & Sweets" },
];

function PinIcon() {
  return <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 1.5a5 5 0 015 5c0 3.5-5 8-5 8s-5-4.5-5-8a5 5 0 015-5z" stroke="currentColor" strokeWidth="1.3" /><circle cx="8" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.3" /></svg>;
}
function ArrowIcon() {
  return <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function DeliveryIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="9" width="13" height="8" rx="1" stroke="currentColor" strokeWidth="1.6" /><path d="M16 12h3l2 3v2h-5v-5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><circle cx="7.5" cy="19" r="1.5" stroke="currentColor" strokeWidth="1.6" /><circle cx="17.5" cy="19" r="1.5" stroke="currentColor" strokeWidth="1.6" /></svg>;
}

export default function Food() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = useMemo(
    () => PLACES.filter((p) => activeFilter === "all" || p.cat.includes(activeFilter)),
    [activeFilter],
  );

  useScrollEffects([filtered]);

  return (
    <div>
      <style>{`
        .filter-bar { position: sticky; top: 72px; z-index: 50; background: var(--cream); border-bottom: 1px solid rgba(26,20,16,.08); padding: 0 var(--pad-x); }
        .filter-bar__inner { display:flex; align-items:center; justify-content:space-between; gap: 1.5rem; flex-wrap: wrap; padding: 1rem 0; }
        .filters { display:flex; gap: clamp(1.25rem, 3vw, 2.5rem); overflow-x:auto; scrollbar-width:none; }
        .filters::-webkit-scrollbar{display:none;}
        .filter { flex-shrink:0; font-family: var(--font-label); font-size: .72rem; font-weight: 600; color: var(--ink-soft); cursor:pointer; transition: color .25s; padding: .4rem .85rem; border-radius: 8px; background: none; border: none; }
        .filter.active { color: var(--white); background: var(--crimson); }
        .filter:not(.active):hover { color: var(--ink); background: var(--cream-warm); }
        .result-count { font-family: var(--font-label); font-size: .68rem; font-weight: 500; letter-spacing: .05em; color: var(--ink-soft); white-space: nowrap; }
        .result-count b { color: var(--crimson); font-weight: 700; }

        .spotlight { padding: clamp(2.5rem,5vw,4rem) var(--pad-x); background: var(--ink); }
        .spotlight__head { margin-bottom: 2rem; }
        .spotlight__eyebrow { font-family: var(--font-label); font-size: .65rem; font-weight: 600; letter-spacing: .3em; text-transform:uppercase; color: var(--gold); margin-bottom: .5rem; display:flex; align-items:center; gap:.6rem; }
        .spotlight__eyebrow::before { content:''; width:8px; height:8px; border-radius:50%; background:var(--crimson); }
        .spotlight__title { font-family: var(--font-heading); font-weight: 800; font-size: clamp(1.8rem, 3.5vw, 2.6rem); color: var(--cream); letter-spacing: -.01em; }
        .spotlight__title em { font-style: normal; color: var(--gold); }
        .spotlight__sub { font-size: .85rem; color: rgba(250,246,239,.55); margin-top: .5rem; max-width: 520px; }
        .spotlight-grid { display:grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
        .spot-card { display:flex; gap:1rem; padding:1.5rem; border-radius:8px; border:1px solid rgba(250,246,239,.1); transition: background .3s, border-color .3s, transform .3s var(--ease); }
        .spot-card:hover { background: rgba(250,246,239,.07); border-color: rgba(184,146,74,.35); transform: translateY(-3px); }
        .spot-card__num { font-family: var(--font-display); font-size: 2.2rem; font-weight: 500; color: var(--gold); line-height: 1; flex-shrink:0; opacity: .7; }
        .spot-card__title { font-family: var(--font-heading); font-weight: 800; font-size: 1.05rem; color: var(--cream); margin-bottom: .35rem; }
        .spot-card__loc { font-family: var(--font-label); font-size: .62rem; font-weight: 500; letter-spacing: .12em; text-transform:uppercase; color: var(--gold); margin-bottom: .5rem; }
        .spot-card__desc { font-size: .8rem; color: rgba(250,246,239,.6); line-height: 1.65; }
        @media (max-width: 768px) { .spotlight-grid { grid-template-columns: 1fr; } }

        .food-grid-section { padding: clamp(2.5rem,4vw,3.5rem) var(--pad-x) clamp(4rem,7vw,6rem); }
        .utility-row { display:flex; align-items:center; justify-content:space-between; gap:1.5rem; background: var(--cream-warm); border-radius: 8px; padding: 1.25rem 1.5rem; margin-bottom: 2.5rem; flex-wrap:wrap; }
        .utility-row__left { display:flex; align-items:center; gap: 1rem; }
        .utility-row__icon { width:40px; height:40px; border-radius:8px; background: var(--crimson-soft); color: var(--crimson); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .utility-row__title { font-family: var(--font-heading); font-weight: 800; font-size: .95rem; color: var(--ink); }
        .utility-row__desc { font-size: .78rem; color: var(--ink-soft); margin-top: 2px; }
        .utility-row__link { font-family: var(--font-label); font-size: .64rem; font-weight: 600; letter-spacing: .12em; text-transform:uppercase; color: var(--crimson); display:flex; align-items:center; gap:.4rem; white-space:nowrap; text-decoration:none; }

        .food-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.75rem; }
        .food-card { display:flex; flex-direction:column; transition: transform .4s var(--ease); }
        .food-card__photo { position: relative; height: 220px; border-radius: 8px; margin-bottom: 1.1rem; transition: transform .5s var(--ease); }
        .food-card:hover .food-card__photo { transform: translateY(-5px); }
        .food-card__badge { position:absolute; top: .85rem; left: .85rem; z-index: 3; background: rgba(26,20,16,.55); backdrop-filter: blur(6px); color: var(--cream); font-family: var(--font-label); font-size: .58rem; font-weight: 600; letter-spacing: .15em; text-transform:uppercase; padding: .35rem .7rem; border-radius: 6px; }
        .food-card__badge--local { background: var(--crimson); }
        .food-card__price { position:absolute; top: .85rem; right: .85rem; z-index: 3; background: rgba(26,20,16,.55); backdrop-filter: blur(6px); color: var(--gold); font-family: var(--font-label); font-size: .68rem; font-weight: 700; letter-spacing: .05em; padding: .3rem .6rem; border-radius: 6px; }
        .food-card__tag { font-family: var(--font-label); font-size: .6rem; font-weight: 600; letter-spacing: .2em; text-transform:uppercase; color: var(--crimson); display:flex; align-items:center; gap:.4rem; margin-bottom:.4rem; }
        .food-card__tag::before { content:''; width:12px; height:1px; background:var(--crimson); }
        .food-card__title { font-family: var(--font-heading); font-size: 1.1rem; font-weight: 800; color: var(--ink); margin-bottom: .3rem; letter-spacing: -.01em; }
        .food-card__loc { display:flex; align-items:center; gap:.35rem; font-family: var(--font-label); font-size: .68rem; font-weight: 500; color: var(--ink-soft); margin-bottom: .55rem; }
        .food-card__desc { font-size: .82rem; font-weight: 300; color: var(--ink-soft); line-height: 1.6; margin-bottom: .7rem; flex:1; }
        .food-card__footer { display:flex; align-items:center; justify-content:space-between; }
        .food-card__link { font-family: var(--font-label); font-size: .64rem; font-weight: 600; letter-spacing: .14em; text-transform:uppercase; color: var(--crimson); display:inline-flex; align-items:center; gap:.4rem; border-bottom: 1px solid rgba(155,27,48,.25); padding-bottom: 2px; transition: gap .3s var(--ease), border-color .3s; }
        .food-card:hover .food-card__link { gap: .75rem; border-color: var(--crimson); }
        .food-card__rating { display:flex; align-items:center; gap:.3rem; font-family: var(--font-label); font-size: .7rem; font-weight: 600; color: var(--ink-soft); }
        @media (max-width: 1100px) { .food-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .food-grid { grid-template-columns: 1fr; } }

        .photo { position: relative; overflow: hidden; }
        .photo::after { content: ''; position: absolute; inset: 0; background: linear-gradient(160deg, rgba(155,27,48,.14) 0%, rgba(26,20,16,.08) 55%, rgba(26,20,16,.32) 100%); mix-blend-mode: multiply; pointer-events: none; }
        .photo-reveal { clip-path: inset(0 0 100% 0); transform: scale(1.08); transition: clip-path 1s var(--ease), transform 1.2s var(--ease); }
        .revealed .photo-reveal { clip-path: inset(0 0 0% 0); transform: scale(1); }

        .scene-bahraini { background: radial-gradient(ellipse 55% 45% at 40% 25%, rgba(255,200,140,.4) 0%, transparent 55%), linear-gradient(160deg, #3A1E10 0%, #6E3A18 40%, #B0712E 75%, #D9A24E 100%); }
        .scene-arabic { background: radial-gradient(ellipse 50% 40% at 60% 20%, rgba(255,215,170,.4) 0%, transparent 55%), linear-gradient(165deg, #2E1810 0%, #5C3420 40%, #8A5A34 75%, #B8895C 100%); }
        .scene-asian { background: radial-gradient(ellipse 50% 45% at 50% 20%, rgba(255,180,150,.35) 0%, transparent 55%), linear-gradient(160deg, #2A1416 0%, #5C2A2E 40%, #8A4248 75%, #B8646A 100%); }
        .scene-cafe { background: radial-gradient(ellipse 55% 40% at 45% 25%, rgba(230,200,160,.4) 0%, transparent 55%), linear-gradient(165deg, #221812 0%, #4A342A 40%, #7A5A44 75%, #A88868 100%); }
        .scene-street { background: radial-gradient(ellipse 50% 50% at 55% 30%, rgba(255,190,120,.4) 0%, transparent 55%), linear-gradient(155deg, #241008 0%, #522A10 40%, #8A5220 75%, #C4863E 100%); }
        .scene-seafood { background: radial-gradient(ellipse 55% 40% at 50% 20%, rgba(200,235,235,.4) 0%, transparent 55%), linear-gradient(165deg, #0C2426 0%, #1E4A4E 40%, #3A7478 75%, #5C9EA0 100%); }
        .scene-dessert { background: radial-gradient(ellipse 50% 45% at 55% 25%, rgba(255,210,220,.4) 0%, transparent 55%), linear-gradient(160deg, #2A1218 0%, #5C2432 40%, #8A3E52 75%, #B8687C 100%); }
      `}</style>

      <PageHeader
        eyebrow="Where To Eat"
        title={<>A Taste of <em>Bahrain</em></>}
        sub="From machboos simmered since morning to the harees stall that's been on the same corner for forty years — this is where locals actually eat, not just where tourists are pointed."
      />

      <div className="filter-bar">
        <div className="filter-bar__inner">
          <div className="filters">
            {FILTERS.map((f) => (
              <button key={f.id} type="button" className={`filter ${activeFilter === f.id ? "active" : ""}`} onClick={() => setActiveFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
          <span className="result-count"><b>{filtered.length}</b> places</span>
        </div>
      </div>

      <section className="spotlight">
        <div className="spotlight__head reveal">
          <p className="spotlight__eyebrow">Support Local</p>
          <h2 className="spotlight__title">Where Locals <em>Actually</em> Go</h2>
          <p className="spotlight__sub">No delivery-app ranking, no sponsored placement — just the spots Bahrainis actually queue for.</p>
        </div>
        <div className="spotlight-grid">
          {SPOTS.map((s, i) => (
            <div key={s.num} className={`spot-card reveal d${i}`}>
              <span className="spot-card__num">{s.num}</span>
              <div>
                <h3 className="spot-card__title">{s.title}</h3>
                <p className="spot-card__loc">{s.loc}</p>
                <p className="spot-card__desc">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="sadu-strip"></div>

      <section className="food-grid-section" style={{ paddingBottom: 0 }}>
        <div className="utility-row reveal">
          <div className="utility-row__left">
            <div className="utility-row__icon"><DeliveryIcon /></div>
            <div>
              <p className="utility-row__title">Order Delivery</p>
              <p className="utility-row__desc">Talabat, Jahez, and Deliveroo cover most of this list</p>
            </div>
          </div>
          <a href="#" className="utility-row__link">Open Delivery Apps <ArrowIcon /></a>
        </div>
      </section>

      <section className="food-grid-section">
        {filtered.length > 0 ? (
          <div className="food-grid">
            {filtered.map((p, i) => (
              <article key={p.id} className={`food-card reveal d${i % 6}`}>
                <div className={`food-card__photo photo photo-reveal ${p.scene}`}>
                  <span className={`food-card__badge ${p.local ? "food-card__badge--local" : ""}`}>{p.badge}</span>
                  <span className="food-card__price">{p.price}</span>
                </div>
                <p className="food-card__tag">{p.tag}</p>
                <h3 className="food-card__title">{p.title}</h3>
                <p className="food-card__loc"><PinIcon /> {p.loc}</p>
                <p className="food-card__desc">{p.desc}</p>
                <div className="food-card__footer">
                  <a href="#" className="food-card__link">View <ArrowIcon /></a>
                  <span className="food-card__rating">★ {p.rating}</span>
                </div>
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
