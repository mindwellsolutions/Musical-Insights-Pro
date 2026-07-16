# Song Builder Triads & CAGED - UI Mockup

## Full Layout Mockup

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ CHORD PROGRESSION BUILDER                                                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                                                       │
│ │  1  │ │  2  │ │  3  │ │  4  │  ← Verse Tabs                                         │
│ │Verse│ │Verse│ │Verse│ │ +   │                                                       │
│ └─────┘ └─────┘ └─────┘ └─────┘                                                       │
│                                                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ TIMELINE                                                                                │
│ ┌───────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Chords │ ┌──C──┐ ┌──Am─┐ ┌──F──┐ ┌──G──┐                                         │ │
│ │        │ │     │ │     │ │     │ │     │                                         │ │
│ │────────┼─┴─────┴─┴─────┴─┴─────┴─┴─────┴─────────────────────────────────────────│ │
│ │ Scales │   ┌─C Major──────────┐   ┌─F Major──┐                                   │ │
│ │        │   │                  │   │          │                                   │ │
│ └────────┴───┴──────────────────┴───┴──────────┴───────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ PLAY SONG TAB                                                                           │
│                                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│ │ Song Chord Progression                                                          │   │
│ │                                                                                 │   │
│ │ ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                                        │   │
│ │ │  C   │  │  Am  │  │  F   │  │  G   │  ← Colorful chord buttons              │   │
│ │ │  ▼   │  │  ▼   │  │  ▼   │  │  ▼   │     with dropdown arrows                │   │
│ │ └──────┘  └──────┘  └──────┘  └──────┘                                        │   │
│ │  4 beats  4 beats   4 beats   4 beats  ← Duration display                     │   │
│ │                                                                                 │   │
│ │ Nearby Diatonic Chords                                                          │   │
│ │ ┌──────┐  ┌──────┐  ┌──────┐                                                  │   │
│ │ │  Dm  │  │  Em  │  │ Bdim │  ← Ghosted/faded nearby chords                   │   │
│ │ └──────┘  └──────┘  └──────┘                                                  │   │
│ └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│ │ 🎸 1st Fretboard - Triads & Nearby Neighborhood                                │   │
│ │ Position: C Major - CAGED Shape: C                                             │   │
│ │                                                                                 │   │
│ │    E ─●─────●─────●─────●─────●─────●─────●─────●─────●─────●─────●─────●──   │   │
│ │    B ─●─────●─────●─────●─────●─────●─────●─────●─────●─────●─────●─────●──   │   │
│ │    G ─●─────●─────●─────●─────●─────●─────●─────●─────●─────●─────●─────●──   │   │
│ │    D ─●─────●─────●─────●─────●─────●─────●─────●─────●─────●─────●─────●──   │   │
│ │    A ─●─────●─────●─────●─────●─────●─────●─────●─────●─────●─────●─────●──   │   │
│ │    E ─●─────●─────●─────●─────●─────●─────●─────●─────●─────●─────●─────●──   │   │
│ │      0  1  2  3  4  5  6  7  8  9  10 11 12                                    │   │
│ │                                                                                 │   │
│ │    [CAGED overlay regions highlighted in background]                           │   │
│ │    ● = Triad positions (clickable)                                             │   │
│ │    ○ = Nearby chord positions (ghosted)                                        │   │
│ └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│ │ 🎵 2nd Fretboard - Associated Scales (CAGED Filtered)                          │   │
│ │ Scale: C Major - Filtered by CAGED Shape: C                                    │   │
│ │                                                                                 │   │
│ │    E ─●─────●─────●─────●─────●─────●─────●─────●─────●─────●─────●─────●──   │   │
│ │    B ─●─────●─────●─────●─────●─────●─────●─────●─────●─────●─────●─────●──   │   │
│ │    G ─●─────●─────●─────●─────●─────●─────●─────●─────●─────●─────●─────●──   │   │
│ │    D ─●─────●─────●─────●─────●─────●─────●─────●─────●─────●─────●─────●──   │   │
│ │    A ─●─────●─────●─────●─────●─────●─────●─────●─────●─────●─────●─────●──   │   │
│ │    E ─●─────●─────●─────●─────●─────●─────●─────●─────●─────●─────●─────●──   │   │
│ │      0  1  2  3  4  5  6  7  8  9  10 11 12                                    │   │
│ │                                                                                 │   │
│ │    [CAGED overlay regions matching 1st fretboard]                              │   │
│ │    ● = Scale notes (only in CAGED regions)                                     │   │
│ │    Numbers inside = Scale degrees (1, 2, 3, etc.)                              │   │
│ └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

## Chord Button Detail

