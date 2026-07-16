/**
 * API Route: Progression Interval Compatible Chords
 * GET /api/progression-interval-chords?key=C
 * GET /api/progression-interval-chords?key=C&degree=I
 *
 * Returns the full IntervalChordDatabase for a key, or compatible chords for a specific degree.
 * Music theory data is static — aggressively cached.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProgressionIntervalChords, getCompatibleChordsForDegree } from '@/lib/music-theory/progression-interval-chords/loader';

const FLAT_TO_KEY: Record<string, string> = {
  'Bb': 'A#', 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#',
};

function normalizeKey(key: string): string {
  return FLAT_TO_KEY[key] ?? key;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawKey = searchParams.get('key');
    const degree = searchParams.get('degree');

    if (!rawKey) {
      return NextResponse.json({ error: 'Missing required parameter: key' }, { status: 400 });
    }

    const key = normalizeKey(rawKey);
    const validKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    if (!validKeys.includes(key)) {
      return NextResponse.json({ error: `Invalid key: ${rawKey}` }, { status: 400 });
    }

    const headers = {
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    };

    if (degree) {
      // Return compatible chords for a specific degree
      const compatibleChords = getCompatibleChordsForDegree(key, degree);
      if (compatibleChords.length === 0) {
        return NextResponse.json(
          { error: `No data for degree: ${degree} in key: ${key}` },
          { status: 404, headers }
        );
      }
      const db = getProgressionIntervalChords(key);
      const degreeEntry = db.scaleDegrees[degree];
      return NextResponse.json({
        key,
        degree,
        rootNote: degreeEntry?.rootNote ?? key,
        compatibleChords,
      }, { headers });
    }

    // Return full database for the key
    const db = getProgressionIntervalChords(key);
    return NextResponse.json(db, { headers });
  } catch (error) {
    console.error('Error in progression-interval-chords API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
