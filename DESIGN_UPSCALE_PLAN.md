# Mahara — Design Upscale Plan

File-by-file implementation plan for four phases. Written so that someone who
has never seen this repo can carry it out without re-deriving anything.

`DESIGN_RULES.md` is law and wins every conflict with this file. Section
numbers below (§1–§8) refer to it.

---

## 0. Ground truth — read before touching anything

Facts established by auditing the code at commit `5f405e2`. Several of them
contradict what you may have been told.

1. **`DESIGN_RULES.md` has no "Known deviations" section.** Its Section 6 is
   "Motion". The deviation list in Phase 2 below was derived from a code audit
   against §1–§8, and is the list to work from.
2. **`main` did not build.** `src/components/Nav.jsx` was missing the `<a`
   opening tag in `DesktopDropdown` (line 69). Fixed in commit `96d124e`.
   Nothing after `5f405e2` had ever been through `npm run build`.
3. **`index.html` already loads the four Latin fonts once** (lines 18–23).
   Five components then `@import` them again. Tajawal (§2, Arabic) is loaded
   nowhere, although `Culture.jsx` and `Footer.jsx` render Arabic.
4. **The app white-screens without env vars.** `src/lib/supabaseClient.js`
   calls `createClient(undefined, undefined)`, which throws at import. To run
   it locally without a `.env`, pass throwaway values on the command line:
   `VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_ANON_KEY=x npx vite`.
   Do not commit a `.env`, and do not add mock data to the app.
5. **`npm install` rewrites `package-lock.json`** on older npm versions (it
   strips `libc` fields). Run `git checkout -- package-lock.json` before
   committing. No phase in this plan changes dependencies.
6. **Home and Destinations are the visual reference**, and both are written
   as BEM-style classes on CSS variables with no Tailwind utilities. New and
   reworked UI follows that idiom.

### Do-not-break contract (applies to every phase)

Behaviour of the following must stay identical. Restyle the markup around
them; do not edit their logic.

- Every `fetch` call, URL, header set and request payload
  (`generate-itinerary`, `replan-day`, `swap-activity`, Aladhan prayer times).
- `handleSubmit`, `handleReplanDay`, `handleSwapActivity`,
  `recomputeItineraryTotal` in `src/components/ItineraryPlanner.jsx`.
- The save flow: `saveState` values (`idle | saving | saved | needs-login |
  error`), the insert into `saved_itineraries`, the "Log in to save" path.
- Loading a saved trip through `location.state.loadedItinerary` (set by
  `Profile.jsx` → `handleViewTrip`).
- The done checkboxes (`toggleActivityDone`).
- Everything under `supabase/`, all auth logic, every Supabase query.

Proof step for any commit that touches `ItineraryPlanner.jsx`:

```bash
git diff 96d124e -- src/components/ItineraryPlanner.jsx
```

Inside the five protected functions the diff may contain only **added**
lines (undo snapshot, highlight, toast, tab reset). Any removed or modified
line inside them is a defect.

### Hard rules (from the owner, on top of DESIGN_RULES.md)

- No emoji or text glyphs as icons. Inline SVG, `stroke="currentColor"`,
  1.5px stroke.
- No new colours, no new fonts.
- Radius is 8px, pill (100px) or circle (50%). Nothing else.
- No new npm dependencies.
- Never invent business names or content.
- `npm run build` before every commit. Never commit a broken build.

---

## 1. Conventions shared by all phases

### 1.1 Tokens — `src/index.css` `:root`

Already present: the eight colours, four `--font-*`, `--pad-x`, `--ease`.
Add (Phase 3 adds them; later phases only consume them):

```css
--ink-rgb: 26, 20, 16;
--cream-rgb: 250, 246, 239;
--crimson-rgb: 155, 27, 48;
--gold-rgb: 184, 146, 74;
--white-rgb: 255, 255, 255;
--line: rgba(var(--ink-rgb), 0.12);       /* §5 card border, 8–12% ink */
--line-soft: rgba(var(--ink-rgb), 0.08);
--radius: 8px;
--radius-pill: 100px;
--nav-h: 72px;                            /* Nav.jsx .nav height */
--tap: 44px;                              /* minimum tap target */
--font-arabic: 'Tajawal', sans-serif;     /* Phase 1 */
```

These are the existing palette in a second notation, not new colours. Use
`rgba(var(--ink-rgb), .12)` wherever the code has `rgba(26,20,16,.12)`.
`color-mix()` is deliberately avoided: it fails on Safari < 16.2 and the
borders would vanish.

### 1.2 Where CSS lives

| File | Holds | Class prefix |
| --- | --- | --- |
| `src/index.css` | tokens, resets, `.sadu-strip`, `.reveal`, cursor, global focus and reduced-motion rules | none |
| `src/components/ui/ui.css` | shared design-system classes | `ui-` |
| `src/components/planner/planner.css` | planner-only layout and timeline | `planner-` |
| per-page `<style>` blocks | page-only layout that is used once | page BEM name |

`ui.css` is imported once, in `src/main.jsx`, directly after `index.css`.
`planner.css` is imported by `ItineraryPlanner.jsx`. Both are plain CSS;
they do not use `@apply` or `@layer`.

Imported CSS is global, unlike the per-page `<style>` blocks which exist
only while their page is mounted. Several class names are currently defined
differently on different pages (`.filter`, `.photo`, `.event-card`, `.toc`,
`.empty-state`). That is only safe because one page mounts at a time. Anything
moved into `ui.css` or `planner.css` must carry its prefix.

