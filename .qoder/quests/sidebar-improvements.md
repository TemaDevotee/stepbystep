# Sidebar Utilities Refinement, Theme Dropdown Fix, and Brand Logo Pinning

## Overview

Refine the sidebar so utilities are **geometrically aligned**, **icon-only**, and **interact precisely** (the icon is the only hit target and the only highlighted area). Fix the **Theme** dropdown anchor and make theme switching reliably toggle between **`classic`** and **`sapphire`**. Ensure the **brand logo** is pinned to the shared icon axis (no horizontal drift) and that **collapsed** mode never lets icons or hover visuals protrude beyond the sidebar.

**Allowed commands only:** `npm i`, `npm run dev`
**No new packages.** Do not alter existing dependencies.

---

## Scope

### In Scope

* Utilities (bottom cluster):

  * **Language** — dropdown (EN / RU)
  * **Theme** — dropdown (Classic / Sapphire)
  * **Dark/Light** — single icon toggle (sun ↔ moon)
  * **Logout** — icon button
* **Brand row** (logo only; wordmark hidden for now)
* Sidebar container behavior (expanded / collapsed)
* CSS and DOM geometry for **icon-only interactivity**, **hover/active highlighting**, and **dropdown anchoring**

### Out of Scope

* Router items list and routing logic
* Any changes to data fetching or API
* Introduction of new UI libraries or icon sets

---

## Architecture

### Component Hierarchy

```mermaid
graph TD
  A[Sidebar.vue] --> B[SidebarBrand.vue]
  A --> C[SidebarSection - Navigation]
  A --> D[SidebarSection - Utilities]
  D --> E[SidebarUtility - Language (icon trigger)]
  D --> F[SidebarUtility - Theme (icon trigger)]
  D --> G[SidebarUtility - Dark/Light (icon toggle)]
  D --> H[SidebarUtility - Logout (icon)]
  E --> I[LanguageSwitcher.vue (dropdown)]
  F --> J[ThemeSwitcher.vue (dropdown)]
```

### CSS Token System (single source of truth)

All geometry is driven by CSS custom properties on `.sidebar`:

```css
.sidebar {
  --collapsed-width: 72px;
  --expanded-width: 256px;

  --icon-size: 24px; /* visual + hit target: 24x24 only */
  --icon-axis-x: calc(var(--collapsed-width) / 2);              /* 36px */
  --left-gutter: calc(var(--icon-axis-x) - var(--icon-size) / 2); /* 24px */

  --row-height: 48px;     /* nav rows; DO NOT use for utility hover sizes */
  --dropdown-gap: 10px;   /* spacing between icon and dropdown */
  --radius-round: 999px;

  /* use theme tokens that already exist */
  --hover-bg: var(--c-bg-hover);
  --focus-ring: color-mix(in oklab, var(--accent) 60%, transparent);
  --menu-bg: var(--c-bg-secondary);
  --menu-border: var(--c-border);
  --text-primary: var(--c-text-primary);
  --text-accent: var(--c-text-accent);
  --text-brand: var(--c-text-brand);
}
```

> **Icon axis rule**: every row (brand, router, utility) is a two-track grid `[24px icon] + [1fr label]` with `padding-left: var(--left-gutter)`. This pins every icon’s center at `--icon-axis-x` in both expanded and collapsed states.

---

## Interaction Design

### Hit-Target Policy (strict)

* **Only the icon** (24×24) is clickable/focusable/highlightable.
* **No fat targets**. The surrounding row/wrapper must **not** receive pointer events.
* Hover/active **overlays match the icon bounds exactly** (perfect circle, 24×24).

**CSS baseline:**

