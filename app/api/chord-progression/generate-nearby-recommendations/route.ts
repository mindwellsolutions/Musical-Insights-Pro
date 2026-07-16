import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChordProgressionRecommendation {
  id: string;
  progression: string[];
  name: string;
  rationale: string;
  musicTheoryBasis: string;
  mood: string;
  complexity: number;
}

interface NearbyChordInfo {
  degree: string;
  rootNote: string;
  quality: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      rootNote,
      triadType,
      userPrompt,
      complexity,
      numChords,
      numRecommendations = 4,
      nearbyChords = []
    } = body;

    if (!rootNote || !triadType) {
      return NextResponse.json(
        { error: 'Root note and triad type are required' },
        { status: 400 }
      );
    }

    // Build list of available chords from nearby chords
    const availableChords = nearbyChords.map((nc: NearbyChordInfo) => {
      const qualitySuffix = nc.quality === 'major' ? '' : 
                           nc.quality === 'minor' ? 'm' : 
                           nc.quality === 'diminished' ? 'dim' : 'aug';
      return `${nc.rootNote}${qualitySuffix} (${nc.degree})`;
    }).join(', ');

    const systemPrompt = `You are an expert music theory assistant specializing in chord progressions.
Generate chord progression recommendations based on the user's request.

CURRENT CONTEXT:
- Root Note: ${rootNote}
- Triad Type: ${triadType}
- Available Nearby Diatonic Chords: ${availableChords}
- Requested Complexity Level: ${complexity || 5}/10
- Requested Progression Length: ${numChords || 4} chords (THIS IS MANDATORY - DO NOT GENERATE FEWER OR MORE)
- Number of Recommendations to Generate: ${numRecommendations} (THIS IS MANDATORY - GENERATE EXACTLY THIS MANY)

CRITICAL REQUIREMENTS - FAILURE TO FOLLOW THESE WILL RESULT IN REJECTION:
1. Each progression MUST contain EXACTLY ${numChords || 4} chords - NO EXCEPTIONS
   - Count the chords in your progression array before returning
   - If you have fewer than ${numChords || 4} chords, add more from the available list
   - If you have more than ${numChords || 4} chords, remove extras
2. Generate EXACTLY ${numRecommendations} different progressions - NO MORE, NO LESS
3. ALL chord symbols MUST EXACTLY match the format from the available nearby diatonic chords list
   - Use ONLY the chord symbols shown in the list (e.g., "C", "Am", "F", "G", "Dm", "Em", "Bdim")
   - Do NOT add extensions like "7", "maj7", "sus4" etc.
   - Do NOT modify the chord symbols in any way
4. The progressions should work well with a ${rootNote} ${triadType} triad as the tonal center
5. Adjust the harmonic complexity based on the requested complexity level (${complexity || 5}/10):
   - Low complexity (1-3): Simple, common progressions with basic chord movements
   - Medium complexity (4-7): More interesting progressions with some unexpected moves
   - High complexity (8-10): Advanced progressions with sophisticated voice leading and harmonic substitutions

RESPONSE FORMAT:
Return ONLY a valid JSON array of exactly ${numRecommendations} recommendations. Each recommendation must have:
- id: unique identifier (e.g., "prog-1", "prog-2", "prog-3")
- progression: array of EXACTLY ${numChords || 4} chord symbols from the available list (e.g., ["C", "Am", "F", "G"])
- name: descriptive name that reflects the mood and character (e.g., "Classic Pop Progression")
- rationale: 1-2 sentences explaining why this progression works with ${rootNote} ${triadType}
- musicTheoryBasis: detailed music theory explanation including functional harmony and voice leading
- mood: emotional character (e.g., "uplifting", "melancholic", "dramatic", "peaceful")
- complexity: the actual complexity rating (1-10) based on the harmonic sophistication

VALIDATION CHECKLIST BEFORE RETURNING:
✓ Does each progression have EXACTLY ${numChords || 4} chords?
✓ Are there EXACTLY ${numRecommendations} progressions?
✓ Do all chord symbols exactly match the available chords list?
✓ Is the JSON properly formatted and complete?`;

    const userMessage = userPrompt
      ? `${userPrompt}. Generate ${numRecommendations} progressions with ${numChords || 4} chords each at complexity level ${complexity || 5}/10`
      : `Generate ${numRecommendations} chord progressions with ${numChords || 4} chords each that work well with ${rootNote} ${triadType} at complexity level ${complexity || 5}/10`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.8,
      max_tokens: 3000, // Increased to prevent cutoff
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    // Check if response was cut off
    const finishReason = completion.choices[0]?.finish_reason;
    if (finishReason === 'length') {
      console.warn('AI response was cut off due to max_tokens limit. Consider increasing max_tokens.');
    }

    // Parse JSON response
    let recommendations: ChordProgressionRecommendation[];
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
      let jsonStr = jsonMatch[1] || content;

      // If the JSON appears to be cut off (doesn't end with ] or }), try to fix it
      jsonStr = jsonStr.trim();
      if (!jsonStr.endsWith(']') && !jsonStr.endsWith('}')) {
        console.warn('JSON appears to be incomplete, attempting to fix...');
        // Try to close the JSON array if it's incomplete
        if (jsonStr.includes('[')) {
          // Find the last complete object
          const lastCompleteObject = jsonStr.lastIndexOf('}');
          if (lastCompleteObject !== -1) {
            jsonStr = jsonStr.substring(0, lastCompleteObject + 1) + ']';
          }
        }
      }

      recommendations = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      console.error('Parse error:', parseError);
      throw new Error('Invalid JSON response from AI');
    }

    // Validate that recommendations only use available chords
    const availableChordSymbols = nearbyChords.map((nc: NearbyChordInfo) => {
      const qualitySuffix = nc.quality === 'major' ? '' :
                           nc.quality === 'minor' ? 'm' :
                           nc.quality === 'diminished' ? 'dim' : 'aug';
      return `${nc.rootNote}${qualitySuffix}`;
    });

    // Create a mapping of chord symbols to nearby chord info for better matching
    const chordMap = new Map<string, NearbyChordInfo>();
    nearbyChords.forEach((nc: NearbyChordInfo) => {
      const qualitySuffix = nc.quality === 'major' ? '' :
                           nc.quality === 'minor' ? 'm' :
                           nc.quality === 'diminished' ? 'dim' : 'aug';
      const symbol = `${nc.rootNote}${qualitySuffix}`;
      chordMap.set(symbol, nc);
      chordMap.set(nc.rootNote, nc); // Also map by root note alone
    });

    // Validate and log the raw recommendations before processing
    console.log('Raw AI recommendations:', recommendations.map(r => ({
      id: r.id,
      progressionLength: r.progression.length,
      progression: r.progression
    })));

    recommendations = recommendations.map((rec, index) => {
      const originalLength = rec.progression.length;

      // Validate and normalize each chord in the progression
      const validatedProgression = rec.progression.map(chord => {
        const normalizedChord = chord.trim();

        // Try exact match first
        if (chordMap.has(normalizedChord)) {
          return normalizedChord;
        }

        // Try to find a match by checking if chord starts with any available symbol
        // But ensure we don't incorrectly match "B" to "Bm" etc.
        const matchingSymbol = availableChordSymbols.find((available: string) => {
          if (normalizedChord === available) {
            return true;
          }

          // Check if chord starts with this symbol
          if (normalizedChord.startsWith(available)) {
            // Make sure the next character isn't a quality indicator that would make it a different chord
            const nextChar = normalizedChord[available.length];
            // If there's no next char, or it's not a quality indicator, it's a match
            if (!nextChar || !['m', 'd', 'a', '°', '+'].includes(nextChar)) {
              return true;
            }
          }

          return false;
        });

        if (matchingSymbol) {
          return matchingSymbol;
        }

        // Log unmatched chords for debugging
        console.warn(`Recommendation ${index + 1}: Could not match chord "${chord}" to available chords:`, availableChordSymbols);
        return null;
      }).filter(chord => chord !== null) as string[];

      // Warn if progression length changed during validation
      if (validatedProgression.length !== originalLength) {
        console.warn(`Recommendation ${index + 1}: Progression length changed from ${originalLength} to ${validatedProgression.length} during validation`);
        console.warn(`Original: [${rec.progression.join(', ')}]`);
        console.warn(`Validated: [${validatedProgression.join(', ')}]`);
      }

      return {
        ...rec,
        progression: validatedProgression,
      };
    }).filter(rec => {
      // Only filter out completely empty progressions
      if (rec.progression.length === 0) {
        console.warn(`Removing recommendation "${rec.name}" - no valid chords found`);
        return false;
      }
      return true;
    });

    if (!Array.isArray(recommendations) || recommendations.length === 0) {
      throw new Error('No valid recommendations generated');
    }

    // Log for debugging
    console.log(`Generated ${recommendations.length} recommendations with lengths:`,
      recommendations.map(r => r.progression.length));

    return NextResponse.json({
      recommendations,
      isModification: false,
    });

  } catch (error) {
    console.error('Error generating nearby chord recommendations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

