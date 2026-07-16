import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChordProgressionUpdate {
  id: string;
  progression: string[];
  name: string;
  rationale: string;
  musicTheoryBasis: string;
  mood: string;
  complexity: number;
  emotionalChange: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      currentKey,
      currentProgression = [],
      existingUpdates = [],
      currentScaleModes = [],
    } = body;

    if (!currentKey || !currentProgression || currentProgression.length === 0) {
      return NextResponse.json(
        { error: 'Current key and progression are required' },
        { status: 400 }
      );
    }

    const currentProgressionText = currentProgression.join(' - ');
    const existingUpdatesText = existingUpdates
      .map((u: any) => `${u.name}: ${u.progression.join(' - ')}`)
      .join('\n');

    const systemPrompt = `You are an expert music theory assistant specializing in chord progressions and emotional composition.

Your task is to generate 4 MORE UPDATED versions of the current chord progression that change its emotional character and mood while maintaining some musical continuity.

Current Key: ${currentKey}
Current Progression: ${currentProgressionText}
${currentScaleModes.length > 0 ? `Current Scales/Modes: ${currentScaleModes.join(', ')}` : ''}

IMPORTANT: The following updates have already been generated. You MUST create DIFFERENT updates with UNIQUE emotional changes:
${existingUpdatesText}

Guidelines for creating updates:
1. Keep SOME of the original chords (typically 30-60% of the progression) to maintain musical continuity
2. Make STRATEGIC changes to key positions (especially the beginning, middle climax, or ending) to shift the emotional tone
3. Each update should create a DISTINCTLY DIFFERENT emotional feeling from the original AND from the existing updates
4. Focus on changing emotions/vibes/feelings through:
   - Modal interchange (borrowing from parallel modes)
   - Substitution chords (tritone subs, relative minors/majors)
   - Adding/removing tension (7ths, 9ths, suspensions)
   - Changing chord qualities (major to minor, vice versa)
   - Altering harmonic rhythm and movement patterns

5. Provide variety across all recommendations:
   - Some should be darker/more melancholic
   - Some should be brighter/more uplifting
   - Some should add tension/drama
   - Some should create resolution/peace
   - Some should add sophistication/complexity

Return ONLY a valid JSON array of 4 recommendations. Each recommendation must have:
- id: unique identifier
- progression: array of chord symbols in ${currentKey} key (e.g., ["C", "Am", "F", "G"])
- name: descriptive name highlighting the emotional change (e.g., "Darker Melancholic Twist")
- rationale: explain WHAT changed from the original and WHY it creates the new emotional effect
- musicTheoryBasis: music theory explanation of the changes (substitutions, modal interchange, etc.)
- mood: the NEW emotional character (e.g., "melancholic and introspective")
- complexity: 1-10 rating
- emotionalChange: brief description of how the emotion/feeling changed from the original (e.g., "From hopeful to bittersweet")

Use proper chord symbols for ${currentKey} key. Include extensions when they enhance the emotional shift.`;

    const userMessage = `Generate 4 more unique updated versions of the chord progression "${currentProgressionText}" in ${currentKey} that create different emotions and feelings while keeping some of the original progression intact. Make sure they are different from the existing updates.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.9,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse JSON response
    let updates: ChordProgressionUpdate[];
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
      const jsonStr = jsonMatch[1] || content;
      updates = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid JSON response from AI');
    }

    // Validate and ensure proper structure
    if (!Array.isArray(updates)) {
      throw new Error('Response is not an array');
    }

    const validatedUpdates = updates.map((update, idx) => ({
      id: update.id || `update-additional-${Date.now()}-${idx}`,
      progression: Array.isArray(update.progression) ? update.progression : [],
      name: update.name || 'Unnamed Update',
      rationale: update.rationale || 'No rationale provided',
      musicTheoryBasis: update.musicTheoryBasis || 'No theory basis provided',
      mood: update.mood || 'neutral',
      complexity: typeof update.complexity === 'number' ? update.complexity : 5,
      emotionalChange: update.emotionalChange || 'Emotional shift',
      isUpdate: true,
    }));

    return NextResponse.json({
      recommendations: validatedUpdates,
      currentKey,
      originalProgression: currentProgression,
    });
  } catch (error) {
    console.error('Error generating additional updates:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate additional updates' },
      { status: 500 }
    );
  }
}

