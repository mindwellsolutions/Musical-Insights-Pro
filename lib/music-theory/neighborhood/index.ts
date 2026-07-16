/**
 * Chord Neighborhood System - Main Export
 * Exports all neighborhood functionality
 */

// Types
export type {
  AnchorVoicing,
  NearbyChord,
  ChordNeighborhoodState,
  DiatonicChordDef,
} from './types';

// Diatonic chord generation
export {
  getDiatonicChords,
  getChordSymbol,
  getKeyModeFromTriad,
} from './diatonic';

// Distance calculation
export {
  calculateDistance,
  countCommonTones,
  getCommonToneNotes,
  isWithinRange,
} from './distance';

// Neighborhood discovery
export {
  findNearbyChords,
  findAllDiatonicChordsWithNearestVoicings,
  getDistanceDescription,
  getCommonTonesDescription,
} from './discovery';

// Voicing generation
export {
  convertToAnchorVoicing,
  getAllTriadPositions,
  findVoicing,
  anchorVoicingToNotePositions,
} from './voicing-generator';

// CAGED shape detection
export {
  getCAGEDRegionsForVoicing,
  detectCAGEDShapesForVoicing,
  detectCAGEDShapesWithOctaves,
  isSingleCAGEDShape,
  detectCAGEDShapesForMultipleVoicings,
} from './caged-detection';

