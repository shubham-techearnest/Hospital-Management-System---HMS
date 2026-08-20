# Health360 Web — UI/UX Audit

**Scope:** `frontend/health360-web` (React 19 + MUI 6 + Inter)  
**Constraint:** Preserve the current brand color theme. Do not introduce Tailwind. Do not replace the design identity.  
**Status:** Audit and recommendations only. No application code was changed.

---

## 1. Current UI analysis

Health360 web is a **role-based hospital / healthcare portal** built as a modular React SPA. Visual language is **violet healthcare SaaS**: lavender page wash, white outlined cards, Inter typography, and a purple top bar.

The product already has a usable clinical information architecture (many portals, real workflows). The UI is **functional first**, not designed as a system. Shared pieces exist (`StatCard`, `DashboardPageHeader`, `DashboardSection`, `PortalShellLayout`) but most portals still duplicate layout, snackbars, empty copy, and table markup.

**What already feels on-brand**
- Primary violet `#714fff` used for CTAs, selected nav, and icons
- Soft lavender canvas `#f5f4ff` (theme) with white paper surfaces
- Rounded controls (12–14px) rather than sharp enterprise gray
- Landing hero uses a **single restrained gradient** of brand violet into white — appropriate, not decorative overload
- Patient dashboard has a clearer information hierarchy than operational dashboards (scores → next appointment → trends → timeline)

**What it currently feels like**
- A well-structured MVP that grew portal-by-portal
- MUI defaults showing through (elevation, table chrome, dialogs, form density)
- Clinical staff screens (Lab, Radiology, OT, Pharmacy, OPD) feel like **admin consoles**, not calm clinical workstations
- Patient portal is the most “product-like”; hospital admin nav is the most crowded

**Stack (styling architecture to keep)**
- MUI `ThemeProvider` + `CssBaseline` (`src/app/theme.ts`, `src/app/providers.tsx`)
- Sparse global CSS (`src/index.css`) — no CSS modules, no Tailwind
- `sx` prop as the dominant styling method
- Framer Motion present but mostly unused (`AnimatedPage` is a no-op wrapper)
- Inter loaded from Google Fonts (400/500/600/700)

---

## 2. Current color system

Source of truth: `src/app/theme.ts`. Global CSS in `src/index.css` **disagrees** with the theme (see problems).

### Brand / palette (PRESERVE)

| Token (MUI) | Hex | Role |
|---|---|---|
| `primary.main` | `#714fff` | Brand violet — CTAs, selected states, icon accents |
| `primary.dark` | `#5c3dd9` | Hover / pressed primary |
| `primary.light` | `#cfc8ff` | Soft wash, hero, highlighted banners |
| `secondary.main` | `#8852cc` | Top bar, secondary accent |
| `secondary.dark` | `#5c3dd9` | Same as primary.dark (overlap) |
| `secondary.light` | `#efecff` | Very pale lilac |
| `success.main` | `#2e7d32` | Success / normal vitals (MUI green) |
| `warning.main` | `#ff754c` | Coral warning (distinct from brand violet) |
| `background.default` | `#f5f4ff` | App canvas |
| `background.paper` | `#ffffff` | Cards, drawers, dialogs |
| `text.primary` | `#0f0b28` | Near-black with a cool violet undertone |
| `text.secondary` | `#585969` | Muted body / captions |

### Not explicitly themed (MUI defaults leaking)

| Token | Current | Issue |
|---|---|---|
| `error.main` | MUI red `#d32f2f` | Fine clinically; not documented as a brand token |
| `info.main` | MUI blue `#0288d1` | **Off-brand.** Conflicts with violet identity |
| `divider` | MUI rgba black | Slightly warm-gray on a cool lavender canvas |
| `action.selected` | MUI default | Sidebar selected state is generic, not brand-tinted |
| Navbar contrast | White on `#8852cc` | Likely AA for large text; icons/small labels should be verified |

### Off-brand hardcoded colors (do not keep)

| Location | Color | Why it is a problem |
|---|---|---|
| `ProfileCompletionWidget` | `#1565c0`, `#e3edf7` | Material Blue, not Health360 violet |
| `index.css` `:root` | `#1a1a2e`, `#f8fafc` | Slate canvas vs themed lavender |

**Preserve:** `#714fff` / `#8852cc` / `#f5f4ff` / `#0f0b28` / `#585969` / `#ff754c`.  
**Refine only:** map `info` to a violet-tinted informational color, unify `secondary.dark`, replace hardcoded blue.

