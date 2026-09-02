/* ---------------------------------------------------------------
   Shared footer — same content as what was in Home.jsx, extracted
   so every page gets it automatically instead of being copy-pasted
   (and potentially missed, like it was in Destinations.jsx).
------------------------------------------------------------------ */
export default function Footer() {
  return (
    <footer className="footer">
      <style>{`
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
      `}</style>
      <div className="footer__top">
        <div>
          <p className="footer__logo">Mah<span>ara</span></p>
          <p className="footer__desc">A kingdom of contrasts — where the ancient Dilmun civilisation meets cutting-edge modernity on a jewel island in the Arabian Gulf.</p>
        </div>
        <div>
          <span className="footer__head">Discover</span>
          <ul className="footer__links">
            <li><a href="/destinations">Destinations</a></li>
            <li><a href="/stories">Stories & Guides</a></li>
            <li><a href="/culture">Culture</a></li>
          </ul>
        </div>
        <div>
          <span className="footer__head">Plan</span>
          <ul className="footer__links">
            <li><a href="/plan">Itinerary Builder</a></li>
            <li><a href="/plan#visa-entry">Good To Know</a></li>
            <li><a href="/events">Events Calendar</a></li>
          </ul>
        </div>
        <div>
          <span className="footer__head">Account</span>
          <ul className="footer__links">
            <li><a href="/login">Log In</a></li>
            <li><a href="#">Saved Places</a></li>
            <li><a href="#">My Itineraries</a></li>
          </ul>
        </div>
      </div>
      <div className="footer__bottom">
        <p className="footer__copy">© 2026 MAHARA — KINGDOM OF BAHRAIN</p>
        <p className="footer__copy">EN / عربي</p>
      </div>
    </footer>
  );
}
