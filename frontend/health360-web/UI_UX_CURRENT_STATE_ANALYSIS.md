# Health360 Web — Current-state UI/UX analysis

**App:** `frontend/health360-web` (React 19, MUI 6, Inter, Framer Motion)  
**Date:** 20 Aug 2026  
**Constraint:** Improve the existing product. Do not replace brand identity. Do not introduce Tailwind.

This snapshot is taken **after** the first foundation pass (tokens, portal shells, auth chrome, some dashboard hierarchy). It is the baseline for the remaining application-wide optimization.

---

## 1. Current design language

Violet healthcare SaaS: lavender canvas, white outlined surfaces, Inter, purple top bar (`secondary.main`), primary CTAs in `#714fff`.

The product already has real clinical workflows across 11 role portals. Visual quality is uneven:

- **Most product-like:** Landing, patient dashboard, vitals cards, auth (now in AppLayout)
- **Most console-like:** Lab, Radiology, OT, Pharmacy, OPD/IPD tables
- **Most consistent chrome:** Portals on `PortalShellLayout` (patient, doctor, hospital, admin, reception, staff)

Tone is calm and professional when tokens are used; leftover MUI defaults still show on tables, dialogs, and “No data” rows.

---

## 2. Existing color palette (PRESERVE)

| Token | Hex | Role |
|---|---|---|
| Primary | `#714fff` | CTAs, selected nav, icon accents |
| Primary dark | `#5c3dd9` | Hover, links, focus, info |
| Primary light | `#cfc8ff` | Selected nav wash, hero |
| Secondary | `#8852cc` | App bar |
| Secondary light | `#efecff` | Muted surface, row hover |
| Background | `#f5f4ff` | App canvas |
| Surface | `#ffffff` | Cards, paper |
| Text | `#0f0b28` | Body |
| Muted text | `#585969` | Captions |
| Success | `#2e7d32` | OK / complete |
| Warning | `#ff754c` | Coral attention |
| Danger | `#c62828` | Errors |
| Info | `#5c3dd9` | Aligned to brand (no Material blue) |

CSS variables live in `src/shared/ui/tokens.css` and are mirrored in `src/app/theme.ts`.

---

## 3. Existing typography

- Family: Inter 400/500/600/700
- Page titles: `h4` + 700, clamped size
- Sections: `h6` + 600
- Buttons: 600, no uppercase
- Metrics: StatCard `h4` with tabular nums
- Body: MUI default 1rem / 1.5; marketing copy 1.7

**Gap:** Many hospital/admin pages still use a raw `Typography h4` instead of `DashboardPageHeader` (no subtitle, no action alignment).

---

## 4. Existing spacing system

`pageSpacing` (`src/shared/layout/pageSpacing.ts`):

- Main padding: 16 / 20 / 24 (`xs/sm/md`)
- Grid: 16 / 24
- Navbar: 64px
- Drawer: 260px

Tokens: 4–40px scale (`--h360-space-*`).

**Gap:** Dialog forms and table pages still mix `mb={2}` and ad-hoc stacks.

---

## 5. Existing card styles

- `AppCard`: outlined, xs shadow, hover lift if `interactive`
- `StatCard`: outlined, accent icon well, hover if linked
- `DashboardSection`: outlined Paper, header bar, white body
- `VitalCard`: best hover/elevation example
- Landing feature cards now use `AppCard`

**Gap:** Entity/appointment/activity cards are still one-off `Card`/`Paper` in feature folders.

---

## 6. Existing button styles

Theme: radius 12, min-height 40 (36 small), press `translateY(1px)`, outlined border brand-tinted.

**Gap:** No shared loading button; table actions are mixed text/outlined/icon-only; delete icon-buttons often lack `aria-label`.

---

## 7. Existing navigation

- Fixed `AppNavbar` (secondary purple), skip link, account menu (dashboard / profile / settings / logout)
- `PortalShellLayout` with grouped sections (patient, hospital, doctor)
- Admin/reception/lab still mostly flat lists
- Mobile: temporary drawer, hamburger labelled on shared shell

**Gap:** No collapsed mini-rail on laptop. Hospital groups are long; drawer still scrolls.

---

## 8. Existing responsive behavior

