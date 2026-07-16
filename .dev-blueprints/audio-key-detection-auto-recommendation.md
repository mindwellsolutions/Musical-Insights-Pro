# Audio Key Detection Auto-Recommendation Feature Blueprint

## Overview
Implement auto-recommendation system for compatible scales/modes based on detected musical keys, with automatic fretboard switching capabilities.

## Current State Analysis
- ✅ Audio input with key detection working
- ✅ KeyDetectionDisplay shows detected key
- ✅ Basic scale compatibility system exists
- ❌ "Analyzing..." state not shown in header
- ❌ Duplicate "major/minor" text in detected key display
- ❌ No Auto Recommendation switch
- ❌ No Compatible Scales & Modes UI cards
- ❌ No Auto Switch Fretboard feature
- ❌ Musical compatibility database not integrated

## Phase 1: Fix Current Issues

### Task 1.1: Update Header to Show "Detected Key" with "Analyzing..." State
**File**: `components/audio/KeyDetectionDisplay.tsx`
- Change "Detected Musical Key" label to "Detected Key"
- Show "Analyzing..." text when `isListening` is true and no key detected yet
- Show detected key once available

### Task 1.2: Fix Duplicate Major/Minor Text
**File**: `components/audio/KeyDetectionDisplay.tsx`
- Investigate why key shows "E major Major" instead of "E Major"
- Fix the formatting to show only one instance of the quality (major/minor)
- Ensure proper capitalization (e.g., "E Major", "B Minor")

## Phase 2: Create Musical Compatibility System

### Task 2.1: Port Musical Compatibility Library
**File**: `lib/musicalCompatibility.ts` (NEW)
- Port `EXTENDED_SCALE_INTERVALS` from reference implementation
- Port `SCALE_CHARACTERISTICS` with mood, difficulty, common use
- Port `calculateScaleCompatibility()` function
- Port `getCompatibleScales()` function
- Ensure compatibility with existing `musicTheory.ts`

### Task 2.2: Update Music Theory Library
**File**: `lib/musicTheory.ts`
- Ensure all scale intervals from reference are included
- Add any missing scales/modes
- Maintain backward compatibility

## Phase 3: Implement Auto Recommendation UI

### Task 3.1: Add Auto Recommendation Switch
**File**: `components/audio/KeyDetectionDisplay.tsx`
- Add a switch/toggle UI component below "Detected Key" section
- Label: "Auto Recommendation"
- Default state: OFF
- Store state in component
- Pass state to parent component

### Task 3.2: Create Compatible Scales Section
**File**: `components/audio/CompatibleScalesSection.tsx` (NEW)
- Create collapsible section with up arrow to collapse
- Show when Auto Recommendation is ON and key is detected
- Display "Compatible Scales & Modes" title
- Implement collapse/expand functionality
- Modern, visually striking design

### Task 3.3: Create Scale/Mode Recommendation Cards
**File**: `components/audio/ScaleRecommendationCard.tsx` (NEW)
- Design modern, visually striking card UI
- Display scale/mode name prominently
- Show compatibility rating (visual indicator)
- Display chord tones with colored note badges
- Display guide tones with colored note badges
- Show musical context/description
- Clickable to select scale
- Highlight selected scale
- Sort by compatibility score (best to least good)

### Task 3.4: Integrate Compatible Scales Display
**File**: `components/audio/KeyDetectionPanel.tsx`
- Add state for `autoRecommendation` (boolean)
- Add state for `compatibleScalesExpanded` (boolean)
- When key detected and autoRecommendation is ON:
  - Fetch compatible scales using `getCompatibleScales()`
  - Sort by compatibility score (descending)
  - Display in CompatibleScalesSection
- Update compatible scales when detected key changes
- Handle scale selection to update fretboard

## Phase 4: Implement Auto Switch Fretboard

