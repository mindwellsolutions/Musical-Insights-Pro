# Harmonization Visual Coding System

## Overview

The harmonization feature now displays **BOTH original scale notes AND harmony notes simultaneously** with clear visual distinction to show their relationships.

## Visual Coding System

### Original Scale Mode
When "Original" tab is selected:
- Shows only the original scale notes
- Standard white borders
- No legend displayed

### Harmonization Modes (3rds, 5ths, 6ths, 7ths)
When any harmonization tab is selected:
- Shows **BOTH** original scale notes AND harmony notes
- Clear visual distinction between the two types
- Legend displayed to explain the coding

## Visual Distinctions

### Original Scale Notes (Melody)
**Purpose:** Shows where to play the melody/original scale

**Visual Styling:**
- **Border:** Dashed white border (2px for regular notes, 3px for root)
- **Size:** Smaller (26px for regular notes, 30px for root)
- **Glow:** Subtle white glow `rgba(255,255,255,0.2)`
- **Appearance:** More subtle, background role

**Example:**
```
┌─────────┐
│    C    │  ← Dashed white border, smaller size
└─────────┘
```

### Harmony Notes
**Purpose:** Shows where to play the harmony notes (3rds, 5ths, 6ths, or 7ths above)

**Visual Styling:**
- **Border:** Solid green border (#10b981) - 3px thick
- **Size:** Larger (30px for regular notes, 34px for root)
- **Glow:** Green glow `rgba(16,185,129,0.4)`
- **Appearance:** More prominent, foreground role

**Example:**
```
┌───────────┐
│     E     │  ← Solid green border, larger size
└───────────┘
```

## Color Coding Rationale

### Why Green for Harmony?
- **Green (#10b981)** = "Go ahead and play this for harmony"
- Stands out clearly from the white original notes
- Positive, musical association
- High contrast against dark fretboard

### Why Dashed White for Original?
- **Dashed pattern** = "Reference/guide" (like sheet music)
- **White** = Maintains consistency with original mode
- **Smaller size** = Secondary role when harmonizing
- Shows the relationship: "This is what you're harmonizing WITH"

## Interactive Legend

A legend component appears below the harmonization tabs when any harmony mode is active:

**Legend Contents:**
1. **Visual Examples:** Shows sample notes with actual styling
2. **Labels:** "Original Scale Notes" vs "Harmony Notes (Thirds/Fifths/etc)"
3. **Instructions:** "Play the green notes to harmonize with the white notes"

**Legend Behavior:**
- Only shows when harmonization mode is active (not in "Original" mode)
- Updates label based on selected harmonization type
- Matches the app's theme colors

## Musical Relationships

### How Harmonization Works

**Example: C Aeolian (Natural Minor) - Harmonize in 3rds**

Original Scale: C, D, Eb, F, G, Ab, Bb

Harmony Mapping (each note + 2 scale degrees):
- C → Eb (harmony)
- D → F (harmony)
- Eb → G (harmony)
- F → Ab (harmony)
- G → Bb (harmony)
- Ab → C (harmony)
- Bb → D (harmony)

**On the Fretboard:**
- White dashed notes: C, D, Eb, F, G, Ab, Bb (original scale)
- Green solid notes: Eb, F, G, Ab, Bb, C, D (harmony notes)

**Result:** Same 7 notes, but visually coded to show their harmonic function!

## Implementation Details

### Files Modified

1. **`lib/musicTheory.ts`**
   - Added `getHarmonyNoteForOriginal()` - Maps original notes to harmony notes
   - Updated `calculateCombinedScalePositions()` - Returns both original and harmony positions
   - Marks each position with `isHarmonyNote` flag

2. **`components/Fretboard.tsx`**
   - Updated border styling logic
   - Different borders for original (dashed white) vs harmony (solid green)
   - Different sizes: harmony larger, original smaller
   - Different glows: green for harmony, white for original

3. **`components/HarmonizationLegend.tsx`** (NEW)
   - Shows visual coding explanation
   - Updates based on selected harmonization type
   - Only displays when harmonization is active

4. **`app/page.tsx`**
   - Added HarmonizationLegend component
   - Positioned below HarmonizationTabs

5. **`components/HarmonizationTabs.tsx`**
   - Updated descriptions to clarify "original + harmony notes"

### Database Schema

Added column to `user_settings` table:
```sql
harmonization TEXT DEFAULT 'original' 
CHECK (harmonization IN ('original', '3rds', '5ths', '6ths', '7ths'))
```

## User Experience

### What Users See

1. **Select a scale** (e.g., "C Aeolian")
2. **Click "Harmonize in 3rds"**
3. **Fretboard updates:**
   - Small dashed white notes appear (original scale)
   - Large solid green notes appear (harmony notes)
4. **Legend appears** explaining the visual coding
5. **User can now:**
   - Play white notes for melody
   - Play green notes for harmony
   - See the relationship between them

### Benefits

✅ **Clear Visual Distinction:** Immediately obvious which notes are melody vs harmony
✅ **Educational:** Shows harmonic relationships on the fretboard
✅ **Practical:** Can practice playing harmonies
✅ **Flexible:** Works with all scales and harmonization types
✅ **Intuitive:** Color coding is self-explanatory with legend

## Future Enhancements (Optional)

Potential improvements:
- Add connecting lines between related notes (original → harmony)
- Color-code by scale degree (I, II, III, etc.)
- Show interval numbers on notes
- Add audio playback for harmony notes
- Highlight note pairs when hovering