```css
/* Each row (utility or nav) keeps the same grid & left padding */
.sidebar-row {
  display: grid;
  grid-template-columns: var(--icon-size) 1fr;
  padding-left: var(--left-gutter);
  align-items: center;
}

.sidebar-utility { 
  @extend .sidebar-row; 
  pointer-events: none;    /* wrapper never captures clicks */
  height: var(--row-height);
  position: relative;
}

/* The only interactive node */
.icon {
  width: var(--icon-size);
  height: var(--icon-size);
  display: grid; place-items: center;
  pointer-events: auto;
  position: relative;
  cursor: pointer;
}

/* Circular hover/active overlay that equals icon size */
.icon::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: var(--radius-round);
  background: var(--hover-bg);
  opacity: 0;
  transition: opacity 150ms ease;
  pointer-events: none;
}

.icon:hover::before,
.icon:focus-visible::before,
.icon[aria-current="true"]::before { opacity: 1; }

/* Prevent accidental highlight on wrappers */
.sidebar-utility *:not(.icon) { pointer-events: none; }
```

### Event Handling Pattern

* All click/keydown handlers live on `.icon` (or the button inside it).
* Wrappers (`.sidebar-utility`, `.sidebar-row`) use `pointer-events: none`.
* Dropdown open/close logic is attached to the switcher component; events inside the dropdown `stopPropagation()` to avoid immediate dismissal.

---

## Component Specifications

### 1) Language Switcher (dropdown)

**Trigger**

* Material icon: `language` (outlined)
* A11y: `title="Language"`, `aria-label="Language"`, `aria-haspopup="menu"`, `:aria-expanded="isOpen"`

**Dropdown Menu**

* Anchored to **the icon**, not the row:

  ```css
  .language-dropdown {
    position: absolute;
    bottom: 0;
    left: calc(100% + var(--dropdown-gap)); /* appears to the right of icon */
    width: 128px; padding: 8px; border-radius: 12px;
    background: var(--menu-bg);
    border: 1px solid var(--menu-border);
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / .1);
    z-index: 50;
  }
  ```
* Animation (Vue `<transition>`):

  * Enter: 100ms ease-out (`scale .95 → 1`, `opacity 0 → 1`)
  * Leave: 75ms ease-in (`scale 1 → .95`, `opacity 1 → 0`)
  * Reduced motion: fade-only (120ms)
* Items:

  * **English** (active when `langStore.current === 'en'`)
  * **Русский** (active when `langStore.current === 'ru'`)
* Styles:

  * Default: `color: var(--text-primary)`
  * Hover: `background: var(--hover-bg)`, `color: var(--text-accent)`
  * Active: `color: var(--text-brand)`

**Close Conditions**

* Outside click, `Escape`, selection, and route change.

**State**

* Single source of truth: `langStore`. No duplicate language state.

---

### 2) Theme Switcher (dropdown)

**Trigger**

* Material icon: `palette` (outlined)
* A11y: `title="Theme"`, `aria-label="Theme"`, `aria-haspopup="menu"`, `:aria-expanded="isOpen"`

**Dropdown Menu**

* Same geometry as Language, anchored with `left: calc(100% + var(--dropdown-gap))`
* Options: **Classic**, **Sapphire** (only these two)

**Switching Logic (canonical)**

```ts
function applyTheme(theme: 'classic' | 'sapphire') {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('app:theme', theme); } catch {}
}

function resolveInitialTheme(): 'classic' | 'sapphire' {
  const fromDom = document.documentElement.getAttribute('data-theme');
  const fromStore = localStorage.getItem('app:theme');
  const cand = (fromDom || fromStore || 'classic') as string;
  return cand === 'sapphire' ? 'sapphire' : 'classic';
}

// onMounted:
applyTheme(resolveInitialTheme());
```

> Accept **only** `classic` or `sapphire`. Any other value falls back to `classic`. The store (if present) must not drift from `<html data-theme>`; the DOM is the source of truth for the active theme.

**Close Conditions**

* Outside click, `Escape`, selection, and route change.

---

### 3) Dark/Light Toggle (icon-only)

**Visual & Behavior**

