import guitar from '@tombatossals/chords-db/lib/guitar.json';
import { FingerPosition, ChordVoicing } from './chord-voicings';
import { NOTES } from './musicTheory';

/**
 * Maps chord quality to the suffix used in the chords-db library
 */
function getChordSuffix(quality: string): string {
  const suffixMap: Record<string, string> = {
    // Triads
    'major': 'major',
    'minor': 'minor',
    'diminished': 'dim',
    'augmented': 'aug',

    // 7th Chords
    'dominant7': '7',
    'major7': 'maj7',
    'minor7': 'm7',
    'diminished7': 'dim7',
    'halfDiminished7': 'm7b5',
    'augmented7': 'aug7',

    // Extended Chords
    'dominant9': '9',
    'major9': 'maj9',
    'minor9': 'm9',
    'dominant11': '11',
    'major11': 'maj11',
    'minor11': 'm11',
    'dominant13': '13',
    'major13': 'maj13',
    'minor13': 'm13',

    // Altered Chords
    '7b5': '7b5',
    '7#5': '7#5',
    '7b9': '7b9',
    '7#9': '7#9',
    '7#11': '7#11',
    '7alt': '7alt',

    // Suspended Chords
    'sus2': 'sus2',
    'sus4': 'sus4',
    '7sus4': '7sus4',

    // Add Chords
    'add9': 'add9',
    'add11': 'add11',
    'minoradd9': 'madd9',

    // Legacy support
    '6': '6',
    'minor6': 'm6',
    '9': '9',
    '11': '11',
    '13': '13',
  };

  return suffixMap[quality] || 'major';
}

/**
 * Normalizes note names to match the chords-db format
 * The database uses special keys for sharps: "Csharp" instead of "C#", "Fsharp" instead of "F#"
 * Keys: ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"]
 * Chord object keys: "C", "Csharp", "D", "Eb", "E", "F", "Fsharp", "G", "Ab", "A", "Bb", "B"
 */
function normalizeNoteForDatabase(note: string): string {
  const noteMap: Record<string, string> = {
    'C': 'C',
    'C#': 'Csharp',  // Database uses "Csharp" as the object key
    'Db': 'Csharp',  // Db is enharmonic to C#
    'D': 'D',
    'D#': 'Eb',
    'Eb': 'Eb',
    'E': 'E',
    'F': 'F',
    'F#': 'Fsharp',  // Database uses "Fsharp" as the object key
    'Gb': 'Fsharp',  // Gb is enharmonic to F#
    'G': 'G',
    'G#': 'Ab',
    'Ab': 'Ab',
    'A': 'A',
    'A#': 'Bb',
    'Bb': 'Bb',
    'B': 'B',
  };

  return noteMap[note] || note;
}

/**
 * Converts a chords-db position to our FingerPosition format
 */
function convertDatabasePosition(
  dbPosition: { frets: number[]; fingers: number[]; baseFret: number },
  rootNote: string,
  tuning: string[]
): FingerPosition[] {
  const positions: FingerPosition[] = [];
  
  // The database uses frets array where -1 means muted/not played
  // and fingers array where 0 means open string, 1-4 are finger numbers
  for (let stringIndex = 0; stringIndex < dbPosition.frets.length; stringIndex++) {
    const fret = dbPosition.frets[stringIndex];
    const finger = dbPosition.fingers[stringIndex];
    
    if (fret === -1) {
      // Muted string
      positions.push({
        stringIndex,
        fret: -1,
        note: '',
        finger: undefined,
      });
    } else {
      // Calculate actual fret number (database uses baseFret offset)
      const actualFret = fret === 0 ? 0 : fret + dbPosition.baseFret - 1;
      const note = getNoteAtFret(tuning[stringIndex], actualFret);
      
      positions.push({
        stringIndex,
        fret: actualFret,
        note,
        finger: finger === 0 ? 0 : finger,
        isRoot: note === rootNote,
      });
    }
  }
  
  return positions;
}

/**
 * Helper function to get note at fret (imported from musicTheory)
 */
