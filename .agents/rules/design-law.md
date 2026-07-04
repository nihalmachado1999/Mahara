---
trigger: always_on
---

# Visit Bahrain — Project Constitution (DESIGN_RULES.md)

This file is LAW for this project. Read it at the start of every session.
If you (the agent) are about to generate UI, a component, or copy and you
have not re-read this file in the current session, STOP and read it first.

Every rule below exists because it was violated before, in this project or
a prior one by the same developer. These are not stylistic preferences —
they are hard constraints.

---

## 0. The one question to ask before generating ANY UI

"Could this exact component appear in a generic template, a food delivery
app, or a SaaS dashboard with zero changes?" If yes — stop, redo it using
something specific to Bahrain (see Section 4).

---

## 1. Color system — EXACT VALUES, NO SUBSTITUTIONS

```
cream:        #FAF6EF   -- primary background
cream-warm:   #F2E9DB   -- secondary surfaces, cards on cream
crimson:      #9B1B30   -- primary accent: buttons, links, tags, icons
crimson-deep: #6E1322   -- hover states
crimson-soft: #F4DCDF   -- tinted badges/backgrounds
ink:          #1A1410   -- near-black text and dark chrome (nav/footer)
ink-soft:     #4A4038   -- secondary text
gold:         #B8924A   -- SPARING use only — dividers, fine details
white:        #FFFFFF
```

- NEVER introduce blue, purple, teal, or green as an accent.
- NEVER use pure black (#000) or pure gray. All neutrals derive from ink/cream.
- Crimson should appear THROUGHOUT the text hierarchy (tags, links, category
  labels) — not just on buttons. This is a confirmed pattern from Firecrawl
  analysis of Visit Saudi's actual token usage.

## 2. Typography — locked system, no exceptions

- Headings (section titles, card titles, nav): **Plus Jakarta Sans**, weight
  700–800. This is the dominant voice of the app.
- Hero display / large tagline ONLY: **Cormorant Garamond**, italic for
  emphasis words. Used sparingly — hero taglines and the logo, nothing else.
- Body text: **DM Sans**, weight 300–400.
- UI labels/nav/tags/buttons: **Space Grotesk**, uppercase, letter-spacing
  0.1–0.3em.
- Arabic: **Tajawal**.
- BANNED as primary fonts: Inter, Roboto, Arial, generic system-ui, and
  "Poppins + generic sans" (the #1 AI-generic tell).

## 3. ABSOLUTE BAN: emoji as UI elements

This is the single most common failure in prior Antigravity projects by
this developer. The rule is not "minimize emoji" — it is **zero emoji as
icons, bullet markers, or UI chrome, anywhere, ever.**

- No 💰⚡🛍️🍽️📍✨ or any emoji as a category icon, button icon, feature
  marker, or section decoration.
- Use ONE consistent icon system: inline SVG, 1.5–1.6px stroke,
  `stroke="currentColor"`, matching size across all instances.
- If an icon doesn't exist for a concept, use a text label. Never fall back
  to an emoji as a placeholder — placeholders get shipped.
- Emoji inside actual user-generated chat content (e.g. a message a user
  typed) is fine. Emoji as something YOU designed into the interface is not.
- NOTE: the destinations.html reference file currently has emoji pin
  markers (📍) in place-card__loc — this is a known violation, inherited
  from an earlier draft. Fix it there too when you touch that file: replace
  with an inline SVG pin icon matching the rest of the icon system.

## 4. Bahraini visual motifs — use instead of generic Gulf iconography

Avoid generic camels/falcons/dunes as the primary graphic language. Instead:

- **Pearl & oyster** — the confirmed signature motif of this app. Used in
  the loading animation already. Extend it: save/favorite icons, section
  dividers, empty states.
- **Sadu weave pattern** (geometric triangles, crimson/gold/ink/cream
  repeating diagonal) — already built as `.sadu-strip`, used as a section
  divider. Reuse this exact CSS class on every new page between major
  sections.
- **Mashrabiya/gypsum lattice** — geometric cutout patterns, usable as low-
  opacity background texture or loading skeletons.
- Pick ONE as primary (pearl/oyster is already established) and repeat it
  everywhere rather than introducing new motifs per page.

## 5. Layout & components — specific, derived from Firecrawl analysis

- Card style: 1px border at 8–12% ink opacity, OR flat cream-warm fill, OR
  soft crimson-tinted shadow. NEVER default `box-shadow: 0 4px 6px
  rgba(0,0,0,0.1)` on white rounded rectangles — the generic SaaS card look.
- Border radius: TWO values only. Pill (100px) for primary CTA buttons and
  nav buttons ONLY. 8px for everything else — cards, secondary links, tags,
  filter chips. Never mix 8/12/16/24px across similar components.
- Buttons: primary = solid crimson fill, cream text, pill shape, weight 600.
  No gradients, ever.
- Desktop layout must be full-width responsive — never a narrow mobile-
  width column floating in a large browser window.
- Chat/AI entry points: a real input field with example placeholder text,
  or 2–3 text-based suggestion chips. NEVER a grid of emoji + one-word
  label boxes (the #1 AI-chatbot cliché, confirmed present in a competitor
  app — do not repeat it).

## 6. Motion

- Page load: ONE orchestrated sequence, not staggered fades on every div.
- Scroll reveals: vary technique (clip-path wipes, scale, slide) — the
  homepage already has a working `.photo-reveal` clip-path pattern and a
  `.reveal` fade/translate pattern. Reuse both, don't reinvent per page.
- Respect `prefers-reduced-motion` with a static fallback.
- Custom cursor (`#cur-dot` / `#cur-ring`), magnetic buttons, and count-up
  numbers are already built on the homepage — carry this exact JS forward
  to new pages rather than rebuilding differently each time.

## 7. Content & copy

- No Lorem Ipsum. Real Bahrain content only, even draft-quality.
- No stock AI phrases: "Discover the magic of...", "Experience the best
  of...", "Your journey starts here", "Unlock...".

## 8. Self-check before marking ANY page "done"

1. Any emoji used as UI icons? → fail, fix immediately.
2. Any color outside the palette in Section 1? → fail, fix.
3. Any default shadow/radius combo that looks like a UI-kit default? → fail.
4. Does this page reuse the nav, footer, sadu-strip, and cursor code from
   the homepage/destinations page, or did it reinvent them? → if reinvented,
   fail — go copy the existing pattern instead.
5. Would this screen look identical if it said "Visit Dubai" instead of
   "Visit Bahrain"? → if yes, fail, make it more specific.

---

## Reference files already built in this project (do not rebuild from
scratch — copy/adapt these):
- `index.html` — homepage. Contains the full CSS design system, nav,
  footer, pearl loader, hero video pattern, sadu-strip, cursor JS.
- `destinations.html` — full grid page with working category filters,
  search, save-button toggle, empty state. This is the reference pattern
  for any future filterable list page (Food, Events).

When building a new page, START by copying the CSS variables, nav markup,
footer markup, and shared JS (cursor, mobile menu, scroll reveal) from
these two files verbatim. Only the page-specific content and layout below
the header should be newly designed.