* Must look **identical** to other utilities (same `.icon`, same circular hover).
* Icon reflects next action (optional) or current state:

  * When **dark**: show `light_mode` (label “Switch to light mode”)
  * When **light**: show `dark_mode` (label “Switch to dark mode”)
* Action calls the existing `themeStore.toggleDarkMode()` (or equivalent).

**A11y**

* `title` and `aria-label` update dynamically to reflect the action.

---

### 4) Logout (icon-only)

**Visual & Behavior**

* Material icon: `logout`
* Same `.icon` container and hover behavior
* Single action: `handleLogout()` (existing)

**A11y**

* `title="Log out"`, `aria-label="Log out"`

---

## Brand Logo (SidebarBrand) — Pin to Icon Axis

**Layout**

```css
.sidebar-brand {
  display: grid;
  grid-template-columns: var(--icon-size) 1fr; /* [icon][label-track] */
  padding-left: var(--left-gutter);
  align-items: center;
  height: 64px;         /* consistent header height */
}

.sidebar-brand .brand-icon {
  width: var(--icon-size);
  height: var(--icon-size);
  display: grid; place-items: center;
  /* No transforms, negative margins, or extra padding */
}
```

**Behavior**

* **Collapsed**: clicking the logo **expands** the sidebar (no navigation)
* **Expanded**: clicking the logo **navigates** to Dashboard
* **Hover**: subtle micro-effect on the **logo only** (no row background)
* **Wordmark**: remains **hidden** for now; keep the label track present (width 0) to stabilize grid geometry

---

## Sidebar Container Rules

### Expanded

* Normal layout; router items may use **pill** hover/active geometry (separate from utilities).

### Collapsed

* Enforce exact width and prevent protrusion:

  ```css
  .sidebar.collapsed {
    width: var(--collapsed-width);
    min-width: var(--collapsed-width);
  }
  ```
* Every row continues using the same grid + left gutter.
* **No** per-item X-offset hacks (`translateX`, negative margins).
* Hover overlay is icon-sized (24×24), so it cannot extend beyond the icon bounds.

### Overflow & Dropdowns

* Dropdowns must be visible; set `overflow: visible` on the **utilities section** and ensure no ancestor of the trigger clips it:

  ```css
  .sidebar__utilities { overflow: visible; }
  ```
* If the main content column uses overflow rules, isolate them from the sidebar column.

---

## Accessibility

* Utilities are `<button>`s inside `.icon`, or `.icon` with `role="button"` and keyboard handlers.
* **ARIA**: `aria-label`, `aria-haspopup="menu"`, `aria-expanded`, `role="menu"` for containers, `role="menuitem"` for items.
* **Keyboard**:

  * **Tab** to focus icons; **Enter/Space** to activate.
  * **Escape** closes open dropdowns and **returns focus** to the trigger.
  * Optional: Up/Down arrows cycle menu items.
* **Focus Ring** matches icon circle (not the row):

  ```css
  .icon:focus-visible {
    outline: 2px solid var(--focus-ring);
    outline-offset: 2px;
    border-radius: var(--radius-round);
  }
  ```

---

## Implementation Plan

1. **Normalize row geometry**

   * Audit utilities + brand rows; apply the shared grid & left gutter.
   * Remove any offsets that nudge icons horizontally.

2. **Enforce icon-only interactivity**

   * Move handlers to `.icon`.
   * Add `pointer-events: none` to wrappers; verify hover overlay only appears over the icon.

3. **Language & Theme dropdowns**

   * `position: absolute; bottom: 0; left: calc(100% + var(--dropdown-gap))` relative to the **icon** container.
   * Ensure no clipping via `overflow: visible` on the utilities section and appropriate stacking order.
   * Implement outside/Escape/selection/route-close logic.
   * Implement canonical theme switching (DOM attribute + localStorage).

4. **Dark/Light & Logout**

   * Convert visuals to the same `.icon` pattern; apply consistent A11y attributes.

