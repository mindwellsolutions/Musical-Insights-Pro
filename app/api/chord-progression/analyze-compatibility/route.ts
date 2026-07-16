/**
 * API Route: Analyze Chord Progression Compatibility
 * POST /api/chord-progression/analyze-compatibility
 *
 * Pure local music-theory engine — no OpenAI needed.
 * Scores the progression by counting diatonic vs non-diatonic chords,
 * detecting common cadences, and flagging harmonic patterns.
 */

import { NextRequest, NextResponse } from 'next/server';

// ─── Music theory primitives ────────────────────────────────────────────────

const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const ENHARMONIC: Record<string, string> = {
  Db: 'C#', Eb: 'D#', Fb: 'E', Gb: 'F#', Ab: 'G#', Bb: 'A#', Cb: 'B',
};

// Scale intervals (semitones from root)
const SCALE_INTERVALS: Record<string, number[]> = {
  major:          [0, 2, 4, 5, 7, 9, 11],
  minor:          [0, 2, 3, 5, 7, 8, 10],
  dorian:         [0, 2, 3, 5, 7, 9, 10],
  mixolydian:     [0, 2, 4, 5, 7, 9, 10],
  lydian:         [0, 2, 4, 6, 7, 9, 11],
  phrygian:       [0, 1, 3, 5, 7, 8, 10],
  locrian:        [0, 1, 3, 5, 6, 8, 10],
  harmonicminor:  [0, 2, 3, 5, 7, 8, 11],
  melodicminor:   [0, 2, 3, 5, 7, 9, 11],
  pentatonicmajor:[0, 2, 4, 7, 9],
  pentatonicminor:[0, 3, 5, 7, 10],
  blues:          [0, 3, 5, 6, 7, 10],
};

function normalizeNote(n: string): string {
  return ENHARMONIC[n] ?? n;
}

function noteIndex(n: string): number {
  return CHROMATIC.indexOf(normalizeNote(n));
}

/** Semitone interval between two notes (0-11) */
function interval(from: string, to: string): number {
  const a = noteIndex(from);
  const b = noteIndex(to);
  if (a === -1 || b === -1) return -1;
  return (b - a + 12) % 12;
}