---

## 3. Current typography

| Aspect | Current |
|---|---|
| Family | `"Inter", system-ui, sans-serif` |
| Weights used | 400 (body), 600 (buttons, h3/h4, section titles), 700 (h1/h2, brand, page titles) |
| Theme overrides | `h1`/`h2` 700; `h3`/`h4` 600 only |
| Button text | `textTransform: 'none'`, `fontWeight: 600` |
| Page titles | Mix of `h4` + `fontWeight: 700` (dashboard headers) vs raw `Typography variant="h4"` (admin users, placeholders) |
| Body | Default MUI 1rem / 1.5 line-height; some marketing copy uses `lineHeight: 1.7` |
| Overline | `StatCard` labels use `variant="overline"` — small, tracked, can feel shouty |
| Responsive type | Inconsistent. Admin Users shrinks `h4` on xs; most dashboards do not |

**Missing:** type scale tokens (`display`, `title`, `body`, `caption`, `label`), `letterSpacing` for overlines, tabular nums for metrics, and a documented `h5`/`h6` weight (section headers are `h6` + 600).

---

## 4. Current component system

### Shared (good seeds — keep and extend)

| Component | Path | Notes |
|---|---|---|
| `StatCard` | `shared/dashboard/StatCard.tsx` | Outlined card, accent icon well, optional link |
| `DashboardPageHeader` | `shared/dashboard/DashboardPageHeader.tsx` | Title + subtitle + actions; responsive stack |
| `DashboardSection` | `shared/dashboard/DashboardSection.tsx` | Outlined paper with header bar |
| `DashboardStatsGrid` | `features/dashboard/components/DashboardStatsGrid.tsx` | Skeleton grid of StatCards |
| `PortalShellLayout` | `shared/layout/PortalShellLayout.tsx` | Used by reception and some staff portals |
| `AppNavbar` | `shared/layout/AppNavbar.tsx` | Global top bar |
| `pageSpacing` | `shared/layout/pageSpacing.ts` | Container / main / grid spacing objects |
| `CollapsibleFilterPanel` | `shared/filters/CollapsibleFilterPanel.tsx` | Search compactness |
| `CompactFilterChips` | `shared/filters/CompactFilterChips.tsx` | Replaces full-width tabs on some lists |
| `PlaceholderPage` | `shared/pages/PlaceholderPage.tsx` | Sprint stub |

### Present but incomplete / duplicated

| Pattern | Reality |
|---|---|
| Layout shells | Patient, Doctor, Hospital, Admin still **copy-paste** `Drawer` instead of `PortalShellLayout` |
| Toasts | Local `Snackbar` + `Alert` duplicated on ~15 pages |
| Empty states | Plain `Typography color="text.secondary"` or `Alert severity="info"` |
| Loading | Mix of `Skeleton`, `CircularProgress`, and the word “Loading…” |
| Modals | Raw MUI `Dialog` per feature; no shared size/padding |
| Tables | Raw MUI `Table` per page; only Admin Users has a true mobile card fallback |
| Forms | Raw `TextField` + react-hook-form; no shared Field component |
| Motion | `AnimatedPage` exports variants but **renders a plain `div`** |
| Auth pages | Login/Register are `Container` + `Paper` **without** `AppLayout` navbar |

### Missing as reusable primitives

Card (hover/focus variants), Button recipes, Input/Select wrappers, Modal, Badge (status), Avatar, EmptyState, LoadingState, Skeleton recipes, Toast provider, SectionHeader, DataTable, PageHeader (non-dashboard pages still roll their own).

---

## 5. Current problems (summary)

1. **No CSS variable / design-token layer** — colors live only in MUI theme; CSS root uses different values.
2. **Brand drift** — Material Blue in profile completion; MUI info-blue in alerts/chips.
3. **Layout duplication** — 4–5 near-identical portal shells; hospital/patient nav is a long ungrouped list.
4. **Navbar is a dark-violet strip** with no search, no notifications, no portal context beyond a tiny drawer subtitle.
5. **Toasts are not global** — easy to miss; Alert banners are overused for empty and info states.
6. **Animation strategy is dead** — Framer Motion is a dependency; most pages do not animate; `AnimatedPage` is a no-op.
7. **Operational dashboards are dense tables** without a shared empty/loading/mobile pattern.
8. **Accessibility gaps** — missing skip link, reduced-motion, incomplete `aria-label`s, chip-as-tab filters not keyboard-tab widgets.
9. **Auth pages feel detached** from the product chrome (no Health360 header on login).
10. **Favicon is still Vite default** (`/vite.svg`).

