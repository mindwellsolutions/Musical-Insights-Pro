# Recommended Chords Feature - Development Blueprint

## Overview
This blueprint details the implementation of an AI-powered chord recommendation system for the Song Builder's "Add Chord to Progression" modal. The system uses GPT-4o-mini to analyze the current key and chord progression, providing intelligent chord suggestions with compatibility scores.

---

## Feature Requirements

### Core Functionality
1. **AI-Powered Chord Recommendations**: Use GPT-4o-mini to score chords based on compatibility with the current key and chord progression
2. **Tabbed Interface**: Two tabs - "Recommended Chords" (default) and "Add Chords Manually"
3. **Category Filtering**: Filter recommended chords by category (All, Triads, 7th Chords, Extended, Altered, Sus, Add)
4. **Score Display**: Show x/10 compatibility score on each chord UI element
5. **Score-Based Sorting**: Sort chords from highest to lowest score within each category
6. **Minimum Score Threshold**: Only show chords scoring 6/10 or higher
7. **Top 20 Limit**: Return only the top 20 highest-scoring chords
8. **Modern Premium UI**: Enhanced visual design with striking, professional aesthetics

---

## Architecture

### 1. New API Route: `/api/chord-progression/recommend-chords`

**Purpose**: Minimal token usage API that scores chords for compatibility

**Request Schema**:
```typescript
interface RecommendChordsRequest {
  key: string;                    // Current verse key (e.g., "C", "D#", "F#")
  chordProgression: string[];     // Ordered array of chord symbols (e.g., ["C", "Am", "F", "G"])
}
```

**Response Schema**:
```typescript
interface ChordRecommendation {
  symbol: string;        // Chord symbol (e.g., "Dm7")
  score: number;         // Compatibility score 1-10
  category: string;      // Category from CHORD_CATEGORIES
}

interface RecommendChordsResponse {
  recommendations: ChordRecommendation[];  // Top 20 chords scoring >= 6/10, sorted by score desc
}
```

**Implementation Details**:
- **File**: `app/api/chord-progression/recommend-chords/route.ts`
- **Method**: POST
- **Model**: GPT-4o-mini (minimal token usage)
- **Prompt Strategy**: 
  - System prompt: Instruct AI to be a music theory expert analyzing chord compatibility
  - User prompt: Provide key and progression, request JSON array of chord recommendations
  - Response format: Strict JSON array with symbol, score, category
  - Token optimization: No explanations, rationales, or verbose text - only structured data
- **Validation**: 
  - Ensure all scores are 1-10
  - Filter to only include scores >= 6
  - Limit to top 20 results
  - Validate category matches CHORD_CATEGORIES
- **Error Handling**: Return empty array on failure with appropriate error logging

**Sample Prompt**:
```
System: You are a music theory expert. Analyze chord compatibility and return ONLY valid JSON.

User: Key: C Major
Progression: ["C", "Am", "F", "G"]

Return top 20 chords (score >= 6/10) as JSON array:
[{"symbol": "Dm", "score": 9, "category": "Triads"}, ...]

Categories: Triads, 7th Chords, Extended, Altered, Sus, Add
```

---

## 2. React Hook: `useChordRecommendations`

**Purpose**: Manage API calls and state for chord recommendations

**File**: `hooks/chord-progression/useChordRecommendations.ts`

**Hook Interface**:
```typescript
interface UseChordRecommendationsReturn {
  recommendations: ChordRecommendation[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function useChordRecommendations(
  key: string,
  chordProgression: ChordInstance[],
  enabled: boolean  // Only fetch when modal is open and in "Recommended" tab
): UseChordRecommendationsReturn
```

**Implementation Details**:
- Use React Query for caching and request management
- Query key: `['chord-recommendations', key, chordProgressionString]`
- Only trigger when `enabled` is true (modal open + recommended tab active)
- Debounce/throttle: No need - only fetches when modal opens or progression changes significantly
- Cache time: 5 minutes (recommendations stay relevant for a session)
- Stale time: 2 minutes
- Error handling: Display user-friendly error message in modal
- Abort previous requests if new one is triggered