/** Parse a chord symbol → { root, quality } */
function parseChord(symbol: string): { root: string; quality: string } | null {
  const match = symbol.match(/^([A-G][#b]?)(.*)/);
  if (!match) return null;
  return { root: match[1], quality: (match[2] || '').toLowerCase().trim() };
}

/** Get scale note set for a key */
function scaleNotes(key: string, scale: number[]): Set<string> {
  const root = noteIndex(normalizeNote(key));
  if (root === -1) return new Set();
  const notes = new Set<string>();
  for (const interval of scale) {
    notes.add(CHROMATIC[(root + interval) % 12]);
  }
  return notes;
}

/** Check if a chord root is diatonic to the key's major scale */
function isDiatonic(chordRoot: string, keyRoot: string): boolean {
  const set = scaleNotes(keyRoot, SCALE_INTERVALS.major);
  return set.has(normalizeNote(chordRoot));
}

/** Check if the chord quality is "major-family" */
function isMajorQuality(quality: string): boolean {
  if (!quality || quality === '' || quality === 'maj' || quality === 'major') return true;
  return /^(maj|add|6$|6\/9|sus)/.test(quality) && !quality.startsWith('min');
}

/** Check if the chord quality is "minor-family" */
function isMinorQuality(quality: string): boolean {
  return /^(m|min|minor)/.test(quality) && !quality.startsWith('maj');
}

// ─── Cadence detection ──────────────────────────────────────────────────────

interface CadenceResult {
  count: number;
  descriptions: string[];
}

function detectCadences(chords: string[], key: string): CadenceResult {
  const result: CadenceResult = { count: 0, descriptions: [] };
  if (chords.length < 2) return result;

  const tonicRoot = normalizeNote(key);

  for (let i = 0; i < chords.length - 1; i++) {
    const a = parseChord(chords[i]);
    const b = parseChord(chords[i + 1]);
    if (!a || !b) continue;

    const aRoot = normalizeNote(a.root);
    const bRoot = normalizeNote(b.root);
    const semitones = interval(aRoot, bRoot);

    // Authentic cadence: V → I (7 semitones down = 5 semitones up)
    if (semitones === 5 && bRoot === tonicRoot) {
      result.count++;
      result.descriptions.push(`authentic cadence (${chords[i]}→${chords[i + 1]})`);
    }
    // Plagal cadence: IV → I (5 semitones down = 7 up)
    else if (semitones === 7 && bRoot === tonicRoot) {
      result.count++;
      result.descriptions.push(`plagal cadence (${chords[i]}→${chords[i + 1]})`);
    }
    // Deceptive: V → vi (semitones from V to vi = 2)
    else if (semitones === 2 && interval(tonicRoot, aRoot) === 7) {
      result.count++;
      result.descriptions.push(`deceptive cadence (${chords[i]}→${chords[i + 1]})`);
    }
    // ii–V–I pattern (jazz)
    if (i < chords.length - 2) {
      const c = parseChord(chords[i + 2]);
      if (c) {
        const cRoot = normalizeNote(c.root);
        const ab = interval(aRoot, bRoot);
        const bc = interval(bRoot, cRoot);
        if (ab === 5 && bc === 5 && cRoot === tonicRoot) {
          result.count++;
          result.descriptions.push(`ii–V–I (${chords[i]}→${chords[i + 1]}→${chords[i + 2]})`);
        }
      }
    }
  }

  return result;
}

// ─── Main scoring engine ────────────────────────────────────────────────────

interface AnalysisResult {
  score: number;
  rationale: string;
  recommendations: string;
}

function analyzeProgression(key: string, chordProgression: string[]): AnalysisResult {
  if (chordProgression.length === 0) {
    return { score: 0, rationale: 'No chords to analyze.', recommendations: 'Add chords to the timeline.' };
  }

  const keyRoot = normalizeNote(key.replace(/\s*(major|minor|maj|min).*/i, '').trim());
  const majorScaleNotes = scaleNotes(keyRoot, SCALE_INTERVALS.major);
  const minorScaleNotes = scaleNotes(keyRoot, SCALE_INTERVALS.minor);

  // ── Per-chord analysis ──
  let diatonicCount = 0;
  let nonDiatonicCount = 0;
  let dominantPresent = false;
  let tonicPresent = false;
  const nonDiatonicChords: string[] = [];

  for (const symbol of chordProgression) {
    const chord = parseChord(symbol);
    if (!chord) continue;

    const chordRoot = normalizeNote(chord.root);
    const semFromKey = interval(keyRoot, chordRoot);

    const inMajor = majorScaleNotes.has(chordRoot);
    const inMinor = minorScaleNotes.has(chordRoot);

    if (inMajor || inMinor) {
      diatonicCount++;
    } else {
      nonDiatonicCount++;
      nonDiatonicChords.push(symbol);
    }

    // Dominant function: chord built on the 5th degree (7 semitones up)
    if (semFromKey === 7) dominantPresent = true;
    // Tonic function: chord built on the root
    if (semFromKey === 0) tonicPresent = true;
  }

  const total = chordProgression.length;
  const diatonicRatio = diatonicCount / total;

  // ── Cadence detection ──
  const cadences = detectCadences(chordProgression, keyRoot);

  // ── Scoring ──
  // Base score from diatonic ratio: 0→40 pts
  let score = Math.round(diatonicRatio * 40);

  // Cadences add up to 25 pts
  score += Math.min(cadences.count * 10, 25);

  // Dominant + tonic present = good harmonic arc (+15)
  if (dominantPresent && tonicPresent) score += 15;
  else if (dominantPresent || tonicPresent) score += 7;

  // Tonic-start bonus (+5): progression starts on the tonic chord
  const firstChord = parseChord(chordProgression[0]);
  if (firstChord && normalizeNote(firstChord.root) === keyRoot) score += 5;

  // Tonic-end bonus (+10): progression resolves back to tonic
  const lastChord = parseChord(chordProgression[chordProgression.length - 1]);
  if (lastChord && normalizeNote(lastChord.root) === keyRoot) score += 10;

  // Variety bonus: 3–6 unique chords feels complete (+5)
  const uniqueChords = new Set(chordProgression.map(c => parseChord(c)?.root ?? '')).size;
  if (uniqueChords >= 3 && uniqueChords <= 6) score += 5;

  score = Math.min(100, Math.max(0, score));

  // ── Human-readable output ──
  const progressionStr = chordProgression.join(' → ');

  let rationale: string;
  if (score >= 85) {
    rationale = `${progressionStr} is highly cohesive in ${key} — ${Math.round(diatonicRatio * 100)}% diatonic chords${cadences.count > 0 ? ` with ${cadences.descriptions[0]}` : ''}.`;
  } else if (score >= 65) {
    const chromNote = nonDiatonicCount > 0
      ? ` and ${nonDiatonicCount} chromatic chord${nonDiatonicCount > 1 ? 's' : ''} (${nonDiatonicChords.join(', ')}) adding color`
      : '';
    rationale = `${progressionStr} works well in ${key} with strong harmonic movement${chromNote}.`;
  } else if (score >= 45) {
    if (nonDiatonicCount > 0) {
      rationale = `${progressionStr} has moderate compatibility with ${key} — ${nonDiatonicCount} non-diatonic chord${nonDiatonicCount !== 1 ? 's' : ''} (${nonDiatonicChords.join(', ')}) create tension that may or may not resolve.`;
    } else {
      rationale = `${progressionStr} is diatonic in ${key} but lacks a strong cadential resolution — the harmonic arc feels incomplete.`;
    }
  } else {
    rationale = nonDiatonicCount > 0
      ? `${progressionStr} has high tension against ${key} — ${nonDiatonicCount} of ${total} chord${total !== 1 ? 's' : ''} fall outside the key.`
      : `${progressionStr} stays in ${key} but the harmonic movement is weak — no dominant or tonic function detected.`;
  }

  let recommendations: string;
  if (nonDiatonicCount === 0) {
    if (!dominantPresent) {
      const fifthDegree = CHROMATIC[(noteIndex(keyRoot) + 7) % 12];
      recommendations = `All chords are diatonic — consider adding a ${fifthDegree}7 dominant chord for tension and resolution.`;
    } else if (!tonicPresent) {
      recommendations = `Add a ${key} tonic chord to give the progression a clear home.`;
    } else {
      recommendations = `Excellent harmonic cohesion — try borrowing a chord from the parallel minor for added color.`;
    }
  } else if (nonDiatonicCount <= 2) {
    recommendations = `${nonDiatonicChords.join(', ')} ${nonDiatonicCount === 1 ? 'is' : 'are'} non-diatonic — ${cadences.count > 0 ? 'the cadences help anchor the tension' : 'resolve to the tonic (' + key + ') at the end to establish the key'}.`;
  } else {
    const altKey = CHROMATIC[(noteIndex(keyRoot) + 3) % 12];
    recommendations = `Heavy chromaticism detected — consider a modal reharmonization in ${altKey} minor or treating this as a modulation.`;
  }

  return { score, rationale, recommendations };
}

// ─── Route handler ───────────────────────────────────────────────────────────

interface CompatibilityRequest {
  key: string;
  chordProgression: string[];
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

    const result = analyzeProgression(key, chordProgression);
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

