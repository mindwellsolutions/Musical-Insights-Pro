# 🎨 Visual Mockups - Before & After Comparison

## 📸 Current State (BEFORE)

### Issues Visible in Screenshots:

```
┌─────────────────────────────────────────────────────────────┐
│ Chord Progression Builder                                   │
├─────────────────────────────────────────────────────────────┤
│ [1: Verse (C)] [2: Chorus (F)] [+]                         │
├─────────────────────────────────────────────────────────────┤
│ Zoom: [-] 100% [+]                                          │
├─────────────────────────────────────────────────────────────┤
│ 1    2    3    4    5    6    7    8                       │
│ ┌────────────────────────────────────────────────────────┐ │
│ │🎸 Chords                                                │ │
│ │[C──] [G──] [Am─] [F──]  ← HIDDEN BEHIND LABEL!        │ │
│ └────────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────┐ │
│ │🎼 Scales                                                │ │
│ │[C Ionian] [G Mixolydian]  ← HIDDEN BEHIND LABEL!      │ │
│ └────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ▶ Play  BPM: 120  Instrument: Piano                        │
├─────────────────────────────────────────────────────────────┤
│ Chord Progression Generator (TAKES TOO MUCH SPACE)         │
│ [Genre-Based] [AI-Powered]                                  │
│ Genre: [Pop ▼]  Complexity: [Medium ▼]                     │
│ [Generate Progression]                                      │
└─────────────────────────────────────────────────────────────┘
```

### Problems:
❌ Timeline starts at x=0, overlapping with track labels  
❌ No "+ Add Chord" button  
❌ Basic, unstyled appearance  
❌ Generator takes too much vertical space  
❌ No track controls (mute/solo)  
❌ Poor visual hierarchy  

---

## ✨ New Design (AFTER)

### Fixed Layout with Professional Styling:

```
┌─────────────────────────────────────────────────────────────┐
│ 🎵 Chord Progression Builder          [Save] [Load] [Export]│
│ Project: "My Song"                                      [?] │
├─────────────────────────────────────────────────────────────┤
│ [1: Verse (C)] [2: Chorus (F)] [3: Bridge (Am)] [+]        │
├─────────────┬───────────────────────────────────────────────┤
│ TRACK       │ 1    2    3    4    5    6    7    8         │
│ SIDEBAR     ├───────────────────────────────────────────────┤
│             │                                               │
│ 🎸 Chords   │ [C──] [G──] [Am─] [F──] [+Add]              │
│ ┌─┐┌─┐┌─┐  │                                               │
│ │+││M││S│  │ ← Timeline starts HERE, to the right!         │
│ └─┘└─┘└─┘  │                                               │
│             ├───────────────────────────────────────────────┤
│ 🎼 Scales   │                                               │
│ ┌─┐┌─┐┌─┐  │ [C Ionian────] [G Mixolydian──] [+Add]      │
│ │+││M││S│  │                                               │
│ └─┘└─┘└─┘  │                                               │
└─────────────┴───────────────────────────────────────────────┤
│ ▶ Play  ⏸ Pause  ⏹ Stop  🔁 Replay                        │
│ BPM: [120]  Key: C  Instrument: [Piano ▼]                  │
├─────────────────────────────────────────────────────────────┤
│ ▲ Chord Progression Generator (Collapsed)                  │
└─────────────────────────────────────────────────────────────┘
```

### Improvements:
✅ Fixed sidebar (200px) with track labels  
✅ Timeline starts to the RIGHT of sidebar  
✅ "+ Add Chord" buttons on tracks  
✅ Mute/Solo controls for each track  
✅ Generator collapsed by default  
✅ Professional visual hierarchy  

---

## 🎨 Chord Card Comparison

### BEFORE:
```
┌──────┐
│  C   │  ← Plain, flat, no depth
└──────┘
```

### AFTER:
```
┌──────────────────┐
│ ⋮⋮      C        │  ← Gradient background
│                  │  ← Glow effect on hover
│              ◀▶  │  ← Resize handles
└──────────────────┘
```

**Visual Enhancements**:
- Gradient: `linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)`
- Shadow: `0 4px 6px rgba(0, 0, 0, 0.4)`
- Glow on hover: `0 0 20px rgba(59, 130, 246, 0.4)`
- Drag handle (left): `⋮⋮`
- Resize handles (bottom): `◀ ▶`

---

## 🎯 Playback Cursor Comparison

### BEFORE:
```
│  ← Simple line, no visual impact
```

### AFTER:
```
▼  ← Triangle indicator
│  ← Glowing blue line
│  ← Pulse animation during playback
```

**Visual Enhancements**:
- Color: `linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)`
- Glow: `0 0 20px rgba(59, 130, 246, 0.6)`
- Triangle: `border-top: 8px solid #3b82f6`
- Animation: Pulse effect during playback

---

## 📏 Time Ruler Comparison

### BEFORE:
```
1    2    3    4    5    6    7    8
│    │    │    │    │    │    │    │
```

### AFTER:
```
┌────────────────────────────────────┐
│ 1    2    3    4    5    6    7    8 │  ← Enhanced styling
│ │    │    │    │    │    │    │    │ │  ← Better markers
│ 0:00 0:02 0:04 0:06 0:08 0:10 0:12  │  ← Time display
└────────────────────────────────────┘
```