---

## 6. UX problems

| ID | Problem | Priority |
|---|---|---|
| UX-01 | Patient sidebar has **15 items** with overlapping concepts (Search vs Find a Doctor vs Find a Hospital; Health Analytics vs Vitals). High cognitive load. | P0 |
| UX-02 | Hospital sidebar has **18 items**, no grouping (Profile vs Operations vs Clinical modules vs Settings). Staff will scroll past critical OPD/IPD. | P0 |
| UX-03 | Account menu only offers Dashboard + Logout. No Profile, Settings, or Notifications shortcut. | P1 |
| UX-04 | Login has no “show password”, no “forgot password” affordance, no remember-device copy. Healthcare users expect password visibility. | P1 |
| UX-05 | Empty states are text-only. No illustration, no primary action (except a few appointment empties). | P1 |
| UX-06 | Success feedback is inconsistent: inline Alert, Snackbar, or `SaveButton` “Saved” — users cannot predict where confirmation appears. | P1 |
| UX-07 | Lab/Radiology/OT/Pharmacy dashboards mix **worklist + order detail + stats + tabs** on one page. Primary task (next specimen / next case) is not visually dominant. | P1 |
| UX-08 | Hospital dashboard “Manage” column is a list of text links, not actions. Metrics grid is 8 equal cards — nothing is visually primary. | P1 |
| UX-09 | Admin dashboard is thin: three stats + a 5-row queue. No platform health, no failed jobs, no audit peek. Fine for MVP; hierarchy still needs a “what needs me now” zone. | P2 |
| UX-10 | CompactFilterChips look like tags, not a filter control. Selected vs unselected is easy to miss; no `aria-pressed`. | P2 |
| UX-11 | Auth pages sit outside `AppLayout` — back-to-home is not obvious except typing the URL. | P2 |
| UX-12 | Patient dashboard shows profile completion **twice** (warning Alert + “Profile status” card) plus analytics disclaimer Alert. Clutter before the score. | P1 |
| UX-13 | Quick links as underlined Typography-as-Link rather than buttons/list items — weak scanability, poor hit area. | P2 |
| UX-14 | No global command/search in authenticated chrome despite Search being a core patient task. | P2 |
| UX-15 | Placeholder pages (“planned for a future sprint”) can appear in production routes if linked — trust-damaging in healthcare. | P1 |

---

## 7. Visual problems

| ID | Problem | Priority |
|---|---|---|
| VIS-01 | `index.css` canvas `#f8fafc` vs theme `#f5f4ff` — pages can flash or mix cool gray and lavender. | P0 |
| VIS-02 | Profile completion ring uses **Material Blue `#1565c0`** — the loudest off-brand element in the patient experience. | P0 |
| VIS-03 | Cards mix `variant="outlined"`, `elevation={0}` + divider border, and default Paper elevation. Shadows are inconsistent. | P1 |
| VIS-04 | No hover elevation on most cards; `VitalCard` and a few public cards are the exception. Interactive StatCards have CardActionArea but no lift. | P1 |
| VIS-05 | `DashboardSection` header uses `bgcolor: 'background.default'` (lavender strip) on a white card — slightly muddy, not a defined “section chrome.” | P2 |
| VIS-06 | Navbar `secondary.main` (`#8852cc`) vs primary CTA (`#714fff`) — two competing purples in chrome vs actions. Works, but selected sidebar vs top bar do not feel like one system. | P2 |
| VIS-07 | Sidebar selected state is MUI default gray-violet, not a clear brand pill. Icons stay default `action.active` gray even when selected. | P1 |
| VIS-08 | Landing “Who we serve” cards have **no hover, no CTA** — they look like dead tiles. | P2 |
| VIS-09 | Default Vite favicon and no branded empty illustrations — product still looks like a starter kit at the tab level. | P2 |
| VIS-10 | StatCard overline labels + huge `h4` values: good hierarchy on desktop; on mobile the icon well (48px) + wrapping numbers can feel cramped. | P2 |
| VIS-11 | Tables use default MUI head (gray text, no sticky header, no zebra, uneven cell padding). Clinical worklists need higher row scanability. | P1 |
| VIS-12 | Status chips use mixed palettes (`info` blue, `warning` coral, `success` green, `default` gray) without a documented status map. | P1 |
| VIS-13 | Border radius: theme `14`, buttons `12`, list items `10`, VitalCard icon well `theme.spacing` radius 2 (16px). Close but not one scale. | P3 |
| VIS-14 | Shadows: MUI default `boxShadow: 3` on vital hover vs custom `0 12px 40px rgba(113, 79, 255, 0.08)` on hero. No shared elevation tokens. | P2 |

