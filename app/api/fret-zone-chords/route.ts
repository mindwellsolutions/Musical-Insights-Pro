/**
 * API Route: Fret Zone Chords (Feature B)
 * GET /api/fret-zone-chords?key=C&scale=Major&minFret=5&maxFret=9&stringCount=6
 *
 * Returns chords (triads, 7ths, extended) playable within a fret zone for the
 * given key+scale. Results are fully deterministic — aggressively HTTP-cached.
 */

import { NextRequest, NextResponse } from 'next/server';
import { NOTES, getScaleNotes, getNoteAtFret } from '@/lib/musicTheory';
import { TUNINGS } from '@/lib/musicTheory';

// Simple chord quality definitions for zone-chord generation
const CHORD_TYPES = [
  { quality: 'major',      suffix: '',      intervals: [0, 4, 7],         group: 'triads' },
  { quality: 'minor',      suffix: 'm',     intervals: [0, 3, 7],         group: 'triads' },
  { quality: 'diminished', suffix: 'dim',   intervals: [0, 3, 6],         group: 'triads' },
  { quality: 'major7',     suffix: 'maj7',  intervals: [0, 4, 7, 11],     group: 'seventhChords' },
  { quality: 'minor7',     suffix: 'm7',    intervals: [0, 3, 7, 10],     group: 'seventhChords' },
  { quality: 'dominant7',  suffix: '7',     intervals: [0, 4, 7, 10],     group: 'seventhChords' },
  { quality: 'minor7b5',   suffix: 'm7b5',  intervals: [0, 3, 6, 10],     group: 'seventhChords' },
  { quality: 'major9',     suffix: 'maj9',  intervals: [0, 2, 4, 7, 11],  group: 'extendedChords' },
  { quality: 'minor9',     suffix: 'm9',    intervals: [0, 2, 3, 7, 10],  group: 'extendedChords' },
  { quality: 'dominant9',  suffix: '9',     intervals: [0, 2, 4, 7, 10],  group: 'extendedChords' },
  { quality: 'add9',       suffix: 'add9',  intervals: [0, 2, 4, 7],      group: 'extendedChords' },
  { quality: 'sus2',       suffix: 'sus2',  intervals: [0, 2, 7],         group: 'extendedChords' },
  { quality: 'sus4',       suffix: 'sus4',  intervals: [0, 5, 7],         group: 'extendedChords' },
];

interface ZoneChord {
  symbol: string;
  rootNote: string;
  quality: string;
  notes: string[];
  minFret: number;
  maxFret: number;
}

function getZoneChordsForKey(
  key: string,
  scale: string,
  minFret: number,
  maxFret: number,
  tuning: string[]
): Record<string, ZoneChord[]> {
  let scaleNotes: string[];
  try {
    scaleNotes = getScaleNotes(key, scale);
  } catch {
    scaleNotes = getScaleNotes(key, 'Major');
  }
  if (!scaleNotes || scaleNotes.length === 0) scaleNotes = getScaleNotes(key, 'Major');

  const result: Record<string, ZoneChord[]> = {
    triads: [], seventhChords: [], extendedChords: [],
  };

  const seen = new Set<string>();

  for (const rootNote of scaleNotes) {
    for (const ct of CHORD_TYPES) {
      const rootIdx = NOTES.indexOf(rootNote);
      if (rootIdx === -1) continue;
      const chordNotes = ct.intervals.map(i => NOTES[(rootIdx + i) % 12]);
      // All chord notes must be in the scale
      if (!chordNotes.every(n => scaleNotes.includes(n))) continue;

      const symbol = `${rootNote}${ct.suffix}`;
      const dedupeKey = `${symbol}-${ct.group}`;
      if (seen.has(dedupeKey)) continue;

      // Check if there's a playable voicing in the fret zone
      let zoneMinFret = Infinity;
      let zoneMaxFret = -Infinity;
      let notesFound = 0;

      for (const note of chordNotes) {
        let foundInZone = false;
        for (let s = 0; s < tuning.length; s++) {
          for (let f = minFret; f <= maxFret; f++) {
            if (getNoteAtFret(tuning[s], f) === note) {
              zoneMinFret = Math.min(zoneMinFret, f);
              zoneMaxFret = Math.max(zoneMaxFret, f);
              foundInZone = true;
              break;
            }
          }
          if (foundInZone) break;
        }
        if (foundInZone) notesFound++;
      }

      // Accept if at least 2/3 of chord notes are reachable in the zone
      const threshold = Math.ceil(chordNotes.length * 0.67);
      if (notesFound >= threshold) {
        seen.add(dedupeKey);
        result[ct.group].push({
          symbol,
          rootNote,
          quality: ct.quality,
          notes: chordNotes,
          minFret: zoneMinFret === Infinity ? minFret : zoneMinFret,
          maxFret: zoneMaxFret === -Infinity ? maxFret : zoneMaxFret,
        });
      }
    }
  }

  return result;
}

export async function GET(request: NextRequest) {
  try {
    const p = request.nextUrl.searchParams;
    const key = p.get('key');
    const scale = p.get('scale') || 'Major';
    const minFret = parseInt(p.get('minFret') || '0', 10);
    const maxFret = parseInt(p.get('maxFret') || '4', 10);
    const stringCount = parseInt(p.get('stringCount') || '6', 10) as 6 | 7;

    if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });

    const validKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
                       'Bb', 'Db', 'Eb', 'Gb', 'Ab'];
    if (!validKeys.includes(key)) return NextResponse.json({ error: `Invalid key: ${key}` }, { status: 400 });

    const tuning: string[] = stringCount === 7
      ? (TUNINGS[7]?.['Standard'] ?? ['B', 'E', 'A', 'D', 'G', 'B', 'E'])
      : (TUNINGS[6]?.['Standard'] ?? ['E', 'A', 'D', 'G', 'B', 'E']);

    const grouped = getZoneChordsForKey(key, scale, minFret, maxFret, tuning);

    return NextResponse.json(
      { zone: { minFret, maxFret }, key, scale, ...grouped },
      { headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' } }
    );
  } catch (error) {
    console.error('Error in fret-zone-chords API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
