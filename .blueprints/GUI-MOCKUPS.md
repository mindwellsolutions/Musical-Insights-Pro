# GUI Mockups - Chord-Scale Recommendation System

## 🎨 Design Philosophy

**Modern • Sleek • Visually Striking • Consistent**

All components follow the existing webapp's design language:
- Card-based layouts with hover effects
- Smooth transitions and animations
- Responsive grid system (1-4 columns)
- Theme-aware colors (dark, light, midnight)
- Professional typography and spacing

---

## 📱 Component Mockups

### 1. ChordScaleRecommendations Component

**Context**: User has selected a chord (e.g., "Cmaj7") and wants to see compatible scales

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  🎵 Compatible Scales for Cmaj7                                        [▼] │
│  Click a scale to apply to the fretboard                                   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │ C Ionian      ⭐ │  │ C Lydian      ⭐ │  │ G Mixolydian  ⭐ │         │
│  │ (Major)      10.0│  │               9.0│  │               8.8│         │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤         │
│  │                  │  │                  │  │                  │         │
│  │ Perfect match    │  │ Bright & uplifting│ │ Jazzy sound     │         │
│  │                  │  │                  │  │                  │         │
│  │ Chord Tones:     │  │ Chord Tones:     │  │ Chord Tones:     │         │
│  │ [C] [E] [G] [B] │  │ [C] [E] [G] [B] │  │ [G] [B] [D] [F] │         │
│  │                  │  │                  │  │                  │         │
│  │ Tensions:        │  │ Tensions:        │  │ Tensions:        │         │
│  │ 9th, 13th        │  │ 9th, #11th, 13th │  │ 9th, 11th, 13th │         │
│  │                  │  │                  │  │                  │         │
│  │ 🎸 Jazz • Pop    │  │ 🎸 Fusion • Film │  │ 🎸 Jazz • Funk  │         │
│  │    R&B           │  │                  │  │                  │         │
│  │                  │  │                  │  │                  │         │
│  │ [Apply Scale]    │  │ [Apply Scale]    │  │ [Apply Scale]    │         │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘         │
│                                                                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │
│  │ D Dorian      ⭐ │  │ A Aeolian     ⭐ │  │ E Phrygian    ⭐ │         │
│  │               8.5│  │               8.0│  │               7.5│         │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤         │
│  │ Smooth & soulful │  │ Dark & moody     │  │ Spanish flavor   │         │
│  │ ... (similar)    │  │ ... (similar)    │  │ ... (similar)    │         │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘         │
│                                                                             │
│  [Show More Scales...]                                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Visual Details**:
- **Header**: Large, bold title with collapse arrow
- **Cards**: Rounded corners (12px), subtle shadow
- **Score Badge**: Circular, top-right, gradient background (green to yellow)
- **Note Badges**: Colored pills using NOTE_COLORS
- **Genre Tags**: Small, rounded, secondary background
- **Hover Effect**: Scale 1.02, shadow increase, slight lift
- **Selected State**: Green border glow, elevated shadow

---

### 2. ChordRecommendations Component