---

## 8. Accessibility problems

| ID | Problem | Priority |
|---|---|---|
| A11Y-01 | No skip-to-content link. Portals have a 64px app bar + 260px drawer before main. | P0 |
| A11Y-02 | No `prefers-reduced-motion` handling. Framer Motion ring animation and future entrance motion would ignore OS settings. | P1 |
| A11Y-03 | Patient/Hospital hamburger `IconButton` often **lacks `aria-label`** (PortalShellLayout has it; Patient and Hospital copies do not). | P0 |
| A11Y-04 | Account menu trigger is not `aria-expanded` / `aria-haspopup` / `aria-controls`. | P1 |
| A11Y-05 | Color contrast: `primary.main` `#714fff` on white for **small** text may fail WCAG AA (use dark `#5c3dd9` or 600+ weight + larger size for links). Verify `text.secondary` `#585969` on `#cfc8ff` banners. | P0 |
| A11Y-06 | CompactFilterChips are clickable Chips without `role="tablist"`/`radiogroup` or keyboard arrow support. | P1 |
| A11Y-07 | Many icon-only buttons (table row actions, dialogs) lack explicit accessible names. | P1 |
| A11Y-08 | Login/Register labels exist (good). Password fields have no `autocomplete` attributes (`current-password` / `new-password`). | P1 |
| A11Y-09 | Focus rings: MUI default; ProfileCompletionWidget custom links define `:focus-visible`, most `sx` links do not. | P1 |
| A11Y-10 | Score gauges / charts: LineChart/Sparkline have some captions; confirm non-color encoding for vital status (chip text exists — good). | P2 |
| A11Y-11 | Dialogs: not consistently `fullScreen` on xs; focus trap is MUI default (OK) but titles/descriptions not always wired via `aria-labelledby`. | P2 |
| A11Y-12 | `html lang="en"` is set (good). No theme-level `focusVisible` override. | P3 |
| A11Y-13 | Loading page uses `CircularProgress aria-label="Loading page"` (good). Inline “Loading…” table cells are not live regions. | P2 |

---

## 9. Responsive problems

Breakpoints in theme: xs 0 / sm 600 / md 900 / lg 1200 / xl 1536. Drawer switches at `md`. `body`/`#root` set `overflow-x: hidden` (hides overflow rather than preventing it).

| ID | Problem | Priority |
|---|---|---|
| R-01 | Most clinical tables are `TableContainer` + horizontal scroll only. Admin Users is the **only** page with a proper card list on mobile. Lab/OPD/IPD/OT will be painful on phones. | P0 |
| R-02 | Hospital/Patient drawers: temporary drawer `top: 64` but patient mobile drawer does not set `height: calc(100% - 64px)` (hospital does). Inconsistent sheet behavior. | P2 |
| R-03 | `DashboardPageHeader` actions become full-width buttons on xs — good. Some pages still use `h4` without shrinking (overflow on long hospital names). | P1 |
| R-04 | Login `Paper sx={{ p: 4 }}` on a `py: 8` container — tight on small phones; no `AppLayout` so safe-area / notch is untested. | P2 |
| R-05 | Stats grids use `md={3}` (4 columns). Hospital dashboard has **8** stats = two full rows before any narrative. On tablet, 2×4 equal tiles with no priority. | P1 |
| R-06 | Modals: few use `fullWidth maxWidth="sm"` consistently; long forms in Dialogs (hospital staff, branches) will overflow xs without `scroll=paper` discipline. | P1 |
| R-07 | Navbar brand + avatar: OK. Authenticated compact mode uses avatar-only (good). Guest “Join” vs “Register” label change is fine. | — |
| R-08 | Public landing hero is well thought through (responsive padding, stacked CTAs). Public care discovery has hover `transform` — can cause overflow if not `overflow: hidden` on parent. | P3 |
| R-09 | Sidebar width 260px is fixed; no collapsed mini-rail on laptop (1280px). Clinical pages lose ~260px permanently. | P2 |

