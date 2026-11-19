import TextLink from "./TextLink";

/* ---------------------------------------------------------------
   SectionHead — eyebrow + section title, with an optional "View All"
   style link on the right. Source pattern: Home .section__head.

     <SectionHead
       eyebrow="This Month"
       title={<>What's <em>On</em></>}
       action={{ href: "/events", label: "View All" }}
     />

   action takes `to` (router Link) or `href` (plain anchor). Use `to`
   only once route changes reset scroll (Phase 4, ScrollManager).
   flush drops the --pad-x side padding, for use inside a container
   that is already padded. reveal (default true) adds .reveal, which
   needs useScrollEffects() on the page.
------------------------------------------------------------------ */

export default function SectionHead({ eyebrow, title, action, as: Heading = "h2", flush = false, reveal = true, className = "" }) {
  const classes = ["ui-section-head", flush && "ui-section-head--flush", reveal && "reveal", className].filter(Boolean).join(" ");
  return (
    <div className={classes}>
      <div>
        {eyebrow && <span className="ui-section-head__eyebrow">{eyebrow}</span>}
        <Heading className="ui-section-head__title">{title}</Heading>
      </div>
      {action && (
        <TextLink to={action.to} href={action.href} className="ui-section-head__action">
          {action.label}
        </TextLink>
      )}
    </div>
  );
}