**Context**: User has selected C Major (Ionian) and wants chord suggestions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  🎸 Recommended Chords for C Major                                     [▼] │
│  Click a chord to highlight on the fretboard                               │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ▼ Diatonic Chords (Always Safe)                                           │
│                                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│  │    C    │ │   Dm    │ │   Em    │ │    F    │ │    G    │ │   Am    │ │
│  │    I    │ │   ii    │ │  iii    │ │   IV    │ │    V    │ │   vi    │ │
│  ├─────────┤ ├─────────┤ ├─────────┤ ├─────────┤ ├─────────┤ ├─────────┤ │
│  │ Tonic   │ │Sub-dom  │ │Mediant  │ │Sub-dom  │ │Dominant │ │Relative │ │
│  │         │ │         │ │         │ │         │ │         │ │ Minor   │ │
│  │ [C][E]  │ │ [D][F]  │ │ [E][G]  │ │ [F][A]  │ │ [G][B]  │ │ [A][C]  │ │
│  │ [G]     │ │ [A]     │ │ [B]     │ │ [C]     │ │ [D]     │ │ [E]     │ │
│  │         │ │         │ │         │ │         │ │         │ │         │ │
│  │ [+Song] │ │ [+Song] │ │ [+Song] │ │ [+Song] │ │ [+Song] │ │ [+Song] │ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │
│                                                                             │
│  ▼ Extended Chords (Jazz/Advanced)                                         │
│                                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐             │
│  │  Cmaj7  │ │  Dm7    │ │  Em7    │ │ Fmaj7   │ │   G7    │             │
│  │  Imaj7  │ │  iim7   │ │ iiim7   │ │ IVmaj7  │ │   V7    │             │
│  ├─────────┤ ├─────────┤ ├─────────┤ ├─────────┤ ├─────────┤             │
│  │ Jazzy   │ │ Smooth  │ │ Mellow  │ │ Bright  │ │ Tension │             │
│  │ tonic   │ │ pre-dom │ │         │ │         │ │         │             │
│  │ [C][E]  │ │ [D][F]  │ │ [E][G]  │ │ [F][A]  │ │ [G][B]  │             │
│  │ [G][B]  │ │ [A][C]  │ │ [B][D]  │ │ [C][E]  │ │ [D][F]  │             │
│  │         │ │         │ │         │ │         │ │         │             │
│  │ [+Song] │ │ [+Song] │ │ [+Song] │ │ [+Song] │ │ [+Song] │             │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘             │
│                                                                             │
│  ▼ Modal Interchange (Color Chords)                                        │
│                                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                          │
│  │   Bb    │ │   Fm    │ │   Ab    │ │   Eb    │                          │
│  │  bVII   │ │   iv    │ │  bVI    │ │  bIII   │                          │
│  ├─────────┤ ├─────────┤ ├─────────┤ ├─────────┤                          │
│  │ Bluesy  │ │ Dark    │ │ Dramatic│ │ Bright  │                          │
│  │ flavor  │ │ color   │ │         │ │ lift    │                          │
│  │ From:   │ │ From:   │ │ From:   │ │ From:   │                          │
│  │ Mixo    │ │ Aeolian │ │ Aeolian │ │ Phrygian│                          │
│  │         │ │         │ │         │ │         │                          │
│  │ [+Song] │ │ [+Song] │ │ [+Song] │ │ [+Song] │                          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Visual Details**:
- **Three Sections**: Collapsible with arrow indicators
- **Chord Cards**: Compact, square-ish (not too wide)
- **Roman Numerals**: Large, centered, secondary color
- **Function Labels**: Small text below roman numeral
- **Note Display**: Horizontal row of colored note badges
- **Add Button**: Small, bottom of card, accent color
- **Grid**: 6 columns on desktop, 3 on tablet, 2 on mobile

---

### 3. ChordProgressionRecommendations Component

**Context**: User wants to browse and load common chord progressions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  🎼 Common Chord Progressions in C                                     [▼] │
│  Load a progression to add all chords to your song                         │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Filters:  [All Genres ▼]  [All Difficulties ▼]  [Sort: Popular ▼]        │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                       │ │
│  │  I-IV-V-I (The Foundation)                              ★☆☆☆☆       │ │
│  │  The foundation of rock, blues, and country music                    │ │
│  │                                                                       │ │
│  │  ┌───┐  ┌───┐  ┌───┐  ┌───┐                                         │ │
│  │  │ C │ → │ F │ → │ G │ → │ C │                                       │ │
│  │  │ I │  │IV │  │ V │  │ I │                                         │ │
│  │  └───┘  └───┘  └───┘  └───┘                                         │ │
│  │                                                                       │ │
│  │  🎸 Rock • Blues • Country • Folk Rock                               │ │
│  │  🎵 La Bamba, Twist and Shout, Wild Thing, Louie Louie              │ │
│  │                                                                       │ │
│  │  💡 Tip: Perfect for beginners. Can be enhanced with 7th chords.     │ │
│  │                                                                       │ │
│  │  [Load Progression]  [View Scale Recommendations ▼]                  │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                                                                       │ │
│  │  I-V-vi-IV (Axis Progression)                           ★☆☆☆☆       │ │
│  │  The most popular pop progression of all time                        │ │
│  │                                                                       │ │
│  │  ┌───┐  ┌───┐  ┌───┐  ┌───┐                                         │ │
│  │  │ C │ → │ G │ → │Am │ → │ F │                                       │ │
│  │  │ I │  │ V │  │vi │  │IV │                                         │ │
│  │  └───┘  └───┘  └───┘  └───┘                                         │ │
│  │                                                                       │ │
│  │  🎸 Pop • Rock • Indie • Alternative                                 │ │
│  │  🎵 Let It Be, No Woman No Cry, Someone Like You                     │ │
│  │                                                                       │ │
│  │  💡 Tip: Try varying rhythm or adding 7ths for freshness.            │ │
│  │                                                                       │ │
│  │  [Load Progression]  [View Scale Recommendations ▼]                  │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  [Show More Progressions...]                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Visual Details**:
- **Large Cards**: Full-width, generous padding
- **Progression Name**: Large, bold header
- **Difficulty Stars**: Visual rating (1-5 stars)
- **Chord Flow**: Horizontal boxes with arrows
- **Genre Tags**: Pill-shaped, colorful
- **Famous Songs**: Italic, secondary color
- **Tips**: Light bulb icon, helpful context
- **Expandable**: Show/hide scale recommendations
- **Load Button**: Primary action, accent color

