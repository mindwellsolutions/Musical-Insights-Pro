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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      currentKey,
      userPrompt,
      complexity,
      numChords,
      numRecommendations = 4,
      currentProgression = [],
      currentScaleModes = []
    } = body;

    if (!currentKey) {
      return NextResponse.json(
        { error: 'Current key is required' },
        { status: 400 }
      );
    }

    // Determine if user wants to modify existing or create new
    const hasExistingProgression = currentProgression.length > 0;
    const isModificationRequest = hasExistingProgression && (
      userPrompt?.toLowerCase().includes('modify') ||
      userPrompt?.toLowerCase().includes('change') ||
      userPrompt?.toLowerCase().includes('update') ||
      userPrompt?.toLowerCase().includes('improve') ||
      userPrompt?.toLowerCase().includes('add to')
    );

    const hasScaleModes = currentScaleModes.length > 0;

    const systemPrompt = `You are an expert music theory assistant specializing in chord progressions.
Generate chord progression recommendations based on the user's request.

CURRENT CONTEXT:
- Key: ${currentKey}
- Current Progression: ${hasExistingProgression ? currentProgression.join(' - ') : 'No existing progression'}
- Current Scales/Modes on Timeline: ${hasScaleModes ? currentScaleModes.join(', ') : 'None'}
- User Intent: ${isModificationRequest ? 'Modify existing progression' : 'Create new progression'}

IMPORTANT: All recommendations MUST be specifically tailored to the key of ${currentKey}.
${hasScaleModes ? `Consider the scales/modes already on the timeline (${currentScaleModes.join(', ')}) when making recommendations. Suggest chords that work well with these scales.` : ''}
${hasExistingProgression ? `Build upon or modify the existing progression: ${currentProgression.join(' - ')}` : ''}

Return ONLY a valid JSON array of exactly ${numRecommendations} recommendations. Each recommendation must have:
- id: unique identifier
- progression: array of chord symbols in ${currentKey} key (e.g., ["C", "Am", "F", "G"])
- name: descriptive name (e.g., "Classic Pop Progression")
- rationale: why this progression works for the request AND how it relates to the current key and scales/modes
- musicTheoryBasis: music theory explanation (functional harmony, voice leading, scale compatibility, etc.)
- mood: emotional character (e.g., "uplifting", "melancholic")
- complexity: 1-10 rating

Use proper chord symbols for ${currentKey} key. Include extensions (7th, maj7, etc.) when appropriate for complexity.`;

    const userMessage = userPrompt || `Generate ${numChords || 4} chord progressions in ${currentKey} with complexity level ${complexity || 5}/10`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse JSON response
    let recommendations: ChordProgressionRecommendation[];
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
      const jsonStr = jsonMatch[1] || content;
      recommendations = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid JSON response from AI');
    }

    // Validate and ensure proper structure
    if (!Array.isArray(recommendations)) {
      throw new Error('Response is not an array');
    }

    const validatedRecommendations = recommendations.map((rec, idx) => ({
      id: rec.id || `rec-${Date.now()}-${idx}`,
      progression: Array.isArray(rec.progression) ? rec.progression : [],
      name: rec.name || 'Unnamed Progression',
      rationale: rec.rationale || 'No rationale provided',
      musicTheoryBasis: rec.musicTheoryBasis || 'No theory basis provided',
      mood: rec.mood || 'neutral',
      complexity: typeof rec.complexity === 'number' ? rec.complexity : 5,
      isModification: isModificationRequest,
    }));

    return NextResponse.json({
      recommendations: validatedRecommendations,
      isModification: isModificationRequest,
      currentKey,
    });

  } catch (error) {
    console.error('Error generating chord progression recommendations:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

