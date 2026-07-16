/**
 * Fretboard Adapter
 * Converts triad system data to format compatible with existing Fretboard component
 */

import type { 
  TriadVoicing, 
  PentatonicScale, 
  Embellishment,
  VoiceLeadingConnection,
  ChordNeighborhood,
  FretPosition,
  TwoNoteMode
} from '../types';
import { getNoteName } from '../core/notes';
import { NotePosition } from '@/lib/musicTheory';

// ============================================================================
// Voicing to Note Positions
// ============================================================================

/**
 * Convert triad voicings to fretboard note positions
 * @param voicings Array of triad voicings to display
 * @param twoNoteMode Two-note mode setting
 * @returns Array of note positions for fretboard
 */
export function voicingsToNotePositions(
  voicings: TriadVoicing[],
  twoNoteMode: TwoNoteMode = 'off'
): NotePosition[] {
  const positions: NotePosition[] = [];

  for (const voicing of voicings) {
    // Get positions to display based on two-note mode
    const displayPositions = applyTwoNoteMode(voicing.positions, twoNoteMode);
    
    for (let i = 0; i < displayPositions.length; i++) {
      const pos = displayPositions[i];
      const note = voicing.notes[i];
      
      positions.push({
        note: note.name,
        stringIndex: pos.string - 1, // Convert 1-based to 0-based
        fretNumber: pos.fret,
        isRoot: note.pitchClass === voicing.root.pitchClass,
        isHarmonyNote: false
      });
    }
  }

  return positions;
}

/**
 * Apply two-note mode to positions
 * @param positions Original 3 positions
 * @param mode Two-note mode
 * @returns Filtered positions
 */
function applyTwoNoteMode(
  positions: [FretPosition, FretPosition, FretPosition],
  mode: TwoNoteMode
): FretPosition[] {
  if (mode === 'off') {
    return positions;
  } else if (mode === 'remove-middle') {
    // Remove middle note (index 1)
    return [positions[0], positions[2]];
  } else {
    // remove-bass: Remove bass note (index 0)
    return [positions[1], positions[2]];
  }
}

// ============================================================================
// Pentatonic Scale to Note Positions
// ============================================================================

/**
 * Convert pentatonic scale to ghost note positions
 * @param scale Pentatonic scale
 * @param zone Optional zone to filter by
 * @returns Array of ghost note positions
 */
export function pentatonicToGhostNotes(
  scale: PentatonicScale,
  zone?: { startFret: number; endFret: number }
): NotePosition[] {
  const positions: NotePosition[] = [];
  const startFret = zone?.startFret ?? 0;
  const endFret = zone?.endFret ?? 15;

  // Standard tuning: E A D G B E (strings 6-1)
  const tuning = [4, 9, 2, 7, 11, 4]; // Pitch classes

  for (let stringIndex = 0; stringIndex < 6; stringIndex++) {
    const openPitch = tuning[stringIndex];
    
    for (let fret = startFret; fret <= endFret; fret++) {
      const pitch = (openPitch + fret) % 12;

      if (scale.notes.some(note => note.pitchClass === pitch)) {
        const noteName = getNoteName(pitch as any);

        positions.push({
          note: noteName,
          stringIndex,
          fretNumber: fret,
          isRoot: false,
          isHarmonyNote: false
        });
      }
    }
  }

  return positions;
}

// ============================================================================
// Embellishments to Visual Indicators
// ============================================================================

/**
 * Convert embellishments to visual connection data
 * @param embellishments Array of embellishments
 * @returns Connection data for rendering
 */
export function embellishmentsToConnections(
  embellishments: Embellishment[]
): Array<{
  from: { string: number; fret: number };
  to: { string: number; fret: number };
  type: 'slide' | 'hammer-on' | 'pull-off';
}> {
  return embellishments.map(emb => ({
    from: { string: emb.from.string, fret: emb.from.fret },
    to: { string: emb.to.string, fret: emb.to.fret },
    type: emb.type
  }));
}

// ============================================================================
// Voice Leading to Visual Connections
// ============================================================================

/**
 * Convert voice leading to visual connection data
 * @param connection Voice leading connection
 * @returns Connection data for rendering
 */
export function voiceLeadingToConnections(
  connection: VoiceLeadingConnection
): Array<{
  from: { string: number; fret: number };
  to: { string: number; fret: number };
  movement: number;
}> {
  return connection.movements.map((movement, idx) => ({
    from: {
      string: connection.from.positions[idx].string,
      fret: connection.from.positions[idx].fret
    },
    to: {
      string: connection.to.positions[idx].string,
      fret: connection.to.positions[idx].fret
    },
    movement
  }));
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get unique note positions (remove duplicates)
 * @param positions Array of note positions
 * @returns Deduplicated array
 */
export function deduplicateNotePositions(positions: NotePosition[]): NotePosition[] {
  const seen = new Set<string>();
  return positions.filter(pos => {
    const key = `${pos.stringIndex}-${pos.fretNumber}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