### Task 4.1: Add Auto Switch Fretboard Toggle
**File**: `components/audio/KeyDetectionDisplay.tsx`
- Add second switch below Auto Recommendation
- Label: "Auto Switch Fretboard"
- Default state: OFF
- Only enabled when Auto Recommendation is ON
- Store state in component

### Task 4.2: Implement Auto Fretboard Switching Logic
**File**: `components/audio/KeyDetectionPanel.tsx`
- Add state for `autoSwitchFretboard` (boolean)
- When enabled and new key detected:
  - Get top recommended scale (highest compatibility)
  - Automatically call `onScaleChange()` with top scale
  - Update fretboard display
- Ensure smooth transitions
- Prevent rapid switching (debounce if needed)

## Phase 5: Integration and Polish

### Task 5.1: Update KeyDetectionPanel Integration
**File**: `components/audio/KeyDetectionPanel.tsx`
- Integrate all new components
- Manage state flow between components
- Handle edge cases (no scales found, etc.)
- Ensure proper cleanup on unmount

### Task 5.2: Add Visual Feedback
- Loading states while fetching scales
- Smooth animations for card appearance
- Highlight transitions when auto-switching
- Visual indicator for currently playing key

### Task 5.3: Error Handling
- Handle cases where no compatible scales found
- Handle API/calculation errors gracefully
- Show user-friendly error messages
- Fallback to basic scales if advanced compatibility fails

### Task 5.4: Performance Optimization
- Memoize compatibility calculations
- Debounce key detection updates
- Lazy load scale cards
- Optimize re-renders

## Phase 6: Testing and Refinement

### Task 6.1: Manual Testing
- Test with various musical keys (all 12 notes, major/minor)
- Verify compatibility ratings are accurate
- Test auto-recommendation on/off
- Test auto-switch fretboard on/off
- Test collapse/expand functionality
- Verify chord tones and guide tones display correctly

### Task 6.2: Edge Case Testing
- Rapid key changes
- No audio input
- Low confidence detections
- Switching between devices
- Browser compatibility

### Task 6.3: UI/UX Refinement
- Ensure modern, professional appearance
- Consistent with existing design system
- Responsive layout (mobile, tablet, desktop)
- Accessibility (keyboard navigation, screen readers)
- Color contrast and readability

## Technical Requirements

### Dependencies
- Existing: React, TypeScript, Tailwind CSS
- New: None (use existing libraries)

### Data Flow
```
Audio Input → Key Detection → Detected Key
                                    ↓
                          Auto Recommendation ON?
                                    ↓
                          Get Compatible Scales
                                    ↓
                          Sort by Compatibility
                                    ↓
                          Display Scale Cards
                                    ↓
                          User Selects Scale OR Auto Switch ON
                                    ↓
                          Update Fretboard
```

### State Management
- Component-level state for UI toggles
- Parent component manages scale selection
- Callback props for fretboard updates

## Success Criteria
- ✅ Header shows "Detected Key" with "Analyzing..." state
- ✅ No duplicate major/minor text in key display
- ✅ Auto Recommendation switch functional
- ✅ Compatible scales display when enabled
- ✅ Scales sorted by compatibility (best to worst)
- ✅ Scale cards are modern and visually striking
- ✅ Chord tones and guide tones display correctly
- ✅ Auto Switch Fretboard toggle functional
- ✅ Fretboard auto-updates to top recommended scale
- ✅ Smooth user experience with no lag
- ✅ All edge cases handled gracefully

## Implementation Order
1. Phase 1: Fix current issues (Tasks 1.1, 1.2)
2. Phase 2: Create compatibility system (Tasks 2.1, 2.2)
3. Phase 3: Build UI components (Tasks 3.1-3.4)
4. Phase 4: Auto-switch feature (Tasks 4.1, 4.2)
5. Phase 5: Integration (Tasks 5.1-5.4)
6. Phase 6: Testing and refinement (Tasks 6.1-6.3)

