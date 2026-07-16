# UI/UX Design Specifications

## Executive Summary

This document defines the complete visual design system, layout specifications, interaction patterns, and responsive behavior for the Pentatonic Triad System interface.

---

## 1. Design Philosophy

### 1.1 Core Principles
```
1. ANCHOR-FIRST VISUALIZATION
   The pentatonic scale is always the visual foundation
   Triads emerge FROM the pentatonic, not separate from it

2. PROGRESSIVE DISCLOSURE
   Simple view by default
   Complexity reveals on demand
   Never overwhelm the learner

3. IMMEDIATE FEEDBACK
   Every action has visual confirmation
   State changes are animated, not instant
   Errors are clear and actionable

4. GUITARIST-NATIVE DESIGN
   Interface mimics how guitarists think
   String orientation matches physical guitar
   Fret visualization matches neck perspective
```

### 1.2 Target User Mental Model
```
User thinks: "I know the pentatonic box. Show me where the triads hide inside it."
NOT: "Show me music theory diagrams."

Design implication:
- Fretboard is primary, theory panels are secondary
- Visual learning over textual explanation
- Hands-on interaction over passive viewing
```

---

## 2. Layout Architecture

### 2.1 Primary Layout (Desktop: 1200px+)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  HEADER BAR (56px)                                                       │
│  Logo | Key Selector | Mode Toggle | Progression | Settings             │
├────────────────────┬────────────────────────────────────────────────────┤
│                    │                                                     │
│  CONTROL PANEL     │            FRETBOARD DISPLAY                       │
│  (280px width)     │            (Flexible, min 700px)                   │
│                    │                                                     │
│  • String Set      │  ┌─────────────────────────────────────────────┐  │
│  • Inversions      │  │                                             │  │
│  • View Options    │  │      INTERACTIVE FRETBOARD                  │  │
│  • Two-Note Mode   │  │      (Primary Visual Area)                  │  │
│  • Embellishments  │  │                                             │  │
│                    │  │      Height: 280px - 400px                  │  │
│                    │  │                                             │  │
│                    │  └─────────────────────────────────────────────┘  │
│                    │                                                     │
│                    ├────────────────────────────────────────────────────┤
│                    │                                                     │
│                    │            INFORMATION PANEL                       │
│                    │            (Collapsible, 200px when open)          │
│                    │                                                     │
│                    │  Position Details | Voice Leading | Neighborhood   │
│                    │                                                     │
├────────────────────┴────────────────────────────────────────────────────┤
│  ZONE NAVIGATOR (48px)                                                   │
│  ◀ Zone 1 | Zone 2 | Zone 3 | Zone 4 | Zone 5 | Zone 6 ▶               │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Tablet Layout (768px - 1199px)
```
┌───────────────────────────────────────────────────────────────┐
│  HEADER BAR (56px)                                            │
│  [≡] Logo | Key: C Major ▼ | [Settings]                      │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│              FRETBOARD DISPLAY (Full Width)                   │
│              Height: 240px                                    │
│                                                                │
├───────────────────────────────────────────────────────────────┤
│  CONTROL TABS (Horizontal Scroll)                             │
│  [String Set] [Inversions] [View] [Mode] [Embellish]         │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│              ACTIVE TAB CONTENT                               │
│              (Variable Height)                                │
│                                                                │
├───────────────────────────────────────────────────────────────┤
│  ZONE NAVIGATOR (48px)                                        │
└───────────────────────────────────────────────────────────────┘
```

### 2.3 Mobile Layout (< 768px)
```
┌─────────────────────────────────────┐
│  HEADER (48px)                       │
│  [≡] Logo     [Key ▼] [⚙]          │
├─────────────────────────────────────┤
│                                      │
│       FRETBOARD (Rotated 90°)       │
│       or Horizontal Scroll          │
│       Height: 300px                 │
│                                      │
├─────────────────────────────────────┤
│  QUICK CONTROLS (Fixed Bottom)      │
│  [Set ▼] [Inv ▼] [Pen ◐] [Emb ◐]  │
├─────────────────────────────────────┤
│  ZONE NAV                           │
│  ◀ Zone 3 (Frets 5-9) ▶            │
└─────────────────────────────────────┘
```

---

## 3. Fretboard Visual Design

### 3.1 Fretboard Dimensions
```
Desktop:
  Total Width: Flexible (min 700px, max 1200px)
  Total Height: 320px
  Fret Count: 15 frets displayed (0-15)
  String Spacing: 40px between strings
  Fret Spacing: Variable (wider at nut, narrower at 12th)

Fret Width Formula:
  fretWidth = baseWidth * (0.943 ^ fretNumber)
  Where baseWidth = 60px at fret 0
```

