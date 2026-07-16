# CSS & Styling Reference

## Executive Summary

This document provides all CSS classes, animations, and styling specifications needed to implement the visual design of the Pentatonic Triad System. Compatible with both vanilla CSS and Tailwind CSS approaches.

---

## 1. Design Tokens (CSS Custom Properties)

### 1.1 Color Palette

```css
:root {
  /* Primary Note Colors */
  --note-root: #E53935;           /* Red - Root notes */
  --note-root-hover: #C62828;
  --note-third-major: #1E88E5;    /* Blue - Major 3rd */
  --note-third-minor: #5E35B1;    /* Purple - Minor 3rd */
  --note-third-hover: #1565C0;
  --note-fifth: #43A047;          /* Green - 5th */
  --note-fifth-hover: #2E7D32;
  
  /* Secondary/Ghost Colors */
  --note-pentatonic: #B0BEC5;     /* Gray - Pentatonic overlay */
  --note-pentatonic-alpha: rgba(176, 190, 197, 0.4);
  --note-barchord: #78909C;       /* Darker gray - Bar chord reference */
  --note-barchord-alpha: rgba(120, 144, 156, 0.3);
  
  /* State Colors */
  --note-selected: #FFD54F;       /* Gold - Selected note */
  --note-muted: #9E9E9E;          /* Gray - Muted note (two-note mode) */
  --note-embellishment: #FF7043;  /* Orange - Embellishment target */
  
  /* Fretboard Colors */
  --fretboard-wood: #3E2723;      /* Rosewood brown */
  --fretboard-fret: #C0C0C0;      /* Silver frets */
  --fretboard-string: #D4AF37;    /* Gold strings */
  --fretboard-inlay: #FFFFF0;     /* Ivory inlays */
  --fretboard-nut: #F5F5DC;       /* Beige nut */
  
  /* Zone Colors */
  --zone-highlight: rgba(33, 150, 243, 0.1);
  --zone-border: rgba(33, 150, 243, 0.3);
  
  /* UI Colors */
  --control-bg: #FAFAFA;
  --control-border: #E0E0E0;
  --control-active: #2196F3;
  --panel-bg: #FFFFFF;
  --text-primary: #212121;
  --text-secondary: #757575;
  
  /* Connection/Line Colors */
  --voice-leading-line: #9C27B0;
  --embellishment-line: #FF9800;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  :root {
    --fretboard-wood: #2D1F1A;
    --control-bg: #1E1E1E;
    --control-border: #333333;
    --panel-bg: #252525;
    --text-primary: #FFFFFF;
    --text-secondary: #B0B0B0;
    --zone-highlight: rgba(33, 150, 243, 0.15);
  }
}
```

### 1.2 Spacing & Sizing

```css
:root {
  /* Fretboard Dimensions */
  --fret-base-width: 60px;
  --fret-height: 30px;
  --string-spacing: 40px;
  --note-size: 28px;
  --note-size-small: 22px;
  --note-size-ghost: 18px;
  
  /* Control Panel */
  --control-panel-width: 280px;
  --control-spacing: 16px;
  --control-radius: 8px;
  
  /* Info Panel */
  --info-panel-width: 320px;
  
  /* Zone Navigator */
  --zone-nav-height: 64px;
  
  /* Animation Durations */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
}
```

---

## 2. Fretboard Styling

### 2.1 Base Fretboard

```css
.fretboard {
  background-color: var(--fretboard-wood);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.fretboard-fret {
  position: absolute;
  width: 3px;
  height: 100%;
  background: linear-gradient(
    to right,
    var(--fretboard-fret) 0%,
    #E8E8E8 50%,
    var(--fretboard-fret) 100%
  );
}

.fretboard-nut {
  position: absolute;
  left: 0;
  width: 8px;
  height: 100%;
  background: var(--fretboard-nut);
  border-right: 2px solid #8B7355;
}

.fretboard-string {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    to bottom,
    var(--fretboard-string) 0%,
    #8B6914 100%
  );
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Wound strings (strings 4-6) are thicker */
.fretboard-string--wound {
  height: 3px;
}

.fretboard-inlay {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--fretboard-inlay);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
  transform: translate(-50%, -50%);
}

.fretboard-inlay--double {
  /* For 12th fret double dots */
}
```

### 2.2 Fret Width Calculation (JavaScript)