```
┌──────────────────┐
│       C          │  ← Chord symbol (large, bold, white)
│                  │
│       ▼          │  ← Dropdown arrow (bottom-right)
└──────────────────┘
    4 beats           ← Duration (small, gray, below button)

States:
- Normal: Blue gradient background
- Hovered: Slightly larger, brighter glow
- Selected: Larger scale (1.1x), bright border
- Playing: Pulsing animation
```

## Chord Button Colors (by root note)

```
C  → Blue gradient (#3b82f6 → #1d4ed8)
C# → Purple gradient (#8b5cf6 → #6d28d9)
D  → Green gradient (#10b981 → #059669)
D# → Teal gradient (#14b8a6 → #0d9488)
E  → Yellow gradient (#f59e0b → #d97706)
F  → Orange gradient (#f97316 → #ea580c)
F# → Red gradient (#ef4444 → #dc2626)
G  → Pink gradient (#ec4899 → #db2777)
G# → Indigo gradient (#6366f1 → #4f46e5)
A  → Cyan gradient (#06b6d4 → #0891b2)
A# → Lime gradient (#84cc16 → #65a30d)
B  → Amber gradient (#f59e0b → #d97706)
```

## Triad Position Marker Detail

```
Normal Position:
    ●  ← Filled circle, color based on CAGED shape or position

Hovered Position:
    ◉  ← Larger circle with glow effect

Selected Position:
    ⊙  ← Circle with bright border ring, largest size

Nearby Chord Position:
    ○  ← Hollow circle, faded/ghosted
```

## CAGED Overlay Visual

```
┌─────────────────────────────────────────────────────────────┐
│ Fretboard with CAGED regions                                │
│                                                              │
│    ┌─────C Shape─────┐  ┌─────A Shape─────┐                │
│    │                 │  │                 │                │
│ E ─┼─●───●───●───●───┼──┼─●───●───●───●───┼──              │
│ B ─┼─●───●───●───●───┼──┼─●───●───●───●───┼──              │
│ G ─┼─●───●───●───●───┼──┼─●───●───●───●───┼──              │
│ D ─┼─●───●───●───●───┼──┼─●───●───●───●───┼──              │
│ A ─┼─●───●───●───●───┼──┼─●───●───●───●───┼──              │
│ E ─┼─●───●───●───●───┼──┼─●───●───●───●───┼──              │
│    └─────────────────┘  └─────────────────┘                │
│                                                              │
│ Background: Semi-transparent colored regions                │
│ Border: Brighter colored borders                            │
│ Label: Shape name in top-left corner                        │
└─────────────────────────────────────────────────────────────┘
```

## Voicing Selector Modal

```
┌─────────────────────────────────────────────────────────────────────┐
│ Select Voicing for C                                          [X]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─────────────┐  ┌─────────────────────────────────────────────┐  │
│ │ Categories  │  │ Voicings                                    │  │
│ │             │  │                                             │  │
│ │ ● Triads    │  │ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐            │  │
│ │   7th       │  │ │ C │ │ C │ │ C │ │ C │ │ C │            │  │
│ │   9th       │  │ │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │            │  │
│ │   Extended  │  │ └───┘ └───┘ └───┘ └───┘ └───┘            │  │
│ │             │  │                                             │  │
│ │ CAGED:      │  │ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐            │  │
│ │ ☑ C Shape   │  │ │ C │ │ C │ │ C │ │ C │ │ C │            │  │
│ │ ☑ A Shape   │  │ │ 6 │ │ 7 │ │ 8 │ │ 9 │ │10 │            │  │
│ │ ☑ G Shape   │  │ └───┘ └───┘ └───┘ └───┘ └───┘            │  │
│ │ ☑ E Shape   │  │                                             │  │
│ │ ☑ D Shape   │  │ ... (more voicings)                        │  │
│ └─────────────┘  └─────────────────────────────────────────────┘  │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ Preview                                                     │   │
│ │                                                             │   │
│ │     [Large chord diagram of selected voicing]              │   │
│ │                                                             │   │
│ │     Position: Fret 3-5                                      │   │
│ │     Difficulty: ●●○○○                                       │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│                                    [Cancel]  [Select Voicing]      │
└─────────────────────────────────────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (1920px+)
- Full layout as shown above
- Sidebar visible on right
- Both fretboards side-by-side (optional)

### Laptop (1280px - 1920px)
- Fretboards stacked vertically
- Sidebar collapsible
- Chord buttons in single row with scroll

### Tablet (800px - 1280px)
- Fretboards stacked
- Sidebar hidden by default
- Chord buttons wrap to multiple rows

### Mobile (< 800px)
- Not recommended
- Show message to use larger screen

