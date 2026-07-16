# Musical Insights Pro — GUI/UX Upgrade Design Blueprint
**Version:** 2.0 | **Date:** 2026-06-11 | **Status:** Full Implementation Blueprint

> **Scope:** Complete GUI/UX upgrade specification covering every page, component, and interaction in the app. The fretboard note circles, glow effects, Circle of 5ths, and CAGED overlays are **100% preserved**. Everything else is eligible for improvement.
> **Target:** Every screen and component should rate ≥ 9/10 for visual design, usability, and mobile responsiveness.

---

## SECTION 1 — CURRENT STATE AUDIT & RATINGS

### 1.1 Page & Component Ratings

| Screen / Component | File | Rating | Primary Issues |
|---|---|---|---|
| **Login Page** | `app/login/page.tsx` | 7/10 | Good glassmorphism base. No sign-up link, no home link, touch targets small on mobile, focus rings are just border-color changes. |
| **Pricing Page** | `app/pricing/page.tsx` | 4/10 | Raw unstyled Shadcn on white/light bg. Zero brand consistency with rest of app. Full-width buttons. Cards stretch to 100%. No app logo or back link. |
| **Main App Header** | `components/Header.tsx` | 5/10 | Extremely dense. Logo + HamburgerMenu + Song Builder + Circle toggle + full ControlPanel (12 note buttons + scale grid) all crammed into one header. No visual hierarchy. Height is unpredictable and can grow very tall. |
| **HamburgerMenu** | `components/HamburgerMenu.tsx` | 4/10 | Basic dropdown, not a real navigation system. Mixes page links, feature toggles (Triads & CAGED, Key Detection), account actions, and beta flags in one unsectioned list. Triads & CAGED buried deep inside dropdown. |
| **AudioSidebar** | `components/AudioSidebar.tsx` | 6/10 | Functional content when expanded. The expand trigger is a 24×48px strip flush to the left viewport edge — nearly invisible and undiscoverable. Sections inside have no visual grouping headers. |
| **ControlPanel** | `components/ControlPanel.tsx` | 6/10 | Root note grid and scale button rows work but are plain. The 12 note buttons each use `grid-cols-12` which stretches each button out. Scale buttons are a full wrapping row of pills with no visual grouping. |
| **TabbedSettingsCard** | `components/TabbedSettingsCard.tsx` | 6/10 | Tab structure is clean, but card stretches to full container width. Tabs have no icons. Content inside has adequate spacing but no visual premium. |
| **Learn Fretboard Hub** | `app/learn/fretboard/page.tsx` | 6/10 | Method cards are decent dark cards. "Start Training →" button is full-width (looks stretched). Stats cards are plain. Back button is a plain gray pill. No nav consistency with rest of app. |
| **Chord Progression Builder** | `app/chord-progression-builder/page.tsx` | 7/10 | Has own dark CPB design system. Good dark treatment and timeline. No back nav to main app. No logo/brand header. |
| **AI Assistant Sidebar** | `components/ai-assistant/AIAssistantSidebar.tsx` | 7/10 | Chat UI is functional and well-structured. The sidebar toggle (right edge) is small and easy to miss. History, skill level, token info are all present but could use cleaner visual hierarchy. |
| **Admin Dashboard** | `app/admin/dashboard/page.tsx` | 5/10 | Dark hardcoded colors mixed with raw Shadcn components. No consistent design with main app. Table is functional but uses basic Shadcn styling. Stat cards have inconsistent styling. |
| **Manage Subscription** | `app/subscription/manage/page.tsx` | 5/10 | Raw Shadcn Card components on default light background. No brand styling. Buttons are default Shadcn size/color. Invoice list is functional but plain. |
| **Reviews Page** | `app/reviews/page.tsx` | 5/10 | Light gradient bg, purple/blue gradients on text, white stat cards. Complete mismatch with app dark theme. Cards are plain `bg-white dark:bg-gray-800`. Button is full-width Shadcn. |
| **Onboarding Guide** | `components/OnboardingGuide.tsx` | 6/10 | Functional spotlight overlay but step cards are plain dark boxes. Prev/Next buttons are full-width. No progress stepper indicator. Backdrop could be more premium. |
| **Fretboard + Note Circles** | `components/Fretboard.tsx` | 9/10 | **PRESERVE EXACTLY** — Glow, note circles, colors are the app's signature premium element. |
| **Circle of 5ths** | `components/CircleOf5ths.tsx` | 8/10 | **PRESERVE EXACTLY** |
| **Mobile (all pages)** | all | 3/10 | No responsive breakpoints anywhere. Layout completely breaks on screens < 1024px. No mobile nav pattern. AudioSidebar occupies full width on mobile. |

### 1.2 Root Cause Summary

1. **No real navigation system** — HamburgerMenu is a dropdown, not a nav. Users cannot discover features or know where they are in the app hierarchy.
2. **Triads & CAGED discoverability** — This critical mode toggle is buried 4 clicks deep (open Menu → scroll → find toggle). Should be permanently visible.
3. **Layout inconsistency** — Login uses glassmorphism; Pricing uses raw Shadcn on white; Main app uses dark theme; Admin uses mixed. No unified design system applied.
4. **Full-width element overuse** — Buttons, cards, and controls stretch to fill 100% of their container everywhere. Industry standard is purposeful, bounded sizing.
5. **Left sidebar conflict** — AudioSidebar expand toggle (left edge) and future NavSidebar icon rail compete for the same left-edge real estate. Needs deliberate z-index and positioning strategy.
6. **Multiple competing sidebars** — AudioSidebar (left), NavSidebar (left), AI Assistant (right), UnifiedRightSidebar (right), ChordBrowserSidebar (right) all operate independently with no coordination.

---

## SECTION 2 — DESIGN SYSTEM FOUNDATION

Add all CSS custom properties in `app/globals.css` inside `:root`. The existing theme system in `lib/themes.ts` continues to function — these MI tokens supplement it for non-fretboard UI only.

### 2.1 Color Palette

```css
/* ── app/globals.css — MI Design Tokens ─────────────────────────── */
:root {
  /* Backgrounds (dark theme — always used regardless of lib/themes.ts selection) */
  --mi-bg-void:         #050507;   /* page background, deepest */
  --mi-bg-base:         #0c0c10;   /* secondary page bg */
  --mi-bg-surface:      #121218;   /* cards, panels, nav rail */
  --mi-bg-elevated:     #18181f;   /* hover states, lifted panels */
  --mi-bg-overlay:      #1f1f28;   /* dropdowns, tooltips, modals bg */
  --mi-bg-glass:        rgba(18,18,24,0.88); /* glassmorphism panels */

  /* Borders */
  --mi-border-subtle:   rgba(255,255,255,0.05);
  --mi-border-medium:   rgba(255,255,255,0.09);
  --mi-border-strong:   rgba(255,255,255,0.15);
  --mi-border-accent:   rgba(59,130,246,0.40);

  /* Accent Colors */
  --mi-accent-blue:     #3b82f6;
  --mi-accent-blue-dim: rgba(59,130,246,0.15);
  --mi-accent-blue-glow:rgba(59,130,246,0.30);
  --mi-accent-violet:   #8b5cf6;
  --mi-accent-violet-dim:rgba(139,92,246,0.15);
  --mi-accent-cyan:     #06b6d4;
  --mi-accent-green:    #22c55e;
  --mi-accent-amber:    #f59e0b;
  --mi-accent-red:      #ef4444;

  /* Text */
  --mi-text-primary:    #ededf5;
  --mi-text-secondary:  #8080a0;
  --mi-text-muted:      #50506a;
  --mi-text-accent:     #60a5fa;

  /* Radius */
  --mi-radius-xs:  4px;
  --mi-radius-sm:  6px;
  --mi-radius-md:  10px;
  --mi-radius-lg:  16px;
  --mi-radius-xl:  22px;
  --mi-radius-full:9999px;

  /* Shadows */
  --mi-shadow-sm:       0 1px 4px rgba(0,0,0,0.35);
  --mi-shadow-card:     0 2px 14px rgba(0,0,0,0.50);
  --mi-shadow-elevated: 0 8px 32px rgba(0,0,0,0.65);
  --mi-shadow-modal:    0 20px 60px rgba(0,0,0,0.80);
  --mi-shadow-glow-blue:0 0 28px rgba(59,130,246,0.22);
  --mi-shadow-glow-vio: 0 0 28px rgba(139,92,246,0.22);
  --mi-shadow-inset:    inset 0 1px 0 rgba(255,255,255,0.04);

  /* Z-Index Hierarchy */
  --mi-z-base:       1;
  --mi-z-fretboard:  10;
  --mi-z-content:    20;
  --mi-z-nav-rail:   30;    /* NavSidebar icon rail */
  --mi-z-sidebar:    40;    /* AudioSidebar expanded panel */
  --mi-z-nav-panel:  45;    /* NavSidebar expanded panel */
  --mi-z-right-panel:40;    /* AI Assistant, UnifiedRightSidebar */
  --mi-z-backdrop:   50;    /* Overlay backdrop */
  --mi-z-modal:      60;    /* Modals, onboarding guide */
  --mi-z-tooltip:    70;    /* Tooltips, popovers */
  --mi-z-floating:   35;    /* Floating action buttons */

  /* Transitions */
  --mi-transition-fast:  0.15s ease;
  --mi-transition-base:  0.22s ease;
  --mi-transition-slow:  0.35s cubic-bezier(0.4, 0, 0.2, 1);
  --mi-transition-slide: 0.30s cubic-bezier(0.4, 0, 0.2, 1);
  --mi-transition-spring:0.40s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### 2.2 Typography Scale

Apply via Tailwind classes or inline style. Do not change base font (Inter is already loaded in `app/layout.tsx`).

| Role | Size | Weight | Line-height | Usage |
|---|---|---|---|---|
| `heading-xl` | 28px | 700 | 1.25 | Page titles (Learn, Admin dashboard h1) |
| `heading-lg` | 22px | 700 | 1.30 | Section titles, card headings |
| `heading-md` | 16px | 600 | 1.35 | Sub-section labels, tab headers |
| `heading-sm` | 13px | 600 | 1.40 | Card titles, nav labels |
| `body-md` | 14px | 400 | 1.55 | Default body text |
| `body-sm` | 12px | 400 | 1.55 | Secondary info, tooltips, meta |
| `label` | 11px | 600 | 1.20 | Section dividers, uppercase labels (letter-spacing: 0.08em) |
| `mono` | 13px | 500 | 1.40 | Key/scale chips, note names |

### 2.3 Spacing System (4px Grid)

All padding, margin, gap values must be multiples of 4px:
`4, 8, 12, 16, 20, 24, 32, 40, 48, 64`

- **Component internal padding:** 16px (cards), 12px (compact cards), 8px (chips)
- **Between card sections:** 24px
- **Nav item height:** 44px (comfortable touch target)
- **Header height:** 64px fixed
- **Sub-header bar height:** 44px
- **Nav rail width:** 52px (collapsed), 256px (expanded)
- **AudioSidebar width:** 384px (expanded)
- **AI Assistant sidebar width:** 360px (expanded)

### 2.4 Animation & Easing Reference

```css
/* Panel slides */
.mi-panel-enter { transition: transform var(--mi-transition-slide), opacity var(--mi-transition-base); }