5. **Brand logo**

   * Apply pinned-axis grid; ensure the logo never moves on collapse/expand.
   * Click semantics: collapsed expands; expanded navigates.

6. **Collapsed integrity**

   * Verify width enforcement and that no icon/hover protrudes beyond `--collapsed-width`.

---

## Acceptance Criteria

### Alignment & Hit Areas

* All utility icons and the brand icon sit on **one vertical axis** (the collapsed centerline).
* **Only the icon** reacts to hover/focus/click; hovering the row/empty space shows no highlight.
* Hover/active visuals are **perfect circles (24×24)**, never stretched.

### Utilities

* **Language** and **Theme** open dropdowns to the **right** of the icon (gap = `--dropdown-gap`) and **do not** affect layout.
* **Dark/Light** and **Logout** look and behave **exactly** like the other two triggers (same circular hover, icon-only, no labels).
* All four expose `title` + `aria-label`.

### Theme Switching

* Selecting **Classic** or **Sapphire** sets `<html data-theme>` and persists to `localStorage['app:theme']`.
* Refresh preserves the selected theme.
* Only `classic`/`sapphire` are accepted; others fall back to `classic`.

### Collapsed Sidebar

* With the sidebar collapsed, **no icons or hover effects** protrude beyond `--collapsed-width`.
* Dropdowns still open correctly and are fully visible.

### Brand

* Wordmark hidden; **logo pinned** on axis.
* Collapsed: logo click expands (no navigation).
* Expanded: logo click navigates to Dashboard.
* Hover only affects the logo icon (no row background).

### General

* No new packages; project starts with `npm run dev`.
* No layout shifts during hover or dropdown interactions.

---

## Test Matrix (manual)

**Geometry & Axis**

* Zoom 200%: visually verify icon centers align on a single vertical line in both states.

**Hit Target**

* Move the cursor within ±3px around an icon: highlight appears **only** when over the icon bounds.

**Dropdowns**

* Language: opens right of icon; both items selectable; closes on outside/Escape/selection/route-change.
* Theme: opens right; choosing **Sapphire** updates theme immediately; reload preserves it; switching back to **Classic** works.

**Utilities Consistency**

* Dark/Light and Logout look identical (shape, size, hover behavior) to Language/Theme triggers.

**Collapsed Behavior**

* Collapse the sidebar; confirm no overflow/protrusion; hover circles remain within 24×24.

**Brand Behavior**

* Collapsed logo click expands; expanded logo click routes to Dashboard; logo never moves on X.

**A11y**

* Tab order reaches all icons; Enter/Space activates; Esc closes menus and restores focus.
* Screen readers announce correct labels and menu roles.

---

## Known Pitfalls & Guards

* **Clipping**: Avoid `overflow: hidden` on containers that wrap the utilities; allow dropdowns to render outside.
* **Duplicate state**: Do not store theme in multiple places that can desync; DOM attribute (`data-theme`) is canonical.
* **Wrapper interactivity**: Ensure no event listeners remain on wrappers; all handlers belong to `.icon`.
* **Z-index stacking**: Menus need `z-index: 50` (or greater than the sidebar’s header) to appear above.

---

## Performance & Compatibility

* Overlays use opacity transitions only; no layout thrashing.
* Works in modern evergreen browsers (CSS variables, grid).
* Honors `prefers-reduced-motion` with fade-only transitions.

---

## Deliverables

* Updated **LanguageSwitcher.vue**, **ThemeSwitcher.vue** (dropdowns restored and anchored correctly).
* Updated **SidebarUtility** (icon-only hit targets; slot support for switchers).
* Updated **Dark/Light** & **Logout** visuals to match utilities.
* Updated **SidebarBrand.vue** (pinned icon axis, wordmark hidden, click semantics).
* CSS updates for `.sidebar`, utilities, and dropdowns (tokens, overlays, overflow rules).

This specification ensures consistent visuals, precise interactivity, correct theme switching, and a stable, polished sidebar experience in both expanded and collapsed modes.