- Drawer breakpoint `md` (900)
- `overflow-x: hidden` on `#root` (hides overflow rather than fixing it)
- Admin Users: table → cards on mobile
- Most clinical tables: horizontal scroll only
- Auth: padded Container, works on small phones
- Header actions stack on xs (`DashboardPageHeader`)

---

## 9. Existing animation system

- `AnimatedPage`: fade + translateY(8px), 280ms, reduced-motion aware
- `fadeInUp` / `staggerContainer` used on vitals
- Completion ring: 1s, reduced-motion off
- Public cards: 180ms shadow/transform
- **No** global toast motion system
- Framer Motion already in package.json — do not add another library

---

## 10. Existing reusable components

| Component | Status |
|---|---|
| `PortalShellLayout`, `AppNavbar`, `AppLayout`, `SkipLink` | In use |
| `DashboardPageHeader`, `DashboardSection`, `StatCard`, `DashboardStatsGrid` | In use |
| `AppCard`, `EmptyState`, `LoadingState`, `PasswordField`, `StatusBadge` | Created; **under-adopted** |
| `CollapsibleFilterPanel`, `CompactFilterChips` | Search/lists |
| `ToastProvider` | **Missing** |
| `ResponsiveTable` / table skeleton | **Missing** |
| `ConfirmDialog` | **Missing** |

---

## 11. UI inconsistencies

- Page chrome: dashboard header vs bare `h4` on Branches, Staff, Facilities, many admin pages
- Empty copy: “No branches yet.” vs structured `EmptyState`
- Snackbars duplicated ~20 times instead of one host
- Status colors: some chips still `info` (now violet) vs `StatusBadge`
- Icon-only delete without labels
- Dialogs: default MUI; no shared header/footer spacing recipe beyond theme `fullWidth`

---

## 12. UX problems

- Clinical dashboards still mix stats + worklist + detail + tabs (task not visually primary)
- UUID hospital/branch fallback fields still appear when profile is missing
- PlaceholderPage can still appear if routed
- Filter chips are not a radiogroup (aria-pressed added; no arrow keys)
- No breadcrumbs on nested hospital/admin detail pages

---

## 13. Visual clutter

- Improved on patient dashboard (disclaimer demoted)
- Hospital ops pages still lead with a table and a single “Add” button
- Multiple Alerts stacked on doctor appointment/encounter details

---

## 14. Accessibility issues

- Skip link exists on shells
- Remaining: many `IconButton` deletes without names
- Tables not captioned
- Live regions missing on table “Loading…”
- Contrast of primary-as-small-link improved via `primary.dark` on `MuiLink`

---

## 15. Mobile / responsive problems

- Lab/OPD/IPD/OT/Pharmacy worklists are the largest remaining mobile gap
- Hospital branch/staff tables have no card fallback
- Modals: theme now `scroll=paper` + `fullWidth`; long branch forms still tall on 375px

---

## 16. Components that should be reused

`DashboardPageHeader`, `EmptyState`, `StatusBadge`, `AppCard`, `StatCard`, `PortalShellLayout`, `PasswordField`, `AnimatedPage`, `pageSpacing`.

---

## 17. Components that should be refactored

- Hospital table pages (Branches, Departments, Staff, Facilities, Roster)
- Admin list pages (Users already has mobile cards — promote pattern)
- Clinical dashboards (layout only: header + empty/loading; **do not rewrite mutation flows**)
- Local Snackbar blocks → `ToastProvider`

---

## 18. Components that should NOT be changed (functionally sensitive)

Do not alter business logic, payloads, or routes in:

- `shared/api/client.ts` (auth refresh, base URL)
- Auth store / login-register API contracts
- Reception duplicate-candidate dialog (`PatientRegisterPage`)
- Clinical mutation sequences (lab collect → result → verify → release)
- Appointment booking slot selection
- Consent gate in `PatientPortalLayout`
- Role route guards

UI-only wrappers around these are allowed.

---

## Remaining work for this optimization

1. Global table / form / dialog / snackbar theme
2. Toast provider
3. Skeletons + ResponsiveTable
4. Adopt headers/empty states on hospital & admin list pages
5. Stagger KPI grids; modal/dialog transitions
6. Admin nav grouping
7. Design-system and implementation docs
