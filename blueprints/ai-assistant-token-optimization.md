# AI Assistant Token Optimization

## Overview

This document describes the token optimization system implemented to reduce AI API costs by 60-70% while maintaining full functionality.

## Problem

Previously, the AI assistant returned complete scale data for each recommendation:
- `scaleName`: "Dorian"
- `rootNote`: "D"
- `intervals`: [0, 2, 3, 5, 7, 9, 10]
- `noteDegrees`: Array of 7+ objects with note, degree, role, isChordTone
- `chordTones`: ["D", "F", "A", "C"]
- `rationale`: "Perfect for jazz..."
- `genreContext`: "Jazz, Funk"
- `difficulty`: 3

This resulted in ~200-300 tokens per scale recommendation in the AI response.

## Solution

### Token-Optimized Response Format

The AI now returns only essential fields:
```json
{
  "scaleName": "Dorian",
  "rootNote": "D",
  "rationale": "Perfect for jazz and funk with minor quality and raised 6th degree.",
  "genreContext": "Jazz, Funk",
  "difficulty": 3
}
```

This reduces the response to ~50-70 tokens per scale recommendation.

### Scale Enrichment System

We enrich the slim AI response with full data from our internal database:

1. **AI returns slim recommendation** (scaleName, rootNote, rationale, genreContext, difficulty)
2. **Scale mapper** maps AI scale name to our EXTENDED_SCALE_INTERVALS database
3. **Enrichment service** populates intervals, noteDegrees, chordTones
4. **Client receives** full AIScaleRecommendation with all data

## Architecture

### Files Created

1. **lib/ai-assistant/scale-database-mapper.ts**
   - Maps GPT-4o-mini canonical names to EXTENDED_SCALE_INTERVALS
   - Handles Unicode symbols (♭ ♯ ♮)
   - Fuzzy matching for encoding issues
   - Functions: `mapAIScaleNameToDatabase()`, `getScaleIntervals()`, `calculateNoteDegrees()`, `extractChordTones()`

2. **lib/ai-assistant/scale-enrichment.ts**
   - Enriches slim recommendations with database data
   - Batch processing support
   - Error handling and logging
   - Functions: `enrichScaleRecommendation()`, `enrichScaleRecommendations()`, `getEnrichmentStats()`

### Files Modified

1. **lib/ai-assistant/types.ts**
   - Added `AIScaleRecommendationSlim` interface
   - Made `maxTokens` optional in `AIAssistantConfig`

2. **lib/ai-assistant/prompt-builder.ts**
   - Removed intervals, noteDegrees, chordTones from example
   - Added canonical scale name list
   - Added instruction to use exact scale names
   - Reduced prompt from ~1000 to ~400 tokens

3. **lib/ai-assistant/openai-service.ts**
   - Parse AI response as slim recommendations
   - Call enrichment service
   - Log enrichment statistics
   - Return enriched recommendations to client

## GPT-4o-mini Canonical Scale Names

The AI uses these exact names (including Unicode symbols):

### Major Modes
- Ionian (Major)
- Dorian
- Phrygian
- Lydian
- Mixolydian
- Aeolian (Natural Minor)
- Locrian

### Minor Variations
- Harmonic Minor
- Melodic Minor

### Harmonic Minor Modes
- Locrian ♮6
- Ionian ♯5
- Dorian ♯4
- Phrygian Dominant
- Lydian ♯2
- Mixolydian ♭9 ♭13

### Melodic Minor Modes
- Dorian ♭2
- Lydian Augmented
- Lydian Dominant
- Mixolydian ♭6
- Aeolian ♭5
- Super Locrian

### Pentatonic
- Pentatonic Major
- Pentatonic Minor
- Blues
- Japanese Pentatonic
- Egyptian Pentatonic

### Symmetrical
- Chromatic
- Whole Tone
- Diminished (Half-Whole)
- Diminished (Whole-Half)
- Augmented

### Keys (Sharp Notation Only)
C, C#, D, D#, E, F, F#, G, G#, A, A#, B

## Token Savings

### Before Optimization
- System prompt: ~1000 tokens
- Response per scale: ~200-300 tokens
- Total for 2 scales: ~1600 tokens
- Cost per request: ~$0.0005

### After Optimization
- System prompt: ~400 tokens
- Response per scale: ~50-70 tokens
- Total for 2 scales: ~600 tokens
- Cost per request: ~$0.0002

**Savings: 62.5% reduction in tokens, 60% cost reduction**

## Error Handling

1. **Unknown scale names**: Logged and filtered out
2. **Invalid root notes**: Caught and handled gracefully
3. **Enrichment failures**: Tracked with statistics
4. **Encoding issues**: Fuzzy matching handles Unicode problems

## Monitoring

The system logs:
- Number of slim recommendations received
- Number successfully enriched
- Failed enrichments with scale names
- Token usage statistics
- Estimated cost per request

## Testing

Tests cover:
- Valid scale enrichment (Dorian, Pentatonic Minor, Harmonic Minor)
- Unknown scale names
- Invalid root notes
- Batch enrichment
- Filtering failed enrichments

## Future Improvements

1. Add caching for enriched scales
2. Implement fallback to full AI response if enrichment fails
3. Add metrics dashboard for token savings
4. Consider pre-computing all scale data for instant enrichment