---

## 10. Animation problems

| ID | Problem | Priority |
|---|---|---|
| AN-01 | `AnimatedPage` is a passthrough. `fadeInUp` / `staggerContainer` exist but most pages wrap in a dead component. Motion feels random where it exists (vitals, profile accordion, save check). | P1 |
| AN-02 | No centralized duration/easing tokens. Mix of `0.15s`, `0.2s`, Framer `duration: 1` on the completion ring. | P1 |
| AN-03 | Completion ring animates on every mount (1s). Fine once; no `prefers-reduced-motion` off switch. | P1 |
| AN-04 | Hover elevation only on VitalCard / public discovery cards — everywhere else, interactive cards feel static. | P2 |
| AN-05 | No page-level transition on route change (Suspense is a centered spinner — abrupt). | P2 |
| AN-06 | Avoid introducing loops, bounce, or decorative gradient animation. Current product is **not** over-animated; the risk is adding motion without a system. | P3 |

---

## 11. Recommended design system

**Do not change brand identity.** Encode what already exists, then close gaps.

### 11.1 Design tokens (CSS variables on `:root`, mapped into MUI theme)

Keep hex values unless noted.

```css
:root {
  /* Brand — do not replace */
  --h360-color-primary: #714fff;
  --h360-color-primary-dark: #5c3dd9;
  --h360-color-primary-light: #cfc8ff;
  --h360-color-secondary: #8852cc;
  --h360-color-secondary-light: #efecff;

  /* Surfaces */
  --h360-color-bg: #f5f4ff;
  --h360-color-surface: #ffffff;
  --h360-color-surface-muted: #efecff;

  /* Text */
  --h360-color-text: #0f0b28;
  --h360-color-text-muted: #585969;
  --h360-color-text-on-primary: #ffffff;

  /* Semantic — refine, don’t invent a new palette */
  --h360-color-success: #2e7d32;
  --h360-color-warning: #ff754c;
  --h360-color-danger: #c62828;
  --h360-color-info: #5c3dd9; /* replace MUI blue; still on-brand */

  --h360-color-border: rgba(15, 11, 40, 0.10);
  --h360-color-border-strong: rgba(113, 79, 255, 0.28);

  /* Radius */
  --h360-radius-xs: 8px;
  --h360-radius-sm: 10px;
  --h360-radius-md: 12px;
  --h360-radius-lg: 14px;
  --h360-radius-xl: 20px;
  --h360-radius-pill: 999px;

  /* Spacing (4px grid) */
  --h360-space-1: 4px;
  --h360-space-2: 8px;
  --h360-space-3: 12px;
  --h360-space-4: 16px;
  --h360-space-5: 20px;
  --h360-space-6: 24px;
  --h360-space-8: 32px;
  --h360-space-10: 40px;

  /* Shadow — violet-tinted, subtle */
  --h360-shadow-none: none;
  --h360-shadow-xs: 0 1px 2px rgba(15, 11, 40, 0.04);
  --h360-shadow-sm: 0 4px 12px rgba(113, 79, 255, 0.06);
  --h360-shadow-md: 0 8px 24px rgba(113, 79, 255, 0.08);
  --h360-shadow-focus: 0 0 0 3px rgba(113, 79, 255, 0.28);

  /* Motion */
  --h360-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --h360-duration-fast: 120ms;
  --h360-duration: 180ms;
  --h360-duration-slow: 280ms;

  /* Z-index */
  --h360-z-base: 0;
  --h360-z-sticky: 10;
  --h360-z-header: 1100;
  --h360-z-drawer: 1200;
  --h360-z-modal: 1300;
  --h360-z-toast: 1400;

  /* Type */
  --h360-font: "Inter", system-ui, sans-serif;
}
```

Map these into `createTheme` (`palette`, `shape.borderRadius: 14`, `shadows`, `transitions`, `components` overrides). **Single source:** CSS variables first, MUI reads them so `sx` and rare CSS stay aligned.

### 11.2 Typography scale (Inter, same family)