```javascript
// Fret width decreases as you go up the neck
function calculateFretWidth(fretNumber, baseWidth = 60) {
  return baseWidth * Math.pow(0.943, fretNumber);
}

// Generate CSS custom properties for fret positions
function generateFretPositions(totalFrets = 15) {
  let position = 8; // Start after nut width
  const positions = [0]; // Nut position
  
  for (let fret = 1; fret <= totalFrets; fret++) {
    const width = calculateFretWidth(fret);
    position += width;
    positions.push(position);
  }
  
  return positions;
}
```

---

## 3. Note Styling

### 3.1 Base Note Styles

```css
/* Base note circle */
.note {
  position: absolute;
  width: var(--note-size);
  height: var(--note-size);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: white;
  transform: translate(-50%, -50%);
  transition: 
    transform var(--duration-fast) ease-out,
    box-shadow var(--duration-fast) ease-out,
    opacity var(--duration-normal) ease-out;
  cursor: pointer;
  z-index: 10;
}

.note:hover {
  transform: translate(-50%, -50%) scale(1.15);
  z-index: 20;
}

.note:active {
  transform: translate(-50%, -50%) scale(0.95);
}

/* Note label inside */
.note-label {
  font-size: 11px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  pointer-events: none;
}
```

### 3.2 Note Type Classes

```css
/* Root note - Red with prominent shadow */
.note-root {
  background: linear-gradient(135deg, #EF5350 0%, var(--note-root) 100%);
  box-shadow: 
    0 2px 8px rgba(229, 57, 53, 0.5),
    0 0 0 2px rgba(229, 57, 53, 0.3);
}

.note-root:hover {
  box-shadow: 
    0 4px 12px rgba(229, 57, 53, 0.6),
    0 0 0 3px rgba(229, 57, 53, 0.4);
}

/* Major 3rd - Blue */
.note-third {
  background: linear-gradient(135deg, #42A5F5 0%, var(--note-third-major) 100%);
  box-shadow: 
    0 2px 6px rgba(30, 136, 229, 0.4),
    0 0 0 2px rgba(30, 136, 229, 0.2);
}

/* Minor 3rd - Purple */
.note-third-minor {
  background: linear-gradient(135deg, #7E57C2 0%, var(--note-third-minor) 100%);
  box-shadow: 
    0 2px 6px rgba(94, 53, 177, 0.4),
    0 0 0 2px rgba(94, 53, 177, 0.2);
}

/* 5th - Green */
.note-fifth {
  background: linear-gradient(135deg, #66BB6A 0%, var(--note-fifth) 100%);
  box-shadow: 
    0 2px 6px rgba(67, 160, 71, 0.4),
    0 0 0 2px rgba(67, 160, 71, 0.2);
}

/* Generic triad note (fallback) */
.note-triad {
  background: linear-gradient(135deg, #78909C 0%, #607D8B 100%);
  box-shadow: 0 2px 6px rgba(96, 125, 139, 0.4);
}
```

### 3.3 Ghost/Overlay Note Styles

```css
/* Pentatonic ghost notes */
.note-pentatonic-ghost {
  width: var(--note-size-ghost);
  height: var(--note-size-ghost);
  background: var(--note-pentatonic-alpha);
  border: 2px dashed var(--note-pentatonic);
  box-shadow: none;
  opacity: 0.7;
  z-index: 5;
}

.note-pentatonic-ghost:hover {
  opacity: 1;
  background: rgba(176, 190, 197, 0.6);
}

.note-pentatonic-ghost .note-label {
  font-size: 9px;
  color: #546E7A;
  text-shadow: none;
}

/* Bar chord reference notes */
.note-barchord-ghost {
  width: var(--note-size-ghost);
  height: var(--note-size-ghost);
  background: transparent;
  border: 2px solid var(--note-barchord);
  opacity: 0.5;
  z-index: 4;
}

.note-barchord-ghost .note-label {
  display: none;
}

/* Embellishment target notes */
.note-embellishment {
  width: var(--note-size-small);
  height: var(--note-size-small);
  background: linear-gradient(135deg, #FF8A65 0%, var(--note-embellishment) 100%);
  box-shadow: 0 2px 6px rgba(255, 112, 67, 0.4);
  z-index: 8;
}
```

### 3.4 Note State Modifiers

