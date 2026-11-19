/* ---------------------------------------------------------------
   PageHeader — eyebrow, big Jakarta title, subtitle. Source pattern:
   the Destinations .page-header, which Food and Events had copied.

     <PageHeader
       eyebrow="Where To Go"
       title={<>Explore <em>Bahrain</em></>}   // <em> renders crimson, upright
       sub="Thirty-three islands…"
     >
       {optional slot under the subtitle, e.g. a search bar}
     </PageHeader>

   reveal (default true) adds the .reveal / .d1 / .d2 classes. Those
   stay invisible until useScrollEffects() runs on the page, so pass
   reveal={false} on any page that does not call it (e.g. /plan).
------------------------------------------------------------------ */

export default function PageHeader({ eyebrow, title, sub, children, reveal = true, as: Heading = "h1", className = "" }) {
  const r = (delay) => (reveal ? ` reveal${delay ? ` d${delay}` : ""}` : "");
  return (
    <header className={["ui-page-header", className].filter(Boolean).join(" ")}>
      {eyebrow && <span className={`ui-page-header__eyebrow${r(0)}`}>{eyebrow}</span>}
      <Heading className={`ui-page-header__title${r(1)}`}>{title}</Heading>
      {sub && <p className={`ui-page-header__sub${r(2)}`}>{sub}</p>}
      {children}
    </header>
  );
}
