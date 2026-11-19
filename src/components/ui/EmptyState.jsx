/* ---------------------------------------------------------------
   EmptyState — "nothing to show here". Source pattern: the
   Destinations .empty-state, which Food and Events had copied.

     <EmptyState title="No places match that filter yet">
       We're adding new spots every week — try a different category.
     </EmptyState>

   icon: "pearl" (default — the app's signature motif, DESIGN_RULES §4),
         "search" (for filter / search results), or any SVG node.
   action: optional node under the description, e.g. a <Button>.
------------------------------------------------------------------ */

const svgProps = { className: "ui-empty__icon", viewBox: "0 0 48 48", fill: "none", "aria-hidden": true, focusable: "false" };

// Pearl in an open oyster shell.
function PearlIcon() {
  return (
    <svg {...svgProps}>
      <path d="M9 28C9 17 15.5 9 24 9s15 8 15 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M24 9v5M16.5 11.8l2 4.2M31.5 11.8l-2 4.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 28h36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 28c1.5 7.5 9 12 18 12s16.5-4.5 18-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15.5 37.5l2-6M24 40v-7.5M32.5 37.5l-2-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="24" cy="22" r="4.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg {...svgProps}>
      <circle cx="22" cy="22" r="14" stroke="currentColor" strokeWidth="1.5" />
      <path d="M32 32l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function EmptyState({ icon = "pearl", title, children, action, className = "" }) {
  let iconNode = icon;
  if (icon === "pearl") iconNode = <PearlIcon />;
  else if (icon === "search") iconNode = <SearchIcon />;

  return (
    <div className={["ui-empty", className].filter(Boolean).join(" ")}>
      {iconNode}
      {title && <p className="ui-empty__title">{title}</p>}
      {children && <p className="ui-empty__desc">{children}</p>}
      {action && <div className="ui-empty__action">{action}</div>}
    </div>
  );
}