### 3.2 Fretboard Colors
```css
:root {
  /* Fretboard Surface */
  --fretboard-bg: #3E2723;           /* Brown 900 - Rosewood */
  --fretboard-grain: url('wood-grain.svg');
  
  /* Frets */
  --fret-color: #BDBDBD;             /* Grey 400 */
  --fret-width: 3px;
  --fret-12th: #9E9E9E;              /* Slightly different for 12th */
  
  /* Nut */
  --nut-color: #F5F5F5;              /* Grey 100 - Bone color */
  --nut-width: 8px;
  
  /* Strings */
  --string-wound: #9E9E9E;           /* Wound strings (E, A, D) */
  --string-plain: #E0E0E0;           /* Plain strings (G, B, E) */
  --string-width-6: 2.5px;           /* Low E */
  --string-width-1: 1px;             /* High E */
  
  /* Inlays */
  --inlay-color: #F5F5F5;
  --inlay-radius: 6px;
}
```

### 3.3 Fret Marker Inlays
```
Single Dot:    Frets 3, 5, 7, 9, 15
Double Dot:    Fret 12

Position: Between strings 3 and 4 for single
          Between strings 2-3 and 4-5 for double
```

### 3.4 String Labels
```
Position: Left side of fretboard (before nut)
Font: 14px, Semi-bold
Color: #757575 (inactive), #1976D2 (active in string set)

    E ──────────────────────
    B ──────────────────────
    G ──────────────────────
    D ──────────────────────
    A ──────────────────────
    E ──────────────────────
```

### 3.5 Fret Numbers
```
Position: Below fretboard
Font: 12px, Regular
Show: Every fret for first 12, then 15

    0   1   2   3   4   5   6   7   8   9  10  11  12     15
```

---

## 4. Note Visualization System

### 4.1 Note Circle Specifications
```css
/* Base Note Circle */
.note-circle {
  r: 14px;                /* Radius */
  stroke-width: 2px;
  cursor: pointer;
  transition: all 150ms ease;
}

/* Hover State */
.note-circle:hover {
  r: 16px;
  filter: brightness(1.1);
}

/* Selected State */
.note-circle.selected {
  r: 18px;
  stroke-width: 3px;
  filter: drop-shadow(0 0 8px currentColor);
}
```

### 4.2 Note Type Hierarchy (Visual Weight)
```
Layer 5 (Top):     Selected Note          - Full opacity, glow
Layer 4:           Triad Notes            - Full opacity
Layer 3:           Embellishment Notes    - 0.7 opacity, dashed stroke
Layer 2:           Pentatonic Ghost       - 0.4 opacity, smaller
Layer 1 (Bottom):  Bar Chord Reference    - 0.25 opacity, dashed
```

### 4.3 Color Palette for Notes
```css
/* Triad Note Colors */
.note-root {
  fill: #E53935;          /* Red 600 */
  stroke: #B71C1C;        /* Red 900 */
}

.note-third-major {
  fill: #1E88E5;          /* Blue 600 */
  stroke: #0D47A1;        /* Blue 900 */
}

.note-third-minor {
  fill: #5E35B1;          /* Deep Purple 600 */
  stroke: #311B92;        /* Deep Purple 900 */
}

.note-fifth {
  fill: #43A047;          /* Green 600 */
  stroke: #1B5E20;        /* Green 900 */
}

.note-fifth-dim {
  fill: #FB8C00;          /* Orange 600 */
  stroke: #E65100;        /* Orange 900 */
}

.note-fifth-aug {
  fill: #00ACC1;          /* Cyan 600 */
  stroke: #006064;        /* Cyan 900 */
}

/* Pentatonic Ghost */
.note-pentatonic-ghost {
  fill: #B0BEC5;          /* Blue Grey 200 */
  stroke: #78909C;        /* Blue Grey 400 */
  opacity: 0.4;
}

/* Bar Chord Reference */
.note-barchord-ghost {
  fill: transparent;
  stroke: #9E9E9E;
  stroke-dasharray: 4, 2;
  opacity: 0.3;
}

/* Embellishment */
.note-embellishment {
  fill: #FFF3E0;          /* Orange 50 */
  stroke: #FF9800;        /* Orange 500 */
  stroke-dasharray: 3, 2;
}
```

### 4.4 Note Labels
```css
.note-label {
  font-family: 'Inter', -apple-system, sans-serif;
  font-size: 11px;
  font-weight: 600;
  fill: white;
  text-anchor: middle;
  dominant-baseline: central;
  pointer-events: none;
}

/* Interval Labels */
.interval-label {
  font-size: 10px;
}

/* Finger Numbers */
.finger-label {
  font-size: 12px;
  font-weight: 700;
}
```

