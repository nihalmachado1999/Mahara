import { Link } from "react-router-dom";

/* ---------------------------------------------------------------
   TextLink — the small uppercase crimson link with an underline that
   opens up on hover ("View All", "Discover More", "Swap this").
   Source pattern: Home .section__viewall / .dest-card__link.

     <TextLink to="/destinations">View All</TextLink>   router Link
     <TextLink href="https://...">Source</TextLink>     plain anchor
     <TextLink onClick={fn} arrow={false}>Swap this</TextLink>  button

   The hit area is extended to 44px by ui.css without changing the look.
   Do not nest it inside another link or button (e.g. a card that is
   itself an <a>): use a plain span with the same classes there.
------------------------------------------------------------------ */

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TextLink({ to, href, onClick, arrow = true, className = "", children, ...rest }) {
  const classes = ["ui-link", className].filter(Boolean).join(" ");
  const content = (
    <>
      {children}
      {arrow && <ArrowIcon />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} onClick={onClick} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" className={classes} onClick={onClick} {...rest}>
      {content}
    </button>
  );
}
