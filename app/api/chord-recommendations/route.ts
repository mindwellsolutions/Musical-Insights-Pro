/**
 * API Route: Chord Recommendations
 * GET /api/chord-recommendations?key=C&scale=Ionian
 * 
 * Returns recommended chords for a given key-scale combination
 */

import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import {
  ChordRecommendationsResponse,
  ChordRecommendations,
} from '@/lib/chord-recommendations/types';

/**
 * Normalize key name for file path
 * Examples: "A" → "a", "A#" → "a-sharp", "Bb" → "a-sharp", "B" → "b"
 */
function normalizeKeyName(key: string): string {
  const normalized = key.trim().toUpperCase();

  // Map all keys to their normalized file names
  const keyMap: Record<string, string> = {
    'A': 'a',
    'A#': 'a-sharp',
    'BB': 'a-sharp',
    'B': 'b',
    'C': 'c',
    'C#': 'c-sharp',
    'DB': 'c-sharp',
    'D': 'd',
    'D#': 'd-sharp',
    'EB': 'd-sharp',
    'E': 'e',
    'F': 'f',
    'F#': 'f-sharp',
    'GB': 'f-sharp',
    'G': 'g',
    'G#': 'g-sharp',
    'AB': 'g-sharp',
  };

  return keyMap[normalized] || normalized.toLowerCase();
}

/**
 * Normalize scale name for file path
 * Handles common scale name variations and word order
 */
function normalizeScaleName(scale: string): string {
  const normalized = scale
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/-/g, '');

  // Map common scale name variations to their file names
  const scaleNameMap: Record<string, string> = {
    // Pentatonic variations
    'pentatonicminor': 'minorpentatonic',
    'pentatonicmajor': 'majorpentatonic',
    'minorpent': 'minorpentatonic',
    'majorpent': 'majorpentatonic',

    // Harmonic/Melodic variations
    'minorharmonic': 'harmonicminor',
    'minormelodic': 'melodicminor',

    // Mode names (already correct, but adding for completeness)
    'major': 'ionian',
    'minor': 'aeolian',
    'naturalminor': 'aeolian',
  };

  return scaleNameMap[normalized] || normalized;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');
    const scale = searchParams.get('scale');

    if (!key || !scale) {
      return NextResponse.json(
        { error: 'Missing required parameters: key and scale' },
        { status: 400 }
      );
    }

    // Normalize names for file path
    const normalizedKey = normalizeKeyName(key);
    const normalizedScale = normalizeScaleName(scale);

    // Load recommendations data from file system
    const filePath = path.join(
      process.cwd(),
      'data',
      'chord-recommendations',
      `${normalizedKey}-${normalizedScale}.json`
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `No recommendations found for ${key} ${scale}. Looking for: ${normalizedKey}-${normalizedScale}.json` },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const recommendations: ChordRecommendations = JSON.parse(fileContent);

    const response: ChordRecommendationsResponse = {
      key: recommendations.key,
      scale: recommendations.scale,
      quality: recommendations.quality,
      diatonicChords: recommendations.diatonicChords,
      extendedChords: recommendations.extendedChords,
      modalInterchangeChords: recommendations.modalInterchangeChords,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in chord-recommendations API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