| Name | Size / weight / line-height | Use |
|---|---|---|
| Display | 32–40px / 700 / 1.2 | Marketing hero only |
| Title | 24–28px / 700 / 1.25 | Page headers (`DashboardPageHeader`) |
| Title-sm | 20px / 600 / 1.3 | Mobile page headers |
| Section | 16–18px / 600 / 1.4 | Card / section headers |
| Body | 14–16px / 400 / 1.6 | Default copy |
| Label | 12–13px / 600 / 1.4 | Form labels, overline alternatives (avoid raw overline) |
| Metric | 28–32px / 700 / 1.1, `font-variant-numeric: tabular-nums` | StatCard values |
| Caption | 12px / 400 / 1.45 | Hints, timestamps |

### 11.3 Component recipes (MUI overrides, not new CSS framework)

**Button**
- Contained: primary, radius md, no uppercase (already)
- Outlined: `borderColor: --h360-color-border-strong`
- Text: for inline table actions
- Press: `transform: translateY(1px)` 120ms; no bounce
- Min height 40px desktop / 44px mobile (touch)

**Card / DashboardSection**
- Border `1px solid var(--h360-color-border)`
- Radius lg (14)
- Padding 20–24 desktop / 16 mobile
- Shadow xs rest; sm on hover **only if clickable**
- Transition shadow + border-color `--h360-duration`

**Input**
- Unified `size="medium"` in forms, `small` in filter bars
- Focus: 2px primary-dark ring (`--h360-shadow-focus`)
- Error: danger color + helper text (already); add `aria-invalid`
- Success: optional quiet check on validated fields (auth/profile only)

**Table**
- Sticky header, `white-space` on actions, row hover `--h360-color-surface-muted`
- Status via Badge, not raw enums
- xs: stacked definition list / card (extract `ResponsiveTable`)

**Badge (status)**
- Map clinical statuses to: success / warning / danger / neutral / brand — **never MUI info-blue**

**Sidebar**
- Grouped sections (Overview, Care, Records, Account)
- Selected: `bgcolor: primary.light`, icon `primary.dark`, weight 600
- Collapse groups on hospital portal

### 11.4 Visual direction (healthcare-premium, not generic SaaS)

- Keep **lavender canvas + white surfaces + violet ink** — this is the product’s identity
- One gradient only: landing hero (already). No card-level gradients
- No glassmorphism
- Photography/illustration: spare line-icons (existing MUI set) in 44–48px brand wells
- Trust: more whitespace, fewer competing Alerts, clearer primary action per page
- Clinical density is allowed on Lab/OPD **after** a strong page header and one primary worklist

---

## 12. Recommended component architecture

Keep MUI. Add a thin `shared/ui` layer. Do not duplicate CSS.

```
src/shared/ui/
  tokens.css              # CSS variables
  ToastProvider.tsx       # one Snackbar host
  AppCard.tsx             # outlined + hover + optional motion
  PageHeader.tsx          # alias/extend DashboardPageHeader
  SectionHeader.tsx
  EmptyState.tsx          # icon, title, body, action
  LoadingState.tsx        # spinner or skeleton switch
  StatusBadge.tsx
  ResponsiveTable.tsx     # table vs cards
  ConfirmDialog.tsx       # shared Dialog chrome
  SearchField.tsx
  PasswordField.tsx

src/shared/motion/
  transitions.ts          # durations, fadeInUp, stagger
  MotionPage.tsx          # replace no-op AnimatedPage
  usePrefersReducedMotion.ts

src/shared/layout/
  PortalShellLayout.tsx   # migrate Patient/Doctor/Hospital/Admin onto this
  navConfig.ts            # grouped nav per role
```

**Reuse now:** `StatCard`, `DashboardSection`, `DashboardStatsGrid`, `pageSpacing`, `CollapsibleFilterPanel`.

**Stop copy-pasting:** Snackbar blocks, “Unable to load…” Alerts, drawer shells, page `h4` + subtitle.

**Do not install** new UI libraries (no Tailwind, no extra kit). Framer Motion is already in `package.json` — use it through `shared/motion` only.

---

## 13. Card animation strategy

One system. Apply via `AppCard` / `MotionPage`, not per-page one-offs.

### Principles
- Motion explains structure (entrance) or affordance (hover/press)
- Default duration **180ms**, easing `--h360-ease`
- Stagger children **40ms**, cap at 6 items then static
- If `prefers-reduced-motion: reduce` → opacity only (or none)

