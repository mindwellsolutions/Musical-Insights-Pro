# Fretboard Example — A Aeolian Triads in Scale

Self-contained Next.js app that renders the **Musical Insights Pro** fretboard
with **A Aeolian** in **Triads in Scale** mode (Position I highlighted).

## Purpose

Copy this folder to another system for graphical upgrades, then migrate the
improved files back to the main project.

## Quick Start

```bash
npm install
npm run dev
# → http://localhost:3000
```

## What you see

**Top section — Triads in Scale (Focus Mode)**
- Position I (Am) triad notes at **full brightness** with interval-coloured borders:
  - Root (A) → Red border
  - Minor 3rd (C) → Gold border
  - Perfect 5th (E) → Green border
- All other A Aeolian scale notes **dimmed to 30% opacity**

**Bottom section — Arc Band View**
- All 7 diatonic triads shown at once
- Coloured band segments at the bottom of each note circle show which triads
  that note belongs to (one segment per triad, using TRIAD_PALETTE colours)

## Files to upgrade for graphical improvements

| File | What it controls |
|------|-----------------|
| `components/Fretboard.tsx` → `NoteCircle` | Note dot shape, size, glow, border, opacity, arc band |
| `components/TriadArcBandSegments.tsx` | The coloured band at the bottom of each note circle |

## Migrating back to main project

After upgrading, copy:
- `components/Fretboard.tsx` → main project `components/Fretboard.tsx`
- `components/TriadArcBandSegments.tsx` → main project `components/scale-triads/TriadArcBandSegments.tsx`

The `musicTheory.ts` in this example is a slim inline copy — the main project's
`lib/musicTheory.ts` and `lib/music-theory/triad-membership/index.ts` are the
source of truth and do not need to change for graphical-only upgrades.

## Data flow

```
app/page.tsx
  ├── calculateScalePositions('A', 'Aeolian', tuning)  → NotePosition[]
  ├── computeDiatonicTriads('A', 'Aeolian')            → DiatonicTriad[]
  ├── computeTriadMembership(triads)                   → membership map
  └── attaches triadMembership to each NotePosition
          ↓
      Fretboard.tsx
          ↓
      NoteCircle — renders each dot
          ↓
      TriadArcBandSegments — renders colour bands
```
