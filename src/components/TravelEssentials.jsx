import { useEffect, useRef } from "react";

/* ---------------------------------------------------------------
   Travel Essentials — the four "Learn More" guides linked from the
   homepage, living on the Plan page. Structure and CSS class names
   copied verbatim from culture.html's .toc / .article-layout system,
   per DESIGN_RULES.md Section 4: "When building a new page, START by
   copying... shared JS from these two files verbatim."

   Anchor ids match what Home's Learn More links should point to:
   /plan#visa-entry, /plan#best-time, /plan#getting-around,
   /plan#language-currency
------------------------------------------------------------------ */

const GUIDES = [
  { id: "visa-entry", label: "Visa & Entry" },
  { id: "best-time", label: "Best Time to Visit" },
  { id: "getting-around", label: "Getting Around" },
  { id: "language-currency", label: "Language & Currency" },
];

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TravelEssentials() {
  const sectionRefs = useRef({});
  const linkRefs = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            Object.values(linkRefs.current).forEach((el) => el?.classList.remove("toc__link--active"));
            linkRefs.current[entry.target.id]?.classList.add("toc__link--active");
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div id="travel-essentials" style={{ background: "#FAF6EF" }}>
      <style>{`
        .te-layout { display: grid; grid-template-columns: 1fr 280px; gap: 3.5rem; max-width: 1100px; margin: 0 auto; padding: 0 1.5rem 5rem; }
        @media (max-width: 860px) { .te-layout { grid-template-columns: 1fr; } }
        .toc { position: sticky; top: 24px; align-self: start; order: 2; }
        @media (max-width: 860px) { .toc { position: static; margin-bottom: 2rem; order: 0; } }
        .toc__label { font-family: 'Space Grotesk', sans-serif; font-size: 0.62rem; font-weight: 600; letter-spacing: 0.25em; text-transform: uppercase; color: #4A4038; margin-bottom: 1rem; display: block; }
        .toc__list { list-style: none; display: flex; flex-direction: column; }
        .toc__link { display: flex; align-items: center; justify-content: space-between; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.85rem; font-weight: 700; color: #4A4038; padding: 0.8rem 0; border-bottom: 1px solid rgba(26,20,16,0.08); transition: color 0.25s, padding-left 0.25s; text-decoration: none; }
        .toc__link:hover, .toc__link--active { color: #9B1B30; padding-left: 0.4rem; }
        .toc__link svg { flex-shrink: 0; opacity: 0; transition: opacity 0.25s; }
        .toc__link:hover svg, .toc__link--active svg { opacity: 1; }
        .te-guide { padding: 2.5rem 0; border-bottom: 1px solid rgba(26,20,16,0.08); scroll-margin-top: 24px; }
        .te-guide:last-child { border-bottom: none; }
        .te-guide__eyebrow { font-family: 'Space Grotesk', sans-serif; font-size: 0.68rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #B8924A; margin-bottom: 0.6rem; }
        .te-guide__title { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 1.6rem; color: #1A1410; letter-spacing: -0.01em; margin-bottom: 0.9rem; }
        .te-guide__body { font-family: 'DM Sans', sans-serif; font-weight: 300; font-size: 0.95rem; line-height: 1.7; color: #4A4038; }
        .te-guide__body p { margin-bottom: 0.9rem; }
        .te-guide__body p:last-child { margin-bottom: 0; }
        .te-guide__note { margin-top: 1.1rem; padding: 0.9rem 1.1rem; border-radius: 8px; background: #F4DCDF; font-size: 0.82rem; color: #6E1322; }
      `}</style>

      <div className="max-w-2xl mx-auto px-4 pt-4 pb-2" style={{ maxWidth: "1100px" }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#B8924A", marginBottom: "0.5rem" }}>
          Know Before You Go
        </div>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "2rem", color: "#1A1410", marginBottom: "2.5rem" }}>
          Travel Essentials
        </h2>
      </div>

      <div className="te-layout">
        <main>
          <div
            id="visa-entry"
            ref={(el) => (sectionRefs.current["visa-entry"] = el)}
            className="te-guide"
          >
            <p className="te-guide__eyebrow">Before You Book</p>
            <h3 className="te-guide__title">Visa & Entry</h3>
            <div className="te-guide__body">
              <p>
                Citizens of Kuwait, Oman, Saudi Arabia, the UAE, and Qatar enter Bahrain visa-free
                using a national ID card — no application needed. GCC <em>residents</em> who
                aren't citizens of those countries can apply for a streamlined eVisa or
                visa-on-arrival instead.
              </p>
              <p>
                Most other nationalities can apply for an eVisa online through the official
                portal, evisa.gov.bh, before traveling. Processing is usually quick, but
                eligibility varies by nationality — check the official list rather than assume.
              </p>
            </div>
            <div className="te-guide__note">
              Apply a few days before your trip, not the day before — approval times vary and
              extensions aren't available on the standard tourist eVisa.
            </div>
          </div>

          <div
            id="best-time"
            ref={(el) => (sectionRefs.current["best-time"] = el)}
            className="te-guide"
          >
            <p className="te-guide__eyebrow">Climate</p>
            <h3 className="te-guide__title">Best Time to Visit</h3>
            <div className="te-guide__body">
              <p>
                October through April is the sweet spot — warm days, cool evenings, and
                comfortable enough for walking the souq or the Pearling Path midday without
                planning around the heat.
              </p>
              <p>
                May through September brings genuinely extreme heat, often past 40°C. It's still
                a fine time to visit — Bahrain's museums, malls, and heritage sites are all
                air-conditioned — it just changes how you should structure a day: outdoor stops
                in the early morning or after sunset, indoor stops through the middle of the day.
                The itinerary builder above already accounts for this automatically using live
                weather data.
              </p>
            </div>
          </div>

          <div
            id="getting-around"
            ref={(el) => (sectionRefs.current["getting-around"] = el)}
            className="te-guide"
          >
            <p className="te-guide__eyebrow">Transport</p>
            <h3 className="te-guide__title">Getting Around</h3>
            <div className="te-guide__body">
              <p>
                Uber and Careem run reliably island-wide and are the easiest way to get between
                sites — most drivers know major landmarks by name, not just address. Traditional
                taxis exist too; insist on the meter, or agree a fare before the ride starts.
              </p>
              <p>
                Bahrain is compact — most attractions sit within a 30–45 minute drive of each
                other. One thing worth planning around: the King Fahd Causeway to Saudi Arabia
                gets busy with weekend visitors from Thursday through Saturday, which can mean
                heavier traffic and crowds at popular sites on those specific days.
              </p>
            </div>
          </div>

          <div
            id="language-currency"
            ref={(el) => (sectionRefs.current["language-currency"] = el)}
            className="te-guide"
          >
            <p className="te-guide__eyebrow">Practical Basics</p>
            <h3 className="te-guide__title">Language & Currency</h3>
            <div className="te-guide__body">
              <p>
                Arabic is the official language, and English is widely spoken — especially in
                hotels, restaurants, and anywhere tourism-facing. You won't need more than the
                handful of greetings covered in the Culture guide to get by comfortably.
              </p>
              <p>
                The currency is the Bahraini Dinar (BHD), one of the higher-valued currencies
                in the world relative to the US dollar — worth double-checking a price twice
                before assuming it's cheap. Cards are accepted almost everywhere; small souq
                vendors and some traditional cafes may prefer cash.
              </p>
            </div>
          </div>
        </main>

        <aside className="toc">
          <span className="toc__label">Jump To</span>
          <ul className="toc__list">
            {GUIDES.map((g) => (
              <li key={g.id}>
                <a
                  href={`#${g.id}`}
                  className="toc__link"
                  ref={(el) => (linkRefs.current[g.id] = el)}
                >
                  {g.label}
                  <ChevronIcon />
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
