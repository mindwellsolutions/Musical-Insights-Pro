/**
 * Music Theory Database - Main Export
 * Central export point for all music theory database functionality
 */

// Type definitions
export type {
  ScaleIndexEntry,
  CompatibleScale,
  SourceScale,
  ScaleData,
  KeyDatabase,
  KeyIndex,
  NormalizedKeyName,
  DatabasePaths,
} from './types';

// Database loader functions
export {
  normalizeKeyName,
  getDatabasePaths,
  loadKeyIndex,
  loadKeyDatabase,
  getScaleData,
  getCompatibleScalesForScale,
  getAvailableScales,
  getScalesByFamily,
  getScalesByQuality,
  clearCache,
  preloadAllDatabases,
} from './loader';

// Scale name mapping
export {
  SCALE_NAME_TO_DB_KEY,
  DB_KEY_TO_SCALE_NAME,
  DB_SCALE_NAME_TO_INTERVALS_KEY,
  scaleNameToDbKey,
  dbKeyToScaleName,
  dbScaleNameToIntervalsKey,
  isValidScaleName,
  getAllScaleNames,
  getAllDbKeys,
  normalizeScaleNameFromDisplay,
} from './scale-mapping';

// Compatibility service (main API)
export {
  getCompatibleScalesFromDatabase,
  getAllScalesInKey,
  getPrimaryCompatibleScale,
  scaleExistsInDatabase,
  getScaleInfo,
  batchGetCompatibleScales,
} from './compatibility-service';

