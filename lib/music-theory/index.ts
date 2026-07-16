/**
 * Music Theory Library - Public API
 * Complete Pentatonic Triad Anchor System
 */

// ============================================================================
// Type Exports
// ============================================================================

export type * from './types';

// ============================================================================
// Constants Exports
// ============================================================================

export * from './constants';

// ============================================================================
// Core Utilities
// ============================================================================

export {
  getPitchClass,
  getNoteName,
  pitchClassFromName,
  createNote,
  getRelativeMinor,
  getRelativeMajor,
  findAllPositions,
  findPositionsOnString,
  getNoteAtPosition,
  addSemitones,
  getInterval
} from './core/notes';

export {
  getIntervalName,
  getSemitonesFromInterval,
  calculateInterval,
  calculateIntervalName,
  transpose,
  getChordToneRole,
  isChordTone,
  getScaleDegree,
  getRomanNumeral,
  getIntervalQuality
} from './core/intervals';

export {
  isValidPosition,
  arePositionsPlayable,
  calculateFretSpan,
  getLowestFret,
  getHighestFret,
  getCenterFret,
  arePositionsOnStringSet,
  getStringSetForPositions,
  arePositionsEqual,
  getPositionDistance,
  sortPositions
} from './core/fretboard';

// ============================================================================
// Triad System
// ============================================================================

export {
  buildTriad,
  getTriadDisplayName,
  getQualitySuffix,
  getInversionNotes,
  getInversionIntervals,
  getChordToneFromInterval
} from './triads/builder';

export {
  findVoicingsOnStringSet,
  findAllVoicings
} from './triads/voicings';

export {
  calculateFingering,
  isComfortableFingering,
  compareFingerings,
  getFingeringDescription
} from './triads/fingering';

// ============================================================================
// Scale System
// ============================================================================

export {
  buildPentatonicScale,
  getPentatonicForMajorKey,
  getPentatonicForMinorKey,
  isPitchInPentatonic,
  getPentatonicDegree,
  getPentatonicInterval,
  getPentatonicModes,
  getPentatonicScaleName
} from './scales/pentatonic';

export {
  calculatePentatonicBoxes,
  findBoxForFret,
  getPrimaryBoxForZone,
  isPositionInBox,
  getBoxNotesOnString
} from './scales/boxes';

export {
  buildDiatonicScale,
  generateDiatonicTriads,
  getDiatonicRomanNumeral,
  findScaleDegree,
  isTriadDiatonic,
  getCommonProgressions,
  buildProgressionFromDegrees
} from './scales/diatonic';

// ============================================================================
// Zone System
// ============================================================================

export {
  getZone,
  getAllZones,
  findZoneForFret,
  findZoneForVoicing,
  getNextZone,
  getPreviousZone,
  getZonesByCAGEDShape,
  filterVoicingsByZone,
  filterVoicingsByCAGEDShape,
  doesVoicingFitInZone,
  getOptimalZoneForVoicing,
  getZoneDescription
} from './zones/zone-manager';

// ============================================================================
// Analysis System
// ============================================================================

export {
  calculateVoiceLeading,
  getVoiceLeadingQualityDescription,
  findBestVoiceLeading,
  findGoodVoiceLeadingOptions,
  isSmoothVoiceLeading
} from './analysis/voice-leading';

export {
  findChordNeighborhood,
  findSmoothNeighbors,
  getDiatonicNeighbors,
  getChromaticNeighbors,
  groupNeighborsByQuality,
  getTopNeighbors,
  findChordInNeighborhood
} from './analysis/neighborhood';

export {
  findEmbellishments,
  groupEmbellishmentsByType,
  getEmbellishmentsForPosition,
  getClosestEmbellishments,
  sortEmbellishmentsByDistance
} from './analysis/embellishments';

// ============================================================================
// CAGED System
// ============================================================================

export {
  CAGED_COLORS,
  getCAGEDOverlayZones,
  getAllCAGEDZones,
  getCAGEDShapeForFret,
  isFretInSelectedCAGEDZone
} from './caged/overlay';

export type { CAGEDOverlayZone } from './caged/overlay';

// ============================================================================
// Adapters
// ============================================================================

export {
  voicingsToNotePositions,
  pentatonicToGhostNotes,
  embellishmentsToConnections,
  voiceLeadingToConnections,
  deduplicateNotePositions
} from './adapters/fretboard-adapter';