### 1.3 Contrast facts (computed, WCAG 2.x)

| Pair | Ratio | Verdict |
| --- | --- | --- |
| gold `#B8924A` on cream | 2.7:1 | fails text and UI. Decoration only. |
| gold on ink | 6.3:1 | passes. Existing gold text on ink may stay. |
| crimson on cream | 7.5:1 | passes |
| ink-soft on cream | 9.4:1 | passes. Use for all secondary text. |
| ink at 50% on cream | 3.4:1 | fails body text |
| ink at 40% on cream | 2.6:1 | fails |
| crimson on ink | 2.3:1 | fails. Focus rings on dark surfaces are cream. |

Rule that follows: **gold is never text, and never a meaningful icon, on
cream, cream-warm or white.** Allowed gold: the sadu strip, hairline
dividers, timeline rails, and text on ink.

### 1.4 Execution order

1. Phase 3 (planner) — done first at the owner's request, styled directly
   from DESIGN_RULES.md. It creates `ui.css`, `ui/Toast.jsx` and the tokens
   in 1.1, because the planner needs them.
2. Phase 1 (shared components) — then swaps the planner's local markup for
   the shared components (exact swaps listed in Phase 1).
3. Phase 2 (deviations) — consumes Phase 1 components.
4. Phase 4 (navigation and accessibility).

---

## 2. Phase 1 — Shared components and single font load

Goal: one definition each for the seven patterns that are currently
copy-pasted, and exactly one font load.

### 2.1 Fonts

**`index.html`** (lines 18–23): keep the single `<link>`. Append
`&family=Tajawal:wght@400;500;700` before `&display=swap`. That is the only
font load in the app.

**`src/index.css`**
- `html { font-family: "DM Sans", sans-serif; }` → `var(--font-body)`.
- Add `--font-arabic` (see 1.1) and
  `:lang(ar) { font-family: var(--font-arabic); }`.

**Delete these `@import` lines** (each is inside a `<style>` block):

| File | Line |
| --- | --- |
| `src/components/ItineraryPlanner.jsx` | 452 (removed in Phase 3) |
| `src/pages/Profile.jsx` | 102 |
| `src/pages/PearlingPath.jsx` | 53 |
| `src/pages/Stories.jsx` | 5 |
| `src/pages/Login.jsx` | 274 |

**Delete these `.font-*` helper definitions**

| File | Lines | Note |
| --- | --- | --- |
| `src/components/ItineraryPlanner.jsx` | 453–456 | removed in Phase 3 |
| `src/pages/Profile.jsx` | 103–105 | `.font-label` has no uppercase here |
| `src/pages/PearlingPath.jsx` | 54–57 | `.font-label` adds uppercase + .04em |
| `src/pages/Login.jsx` | 275–278 | `.font-label` has no uppercase here |

The four definitions of `.font-label` disagree, and
`src/components/TourFallbackList.jsx` uses `.font-label` / `.font-heading`
without defining them (it only works while `PearlingPath.jsx` is mounted).

**Replace every usage** with the Tailwind utilities that
`tailwind.config.js` already generates, or with a shared component:

| Old class | Replacement |
| --- | --- |
| `font-heading` | `font-jakarta` |
| `font-body` | `font-dm` |
| `font-display` | `font-cormorant` |
| `font-label` | `font-grotesk`, plus `uppercase tracking-[0.1em]` where the text is a label, tag or button (§2) |

Files with usages: `Profile.jsx`, `PearlingPath.jsx`, `Login.jsx`,
`TourFallbackList.jsx`. Prefer replacing the element with a shared component
over swapping the class.

**Arabic text**: add `lang="ar" dir="rtl"` to the Arabic cells in the phrase
table in `src/pages/Culture.jsx` (the `<td>` in column 2 of each row) and to
`عربي` in `src/components/Footer.jsx` line 56. In `Culture.jsx` the rule
`.phrase-table td:nth-child(2)` sets Cormorant italic on Arabic script;
change it to `font-family: var(--font-arabic); font-style: normal;`.

### 2.2 Components

All live in `src/components/ui/`. Styles go in `ui.css`. Each component is a
default export; no barrel file is needed.

#### `PageHeader.jsx`

Source pattern: `src/pages/Destinations.jsx` CSS lines 80–84, markup lines
140–144. The same CSS is pasted into `Food.jsx` 60–64 and `Events.jsx`
87–91; only the subtitle `max-width` differs (540 / 620 / 560px) — unify on
600px.

```jsx
<PageHeader eyebrow="Where To Go" title={<>Explore <em>Bahrain</em></>} sub="…">
  {/* optional slot under the subtitle, e.g. the Destinations search bar */}
</PageHeader>
```

Props: `eyebrow` (string), `title` (node; `<em>` renders crimson, not
italic), `sub` (node), `children` (slot), `reveal` (bool, default `true`,
adds `reveal`, `reveal d1`, `reveal d2`), `as` (`"h1"` default).

Classes: `.ui-page-header`, `__eyebrow`, `__title`, `__sub`, `__slot`.
Values are copied from the Destinations rules verbatim: eyebrow Space
Grotesk .65rem / 600 / .3em / uppercase / crimson; title Jakarta 800,
`clamp(2.5rem, 6vw, 4.5rem)`, line-height 1.02, -.02em; sub DM Sans 300,
.95rem, ink-soft, line-height 1.7.