---

### 4. DynamicRecommendationPanel Component

**Context**: User is navigating through their "Add to Song" list, system provides context-aware suggestions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  🧠 Smart Recommendations                                              [▼] │
│  Based on your current progression                                         │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📍 Current Position: 2 of 5                                               │
│                                                                             │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐     │
│  │    C    │ → │   Dm    │ → │    ?    │   │         │   │         │     │
│  │  Major  │   │ Dorian  │   │         │   │         │   │         │     │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘     │
│      Past        Current        Next                                       │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🎯 Next Chord Suggestions                                                 │
│                                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │    F     │  │    G     │  │   Am     │  │   Em     │                   │
│  │   85%    │  │   75%    │  │   60%    │  │   45%    │                   │
│  ├──────────┤  ├──────────┤  ├──────────┤  ├──────────┤                   │
│  │   IV     │  │    V     │  │   vi     │  │  iii     │                   │
│  │ Sub-dom  │  │ Dominant │  │ Relative │  │ Mediant  │                   │
│  │          │  │          │  │  minor   │  │          │                   │
│  │ [Select] │  │ [Select] │  │ [Select] │  │ [Select] │                   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🎵 Compatible Scales for Dm                                               │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                     │
│  │ D Dorian  ⭐ │  │ D Aeolian ⭐ │  │ C Ionian  ⭐ │                     │
│  │          10.0│  │           9.0│  │           9.5│                     │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤                     │
│  │ Perfect for  │  │ Darker sound │  │ Parent scale │                     │
│  │ ii chord     │  │              │  │              │                     │
│  │              │  │              │  │              │                     │
│  │ [Apply]      │  │ [Apply]      │  │ [Apply]      │                     │
│  └──────────────┘  └──────────────┘  └──────────────┘                     │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  📊 Progression Analysis                                                   │
│                                                                             │
│  Type: I-ii (Common in Jazz)                                               │
│  Strength: ████████░░ 8/10                                                 │
│                                                                             │
│  💡 Suggestion: Add V chord (G) for strong resolution back to I            │
│                                                                             │
│  🎼 Similar Progressions:                                                  │
│  • I-ii-V-I (Jazz standard)                                                │
│  • I-ii-iii-IV (Ascending progression)                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Visual Details**:
- **Position Indicator**: Visual timeline showing current position
- **Probability Bars**: Percentage-based recommendations
- **Compact Cards**: Smaller than main recommendation cards
- **Progress Bar**: Visual strength indicator
- **Suggestions**: Light bulb icon, actionable advice
- **Similar Progressions**: Quick links to related patterns
- **Real-time Updates**: Smooth transitions on navigation

---

## 🎨 Color Palette (Theme-Aware)

### Dark Theme
```css
--bg-primary: #0a0a0a
--bg-secondary: #1a1a1a
--bg-tertiary: #2a2a2a
--text-primary: #ffffff
--text-secondary: #a0a0a0
--border: #3a3a3a
--button-primary: #22c55e (green)
--accent-primary: #3b82f6 (blue)
--accent-secondary: #f59e0b (amber)
```

### Light Theme
```css
--bg-primary: #ffffff
--bg-secondary: #f5f5f5
--bg-tertiary: #e5e5e5
--text-primary: #0a0a0a
--text-secondary: #6a6a6a
--border: #d0d0d0
--button-primary: #22c55e (green)
--accent-primary: #3b82f6 (blue)
--accent-secondary: #f59e0b (amber)
```

### Midnight Theme
```css
--bg-primary: #0f172a
--bg-secondary: #1e293b
--bg-tertiary: #334155
--text-primary: #f1f5f9
--text-secondary: #94a3b8
--border: #475569
--button-primary: #22c55e (green)
--accent-primary: #3b82f6 (blue)
--accent-secondary: #f59e0b (amber)
```

---

## 🎯 Interactive States

### Card States

**Default**:
```css
background: theme.bgTertiary
border: 2px solid theme.border
box-shadow: 0 2px 4px rgba(0,0,0,0.1)
transform: scale(1)
```