### 4.5 Note Label Content Options
```
Mode: Note Names       →  "C", "F#", "Bb"
Mode: Interval         →  "R", "3", "5", "b3", "b5"
Mode: Finger Numbers   →  "1", "2", "3", "4"
Mode: Scale Degrees    →  "1", "2", "b3", "4", "5", "b7"
```

---

## 5. Control Panel Design

### 5.1 Panel Structure
```css
.control-panel {
  width: 280px;
  background: #FAFAFA;
  border-right: 1px solid #E0E0E0;
  overflow-y: auto;
  padding: 16px;
}

.control-section {
  margin-bottom: 24px;
}

.control-section-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #757575;
  margin-bottom: 12px;
}
```

### 5.2 Radio Button Group (String Sets, Inversions)
```
┌─────────────────────────────────────┐
│  STRING SET                          │
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │ ○ All Sets                      ││
│  ├─────────────────────────────────┤│
│  │ ● E-B-G (1-2-3)                 ││
│  │   Bright, cutting               ││
│  ├─────────────────────────────────┤│
│  │ ○ B-G-D (2-3-4)                 ││
│  │   Balanced, versatile           ││
│  ├─────────────────────────────────┤│
│  │ ○ G-D-A (3-4-5)                 ││
│  │   Warm, full                    ││
│  ├─────────────────────────────────┤│
│  │ ○ D-A-E (4-5-6)                 ││
│  │   Deep, bass-heavy              ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

### 5.3 Toggle Switches
```css
.toggle-switch {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: #E0E0E0;
  transition: background 200ms;
}

.toggle-switch.active {
  background: #1976D2;
}

.toggle-switch .handle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  transform: translateX(2px);
  transition: transform 200ms;
}

.toggle-switch.active .handle {
  transform: translateX(22px);
}
```

### 5.4 View Options Section
```
┌─────────────────────────────────────┐
│  VIEW OPTIONS                        │
├─────────────────────────────────────┤
│                                      │
│  Show Pentatonic Overlay    [====○] │
│                                      │
│  Show Root Markers          [○====] │
│                                      │
│  Show Bar Chord Reference   [====○] │
│                                      │
│  Show Fingerings            [○====] │
│                                      │
│  Note Labels:  [Note Names ▼]       │
│                                      │
└─────────────────────────────────────┘
```

---

## 6. Information Panel Design

### 6.1 Tab Navigation
```
┌─────────────────────────────────────────────────────────────────┐
│  [Position Details] │ [Voice Leading] │ [Neighborhood]          │
│  ═══════════════════                                            │
└─────────────────────────────────────────────────────────────────┘

Active tab: Bottom border 3px solid #1976D2
Inactive: No border, color #757575
```

### 6.2 Position Details Content
```
┌─────────────────────────────────────────────────────────────────┐
│  POSITION DETAILS                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐   C Major Triad                               │
│  │  ●           │   Root Position                               │
│  │    ●         │   Strings 1-2-3 (E-B-G)                       │
│  │      ●       │                                               │
│  │  Mini        │   Fret Position: 3-5                          │
│  │  Diagram     │                                               │
│  └──────────────┘                                               │
│                                                                  │
│  Notes:         C (Root) - E (3rd) - G (5th)                   │
│  Fingering:     1 - 2 - 3                                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  String  │  Note  │  Fret  │  Interval  │  Finger       │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │  1 (E)   │   G    │   3    │    5th     │    3          │   │
│  │  2 (B)   │   C    │   1    │   Root     │    1          │   │
│  │  3 (G)   │   E    │   2    │   3rd      │    2          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Related: E-shape bar chord at fret 0                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Voice Leading Content
```
┌─────────────────────────────────────────────────────────────────┐
│  VOICE LEADING                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  From: C Major (Fret 5)  →  To: A Minor (Fret 5)               │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                                                         │    │
│  │   ●═══════●     Voice 1: G → A (+2 semitones)         │    │
│  │   ●───────●     Voice 2: C → C (common tone)          │    │
│  │   ●───────●     Voice 3: E → E (common tone)          │    │
│  │                                                         │    │
│  │   C Major      A Minor                                  │    │
│  │                                                         │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Total Movement:    2 semitones                                 │
│  Common Tones:      2 of 3                                      │
│  Smoothness:        ★★★★★ Excellent                            │
│                                                                  │
│  [ ▶ Animate Transition ]                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Zone Navigator Design

### 7.1 Fixed Position Bar
```css
.zone-navigator {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: #FFFFFF;
  border-top: 1px solid #E0E0E0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  z-index: 100;
}
```

### 7.2 Zone Button States
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   ◀    [ 1 ]  [ 2 ]  [ 3 ]  [ 4 ]  [ 5 ]  [ 6 ]    ▶          │
│                      ═══                                        │
│                     Active                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Button Styles:
  Default:  bg: transparent, border: #E0E0E0, color: #757575
  Hover:    bg: #F5F5F5, border: #BDBDBD
  Active:   bg: #1976D2, border: #1976D2, color: white
```