Adopt in: `Destinations.jsx`, `Food.jsx`, `Events.jsx` (delete their
`.page-header*` rules), `ItineraryPlanner.jsx` (replace `.planner-head`),
`Profile.jsx` (lines 109–120), `Stories.jsx`. Not for `Culture.jsx` or
`PearlingPath.jsx`: those have photo heroes.

#### `SectionHead.jsx`

Source: `src/pages/Home.jsx` CSS lines 85–90, markup e.g. lines 236–242.

```jsx
<SectionHead eyebrow="This Month" title={<>What's <em>On</em></>}
             action={{ to: "/events", label: "View All" }} />
```

Props: `eyebrow`, `title`, `action` (`{ to, label }`, rendered with
`TextLink`), `as` (`"h2"` default), `flush` (drops the `--pad-x` side
padding for use inside an already-padded container), `reveal`.

Classes: `.ui-section-head`, `__eyebrow`, `__title`. Title Jakarta 800,
`clamp(1.9rem, 4vw, 3rem)`.

Adopt in: `Home.jsx` (five sections), `TravelEssentials.jsx` lines 73–80,
`Profile.jsx` line 137 ("Your Saved Trips"), `PearlingPath.jsx` line 127
("The Route"), planner results header (`.planner-results__head`).

#### `Button.jsx`

Source: `.btn-crimson` (`Home.jsx` 70–71) and `.nav__cta` (`Nav.jsx`
149–150).

| Variant | Look | Use |
| --- | --- | --- |
| `primary` | crimson fill, cream text, pill, hover crimson-deep | the one main action in a view |
| `secondary` | 1px crimson border, crimson text, 8px radius, hover crimson-soft fill | supporting actions |
| `quiet` | 1px `--line` border, ink text, 8px radius | cancel, dismiss |

All variants: Space Grotesk 600, uppercase, letter-spacing .1em (§2 — the
reference `.btn-crimson` uses .06em and no uppercase; the law wins),
`min-height: var(--tap)`, no gradients, `:disabled` at 55% opacity.

Props: `variant`, `size` (`"md"` default, `"sm"` = smaller text and padding
but still 44px high), `to` (renders React Router `<Link>`), `href` (renders
`<a>`), `type` (`"button"` default), `loading` (sets `aria-busy`, disables,
shows the spinner from `Login.jsx` lines 60–66), `fullWidth`, `magnetic`
(adds the `magnetic` class used by `useScrollEffects`), `iconRight`.

Classes: `.ui-btn`, `.ui-btn--primary|secondary|quiet`, `.ui-btn--sm`,
`.ui-btn--block`. **These classes are created in Phase 3** (the planner uses
them on plain `<button>` elements). Phase 1 only adds the component wrapper
and then replaces `className="ui-btn …"` buttons in the planner with it.

Adopt in: `Home.jsx` 223, `Nav.jsx` CTA, `Login.jsx` four submit buttons
and the Google button (`quiet`), `Profile.jsx` 121–128 and 152–159,
`PearlingPath.jsx` 118–124, `TourFallbackList.jsx` play button,
`InstallPrompt.jsx` install button, `Destinations.jsx` search button.

#### `TextLink.jsx`

Source: `.section__viewall` (`Home.jsx` 89–90), `.dest-card__link`
(`Home.jsx` 110–111), `.place-card__link` (`Destinations.jsx` 116–117),
`.food-card__link`, `.event-card__link`.

Props: `to` | `href` | `onClick` (renders `<Link>`, `<a>` or `<button>`),
`arrow` (bool, default `true`, appends the 12px arrow SVG), `children`.

Class `.ui-link`: Space Grotesk .66rem / 600 / .14em / uppercase / crimson,
1px bottom border `rgba(var(--crimson-rgb), .28)`, gap grows .4rem → .8rem
on hover, hit area extended to 44px with an `::after` inset. Created in
Phase 3 as a class; Phase 1 adds the component.

Adopt in: every "View All", "Discover More", "View", "Details" link, the
four "Learn More →" spans in `Home.jsx` 453–477 (this also removes the `→`
glyph), `Profile.jsx` "View" button, `Login.jsx` "Forgot password?".

#### `EmptyState.jsx`

Source: `Destinations.jsx` CSS 118–121, markup 205–209. Pasted again in
`Food.jsx` 115–118 / 211–215 and `Events.jsx` 125–128 / ~190.

Props: `icon` (node; default is the pearl-in-shell SVG, §4), `title`,
`children` (description), `action` (node).

Classes: `.ui-empty`, `__icon`, `__title`, `__desc`. Created in Phase 3 as
classes.

Adopt in: `Destinations.jsx`, `Food.jsx`, `Events.jsx` (keep the magnifier
icon there by passing `icon`), `Profile.jsx` 142–160 (no saved trips),
`Stories.jsx`, planner idle panel, `NotFound.jsx` (Phase 4).

#### `FormField.jsx`

Source: `FieldLabel` / `TextField` / `PasswordField` in `Login.jsx` 74–132,
and the planner form labels.

Two exports:

- `FormField({ label, hint, error, children })` — generates an id with
  `useId`, renders `<label htmlFor>`, clones the single child input with
  `id`, `aria-describedby` and `aria-invalid`, renders hint and error
  (`role="alert"`).
- `FieldGroup({ legend, hint, children })` — `<fieldset>` + `<legend>` for
  chip groups and segmented controls.

Classes: `.ui-field`, `.ui-field__label` (Space Grotesk .65rem / 600 /
.16em / uppercase / ink-soft), `.ui-input` (cream-warm fill, 1px `--line`
border, 8px radius, min-height 44px, focus border crimson), `.ui-field__hint`,
`.ui-field__error`. Created in Phase 3 as classes.

