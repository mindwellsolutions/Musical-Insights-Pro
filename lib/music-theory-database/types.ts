/**
 * TypeScript Type Definitions for Music Theory Database
 * Defines interfaces for the JSON database structure
 */

/**
 * Entry in the scale index
 */
export interface ScaleIndexEntry {
  scalesArrayKey: string;
  fullScaleName: string;
  family: string;
  quality: string;
}

/**
 * Compatible scale recommendation from the database
 */
export interface CompatibleScale {
  scaleName: string;
  keyQuality: string;
  compatibilityScore: number;
  relationship: string;
  rationale: string;
  musicalContext: string;
  musicGenreRecommendations: string;
  recommendedUse: string;
  targetNotes: string[];
  difficultyLevel: number;
}

/**
 * Source scale information
 */
export interface SourceScale {
  name: string;
  formula: string | null;
  intervals?: number[]; // Optional intervals array
  family: string;
  quality: string;
}

/**
 * Scale data including source and compatible scales
 */
export interface ScaleData {
  sourceScale: SourceScale;
  compatibleScales: CompatibleScale[];
}

/**
 * Complete key database structure
 */
export interface KeyDatabase {
  key: string;
  version: string;
  lastUpdated: string;
  scales: Record<string, ScaleData>;
}

/**
 * Key index structure
 */
export interface KeyIndex {
  key: string;
  totalScales: number;
  scaleIndex: ScaleIndexEntry[];
  scalesByFamily: Record<string, string[]>;
  scalesByQuality: Record<string, string[]>;
}

/**
 * Normalized key name for file lookup
 */
export type NormalizedKeyName = 
  | 'a' | 'a-sharp' | 'b' | 'c' | 'c-sharp' | 'd' | 'd-sharp' 
  | 'e' | 'f' | 'f-sharp' | 'g' | 'g-sharp';

/**
 * Database file paths
 */
export interface DatabasePaths {
  indexPath: string;
  completePath: string;
}

