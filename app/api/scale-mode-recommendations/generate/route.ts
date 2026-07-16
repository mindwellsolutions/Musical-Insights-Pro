import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChordInfo {
  chordSymbol: string;
  rootNote: string;
  chordQuality: string;
}

interface ScaleModeRecommendation {
  scaleName: string;
  rootNote: string;
  rationale: string;
  compatibilityScore: number;
  genreContext?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userVision,
      chordProgression = [],
      currentKey = 'C',
    } = body;

    if (!userVision || typeof userVision !== 'string') {
      return NextResponse.json(
        { error: 'User vision is required' },
        { status: 400 }
      );
    }

    // Build chord progression context
    const chordsText = chordProgression.length > 0
      ? chordProgression.map((c: ChordInfo) => c.chordSymbol).join(' - ')
      : 'No chords in progression yet';

    const systemPrompt = `You are an expert music theory assistant specializing in scale and mode recommendations for guitar.

Your task is to recommend scales and modes that work well over an entire chord progression, allowing the musician to improvise using a single scale/mode across all chords.

CRITICAL: You MUST respond with valid JSON only. Use double quotes for all strings.

Response format:
{
  "recommendations": [
    {
      "scaleName": "Dorian",
      "rootNote": "D",
      "rationale": "Works perfectly over the entire progression with minor tonality",
      "compatibilityScore": 9,
      "genreContext": "Jazz, Funk"
    }
  ]
}

SCALE/MODE NAMES (use EXACTLY these names):
- Ionian
- Dorian
- Phrygian
- Lydian
- Mixolydian
- Aeolian
- Locrian
- Melodic Minor
- Dorian b2
- Lydian Augmented
- Lydian Dominant
- Mixolydian b6
- Locrian Natural 2
- Altered
- Harmonic Minor
- Locrian Natural 6
- Ionian #5
- Dorian #4
- Phrygian Dominant
- Lydian #2
- Super Locrian bb7
- Major Pentatonic
- Minor Pentatonic
- Major Blues
- Minor Blues
- Whole Tone
- Diminished (Whole-Half)
- Diminished (Half-Whole)
- Chromatic

ROOT NOTE NAMES (use EXACTLY these names):
C, C#, Db, D, D#, Eb, E, F, F#, Gb, G, G#, Ab, A, A#, Bb, B, Cb, E#, Fb, B#

RULES:
1. Recommend 3-8 scales/modes that work over the ENTIRE chord progression
2. Focus on scales that are completely or mostly compatible with ALL chords
3. compatibilityScore: 1-10 (10 = perfect fit for all chords, 7-9 = works well, 5-6 = partial fit)
4. Keep rationale brief (1-2 sentences)
5. Consider the user's musical vision when selecting scales
6. Prioritize scales that allow smooth improvisation across the whole progression`;

    const userMessage = `Current Key: ${currentKey}
Chord Progression: ${chordsText}

User's Vision: ${userVision}

Please recommend scales and modes that work well over this entire chord progression, allowing me to improvise using a single scale across all the chords.`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid JSON response from AI');
    }

    const recommendations: ScaleModeRecommendation[] = parsedResponse.recommendations || [];

    // Validate recommendations
    if (!Array.isArray(recommendations) || recommendations.length === 0) {
      throw new Error('No valid recommendations returned');
    }

    return NextResponse.json({
      recommendations,
      success: true,
    });

  } catch (error) {
    console.error('Error generating scale/mode recommendations:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