Today no planner label is associated with its control, and
`Login.jsx` 92/111 removes the focus outline with `outline: none` and
re-creates focus by mutating inline styles in `onFocus`/`onBlur`. Both go
away with this component.

Adopt in: `Login.jsx` (keep `PasswordField`'s show/hide logic, render it
through `FormField`), planner form and reason inputs, `Destinations.jsx`
search.

#### `Toast.jsx`

**Built in Phase 3.** Phase 1 only adopts it elsewhere.

```jsx
const { toast, showToast, dismissToast } = useToast();
showToast({ message, tone: "neutral" | "success" | "error",
            action: { label, onClick }, link: { label, to }, duration });
<Toast toast={toast} onDismiss={dismissToast} />
```

- One toast at a time; a new one replaces the old.
- Live region is always mounted; `role="status"` normally, `role="alert"`
  for `tone: "error"`.
- Auto-dismiss: 5s; 8s when it has an action or link; never for errors.
  Timer pauses on hover and focus.
- Fixed under the nav, right-aligned on desktop, full width on mobile.
  It sits at the top because `InstallPrompt.jsx` owns the bottom edge.
- Dismiss button is an SVG, 44px hit area.

Adopt in: `Profile.jsx` (delete error at line 83, sign-out). `Login.jsx`
keeps its inline banners: auth errors belong next to the form.

### 2.3 How to check Phase 1 works

```bash
grep -rn "@import" src            # no output
grep -rnE "\.font-(heading|body|label|display)" src   # no output
grep -rnE "className=\"[^\"]*font-(heading|body|label|display)" src  # no output
grep -c "fonts.googleapis.com/css2" index.html   # 1
npm run build                     # exit 0
```

- DevTools → Network → filter `css2`: exactly one request, on first load
  only, on every route.
- `/culture`: Arabic phrases render in Tajawal, upright, not Cormorant.
- `/destinations`, `/food`, `/events`: headers are pixel-equivalent to
  before; the empty state still appears for a filter with no matches.
- `/login`: every field can be reached and submitted by keyboard; the
  focus ring is visible on each input.
- `/pearling-path` with the tour started: play buttons still render with
  the label font (previously depended on a `<style>` from another file).

---

## 3. Phase 2 — Fix every deviation

Login keeps its dark split-screen layout. It gets tokens, shared components
and the fixes below, nothing structural.

Work file by file. For each file: replace hex with variables, apply the
table rows for that file, build, commit.

### 3.1 Hex → variables

Mapping: `#FAF6EF` → `var(--cream)`, `#F2E9DB` → `var(--cream-warm)`,
`#9B1B30` → `var(--crimson)`, `#6E1322` → `var(--crimson-deep)`,
`#F4DCDF` → `var(--crimson-soft)`, `#1A1410` → `var(--ink)`, `#4A4038` →
`var(--ink-soft)`, `#B8924A` → `var(--gold)`, `#FFFFFF`/`#fff` →
`var(--white)`. `rgba(26,20,16,a)` → `rgba(var(--ink-rgb), a)`, and the same
for cream `250,246,239` and crimson `155,27,48`.

Palette hex literals per file at audit time (work top down):

| File | Count |
| --- | --- |
| `src/components/ItineraryPlanner.jsx` | 74 → 0 in Phase 3 |
| `src/pages/Login.jsx` | 50 (4 are the Google logo, exempt) |
| `src/pages/PearlingPath.jsx` | 28 |
| `src/pages/Profile.jsx` | 24 |
| `src/components/Nav.jsx` | 21 |
| `src/components/TravelEssentials.jsx` | 11 |
| `src/components/TourFallbackList.jsx` | 9 |
| `src/components/InstallPrompt.jsx` | 4 |
| `src/pages/Stories.jsx` | 3 |

SVG `stroke="#B8924A"` attributes become `stroke="currentColor"` with the
colour set on the parent (§3 icon system).

### 3.2 Deviation table