```css
/* Selected state */
.note--selected {
  box-shadow: 
    0 0 0 3px var(--note-selected),
    0 4px 12px rgba(255, 213, 79, 0.5);
  z-index: 25;
}

/* Muted state (two-note mode) */
.note--muted {
  background: var(--note-muted);
  opacity: 0.4;
  box-shadow: none;
}

.note--muted::after {
  content: 'X';
  position: absolute;
  font-size: 16px;
  font-weight: 700;
  color: #616161;
}

.note--muted .note-label {
  display: none;
}

/* Hover highlight */
.note--hover {
  animation: note-pulse 1s ease-in-out infinite;
}

@keyframes note-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.1); }
}
```

### 3.5 Fingering Display

```css
/* Finger number on note */
.note-finger {
  position: absolute;
  bottom: -8px;
  right: -8px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #333;
  color: white;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid white;
  z-index: 30;
}

/* Finger colors */
.note-finger--1 { background: #F44336; } /* Index - Red */
.note-finger--2 { background: #2196F3; } /* Middle - Blue */
.note-finger--3 { background: #4CAF50; } /* Ring - Green */
.note-finger--4 { background: #FF9800; } /* Pinky - Orange */
```

---

## 4. Zone Styling

### 4.1 Zone Highlight

```css
.zone-highlight {
  position: absolute;
  top: 0;
  bottom: 0;
  background: var(--zone-highlight);
  border-left: 2px solid var(--zone-border);
  border-right: 2px solid var(--zone-border);
  pointer-events: none;
  z-index: 1;
  transition: 
    left var(--duration-slow) ease-out,
    width var(--duration-slow) ease-out;
}

.zone-highlight::before,
.zone-highlight::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 20px;
  background: linear-gradient(
    to right,
    var(--zone-highlight) 0%,
    transparent 100%
  );
}

.zone-highlight::before {
  left: -20px;
}

.zone-highlight::after {
  right: -20px;
  transform: scaleX(-1);
}
```

### 4.2 Zone Navigator Bar

```css
.zone-navigator {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--zone-nav-height);
  background: linear-gradient(to top, #1a1a1a 0%, #2d2d2d 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
  z-index: 100;
}

.zone-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  border-radius: 8px;
  background: #3d3d3d;
  border: none;
  color: white;
  cursor: pointer;
  transition: 
    background var(--duration-fast),
    transform var(--duration-fast);
}

.zone-button:hover {
  background: #4d4d4d;
  transform: translateY(-2px);
}

.zone-button--active {
  background: var(--control-active);
}

.zone-button__number {
  font-size: 14px;
  font-weight: 700;
}

.zone-button__frets {
  font-size: 10px;
  opacity: 0.8;
}

.zone-button__shape {
  font-size: 9px;
  opacity: 0.6;
}
```

---

## 5. Connection Lines (Voice Leading & Embellishments)

### 5.1 SVG Line Styles

```css
.connection-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 15;
}

.connection-line {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Voice leading connections */
.connection-voice-leading {
  stroke: var(--voice-leading-line);
  stroke-width: 2;
  stroke-dasharray: 8 4;
  animation: dash-flow 1s linear infinite;
}

@keyframes dash-flow {
  to {
    stroke-dashoffset: -12;
  }
}

/* Embellishment connections */
.connection-embellishment {
  stroke: var(--embellishment-line);
  stroke-width: 2;
  stroke-dasharray: 4 2;
}

/* Slide indicator */
.connection-slide {
  stroke: #9C27B0;
  stroke-width: 3;
  marker-end: url(#arrowhead);
}
```

### 5.2 Line Animation

```css
/* Draw-in animation for voice leading lines */
.connection-line--animate {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: draw-line 0.4s ease-out forwards;
}

@keyframes draw-line {
  to {
    stroke-dashoffset: 0;
  }
}

/* Pulse animation for active connection */
.connection-line--active {
  animation: line-pulse 2s ease-in-out infinite;
}

@keyframes line-pulse {
  0%, 100% { opacity: 0.6; stroke-width: 2; }
  50% { opacity: 1; stroke-width: 3; }
}
```

---

## 6. Control Panel Styling

### 6.1 Panel Container

```css
.control-panel {
  width: var(--control-panel-width);
  background: var(--control-bg);
  border-right: 1px solid var(--control-border);
  padding: var(--control-spacing);
  display: flex;
  flex-direction: column;
  gap: var(--control-spacing);
  overflow-y: auto;
  max-height: 100vh;
}

.control-section {
  background: var(--panel-bg);
  border-radius: var(--control-radius);
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.control-section__title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}
```

### 6.2 Key Selector