**Visual Enhancements**:
- Background: `linear-gradient(180deg, #0f0f0f 0%, #141414 100%)`
- Border: `2px solid #2a2a2a`
- Shadow: `0 2px 8px rgba(0, 0, 0, 0.3)`
- Bar markers: `2px solid #4a4a4a`
- Beat markers: `1px solid #2a2a2a`
- Time labels: Minutes:seconds format

---

## 🎼 Add Chord Modal (NEW)

```
┌──────────────────────────────────────────────────────────────┐
│ Add Chord to Progression                                 [×] │
├──────────────────────────────────────────────────────────────┤
│ ┌────────────┬───────────────────────────────────────────┐  │
│ │ CATEGORIES │ CHORD LIBRARY                             │  │
│ │            │                                           │  │
│ │ ▸ Triads   │ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐     │  │
│ │ ▾ 7th      │ │ C7 │ │ D7 │ │ E7 │ │ F7 │ │ G7 │     │  │
│ │   Major 7  │ └────┘ └────┘ └────┘ └────┘ └────┘     │  │
│ │   Minor 7  │                                           │  │
│ │   Dom 7    │ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐     │  │
│ │ ▸ Extended │ │ A7 │ │ B7 │ │Cm7 │ │Dm7 │ │Em7 │     │  │
│ │ ▸ Altered  │ └────┘ └────┘ └────┘ └────┘ └────┘     │  │
│ │ ▸ Sus      │                                           │  │
│ └────────────┴───────────────────────────────────────────┘  │
│                                                              │
│ [Search chords...]                                           │
│                                                              │
│ Duration: [1 beat ▼]  Position: [At end ▼]                 │
│                                                              │
│                                    [Cancel]  [Add Chord]    │
└──────────────────────────────────────────────────────────────┘
```

**Features**:
- Categorized chord library (Triads, 7th, Extended, Altered, Sus)
- Visual chord cards with hover effects
- Search functionality
- Duration selector (1-16 beats)
- Position selector (at end, at cursor, at specific beat)

---

## 🎛️ Track Sidebar (NEW)

```
┌─────────────────┐
│ 🎸 Chord Track  │  ← Track name with icon
│ ┌─┐ ┌─┐ ┌─┐    │
│ │+│ │M│ │S│    │  ← Add, Mute, Solo controls
│ └─┘ └─┘ └─┘    │
├─────────────────┤
│ 🎼 Scale Track  │
│ ┌─┐ ┌─┐ ┌─┐    │
│ │+│ │M│ │S│    │
│ └─┘ └─┘ └─┘    │
└─────────────────┘
```

**Features**:
- Fixed width: 200px
- Always visible (doesn't scroll)
- Add button (+): Opens chord/scale selector
- Mute button (M): Mutes track playback
- Solo button (S): Solos track (mutes others)
- Visual feedback for active states

---

## 🎚️ Generator Panel States

### Collapsed (40px):
```
┌──────────────────────────────────────────────────────────────┐
│ ▲ Chord Progression Generator                                │
└──────────────────────────────────────────────────────────────┘
```

### Expanded (300px):
```
┌──────────────────────────────────────────────────────────────┐
│ ▼ Chord Progression Generator                                │
├──────────────────────────────────────────────────────────────┤
│ [Genre-Based] [AI-Powered]                                   │
│                                                               │
│ Genre: [Pop ▼]  Complexity: [Medium ▼]                      │
│ Length: [8 bars ▼]                                           │
│                                                               │
│ [Generate Progression]                                        │
│                                                               │
│ Recent Generations:                                           │
│ • I-V-vi-IV (Pop progression)                                │
│ • ii-V-I (Jazz progression)                                  │
└──────────────────────────────────────────────────────────────┘
```

**Features**:
- Smooth expand/collapse animation (0.3s cubic-bezier)
- Persistent state (localStorage)
- Keyboard shortcut (Ctrl+G to toggle)
- Minimize button
- Doesn't interfere with timeline

---

## 🎨 Color-Coded Chords

### Chord Type Colors:

```
┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│   C    │  │   Cm   │  │   C7   │  │  Cmaj7 │
│  Blue  │  │ Purple │  │ Amber  │  │  Cyan  │
└────────┘  └────────┘  └────────┘  └────────┘
 Major       Minor       Dom 7       Maj 7

┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│  Cm7   │  │  Cdim  │  │  Caug  │  │  Csus4 │
│ Purple │  │  Red   │  │ Orange │  │ Green  │
└────────┘  └────────┘  └────────┘  └────────┘
 Min 7       Dim         Aug         Sus
```

**Color System**:
- **Major**: Blue (#3b82f6) - Bright, stable
- **Minor**: Purple (#8b5cf6) - Cooler, subdued
- **Dominant 7**: Amber (#f59e0b) - Energetic, tension
- **Major 7**: Cyan (#06b6d4) - Sophisticated, jazzy
- **Minor 7**: Purple-pink (#a855f7) - Smooth, mellow
- **Diminished**: Red (#ef4444) - Dark, tense
- **Augmented**: Orange (#f97316) - Bright, unstable
- **Sus**: Green (#22c55e) - Neutral, open

---

*Visual mockups created: 2026-01-13*  
*For full implementation details, see: chord-progression-builder-redesign-v2.md*