| # | File : line | Rule | Problem | Fix |
| --- | --- | --- | --- | --- |
| C1 | `Home.jsx` 104, 128, 137 | §5 | `border-radius: 6px` on card photos | `var(--radius)` |
| C2 | `Destinations.jsx` 107 | §5 | 6px badge | `var(--radius)` |
| C3 | `Food.jsx` 103, 105 | §5 | 6px badge and price chip | `var(--radius)` |
| C4 | `Events.jsx` 116 | §5 | 6px price chip | `var(--radius)` |
| C5 | `Login.jsx` 281 | §5 | `.auth-checkbox` 6px | delete the `border-radius` declaration (native control) |
| C6 | `Destinations.jsx` 85 | §5 | search container is a pill; pill is for CTA and nav buttons only | 8px container, keep the pill button |
| G1 | `Profile.jsx` 137 | 1.3 | gold label text on cream | crimson (use `SectionHead`) |
| G2 | `Stories.jsx` 15 | 1.3 | gold "Coming Soon" on cream | crimson |
| G3 | `TravelEssentials.jsx` 65, 74 | 1.3 | gold eyebrows on cream | crimson |
| G4 | `TourFallbackList.jsx` 40, 48 | 1.3 | gold stop number and check icon on white | ink-soft number, crimson check |
| G5 | `PearlingPath.jsx` 94, 99, 104, 127, 139 | 1.3 | gold labels and numerals on white/cream | ink-soft labels, crimson numerals |
| G6 | `PearlingPath.jsx` 21–38 | §3 | icons hard-code gold stroke | `currentColor`, parent crimson |
| O1 | `PearlingPath.jsx` 72 | §1 | `#D9B77C` is not in the palette | `var(--gold)` (it sits on the dark hero overlay, 6.3:1) |
| O2 | `Profile.jsx` 144, 170; `PearlingPath.jsx` 89, 133, 157; `TourFallbackList.jsx` 34 | §1 | `#ffffffaa` | `var(--white)` with a 1px `--line` border |
| O3 | `Nav.jsx` 142; `InstallPrompt.jsx` 80 | §1 | `rgba(0,0,0,.35)` shadow is pure black | `rgba(var(--ink-rgb), .35)` |
| O4 | `Home.jsx` 73 | §1 | `#fff` | `var(--white)` |
| T1 | `Stories.jsx` 22–30 | §2 | Cormorant page title | `PageHeader` (Jakarta 800) |
| T2 | `PearlingPath.jsx` 118–124 | §2 | button label in Jakarta | `Button` |
| T3 | `Culture.jsx` `.phrase-table td:nth-child(2)` | §2 | Arabic in Cormorant italic | Tajawal (Phase 1) |
| E1 | `Food.jsx` 205 | §3 | `★` glyph as rating icon | inline SVG star, 1.5 stroke |
| E2 | `Home.jsx` 453, 461, 469, 477 | §3 | `→` glyph | `TextLink` arrow |
| E3 | `Login.jsx` 352 | §3 | `←` glyph | inline SVG arrow |
| E4 | `InstallPrompt.jsx` 120 | §3 | `×` glyph as close button | SVG from `Login.jsx` `IconX` |
| L1 | `Profile.jsx` 108 | §5 | `max-w-3xl` column floating on desktop | full-width `--pad-x` container, trips in a responsive grid |
| L2 | `PearlingPath.jsx` 71, 87 | §5 | `max-w-2xl` column | `--pad-x` container; two columns ≥ 900px (intro card left, route right) |
| L3 | `TravelEssentials.jsx` 73 | §5 | `max-w-2xl` overridden by inline `maxWidth: 1100px` | one container rule |
| L4 | `TravelEssentials.jsx` 55, 63 | — | `.toc { top: 24px }` and `scroll-margin-top: 24px` put content under the 72px sticky nav | `calc(var(--nav-h) + 24px)` |
| L5 | `Home.jsx` 160–172 | §8.4 | dead copy of the footer CSS; `Footer.jsx` owns it | delete |
| L6 | `Login.jsx` 272 | — | `minHeight: 100vh` under a 72px nav adds a forced scroll | `calc(100vh - var(--nav-h))` |
| X1 | `Profile.jsx` 181, 222; `PearlingPath.jsx` 109, 144, 166; `Stories.jsx` 31 | 1.3 | ink at 40–60% as text | `var(--ink-soft)` |
| S1 | `index.html` 9; `vite.config.js` 18 | §7 | "Discover the beauty of Bahrain" is a banned stock phrase | rewrite; owner to approve copy |
| S2 | `Footer.jsx` 49, 50 | — | "Saved Places" / "My Itineraries" link to `#` | `/profile` |

### 3.3 Not fixed in Phase 2 — owner decisions

These are real deviations, listed so nobody "fixes" them by guessing.

- **Brand name.** `Nav.jsx` 175 and `Login.jsx` 313 render the logo as
  "Bahrain". `Footer.jsx` 26, `index.html` and the PWA manifest say
  "Mahara". Pick one.
- **Placeholder scene gradients** in `Home.jsx` 181–184, `Destinations.jsx`
  132–137, `Food.jsx` 127–133 and `Events.jsx` use teal, blue and purple.
  §1 bans those as accents. They stand in for photos, so the real fix is
  photos, not recolouring.
- **Dead links.** "Discover More" (`Destinations.jsx` 200, ×12), "View" and
  "Open Delivery Apps" (`Food.jsx` 204, 186), "Details" (`Events.jsx` 185)
  all point to `#`. Either build detail pages or remove the links.
- **Dead nav controls.** The search icon button and the "EN" pill in
  `Nav.jsx` 198–199 and 214–215 do nothing.
- **Cormorant numerals.** `Food.jsx` `.spot-card__num`, `Home.jsx`
  `.event-card__date b`, `PearlingPath.jsx` 139 use the display face for
  numbers. §2 says hero taglines and logo only. Left alone because the
  reference pages do it.
- **Developer copy shown to visitors** in `ItineraryPlanner.jsx`: the
  "Raw response (debug)" dump, and the error string set inside
  `handleSubmit`. Protected flow, so untouched.

### 3.4 How to check Phase 2 works

```bash
# palette hex outside index.css / tailwind.config.js — expect only the
# Google logo in Login.jsx and the scene gradients
grep -rnE "#(FAF6EF|F2E9DB|9B1B30|6E1322|F4DCDF|1A1410|4A4038|B8924A)" src --include=*.jsx -i
grep -rnE "border-radius:\s*6px|ffffffaa|#D9B77C|rgba\(0,\s*0,\s*0" src -i   # no output
grep -rnP "[★→←×]" src --include=*.jsx                                      # no output
npm run build
```

- Every page at 1440px: no content column narrower than the viewport minus
  `--pad-x` unless it is a deliberate reading measure.
- `/plan#visa-entry`: the heading lands below the nav, not under it.
- `/login`: still dark panel left, form right at ≥ 768px.
- Colour-pick any label on a cream surface: it is crimson, ink or
  ink-soft, never gold.

---

## 4. Phase 3 — Itinerary planner

