# Health360 design system

Use this with MUI. Tokens live in `src/shared/ui/tokens.css` and `src/app/theme.ts`.

Do not introduce Tailwind. Do not replace brand hex values.

## 1. Color system

| Token | Value | Use |
|---|---|---|
| `--h360-color-primary` | `#714fff` | Primary actions |
| `--h360-color-primary-dark` | `#5c3dd9` | Hover, links, focus |
| `--h360-color-primary-light` | `#cfc8ff` | Selected nav, washes |
| `--h360-color-secondary` | `#8852cc` | App bar |
| `--h360-color-secondary-light` | `#efecff` | Muted surface, row hover |
| `--h360-color-bg` | `#f5f4ff` | Page canvas |
| `--h360-color-surface` | `#ffffff` | Cards, dialogs |
| `--h360-color-text` | `#0f0b28` | Body |
| `--h360-color-text-muted` | `#585969` | Supporting text |
| `--h360-color-success` | `#2e7d32` | Success |
| `--h360-color-warning` | `#ff754c` | Warning |
| `--h360-color-danger` | `#c62828` | Error |
| `--h360-color-info` | `#5c3dd9` | Info (on-brand) |
| `--h360-color-border` | `rgba(15,11,40,0.10)` | Default border |

## 2. Typography

Inter. Page title = MUI `h4` 700. Section = `h6` 600. Body = 16/400. Labels = 12–13/600. Metrics = tabular nums.

## 3. Spacing

4 / 8 / 12 / 16 / 20 / 24 / 32 / 40. Page main padding: 16 / 20 / 24 by breakpoint.

## 4. Radius

8 / 10 / 12 / 14 / 20 / pill. Default shape 14. Buttons 12. Nav items 10.

## 5. Shadows

xs rest, sm hover, md hero, focus ring 3px primary wash.

## 6. Buttons

Contained = primary. Outlined = secondary. Text = table/inline. Danger = `color="error"`. Min height 40 (36 small). Press: 1px down. No uppercase.

## 7. Cards

`AppCard` / `StatCard` / `DashboardSection`. Outlined, xs shadow, hover lift only if interactive.

## 8. Forms

Outlined inputs, focus border `primary.dark` 2px. Helper text for errors. Group related fields in stacks. Dialogs: `fullWidth`, `scroll=paper`.

## 9. Tables

`AppTable`: sticky head, hover rows, empty via `EmptyState`, loading skeleton, optional mobile cards.

## 10. Modals

Theme defaults: fullWidth, maxWidth sm, paper scroll. Title 700. Actions padded. Cancel text + primary contained.

## 11. Badges

`StatusBadge` — never Material info-blue. Map pending/warning/error/success/primary.

## 12. Navigation

`PortalShellLayout` grouped sections. Selected: primary.light background, primary.dark icon. Skip link required. Drawer 260px, header 64px.

## 13. Animation principles

180–280ms, ease `[0.22, 1, 0.36, 1]`. Entrance: opacity + 8px Y. Hover: -1px Y + sm shadow. Respect `prefers-reduced-motion`. No loops, bounce, or card spin.

## 14. Responsive rules

md (900) = drawer breakpoint. Tables: cards or horizontal scroll, never broken overflow. Forms: single column on xs. Header actions stack on xs.

## 15. Accessibility

Skip to `#main-content`. Icon buttons need `aria-label`. Links use primary.dark. Focus visible rings. Reduced motion on tokens and Framer.
