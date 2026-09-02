import { useRef, useState, useEffect } from "react";
import { useScrollEffects } from "../hooks/useScrollEffects";

/* ---------------------------------------------------------------
   Home — converted from index.html. Visual output is unchanged
   from the original: same layout, copy, animations, structure.
   What changed is purely technical:
   - Nav, mobile menu, and cursor removed (now global, see App.jsx)
   - Colors/fonts/sadu-strip/reveal now come from index.css instead
     of being redeclared here
   - Reveal/magnetic/count-up now run via the shared useScrollEffects
     hook instead of page-specific vanilla JS
   - Real photos used where a verified source exists (Manama, Bahrain
     Fort, Tree of Life, Al-Fateh Mosque — sourced for destinations.html
     earlier). Everything else stays the same honest gradient
     placeholder-with-label pattern — Hawar Islands, the F1 GP event,
     Spring of Culture, National Day, and two story cards are still
     genuinely unsourced, not silently swapped for a wrong photo.
------------------------------------------------------------------ */

const REAL_PHOTOS = {
  manama: "https://images.pexels.com/photos/11647418/pexels-photo-11647418.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&dpr=1",
  fort: "https://commons.wikimedia.org/wiki/Special:FilePath/Bahrain%20Fort%20March%202015.JPG?width=800",
  tree: "https://commons.wikimedia.org/wiki/Special:FilePath/Tree%20of%20Life%20in%20Bahrain.JPG?width=800",
  mosque: "https://commons.wikimedia.org/wiki/Special:FilePath/Grand%20mosque%20in%20Bahrain.jpg?width=800",
};