```css
.key-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.key-selector__row {
  display: flex;
  gap: 8px;
}

.key-dropdown {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--control-border);
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.key-dropdown:focus {
  outline: none;
  border-color: var(--control-active);
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.2);
}

.mode-toggle {
  display: flex;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--control-border);
}

.mode-toggle__button {
  padding: 10px 16px;
  border: none;
  background: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--duration-fast), color var(--duration-fast);
}

.mode-toggle__button:first-child {
  border-right: 1px solid var(--control-border);
}

.mode-toggle__button--active {
  background: var(--control-active);
  color: white;
}

.relative-key-hint {
  font-size: 12px;
  color: var(--text-secondary);
  padding: 8px;
  background: #F5F5F5;
  border-radius: 4px;
}
```

### 6.3 String Set Filter

```css
.string-set-filter {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.string-set-button {
  padding: 12px;
  border: 2px solid var(--control-border);
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all var(--duration-fast);
  text-align: center;
}

.string-set-button:hover {
  border-color: var(--control-active);
  background: rgba(33, 150, 243, 0.05);
}

.string-set-button--active {
  border-color: var(--control-active);
  background: rgba(33, 150, 243, 0.1);
}

.string-set-button__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.string-set-button__strings {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 4px;
}
```

### 6.4 Toggle Switches

```css
.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toggle-item__label {
  font-size: 13px;
  color: var(--text-primary);
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  background: #E0E0E0;
  border-radius: 12px;
  cursor: pointer;
  transition: background var(--duration-fast);
}

.toggle-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform var(--duration-fast);
}

.toggle-switch--active {
  background: var(--control-active);
}

.toggle-switch--active::after {
  transform: translateX(20px);
}
```

---

## 7. Information Panel Styling

### 7.1 Panel Container

```css
.info-panel {
  width: var(--info-panel-width);
  background: var(--panel-bg);
  border-left: 1px solid var(--control-border);
  display: flex;
  flex-direction: column;
}

.info-panel__tabs {
  display: flex;
  border-bottom: 1px solid var(--control-border);
}

.info-panel__tab {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color var(--duration-fast), border-color var(--duration-fast);
  border-bottom: 2px solid transparent;
}

.info-panel__tab:hover {
  color: var(--text-primary);
}

.info-panel__tab--active {
  color: var(--control-active);
  border-bottom-color: var(--control-active);
}

.info-panel__content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}
```

### 7.2 Position Details

```css
.position-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chord-header {
  text-align: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--control-border);
}

.chord-header__name {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
}

.chord-header__quality {
  font-size: 14px;
  color: var(--text-secondary);
}

.position-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.position-info__item {
  padding: 12px;
  background: #F5F5F5;
  border-radius: 8px;
}

.position-info__label {
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.position-info__value {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.note-breakdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.note-breakdown__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #FAFAFA;
  border-radius: 6px;
}

.note-breakdown__color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.note-breakdown__color--root { background: var(--note-root); }
.note-breakdown__color--third { background: var(--note-third-major); }
.note-breakdown__color--fifth { background: var(--note-fifth); }
```

---

## 8. Animations

### 8.1 Note Animations

```css
/* Note appear animation */
@keyframes note-appear {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.note--appear {
  animation: note-appear var(--duration-normal) cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

/* Note disappear animation */
@keyframes note-disappear {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
}

.note--disappear {
  animation: note-disappear var(--duration-fast) ease-in forwards;
}

/* Staggered appear for multiple notes */
.note--stagger-1 { animation-delay: 0ms; }
.note--stagger-2 { animation-delay: 50ms; }
.note--stagger-3 { animation-delay: 100ms; }
```

### 8.2 Zone Transition

```css
@keyframes zone-slide {
  from {
    opacity: 0;
    transform: translateX(var(--slide-direction, 20px));
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.zone-highlight--transition {
  animation: zone-slide var(--duration-slow) ease-out;
}
```

### 8.3 Voice Leading Animation

```css
@keyframes voice-leading-travel {
  0% {
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.voice-leading-indicator {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--voice-leading-line);
  animation: voice-leading-travel 1s ease-in-out;
  offset-path: path(var(--motion-path));
  offset-distance: 0%;
  animation: travel-path 1s ease-in-out forwards;
}

@keyframes travel-path {
  to {
    offset-distance: 100%;
  }
}
```

---

## 9. Responsive Breakpoints

### 9.1 Breakpoint Variables

