# Detailed Fix Guide - Exact Code Changes

## File 1: components/chord-progression/TriadFretboard.tsx

### Fix 1.1: Add `allPositions` to ChordInZone interface (Line 18-22)

**BEFORE:**
```typescript
interface ChordInZone {
  chord: ChordInstance;
  isPlayableInZone: boolean;
  positionsInZone: TriadPosition[];
}
```

**AFTER:**
```typescript
interface ChordInZone {
  chord: ChordInstance;
  isPlayableInZone: boolean;
  positionsInZone: TriadPosition[];
  allPositions: TriadPosition[];
}
```

---

### Fix 1.2: Add `isRoot` property to NotePosition objects (Lines 118, 167)

**Line 118 - BEFORE:**
```typescript
position: {
  stringIndex: sp.stringIndex,
  fretNumber: sp.fret,
  note: sp.note,
},
```

**Line 118 - AFTER:**
```typescript
position: {
  stringIndex: sp.stringIndex,
  fretNumber: sp.fret,
  note: sp.note,
  isRoot: sp.chordTone === 'root',
},
```

**Line 167 - BEFORE:**
```typescript
return {
  stringIndex: sp.stringIndex,
  fretNumber: sp.fret,
  note: sp.note,
};
```

**Line 167 - AFTER:**
```typescript
return {
  stringIndex: sp.stringIndex,
  fretNumber: sp.fret,
  note: sp.note,
  isRoot: sp.chordTone === 'root',
};
```

---

### Fix 1.3: Add type annotations to prevent 'any' type (Lines 107, 108, 139, 147, 154, 234, 240)

**Line 107 - BEFORE:**
```typescript
item.allPositions.forEach(triadPos => {
  triadPos.stringPositions.forEach(sp => {
```

**Line 107 - AFTER:**
```typescript
item.allPositions.forEach((triadPos: TriadPosition) => {
  triadPos.stringPositions.forEach((sp: any) => {
```

**Line 139 - BEFORE:**
```typescript
const closestPosition = item.allPositions.reduce((closest, current) => {
```

**Line 139 - AFTER:**
```typescript
const closestPosition = item.allPositions.reduce((closest: TriadPosition, current: TriadPosition) => {
```

---

### Fix 1.4: Replace `theme.background` with `theme.bgPrimary` (Lines 316, 330, 343, 375)

**FIND ALL:**
```typescript
theme.background
```

**REPLACE WITH:**
```typescript
theme.bgPrimary
```

---

### Fix 1.5: Fix invalid CSS property `focusRingColor` (Line 355)

**BEFORE:**
```typescript
style={{
  backgroundColor: isSelected ? '#10b981' : '#6b7280',
  focusRingColor: isSelected ? '#10b981' : '#6b7280',
}}
```

**AFTER:**
```typescript
style={{
  backgroundColor: isSelected ? '#10b981' : '#6b7280',
  outlineColor: isSelected ? '#10b981' : '#6b7280',
}}
```

---

## File 2: components/chord-progression/ScaleFretboard.tsx

### Fix 2.1: Add `isRoot` property to NotePosition objects (Line 102)

**BEFORE:**
```typescript
return calculatedScaleNotes.map((note) => ({
  stringIndex: note.stringIndex,
  fretNumber: note.fretNumber,
  note: note.note,
  color: NOTE_COLORS[note.note] || '#ffffff',
  label: note.scaleDegree.toString(),
  size: note.scaleDegree === 1 ? 'large' : 'medium',
  opacity: note.isInCAGEDRegion ? 1 : 0.5,
}));
```

**AFTER:**
```typescript
return calculatedScaleNotes.map((note) => ({
  stringIndex: note.stringIndex,
  fretNumber: note.fretNumber,
  note: note.note,
  isRoot: note.scaleDegree === 1,
  color: NOTE_COLORS[note.note] || '#ffffff',
  label: note.scaleDegree.toString(),
  size: note.scaleDegree === 1 ? 'large' : 'medium',
  opacity: note.isInCAGEDRegion ? 1 : 0.5,
}));
```

---

### Fix 2.2: Replace `theme.background` with `theme.bgPrimary` (Line 188)

**BEFORE:**
```typescript
style={{ backgroundColor: theme.background }}
```

**AFTER:**
```typescript
style={{ backgroundColor: theme.bgPrimary }}
```

---

## File 3: components/chord-progression/PlaySongPanel.tsx

### Fix 3.1: Replace `theme.background` with `theme.bgPrimary` (Line 241)

**BEFORE:**
```typescript
style={{ backgroundColor: theme.background }}
```

**AFTER:**
```typescript
style={{ backgroundColor: theme.bgPrimary }}
```

---

## File 4: components/chord-progression/DualFretboardDisplay.tsx

### Fix 4.1: Add type assertion for NoteName (Line 93)

**BEFORE:**
```typescript
const cagedData = useCAGED({
  rootNote: selectedChord?.rootNote || 'C',
  quality: cagedQuality,
  maxFret: 24,
  enabledShapes: selectedCAGEDShapes as CAGEDShapeName[],
});
```

**AFTER:**
```typescript
const cagedData = useCAGED({
  rootNote: (selectedChord?.rootNote || 'C') as NoteName,
  quality: cagedQuality,
  maxFret: 24,
  enabledShapes: selectedCAGEDShapes as CAGEDShapeName[],
});
```

---

## File 5: lib/chord-progression/song-progression-utils.ts

### Fix 5.1: Remove invalid `color` property and add `isRoot` (Line 73-78)

**BEFORE:**
```typescript
positions.push({
  stringIndex,
  fretNumber: fret,
  note,
  color: '#ffffff',
});
```

**AFTER:**
```typescript
positions.push({
  stringIndex,
  fretNumber: fret,
  note,
  isRoot: false,
});
```

---

### Fix 5.2: Add proper type for cagedShape variable (Line 227)

**BEFORE:**
```typescript
cagedShape,
```

**AFTER:**
```typescript
cagedShape: cagedShape as CAGEDShape | null,
```

OR find the variable declaration and type it properly:

**FIND (around line 215-220):**
```typescript
const cagedShape = /* ... */;
```

**ADD TYPE:**
```typescript
const cagedShape: CAGEDShape | null = /* ... */;
```

---

## Summary of Changes

| File | Changes | Errors Fixed |
|------|---------|--------------|
| TriadFretboard.tsx | 5 fixes | 21 errors |
| ScaleFretboard.tsx | 2 fixes | 2 errors |
| PlaySongPanel.tsx | 1 fix | 1 error |
| DualFretboardDisplay.tsx | 1 fix | 1 error |
| song-progression-utils.ts | 2 fixes | 2 errors |
| **TOTAL** | **11 fixes** | **29 errors** |

