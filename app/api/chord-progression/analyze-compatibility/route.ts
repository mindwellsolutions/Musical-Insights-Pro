/**
 * API Route: Analyze Chord Progression Compatibility
 * POST /api/chord-progression/analyze-compatibility
 * 
 * Uses GPT-4o-mini to analyze how well a chord progression works with a given key
 * Returns a compatibility score (0-100%) with rationale and recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface CompatibilityRequest {
  key: string;
  chordProgression: string[]; // Array of chord symbols in order
}

interface CompatibilityResponse {
  score: number; // 0-100
  rationale: string; // Single sentence explaining the score
  recommendations: string; // Single sentence with valuable recommendations
}

export async function POST(request: NextRequest) {
  try {
    const body: CompatibilityRequest = await request.json();
    const { key, chordProgression } = body;

    if (!key || !chordProgression || chordProgression.length === 0) {
      return NextResponse.json(
        { error: 'Key and chord progression are required' },
        { status: 400 }
      );
    }

    // Build a minimal prompt for GPT-4o-mini to minimize token usage
    const systemPrompt = `You are a music theory expert. Analyze chord progression compatibility with the given key. Respond ONLY with valid JSON in this exact format:
{
  "score": <number 0-100>,
  "rationale": "<single sentence explaining the score>",
  "recommendations": "<single sentence with valuable recommendations>"
}`;

    const userPrompt = `Key: ${key}
Chord Progression: ${chordProgression.join(' → ')}

Analyze this progression's compatibility with the key. Consider:
- Diatonic vs non-diatonic chords
- Voice leading and harmonic flow
- Common progressions and patterns
- Tension and resolution

Respond with JSON only.`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Lower temperature for more consistent analysis
      max_tokens: 150, // Keep it minimal for cost efficiency
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    const result: CompatibilityResponse = JSON.parse(responseText);

    // Validate the response
    if (
      typeof result.score !== 'number' ||
      result.score < 0 ||
      result.score > 100 ||
      typeof result.rationale !== 'string' ||
      typeof result.recommendations !== 'string'
    ) {
      throw new Error('Invalid response format from OpenAI');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing chord progression compatibility:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze chord progression compatibility',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

