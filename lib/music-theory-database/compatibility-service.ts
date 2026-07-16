/**
 * Compatibility Service - Client Side
 * Fetches compatible scales from server-side API
 */

import { ScaleCompatibilityRating } from '../musicalCompatibility';
import { scaleNameToDbKey } from './scale-mapping';

/**
 * Get compatible scales from database via API for a given key and scale
 * This is the main function that replaces the algorithmic approach
 *
 * The database uses sharp notation (C#, D#, F#, G#, A#) internally
 */
export async function getCompatibleScalesFromDatabase(
  key: string,
  scaleName: string,
  limit: number = 12,
  minScore: number = 4
): Promise<ScaleCompatibilityRating[]> {
  try {
    // Convert UI scale name to database key
    const scaleDbKey = scaleNameToDbKey(scaleName);

    console.log(`[Compatibility Service] Key: "${key}", Scale: "${scaleName}" → "${scaleDbKey}"`);

    // Build API URL with query parameters
    const params = new URLSearchParams({
      key: key,
      scale: scaleDbKey,
      limit: limit.toString(),
      minScore: minScore.toString(),
    });

    console.log(`[Compatibility Service] Fetching: /api/compatible-scales?${params}`);

    // Fetch from server-side API
    const response = await fetch(`/api/compatible-scales?${params}`);

    if (!response.ok) {
      const error = await response.json();
      console.error('API error:', error);
      return [];
    }

    const data = await response.json();

    if (!data.compatibleScales || data.compatibleScales.length === 0) {
      console.warn(`No compatible scales found for ${key} ${scaleName}`);
      return [];
    }

    return data.compatibleScales;
  } catch (error) {
    console.error(`Error getting compatible scales for ${key} ${scaleName}:`, error);
    return [];
  }
}

/**
 * Get the primary (highest rated) compatible scale
 */
export async function getPrimaryCompatibleScale(
  key: string,
  scaleName: string
): Promise<ScaleCompatibilityRating | null> {
  const compatibleScales = await getCompatibleScalesFromDatabase(key, scaleName, 1, 9);

  return compatibleScales.length > 0 ? compatibleScales[0] : null;
}

/**
 * Batch load compatible scales for multiple key/scale combinations
 * Useful for preloading or optimizing multiple lookups
 */
export async function batchGetCompatibleScales(
  requests: Array<{ key: string; scaleName: string }>
): Promise<Map<string, ScaleCompatibilityRating[]>> {
  const results = new Map<string, ScaleCompatibilityRating[]>();

  const promises = requests.map(async ({ key, scaleName }) => {
    const cacheKey = `${key}-${scaleName}`;
    const scales = await getCompatibleScalesFromDatabase(key, scaleName);
    results.set(cacheKey, scales);
  });

  await Promise.all(promises);

  return results;
}

/**
 * Get all scales available in a key (stub for now)
 * TODO: Implement if needed
 */
export async function getAllScalesInKey(key: string): Promise<ScaleCompatibilityRating[]> {
  // This would require loading the index file and returning all scales
  // For now, return empty array
  return [];
}

/**
 * Check if a scale exists in the database (stub for now)
 * TODO: Implement if needed
 */
export async function scaleExistsInDatabase(key: string, scaleName: string): Promise<boolean> {
  try {
    const scales = await getCompatibleScalesFromDatabase(key, scaleName, 1, 0);
    return scales.length > 0;
  } catch {
    return false;
  }
}

/**
 * Get scale info (stub for now)
 * TODO: Implement if needed
 */
export async function getScaleInfo(key: string, scaleName: string): Promise<any | null> {
  // This would return detailed scale information
  // For now, return null
  return null;
}

