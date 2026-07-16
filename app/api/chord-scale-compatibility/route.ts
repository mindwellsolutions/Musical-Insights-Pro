/**
 * API Route: Chord-Scale Compatibility
 * GET /api/chord-scale-compatibility?chord=Cmaj7
 * 
 * Returns compatible scales for a given chord
 */

import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import {
  ChordScaleCompatibilityResponse,
  ChordScaleCompatibility,
} from '@/lib/chord-scale-compatibility/types';

/**
 * Parse chord symbol to extract quality
 */
function parseChordQuality(chordSymbol: string): string | null {
  const rootMatch = chordSymbol.match(/^[A-G][#b]?/);
  if (!rootMatch) return null;

  const suffix = chordSymbol.slice(rootMatch[0].length);

  const qualityMap: Record<string, string> = {
    '': 'major',
    'm': 'minor',
    'min': 'minor',
    '°': 'diminished',
    'dim': 'diminished',
    '+': 'augmented',
    'aug': 'augmented',
    'maj7': 'major7',
    'M7': 'major7',
    'm7': 'minor7',
    'min7': 'minor7',
    '7': 'dominant7',
    'dom7': 'dominant7',
    '°7': 'diminished7',
    'dim7': 'diminished7',
    'm7♭5': 'half-diminished7',
    'ø7': 'half-diminished7',
    'maj9': 'major9',
    'M9': 'major9',
    'm9': 'minor9',
    '9': 'dominant9',
    'maj11': 'major11',
    'm11': 'minor11',
    '11': 'dominant11',
    'maj13': 'major13',
    'm13': 'minor13',
    '13': 'dominant13',
    'sus2': 'sus2',
    'sus4': 'sus4',
    '6': 'major6',
    'm6': 'minor6',
    'add9': 'add9',
    'madd9': 'minor-add9',
  };

  return qualityMap[suffix] || null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chord = searchParams.get('chord');

    if (!chord) {
      return NextResponse.json(
        { error: 'Missing required parameter: chord' },
        { status: 400 }
      );
    }

    // Parse chord quality
    const quality = parseChordQuality(chord);
    if (!quality) {
      return NextResponse.json(
        { error: `Could not parse chord quality from: ${chord}` },
        { status: 400 }
      );
    }

    // Load compatibility data from file system
    const filePath = path.join(
      process.cwd(),
      'public',
      'data',
      'chord-scale-compatibility',
      `${quality}.json`
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `No compatibility data found for chord quality: ${quality}` },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const compatibility: ChordScaleCompatibility = JSON.parse(fileContent);

    const response: ChordScaleCompatibilityResponse = {
      chord,
      chordQuality: compatibility.chordQuality,
      displayName: compatibility.displayName,
      compatibleScales: compatibility.compatibleScales,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in chord-scale-compatibility API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

