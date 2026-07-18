import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { TargetNoteSetSlim } from '@/lib/target-notes/types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentKey, currentScale, scaleNotes, userPrompt } = body as {
      currentKey: string;
      currentScale: string;
      scaleNotes: string[];
      userPrompt: string;
    };

    if (!currentKey || !currentScale || !Array.isArray(scaleNotes) || scaleNotes.length === 0) {
      return NextResponse.json({ error: 'currentKey, currentScale, and scaleNotes are required' }, { status: 400 });
    }
    if (!userPrompt?.trim()) {
      return NextResponse.json({ error: 'userPrompt is required' }, { status: 400 });
    }

    const systemPrompt = `You are an expert music theory assistant specializing in fretboard visualization and note selection for guitarists.

The user has a guitar fretboard displaying the ${currentKey} ${currentScale} scale.
Scale notes available: ${scaleNotes.join(', ')}

The user wants to highlight specific "target notes" on their fretboard to express a particular mood or feeling.
Your job: recommend 5 distinct groupings of 2–5 notes from ONLY the available scale notes above.
Each grouping should evoke the user's requested mood through specific music theory reasoning.

RULES:
- Every note you recommend MUST appear in the scale notes list above. No exceptions.
- Each set must be meaningfully different from the others (different degrees, different intervals).
- Note names must match exactly as given in the scale notes list.
- Vary the number of notes per set (some 2-note sets, some 3-note, some 4-note).
- Think in terms of: intervals, scale degrees, tension/resolution, color tones, characteristic tones.

Return ONLY a valid JSON array of exactly 5 objects. No markdown, no explanation outside the JSON.
Each object: { "label": string, "notes": string[], "rationale": string, "moodKeywords": string[], "theoryBasis": string }
- label: short evocative name (2-4 words)
- notes: array of note names from the scale
- rationale: 2-3 sentences explaining why this set evokes the mood
- moodKeywords: 3-5 single words describing the emotional quality
- theoryBasis: one sentence naming the exact scale degrees/intervals used`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt.trim() },
      ],
      temperature: 0.85,
      max_tokens: 1500,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    // Parse JSON — handle markdown code blocks if present
    let rawRecs: any[];
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
      rawRecs = JSON.parse((jsonMatch[1] || content).trim());
    } catch {
      throw new Error('Invalid JSON response from AI');
    }

    if (!Array.isArray(rawRecs)) throw new Error('Response is not an array');

    // Validate and filter — ensure notes are in scaleNotes
    const recommendations: TargetNoteSetSlim[] = rawRecs.slice(0, 5).map((rec: any) => ({
      label: rec.label || 'Untitled',
      notes: Array.isArray(rec.notes)
        ? rec.notes.filter((n: string) => scaleNotes.includes(n))
        : [],
      rationale: rec.rationale || '',
      moodKeywords: Array.isArray(rec.moodKeywords) ? rec.moodKeywords : [],
      theoryBasis: rec.theoryBasis || '',
    }));

    return NextResponse.json({
      recommendations,
      currentKey,
      currentScale,
      scaleNotes,
    });
  } catch (error) {
    console.error('Error generating target notes:', error);
    return NextResponse.json(
      { error: 'Failed to generate target note recommendations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