### Allowed
| Pattern | Spec | Where |
|---|---|---|
| Page enter | opacity 0→1, `translateY(8px→0)`, 280ms | `MotionPage` |
| Card enter | same, stagger 40ms | Dashboard grids, vitals |
| Hover elevation | shadow xs→sm, `translateY(-1px)`, 180ms | Clickable cards only |
| Press | scale 0.98, 120ms | Buttons, StatCard |
| Icon well | slight scale 1.04 on card hover | StatCard / VitalCard |
| Save success | check icon scale-in 200ms (already) | Forms |
| Focus | 3px violet ring, no movement | Inputs, links, cards |

### Forbidden
- Infinite loops, bounce, spin except `CircularProgress`
- Gradient animation, skeleton shimmer overload
- Animating layout width of the sidebar on every route
- Animating every table row

### Card checklist (implementation target)
- [ ] Hierarchy: label → metric/title → hint → action
- [ ] Padding 16/20/24 by breakpoint
- [ ] Radius `--h360-radius-lg`
- [ ] 1px border + xs shadow
- [ ] Hover elevation if interactive
- [ ] Entrance via parent stagger
- [ ] `:focus-visible` ring if interactive
- [ ] `transition: box-shadow, transform, border-color`
- [ ] Stack to full width on xs

---

## 14. Page-by-page improvements

### Public
| Page | Improvements | Priority |
|---|---|---|
| Landing | Keep hero. Add CTA on “Who we serve” cards. Footer links (privacy, login). Replace Vite favicon. | P1 |
| Public doctor/hospital | Align card chrome with `AppCard`. Reviews section empty/loading recipes. | P2 |
| Login / Register / Verify | Wrap in `AppLayout` or a quiet branded auth shell. Password visibility. `autocomplete`. Tighter mobile padding. | P0 |

### Patient
| Page | Improvements | Priority |
|---|---|---|
| Layout / nav | Group: Home, Care (appointments, visits, find care), Health (vitals, labs, score, timeline, documents), Account. Merge Search/Doctor/Hospital into one “Find care.” | P0 |
| Dashboard | One completion treatment (not Alert + card). Scores first, next appointment + primary CTA, then trends, then timeline. Demote disclaimer to caption. | P0 |
| Health score / metrics | Keep gauges; replace info Alert with quiet helper. | P2 |
| Appointments | Reuse EmptyState + CompactFilterChips with a11y. | P1 |
| Book / search | Keep CollapsibleFilterPanel; card hover; skeleton grid. | P1 |
| Profile hub | Brand-colored completion ring; accordion motion already OK. | P0 |
| Vitals | Best current card pattern — extract as `AppCard` and reuse. | P1 |
| Documents / labs / timeline / Rx / payments | Shared EmptyState; stop unique Alert-only empties. | P1 |
| Settings | Same PageHeader as dashboards. | P2 |

### Doctor
| Page | Improvements | Priority |
|---|---|---|
| Dashboard | Promote “in progress / waiting” as the clinical focus; quick links → button list. | P1 |
| OPD / encounter | Worklist-first; patient summary as a persistent side panel on lg, stacked on mobile. | P1 |
| Schedule / appointments | Calendar hover already subtle — keep. EmptyState for no slots. | P2 |
| Verification / profile | Stepper visual for incomplete verification; document upload empty well. | P1 |

### Hospital admin
| Page | Improvements | Priority |
|---|---|---|
| Nav | Groups: Hospital, People, Outpatient, Inpatient, Diagnostics, Theatre & Pharmacy, Account. | P0 |
| Dashboard | 4 primary ops metrics (OPD waiting, IPD, ICU, pending labs); rest secondary. Replace text “Manage” links with compact action cards. | P0 |
| OPD / IPD / ICU | Extract worklist table; mobile cards; StatusBadge. | P0 |
| Branches / staff / facilities / gallery | Shared Dialog form; Snackbar via provider. | P1 |
| Subscription | Trust-heavy billing layout; avoid table-only. | P2 |

### Clinical staff (Lab, Radiology, OT, Pharmacy, Nursing, ICU nurse)
| Page | Improvements | Priority |
|---|---|---|
| Shared pattern | Stats (compact) → **My worklist** (hero) → selected record. Hide UUID fallback fields unless profile missing. | P0 |
| Tables | ResponsiveTable + StatusBadge + row hover. | P0 |
| Feedback | ToastProvider; don’t leave success only in a distant Snackbar without also updating the row. | P1 |

