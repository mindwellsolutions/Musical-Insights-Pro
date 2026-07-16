import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChordProgressionRecommendation {
  id: string;
  progression: string[];
  name: string;
  rationale: string;
  musicTheoryBasis: string;
  mood: string;
  complexity: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      currentKey,
      userPrompt,
      complexity,
      numChords,
      numRecommendations = 4,
      existingRecommendations = [],
      currentScaleModes = []
    } = body;

    if (!currentKey) {
      return NextResponse.json(
        { error: 'Current key is required' },
        { status: 400 }
      );
    }

    // Build list of existing progressions to avoid duplicates
    const existingProgressionsText = existingRecommendations
      .map((rec: ChordProgressionRecommendation) => `${rec.name}: [${rec.progression.join(', ')}]`)
      .join('\n');

    const systemPrompt = `You are an expert music theory assistant specializing in chord progressions.
Generate NEW and UNIQUE chord progression recommendations that are DIFFERENT from the existing ones.

CURRENT CONTEXT:
- Key: ${currentKey}
- Requested Complexity Level: ${complexity || 5}/10
- Requested Progression Length: ${numChords || 4} chords (THIS IS MANDATORY - DO NOT GENERATE FEWER OR MORE)
- Number of NEW Recommendations to Generate: ${numRecommendations} (THIS IS MANDATORY - GENERATE EXACTLY THIS MANY)
${currentScaleModes.length > 0 ? `- Current Scale/Mode Context: ${currentScaleModes.join(', ')}` : ''}

EXISTING PROGRESSIONS TO AVOID (DO NOT DUPLICATE THESE):
${existingProgressionsText || 'None yet'}

IMPORTANT REQUIREMENTS:
1. Generate EXACTLY ${numRecommendations} NEW recommendations
2. Each progression must have EXACTLY ${numChords || 4} chords
3. DO NOT duplicate any of the existing progressions listed above
4. Provide valuable variety - explore different harmonic territories, moods, and theoretical approaches
5. Use proper chord symbols for ${currentKey} key
6. Include extensions (7th, maj7, sus, add9, etc.) when appropriate for complexity
7. Consider modal interchange, secondary dominants, and other advanced techniques for variety

RESPONSE FORMAT:
Return ONLY a valid JSON array of exactly ${numRecommendations} recommendations. Each recommendation must have:
- id: unique identifier
- progression: array of chord symbols in ${currentKey} key (e.g., ["C", "Am", "F", "G"])
- name: descriptive name (e.g., "Modal Interchange Journey")
- rationale: why this progression works and how it differs from existing ones
- musicTheoryBasis: detailed music theory explanation (functional harmony, voice leading, modal concepts, etc.)
- mood: emotional character (e.g., "uplifting", "melancholic", "mysterious")
- complexity: 1-10 rating

Use proper chord symbols for ${currentKey} key. Explore different harmonic approaches to provide genuine variety.`;

    const userMessage = userPrompt || `Generate ${numChords || 4} NEW chord progressions in ${currentKey} that are different from the existing ones, with complexity level ${complexity || 5}/10`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.9, // Higher temperature for more variety
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

    const recommendations = JSON.parse(jsonMatch[0]);

    // Validate and sanitize recommendations
    const validatedRecommendations = recommendations.map((rec: any, idx: number) => ({
      id: rec.id || `rec-additional-${Date.now()}-${idx}`,
      progression: Array.isArray(rec.progression) ? rec.progression : [],
      name: rec.name || 'Unnamed Progression',
      rationale: rec.rationale || 'No rationale provided',
      musicTheoryBasis: rec.musicTheoryBasis || 'No theory basis provided',
      mood: rec.mood || 'neutral',
      complexity: typeof rec.complexity === 'number' ? rec.complexity : 5,
    }));

    return NextResponse.json({
      recommendations: validatedRecommendations,
      currentKey,
    });
  } catch (error) {
    console.error('Error generating additional recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate additional recommendations' },
      { status: 500 }
    );
  }
}

