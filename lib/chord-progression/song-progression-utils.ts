/**
 * Song Progression Utilities
 * Helper functions for the dual fretboard system in Play Song Panel
 */

import { ChordInstance, ScaleModeInstance, ChordQuality } from './types';
import { calculateTriadPositions, TriadPosition } from '@/lib/triad-positions';
import { getScaleNotes, NotePosition } from '@/lib/musicTheory';
import { ShapeRegion } from '@/lib/caged';
import { CAGEDShape } from '@/lib/music-theory/types';
import {
  findAllDiatonicChordsWithNearestVoicings,
  NearbyChord,
  AnchorVoicing
} from '@/lib/music-theory/neighborhood';
import { ChordVoicing, FingerPosition } from '@/lib/chord-voicings';

/**
 * Helper to check if a chord quality is minor
 */
function isMinorChord(quality: ChordQuality): boolean {
  return ['min', 'min7', 'min9', 'min11', 'min13', 'min6', 'min-add9', 'min7b5'].includes(quality);
}

/**
 * Filtered scale note with additional metadata
 */
export interface FilteredScaleNote extends NotePosition {
  scaleDegree: number;
  isInCAGEDRegion: boolean;
  cagedShape?: string;
}

/**
 * Get all triad positions for a chord from the timeline
 * @param chord - ChordInstance from timeline
 * @param maxFret - Maximum fret to calculate (default 24)
 * @param filterByCAGED - Optional CAGED shapes to filter by
 * @returns Array of triad positions
 */
export function getTriadPositionsForChord(
  chord: ChordInstance,
  maxFret: number = 24,
  filterByCAGED?: string[]
): TriadPosition[] {
  const quality = isMinorChord(chord.chordQuality) ? 'minor' : 'major';

  const positions = calculateTriadPositions(chord.rootNote, quality, maxFret);

  if (filterByCAGED && filterByCAGED.length > 0) {
    return positions.filter(pos =>
      pos.cagedShape && filterByCAGED.includes(pos.cagedShape)
    );
  }

  return positions;
}

/**
 * Get all positions for a note on the fretboard
 */
function getAllPositionsForNote(
  note: string,
  tuning: string[],
  maxFret: number
): NotePosition[] {
  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const positions: NotePosition[] = [];

  tuning.forEach((openNote, stringIndex) => {
    const openNoteIndex = NOTES.indexOf(openNote);
    const targetNoteIndex = NOTES.indexOf(note);

    for (let fret = 0; fret <= maxFret; fret++) {
      const currentNoteIndex = (openNoteIndex + fret) % 12;
      if (currentNoteIndex === targetNoteIndex) {
        positions.push({
          stringIndex,
          fretNumber: fret,
          note,
          isRoot: false,
        });
      }
    }
  });

  return positions;
}

/**
 * Check if a position is within CAGED regions
 */
function isPositionInCAGEDRegions(
  position: { stringIndex: number; fretNumber: number },
  regions: ShapeRegion[]
): boolean {
  if (regions.length === 0) return true; // Show all if no regions

  return regions.some(region =>
    position.fretNumber >= region.startFret &&
    position.fretNumber <= region.endFret &&
    position.stringIndex >= region.topString &&
    position.stringIndex <= region.bottomString
  );
}

/**
 * Filter scale notes to only those within CAGED regions
 * @param scale - ScaleModeInstance from timeline
 * @param cagedRegions - CAGED regions from selected triad position
 * @param tuning - Guitar tuning
 * @returns Filtered note positions with scale degrees
 */
export function filterScaleNotesByCAGEDRegions(
  scale: ScaleModeInstance,
  cagedRegions: ShapeRegion[],
  tuning: string[]
): FilteredScaleNote[] {
  // Get all scale notes
  const scaleNotes = getScaleNotes(scale.rootNote, scale.scaleName);

  // Get all positions for each note
  const allPositions: FilteredScaleNote[] = [];

  scaleNotes.forEach((note, index) => {
    const positions = getAllPositionsForNote(note, tuning, 24);

    positions.forEach(pos => {
      const isInRegion = isPositionInCAGEDRegions(pos, cagedRegions);

      if (isInRegion || cagedRegions.length === 0) {
        const cagedShape = cagedRegions.find(r =>
          pos.fretNumber >= r.startFret && 
          pos.fretNumber <= r.endFret &&
          pos.stringIndex >= r.topString &&
          pos.stringIndex <= r.bottomString
        )?.shapeName;

        allPositions.push({
          ...pos,
          scaleDegree: index + 1,
          isInCAGEDRegion: isInRegion,
          cagedShape,
        });
      }
    });
  });

  return allPositions;
}

