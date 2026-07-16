import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { query, trackType, currentChords } = await request.json();

    if (!query || !trackType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Build context for AI
    const context = buildContext(trackType, currentChords);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert music theory assistant specializing in ${trackType === 'chord' ? 'chord progressions' : 'scale modes'}. 
          Provide practical, actionable recommendations that can be directly implemented.
          Always respond with a JSON array of recommendations, each with: id, title, description, reasoning, and ${trackType === 'chord' ? 'chords' : 'scales'} array.`,
        },
        {
          role: 'user',
          content: `${context}\n\nUser Query: ${query}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0]?.message?.content || '[]';
    
    // Parse AI response
    let recommendations = [];
    try {
      const parsed = JSON.parse(responseText);
      recommendations = Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      // If AI didn't return valid JSON, create a fallback recommendation
      recommendations = createFallbackRecommendations(trackType, query);
    }

    // Add unique IDs if not present
    recommendations = recommendations.map((rec: any, index: number) => ({
      ...rec,
      id: rec.id || `rec-${Date.now()}-${index}`,
    }));

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('AI Insights API Error:', error);
    
    // Return fallback recommendations on error
    const { trackType, query } = await request.json();
    const recommendations = createFallbackRecommendations(trackType, query);
    
    return NextResponse.json({ recommendations });
  }
}

function buildContext(trackType: string, currentChords: any[]): string {
  if (trackType === 'chord') {
    if (!currentChords || currentChords.length === 0) {
      return 'The user has no chords in their progression yet.';
    }

    const chordSymbols = currentChords.map(c => c.chordSymbol).join(' - ');
    return `Current chord progression: ${chordSymbols}`;
  }

  return `The user is working with ${trackType} tracks.`;
}

function createFallbackRecommendations(trackType: string, query: string): any[] {
  if (trackType === 'chord') {
    return [
      {
        id: 'fallback-1',
        title: 'Classic I-V-vi-IV Progression',
        description: 'A timeless progression used in countless hit songs',
        reasoning: 'This progression creates a strong sense of resolution and emotional movement',
        chords: [
          { chordSymbol: 'C', duration: 4 },
          { chordSymbol: 'G', duration: 4 },
          { chordSymbol: 'Am', duration: 4 },
          { chordSymbol: 'F', duration: 4 },
        ],
      },
      {
        id: 'fallback-2',
        title: 'Jazz ii-V-I Progression',
        description: 'The foundation of jazz harmony',
        reasoning: 'Creates smooth voice leading and sophisticated harmonic movement',
        chords: [
          { chordSymbol: 'Dm7', duration: 4 },
          { chordSymbol: 'G7', duration: 4 },
          { chordSymbol: 'Cmaj7', duration: 8 },
        ],
      },
      {
        id: 'fallback-3',
        title: 'Modal Interchange',
        description: 'Borrow chords from parallel minor for color',
        reasoning: 'Adds emotional depth and unexpected harmonic color',
        chords: [
          { chordSymbol: 'C', duration: 4 },
          { chordSymbol: 'Fm', duration: 4 },
          { chordSymbol: 'G', duration: 4 },
          { chordSymbol: 'C', duration: 4 },
        ],
      },
    ];
  }

  return [
    {
      id: 'fallback-scale-1',
      title: 'Dorian Mode',
      description: 'Perfect for minor key progressions with a brighter sound',
      reasoning: 'The raised 6th degree creates a unique minor sound',
    },
  ];
}