```css
:root {
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1200px;
  --breakpoint-xxl: 1440px;
}
```

### 9.2 Responsive Layouts

```css
/* Desktop: Side panels visible */
@media (min-width: 1200px) {
  .app-layout {
    display: grid;
    grid-template-columns: var(--control-panel-width) 1fr var(--info-panel-width);
    height: 100vh;
  }
}

/* Tablet: Stacked layout */
@media (min-width: 768px) and (max-width: 1199px) {
  .app-layout {
    display: flex;
    flex-direction: column;
  }
  
  .control-panel {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    max-height: none;
    border-right: none;
    border-bottom: 1px solid var(--control-border);
  }
  
  .control-section {
    flex: 1;
    min-width: 200px;
  }
  
  .info-panel {
    width: 100%;
    border-left: none;
    border-top: 1px solid var(--control-border);
  }
}

/* Mobile: Minimal controls, rotatable fretboard */
@media (max-width: 767px) {
  :root {
    --note-size: 24px;
    --note-size-small: 18px;
    --note-size-ghost: 14px;
    --fret-base-width: 40px;
    --string-spacing: 32px;
  }
  
  .control-panel {
    position: fixed;
    bottom: var(--zone-nav-height);
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    max-height: 40vh;
    border-radius: 16px 16px 0 0;
    transform: translateY(calc(100% - 48px));
    transition: transform var(--duration-normal);
  }
  
  .control-panel--expanded {
    transform: translateY(0);
  }
  
  .control-panel__handle {
    width: 40px;
    height: 4px;
    background: #CCC;
    border-radius: 2px;
    margin: 12px auto;
  }
  
  .info-panel {
    display: none;
  }
  
  /* Suggest rotation for better experience */
  .rotate-prompt {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    background: #FFF3E0;
    color: #E65100;
    font-size: 12px;
  }
}

/* Landscape mobile: Good for fretboard */
@media (max-width: 767px) and (orientation: landscape) {
  .rotate-prompt {
    display: none;
  }
  
  .fretboard {
    height: 80vh;
  }
}
```

---

## 10. Accessibility

### 10.1 Focus States

```css
/* Visible focus for keyboard navigation */
.note:focus-visible,
.zone-button:focus-visible,
.toggle-switch:focus-visible,
.key-dropdown:focus-visible {
  outline: 3px solid var(--control-active);
  outline-offset: 2px;
}

/* Remove default focus ring */
.note:focus,
.zone-button:focus {
  outline: none;
}
```

### 10.2 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .note:hover {
    transform: translate(-50%, -50%);
  }
}
```

### 10.3 High Contrast Mode

```css
@media (prefers-contrast: high) {
  :root {
    --note-root: #FF0000;
    --note-third-major: #0000FF;
    --note-fifth: #00FF00;
    --note-pentatonic: #808080;
  }
  
  .note {
    border: 2px solid black;
  }
  
  .note-label {
    text-shadow: 
      -1px -1px 0 black,
      1px -1px 0 black,
      -1px 1px 0 black,
      1px 1px 0 black;
  }
}
```

---

## 11. Tailwind CSS Equivalents

If using Tailwind CSS, here are the equivalent utility classes for key styles:

```jsx
// Note - Root
<div className="absolute w-7 h-7 rounded-full bg-gradient-to-br from-red-400 to-red-600 
  shadow-lg shadow-red-500/50 ring-2 ring-red-500/30 flex items-center justify-center 
  text-white text-xs font-semibold -translate-x-1/2 -translate-y-1/2 cursor-pointer 
  transition-transform hover:scale-115 z-10" />

// Note - Pentatonic Ghost
<div className="absolute w-5 h-5 rounded-full bg-gray-400/40 border-2 border-dashed 
  border-gray-400 opacity-70 hover:opacity-100 z-5" />

// Zone Navigator Button
<button className="flex flex-col items-center px-4 py-2 rounded-lg bg-gray-700 
  text-white hover:bg-gray-600 transition-colors data-[active=true]:bg-blue-500" />

// Toggle Switch
<div className="relative w-11 h-6 bg-gray-300 rounded-full cursor-pointer 
  transition-colors data-[active=true]:bg-blue-500">
  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full 
    shadow transition-transform data-[active=true]:translate-x-5" />
</div>
```

---

*This CSS reference provides complete styling specifications for the Pentatonic Triad System. Customize colors and spacing as needed to match your existing application design system.*