/* Button hover */
.mi-btn-hover:hover { transform: translateY(-1px); box-shadow: var(--mi-shadow-elevated); }
.mi-btn-hover:active { transform: translateY(0); }

/* Toggle switch */
.mi-toggle-knob { transition: left 0.18s cubic-bezier(0.4,0,0.2,1); }
.mi-toggle-track { transition: background-color 0.18s ease; }

/* Card hover (lift) */
.mi-card-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--mi-shadow-elevated);
  border-color: var(--mi-border-strong);
}
```

**Rules:**
- No `hover:scale-[1.02]` on panels, cards, or wide elements — use `translateY` lifts instead
- Scale transforms only on icon buttons ≤ 44px and small chips
- All color transitions: `0.15s ease`
- All geometry transitions: `0.22s ease` or longer with cubic-bezier
- Sidebar/panel open/close: `0.30s cubic-bezier(0.4,0,0.2,1)`

### 2.5 Glassmorphism Treatment (for login, pricing, onboarding cards)

```css
.mi-glass {
  background: var(--mi-bg-glass);
  border: 1px solid var(--mi-border-medium);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-radius: var(--mi-radius-xl);
  box-shadow: var(--mi-shadow-modal), var(--mi-shadow-inset);
}

/* Glow accent border for featured cards */
.mi-glass-featured {
  border-color: var(--mi-border-accent);
  box-shadow: 0 0 0 1px var(--mi-accent-blue), var(--mi-shadow-glow-blue), var(--mi-shadow-modal);
}
```

### 2.6 Scrollbar Styling (add to globals.css)

```css
/* Dark thin scrollbars for all panels */
* { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.12) transparent; }
*::-webkit-scrollbar { width: 5px; height: 5px; }
*::-webkit-scrollbar-track { background: transparent; }
*::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px; }
*::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.22); }
```

---

## SECTION 3 — NAVIGATION: NavSidebar.tsx (NEW COMPONENT)

**File to create:** `components/NavSidebar.tsx`
**Replaces:** `components/HamburgerMenu.tsx` (keep HamburgerMenu.tsx as a shell that renders NavSidebar for backward compatibility during transition)

### 3.1 Architecture Overview

The NavSidebar consists of two layers:
1. **Icon Rail** — 52px wide, `position: fixed`, `left: 0`, `top: 64px` (below header), `height: calc(100vh - 64px)`. Always visible on desktop. Contains icon-only nav items with tooltips.
2. **Expanded Panel** — 256px wide, slides out from left on top of the icon rail when `isExpanded = true`. Triggered by clicking the chevron button at the top of the rail, or via keyboard shortcut.

The AudioSidebar's existing left-edge toggle button must be repositioned to `left: 52px` (to the right of the icon rail) so both systems coexist without overlap.

### 3.2 TypeScript Props Interface

```typescript
// components/NavSidebar.tsx
interface NavSidebarProps {
  theme: ThemeConfig;
  // Navigation state
  isFocusMode: boolean;
  onFocusModeChange: (enabled: boolean) => void;
  // View mode toggles (previously in HamburgerMenu)
  showTriadMode: boolean;
  onTriadModeChange: (enabled: boolean) => void;
  overlappingChordsEnabled: boolean;
  onOverlappingChordsChange: (enabled: boolean) => void;
  showIndividualNotes?: boolean;
  onIndividualNotesChange?: (enabled: boolean) => void;
  noteDetectorEnabled: boolean;
  onNoteDetectorEnabledChange: (enabled: boolean) => void;
  isDetecting: boolean;
  onStartDetection?: () => void;
  onStopDetection?: () => void;
  // Utility actions
  onShowGuide: () => void;
  onLogout: () => void;
  // Admin
  isAdmin?: boolean;
  // External expansion control
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}
```

### 3.3 Visual Structure — Icon Rail (Collapsed State)

```
┌──────────────────────────┐  ← 52px wide, position: fixed, left:0, top:64px
│  [≡] chevron expand btn  │  ← 44px tall, accent blue hover
│  ──────────────────────  │
│  [⊞] Home                │  ← 44px tall nav item, tooltip on hover
│  [♫] Song Builder        │
│  [📖] Learn Fretboard    │
│  ──────────────────────  │
│  [◈] Triads (glow if ON) │  ← Icon turns blue + glows when showTriadMode=true
│  ──────────────────────  │
│  [⚙] Settings trigger    │  ← Opens AudioSidebar
│  [?] Guide               │
│  [👁] Focus Mode         │  ← Icon turns blue when active
│  ──────────────────────  │
│  [👤] Account            │  ← Opens mini dropdown
│  [→] Logout              │
└──────────────────────────┘
```

**Icon rail styling:**
```css
background: var(--mi-bg-surface);
border-right: 1px solid var(--mi-border-subtle);
z-index: var(--mi-z-nav-rail);
display: flex; flex-direction: column; align-items: center;
padding: 8px 0; gap: 2px;
```

**Individual nav item (icon only):**
```css
width: 44px; height: 44px; border-radius: var(--mi-radius-md);
display: flex; align-items: center; justify-content: center;
color: var(--mi-text-secondary);
cursor: pointer; transition: background var(--mi-transition-fast), color var(--mi-transition-fast);
position: relative; /* for tooltip */
```
**Active state:** `background: var(--mi-accent-blue-dim); color: var(--mi-accent-blue);`
**Hover state:** `background: var(--mi-bg-elevated); color: var(--mi-text-primary);`

**Tooltip (appears on hover, icon rail collapsed):**
```css
position: absolute; left: 56px; top: 50%; transform: translateY(-50%);
background: var(--mi-bg-overlay); color: var(--mi-text-primary);
padding: 4px 10px; border-radius: var(--mi-radius-sm);
font-size: 12px; font-weight: 500; white-space: nowrap;
border: 1px solid var(--mi-border-medium);
box-shadow: var(--mi-shadow-card); z-index: var(--mi-z-tooltip);
pointer-events: none; opacity: 0; transition: opacity 0.12s ease;
/* Show: */ opacity: 1; (on parent hover)
```

### 3.4 Visual Structure — Expanded Panel (256px)

```
┌─────────────────────────────────────────────┐  ← 256px, position: fixed, left:52px
│  [×] Collapse                               │  ← Close chevron top-right
│  ─────────────────────────────────────────  │
│  NAVIGATE                                   │  ← Section label, 11px uppercase
│  [⊞] Home / Visualizer        (active)     │
│  [♫] Song Builder                           │
│  [📖] Learn Fretboard                       │
│  ─────────────────────────────────────────  │
│  VIEW MODE                                  │  ← Section label
│  Triads & CAGED      [●━━━] ON              │  ← Toggle switch + label
│    └─ Overlapping Chords [○━━] OFF         │  ← Sub-toggle (indented 12px), only when Triads ON
│    └─ Pentatonic Mode   [○━━] OFF          │  ← Sub-toggle, only when Triads ON
│  Individual Notes    [━━━○] OFF             │  ← Only when Triads OFF
│  ─────────────────────────────────────────  │
│  AUDIO                                      │  ← Section label
│  Key Detection       [○━━] OFF              │
│  Note Detector       [○━━] OFF              │
│  ─────────────────────────────────────────  │
│  TOOLS                                      │
│  [?] Tutorial Guide                         │
│  [👁] Focus Mode     [○━━] OFF             │
│  ─────────────────────────────────────────  │
│  ACCOUNT                                    │
│  [💳] Manage Subscription                  │
│  [🛡] Admin Dashboard (if isAdmin)         │
│  [→] Logout                                 │
└─────────────────────────────────────────────┘
```

**Expanded panel styling:**
```css
position: fixed; left: 52px; top: 64px;
width: 256px; height: calc(100vh - 64px);
background: var(--mi-bg-surface);
border-right: 1px solid var(--mi-border-medium);
box-shadow: 4px 0 24px rgba(0,0,0,0.4);
z-index: var(--mi-z-nav-panel);
overflow-y: auto; overflow-x: hidden;
padding: 12px 0;
transform: translateX(0); /* or translateX(-256px) when hidden */
transition: transform var(--mi-transition-slide);
```

**Section label styling:**
```css
padding: 16px 16px 6px; font-size: 11px; font-weight: 600;
letter-spacing: 0.08em; text-transform: uppercase;
color: var(--mi-text-muted);
```

**Expanded nav item (with label):**
```css
display: flex; align-items: center; gap: 12px;
padding: 0 16px; height: 44px;
font-size: 14px; font-weight: 500;
color: var(--mi-text-secondary);
border-radius: 0; /* full-width row */
cursor: pointer; transition: background var(--mi-transition-fast), color var(--mi-transition-fast);
```
**Active:** `background: var(--mi-accent-blue-dim); color: var(--mi-text-primary);` + `border-left: 3px solid var(--mi-accent-blue);`

### 3.5 Toggle Switch Component Pattern (ALL toggles in NavSidebar)

Every toggle in the NavSidebar must use this exact pattern. Create a shared `NavToggleRow` sub-component:

```typescript
// Usage: <NavToggleRow label="Triads & CAGED" isOn={showTriadMode} onToggle={() => onTriadModeChange(!showTriadMode)} icon={<TriangleIcon />} />
function NavToggleRow({ label, isOn, onToggle, icon, disabled, indented }: {
  label: string; isOn: boolean; onToggle: () => void;
  icon?: React.ReactNode; disabled?: boolean; indented?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between px-4 h-11 cursor-pointer select-none"
      style={{
        paddingLeft: indented ? '28px' : '16px',
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        {icon && <span style={{ color: isOn ? 'var(--mi-accent-blue)' : 'var(--mi-text-muted)', width: 16 }}>{icon}</span>}
        <span style={{ fontSize: 14, fontWeight: 500, color: isOn ? 'var(--mi-text-primary)' : 'var(--mi-text-secondary)' }}>{label}</span>
      </div>
      {/* Toggle pill */}
      <div style={{
        width: 40, height: 22, borderRadius: 11, flexShrink: 0,
        background: isOn ? 'var(--mi-accent-blue)' : 'var(--mi-bg-elevated)',
        border: `1px solid ${isOn ? 'var(--mi-accent-blue)' : 'var(--mi-border-medium)'}`,
        position: 'relative', transition: 'background 0.18s ease, border-color 0.18s ease',
      }}>
        <div style={{
          position: 'absolute', top: 2,
          left: isOn ? 20 : 2,
          width: 16, height: 16, borderRadius: '50%',
          background: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.30)',
          transition: 'left 0.18s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </div>
  );
}
```

### 3.6 Section Divider

```tsx
<div style={{
  height: 1, background: 'var(--mi-border-subtle)',
  margin: '8px 12px',
}} />
```

### 3.7 Mobile Behavior (< 768px)

On mobile:
- Icon rail is **hidden** (`display: none`)
- Header shows a hamburger icon button (top-left, 44×44px) instead
- Clicking hamburger triggers the expanded panel as a **full-screen slide-over** from the left (`width: 100vw`, `max-width: 320px`)
- A dark backdrop (`position: fixed, inset: 0, background: rgba(0,0,0,0.6)`) covers the rest of the screen
- Tapping backdrop or the close button collapses the panel

### 3.8 Main Page Layout Offset

When NavSidebar icon rail is visible, all main content must be offset:
- `app/page.tsx` main wrapper: `padding-left: 52px` on desktop (> 768px)
- On mobile: no padding-left (icon rail hidden)
- The AudioSidebar `left` position changes from `0` to `52px` to sit beside the icon rail

**Do this with a CSS variable or Tailwind class added to the main page wrapper:**
```tsx
// In app/page.tsx main div:
className="min-h-screen flex flex-col pl-[52px] md:pl-[52px]"
// Add: style={{ paddingLeft: '52px' }} on desktop via media query
```

### 3.9 Active Route Detection

```typescript
import { usePathname } from 'next/navigation';
const pathname = usePathname();
const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
// Usage: isActive('/') → only exact match for home
// Usage: isActive('/learn') → matches /learn, /learn/fretboard, etc.
```

---

## SECTION 4 — HEADER REDESIGN (`components/Header.tsx`)

### 4.1 Goals

- Fixed height: exactly **64px**
- 3-zone horizontal layout: Logo | Compact Controls | Status + User
- All navigation moved out to NavSidebar
- All tool launchers (Song Builder, Circle toggle, Focus mode) moved to **Sub-header Tool Bar** (44px bar directly below main header)

### 4.2 Main Header Structure (64px)

```
┌────────────────────────────────────────────────────────────────────────────┐  64px
│ [LOGO 120px]  [Root note pills row][Scale dropdown]  [Key chip][User ●]   │
│ ←12px→ logo  ←16px→   center flex-1               ←16px→  status   →12px→│
└────────────────────────────────────────────────────────────────────────────┘
```

**Wrapper CSS:**
```css
position: sticky; top: 0; height: 64px; z-index: var(--mi-z-content);
display: flex; align-items: center; padding: 0 16px; gap: 16px;
background: var(--mi-bg-surface);
border-bottom: 1px solid var(--mi-border-subtle);
box-shadow: 0 1px 0 var(--mi-border-subtle), 0 4px 16px rgba(0,0,0,0.25);
```

### 4.3 Left Zone — Logo (120px, flex-shrink: 0)

- `<Image src="/images/logo-whitetext.png" width={120} height={27} />`
- No hamburger button here (NavSidebar icon rail handles nav)
- On mobile (< 768px): Replace with a 44×44px hamburger button that opens NavSidebar slide-over

### 4.4 Center Zone — Compact Controls (flex: 1, min-width: 0)

Replaces the current verbose ControlPanel. Render inline, horizontally:

```
[C] [C#] [D] [D#] [E] [F] [F#] [G] [G#] [A] [A#] [B]   ← 12 note pills, 32×32px circles
[Scale: ▾ Aeolian               ]                         ← compact dropdown, max-width 180px
```

**Note pill buttons (12 total):**
```css
width: 32px; height: 32px; border-radius: 50%;
font-size: 11px; font-weight: 700;
border: 2px solid transparent;
cursor: pointer; flex-shrink: 0;
transition: transform 0.12s ease, box-shadow 0.12s ease;
/* Active note: */ border-color: rgba(255,255,255,0.5); box-shadow: 0 0 0 3px rgba(255,255,255,0.15);
/* Hover: */ transform: scale(1.12); box-shadow: 0 2px 8px rgba(0,0,0,0.4);
```
Colors come from existing `NOTE_COLORS` map — do not change.

**Scale type selector:**
Replace the current multi-row button grid with a styled `<select>` or custom dropdown component:
```css
height: 32px; padding: 0 10px; border-radius: var(--mi-radius-md);
background: var(--mi-bg-elevated); color: var(--mi-text-primary);
border: 1px solid var(--mi-border-medium); font-size: 13px; font-weight: 500;
cursor: pointer; min-width: 160px; max-width: 200px;
appearance: none; /* custom chevron via background-image */
```

On mobile (< 768px): Note pills reduce to 28×28px. Scale dropdown max-width becomes 140px. Both wrap if needed with `flex-wrap: wrap`.

### 4.5 Right Zone — Status + User Avatar (flex-shrink: 0, gap: 12px)

**Detected key chip** (shown when `detectedKey !== null`):
```tsx
<div style={{
  display: 'flex', alignItems: 'center', gap: 6,
  padding: '4px 10px', borderRadius: 'var(--mi-radius-full)',
  background: 'var(--mi-accent-blue-dim)',
  border: '1px solid var(--mi-accent-blue)',
  fontSize: 12, fontWeight: 600, color: 'var(--mi-accent-blue)',
  whiteSpace: 'nowrap',
}}>
  {isListening && <span className="animate-pulse" style={{ width:6, height:6, borderRadius:'50%', background:'var(--mi-accent-green)', display:'inline-block' }} />}
  {detectedKey} detected
</div>
```

**User avatar button** (36×36px circle, top-right):
```tsx
<button style={{
  width: 36, height: 36, borderRadius: '50%',
  background: 'linear-gradient(135deg, var(--mi-accent-blue), var(--mi-accent-violet))',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 13, fontWeight: 700, color: '#fff',
  border: '2px solid var(--mi-border-medium)',
  cursor: 'pointer',
}}>
  {userInitials}
</button>
```
Clicking opens a small dropdown (position absolute, top: 44px, right: 0, width: 200px):
- Account / Manage Subscription
- Admin Dashboard (if isAdmin)
- ─────
- Logout

### 4.6 Sub-Header Tool Bar (44px bar, directly below main header)

```
┌─────────────────────────────────────────────────────────────────────────┐  44px
│ [♫ Song Builder] [◯ Circle of 5ths: ON/OFF] [👁 Focus] [? Guide] ...  │
└─────────────────────────────────────────────────────────────────────────┘
```

**Wrapper CSS:**
```css
height: 44px; display: flex; align-items: center; gap: 8px; padding: 0 16px;
background: var(--mi-bg-base);
border-bottom: 1px solid var(--mi-border-subtle);
overflow-x: auto; /* horizontal scroll on mobile */
white-space: nowrap;
```

**Tool button style** (not full-width — intrinsic size):
```css
display: inline-flex; align-items: center; gap: 6px;
padding: 0 14px; height: 30px; border-radius: var(--mi-radius-sm);
font-size: 12px; font-weight: 600;
background: var(--mi-bg-elevated);
border: 1px solid var(--mi-border-medium);
color: var(--mi-text-secondary);
cursor: pointer; white-space: nowrap; flex-shrink: 0;
transition: background var(--mi-transition-fast), color var(--mi-transition-fast);
```
**Active/ON state:** `background: var(--mi-accent-blue-dim); border-color: var(--mi-accent-blue); color: var(--mi-text-accent);`

**Song Builder button** — gradient violet/purple (keep its existing purple gradient, just ensure it's an intrinsic-width pill not full-width):
```css
background: linear-gradient(135deg, #6366f1, #8b5cf6);
color: #fff; border-color: transparent;
```

### 4.7 Manual Selection List (currently in Header, stays in place)

The `ManualSelectionList` component and progression navigation controls (Previous/Next, Clear All, Add to List) remain in the header or can move to the sub-header bar in a secondary row. They should NOT be removed — they are core functionality. Just ensure they use the new compact button style (height 30px, not stretched).

### 4.8 Collapsed Header (Pentatonic Mode)

The existing collapsed header mode for pentatonic mode is kept but updated to use the same 64px height, consistent logo, and the NavSidebar icon rail replaces the inline HamburgerMenu button.

---

## SECTION 5 — AUDIOSIDEBAR UPGRADE (`components/AudioSidebar.tsx`)

### 5.1 New Toggle Button (replaces the 24×48px strip)

Remove the existing absolute-positioned tiny left-edge strip. Replace with a **floating pill button** that is always findable:

```tsx
// Floating toggle — position: fixed, bottom-left corner of screen
<button
  onClick={toggleExpanded}
  style={{
    position: 'fixed',
    bottom: 24, left: isExpanded ? 384 + 16 : 52 + 12,
    // 384 = AudioSidebar width when open; 52 = NavSidebar rail width; 12/16 = gap
    transition: 'left var(--mi-transition-slide)',
    zIndex: 'var(--mi-z-floating)',
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '0 16px', height: 36, borderRadius: 'var(--mi-radius-full)',
    background: isExpanded
      ? 'var(--mi-bg-elevated)'
      : 'linear-gradient(135deg, var(--mi-accent-blue), #2563eb)',
    color: '#fff', fontSize: 12, fontWeight: 600,
    border: '1px solid var(--mi-border-medium)',
    boxShadow: 'var(--mi-shadow-elevated)',
    cursor: 'pointer', whiteSpace: 'nowrap',
  }}
>
  {isExpanded ? <X size={14} /> : <Settings size={14} />}
  {isExpanded ? 'Close' : 'App Settings'}
</button>
```

### 5.2 Sidebar Content Structure (when expanded, 384px panel)

The sidebar must have a clear sectioned layout with collapsible sections. Each section has:
- A section header row (icon + label + chevron toggle)
- Collapsible content with smooth height animation

**Section order and content:**

```
┌─────────────────────────────────────────────┐  ← 384px wide panel
│  [Logo centered, 200px wide]                │
│  ─────────────────────────────────────────  │
│  ▼  SKILL LEVEL                             │  ← Section header (collapsible)
│     [● Beginner] [○ Int.] [○ Adv.]          │  ← Skill level selector (unchanged)
│  ─────────────────────────────────────────  │
│  ▼  AUDIO DETECTION                         │
│     [Key Detection panel - unchanged]       │  ← KeyDetectionPanel component
│     [MIDI pedal status if connected]        │
│  ─────────────────────────────────────────  │
│  ▼  NOTE DETECTOR (Beta)                   │
│     [NoteDetectorSidebar - unchanged]       │
│  ─────────────────────────────────────────  │
│  ▼  FRETBOARD SETTINGS                      │
│     Strings:    [6] [7]                     │
│     Tuning:     [Standard ▾]                │
│     Fret Count: [────●────] 24              │
│     Direction:  [Standard] [Inverted]       │
│     Fret Dots:  [●] [color swatch row]     │
│     Middle dots:[○━━] OFF                   │
│     Colorful strings: [○━━] OFF             │
│     String brightness: [────●────] 100%     │
│  ─────────────────────────────────────────  │
│  ▼  DISPLAY                                 │
│     Theme:       [Dark Pro ▾]               │
│     Fretboard:   [Classic ▾]                │
│     Circle pos:  [Left] [Right] [Below]     │
│     Notation:    [Sharps] [Flats]           │
│  ─────────────────────────────────────────  │
│  [Show guide at startup: ○━━ OFF]           │
│  [Open Tutorial Guide button]               │
└─────────────────────────────────────────────┘
```

### 5.3 Section Header Component Pattern

```tsx
function SidebarSection({ title, icon, children, defaultOpen = true }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--mi-border-subtle)' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', background: 'transparent', border: 'none',
          color: 'var(--mi-text-secondary)', cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--mi-text-muted)', width: 16 }}>{icon}</span>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{title}</span>
        </div>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </button>
      {isOpen && <div style={{ padding: '0 16px 16px' }}>{children}</div>}
    </div>
  );
}
```

---

## SECTION 6 — PRICING PAGE REDESIGN (`app/pricing/page.tsx`)

**Current rating: 4/10 → Target: 9/10**

Remove all Shadcn `Card`, `Button`, `Switch`, `Label` component styling. Apply full dark glassmorphism design from scratch.

### 6.1 Page Layout

```
┌──────────────────────────────────────────────────────────┐  min-h-screen
│  [BG: animated gradient orbs, dark void]                 │
│                                                          │
│  ┌─ Page header (not fixed) ──────────────────────────┐  │
│  │ [Logo 140px]              [← Back to App link]    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─ Hero ────────────────────────────────────────────┐   │
│  │         Choose Your Plan                          │   │
│  │   Unlock the full potential of Musical Insights   │   │
│  │                                                   │   │
│  │   Monthly ●━━━━━━━━━━━━━━━ Yearly (-20%)          │   │
│  │   └─ segmented pill, max-width: 240px, centered   │   │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌─ Plan cards grid ─────────────────────────────────┐   │
│  │  [Card 340px]  [Card 340px FEATURED]  [Card 340px]│   │
│  │  justify: center, gap: 24px, flex-wrap: wrap      │   │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Page wrapper CSS:**
```css
min-height: 100vh;
background: var(--mi-bg-void);
color: var(--mi-text-primary);
position: relative; overflow: hidden;
```

**Background orbs (2 animated radial gradients):**
```tsx
<div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
  <div className="animate-pulse" style={{
    position:'absolute', top: '-10%', left: '15%',
    width: 500, height: 500, borderRadius: '50%', filter: 'blur(80px)',
    background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
  }} />
  <div className="animate-pulse" style={{
    position:'absolute', bottom: '-10%', right: '10%',
    width: 400, height: 400, borderRadius: '50%', filter: 'blur(80px)',
    background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)',
    animationDelay: '1.5s',
  }} />
</div>
```

### 6.2 Billing Toggle — Segmented Control (NOT a Switch)

```tsx
<div style={{
  display: 'flex', gap: 0, borderRadius: 'var(--mi-radius-full)',
  background: 'var(--mi-bg-elevated)',
  border: '1px solid var(--mi-border-medium)',
  padding: 4, width: 'fit-content', margin: '0 auto',
}}>
  {['Monthly', 'Yearly'].map((opt) => (
    <button key={opt} onClick={() => setIsYearly(opt === 'Yearly')}
      style={{
        padding: '6px 20px', borderRadius: 'var(--mi-radius-full)',
        fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
        background: (opt === 'Yearly') === isYearly
          ? 'linear-gradient(135deg, var(--mi-accent-blue), #2563eb)'
          : 'transparent',
        color: (opt === 'Yearly') === isYearly ? '#fff' : 'var(--mi-text-secondary)',
        transition: 'all 0.18s ease',
      }}
    >
      {opt}{opt === 'Yearly' && <span style={{ fontSize:11, marginLeft:6, opacity:0.8 }}>−20%</span>}
    </button>
  ))}
</div>
```

### 6.3 Plan Card Specification (max-width: 340px each)

```tsx
<div style={{
  width: 340, borderRadius: 'var(--mi-radius-xl)',
  background: 'var(--mi-bg-glass)',
  border: isPopular ? '1px solid var(--mi-accent-blue)' : '1px solid var(--mi-border-medium)',
  backdropFilter: 'blur(16px)',
  boxShadow: isPopular ? 'var(--mi-shadow-glow-blue), var(--mi-shadow-modal)' : 'var(--mi-shadow-card)',
  padding: 32, display: 'flex', flexDirection: 'column', gap: 20,
  position: 'relative', transform: isPopular ? 'scale(1.03)' : 'scale(1)',
}}>
  {/* Popular badge */}
  {isPopular && (
    <div style={{
      position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
      padding: '4px 16px', borderRadius: 'var(--mi-radius-full)',
      background: 'linear-gradient(135deg, var(--mi-accent-blue), var(--mi-accent-violet))',
      fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap',
    }}>Most Popular</div>
  )}

  {/* Plan name */}
  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--mi-text-primary)' }}>{plan.name}</div>
  <div style={{ fontSize: 13, color: 'var(--mi-text-secondary)' }}>{plan.description}</div>

  {/* Price */}
  <div>
    <span style={{ fontSize: 40, fontWeight: 800, color: 'var(--mi-text-primary)' }}>${price}</span>
    <span style={{ fontSize: 14, color: 'var(--mi-text-muted)', marginLeft: 4 }}>/{isYearly ? 'year' : 'mo'}</span>
    {isYearly && savings > 0 && <div style={{ fontSize:12, color:'var(--mi-accent-green)', marginTop:4 }}>Save {savings}%</div>}
  </div>

  {/* Features list */}
  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
    {plan.features.map((f, i) => (
      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--mi-text-secondary)' }}>
        <Check size={16} style={{ color: 'var(--mi-accent-green)', flexShrink: 0, marginTop: 1 }} />
        {f}
      </li>
    ))}
  </ul>

  {/* CTA button — NOT full-width */}
  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto' }}>
    <button
      onClick={() => handleSubscribe(plan)}
      style={{
        minWidth: 160, maxWidth: 220, height: 44,
        borderRadius: 'var(--mi-radius-md)',
        background: isPopular
          ? 'linear-gradient(135deg, var(--mi-accent-blue), #2563eb)'
          : 'var(--mi-bg-elevated)',
        color: '#fff', fontSize: 15, fontWeight: 600,
        border: isPopular ? 'none' : '1px solid var(--mi-border-medium)',
        cursor: 'pointer', transition: 'all 0.18s ease',
      }}
    >
      Get Started
    </button>
  </div>
</div>
```

---

## SECTION 7 — LOGIN PAGE POLISH (`app/login/page.tsx`)

**Current rating: 7/10 → Target: 9/10** — The base is solid; these are targeted improvements only.

### 7.1 Changes Required

**Top-left home link:**
```tsx
<Link href="/" style={{ position: 'absolute', top: 20, left: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
  <Image src="/images/logo-whitetext.png" width={120} height={27} alt="Home" />
</Link>
```

**Input focus rings:** Replace `onFocus` border-color only with full glow ring:
```tsx
onFocus={(e) => {
  e.target.style.borderColor = '#0ea5e9';
  e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.20), 0 0 0 1px rgba(14,165,233,0.60)';
}}
onBlur={(e) => {
  e.target.style.borderColor = 'rgba(255,255,255,0.08)';
  e.target.style.boxShadow = 'none';
}}
```

**Input autocomplete attributes:**
```tsx
<input id="email" type="email" autoComplete="email" ... />
<input id="password" type="password" autoComplete="current-password" ... />
```

**Error state with icon:**
```tsx
{error && (
  <div style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'12px 16px', borderRadius:10,
    background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)' }}>
    <AlertCircle size={16} style={{ color:'#fca5a5', flexShrink:0, marginTop:1 }} />
    <p style={{ fontSize:13, color:'#fca5a5', margin:0 }}>{error}</p>
  </div>
)}
```

**Forgot password link — make it a proper secondary action (not just a text link):**
Move below the submit button, center it, style with `color: var(--mi-text-muted)` → hover `var(--mi-text-accent)`.

**Submit button enhancement:** Add a subtle shimmer overlay on the gradient button using a pseudo-element or CSS animation. Keep `width: 100%` (correct for auth forms).

---

## SECTION 8 — LEARN FRETBOARD PAGE REDESIGN (`app/learn/fretboard/page.tsx`)

**Current rating: 6/10 → Target: 9/10**

### 8.1 Page Header (replace plain `border-b border-gray-800`)

```tsx
{/* Consistent header with logo + breadcrumb + back link */}
<div style={{
  height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0 24px', borderBottom: '1px solid var(--mi-border-subtle)',
  background: 'var(--mi-bg-surface)', position: 'sticky', top: 0, zIndex: 'var(--mi-z-content)',
}}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    <Image src="/images/logo-whitetext.png" width={120} height={27} alt="Musical Insights" />
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--mi-text-muted)' }}>
      <Link href="/" style={{ color: 'var(--mi-text-muted)', textDecoration: 'none' }}>Home</Link>
      <ChevronRight size={14} />
      <span style={{ color: 'var(--mi-text-secondary)' }}>Learn Fretboard</span>
    </div>
  </div>
  <Link href="/" style={{
    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
    borderRadius: 'var(--mi-radius-sm)', background: 'var(--mi-bg-elevated)',
    border: '1px solid var(--mi-border-medium)', fontSize: 13, fontWeight: 500,
    color: 'var(--mi-text-secondary)', textDecoration: 'none',
  }}>
    <ChevronLeft size={14} /> Back to App
  </Link>
</div>
```

### 8.2 Method Cards Grid (replace current `grid-cols-3` with bounded card grid)

Cards must NOT stretch to fill all available space. They have a fixed max-width:

```tsx
{/* Method cards container */}
<div style={{
  display: 'flex', flexWrap: 'wrap', gap: 20,
  justifyContent: 'center', // center the card grid
  padding: '40px 24px',
}}>
  {TRAINING_METHODS.map((method) => (
    <div
      key={method.id}
      onClick={() => handleMethodSelect(method)}
      style={{
        width: 300, flexShrink: 0, // FIXED width, no stretching
        borderRadius: 'var(--mi-radius-lg)',
        background: 'var(--mi-bg-surface)',
        border: '1px solid var(--mi-border-medium)',
        padding: 24, cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 12,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--mi-shadow-elevated)';
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--mi-border-strong)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--mi-border-medium)';
      }}
    >
      {/* Effectiveness badge - top right */}
      <div style={{ position:'absolute', top:16, right:16,
        padding:'3px 10px', borderRadius:'var(--mi-radius-full)',
        background: `${getEffectivenessColor(method.effectiveness)}22`,
        border: `1px solid ${getEffectivenessColor(method.effectiveness)}55`,
        fontSize: 11, fontWeight: 700, color: getEffectivenessColor(method.effectiveness),
      }}>⭐ {method.effectiveness}/10</div>

      {/* Difficulty badge */}
      <div style={{ width:'fit-content', padding:'3px 10px', borderRadius:'var(--mi-radius-full)',
        background: `${getDifficultyColor(method.difficulty)}22`,
        fontSize: 11, fontWeight: 600, color: getDifficultyColor(method.difficulty),
      }}>{method.difficulty}</div>

      {/* Title and description */}
      <h3 style={{ fontSize:17, fontWeight:700, color:'var(--mi-text-primary)', margin:0, paddingRight:60 }}>{method.name}</h3>
      <p style={{ fontSize:13, color:'var(--mi-text-secondary)', lineHeight:1.55, margin:0 }}>{method.description}</p>
      <div style={{ fontSize:12, color:'var(--mi-text-muted)' }}>📅 {method.sessions}</div>

      {/* Progress bar */}
      <div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--mi-text-muted)', marginBottom:6 }}>
          <span>Progress</span><span>{Math.round(progressPercent)}%</span>
        </div>
        <div style={{ height:3, background:'var(--mi-bg-elevated)', borderRadius:2 }}>
          <div style={{ height:'100%', width:`${progressPercent}%`, borderRadius:2,
            background:'linear-gradient(90deg, var(--mi-accent-blue), var(--mi-accent-violet))',
            transition:'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Start button — NOT full-width */}
      <div style={{ display:'flex', justifyContent:'center', marginTop:4 }}>
        <button style={{
          minWidth: 140, height: 38, borderRadius: 'var(--mi-radius-md)',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff', fontSize: 13, fontWeight: 600,
          border: 'none', cursor: 'pointer',
        }}>Start Training →</button>
      </div>
    </div>
  ))}
</div>
```

### 8.3 Stats Section (3 stat cards, bounded width)

```tsx
<div style={{ display:'flex', gap:16, justifyContent:'center', padding:'0 24px 48px' }}>
  {[
    { value: globalStats.totalSessions, label: 'Total Sessions', color: 'var(--mi-accent-violet)' },
    { value: `${Math.round(globalStats.averageAccuracy)}%`, label: 'Average Accuracy', color: 'var(--mi-accent-blue)' },
    { value: globalStats.longestStreak, label: 'Best Streak', color: 'var(--mi-accent-green)' },
  ].map(({ value, label, color }) => (
    <div key={label} style={{
      width: 180, padding: '24px 16px', textAlign: 'center',
      borderRadius: 'var(--mi-radius-lg)',
      background: 'var(--mi-bg-surface)', border: '1px solid var(--mi-border-medium)',
    }}>
      <div style={{ fontSize: 36, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--mi-text-secondary)', marginTop: 6 }}>{label}</div>
    </div>
  ))}
</div>
```

---

## SECTION 9 — ONBOARDING GUIDE REDESIGN (`components/OnboardingGuide.tsx`)

**Current rating: 6/10 → Target: 9/10**

### 9.1 Backdrop

```css
/* Replace current backdrop */
position: fixed; inset: 0; z-index: var(--mi-z-modal);
background: rgba(5, 5, 7, 0.85);
backdrop-filter: blur(4px);
```

### 9.2 Step Card

```tsx
<div style={{
  position: 'fixed', zIndex: 'var(--mi-z-modal)',
  /* Dynamic positioning based on targetElement rect — keep existing logic */
  /* Visual upgrade: */
  background: 'var(--mi-bg-glass)',
  backdropFilter: 'blur(16px)',
  border: '1px solid var(--mi-border-strong)',
  borderRadius: 'var(--mi-radius-xl)',
  boxShadow: 'var(--mi-shadow-modal)',
  padding: '24px 28px',
  maxWidth: 440, minWidth: 320, width: '90vw',
  display: 'flex', flexDirection: 'column', gap: 16,
}}>
  {/* Step indicator dots at top */}
  <div style={{ display:'flex', gap:6, justifyContent:'center' }}>
    {GUIDE_STEPS.map((_, i) => (
      <div key={i} style={{
        width: i === currentStep ? 20 : 7, height: 7,
        borderRadius: 'var(--mi-radius-full)',
        background: i === currentStep ? 'var(--mi-accent-blue)' : 'var(--mi-border-medium)',
        transition: 'all 0.3s ease',
      }} />
    ))}
  </div>

  {/* Title */}
  <h3 style={{ fontSize:18, fontWeight:700, color:'var(--mi-text-primary)', margin:0 }}>
    {step.title}
  </h3>

  {/* Description */}
  <p style={{ fontSize:14, color:'var(--mi-text-secondary)', lineHeight:1.6, margin:0 }}>
    {step.description}
  </p>

  {/* Navigation */}
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:4 }}>
    <button onClick={handleNeverShowAgain} style={{
      fontSize:12, color:'var(--mi-text-muted)', background:'none', border:'none', cursor:'pointer',
    }}>Never show again</button>

    <div style={{ display:'flex', gap:8 }}>
      {currentStep > 0 && (
        <button onClick={handlePrev} style={{
          padding:'8px 18px', borderRadius:'var(--mi-radius-md)',
          background:'var(--mi-bg-elevated)', border:'1px solid var(--mi-border-medium)',
          color:'var(--mi-text-secondary)', fontSize:13, fontWeight:600, cursor:'pointer',
        }}>← Prev</button>
      )}
      <button onClick={isLastStep ? handleClose : handleNext} style={{
        padding:'8px 18px', borderRadius:'var(--mi-radius-md)',
        background: isLastStep ? 'linear-gradient(135deg, var(--mi-accent-blue), #2563eb)' : 'var(--mi-bg-elevated)',
        border:'1px solid var(--mi-border-medium)',
        color: isLastStep ? '#fff' : 'var(--mi-text-primary)',
        fontSize:13, fontWeight:600, cursor:'pointer',
      }}>{isLastStep ? 'Done ✓' : 'Next →'}</button>
    </div>
  </div>
</div>
```

### 9.3 Spotlight Highlight Ring

```css
/* The spotlight highlight ring around the target element — keep existing logic, upgrade style */
position: fixed; border-radius: 12px;
box-shadow: 0 0 0 4px var(--mi-accent-blue), 0 0 0 9999px rgba(5,5,7,0.72);
transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
pointer-events: none; z-index: calc(var(--mi-z-modal) - 1);
```

---

## SECTION 10 — TABBEDsettingscard (`components/TabbedSettingsCard.tsx`)

**Current rating: 6/10 → Target: 8/10**

### 10.1 Tab Header Upgrade

Replace current bare tab buttons with icon+label tabs:

```tsx
const tabs = [
  { key: 'triad-settings', label: 'Triad Settings', icon: <Triangle size={14} /> },
  { key: 'overlapping-chords', label: 'Overlapping Chords', icon: <Layers size={14} />, onlyWhen: overlappingChordsEnabled },
];

// Tab button style
<button style={{
  display: 'flex', alignItems: 'center', gap: 7,
  padding: '10px 20px', fontSize: 13, fontWeight: 600,
  background: isActive ? 'var(--mi-bg-elevated)' : 'transparent',
  color: isActive ? 'var(--mi-text-primary)' : 'var(--mi-text-muted)',
  border: 'none', borderBottom: isActive ? `2px solid var(--mi-accent-blue)` : '2px solid transparent',
  cursor: 'pointer', transition: 'all 0.15s ease',
}}>
  <span style={{ color: isActive ? 'var(--mi-accent-blue)' : 'inherit' }}>{tab.icon}</span>
  {tab.label}
</button>
```

### 10.2 Content Area

The content area inside the tabs must have `max-width` constrainted by its parent column width — it should never stretch arbitrarily:
```css
padding: 16px;
/* No changes to inner TriadPositionsCard or CAGEDShapesCard content — keep those as-is */
```

---

## SECTION 11 — AI ASSISTANT SIDEBAR (`components/ai-assistant/AIAssistantSidebar.tsx`)

**Current rating: 7/10 → Target: 9/10**

The AI Assistant sidebar slides in from the right edge. The current toggle is a narrow strip on the right side of the viewport — improve its discoverability with a pill button similar to the AudioSidebar toggle.

### 11.1 Toggle Button (replaces right-edge strip)

```tsx
// Position: fixed, bottom-right, above AudioSidebar toggle
<button
  onClick={onToggle}
  style={{
    position: 'fixed', bottom: 68, right: isExpanded ? 360 + 16 : 12,
    // 360 = AI sidebar width; animates as sidebar slides in
    transition: 'right var(--mi-transition-slide)',
    zIndex: 'var(--mi-z-floating)',
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '0 16px', height: 36, borderRadius: 'var(--mi-radius-full)',
    background: isExpanded
      ? 'var(--mi-bg-elevated)'
      : 'linear-gradient(135deg, var(--mi-accent-violet), #7c3aed)',
    color: '#fff', fontSize: 12, fontWeight: 600,
    border: '1px solid var(--mi-border-medium)',
    boxShadow: 'var(--mi-shadow-elevated)',
    cursor: 'pointer',
  }}
>
  <Sparkles size={14} />
  {isExpanded ? 'Close AI' : 'AI Assistant'}
</button>
```

### 11.2 Sidebar Visual Upgrade

The sidebar panel itself (position: fixed, right: 0):
```css
width: 360px; height: calc(100vh - 64px); top: 64px;
background: var(--mi-bg-surface);
border-left: 1px solid var(--mi-border-medium);
box-shadow: -4px 0 24px rgba(0,0,0,0.4);
display: flex; flex-direction: column;
```

**Chat message bubbles — user:**
```css
background: linear-gradient(135deg, var(--mi-accent-blue-dim), rgba(59,130,246,0.10));
border: 1px solid var(--mi-accent-blue-dim);
border-radius: 16px 16px 4px 16px;
padding: 10px 14px; align-self: flex-end; max-width: 85%;
```

**Chat message bubbles — assistant:**
```css
background: var(--mi-bg-elevated); border: 1px solid var(--mi-border-subtle);
border-radius: 4px 16px 16px 16px;
padding: 10px 14px; align-self: flex-start; max-width: 90%;
```

---

## SECTION 12 — ADMIN DASHBOARD (`app/admin/dashboard/page.tsx`)

**Current rating: 5/10 → Target: 8/10**

Apply dark design system to admin pages. The admin pages use a mix of raw Shadcn + hardcoded dark colors.

### 12.1 Admin Page Layout

```tsx
// Admin page wrapper — consistent with main app dark theme
<div style={{ minHeight: '100vh', background: 'var(--mi-bg-void)', color: 'var(--mi-text-primary)' }}>

  {/* Admin header bar (consistent with app header) */}
  <div style={{
    height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 24px', borderBottom: '1px solid var(--mi-border-subtle)',
    background: 'var(--mi-bg-surface)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Image src="/images/logo-whitetext.png" width={120} height={27} alt="" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Shield size={16} style={{ color: 'var(--mi-accent-amber)' }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--mi-accent-amber)' }}>Admin Dashboard</span>
      </div>
    </div>
    <div style={{ display: 'flex', gap: 10 }}>
      <Link href="/" style={{ /* secondary back button */ }}>← Back to App</Link>
      <button onClick={handleLogout} style={{ /* logout pill */ }}>Logout</button>
    </div>
  </div>
```

### 12.2 Stat Cards (replace Shadcn Cards)

The `StatisticsCards` component cards must use:
```css
background: var(--mi-bg-surface);
border: 1px solid var(--mi-border-medium);
border-radius: var(--mi-radius-lg);
padding: 20px 24px;
/* NOT full-width stretched — use a flex/grid layout with max-width 240px per card */
```
Stats grid: `display: flex; gap: 16px; flex-wrap: wrap;` — each stat card: `width: 220px; flex-shrink: 0;`

### 12.3 User Management Table

The `UserManagementTable` component table:
```css
/* Table wrapper */
background: var(--mi-bg-surface);
border: 1px solid var(--mi-border-medium);
border-radius: var(--mi-radius-lg);
overflow: hidden;

/* Table header row */
background: var(--mi-bg-elevated);
border-bottom: 1px solid var(--mi-border-medium);
font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
color: var(--mi-text-muted);

/* Table data rows */
border-bottom: 1px solid var(--mi-border-subtle);
font-size: 13px; color: var(--mi-text-secondary);
/* Hover: */ background: var(--mi-bg-elevated);
```

---

## SECTION 13 — SUBSCRIPTION & REVIEWS PAGES

### 13.1 Manage Subscription (`app/subscription/manage/page.tsx`)

**Current rating: 5/10 → Target: 8/10**

Replace Shadcn Card components. Apply dark design system:

```tsx
<div style={{ minHeight:'100vh', background:'var(--mi-bg-void)', color:'var(--mi-text-primary)' }}>
  {/* Page header matching app style */}
  {/* Subscription status card: */}
  <div style={{
    maxWidth: 600, margin: '40px auto', padding: '0 20px',
    display: 'flex', flexDirection: 'column', gap: 20,
  }}>
    {/* Plan card */}
    <div style={{
      background: 'var(--mi-bg-surface)',
      border: subscription?.status === 'active' ? '1px solid var(--mi-border-accent)' : '1px solid var(--mi-border-medium)',
      borderRadius: 'var(--mi-radius-lg)', padding: 24,
      boxShadow: subscription?.status === 'active' ? 'var(--mi-shadow-glow-blue)' : 'none',
    }}>
      {/* Plan name, status badge, dates */}
    </div>

    {/* Manage billing button — NOT full-width */}
    <div style={{ display:'flex', gap:12 }}>
      <button style={{ padding:'10px 24px', borderRadius:'var(--mi-radius-md)',
        background:'linear-gradient(135deg, var(--mi-accent-blue), #2563eb)',
        color:'#fff', fontWeight:600, fontSize:14, border:'none', cursor:'pointer',
        minWidth:180,
      }}>Manage Billing</button>
      <button onClick={() => router.push('/')} style={{
        padding:'10px 24px', borderRadius:'var(--mi-radius-md)',
        background:'var(--mi-bg-elevated)', border:'1px solid var(--mi-border-medium)',
        color:'var(--mi-text-secondary)', fontWeight:600, fontSize:14, cursor:'pointer',
      }}>← Back to App</button>
    </div>

    {/* Invoice history */}
    <div style={{ background:'var(--mi-bg-surface)', border:'1px solid var(--mi-border-medium)',
      borderRadius:'var(--mi-radius-lg)', overflow:'hidden',
    }}>
      {/* Table header + invoice rows using same table pattern as Admin */}
    </div>
  </div>
</div>
```

### 13.2 Reviews Page (`app/reviews/page.tsx`)

**Current rating: 5/10 → Target: 9/10**

Replace the light gradient background and white stat cards completely:
```tsx
<div style={{ minHeight:'100vh', background:'var(--mi-bg-void)', color:'var(--mi-text-primary)' }}>
  {/* Animated background orbs (same pattern as Pricing) */}

  {/* Hero header */}
  <div style={{ textAlign:'center', padding:'64px 24px 40px' }}>
    <h1 style={{ fontSize:40, fontWeight:800, color:'var(--mi-text-primary)', marginBottom:8 }}>
      ⭐ Customer Reviews
    </h1>
    <p style={{ fontSize:16, color:'var(--mi-text-secondary)', marginBottom:32 }}>
      What musicians are saying about Musical Insights Pro
    </p>
    {/* Submit Review button — NOT full-width */}
    <Link href="/reviews/submit">
      <button style={{
        padding:'12px 28px', borderRadius:'var(--mi-radius-md)',
        background:'linear-gradient(135deg, var(--mi-accent-violet), #7c3aed)',
        color:'#fff', fontWeight:600, fontSize:15, border:'none', cursor:'pointer',
      }}>
        <MessageSquarePlus size={16} style={{ marginRight:8 }} />
        Leave a Review
      </button>
    </Link>
  </div>

  {/* Stat cards: 3 × max-width 180px each */}
  {/* Review cards: ReviewCard component updated with dark glassmorphism */}
</div>
```

**`ReviewCard` component** should use:
```css
background: var(--mi-bg-surface);
border: 1px solid var(--mi-border-medium);
border-radius: var(--mi-radius-lg);
padding: 20px 24px;
/* NOT full-width per card — use grid: repeat(auto-fill, minmax(300px, 360px)) */
```

### 13.3 Subscription Success / Canceled Pages

Apply same dark void background, centered content card (max-width 480px), glassmorphism card style, and constrained CTA buttons.

---

## SECTION 14 — CHORD PROGRESSION BUILDER CONSISTENCY

**Current rating: 7/10 → Target: 9/10**

**File:** `components/chord-progression/ChordProgressionBuilder.tsx`

The CPB already has a solid dark CPB design system (`--cpb-*` tokens in globals.css). The main gap is: no nav back to main app, and no logo/brand header.

### 14.1 Add Consistent Navigation Header

At the top of `ChordProgressionBuilder`, add a shared header bar (64px, same styling as Header.tsx):
```tsx
<div style={{
  height: 64, display:'flex', alignItems:'center', justifyContent:'space-between',
  padding:'0 20px', borderBottom:'1px solid var(--mi-border-subtle)',
  background: 'var(--mi-bg-surface)',
}}>
  <div style={{ display:'flex', alignItems:'center', gap:16 }}>
    <Image src="/images/logo-whitetext.png" width={120} height={27} alt="" />
    <span style={{ fontSize:14, fontWeight:600, color:'var(--mi-text-muted)' }}>Song Builder</span>
  </div>
  <Link href="/" style={{
    display:'flex', alignItems:'center', gap:6, padding:'6px 14px',
    borderRadius:'var(--mi-radius-sm)', background:'var(--mi-bg-elevated)',
    border:'1px solid var(--mi-border-medium)', fontSize:13, fontWeight:500,
    color:'var(--mi-text-secondary)', textDecoration:'none',
  }}>
    <ChevronLeft size={14} /> Back to Visualizer
  </Link>
</div>
```

### 14.2 Keep Existing Timeline Design

The CPB timeline, track headers, chord blocks, playback controls, and transport bar should remain **identical** — they are well-designed and functional. Only the page-level header changes.

---

## SECTION 8 — AUDIOSIDEBAR UX IMPROVEMENTS

**Current rating: 6/10 → Target: 8/10**

**File:** `components/AudioSidebar.tsx`

- The toggle tab (currently 24×48px strip) → replace with a **floating pill button** (`position: fixed, bottom: 24px, left: 16px`) that says "⚙ Settings" when collapsed and "✕ Close" when expanded. Width ~110px, height 40px, rounded-full, blue gradient.
- When expanded, sidebar overlays content with a semi-transparent backdrop (already present) — keep this.
- Add section headers inside sidebar with icons: **Skill Level**, **Audio Detection**, **Fretboard Settings**, **Display**, **Appearance**
- Each section should be collapsible with a chevron

---

## SECTION 9 — MOBILE RESPONSIVENESS SYSTEM

All pages must implement these breakpoints:

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | < 640px | Single column, NavSidebar as full-screen overlay, header height 56px, no horizontal scroll |
| Tablet | 640–1024px | 2-col where needed, NavSidebar as slide-over, condensed controls |
| Desktop | > 1024px | Full layout with icon rail always visible |

**Key mobile rules:**
1. ControlPanel note buttons: `grid-cols-6` on mobile (2 rows of 6) instead of 12-wide
2. Scale selector: dropdown on mobile instead of button row
3. Fretboard: horizontal scroll container on mobile, `overflow-x: auto`
4. NavSidebar: hidden icon rail on mobile, slide-over triggered by hamburger in header
5. AudioSidebar (settings): bottom sheet drawer on mobile (slides up from bottom)
6. All card max-widths respected: never stretch cards to 100% on tablet/desktop

---

## SECTION 10 — UNIVERSAL CARD & BUTTON STANDARDS

### Cards (never full-width):
- Default card max-width: `340px`
- Wide cards (settings panels): `480px`
- Full panel sections: `100%` of their container only when container is explicitly bounded
- Border radius: `16px` (large cards), `10px` (small cards/chips)
- Background: `var(--mi-bg-surface)` with `border: 1px solid var(--mi-border-medium)`

### Buttons (never full-width unless inside a form input group):
- Primary CTA: `min-width: 160px`, `max-width: 240px`, height `44px`, border-radius `10px`
- Secondary: `min-width: 120px`, `max-width: 200px`, height `40px`
- Icon buttons: `40×40px` or `36×36px`, border-radius `8px`
- Login/auth submit buttons: `width: 100%` (acceptable exception — forms)
- Toggle switches: `52×28px` pill — never a full-width row

### Toggle Switches (Triads & CAGED, Key Detection, etc.):
All switches must follow this pattern:
```tsx
<label className="flex items-center gap-3 cursor-pointer">
  <span className="text-sm font-medium" style={{ color: theme.textPrimary }}>
    {label}
  </span>
  <div className="relative">
    <input type="checkbox" className="sr-only" checked={isOn} onChange={onToggle} />
    <div style={{
      width: '52px', height: '28px', borderRadius: '14px',
      background: isOn ? 'var(--mi-accent-blue)' : 'var(--mi-bg-elevated)',
      transition: 'background 0.2s',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: '4px',
        left: isOn ? '28px' : '4px',
        width: '20px', height: '20px', borderRadius: '50%',
        background: '#fff', transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </div>
  </div>
</label>
```

---

## SECTION 11 — COMPONENT-BY-COMPONENT UPGRADE CHECKLIST

### NavSidebar.tsx (NEW — replaces HamburgerMenu.tsx)
- [ ] Icon rail: 48px wide, always visible, dark surface background
- [ ] Expanded panel: 260px, slide out on click/hover, backdrop blur
- [ ] Navigation groups: Tools, View Modes, Account — with dividers and section labels
- [ ] Triads & CAGED toggle prominently in "View Mode" section with correct toggle style
- [ ] Active route highlighting: left border `3px solid var(--mi-accent-blue)` + bg glow
- [ ] Mobile: becomes a full-screen slide-over, triggered by hamburger in top header
- [ ] Accepts same props as HamburgerMenu (for backward compatibility during transition)
- [ ] Use `useRouter` and `usePathname` for active state detection

### Header.tsx
- [ ] Reduce to 3 zones: Logo | ControlPanel (compact) | Status + User Avatar
- [ ] Fixed height: `64px`
- [ ] Move Song Builder, Circle toggle, Focus Mode to collapsible sub-bar below header
- [ ] ControlPanel note buttons: horizontal pill row, 32px circle buttons
- [ ] Scale selector: convert to `<select>` or custom dropdown (max-width 200px)
- [ ] User avatar circle (36px) with initials, top-right — click for Account dropdown
- [ ] Remove all navigation duties from header (moved to NavSidebar)

### Pricing Page (`app/pricing/page.tsx`)
- [ ] Apply dark glassmorphism background (match login page treatment)
- [ ] Plan cards: `max-width: 340px`, glassmorphism style
- [ ] Subscribe button: `max-width: 220px`, centered, gradient blue — NOT `w-full`
- [ ] Billing toggle: pill segmented control, `width: 200px`, centered
- [ ] Popular badge: floating, gradient, not just `bg-primary`
- [ ] Add app logo + back-to-app link in page header

### Learn Fretboard Page (`app/learn/fretboard/page.tsx`)
- [ ] Method cards: `max-width: 320px`, proportional, not stretched
- [ ] "Start Training" button: `min-width: 160px`, centered in card — NOT `w-full`
- [ ] Consistent header with rest of app (logo + back breadcrumb)
- [ ] Stats cards: `max-width: 200px`, centered

### AudioSidebar.tsx
- [ ] Replace tiny 24×48px toggle strip with floating pill button (fixed bottom-left)
- [ ] Add collapsible section headers inside expanded sidebar
- [ ] Section order: Skill Level → Audio Detection → Fretboard Settings → Appearance

### TabbedSettingsCard.tsx
- [ ] Tab headers: give more padding (`py-3 px-6`), add icons to tabs
- [ ] Content area: add subtle top shadow when scrollable
- [ ] Ensure card width is constrained by parent, not stretched

### OnboardingGuide.tsx
- [ ] Upgrade overlay background to `rgba(6,6,8,0.85)` with blur
- [ ] Step cards: glassmorphism style, `border-radius: 20px`, `max-width: 480px`
- [ ] Navigation buttons: NOT full-width — `min-width: 120px` pill buttons
- [ ] Progress indicator: dot stepper at bottom

---

## SECTION 12 — ANIMATION & MICRO-INTERACTION STANDARDS

All interactive elements must follow:
- **Hover:** `transform: translateY(-1px)` + subtle shadow increase (no `scale` distortion on large elements)
- **Active/Press:** `transform: translateY(0)` + shadow reduce
- **Toggle switches:** `transition: background 0.2s ease, left 0.2s ease`
- **Sidebars/panels:** `transition: width 0.3s cubic-bezier(0.4,0,0.2,1)` or `transform` slide
- **Cards:** `transition: box-shadow 0.2s ease, border-color 0.2s ease`
- **No** `hover:scale-[1.02]` on large panel components (only on icon buttons/small chips)

---

## SECTION 13 — IMPLEMENTATION PRIORITY ORDER

1. **NavSidebar.tsx** — Create new component, wire up in Header.tsx, remove HamburgerMenu calls
2. **Header.tsx** — Simplify to 3 zones, add sub-bar, integrate NavSidebar
3. **Pricing Page** — Apply dark design system, fix card/button widths
4. **AudioSidebar toggle** — Replace tiny strip with floating pill button
5. **Learn Fretboard Page** — Fix card/button widths, add consistent nav
6. **TabbedSettingsCard** — Minor polish
7. **OnboardingGuide** — Glassmorphism upgrade
8. **Mobile CSS** — Add responsive breakpoints system-wide via `tailwind.config.ts` and media queries

---

## SECTION 14 — FILES TO CREATE / MODIFY

| Action | File | Notes |
|---|---|---|
| CREATE | `components/NavSidebar.tsx` | Full new nav sidebar replacing HamburgerMenu |
| MODIFY | `components/Header.tsx` | Simplify, integrate NavSidebar, add sub-bar |
| MODIFY | `components/HamburgerMenu.tsx` | Mark deprecated, route props to NavSidebar |
| MODIFY | `app/pricing/page.tsx` | Dark redesign |
| MODIFY | `app/learn/fretboard/page.tsx` | Proportional cards/buttons |
| MODIFY | `components/AudioSidebar.tsx` | Floating toggle button |
| MODIFY | `components/OnboardingGuide.tsx` | Glassmorphism polish |
| MODIFY | `components/TabbedSettingsCard.tsx` | Tab icons, padding |
| MODIFY | `app/globals.css` | Add MI design tokens as CSS custom properties |
| MODIFY | `tailwind.config.ts` | Add custom colors and breakpoints matching MI tokens |

---

## SECTION 15 — FRETBOARD — DO NOT CHANGE

The following must remain **100% identical**:
- `components/Fretboard.tsx` — All note circle rendering, glow effects, color system
- `components/CircleOf5ths.tsx` — SVG rendering, animations
- `lib/themes.ts` fretboard-related keys (`fretboardBg`, `fretboardFret`, `fretboardString`, `fretMarker`)
- All note color assignments (`NOTE_COLORS` in `lib/musicTheory.ts`)
- CAGED region overlay rendering and colors
- Triad note position rendering

These are the app's most premium visual element and must not be touched.

---

*End of Blueprint — Total upgrade targets: 10 components/pages, targeting 9/10 design quality across all screens.*