Implemented in this session. This section is the specification it was built
to, and the reference for anyone changing it later.

### 4.1 Files

| File | Role |
| --- | --- |
| `src/components/ItineraryPlanner.jsx` | Container. All state, the three fetch handlers, save flow, undo, highlight, toast wiring, layout. |
| `src/components/planner/PlannerForm.jsx` | The form. Presentational: values and setters in, `onSubmit` out. |
| `src/components/planner/PlannerLoading.jsx` | Staged loading state. |
| `src/components/planner/DayTabs.jsx` | Sticky day tabs for long trips. |
| `src/components/planner/DayTimeline.jsx` | One day: header, change note, stops, swap form, replan form, undo. |
| `src/components/planner/icons.jsx` | Planner SVG icons, all `currentColor`. |
| `src/components/planner/planner.css` | Planner layout and timeline. |
| `src/components/ui/Toast.jsx` | Shared toast + `useToast`. |
| `src/components/ui/ui.css` | Shared classes: buttons, link, field, empty state, toast. |
| `src/index.css` | Tokens from 1.1. |
| `src/main.jsx` | Imports `ui.css`. |

### 4.2 Layout

- Page header (eyebrow, title, sub) in the Destinations pattern, full width
  on `--pad-x`.
- `.planner-grid`: two columns at `min-width: 900px`
  (`minmax(320px, 400px) minmax(0, 1fr)`), one column below. Form first in
  source order.
- The form column is sticky under the nav only when the viewport is also at
  least 820px tall, so a short laptop never traps the submit button.
- Below 900px, submitting scrolls the results region into view (the form
  would otherwise hide the loading state below the fold). Same on arriving
  with a saved trip.
- Idle state on desktop: the results column shows an empty state with the
  pearl motif. Hidden below 900px, where it would only push content down.

### 4.3 Day timeline

- Each day is a `<section>` with a "Day N" label, the day title, and a
  count of stops done.
- Stops are an ordered list on a vertical rail. The rail is a 1px gold
  hairline (decoration); each node is a pearl, which is also the done
  checkbox.
- The checkbox is a real `<input type="checkbox">` with
  `appearance: none`, 24px visual, 44px hit area. Its `checked`,
  `onChange` and `aria-label` are unchanged from the original.
- A stop shows: time (the original never rendered `act.time` as text, only
  as an icon), cost, title, description, location with a pin icon, and
  "Swap this".
- Done stops are struck through and dimmed, and lose "Swap this", exactly
  as before.

### 4.4 Day tabs

- Shown when the itinerary has more than three days
  (`DAY_TABS_THRESHOLD = 3` in `ItineraryPlanner.jsx`).
- With tabs, one day panel is visible at a time. With three days or fewer,
  all days are stacked and there are no tabs.
- `role="tablist"` / `tab` / `tabpanel`, roving tabindex, Left/Right/Home/End
  keys. Sticky at `top: var(--nav-h)`. Scrolls horizontally on small
  screens; the active tab is scrolled into view.
- A tab shows a small dot when every stop of that day is done.
- The active day resets to the first whenever a new itinerary is set.

### 4.5 Staged loading

Three stages, each naming something `supabase/functions/generate-itinerary`
actually does:

| Stage | Copy | Backend step |
| --- | --- | --- |
| 1 | Checking the 7-day forecast for Manama | `getBahrainHeatContext` — Open-Meteo, 3s timeout |
| 2 | Checking your dates for causeway weekends and Ramadan | `getCausewayRamadanContext` |
| 3 | Writing your day-by-day plan | the model call, up to 120s, one retry |

**The client receives no progress events.** The stages advance on timers
(3.5s, then 1.2s) that follow the backend's real order and its 3s weather
timeout; stage 3 then holds until the response arrives. After 15s a line is
added saying that long trips can take a minute or two (true: the timeout is
120s). Do not add stages the backend does not perform, and do not add a
percentage.

`role="status"`, `aria-live="polite"`. The pulse on the active stage is
removed under `prefers-reduced-motion`.

### 4.6 Highlight after a change

- After a swap, the replaced stop is marked changed. After a replan, every
  stop that was not already done is marked changed.
- Changed stops get `.is-changed`, which runs a single background fade from
  crimson-soft. The mark is cleared after 6s.
- Under `prefers-reduced-motion: reduce` the animation is off. A static
  "Updated" tag is shown for the same 6s instead (§6: static fallback).

### 4.7 Undo

- One level of undo per day: the most recent replan or swap on that day.
- On success of either handler, the day's activities **as they were just
  before the change** are stored in `undoByDay[dayIdx]`, together with the
  previous `lastChangeNote` and the kind of change.
- Undo restores those activities and that note, then recomputes
  `totalEstimatedCost` with `recomputeItineraryTotal`.
- The entry is cleared after undo (no redo), replaced by the next change to
  the same day, and all entries are cleared when a new itinerary is set.
- Undo is offered twice: as the action on the toast that follows the
  change, and as a persistent button in that day's footer.
- Undo also restores done ticks to their state at the time of the snapshot.

### 4.8 Toast

Replaces the inline save status text:

| `saveState` | Before | Now |
| --- | --- | --- |
| `saving` | button label "Saving..." | unchanged (button state) |
| `saved` | inline "Saved to your profile" | success toast; the button stays as a disabled "Saved" |
| `needs-login` | inline "Log in to save this trip" | toast with a "Log in" link; the button is replaced by a "Log in to save" link so the path survives the toast closing |
| `error` | inline error text | error toast, stays until dismissed |