---

## 3. Enhanced AddChordModal Component

**File**: `components/chord-progression/AddChordModal.tsx`

### New State Variables
```typescript
const [activeTab, setActiveTab] = useState<'recommended' | 'manual'>('recommended');
const [selectedRecommendedCategory, setSelectedRecommendedCategory] = useState<'All' | ChordCategory>('All');
```

### Props Enhancement
```typescript
interface AddChordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentKey: string;
  onChordSelect: (chordSymbol: string, duration: number) => void;
  editingChord?: ChordInstance | null;
  currentChordProgression: ChordInstance[];  // NEW: Pass current progression for recommendations
}
```

### Tab Structure

**Tab Navigation** (Horizontal tabs at top of modal content):
- Tab 1: "Recommended Chords" (default, active when modal opens)
- Tab 2: "Add Chords Manually"

**Tab Styling**:
- Active tab: Gradient background, bold text, bottom border accent
- Inactive tab: Transparent background, gray text, hover effect
- Smooth transition animations

### Recommended Chords Tab Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [Recommended Chords] [Add Chords Manually]                 │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────────────────────────────────────┐ │
│  │ All      │  │  [Search Bar]                            │ │
│  │ Triads   │  │                                          │ │
│  │ 7th      │  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐    │ │
│  │ Extended │  │  │ Dm │ │ Em │ │ G7 │ │ Am │ │Fmaj7│   │ │
│  │ Altered  │  │  │ 9  │ │ 8  │ │ 8  │ │ 7  │ │ 7  │    │ │
│  │ Sus      │  │  └────┘ └────┘ └────┘ └────┘ └────┘    │ │
│  │ Add      │  │                                          │ │
│  └──────────┘  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐           │ │
│                │  │ C6 │ │Dm7 │ │Cmaj9│ │Gsus4│          │ │
│                │  │ 7  │ │ 7  │ │ 6  │ │ 6  │           │ │
│                │  └────┘ └────┘ └────┘ └────┘           │ │
│                └──────────────────────────────────────────┘ │
│  Duration: [4 beats ▼]              [Cancel] [Add Chord]   │
└─────────────────────────────────────────────────────────────┘
```

**Left Sidebar Categories**:
- Width: 180px
- Categories: "All" (new), "Triads", "7th Chords", "Extended", "Altered", "Sus", "Add"
- "All" shows all recommended chords sorted by score (highest first)
- Other categories filter to show only chords in that category, still sorted by score
- Active category: Gradient background with glow effect
- Inactive: Subtle hover effect

**Chord Grid**:
- Display recommended chords as rounded cards
- Each card shows:
  - Chord symbol (large, bold)
  - Compatibility score (e.g., "9" or "8/10") - displayed prominently
  - Score badge: Positioned at top-right corner or bottom of card
- Grid layout: 6 columns (same as current)
- Sorting: Always highest to lowest score within displayed category
- Empty state: "No recommendations available" with icon if API returns empty

**Score Badge Styling**:
- Position: Bottom center or top-right corner of chord card
- Size: Small, compact (e.g., 24px circle or rounded rectangle)
- Color coding:
  - 9-10: Vibrant green gradient (#10b981 to #059669)
  - 7-8: Blue gradient (#3b82f6 to #2563eb)
  - 6: Amber gradient (#f59e0b to #d97706)
- Font: Bold, white text
- Shadow: Subtle glow matching score color

### Add Chords Manually Tab

**Layout**: Identical to current AddChordModal implementation
- Left sidebar with categories (no "All" option)
- Search bar
- Chord grid (6 columns)
- No score badges
- Same interaction patterns

---

## 4. UI/UX Enhancements

### Modern Premium Design Elements

**Color Palette**:
- Background: Deep gradient from #0a0a0a to #1a1a1a
- Borders: Subtle #2a2a2a with glow effects on hover
- Accents: Electric blue (#3b82f6), vibrant purple (#8b5cf6), emerald green (#10b981)
- Text: Pure white (#ffffff) for primary, #a0a0a0 for secondary

**Typography**:
- Modal title: 28px, bold, gradient text effect
- Tab labels: 16px, semibold
- Chord symbols: 20px, bold
- Score badges: 12px, bold
- Category labels: 14px, medium

**Animations & Transitions**:
- Tab switching: Smooth fade + slide (200ms ease-in-out)
- Chord card hover: Scale 1.05, glow effect, lift shadow
- Category selection: Background color transition (150ms)
- Loading state: Skeleton shimmer effect for chord grid
- Score badge: Subtle pulse animation on high scores (9-10)

**Spacing & Layout**:
- Modal width: 1100px (increased from 1024px for better breathing room)
- Modal height: 700px
- Padding: Generous 24px throughout
- Gap between elements: 16-20px
- Chord card aspect ratio: Square (1:1)

**Interactive States**:
- Hover: Lift effect, glow, brightness increase
- Active/Selected: Bold border, gradient background, shadow
- Disabled: 50% opacity, no pointer events
- Loading: Skeleton loaders with shimmer animation

**Accessibility**:
- Keyboard navigation: Tab through categories and chords
- Focus indicators: Clear outline on focused elements
- ARIA labels: Proper labels for screen readers
- Color contrast: WCAG AA compliant

---

## 5. Data Flow

### When Modal Opens (Recommended Tab)
1. User clicks "Add Chord" button in Song Builder
2. Modal opens with `activeTab = 'recommended'`
3. `useChordRecommendations` hook triggers API call with:
   - Current verse key
   - Current chord progression (ordered array of symbols)
4. Loading state: Show skeleton loaders in chord grid
5. API returns top 20 chords with scores >= 6/10
6. Display chords in "All" category by default, sorted by score
7. User can filter by category while maintaining score-based sorting

### When User Switches to Manual Tab
1. User clicks "Add Chords Manually" tab
2. Tab content switches to current implementation
3. No API calls triggered
4. Standard category filtering and search functionality

### When Chord Progression Changes
1. User adds/removes/reorders chords in timeline
2. If modal is open and on "Recommended" tab:
   - Trigger new API call with updated progression
   - Show loading state
   - Update recommendations
3. If modal is closed or on "Manual" tab:
   - No action (recommendations will refresh when modal reopens)

---

## 6. Implementation Checklist

### Phase 1: API & Backend
- [ ] Create `/api/chord-progression/recommend-chords/route.ts`
- [ ] Implement GPT-4o-mini integration with minimal token prompt
- [ ] Add request/response validation
- [ ] Test API with various keys and progressions
- [ ] Implement error handling and logging
- [ ] Add rate limiting if needed

### Phase 2: React Hook
- [ ] Create `hooks/chord-progression/useChordRecommendations.ts`
- [ ] Implement React Query integration
- [ ] Add proper caching strategy
- [ ] Handle loading and error states
- [ ] Test hook with different scenarios

### Phase 3: UI Components
- [ ] Add tab navigation to AddChordModal
- [ ] Create "All" category in sidebar for Recommended tab
- [ ] Implement score badge component
- [ ] Add filtering logic for recommended chords by category
- [ ] Implement sorting by score (highest to lowest)
- [ ] Style chord cards with score badges
- [ ] Add loading skeletons
- [ ] Implement empty state UI

### Phase 4: Integration
- [ ] Pass `currentChordProgression` prop to AddChordModal
- [ ] Update ChordProgressionBuilder to provide progression data
- [ ] Connect useChordRecommendations hook to modal
- [ ] Implement tab switching logic
- [ ] Test full user flow

### Phase 5: UI/UX Polish
- [ ] Apply modern premium design system
- [ ] Implement animations and transitions
- [ ] Add hover effects and interactive states
- [ ] Ensure responsive layout
- [ ] Test accessibility features
- [ ] Add keyboard navigation
- [ ] Implement focus management

### Phase 6: Testing & Optimization
- [ ] Test with empty progressions
- [ ] Test with various keys (sharps, flats, naturals)
- [ ] Test with different progression lengths
- [ ] Verify score accuracy and relevance
- [ ] Test performance with rapid modal open/close
- [ ] Verify React Query caching works correctly
- [ ] Test error scenarios (API failure, network issues)
- [ ] Cross-browser testing

---

## 7. Technical Specifications

### API Token Optimization
- **Estimated tokens per request**: 150-250 tokens
- **Model**: gpt-4o-mini (cost-effective)
- **Prompt structure**: Minimal, structured, no verbose explanations
- **Response format**: Pure JSON array, no markdown or extra text
- **Caching**: React Query caches results for 5 minutes
- **Request frequency**: Only when modal opens or progression changes significantly

### Performance Targets
- API response time: < 2 seconds
- Modal open time: < 100ms (instant)
- Tab switch time: < 200ms (smooth)
- Chord grid render: < 50ms
- Smooth 60fps animations

### Browser Compatibility
- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS Safari, Chrome Android

---

## 8. Edge Cases & Error Handling

### Empty Progression
- **Scenario**: User opens modal with no chords in progression
- **Behavior**: Still call API with empty array, AI recommends chords based on key only
- **UI**: Show recommendations normally

### API Failure
- **Scenario**: OpenAI API is down or returns error
- **Behavior**: Display error message in Recommended tab
- **UI**: "Unable to load recommendations. Try Add Chords Manually tab."
- **Fallback**: User can still use Manual tab

### No Recommendations (All scores < 6)
- **Scenario**: AI returns no chords meeting threshold
- **Behavior**: Show empty state
- **UI**: "No strong recommendations found. Try Add Chords Manually tab."

### Slow API Response
- **Scenario**: API takes > 3 seconds
- **Behavior**: Show loading state with skeleton loaders
- **UI**: Animated skeletons in chord grid
- **Timeout**: 10 seconds, then show error

### Invalid Key or Progression
- **Scenario**: Malformed data passed to API
- **Behavior**: API validation catches and returns 400 error
- **UI**: Show error message, fallback to Manual tab

---

## 9. Future Enhancements (Out of Scope)

- Voice leading analysis (smooth transitions between chords)
- Genre-specific recommendations
- User preference learning (ML-based personalization)
- Chord substitution suggestions
- Harmonic function labeling (I, IV, V, etc.)
- Audio preview of recommended chords
- Save favorite chord combinations

---

## 10. Dependencies

### New Dependencies
- None (uses existing OpenAI, React Query, UI components)

### Existing Dependencies
- `openai`: GPT-4o-mini API calls
- `@tanstack/react-query`: State management and caching
- `@/components/ui/*`: Shadcn UI components
- `@/lib/chord-progression/chord-library`: Chord definitions and categories

---

## 11. File Structure

```
app/
  api/
    chord-progression/
      recommend-chords/
        route.ts                          # NEW: API route for recommendations

components/
  chord-progression/
    AddChordModal.tsx                     # MODIFIED: Add tabs and recommendations UI

hooks/
  chord-progression/
    useChordRecommendations.ts            # NEW: React hook for API integration

lib/
  chord-progression/
    chord-library.ts                      # EXISTING: No changes needed
    types.ts                              # MODIFIED: Add ChordRecommendation type

.blueprints/
  recommended-chords-feature.md           # THIS FILE
```

---

## 12. Success Criteria

✅ **Functional**:
- API returns relevant chord recommendations with scores
- Recommendations update when progression changes
- Filtering by category works correctly
- Scores are displayed clearly on each chord
- Manual tab preserves existing functionality

✅ **Performance**:
- API responds in < 2 seconds
- Modal opens instantly
- Smooth animations at 60fps
- No memory leaks or performance degradation

✅ **UX**:
- Intuitive tab navigation
- Clear visual hierarchy
- Responsive and accessible
- Error states are user-friendly
- Loading states are informative

✅ **Code Quality**:
- Type-safe TypeScript
- Proper error handling
- Clean, maintainable code
- Follows existing patterns
- Well-documented

---

## End of Blueprint

This blueprint provides complete specifications for implementing the Recommended Chords feature. All details needed for development are included, from API design to UI components to error handling. The implementation should follow this blueprint closely while maintaining consistency with the existing codebase architecture and design patterns.

