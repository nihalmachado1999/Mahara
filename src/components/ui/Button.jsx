import { Link } from "react-router-dom";

/* ---------------------------------------------------------------
   Button — the one button in the app. Styles live in ui.css.

     <Button>Save this itinerary</Button>             primary, pill
     <Button variant="secondary" size="sm">…</Button>  crimson outline, 8px
     <Button variant="quiet">Cancel</Button>           ink outline, 8px
     <Button to="/login" variant="secondary">…</Button> renders a <Link>

   One primary per view (DESIGN_RULES §5). Every size is at least
   44px high. `loading` disables the button and marks it aria-busy;
   the caller still decides the label ("Saving...").
------------------------------------------------------------------ */

function Spinner() {
  return (
    <svg className="ui-btn__spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="40 100" />
    </svg>
  );
}

export default function Button({
  variant = "primary",
  size = "md",
  to,
  href,
  type = "button",
  loading = false,
  disabled = false,
  fullWidth = false,
  magnetic = false,
  className = "",
  children,
  ...rest
}) {
  const classes = [
    "ui-btn",
    `ui-btn--${variant}`,
    size === "sm" && "ui-btn--sm",
    fullWidth && "ui-btn--block",
    magnetic && "magnetic",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <Spinner />}
      {children}
    </button>
  );
}
