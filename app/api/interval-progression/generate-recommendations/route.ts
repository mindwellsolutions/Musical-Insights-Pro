import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentKey, currentScale, userPrompt, complexity = 5, numChords = 4, numRecommendations = 5 } = body;

    if (!currentKey || !currentScale) {
      return NextResponse.json({ error: 'currentKey and currentScale are required' }, { status: 400 });
    }

    const DIATONIC_DEGREES = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

    const systemPrompt = `You are an expert music theory assistant specializing in diatonic chord progressions.
Generate interval-based chord progression recommendations using ONLY diatonic scale degrees.

CURRENT CONTEXT:
- Key: ${currentKey}
- Scale: ${currentScale}
- Available degrees: ${DIATONIC_DEGREES.join(', ')}
- Complexity target: ${complexity}/10

RULES:
1. Use ONLY these Roman numeral degrees: I, ii, iii, IV, V, vi, vii°
2. Each progression should have ${numChords} degrees (can repeat degrees)
3. Uppercase = major/augmented, lowercase = minor/diminished
4. vii° is always diminished

Return ONLY a valid JSON array of exactly ${numRecommendations} objects. Each must have:
- id: unique string
- name: descriptive progression name (e.g., "Classic Pop", "Jazz ii-V-I")
- degrees: array of Roman numeral strings from the allowed list
- rationale: why this works for the user's request in ${currentKey} ${currentScale}
- emotionalContext: emotional mood or feel (e.g., "uplifting and anthemic")
- mood: one-word mood label (e.g., "melancholic")
- complexity: 1-10 rating
- musicTheoryBasis: brief theory explanation (functional harmony, voice leading, etc.)`;

    const userMessage = userPrompt
      ? `${userPrompt} (in ${currentKey} ${currentScale})`
      : `Generate ${numChords}-chord progressions in ${currentKey} ${currentScale} at complexity ${complexity}/10`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    let recommendations;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
      recommendations = JSON.parse((jsonMatch[1] || content).trim());
    } catch {
      throw new Error('Invalid JSON response from AI');
    }

    if (!Array.isArray(recommendations)) throw new Error('Response is not an array');

    const validated = recommendations.map((rec: any, idx: number) => ({
      id: rec.id || `rec-${Date.now()}-${idx}`,
      name: rec.name || 'Unnamed Progression',
      degrees: Array.isArray(rec.degrees) ? rec.degrees : [],
      rationale: rec.rationale || '',
      emotionalContext: rec.emotionalContext || rec.mood || '',
      mood: rec.mood || 'neutral',
      complexity: typeof rec.complexity === 'number' ? rec.complexity : complexity,
      musicTheoryBasis: rec.musicTheoryBasis || '',
    }));

    return NextResponse.json({ recommendations, currentKey, currentScale });
  } catch (error) {
    console.error('Error generating interval progression recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