### 7.3 Zone Indicator on Fretboard
```
When zone is selected, subtle background shading appears:

    Fret 0    5         9        12
    │░░░░░░░░░▓▓▓▓▓▓▓▓▓▓░░░░░░░░░│

    ░ = Inactive zone (opacity 0.05)
    ▓ = Active zone (opacity 0.15, color: #1976D2)
```

---

## 8. Animation Specifications

### 8.1 Transition Durations
```css
:root {
  --transition-instant: 50ms;
  --transition-fast: 150ms;
  --transition-normal: 250ms;
  --transition-slow: 400ms;
  --transition-dramatic: 800ms;
}
```

### 8.2 Easing Functions
```css
:root {
  --ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### 8.3 Key Animations

#### Note Appear
```css
@keyframes noteAppear {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.note-circle.entering {
  animation: noteAppear 300ms var(--ease-bounce);
}
```

#### Voice Leading Line
```css
@keyframes voiceLeadDraw {
  0% {
    stroke-dashoffset: 100%;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.voice-lead-line {
  stroke-dasharray: 100%;
  animation: voiceLeadDraw 400ms var(--ease-out);
}
```

#### Zone Transition
```css
@keyframes zoneSlide {
  0% {
    transform: translateX(var(--slide-from));
    opacity: 0.5;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
```

---

## 9. Responsive Breakpoints

### 9.1 Breakpoint Definitions
```css
/* Mobile First Approach */
$breakpoint-sm: 576px;   /* Small phones */
$breakpoint-md: 768px;   /* Tablets */
$breakpoint-lg: 1024px;  /* Small laptops */
$breakpoint-xl: 1200px;  /* Desktops */
$breakpoint-xxl: 1440px; /* Large screens */
```

### 9.2 Component Behavior by Breakpoint

| Component | < 768px | 768-1199px | 1200px+ |
|-----------|---------|------------|---------|
| Control Panel | Bottom drawer | Tabs below fretboard | Left sidebar |
| Fretboard | Horizontal scroll | Full width, compact | Full width, comfortable |
| Info Panel | Modal overlay | Below fretboard | Right of fretboard |
| Zone Nav | Simplified arrows | Full bar | Full bar |
| Note Size | 12px radius | 13px radius | 14px radius |

---

## 10. Accessibility Specifications

### 10.1 Color Contrast
```
All text must meet WCAG AA standards:
- Normal text: 4.5:1 contrast ratio minimum
- Large text: 3:1 contrast ratio minimum
- UI components: 3:1 contrast ratio minimum

Note colors include both fill AND border for distinction
```

### 10.2 Keyboard Navigation
```
Tab Order:
1. Key selector
2. Mode toggle
3. Control panel options (top to bottom)
4. Fretboard (arrow keys to navigate)
5. Zone navigator

Fretboard Keyboard Controls:
- Arrow keys: Move between notes
- Enter: Select/deselect note
- Space: Play note audio (if enabled)
- 1-4: Jump to string set
- R/F/S: Jump to Root/First/Second inversion
```

### 10.3 Screen Reader Support
```html
<div role="application" aria-label="Guitar fretboard">
  <div role="row" aria-label="String 1, high E">
    <div role="gridcell" 
         aria-label="Fret 3, G note, 5th of C major triad"
         aria-selected="true">
    </div>
  </div>
</div>
```

### 10.4 Focus Indicators
```css
:focus-visible {
  outline: 3px solid #1976D2;
  outline-offset: 2px;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .note-circle {
    stroke-width: 3px;
  }
}
```

---

## 11. Dark Mode Support

### 11.1 Dark Mode Color Palette
```css
[data-theme="dark"] {
  /* Fretboard */
  --fretboard-bg: #1A1A1A;
  --fret-color: #4A4A4A;
  --nut-color: #3A3A3A;
  
  /* UI Surfaces */
  --surface-bg: #121212;
  --surface-elevated: #1E1E1E;
  --surface-overlay: #2C2C2C;
  
  /* Text */
  --text-primary: #FFFFFF;
  --text-secondary: #B0B0B0;
  
  /* Borders */
  --border-color: #333333;
  
  /* Note colors remain the same but with adjusted brightness */
  --note-root: #EF5350;
  --note-third: #42A5F5;
  --note-fifth: #66BB6A;
}
```

### 11.2 Theme Toggle
```
Position: Settings menu or header
Icon: Sun/Moon toggle
Transition: 200ms fade between themes
Preference: Respects system preference by default
```

---

*This document provides complete UI/UX specifications. All implementations should adhere to these guidelines.*