function getNoteAtFret(startNote: string, fret: number): string {
  const startIndex = NOTES.indexOf(startNote);
  if (startIndex === -1) return startNote;
  
  const noteIndex = (startIndex + fret) % NOTES.length;
  return NOTES[noteIndex];
}

/**
 * Gets industry-standard chord voicings from the chords-db library
 */
export function getStandardChordVoicings(
  rootNote: string,
  quality: string,
  tuning: string[] = ['E', 'A', 'D', 'G', 'B', 'E']
): ChordVoicing[] {
  const normalizedRoot = normalizeNoteForDatabase(rootNote);
  const suffix = getChordSuffix(quality);

  // Debug logging for C# and F# chords (now normalized to Db and Gb)
  if (rootNote === 'C#' || rootNote === 'F#') {
    console.log(`[Chord Database] Looking up ${rootNote} → normalized to ${normalizedRoot}, quality: ${quality} (suffix: ${suffix})`);
    console.log(`[Chord Database] Available root notes in database:`, Object.keys((guitar.chords as any)).sort().join(', '));
  }

  // Find the chord in the database
  const chordData = (guitar.chords as any)[normalizedRoot];
  if (!chordData) {
    if (rootNote === 'C#' || rootNote === 'F#') {
      console.log(`[Chord Database] No chord data found for normalized root: ${normalizedRoot}`);
      // Try alternative normalizations
      const alternatives = ['C#', 'Db', 'F#', 'Gb'];
      console.log(`[Chord Database] Checking alternatives:`, alternatives.map(alt => `${alt}: ${!!(guitar.chords as any)[alt]}`).join(', '));
    }
    return [];
  }

  if (rootNote === 'C#' || rootNote === 'F#') {
    console.log(`[Chord Database] Found chord data for ${normalizedRoot}! Available suffixes:`, chordData.map((c: any) => c.suffix));
  }

  const chordVariations = chordData.find((c: any) => c.suffix === suffix);
  if (!chordVariations || !chordVariations.positions) {
    if (rootNote === 'C#' || rootNote === 'F#') {
      console.log(`[Chord Database] No variations found for ${normalizedRoot} with suffix: ${suffix}`);
    }
    return [];
  }
  
  // Convert database positions to our format
  const voicings: ChordVoicing[] = chordVariations.positions.map((pos: any, index: number) => {
    const positions = convertDatabasePosition(pos, rootNote, tuning);
    const frets = positions.filter(p => p.fret > 0).map(p => p.fret);
    const startFret = frets.length > 0 ? Math.min(...frets) : 0;
    const endFret = frets.length > 0 ? Math.max(...frets) : 0;
    
    // Determine common name based on position
    let commonName = '';
    if (startFret === 0 || positions.some(p => p.fret === 0 && p.finger === 0)) {
      commonName = 'Open Position';
    } else if (pos.barres && pos.barres.length > 0) {
      commonName = 'Barre Chord';
    } else if (startFret <= 3) {
      commonName = 'Low Position';
    } else if (startFret <= 7) {
      commonName = 'Mid Position';
    } else {
      commonName = 'High Position';
    }
    
    return {
      name: `${rootNote}${suffix === 'major' ? '' : suffix} - ${commonName}`,
      positions,
      startFret,
      endFret,
      difficulty: calculateDifficulty(positions, pos.barres || []),
      commonName,
    };
  });
  
  return voicings;
}

/**
 * Calculate difficulty rating based on finger positions and barres
 */
function calculateDifficulty(positions: FingerPosition[], barres: number[]): number {
  const frettedPositions = positions.filter(p => p.fret > 0);
  const frets = frettedPositions.map(p => p.fret);
  const span = frets.length > 0 ? Math.max(...frets) - Math.min(...frets) : 0;
  
  let difficulty = 1;
  
  // Increase difficulty for wider spans
  if (span > 3) difficulty += 2;
  else if (span > 2) difficulty += 1;
  
  // Increase difficulty for barres
  if (barres.length > 0) difficulty += 1;
  
  // Increase difficulty for high positions
  const minFret = frets.length > 0 ? Math.min(...frets) : 0;
  if (minFret > 7) difficulty += 1;
  
  return Math.min(5, difficulty);
}