**Hover**:
```css
background: theme.bgTertiary
border: 2px solid theme.border
box-shadow: 0 4px 12px rgba(0,0,0,0.15)
transform: translateY(-2px) scale(1.02)
transition: all 0.3s ease
cursor: pointer
```

**Selected**:
```css
background: theme.bgTertiary
border: 2px solid theme.buttonPrimary
box-shadow: 0 0 20px rgba(34, 197, 94, 0.3)
transform: translateY(-4px)
```

**Active (Click)**:
```css
transform: translateY(-1px) scale(0.98)
transition: all 0.1s ease
```

### Button States

**Primary Button**:
```css
background: theme.buttonPrimary
color: white
padding: 10px 20px
border-radius: 8px
font-weight: 600
transition: all 0.2s ease

hover:
  background: lighten(theme.buttonPrimary, 10%)
  box-shadow: 0 4px 8px rgba(34, 197, 94, 0.3)
  transform: translateY(-1px)
```

**Secondary Button**:
```css
background: transparent
color: theme.textPrimary
border: 2px solid theme.border
padding: 10px 20px
border-radius: 8px
font-weight: 600
transition: all 0.2s ease

hover:
  border-color: theme.buttonPrimary
  color: theme.buttonPrimary
```

---

## 📐 Spacing & Typography

### Spacing Scale
```css
--space-xs: 4px
--space-sm: 8px
--space-md: 16px
--space-lg: 24px
--space-xl: 32px
--space-2xl: 48px
```

### Typography Scale
```css
--text-xs: 11px
--text-sm: 13px
--text-base: 15px
--text-lg: 18px
--text-xl: 22px
--text-2xl: 28px
--text-3xl: 36px
```

### Font Weights
```css
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

---

## 🔄 Animations

### Card Entrance
```css
@keyframes cardEntrance {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  animation: cardEntrance 0.3s ease-out;
}
```

### Score Badge Pulse
```css
@keyframes scorePulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.score-badge {
  animation: scorePulse 2s ease-in-out infinite;
}
```

### Loading Skeleton
```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    theme.bgSecondary 0%,
    theme.bgTertiary 50%,
    theme.bgSecondary 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 767px) {
  .recommendation-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .card {
    padding: 16px;
  }

  .text-lg {
    font-size: 16px;
  }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  .recommendation-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .card {
    padding: 20px;
  }
}

/* Desktop */
@media (min-width: 1024px) and (max-width: 1279px) {
  .recommendation-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  .card {
    padding: 24px;
  }
}

/* Large Desktop */
@media (min-width: 1280px) {
  .recommendation-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }

  .card {
    padding: 24px;
  }
}
```

---

## 🎨 Note Color System

Using existing `NOTE_COLORS` from `lib/musicTheory.ts`:

```typescript
const NOTE_COLORS = {
  'C': '#ef4444',   // Red
  'C#': '#f97316',  // Orange
  'D': '#f59e0b',   // Amber
  'D#': '#eab308',  // Yellow
  'E': '#84cc16',   // Lime
  'F': '#22c55e',   // Green
  'F#': '#10b981',  // Emerald
  'G': '#14b8a6',   // Teal
  'G#': '#06b6d4',  // Cyan
  'A': '#0ea5e9',   // Sky
  'A#': '#3b82f6',  // Blue
  'B': '#6366f1',   // Indigo
};
```

**Note Badge Component**:
```tsx
<div
  className="note-badge"
  style={{
    backgroundColor: NOTE_COLORS[note],
    color: '#ffffff',
    padding: '4px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    display: 'inline-block',
    margin: '2px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  }}
>
  {getNoteDisplayName(note)}
</div>
```

---

## ✨ Special Effects

### Glow Effect (Selected State)
```css
.card.selected {
  box-shadow:
    0 0 20px rgba(34, 197, 94, 0.3),
    0 0 40px rgba(34, 197, 94, 0.2),
    0 0 60px rgba(34, 197, 94, 0.1);
}
```

### Gradient Backgrounds (Score Badges)
```css
.score-badge {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  /* High score: Green gradient */
}

.score-badge.medium {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  /* Medium score: Amber gradient */
}

.score-badge.low {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  /* Low score: Red gradient */
}
```

### Blur Backdrop (Modals/Overlays)
```css
.modal-backdrop {
  backdrop-filter: blur(8px);
  background: rgba(0, 0, 0, 0.5);
}
```

---

**End of GUI Mockups**


