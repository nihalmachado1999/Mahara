import { useState, useEffect, useRef } from "react";

/* ---------------------------------------------------------------
   Culture — converted from culture.html. This page was already the
   most complete of the five, so this is a lighter conversion than
   the others: same 7 sections, same Jump To sidebar, same live
   Aladhan prayer-times widget — just translated to React state
   instead of direct DOM manipulation, and nav/footer removed since
   they're global now.
------------------------------------------------------------------ */

const SECTIONS = [
  { id: "greetings", label: "Greetings & Manner" },
  { id: "dress", label: "What To Wear" },
  { id: "prayer", label: "Prayer & Timing" },
  { id: "dining", label: "Dining Customs" },
  { id: "phrases", label: "Arabic Phrasebook" },
  { id: "dodont", label: "Do's & Don'ts" },
  { id: "money", label: "Money & Tipping" },
];

const PRAYER_ORDER = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const LAT = 26.2285, LON = 50.586;

function ChevronIcon() {
  return <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function Culture() {
  const [prayerTimes, setPrayerTimes] = useState(null); // null = loading, object = loaded, "error" = failed
  const sectionRefs = useRef({});
  const linkRefs = useRef({});

  useEffect(() => {
    async function loadPrayerTimes() {
      try {
        const today = new Date();
        const dateStr = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;
        const res = await fetch(`https://api.aladhan.com/v1/timings/${dateStr}?latitude=${LAT}&longitude=${LON}&method=8`);
        const data = await res.json();
        const t = data.data.timings;
        setPrayerTimes(Object.fromEntries(PRAYER_ORDER.map((name) => [name, t[name]])));
      } catch {
        setPrayerTimes("error");
      }
    }
    loadPrayerTimes();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            Object.values(linkRefs.current).forEach((el) => el?.classList.remove("active"));
            linkRefs.current[entry.target.id]?.classList.add("active");
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <style>{`
        .article-hero { position: relative; height: 62vh; min-height: 420px; display: flex; align-items: flex-end;
          background: radial-gradient(ellipse 60% 50% at 30% 20%, rgba(255,225,180,.3) 0%, transparent 55%), linear-gradient(155deg, #1A1410 0%, #3A2418 35%, #6E4A2E 70%, #9A7248 100%); }
        .article-hero::before { content:''; position:absolute; inset:0; background: linear-gradient(0deg, rgba(26,20,16,.75) 0%, rgba(26,20,16,.1) 60%, transparent 100%); }
        .article-hero__content { position:relative; z-index:2; padding: 0 var(--pad-x) 3rem; max-width: 800px; }
        .article-hero__eyebrow { font-family: var(--font-label); font-size: .68rem; font-weight: 600; letter-spacing: .3em; text-transform:uppercase; color: var(--gold); margin-bottom: .8rem; display: flex; align-items:center; gap: .6rem; }
        .article-hero__eyebrow::before { content:''; width:24px; height:1px; background:var(--gold); }
        .article-hero__title { font-family: var(--font-heading); font-weight: 800; font-size: clamp(2.3rem, 5.5vw, 4rem); line-height: 1.04; color: var(--white); letter-spacing: -.02em; margin-bottom: .8rem; }
        .article-hero__sub { font-size: 1rem; font-weight: 300; color: rgba(255,255,255,.85); max-width: 560px; line-height: 1.7; }

        .article-layout { display: grid; grid-template-columns: 1fr 280px; gap: 4rem; padding: clamp(3rem,5vw,4.5rem) var(--pad-x) clamp(4rem,7vw,6rem); max-width: 1280px; margin: 0 auto; }
        .toc { position: sticky; top: 100px; align-self: start; }
        .toc__label { font-family: var(--font-label); font-size: .62rem; font-weight: 600; letter-spacing: .25em; text-transform:uppercase; color: var(--ink-soft); margin-bottom: 1rem; display:block; }
        .toc__list { list-style:none; display:flex; flex-direction:column; }
        .toc__list a { display:flex; align-items:center; justify-content:space-between; font-family: var(--font-heading); font-size: .85rem; font-weight: 700; color: var(--ink-soft); padding: .8rem 0; border-bottom: 1px solid rgba(26,20,16,.08); transition: color .25s, padding-left .25s var(--ease); text-decoration:none; }
        .toc__list a:hover, .toc__list a.active { color: var(--crimson); padding-left: .4rem; }
        .toc__list a svg { flex-shrink:0; opacity:0; transition: opacity .25s; }
        .toc__list a:hover svg, .toc__list a.active svg { opacity:1; }

        .prayer-widget { margin-top: 2rem; background: var(--ink); border-radius: 8px; padding: 1.5rem; }
        .prayer-widget__label { font-family: var(--font-label); font-size: .6rem; font-weight: 600; letter-spacing: .2em; text-transform:uppercase; color: var(--gold); margin-bottom: .3rem; display:flex; align-items:center; gap:.5rem; }
        .prayer-widget__label::before { content:''; width:6px; height:6px; border-radius:50%; background: var(--crimson); }
        .prayer-widget__city { font-family: var(--font-heading); font-weight: 800; font-size: 1.05rem; color: var(--cream); margin-bottom: 1rem; }
        .prayer-list { display:flex; flex-direction:column; gap: .55rem; }
        .prayer-row { display:flex; justify-content:space-between; align-items:center; font-family: var(--font-body); font-size: .8rem; }
        .prayer-row__name { color: rgba(250,246,239,.65); }
        .prayer-row__time { font-family: var(--font-label); font-weight: 600; color: var(--cream); }
        .prayer-widget__note { font-size: .68rem; color: rgba(250,246,239,.4); margin-top: 1rem; line-height: 1.5; }

        .article-content { max-width: 680px; }
        .a-section { margin-bottom: 3.5rem; scroll-margin-top: 100px; }
        .a-section__eyebrow { font-family: var(--font-label); font-size: .62rem; font-weight: 600; letter-spacing: .25em; text-transform:uppercase; color: var(--crimson); margin-bottom: .5rem; display:block; }
        .a-section__title { font-family: var(--font-heading); font-weight: 800; font-size: clamp(1.5rem, 2.5vw, 2rem); color: var(--ink); letter-spacing: -.01em; margin-bottom: 1.1rem; }
        .a-section p { font-size: .92rem; color: var(--ink-soft); line-height: 1.85; margin-bottom: 1.1rem; }
        .a-section p strong { color: var(--ink); font-weight: 600; }

        .dd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-top: 1.5rem; }
        .dd-card { border-radius: 8px; padding: 1.5rem; }
        .dd-card--do { background: var(--crimson-soft); border: 1px solid rgba(155,27,48,.15); }
        .dd-card--dont { background: var(--cream-warm); border: 1px solid rgba(26,20,16,.08); }
        .dd-card__label { font-family: var(--font-label); font-size: .62rem; font-weight: 700; letter-spacing: .2em; text-transform:uppercase; margin-bottom: .9rem; display:flex; align-items:center; gap:.5rem; }
        .dd-card--do .dd-card__label { color: var(--crimson-deep); }
        .dd-card--dont .dd-card__label { color: var(--ink-soft); }
        .dd-card ul { list-style:none; display:flex; flex-direction:column; gap: .7rem; }
        .dd-card li { font-size: .82rem; color: var(--ink-soft); line-height: 1.6; padding-left: 1.1rem; position:relative; }
        .dd-card li::before { content:''; position:absolute; left:0; top:.5rem; width:5px; height:5px; border-radius:50%; }
        .dd-card--do li::before { background: var(--crimson); }
        .dd-card--dont li::before { background: var(--ink-soft); }
        @media (max-width: 640px) { .dd-grid { grid-template-columns: 1fr; } }

        .phrase-table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
        .phrase-table th { text-align: left; font-family: var(--font-label); font-size: .6rem; font-weight: 600; letter-spacing: .15em; text-transform:uppercase; color: var(--ink-soft); padding: .7rem .9rem; border-bottom: 2px solid rgba(26,20,16,.1); }
        .phrase-table td { padding: .9rem; border-bottom: 1px solid rgba(26,20,16,.07); font-size: .85rem; }
        .phrase-table td:first-child { font-weight: 600; color: var(--ink); }
        .phrase-table td:nth-child(2) { font-family: var(--font-display); font-style: italic; color: var(--crimson); font-size: 1rem; }
        .phrase-table td:last-child { color: var(--ink-soft); font-size: .78rem; }
        .phrase-table tr:hover td { background: var(--cream-warm); }

        .dress-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1.5rem; }
        .dress-card { background: var(--cream-warm); border-radius: 8px; padding: 1.25rem; text-align: center; }
        .dress-card__icon { width: 36px; height: 36px; margin: 0 auto .75rem; color: var(--crimson); }
        .dress-card__title { font-family: var(--font-heading); font-weight: 800; font-size: .82rem; color: var(--ink); margin-bottom: .3rem; }
        .dress-card__desc { font-size: .72rem; color: var(--ink-soft); line-height: 1.5; }
        @media (max-width: 640px) { .dress-grid { grid-template-columns: 1fr 1fr; } }

        @media (max-width: 1024px) {
          .article-layout { grid-template-columns: 1fr; }
          .toc { position: static; margin-bottom: 2.5rem; display: flex; flex-direction: column; }
          .prayer-widget { order: -1; margin-top: 0; margin-bottom: 1.5rem; }
        }
      `}</style>

      <header className="article-hero">
        <div className="article-hero__content">
          <p className="article-hero__eyebrow">Culture & Etiquette</p>
          <h1 className="article-hero__title">Bahrain, Respectfully</h1>
          <p className="article-hero__sub">Everything worth knowing before you go — dress, greetings, prayer times, and the small customs that make a big difference.</p>
        </div>
      </header>

      <div className="sadu-strip"></div>

      <div className="article-layout">
        <aside className="toc">
          <span className="toc__label">Jump To</span>
          <ul className="toc__list">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} ref={(el) => (linkRefs.current[s.id] = el)}>
                  {s.label} <ChevronIcon />
                </a>
              </li>
            ))}
          </ul>

          <div className="prayer-widget">
            <p className="prayer-widget__label">Today · Live</p>
            <p className="prayer-widget__city">Manama Prayer Times</p>
            <div className="prayer-list">
              {PRAYER_ORDER.map((name) => (
                <div className="prayer-row" key={name}>
                  <span className="prayer-row__name">{name}</span>
                  <span className="prayer-row__time">
                    {!prayerTimes ? "—" : prayerTimes === "error" ? "N/A" : prayerTimes[name]}
                  </span>
                </div>
              ))}
            </div>
            <p className="prayer-widget__note">Many shops pause briefly during prayer — plan meals and visits loosely around these times.</p>
          </div>
        </aside>

        <div className="article-content">
          <section className="a-section" id="greetings" ref={(el) => (sectionRefs.current["greetings"] = el)}>
            <span className="a-section__eyebrow">01 — First Impressions</span>
            <h2 className="a-section__title">Greetings & Manner</h2>
            <p>Bahrain is one of the more relaxed societies in the Gulf, and locals are genuinely warm toward visitors — the pace of life here is island-slow, and that extends to how people interact.</p>
            <p>A handshake is standard between men. Between a man and a woman, <strong>wait for her to extend her hand first</strong> — a nod or hand-over-heart greeting is a perfectly polite alternative if she doesn't. "As-salamu alaykum" (peace be upon you) is the standard greeting and is warmly received from visitors who attempt it.</p>
            <p>Bahrainis are generally direct but polite — small talk before business, genuine interest in where you're from, and an easy sense of humor are all part of daily interaction here.</p>
          </section>

          <section className="a-section" id="dress" ref={(el) => (sectionRefs.current["dress"] = el)}>
            <span className="a-section__eyebrow">02 — Practical</span>
            <h2 className="a-section__title">What To Wear</h2>
            <p>Bahrain is notably relaxed compared to some Gulf neighbors — you'll see a genuine mix of styles in Manama and Adliya. That said, modest dress is appreciated, especially outside tourist and expat-heavy areas.</p>
            <div className="dress-grid">
              <div className="dress-card">
                <svg className="dress-card__icon" viewBox="0 0 24 24" fill="none"><path d="M9 4h6l-1 3-2 1-2-1-1-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M9 4L4 7v3l3-1v11h10V9l3 1V7l-5-3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
                <p className="dress-card__title">City & Malls</p>
                <p className="dress-card__desc">Casual is fine — shoulders and knees covered is a safe default.</p>
              </div>
              <div className="dress-card">
                <svg className="dress-card__icon" viewBox="0 0 24 24" fill="none"><path d="M4 20h16M6 20V10l6-5 6 5v10M10 20v-6h4v6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
                <p className="dress-card__title">Mosques</p>
                <p className="dress-card__desc">Loose, full-length clothing. Women: a headscarf is provided at entry.</p>
              </div>
              <div className="dress-card">
                <svg className="dress-card__icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="9" r="4" stroke="currentColor" strokeWidth="1.5" /><path d="M5 21c0-4 3-6 7-6s7 2 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                <p className="dress-card__title">Beaches & Pools</p>
                <p className="dress-card__desc">Swimwear is fine at hotel pools and beach clubs — cover up when leaving.</p>
              </div>
            </div>
          </section>

          <section className="a-section" id="prayer" ref={(el) => (sectionRefs.current["prayer"] = el)}>
            <span className="a-section__eyebrow">03 — Timing</span>
            <h2 className="a-section__title">Prayer & Timing</h2>
            <p>Islam shapes the daily rhythm of Bahrain in ways that are easy to plan around once you know them. Five times a day, you'll hear the call to prayer (adhan) — some smaller shops close briefly, particularly around Dhuhr (midday) and Maghrib (sunset) prayers, usually for 15–20 minutes.</p>
            <p>Malls, hotels, and larger restaurants generally continue operating normally. <strong>Friday</strong> is the main day of communal prayer — expect a quieter midday around noon, especially near mosques.</p>
            <p>During Ramadan, the pace of the whole island shifts: many restaurants don't serve food publicly during daylight hours, and it's respectful to avoid eating or drinking in public even if you're not fasting. Evenings, however, come alive — iftar tents and night markets run late.</p>
          </section>

          <section className="a-section" id="dining" ref={(el) => (sectionRefs.current["dining"] = el)}>
            <span className="a-section__eyebrow">04 — At The Table</span>
            <h2 className="a-section__title">Dining Customs</h2>
            <p>Meals in Bahrain are social, unhurried, and often shared from central platters — <strong>machboos</strong> (spiced rice with meat or fish) is the closest thing to a national dish. Eating with your right hand is traditional, even at more casual spots.</p>
            <p>If invited to a Bahraini home, bringing a small gift — dates, sweets, or good-quality coffee — is a warm gesture, though never expected. Refusing food is uncommon; even a small portion accepted graciously goes a long way.</p>
            <p>Alcohol is served in licensed hotels and some restaurants, but is not part of everyday public life the way it might be elsewhere — drink respectfully and avoid public intoxication, which is taken seriously.</p>
          </section>

          <section className="a-section" id="phrases" ref={(el) => (sectionRefs.current["phrases"] = el)}>
            <span className="a-section__eyebrow">05 — Language</span>
            <h2 className="a-section__title">Arabic Phrasebook</h2>
            <p>English is widely spoken in Bahrain, but a few words of Arabic go a long way and are always met warmly.</p>
            <table className="phrase-table">
              <thead><tr><th>English</th><th>Arabic</th><th>Say it like</th></tr></thead>
              <tbody>
                <tr><td>Hello</td><td>مرحبا</td><td>mar-ha-ba</td></tr>
                <tr><td>Thank you</td><td>شكرا</td><td>shuk-ran</td></tr>
                <tr><td>Please</td><td>من فضلك</td><td>min fad-lak</td></tr>
                <tr><td>Yes / No</td><td>نعم / لا</td><td>na-am / la</td></tr>
                <tr><td>Welcome</td><td>أهلا وسهلا</td><td>ah-lan wa sah-lan</td></tr>
                <tr><td>How much?</td><td>بكم؟</td><td>bee-kam</td></tr>
                <tr><td>Delicious</td><td>لذيذ</td><td>la-theeth</td></tr>
              </tbody>
            </table>
          </section>

          <section className="a-section" id="dodont" ref={(el) => (sectionRefs.current["dodont"] = el)}>
            <span className="a-section__eyebrow">06 — Quick Reference</span>
            <h2 className="a-section__title">Do's & Don'ts</h2>
            <div className="dd-grid">
              <div className="dd-card dd-card--do">
                <p className="dd-card__label">Do</p>
                <ul>
                  <li>Ask before photographing people, especially women</li>
                  <li>Remove shoes when entering a home or mosque</li>
                  <li>Use your right hand for eating and giving items</li>
                  <li>Dress modestly in religious and residential areas</li>
                  <li>Learn a greeting — it's genuinely appreciated</li>
                </ul>
              </div>
              <div className="dd-card dd-card--dont">
                <p className="dd-card__label">Don't</p>
                <ul>
                  <li>Show public affection beyond hand-holding</li>
                  <li>Eat or drink publicly during Ramadan daylight hours</li>
                  <li>Point the sole of your foot at someone</li>
                  <li>Discuss politics or religion critically with strangers</li>
                  <li>Assume every custom is the same as neighboring countries</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="a-section" id="money" style={{ marginBottom: 0 }} ref={(el) => (sectionRefs.current["money"] = el)}>
            <span className="a-section__eyebrow">07 — Practical</span>
            <h2 className="a-section__title">Money & Tipping</h2>
            <p>The Bahraini Dinar (BHD) is one of the highest-valued currencies in the world — cards are accepted almost everywhere, including taxis and small cafés. ATMs are widely available.</p>
            <p>Tipping isn't obligatory but is increasingly common — <strong>10% at restaurants</strong> is a fair, generous gesture where service isn't already included. Rounding up for taxis and small services is appreciated but never expected.</p>
          </section>
        </div>
      </div>

      <div className="sadu-strip"></div>
    </div>
  );
}