### Reception
| Page | Improvements | Priority |
|---|---|---|
| Layout | Already on `PortalShellLayout` — reference implementation. | — |
| Search / register / receipt | Strong empty and duplicate-candidate dialog hierarchy (P1-F1). Receipt print styles. | P1 |
| Queue | Same worklist treatment as hospital OPD. | P1 |

### Platform admin
| Page | Improvements | Priority |
|---|---|---|
| Dashboard | “Needs attention” = pending verifications (keep). Add secondary: hospitals awaiting, flagged reviews. | P1 |
| Users | Mobile cards exist — promote this pattern. StatusBadge. ToastProvider. | P1 |
| Verifications / reviews / hospitals / plans / audit | PageHeader consistency; table hover; empty queues with illustration-free but action-bearing EmptyState. | P1 |

---

## 15. Priority classification

### P0 — Critical (do first; trust, a11y, brand, mobile clinical)

1. Align `index.css` canvas/text with theme tokens (`#f5f4ff`, `#0f0b28`).
2. Replace `#1565c0` completion widget with `primary.main` / `primary.dark`.
3. Introduce CSS variables + MUI mapping (no new palette).
4. Auth shell + password visibility + autocomplete.
5. Skip link + hamburger `aria-label` on all portal copies.
6. Contrast pass on primary-as-small-text and banner combinations.
7. Group Patient and Hospital nav; migrate leftover shells to `PortalShellLayout`.
8. Patient dashboard hierarchy (dedupe completion, lead with scores + next appointment).
9. ResponsiveTable (or card fallback) for Lab/OPD/IPD/OT/Pharmacy worklists.
10. Worklist-first layout for clinical dashboards.

### P1 — High (coherence and daily usability)

11. `ToastProvider` replacing per-page Snackbars.
12. `EmptyState` + `LoadingState`/`Skeleton` recipes.
13. Sidebar selected/hover brand treatment; selected icon color.
14. Card hover/focus/transition via `AppCard`.
15. `MotionPage` implementing existing `fadeInUp` + reduced motion.
16. StatusBadge map (no info-blue).
17. Login/landing favicon and auth/home wayfinding.
18. Account menu: settings, profile, logout.
19. Form focus rings and helper-text spacing standard.
20. Hospital dashboard: 4 primary stats + action cards.
21. Patient Find-care consolidation.
22. Dialog `fullWidth` / mobile scroll paper.
23. Hide or gate PlaceholderPage in production nav.

### P2 — Medium (refinement)

24. Mini-rail or collapsible drawer on laptop.
25. Type scale + tabular nums on metrics.
26. Sticky table headers; quieter DashboardSection chrome.
27. Global header context (portal name, branch) without clutter.
28. Filter chips as radiogroup.
29. Landing portal cards with CTA.
30. Chart caption/a11y polish.
31. Secondary.dark distinct from primary.dark if needed (or document they are intentionally shared).
32. Route-level skeleton instead of centered spinner only.

### P3 — Polish

33. Radius scale cleanup (10/12/14).
34. Custom empty illustrations only if they stay line-art in brand violet — otherwise skip.
35. Subtle icon micro-interaction on StatCard hover.
36. Print stylesheet for receipts/reports.
37. Dark mode — **out of scope**; do not add (brand is defined as light healthcare).

---

## Implementation notes (for the next pass)

- **Do not** install Tailwind or a second component kit.
- **Do not** restyle with a green “medical” palette; Health360’s identity is **violet + lavender + coral warning**.
- **Do not** animate continuously.
- First code PR after this audit should be: tokens + `index.css` alignment + completion-ring brand fix + `PortalShellLayout` a11y labels. Zero visual “redesign,” only system foundations.

---

## Appendix — Current motion & spacing cheat sheet

**Spacing already in use (keep as the 4/8 grid)**  
`pageSpacing.main` padding `{ xs: 2, sm: 2.5, md: 3 }` → 16 / 20 / 24px  
Grid `{ xs: 2, md: 3 }` → 16 / 24px  
Navbar 64px; drawer 260px

**Radius already in use**  
Theme 14 · Button 12 · ListItemButton 10 · Hero `{ xs: 12, md: 16 }`

**Shadows already in use**  
Hero `0 12px 40px rgba(113, 79, 255, 0.08)` · VitalCard hover MUI `boxShadow: 3`

**Animation already in use**  
`fadeInUp` y:8 / opacity · stagger 0.04s · SaveButton check 0.2s · completion ring 1s easeOut · public card `box-shadow, transform 0.2s`
