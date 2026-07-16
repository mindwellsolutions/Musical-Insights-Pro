import { NOTES, getNoteAtFret } from './musicTheory';
import { getStandardChordVoicings } from './chord-database';

/**
 * Represents a finger position on the fretboard
 */
export interface FingerPosition {
  stringIndex: number; // 0 = lowest string (E on standard tuning)
  fret: number; // 0 = open, -1 = muted/not played
  note: string;
  finger?: number; // 1-4 for finger number, 0 for open
  isRoot?: boolean;
}

/**
 * Represents a chord voicing/shape
 */
export interface ChordVoicing {
  name: string;
  positions: FingerPosition[];
  startFret: number; // The lowest fret in this voicing (for display)
  endFret: number; // The highest fret in this voicing
  difficulty: number; // 1-5
  commonName?: string; // e.g., "Open Position", "Barre Chord", "CAGED E Shape"
}

/**
 * Determines chord quality from chord notes
 */
function determineChordQuality(chordNotes: string[], rootNote: string): string {
  if (chordNotes.length < 3) return 'major';

  // Normalize notes to semitones from root
  const rootIndex = NOTES.indexOf(rootNote);
  const intervals = chordNotes.map(note => {
    const noteIndex = NOTES.indexOf(note);
    return (noteIndex - rootIndex + 12) % 12;
  }).sort((a, b) => a - b);

  // Check for common chord qualities based on intervals
  const hasMinor3rd = intervals.includes(3);
  const hasMajor3rd = intervals.includes(4);
  const hasPerfect5th = intervals.includes(7);
  const hasDim5th = intervals.includes(6);
  const hasAug5th = intervals.includes(8);
  const hasMinor7th = intervals.includes(10);
  const hasMajor7th = intervals.includes(11);

  if (hasMinor3rd && hasDim5th) return 'diminished';
  if (hasMajor3rd && hasAug5th) return 'augmented';
  if (hasMinor3rd && hasPerfect5th && hasMinor7th) return 'minor7';
  if (hasMajor3rd && hasPerfect5th && hasMinor7th) return 'dominant7';
  if (hasMajor3rd && hasPerfect5th && hasMajor7th) return 'major7';
  if (hasMinor3rd && hasPerfect5th) return 'minor';
  if (hasMajor3rd && hasPerfect5th) return 'major';

  return 'major'; // Default fallback
}

/**
 * Calculate all possible voicings for a chord on the fretboard
 * Uses industry-standard chord database as primary source, with algorithmic fallback
 */
export function calculateChordVoicings(
  chordNotes: string[],
  rootNote: string,
  tuning: string[],
  maxFret: number = 12
): ChordVoicing[] {
  // First, try to get voicings from the industry-standard database
  const quality = determineChordQuality(chordNotes, rootNote);
  const standardVoicings = getStandardChordVoicings(rootNote, quality, tuning);

  if (standardVoicings.length > 0) {
    // Limit to first 5 voicings for better UX
    return standardVoicings.slice(0, 5);
  }

  // Fallback to algorithmic approach if chord not found in database
  const voicings: ChordVoicing[] = [];

  // Find common chord shapes in different positions
  // We'll look for voicings in position blocks (4-fret spans)
  for (let startFret = 0; startFret <= maxFret - 3; startFret++) {
    const voicing = findVoicingAtPosition(chordNotes, rootNote, tuning, startFret, Math.min(startFret + 4, maxFret));
    if (voicing && voicing.positions.filter(p => p.fret >= 0).length >= 3) {
      voicings.push(voicing);
    }
  }

  // Remove duplicate voicings (same fret pattern)
  const uniqueVoicings = voicings.filter((v, idx, arr) => {
    const pattern = v.positions.map(p => p.fret).join(',');
    return arr.findIndex(v2 => v2.positions.map(p => p.fret).join(',') === pattern) === idx;
  });

  // Sort by difficulty and position
  return uniqueVoicings
    .sort((a, b) => {
      if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
      return a.startFret - b.startFret;
    })
    .slice(0, 5); // Return top 5 voicings
}

/**
 * Find a voicing within a specific fret range
 */
