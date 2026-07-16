/**
 * POST /api/chord-progression/recommend-next-chord
 *
 * Analyzes the current chord timeline + scale overlaps and returns:
 *  - topRecommendation: single best next chord
 *  - alternatives: up to 5 alternative next chords
 *  - fullCompletion: suggested chord sequence to complete the progression
 *
 * Single gpt-4o-mini call returns all three to avoid redundant API hits.
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ChordContext {
  chordSymbol: string;
  duration: number;
  startTime: number;
}

interface ScaleContext {
  scaleName: string;
  rootNote: string;
  startTime: number;
  duration: number;
}

interface NextChordEntry {
  chordSymbol: string;
  confidence: number; // 0-100
  rationale: string;
  role: string; // e.g. "Subdominant", "Dominant", etc.
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      currentKey,
      currentProgression = [] as ChordContext[],
      currentScaleModes = [] as ScaleContext[],
      userDescriptors = '',
    } = body;

    if (!currentKey || currentProgression.length === 0) {
      return NextResponse.json(
        { error: 'currentKey and at least one chord in currentProgression are required' },
        { status: 400 }
      );
    }

    // Build human-readable timeline description
    const progressionStr = currentProgression
      .map((c: ChordContext) => `${c.chordSymbol}(${c.duration}beats)`)
      .join(' → ');

    const scaleStr = currentScaleModes.length > 0
      ? currentScaleModes
          .map((s: ScaleContext) => `${s.rootNote} ${s.scaleName} [beats ${s.startTime}–${s.startTime + s.duration}]`)
          .join(', ')
      : 'none specified';

    const descriptorStr = userDescriptors?.trim()
      ? `User vibe/genre descriptors: "${userDescriptors}"`
      : '';

    const systemPrompt = `You are an expert music theory assistant specializing in harmonic progression analysis and chord recommendations.
Analyze the provided chord progression timeline and return ONLY valid JSON matching exactly this structure:
{
  "topRecommendation": { "chordSymbol": string, "confidence": number(0-100), "rationale": string(1 sentence), "role": string },
  "alternatives": [ { "chordSymbol": string, "confidence": number, "rationale": string(1 sentence), "role": string } ],
  "fullCompletion": [ string ],
  "fullCompletionRationale": string(1 sentence)
}
Rules:
- alternatives: 4-6 items ordered by confidence descending
- fullCompletion: 2-4 chord symbols that complete the progression musically
- All chord symbols must be valid (e.g. "Am7", "Fmaj7", "G7", "Bdim")
- rationale and role must be concise but musically insightful
- Consider the scale/mode overlaps in timing when making recommendations`;

    const userPrompt = `Key: ${currentKey}
Current timeline: ${progressionStr}
Overlapping scales/modes: ${scaleStr}
${descriptorStr}

Analyze this progression, consider the harmonic context and scale overlaps, then recommend the best next chord and alternatives.`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 600,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) throw new Error('No response from OpenAI');

    const result = JSON.parse(responseText);

    // Validate structure
    if (!result.topRecommendation?.chordSymbol || !Array.isArray(result.alternatives)) {
      throw new Error('Invalid response structure from AI');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in recommend-next-chord:', error);
    return NextResponse.json(
      { error: 'Failed to generate chord recommendations', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
