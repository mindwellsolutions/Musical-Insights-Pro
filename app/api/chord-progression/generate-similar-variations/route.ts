import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      currentKey,
      originalProgression,
      originalName,
      originalRationale,
      originalMusicTheoryBasis,
      numVariations = 4,
    } = body;

    if (!currentKey || !originalProgression || !Array.isArray(originalProgression)) {
      return NextResponse.json(
        { error: 'Current key and original progression are required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert music theory assistant specializing in chord progression variations.
Generate SIMILAR VARIATIONS of a given chord progression that maintain the core musical character while adding valuable variety.

ORIGINAL PROGRESSION:
- Name: ${originalName}
- Chords: [${originalProgression.join(', ')}]
- Key: ${currentKey}
- Rationale: ${originalRationale}
- Music Theory: ${originalMusicTheoryBasis}

YOUR TASK:
Generate ${numVariations} variations that are "in the same neighborhood" as the original progression.
These variations should:
1. Maintain similar harmonic function and emotional character
2. Use similar chord progression length (${originalProgression.length} chords, but can vary by ±1)
3. Explore valuable variations such as:
   - Chord substitutions (e.g., vi for I, iii for V)
   - Adding extensions (7ths, 9ths, sus chords)
   - Inversions or slash chords
   - Modal interchange from parallel modes
   - Secondary dominants
   - Rhythmic variations (different chord durations)
4. Each variation should have clear music theory value
5. Variations should feel related but not identical

RESPONSE FORMAT:
Return ONLY a valid JSON array of exactly ${numVariations} variations. Each variation must have:
- id: unique identifier
- progression: array of chord symbols in ${currentKey} key
- name: descriptive name that shows relationship to original
- rationale: why this variation works and how it relates to the original
- musicTheoryBasis: detailed explanation of the variation technique used
- mood: emotional character (should be similar to original)
- complexity: 1-10 rating
- variationType: brief label (e.g., "Extension", "Substitution", "Modal Interchange")`;

    const userMessage = `Generate ${numVariations} similar variations of the progression [${originalProgression.join(', ')}] in ${currentKey}`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.8,
      max_tokens: 2500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse JSON response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }

    const variations = JSON.parse(jsonMatch[0]);

    // Validate and sanitize variations
    const validatedVariations = variations.map((variation: any, idx: number) => ({
      id: variation.id || `variation-${Date.now()}-${idx}`,
      progression: Array.isArray(variation.progression) ? variation.progression : [],
      name: variation.name || 'Unnamed Variation',
      rationale: variation.rationale || 'No rationale provided',
      musicTheoryBasis: variation.musicTheoryBasis || 'No theory basis provided',
      mood: variation.mood || 'neutral',
      complexity: typeof variation.complexity === 'number' ? variation.complexity : 5,
      variationType: variation.variationType || 'Variation',
    }));

    return NextResponse.json({
      variations: validatedVariations,
      originalProgression,
      currentKey,
    });
  } catch (error) {
    console.error('Error generating similar variations:', error);
    return NextResponse.json(
      { error: 'Failed to generate similar variations' },
      { status: 500 }
    );
  }
}