function findVoicingAtPosition(
  chordNotes: string[],
  rootNote: string,
  tuning: string[],
  minFret: number,
  maxFret: number
): ChordVoicing | null {
  const positions: FingerPosition[] = [];
  const usedNotes = new Set<string>();
  let hasRoot = false;

  // Try to find the best notes on each string within the fret range
  // Limit to 4-5 strings for playability
  const maxStringsToPlay = minFret === 0 ? 6 : 5; // Open position can use all strings
  let stringsPlayed = 0;

  for (let stringIndex = 0; stringIndex < tuning.length; stringIndex++) {
    const openNote = tuning[stringIndex];
    let bestFret = -1;
    let bestNote = '';
    let bestPriority = -1;

    // Check each fret on this string
    for (let fret = minFret; fret <= maxFret; fret++) {
      const note = getNoteAtFret(openNote, fret);

      if (chordNotes.includes(note)) {
        // Prioritize root notes, then unique chord tones, then duplicates
        let priority = 1;
        if (note === rootNote && !hasRoot) {
          priority = 4; // Highest priority for first root
        } else if (note === rootNote) {
          priority = 2; // Lower priority for additional roots
        } else if (!usedNotes.has(note)) {
          priority = 3; // High priority for new chord tones
        }

        if (priority > bestPriority) {
          bestPriority = priority;
          bestFret = fret;
          bestNote = note;
        }
      }
    }

    // Decide whether to play this string
    const shouldPlayString = bestFret >= 0 && (
      bestNote === rootNote || // Always include root
      !usedNotes.has(bestNote) || // Always include new chord tones
      (stringsPlayed < maxStringsToPlay && usedNotes.size < chordNotes.length) // Fill out the chord
    );

    if (shouldPlayString && stringsPlayed < maxStringsToPlay) {
      positions.push({
        stringIndex,
        fret: bestFret,
        note: bestNote,
        finger: bestFret === 0 ? 0 : calculateFingerNumber(bestFret, minFret),
        isRoot: bestNote === rootNote,
      });
      usedNotes.add(bestNote);
      if (bestNote === rootNote) hasRoot = true;
      stringsPlayed++;
    } else {
      // Mute this string
      positions.push({
        stringIndex,
        fret: -1,
        note: '',
        finger: 0,
      });
    }
  }

  // Calculate difficulty
  const playedPositions = positions.filter(p => p.fret >= 0);
  if (playedPositions.length < 3) return null;

  // Must have at least the root note
  if (!hasRoot) return null;

  const frets = playedPositions.map(p => p.fret).filter(f => f > 0);
  const fretSpan = frets.length > 0 ? Math.max(...frets) - Math.min(...frets) : 0;

  // Validate playability: check if the voicing is physically possible
  if (!isVoicingPlayable(positions, minFret)) {
    return null;
  }

  const difficulty = calculateDifficulty(minFret, fretSpan, playedPositions.length);
  const actualMinFret = frets.length > 0 ? Math.min(...frets) : minFret;
  const actualMaxFret = frets.length > 0 ? Math.max(...frets) : maxFret;

  return {
    name: minFret === 0 ? 'Open Position' : `Frets ${actualMinFret}-${actualMaxFret}`,
    positions,
    startFret: minFret,
    endFret: maxFret,
    difficulty,
    commonName: getCommonName(minFret, fretSpan),
  };
}

/**
 * Check if a voicing is physically playable
 */
function isVoicingPlayable(positions: FingerPosition[], baseFret: number): boolean {
  const frettedPositions = positions.filter(p => p.fret > 0);

  // Can't play more than 6 notes (one per string)
  if (frettedPositions.length > 6) return false;

  // Get unique frets being played (excluding open strings)
  const uniqueFrets = [...new Set(frettedPositions.map(p => p.fret))].sort((a, b) => a - b);

  // Check if any finger is used on multiple different frets (impossible!)
  const fingerFretMap = new Map<number, Set<number>>();
  frettedPositions.forEach(pos => {
    if (pos.finger && pos.finger > 0) {
      if (!fingerFretMap.has(pos.finger)) {
        fingerFretMap.set(pos.finger, new Set());
      }
      fingerFretMap.get(pos.finger)!.add(pos.fret);
    }
  });

  // Each finger can only be on one fret (but can barre multiple strings at that fret)
  for (const [finger, frets] of fingerFretMap.entries()) {
    if (frets.size > 1) {
      return false; // Finger used on multiple frets - impossible!
    }
  }

  // Count how many fingers we need (excluding barres)
  const fingersNeeded = fingerFretMap.size;
  if (fingersNeeded > 4) return false; // Only have 4 fingers

  // If we have more than 4 unique frets, it's unplayable (only 4 fingers)
  // Exception: if one fret has multiple notes, it could be a barre
  if (uniqueFrets.length > 4) {
    // Check if we can use a barre chord (one finger pressing multiple strings at same fret)
    const fretCounts = new Map<number, number>();
    frettedPositions.forEach(p => {
      fretCounts.set(p.fret, (fretCounts.get(p.fret) || 0) + 1);
    });

    // If the lowest fret has multiple notes, it could be a barre
    const lowestFret = Math.min(...uniqueFrets);
    const lowestFretCount = fretCounts.get(lowestFret) || 0;

    // After accounting for barre, we should have at most 4 unique frets
    const nonBarreFrets = uniqueFrets.filter(f => f !== lowestFret);
    if (lowestFretCount >= 2 && nonBarreFrets.length <= 3) {
      // This is playable as a barre chord
      return true;
    }

    return false;
  }

  // Check fret span (distance between lowest and highest fret)
  if (uniqueFrets.length > 0) {
    const span = uniqueFrets[uniqueFrets.length - 1] - uniqueFrets[0];
    // Most people can't stretch more than 4 frets comfortably
    if (span > 4) return false;
    // At higher positions, even 4 frets is difficult
    if (baseFret > 7 && span > 3) return false;
  }

  return true;
}

/**
 * Calculate finger number based on fret position
 */
function calculateFingerNumber(fret: number, baseFret: number): number {
  if (fret === 0) return 0;
  const offset = fret - baseFret;
  return Math.min(Math.max(offset + 1, 1), 4);
}

/**
 * Calculate difficulty rating
 */
function calculateDifficulty(startFret: number, fretSpan: number, stringCount: number): number {
  let difficulty = 1;
  
  // Higher frets are harder
  if (startFret > 7) difficulty += 1;
  if (startFret > 12) difficulty += 1;
  
  // Wide stretches are harder
  if (fretSpan > 3) difficulty += 1;
  if (fretSpan > 4) difficulty += 1;
  
  // More strings can be harder
  if (stringCount === 6) difficulty += 1;
  
  return Math.min(difficulty, 5);
}

/**
 * Get common name for chord shape
 */
function getCommonName(startFret: number, fretSpan: number): string {
  if (startFret === 0) return 'Open Position';
  if (fretSpan >= 4) return `Barre (Fret ${startFret})`;
  if (startFret <= 3) return `Low Position (Fret ${startFret})`;
  if (startFret <= 7) return `Mid Position (Fret ${startFret})`;
  return `High Position (Fret ${startFret})`;
}