Also toasts: replan done, swap done (both with Undo), undo done.

Errors from replan and swap stay inline next to the control that caused
them, with `role="alert"`. A toast is the wrong place for an error the user
has to act on.

### 4.9 Other changes made while in the file

- The days-mismatch notice was developer copy ("Worth checking the prompt
  in your edge function") and fired on every saved trip whose length was
  not 3, because `requestedDaysRef` is only set by the form. It is now
  visitor-facing and only shown for plans generated from the form in this
  session.
- "Log in" is a React Router `<Link>` instead of `<a href>`.
- Form controls are real `<fieldset>`/`<legend>` groups with `aria-pressed`
  buttons, and the stepper buttons have labels and 44px targets.

### 4.10 How to check Phase 3 works

No backend is reachable without a `.env`, so the first line is the only
automated check available in the repo:

```bash
npm run build
git diff 96d124e -- src/components/ItineraryPlanner.jsx   # protected functions: additions only
grep -nE "#[0-9A-Fa-f]{6}|@import|font-(heading|body|label|display)" \
  src/components/ItineraryPlanner.jsx src/components/planner/*   # no output
```

With a real `.env`:

1. `/plan` at 1280px: form left, empty state right. At 899px: stacked.
2. Submit with no interests: the "Pick at least one interest" error shows.
3. Submit a 2-day trip: three loading stages appear in order, then two days
   stacked, no tabs.
4. Submit a 5-day trip: tabs appear and stick under the nav while scrolling;
   arrow keys move between tabs.
5. Tick a stop: it strikes through; "Swap this" disappears for it.
6. Swap a stop: it flashes, a toast offers Undo, the total changes. Undo:
   the old stop and the old total come back.
7. Replan a day with one stop ticked: the ticked stop stays, the rest
   change and flash, the change note appears. Undo restores stops, note and
   total.
8. Tick every stop of a day: "Replan rest of this day" is disabled.
9. Save while logged out: toast with "Log in", and a "Log in to save" link
   where the button was. Save while logged in: "Saved" toast, a row appears
   in `saved_itineraries`.
10. Profile → View on a saved trip: it renders on `/plan`.
11. OS "reduce motion" on: no flash, no pulse; "Updated" tags appear
    instead.
12. 375px wide: no horizontal scrollbar in any of the states above.

---

## 5. Phase 4 — Navigation and accessibility

### 5.1 Links → React Router

Every internal `<a href>` causes a full page load: the 627 kB bundle is
fetched and parsed again, React state is dropped, and the Supabase session
check re-runs. In an installed PWA that is a visible white flash.

| File | Lines | Change |
| --- | --- | --- |
| `src/components/Nav.jsx` | 69–76 | dropdown items → `<Link to={item.to}>` |
| | 95 | mobile accordion items → `<Link>` |
| | 175 | logo → `<Link to="/">` |
| | 200, 225 | account CTA → `<Link to={accountHref}>` |
| | 219–221 | mobile links → `<NavLink>` with the active class |
| `src/components/Footer.jsx` | 32–50 | all → `<Link>` |
| `src/pages/Home.jsx` | 241, 276–316, 356, 405–427, 447–471 | all → `<Link>`. Line 223 (`#destinations`) is an in-page anchor and stays `<a>` |
| `src/pages/Login.jsx` | 313 | → `<Link to="/">` |

`import { Link, NavLink } from "react-router-dom"` — already a dependency.

While in `Nav.jsx`:
- `.nav__dropdown-trigger--active` is styled (line 141) but never applied.
  Add it when `isActive`.
- Dropdown trigger needs `aria-expanded` and `aria-haspopup="true"`;
  Escape closes it; it closes on route change.
- `.nav__mobile` is hidden with `transform: translateX(100%)` only, so its
  links are still focusable and still read by screen readers. Add
  `visibility: hidden` when closed (with a `visibility` transition delay)
  and the `inert` attribute. Burger gets `aria-expanded` and
  `aria-controls`.
- Replace the hex literals with variables (Phase 2 leaves this file to
  Phase 4 to avoid touching it twice).

### 5.2 Scroll on route change

New file `src/components/ScrollManager.jsx`, rendered once inside
`<BrowserRouter>` in `App.jsx`, returns `null`.

```jsx
const { pathname, hash } = useLocation();
useLayoutEffect(() => {
  if (hash) {
    const id = hash.slice(1);
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    return;
  }
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}, [pathname, hash]);
```

- `behavior: "instant"` is required: `index.css` sets
  `scroll-behavior: smooth` on `html`, which would otherwise animate every
  route change.
- The hash branch is required: once the links in 5.1 are `<Link>`s, the
  browser no longer scrolls to `/plan#visa-entry`, `/plan#travel-essentials`
  and friends by itself.
- It must be a layout effect. The planner scrolls to its results in a
  passive effect when it receives a saved trip; layout effects run first,
  so the planner's scroll wins.

### 5.3 404 page

- New `src/pages/NotFound.jsx`: `EmptyState` with the pearl icon, a short
  title, and `Button`s to `/` and `/destinations`. No stock phrases (§7).
- `App.jsx`: add `<Route path="*" element={<NotFound />} />` as the last
  route.
- Also wrap `<Routes>` in `<main id="main">` and add a skip link as the
  first child of the router. `TravelEssentials.jsx` line 83 then has a
  nested `<main>`; change it to `<div>`.
- Deep links (`/plan` typed into the address bar) need the host to serve
  `index.html` for unknown paths. The host is not configured in this repo.

### 5.4 Focus

`src/index.css`:

```css
:focus-visible { outline: 2px solid var(--crimson); outline-offset: 3px; }
.nav :focus-visible, .footer :focus-visible, .spotlight :focus-visible,
.ui-toast :focus-visible, .on-ink :focus-visible { outline-color: var(--cream); }
```

Crimson on ink is 2.3:1, hence cream on dark surfaces. Add `on-ink` to the
dark panel in `Login.jsx` 284–287, the "Now playing" card in
`PearlingPath.jsx`, and the `InstallPrompt.jsx` container.

Remove `outline: none` at `Destinations.jsx` 87 and `Login.jsx` 92, 111
(the latter two disappear with `FormField`). For the Destinations search,
put the ring on the container with `:focus-within`.

### 5.5 Tap targets ≥ 44px

| File | Element | Now |
| --- | --- | --- |
| `Nav.jsx` | `.nav__burger` | 22 × 13px, no padding |
| `Nav.jsx` | `.nav__icon-btn`, `.nav__lang`, `.nav__cta` | 38 / 38 / 40px |
| `Home.jsx` | `.vid-btn` | 36px |
| `Destinations.jsx` | `.place-card__save` | 32px |
| `Destinations.jsx`, `Food.jsx`, `Events.jsx` | `.filter`, `.tab` | ~30px high |
| `Profile.jsx` 187–227 | View, Yes, Cancel, trash icon | text or 16px icon, no padding |
| `Login.jsx` | eye toggle, error dismiss, tabs, "Forgot password?" | 16–18px |
| `InstallPrompt.jsx` | dismiss | ~20px |
| `TourFallbackList.jsx` | play button | ~32px |
| `PearlingPath.jsx` 168–175 | End Tour | text only |
| all card links | `.dest-card__link`, `.place-card__link`, … | ~16px (fixed by `TextLink`) |

Use `min-width`/`min-height: var(--tap)` where the element can grow. Where
the visual size must stay (icon buttons on photos, inline text links), keep
the visual and extend the hit area:

```css
.x { position: relative; }
.x::after { content: ""; position: absolute; inset: 50% auto auto 50%;
  width: max(100%, var(--tap)); height: max(100%, var(--tap));
  transform: translate(-50%, -50%); }
```

### 5.6 Reduced motion

`grep -rn prefers-reduced-motion src` returned nothing at audit time.

`src/index.css`:

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .reveal { opacity: 1; transform: none; transition: none; }
  .photo-reveal { clip-path: none !important; transform: none !important; transition: none !important; }
  #cur-dot, #cur-ring { display: none; }
  *, *::before, *::after { animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
```

JS guards (`const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches`):
- `src/hooks/useScrollEffects.js`: skip magnetic listeners; set count-up
  elements straight to their final text.
- `src/pages/Home.jsx` 39–45: do not call `video.play()`; start with
  `paused` true so the existing button shows "play".
- `src/components/CustomCursor.jsx`: return early.

`.reveal` content is invisible until JavaScript adds `.revealed`. The block
above is also the safety net for that.

### 5.7 No horizontal scroll at 375px

Suspects to check first: `Culture.jsx` phrase table (wrap in an
`overflow-x: auto` container), `Events.jsx` `.tab-row`, `Home.jsx`
`.hero__tabs`, `PearlingPath.jsx` three-column stats grid, `Nav.jsx`
off-screen mobile panel, `Login.jsx`.

Fix the source of each overflow. Do not add `overflow-x: hidden` to `html`
or `body`: it hides the bug and breaks `position: sticky` (nav, filter
bars, day tabs).

### 5.8 How to check Phase 4 works

```bash
grep -rnE "<a\s[^>]*href=\"/" src        # no output (in-page "#…" anchors are fine)
grep -rn "outline: *none\|outline: \"none\"" src   # no output
npm run build
```

- Click every nav, footer and home link: the Network tab shows no new
  document request, and the page starts at the top.
- `/plan#visa-entry` from the home page: lands on the heading, below the nav.
- `/does-not-exist`: the 404 page, with nav and footer.
- Tab through every page: a visible ring on every stop, cream on dark
  surfaces. With the mobile menu closed, Tab never enters it.
- OS "reduce motion" on: nothing fades, slides, counts up or autoplays;
  all content is visible.
- DevTools device toolbar, 375px, every route:
  `document.documentElement.scrollWidth === 375` in the console.
- DevTools → Rendering → "Show tap targets", or measure: nothing
  interactive under 44 × 44px.

---

## 6. Known product bugs found during the audit

Not design work, not fixed, and in protected flows. Listed so they are not
lost.

1. **A regenerated trip can show as "Saved".** `handleSubmit` never resets
   `saveState`. Generate, save, generate again: the new unsaved trip shows
   the saved state. One-line fix: `setSaveState("idle")` where
   `handleSubmit` sets the new itinerary.
2. **"Log in to save" destroys the trip.** The itinerary lives only in
   component state. Going to `/login` unmounts the planner; after login the
   user lands on `/profile` with nothing to save.
3. **Viewing a saved trip then pressing Save inserts a duplicate row.**
4. **Replanning a saved trip sends the wrong preferences.** The payload
   uses the form's current budget, interests, pace and traveller type; a
   saved trip does not store the ones it was built with, so a loaded trip
   is replanned with the form defaults and no interests.
5. **Edits after saving are never persisted.** Ticks, swaps and replans
   made after "Saved" only exist until the page is left.
6. **`console.warn` in `handleSubmit` says mock data is shown.** None is.
