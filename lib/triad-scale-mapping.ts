/**
 * Comprehensive Triad to Scale Mapping
 * Maps each triad type to ALL compatible scales for improvisation
 *
 * NOW USES COMPATIBLE SCALES DATABASE with ratings and variety
 *
 * Music Theory Rules:
 * - Shows ALL scales that contain the triad notes
 * - Each scale has different notes (not just modes of parent key)
 * - Rated 1-10 for compatibility
 * - Includes primary, related, extended, and exotic scales
 */

import { TriadType } from './triad-theory';
import { getCompatibleScalesForTriad, CompatibleScale } from './compatible-scales-database';

export interface TriadScaleRecommendation {
  scaleName: string;
  displayName: string;
  rootNote: string;           // Root note of the scale
  isPrimary: boolean;         // The most recommended scale
  description: string;
  compatibilityRating: number; // 1-10 rating
  category: 'primary' | 'related' | 'extended' | 'exotic';
  scaleDbKey?: string;        // Database key for loading from music-theory database
}

/**
 * Convert CompatibleScale to TriadScaleRecommendation format
 * This maintains backward compatibility with existing code
 */
function scaleToRecommendation(scale: CompatibleScale): TriadScaleRecommendation {
  return {
    scaleName: scale.scaleName,
    displayName: scale.fullDisplayName,
    rootNote: scale.rootNote,
    isPrimary: scale.isPrimary,
    description: scale.description,
    compatibilityRating: scale.compatibilityRating,
    category: scale.category,
    scaleDbKey: scale.scaleName
  };
}

/**
 * Get the primary (most recommended) scale for a triad
 * Now uses compatible scales database with ratings
 */
export function getPrimaryScaleForTriad(rootNote: string, triadType: TriadType): TriadScaleRecommendation {
  const scales = getCompatibleScalesForTriad(rootNote, triadType);
  const primaryScale = scales.find(s => s.isPrimary) || scales[0];
  return scaleToRecommendation(primaryScale);
}

/**
 * Get all recommended scales for a triad
 * Now uses compatible scales database
 * Returns ALL compatible scales with different notes, sorted by rating
 */
export function getScaleRecommendationsForTriad(rootNote: string, triadType: TriadType): TriadScaleRecommendation[] {
  const scales = getCompatibleScalesForTriad(rootNote, triadType);

  // Safety check - ensure we have scales
  if (!scales || scales.length === 0) {
    console.error(`No scales found for ${rootNote} ${triadType}`);
    return [];
  }

  // Sort by compatibility rating (highest first), then by category
  const sorted = [...scales].sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return b.compatibilityRating - a.compatibilityRating;
  });
  return sorted.map(scaleToRecommendation);
}

/**
 * Get scale name to display on fretboard for a triad
 * Now uses compatible scales database
 * Returns the full display name including root note (e.g., "C Lydian")
 */
export function getScaleNameForTriad(
  rootNote: string,
  triadType: TriadType,
  scaleIndex: number = 0
): string {
  const recommendations = getScaleRecommendationsForTriad(rootNote, triadType);
  const scale = recommendations[scaleIndex] || recommendations[0];
  // displayName already includes root note (e.g., "C Lydian")
  return scale.displayName;
}

/**
 * Get the scale database key for use with calculateScalePositions
 * Now returns the scaleDbKey from compatible scales database
 */
export function getScaleKeyForTriad(
  rootNote: string,
  triadType: TriadType,
  scaleIndex: number = 0
): string {
  const recommendations = getScaleRecommendationsForTriad(rootNote, triadType);
  const scale = recommendations[scaleIndex] || recommendations[0];
  // Use scaleDbKey if available, otherwise fall back to scaleName
  return scale.scaleDbKey || scale.scaleName;
}

/**
 * Get the root note for a specific scale index
 * Each scale can have a different root note
 */
export function getModeRootNote(
  triadRoot: string,
  triadType: TriadType,
  scaleIndex: number = 0
): string {
  const recommendations = getScaleRecommendationsForTriad(triadRoot, triadType);
  const scale = recommendations[scaleIndex] || recommendations[0];
  return scale.rootNote;
}

