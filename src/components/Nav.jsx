import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const DESTINATIONS_MENU = [
  { to: "/destinations", label: "Browse Destinations" },
  { to: "/pearling-path", label: "Pearling Path Audio Guide" },
];

const PLAN_MENU = [
  { to: "/plan", label: "Itinerary Builder" },
  { to: "/plan#travel-essentials", label: "Travel Essentials" },
  { to: "/stories", label: "Stories & Guides" },
];

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1.5 8h13M8 1.5c2 2.2 2 10.8 0 13M8 1.5c-2 2.2-2 10.8 0 13" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
function ChevronDown({ open }) {
  return (
    <svg
      width="10" height="10" viewBox="0 0 16 16" fill="none"
      style={{ transition: "transform 0.25s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
    >
      <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DesktopDropdown({ label, items, isActive }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <li ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="nav__dropdown-trigger"
        style={{ color: isActive || open ? "#FAF6EF" : "rgba(250,246,239,.7)" }}
      >
        {label}
        <ChevronDown open={open} />
      </button>
      {open && (
        <div className="nav__dropdown-panel">
          {items.map((item) => (
            
              key={item.to}
              href={item.to}
              className="nav__dropdown-item"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </li>
  );
}

function MobileAccordion({ label, items, onNavigate }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen((o) => !o)} className="nav__mobile-accordion-trigger">
        {label}
        <ChevronDown open={open} />
      </button>
      {open && (
        <div className="nav__mobile-accordion-panel">
          {items.map((item) => (
            <a key={item.to} href={item.to} onClick={onNavigate}>
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const isDestinationsActive = location.pathname === "/destinations" || location.pathname === "/pearling-path";
  const isPlanActive = location.pathname === "/plan" || location.pathname === "/stories";

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const accountHref = user ? "/profile" : "/login";
  const accountLabel = user ? "My Profile" : "Log In / Sign Up";

  return (
    <>
      <style>{`
        .nav { position: sticky; top: 0; z-index: 100; background: #1A1410; padding: 0 1.5rem; display: flex; align-items: center; justify-content: space-between; height: 72px; }
        .nav__logo { font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; font-weight: 500; font-style: italic; color: #FAF6EF; letter-spacing: .02em; text-decoration: none; }
        .nav__logo span { color: #9B1B30; font-style: normal; }
        .nav__links { display: flex; align-items: center; gap: 2.25rem; list-style: none; }
        .nav__links a, .nav__dropdown-trigger { font-family: 'Space Grotesk', sans-serif; font-size: .78rem; font-weight: 500; color: rgba(250,246,239,.7); transition: color .25s; position: relative; text-decoration: none; background: none; border: none; display: flex; align-items: center; gap: 0.35rem; cursor: pointer; padding: 0; }
        .nav__links a:hover, .nav__dropdown-trigger:hover { color: #FAF6EF; }
        .nav__links a.nav__link--active { color: #FAF6EF; }
        .nav__links a.nav__link--active::after, .nav__dropdown-trigger--active::after { content: ''; position: absolute; left: 0; right: 0; bottom: -26px; height: 2px; background: #9B1B30; }
        .nav__dropdown-panel { position: absolute; top: calc(100% + 18px); left: 50%; transform: translateX(-50%); background: #1A1410; border: 1px solid rgba(250,246,239,.12); border-radius: 8px; padding: 0.5rem; min-width: 220px; box-shadow: 0 16px 40px rgba(0,0,0,.35); }
        .nav__dropdown-item { display: block; padding: 0.7rem 0.9rem; font-family: 'DM Sans', sans-serif; font-size: 0.82rem; color: rgba(250,246,239,.8); border-radius: 8px; transition: background .2s, color .2s; text-decoration: none; }
        .nav__dropdown-item:hover { background: rgba(250,246,239,.06); color: #FAF6EF; }
        .nav__right { display: flex; align-items: center; gap: .65rem; }
        .nav__icon-btn { width: 38px; height: 38px; border-radius: 100px; border: 1px solid rgba(250,246,239,.18); display: flex; align-items: center; justify-content: center; color: #FAF6EF; transition: border-color .25s, background .25s; background: none; }
        .nav__icon-btn:hover { border-color: rgba(250,246,239,.4); background: rgba(250,246,239,.06); }
        .nav__lang { height: 38px; padding: 0 .9rem; border-radius: 100px; border: 1px solid rgba(250,246,239,.18); font-family: 'Space Grotesk', sans-serif; font-size: .72rem; font-weight: 500; color: #FAF6EF; display: flex; align-items: center; gap: .4rem; }
        .nav__cta { display: inline-flex; align-items: center; justify-content: center; height: 40px; padding: 0 1.4rem; border-radius: 100px; background: #9B1B30; color: #FAF6EF; font-family: 'Space Grotesk', sans-serif; font-size: .72rem; font-weight: 600; letter-spacing: .08em; white-space: nowrap; transition: background .25s, transform .3s, box-shadow .3s; text-decoration: none; }
        .nav__cta:hover { background: #6E1322; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(155,27,48,.35); }
        .nav__burger { display: none; flex-direction: column; gap: 5px; z-index: 101; background: none; border: none; padding: 0; }
        .nav__burger span { width: 22px; height: 1.5px; background: #FAF6EF; transition: transform .3s, opacity .3s; display: block; }
        .nav__burger--open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .nav__burger--open span:nth-child(2) { opacity: 0; }
        .nav__burger--open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }
        .nav__mobile { position: fixed; top: 72px; left: 0; right: 0; bottom: 0; z-index: 99; background: #FAF6EF; display: flex; flex-direction: column; padding: 1.5rem 1.5rem 2.5rem; gap: .25rem; transform: translateX(100%); transition: transform .4s; overflow-y: auto; }
        .nav__mobile--open { transform: translateX(0); }
        .nav__mobile a { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.6rem; font-weight: 800; color: #1A1410; padding: .65rem 0; letter-spacing: -.01em; text-decoration: none; display: block; }
        .nav__mobile a.nav__link--active { color: #9B1B30; }
        .nav__mobile-accordion-trigger { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.6rem; font-weight: 800; color: #1A1410; padding: .65rem 0; letter-spacing: -.01em; background: none; border: none; width: 100%; display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
        .nav__mobile-accordion-panel { display: flex; flex-direction: column; padding-left: 1rem; margin-bottom: 0.5rem; }
        .nav__mobile-accordion-panel a { font-size: 1.05rem; font-weight: 600; color: #4A4038; padding: 0.55rem 0; }
        .nav__mobile__divider { height: 1px; background: rgba(26,20,16,.1); margin: 1.25rem 0; }
        .nav__mobile__row { display: flex; gap: .75rem; margin-bottom: 1.25rem; }
        .nav__mobile .nav__lang, .nav__mobile .nav__icon-btn { border-color: rgba(26,20,16,.15); color: #1A1410; }
        .nav__mobile .nav__cta { display: inline-flex; }

        @media (max-width: 900px) {
          .nav__links, .nav__right > .nav__lang, .nav__right > .nav__cta, .nav__right > .nav__icon-btn { display: none; }
          .nav__burger { display: flex; }
        }
      `}</style>

      <nav className="nav">
        <a href="/" className="nav__logo">Bah<span>rain</span></a>

        <ul className="nav__links">
          <DesktopDropdown label="Destinations" items={DESTINATIONS_MENU} isActive={isDestinationsActive} />
          <li>
            <NavLink to="/food" className={({ isActive }) => (isActive ? "nav__link--active" : "")}>
              Food & Cuisine
            </NavLink>
          </li>
          <li>
            <NavLink to="/events" className={({ isActive }) => (isActive ? "nav__link--active" : "")}>
              Events
            </NavLink>
          </li>
          <li>
            <NavLink to="/culture" className={({ isActive }) => (isActive ? "nav__link--active" : "")}>
              Culture
            </NavLink>
          </li>
          <DesktopDropdown label="Plan Your Trip" items={PLAN_MENU} isActive={isPlanActive} />
        </ul>

        <div className="nav__right">
          <button className="nav__icon-btn" aria-label="Search"><SearchIcon /></button>
          <div className="nav__lang"><GlobeIcon />EN</div>
          <a href={accountHref} className="nav__cta">{accountLabel}</a>
        </div>

        <button
          className={`nav__burger ${mobileOpen ? "nav__burger--open" : ""}`}
          aria-label="Menu"
          onClick={() => setMobileOpen((o) => !o)}
        >
          <span></span><span></span><span></span>
        </button>
      </nav>

      <div className={`nav__mobile ${mobileOpen ? "nav__mobile--open" : ""}`}>
        <div className="nav__mobile__row">
          <button className="nav__icon-btn" aria-label="Search"><SearchIcon /></button>
          <div className="nav__lang"><GlobeIcon />EN</div>
        </div>

        <MobileAccordion label="Destinations" items={DESTINATIONS_MENU} onNavigate={() => setMobileOpen(false)} />
        <a href="/food" onClick={() => setMobileOpen(false)}>Food & Cuisine</a>
        <a href="/events" onClick={() => setMobileOpen(false)}>Events</a>
        <a href="/culture" onClick={() => setMobileOpen(false)}>Culture</a>
        <MobileAccordion label="Plan Your Trip" items={PLAN_MENU} onNavigate={() => setMobileOpen(false)} />

        <div className="nav__mobile__divider"></div>
        <a href={accountHref} className="nav__cta" onClick={() => setMobileOpen(false)}>{accountLabel}</a>
      </div>
    </>
  );
}