function ArrowIcon() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function Home() {
  useScrollEffects();

  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // React's `autoPlay` attribute doesn't always reliably trigger native
    // autoplay on a freshly-mounted <video> — calling .play() explicitly
    // is the standard fix. Errors are caught and ignored since some
    // browsers still block it regardless (rare with muted video, but safe).
    videoRef.current?.play().catch(() => {});
  }, []);

  function toggleMute() {
    if (videoRef.current) videoRef.current.muted = !videoRef.current.muted;
    setMuted((m) => !m);
  }
  function togglePause() {
    if (!videoRef.current) return;
    if (videoRef.current.paused) { videoRef.current.play(); setPaused(false); }
    else { videoRef.current.pause(); setPaused(true); }
  }

  return (
    <div>
      <style>{`
        .hero { position: relative; height: 86vh; min-height: 560px; }
        .hero__photo { position:absolute; inset:0; }
        .hero__video { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .hero__photo-fallback { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:-1; }
        .hero__overlay { position:absolute; inset:0; z-index:1; background: linear-gradient(0deg, rgba(26,20,16,.55) 0%, rgba(26,20,16,.05) 45%, transparent 70%); }
        .hero__content { position:relative; z-index:2; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding: 0 var(--pad-x); max-width: 900px; margin: 0 auto; }
        .hero__eyebrow { font-family: var(--font-label); font-size: .7rem; font-weight: 500; letter-spacing: .35em; text-transform:uppercase; color: var(--gold); margin-bottom: 1.1rem; }
        .hero__title { font-family: var(--font-display); font-weight: 600; font-size: clamp(3.2rem, 8vw, 6.8rem); line-height: 1.02; color: var(--white); margin-bottom: 1.1rem; }
        .hero__title em { font-style: italic; font-weight: 600; color: var(--cream); }
        .hero__sub { font-family: var(--font-body); font-size: clamp(.95rem, 1.6vw, 1.15rem); font-weight: 400; color: rgba(255,255,255,.9); max-width: 560px; margin: 0 auto 2rem; line-height: 1.7; }
        .btn-crimson { display:inline-flex; align-items:center; gap:.6rem; font-family: var(--font-label); font-size: .8rem; font-weight: 600; letter-spacing: .06em; color: var(--cream); background: var(--crimson); padding: .95rem 1.9rem; border-radius: 100px; transition: background .3s, transform .3s var(--ease); }
        .btn-crimson:hover { background: var(--crimson-deep); transform: translateY(-2px); }
        .hero__vid-ctrl { position:absolute; top:1.5rem; right: var(--pad-x); z-index:3; display:flex; gap:.5rem; }
        .vid-btn { width:36px; height:36px; border-radius:50%; border:1px solid rgba(255,255,255,.3); background:rgba(26,20,16,.4); color:#fff; display:flex; align-items:center; justify-content:center; transition:background .25s, border-color .25s; }
        .vid-btn:hover { background: rgba(26,20,16,.7); border-color: rgba(255,255,255,.4); }
        .hero__tabs { position:absolute; left:0; right:0; bottom:0; z-index:2; display:flex; padding: 0 var(--pad-x); background: linear-gradient(0deg, rgba(26,20,16,.65), transparent); }
        .hero__tab { flex:1; padding: 1.1rem 1rem 1rem; position:relative; border-top: 2px solid rgba(255,255,255,.2); font-family: var(--font-label); font-size: .78rem; font-weight: 500; color: rgba(255,255,255,.55); text-align:left; }
        .hero__tab + .hero__tab { border-left: 1px solid rgba(255,255,255,.12); }
        .hero__tab.active { color: var(--white); }
        .hero__tab.active::before { content:''; position:absolute; top:-2px; left:0; height:2px; width:100%; background: linear-gradient(90deg, var(--gold), var(--crimson)); }
        .hero__tab span { display:block; font-family:var(--font-body); font-size:.68rem; font-weight:300; color:rgba(255,255,255,.4); margin-top:2px; }
        @media (max-width: 768px) { .hero__tab span { display:none; } .hero__tab:nth-child(3) { display:none; } }
        .photo-credit { position:absolute; bottom:6px; left:8px; z-index:3; font-family: var(--font-label); font-size:.55rem; color: rgba(255,255,255,.5); }

        .section { padding: clamp(3rem, 6vw, 5.5rem) 0; }
        .section__head { padding: 0 var(--pad-x); display:flex; justify-content:space-between; align-items:flex-end; margin-bottom: 2.25rem; gap: 1.5rem; flex-wrap:wrap; }
        .section__eyebrow { font-family: var(--font-label); font-size: .62rem; font-weight: 600; letter-spacing: .28em; text-transform:uppercase; color: var(--crimson); margin-bottom: .55rem; display:block; }
        .section__title { font-family: var(--font-heading); font-weight: 800; font-size: clamp(1.9rem, 4vw, 3rem); line-height: 1.05; color: var(--ink); letter-spacing: -.02em; }
        .section__title em { font-style: normal; color: var(--crimson); }
        .section__viewall { font-family: var(--font-label); font-size: .68rem; font-weight: 600; letter-spacing: .12em; text-transform:uppercase; color: var(--crimson); display:flex; align-items:center; gap:.5rem; white-space:nowrap; border-bottom: 1px solid rgba(155,27,48,.3); padding-bottom: 2px; transition: gap .3s var(--ease), border-color .3s; }
        .section__viewall:hover { gap: .9rem; border-color: var(--crimson); }

        .filters { display:flex; gap: clamp(1.5rem, 4vw, 3.5rem); padding: 0 var(--pad-x); overflow-x:auto; scrollbar-width:none; border-bottom: 1px solid rgba(26,20,16,.08); margin-bottom: 2.5rem; }
        .filters::-webkit-scrollbar{display:none;}
        .filter { display:flex; flex-direction:column; align-items:center; gap:.6rem; padding-bottom: 1.1rem; flex-shrink:0; font-family: var(--font-label); font-size: .72rem; font-weight: 500; color: var(--ink-soft); position:relative; cursor:pointer; transition: color .25s; background:none; border:none; }
        .filter svg { width:26px; height:26px; stroke: var(--ink-soft); transition: stroke .25s; }
        .filter.active { color: var(--ink); }
        .filter.active svg { stroke: var(--crimson); }
        .filter.active::after { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; background:var(--crimson); }
        .filter:hover { color: var(--ink); }

        .dest-row { display:flex; gap: 1.75rem; padding: 0 var(--pad-x) .5rem; overflow-x:auto; scrollbar-width:none; }
        .dest-row::-webkit-scrollbar { display:none; }
        .dest-card { flex: 0 0 300px; }
        .dest-card__photo { height: 360px; border-radius: 6px; margin-bottom: 1.1rem; transition: transform .55s var(--ease); }
        .dest-card:hover .dest-card__photo { transform: translateY(-6px); }
        .dest-card__tag { font-family: var(--font-label); font-size: .6rem; font-weight: 500; letter-spacing: .22em; text-transform:uppercase; color: var(--crimson); display:flex; align-items:center; gap:.45rem; margin-bottom:.5rem; }
        .dest-card__tag::before { content:''; width:14px; height:1px; background:var(--crimson); }
        .dest-card__title { font-family: var(--font-heading); font-size: 1.2rem; font-weight: 800; color: var(--ink); margin-bottom: .4rem; letter-spacing: -.01em; }
        .dest-card__desc { font-size: .82rem; font-weight: 300; color: var(--ink-soft); line-height: 1.65; margin-bottom: .8rem; }
        .dest-card__link { font-family: var(--font-label); font-size: .65rem; font-weight: 600; letter-spacing: .15em; text-transform:uppercase; color: var(--crimson); display:inline-flex; align-items:center; gap:.4rem; border-bottom: 1px solid rgba(155,27,48,.25); padding-bottom: 2px; transition: gap .3s var(--ease), border-color .3s; }
        .dest-card:hover .dest-card__link { gap: .8rem; border-color: var(--crimson); }

        .numbers { padding: 0 var(--pad-x); }
        .numbers-grid { display:grid; grid-template-columns: 1.4fr 1fr; gap: 1.25rem; }
        .numbers-grid > div { display:grid; gap:1.25rem; }
        .num-card { background: var(--cream-warm); border-radius: 8px; padding: 2rem; position:relative; overflow:hidden; display:flex; flex-direction:column; justify-content:center; gap:.5rem; }
        .num-card::before { content:''; position:absolute; left:0; top:0; bottom:0; width:6px; background: repeating-linear-gradient(135deg, var(--crimson) 0 6px, var(--gold) 6px 9px, var(--cream-warm) 9px 14px); }
        .num-card--big { grid-row: span 2; min-height: 300px; }
        .num-card b { font-family: var(--font-heading); font-weight: 800; font-size: clamp(2.5rem, 5vw, 4.5rem); color: var(--crimson); line-height:1; display:block; }
        .num-card--big b { font-size: clamp(3rem, 6vw, 5.5rem); }
        .num-card p { font-family: var(--font-heading); font-weight: 700; font-size: 1.05rem; color: var(--ink); line-height:1.3; max-width: 320px; }
        @media (max-width: 900px) { .numbers-grid { grid-template-columns: 1fr; } .num-card--big { grid-row: span 1; min-height:auto; } }

        .events { background: var(--cream-warm); }
        .events-row { display:flex; gap: 1.5rem; padding: 0 var(--pad-x); overflow-x:auto; scrollbar-width:none; }
        .events-row::-webkit-scrollbar { display:none; }
        .event-card { flex: 0 0 240px; position:relative; }
        .event-card__photo { height: 300px; border-radius: 6px; position:relative; }
        .event-card__date { position:absolute; top:0; left:0; z-index:3; background: var(--crimson); color: var(--cream); padding: .75rem 1.1rem; min-width:64px; }
        .event-card__date b { display:block; font-family: var(--font-display); font-size: 2rem; font-weight:500; line-height:1; }
        .event-card__date span { display:block; font-family: var(--font-label); font-size: .6rem; font-weight:500; letter-spacing:.15em; text-transform:uppercase; margin-top:.25rem; }
        .event-card__title { font-family: var(--font-heading); font-size: 1rem; font-weight: 700; margin-top: .9rem; color: var(--ink); letter-spacing: -.01em; line-height:1.3; }
        .event-card__loc { font-family: var(--font-label); font-size: .62rem; font-weight:500; letter-spacing:.15em; text-transform:uppercase; color: var(--crimson); margin-top: .35rem; }

        .stories-grid { display:grid; grid-template-columns: 1.3fr 1fr 1fr; gap: 1.5rem; padding: 0 var(--pad-x); }
        .story-card { display:flex; flex-direction:column; text-decoration:none; }
        .story-card__photo { height: 320px; border-radius: 6px; margin-bottom: 1rem; transition: transform .5s var(--ease); }
        .story-card:hover .story-card__photo { transform: scale(1.02); }
        .story-card:first-child .story-card__photo { height: 420px; }
        .story-card__cat { font-family: var(--font-label); font-size: .58rem; font-weight:500; letter-spacing:.28em; text-transform:uppercase; color: var(--crimson); margin-bottom: .6rem; }
        .story-card__rule { width: 32px; height: 1px; background: var(--crimson); opacity:.35; margin-bottom: .7rem; }
        .story-card__title { font-family: var(--font-heading); font-size: clamp(1.15rem, 1.8vw, 1.5rem); font-weight: 800; color: var(--ink); line-height:1.2; letter-spacing: -.01em; transition: color .25s; }
        .story-card:hover .story-card__title { color: var(--crimson-deep); }
        .story-card:first-child .story-card__title { font-size: clamp(1.5rem, 2.4vw, 2.1rem); }
        @media (max-width: 1024px) { .stories-grid { grid-template-columns: 1fr 1fr; } .story-card:first-child { grid-column: span 2; } }
        @media (max-width: 640px) { .stories-grid { grid-template-columns: 1fr; } .story-card:first-child { grid-column: span 1; } }

        .kbyg { background: var(--cream-warm); }
        .kbyg__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; padding: 0 var(--pad-x); }
        .kbyg__card { background: var(--white); border-radius: 8px; border: 1px solid rgba(26,20,16,.07); padding: 2rem 1.5rem; display:flex; flex-direction:column; gap:.6rem; transition: transform .35s var(--ease), box-shadow .35s var(--ease), border-color .3s; text-decoration:none; }
        .kbyg__card:hover { transform: translateY(-5px); box-shadow: 0 16px 36px rgba(26,20,16,.09); border-color: rgba(155,27,48,.2); }
        .kbyg__icon { width: 44px; height: 44px; margin-bottom: .4rem; color: var(--crimson); }
        .kbyg__icon svg { width: 100%; height: 100%; }
        .kbyg__title { font-family: var(--font-heading); font-weight: 800; font-size: 1.05rem; color: var(--ink); letter-spacing: -.01em; line-height: 1.2; }
        .kbyg__desc { font-size: .82rem; font-weight: 300; color: var(--ink-soft); line-height: 1.65; flex: 1; }
        .kbyg__link { font-family: var(--font-label); font-size: .6rem; font-weight: 600; letter-spacing: .15em; text-transform: uppercase; color: var(--crimson); margin-top: .5rem; }
        @media (max-width: 1024px) { .kbyg__grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .kbyg__grid { grid-template-columns: 1fr 1fr; gap:.75rem; padding: 0 1.25rem; } }

        .footer { background: var(--ink); color: var(--cream); padding: 3.5rem 0 1.75rem; }
        .footer__top { padding: 0 var(--pad-x) 2.5rem; display:grid; grid-template-columns: 1.6fr 1fr 1fr 1fr; gap: 2.5rem; border-bottom: 1px solid rgba(250,246,239,.1); margin-bottom: 1.5rem; }
        .footer__logo { font-family: var(--font-display); font-style:italic; font-size:1.6rem; margin-bottom:.6rem; }
        .footer__logo span { color: var(--crimson); font-style:normal; }
        .footer__desc { font-size: .82rem; color: rgba(250,246,239,.5); line-height:1.75; max-width: 320px; }
        .footer__head { font-family: var(--font-label); font-size: .62rem; font-weight:500; letter-spacing:.25em; text-transform:uppercase; color: var(--gold); margin-bottom:1rem; display:block; }
        .footer__links { list-style:none; display:flex; flex-direction:column; gap:.65rem; }
        .footer__links a { font-size: .85rem; color: rgba(250,246,239,.55); transition:color .25s; text-decoration:none; }
        .footer__links a:hover { color: var(--cream); }
        .footer__bottom { padding: 0 var(--pad-x); display:flex; justify-content:space-between; flex-wrap:wrap; gap:1rem; }
        .footer__copy { font-family: var(--font-label); font-size: .62rem; letter-spacing:.1em; color: rgba(250,246,239,.3); }
        @media (max-width: 900px) { .footer__top { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 560px) { .footer__top { grid-template-columns: 1fr; } }

        .photo { position: relative; overflow: hidden; background-size: cover; background-position: center; }
        .photo::after { content: ''; position: absolute; inset: 0; background: linear-gradient(160deg, rgba(155,27,48,.14) 0%, rgba(26,20,16,.08) 55%, rgba(26,20,16,.32) 100%); mix-blend-mode: multiply; pointer-events: none; }
        .photo img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:0; }
        .photo__label { position: absolute; bottom: 8px; right: 10px; z-index: 3; font-family: var(--font-label); font-size: .55rem; font-weight: 400; letter-spacing: .12em; color: rgba(255,255,255,.45); pointer-events: none; }
        .photo-reveal { clip-path: inset(0 0 100% 0); transform: scale(1.08); transition: clip-path 1s var(--ease), transform 1.2s var(--ease); }
        .revealed .photo-reveal { clip-path: inset(0 0 0% 0); transform: scale(1); }

        .scene-hawar { background: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(220,255,250,.5) 0%, transparent 55%), linear-gradient(180deg, #BFEFEA 0%, #6FCBD0 35%, #1F92AC 70%, #0C5C78 100%); }
        .scene-souq { background: radial-gradient(ellipse 50% 55% at 65% 30%, rgba(255,190,110,.45) 0%, transparent 60%), linear-gradient(155deg, #3A1E10 0%, #6E3A18 40%, #B0712E 75%, #D9A24E 100%); }
        .scene-hero { background: radial-gradient(ellipse 65% 55% at 65% 10%, rgba(255,205,160,.55) 0%, transparent 55%), linear-gradient(180deg, #FBE2C2 0%, #F0BB9A 25%, #C9897F 48%, #7C5A75 72%, #382F45 100%); }
        .scene-mosque { background: radial-gradient(ellipse 55% 45% at 50% 35%, rgba(255,255,255,.5) 0%, transparent 60%), linear-gradient(180deg, #DCEEF7 0%, #AED4E8 35%, #6FA8C2 70%, #3D6E8A 100%); }
      `}</style>

      {/* HERO */}
      <section className="hero">
        <div className="hero__photo photo scene-hero">
          <video
            ref={videoRef}
            className="hero__video"
            autoPlay muted loop playsInline preload="auto"
            poster="https://images.pexels.com/videos/27287040/architecture-background-building-city-27287040.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080"
          >
            <source src="https://videos.pexels.com/video-files/27287040/27287040-hd_1920_1080_24fps.mp4" type="video/mp4" />
          </video>
          <span className="photo-credit">Video by Engin Akyurt · Pexels</span>
        </div>

        <div className="hero__vid-ctrl">
          <button className="vid-btn" aria-label="Toggle sound" onClick={toggleMute}>
            {muted ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M23 9l-6 6M17 9l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            )}
          </button>
          <button className="vid-btn" aria-label="Pause video" onClick={togglePause}>
            {paused ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 3l14 9-14 9V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="6" y="4" width="4" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" /><rect x="14" y="4" width="4" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" /></svg>
            )}
          </button>
        </div>

        <div className="hero__overlay"></div>
        <div className="hero__content">
          <p className="hero__eyebrow">Kingdom of Bahrain</p>
          <h1 className="hero__title">Island Time, <em>Your Way</em></h1>
          <p className="hero__sub">From 4,000-year-old forts to the world's best pearls, from late-night machboos to flamingo-pink shores — Bahrain rewards the curious.</p>
          <a href="#destinations" className="btn-crimson magnetic">
            Start Exploring <ArrowIcon />
          </a>
        </div>
        <div className="hero__tabs">
          <div className="hero__tab active">Island Time, Your Way<span>Manama waterfront, golden hour</span></div>
          <div className="hero__tab">A Taste of Bahrain<span>Machboos, oud, and souq spice</span></div>
          <div className="hero__tab">Pearls & Provenance<span>The world's oldest pearl trade</span></div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="section" id="destinations">
        <div className="section__head reveal">
          <div>
            <span className="section__eyebrow">Where to go</span>
            <h2 className="section__title">Explore <em>Bahrain</em></h2>
          </div>
          <a href="/destinations" className="section__viewall">View All <ArrowIcon /></a>
        </div>

        <div className="filters reveal d1">
          <button className="filter active">
            <svg viewBox="0 0 24 24" fill="none"><path d="M4 12l8 8 8-8M4 12l8-8 8 8" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
            All
          </button>
          <button className="filter">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 3c3 3 5 6 5 9a5 5 0 01-10 0c0-3 2-6 5-9z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="M12 21v-6" stroke="currentColor" strokeWidth="1.4" /></svg>
            Nature
          </button>
          <button className="filter">
            <svg viewBox="0 0 24 24" fill="none"><path d="M4 20h16M6 20V10l6-5 6 5v10M10 20v-6h4v6" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
            Culture & History
          </button>
          <button className="filter">
            <svg viewBox="0 0 24 24" fill="none"><path d="M6 8h12l-1 12H7L6 8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="M9 8a3 3 0 016 0" stroke="currentColor" strokeWidth="1.4" /></svg>
            Shopping
          </button>
          <button className="filter">
            <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" /><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
            Food & Drink
          </button>
        </div>

        <div className="dest-row">
          <article className="dest-card reveal">
            <div className="dest-card__photo photo-reveal photo">
              <img src={REAL_PHOTOS.manama} alt="Bahrain World Trade Center towers at sunset" loading="lazy" />
              <span className="photo-credit">YOUSIF · Pexels</span>
            </div>
            <p className="dest-card__tag">Capital City</p>
            <h3 className="dest-card__title">Manama</h3>
            <p className="dest-card__desc">Glass towers rise where pearl merchants once weighed their catch — souqs, rooftop cafés, and a waterfront made for evening walks.</p>
            <a href="/destinations" className="dest-card__link">Discover More <ArrowIcon /></a>
          </article>

          <article className="dest-card reveal d1">
            <div className="dest-card__photo photo-reveal photo">
              <img src={REAL_PHOTOS.fort} alt="Qal'at al-Bahrain ruins" loading="lazy" />
            </div>
            <p className="dest-card__tag">UNESCO Site</p>
            <h3 className="dest-card__title">Bahrain Fort</h3>
            <p className="dest-card__desc">A 4,000-year-old tell overlooking the Gulf — once the capital of ancient Dilmun, now a quiet ruin with sweeping coastal views.</p>
            <a href="/destinations" className="dest-card__link">Discover More <ArrowIcon /></a>
          </article>

          <article className="dest-card reveal d2">
            <div className="dest-card__photo photo-reveal photo">
              <img src={REAL_PHOTOS.tree} alt="Tree of Life, Sakhir" loading="lazy" />
            </div>
            <p className="dest-card__tag">Natural Wonder</p>
            <h3 className="dest-card__title">Tree of Life</h3>
            <p className="dest-card__desc">A 400-year-old mesquite standing alone in the desert with no visible water source — still unexplained, still thriving.</p>
            <a href="/destinations" className="dest-card__link">Discover More <ArrowIcon /></a>
          </article>

          <article className="dest-card reveal d3">
            <div className="dest-card__photo photo-reveal photo">
              <img src={REAL_PHOTOS.mosque} alt="Al-Fateh Grand Mosque" loading="lazy" />
            </div>
            <p className="dest-card__tag">Landmark</p>
            <h3 className="dest-card__title">Al-Fateh Mosque</h3>
            <p className="dest-card__desc">One of the world's largest mosques, its fibreglass dome and Austrian chandeliers open to visitors of every faith.</p>
            <a href="/destinations" className="dest-card__link">Discover More <ArrowIcon /></a>
          </article>

          <article className="dest-card reveal d4">
            <div className="dest-card__photo photo-reveal photo scene-hawar">
              <span className="photo__label">Hawar Islands</span>
            </div>
            <p className="dest-card__tag">Island Escape</p>
            <h3 className="dest-card__title">Hawar Islands</h3>
            <p className="dest-card__desc">A remote archipelago near the Qatari border, where dugongs graze and flamingos turn the shallows pink each winter.</p>
            <a href="/destinations" className="dest-card__link">Discover More <ArrowIcon /></a>
          </article>
        </div>
      </section>

      {/* BAHRAIN IN NUMBERS */}
      <section className="section">
        <div className="section__head reveal">
          <div>
            <span className="section__eyebrow">By The Numbers</span>
            <h2 className="section__title">Bahrain in <em>Numbers</em></h2>
          </div>
        </div>
        <div className="numbers-grid reveal d1">
          <div className="num-card num-card--big">
            <b data-count="4000" data-suffix="+">0</b>
            <p>Years of continuous history, from ancient Dilmun to the present day</p>
          </div>
          <div>
            <div className="num-card">
              <b data-count="33">0</b>
              <p>Islands make up the Kingdom of Bahrain</p>
            </div>
            <div className="num-card">
              <b>3</b>
              <p>UNESCO World Heritage Sites to explore</p>
            </div>
          </div>
        </div>
      </section>

      <div className="sadu-strip"></div>

      {/* EVENTS */}
      <section className="section events">
        <div className="section__head reveal">
          <div>
            <span className="section__eyebrow">This Month</span>
            <h2 className="section__title">What's <em>On</em></h2>
          </div>
          <a href="/events" className="section__viewall">View All <ArrowIcon /></a>
        </div>

        <div className="events-row">
          <article className="event-card reveal">
            <div className="event-card__photo photo-reveal photo scene-souq">
              <div className="event-card__date"><b>14</b><span>Nov</span></div>
              <span className="photo__label">Muharraq Souq</span>
            </div>
            <h3 className="event-card__title">Muharraq Heritage Night Market</h3>
            <p className="event-card__loc">Muharraq · Old Town</p>
          </article>

          <article className="event-card reveal d1">
            <div className="event-card__photo photo-reveal photo scene-hero">
              <div className="event-card__date"><b>21</b><span>Nov</span></div>
              <span className="photo__label">F1 Bahrain GP</span>
            </div>
            <h3 className="event-card__title">Bahrain Grand Prix — Night Race</h3>
            <p className="event-card__loc">Sakhir · BIC</p>
          </article>

          <article className="event-card reveal d2">
            <div className="event-card__photo photo-reveal photo scene-mosque">
              <div className="event-card__date"><b>05</b><span>Dec</span></div>
              <span className="photo__label">Spring of Culture</span>
            </div>
            <h3 className="event-card__title">Spring of Culture: Opening Night</h3>
            <p className="event-card__loc">Manama · Cultural Hall</p>
          </article>

          <article className="event-card reveal d3">
            <div className="event-card__photo photo-reveal photo scene-hawar">
              <div className="event-card__date"><b>16</b><span>Dec</span></div>
              <span className="photo__label">National Day</span>
            </div>
            <h3 className="event-card__title">National Day Fireworks & Parade</h3>
            <p className="event-card__loc">Manama Corniche</p>
          </article>
        </div>
      </section>

      {/* STORIES & GUIDES */}
      <section className="section">
        <div className="section__head reveal">
          <div>
            <span className="section__eyebrow">Read Before You Go</span>
            <h2 className="section__title">Stories & <em>Guides</em></h2>
          </div>
          <a href="/stories" className="section__viewall">View All <ArrowIcon /></a>
        </div>

        <div className="stories-grid">
          <a href="/stories" className="story-card reveal">
            <div className="story-card__photo photo-reveal photo scene-souq">
              <span className="photo__label">Muharraq lantern alley</span>
            </div>
            <p className="story-card__cat">Food & Culture</p>
            <div className="story-card__rule"></div>
            <h3 className="story-card__title">The Real Bahraini Food Guide — Where Locals Actually Eat</h3>
          </a>

          <a href="/stories" className="story-card reveal d1">
            <div className="story-card__photo photo-reveal photo scene-hawar">
              <span className="photo__label">Hawar coastline</span>
            </div>
            <p className="story-card__cat">Nature</p>
            <div className="story-card__rule"></div>
            <h3 className="story-card__title">A Weekend on Hawar Island</h3>
          </a>

          <a href="/stories" className="story-card reveal d2">
            <div className="story-card__photo photo-reveal photo">
              <img src={REAL_PHOTOS.fort} alt="Bahrain Fort ruins" loading="lazy" />
            </div>
            <p className="story-card__cat">Heritage</p>
            <div className="story-card__rule"></div>
            <h3 className="story-card__title">Walking the Pearl Path</h3>
          </a>
        </div>
      </section>

      {/* KNOW BEFORE YOU GO */}
      <section className="section kbyg">
        <div className="section__head reveal">
          <div>
            <span className="section__eyebrow">Travel Essentials</span>
            <h2 className="section__title">Know Before <em>You Go</em></h2>
          </div>
        </div>
        <div className="kbyg__grid">
          <a href="/plan#visa-entry" className="kbyg__card reveal">
            <div className="kbyg__icon">
              <svg viewBox="0 0 40 40" fill="none"><rect x="8" y="6" width="24" height="28" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M14 6V4M26 6V4M8 14h24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M14 20h4M14 26h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </div>
            <h3 className="kbyg__title">Visa & Entry</h3>
            <p className="kbyg__desc">eVisa available for most nationalities. GCC citizens enter visa-free.</p>
            <span className="kbyg__link">Learn More →</span>
          </a>
          <a href="/plan#best-time" className="kbyg__card reveal d1">
            <div className="kbyg__icon">
              <svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="1.5" /><path d="M20 14v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M8 8l3 3M32 8l-3 3M8 32l3-3M32 32l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </div>
            <h3 className="kbyg__title">Best Time to Visit</h3>
            <p className="kbyg__desc">October to April. Warm days, cool evenings, perfect for exploring.</p>
            <span className="kbyg__link">Learn More →</span>
          </a>
          <a href="/plan#getting-around" className="kbyg__card reveal d2">
            <div className="kbyg__icon">
              <svg viewBox="0 0 40 40" fill="none"><path d="M20 6C14 6 10 10.5 10 16c0 8 10 18 10 18s10-10 10-18c0-5.5-4-10-10-10z" stroke="currentColor" strokeWidth="1.5" /><circle cx="20" cy="16" r="3" stroke="currentColor" strokeWidth="1.5" /></svg>
            </div>
            <h3 className="kbyg__title">Getting Around</h3>
            <p className="kbyg__desc">Uber and Careem run island-wide. Car hire from the airport is affordable.</p>
            <span className="kbyg__link">Learn More →</span>
          </a>
          <a href="/plan#language-currency" className="kbyg__card reveal d3">
            <div className="kbyg__icon">
              <svg viewBox="0 0 40 40" fill="none"><path d="M10 20h20M10 14h20M10 26h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </div>
            <h3 className="kbyg__title">Language & Currency</h3>
            <p className="kbyg__desc">Arabic & English spoken everywhere. Bahraini Dinar — cards accepted.</p>
            <span className="kbyg__link">Learn More →</span>
          </a>
        </div>
      </section>

      {/* Footer now renders globally in App.jsx, not per-page */}
    </div>
  );
}