/**
 * Get nearby diatonic chords for song progression display
 * @param selectedChord - Currently selected chord
 * @param selectedPosition - Selected triad position
 * @param key - Song key
 * @param keyMode - Major or minor
 * @returns Array of nearby chords
 */
export function getNearbyChordsSongProgression(
  selectedChord: ChordInstance,
  selectedPosition: TriadPosition,
  key: string,
  keyMode: 'major' | 'minor'
): NearbyChord[] {
  // Convert triad position to anchor voicing
  const anchorVoicing: AnchorVoicing = {
    rootNote: selectedPosition.rootNote,
    quality: selectedPosition.triadType,
    stringSet: selectedPosition.stringPositions.map(sp => sp.stringIndex + 1),
    inversion: selectedPosition.inversion,
    fretPosition: selectedPosition.fretPosition,
    frets: selectedPosition.stringPositions.map(sp => sp.fret),
    notes: selectedPosition.stringPositions.map(sp => sp.note)
  };

  // Get all diatonic chords with nearest voicings
  return findAllDiatonicChordsWithNearestVoicings(
    anchorVoicing,
    key,
    keyMode
  );
}

/**
 * Convert a custom chord voicing to a triad position
 * @param voicing - ChordVoicing from voicing selector
 * @param chord - Original chord instance
 * @returns TriadPosition or null if not convertible
 */
export function convertVoicingToTriadPosition(
  voicing: ChordVoicing,
  chord: ChordInstance
): TriadPosition | null {
  // Extract first 3 notes from voicing
  if (voicing.positions.length < 3) return null;

  const stringPositions = voicing.positions
    .slice(0, 3)
    .map(pos => {
      const chordTone = determineChordTone(pos.note, chord.notes);
      return {
        stringIndex: pos.stringIndex,
        fret: pos.fret,
        note: pos.note,
        chordTone: chordTone as 'root' | 'third' | 'fifth'
      };
    });

  // Determine inversion based on bass note
  const bassNote = stringPositions[0].note;
  const inversion = bassNote === chord.rootNote ? 'root' :
                   bassNote === chord.notes[1] ? 'first' : 'second';

  // Determine CAGED shape (simplified)
  const cagedShape = determineCCAGEDShape(
    voicing.startFret,
    stringPositions[0].stringIndex
  );

  const quality = isMinorChord(chord.chordQuality) ? 'minor' : 'major';

  return {
    rootNote: chord.rootNote,
    triadType: quality,
    inversion: inversion as 'root' | 'first' | 'second',
    cagedShape,
    fretPosition: voicing.startFret,
    stringSet: Math.floor(stringPositions[0].stringIndex / 3) + 1,
    stringPositions,
    positionIndex: 0
  };
}

/**
 * Determine which chord tone a note is
 */
function determineChordTone(note: string, chordNotes: string[]): string {
  const index = chordNotes.indexOf(note);
  if (index === 0) return 'root';
  if (index === 1) return 'third';
  if (index === 2) return 'fifth';
  return 'root'; // Default
}

/**
 * Determine CAGED shape based on fret position
 */
function determineCCAGEDShape(fretPosition: number, stringIndex: number): CAGEDShape | null {
  const positionInOctave = fretPosition % 12;

  if (positionInOctave >= 0 && positionInOctave < 2) return 'E';
  if (positionInOctave >= 2 && positionInOctave < 5) return 'D';
  if (positionInOctave >= 5 && positionInOctave < 7) return 'C';
  if (positionInOctave >= 7 && positionInOctave < 10) return 'A';
  return 'G';
}

/**
 * Get the current chord and scale based on playback time
 * @param chords - All chords in progression
 * @param scales - All scales in progression
 * @param currentTime - Current playback time in beats
 * @returns Object with current chord and scale
 */
export function getCurrentChordAndScale(
  chords: ChordInstance[],
  scales: ScaleModeInstance[],
  currentTime: number
): {
  chord: ChordInstance | null;
  scale: ScaleModeInstance | null;
} {
  // Find current chord
  const currentChord = chords.find(chord =>
    currentTime >= chord.startTime &&
    currentTime < chord.startTime + chord.duration
  ) || null;

  // Find current scale
  const currentScale = scales.find(scale =>
    currentTime >= scale.startTime &&
    currentTime < scale.startTime + scale.duration
  ) || null;

  return {
    chord: currentChord,
    scale: currentScale
  };
}

