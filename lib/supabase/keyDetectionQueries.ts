/**
 * Supabase Queries for Key Detection
 * Handles database operations for musical key detection and history
 */

import { getSupabaseClient, type MusicalKey, type ScaleModeCompatibility, type DetectedKeyHistory } from './client';

/**
 * Get all musical keys from the database
 */
export async function getAllMusicalKeys(): Promise<MusicalKey[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn('Supabase client not available');
    return [];
  }

  const { data, error } = await supabase
    .from('musical_keys')
    .select('*')
    .order('key_name');

  if (error) {
    console.error('Error fetching musical keys:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a specific musical key by name
 */
export async function getMusicalKeyByName(keyName: string): Promise<MusicalKey | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    // Silently return null - database not configured
    return null;
  }

  const { data, error } = await supabase
    .from('musical_keys')
    .select('*')
    .eq('key_name', keyName)
    .single();

  if (error) {
    // Silently return null - database not configured
    return null;
  }

  return data;
}

/**
 * Get compatible scales for a detected musical key
 * Returns scales sorted by compatibility rating (highest first)
 */
export async function getCompatibleScalesForKey(
  keyName: string,
  minRating: number = 5
): Promise<ScaleModeCompatibility[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    // Silently return empty - database not configured
    return [];
  }

  // First get the musical key
  const musicalKey = await getMusicalKeyByName(keyName);

  if (!musicalKey) {
    // Silently return empty - database not configured
    return [];
  }

  // Get compatible scales
  const { data, error } = await supabase
    .from('scale_mode_compatibility')
    .select('*')
    .eq('musical_key_id', musicalKey.id)
    .gte('compatibility_rating', minRating)
    .order('compatibility_rating', { ascending: false })
    .order('scale_mode_name');

  if (error) {
    console.error(`Error fetching compatible scales for ${keyName}:`, error);
    return [];
  }

  return data || [];
}

/**
 * Get the primary (best) scale for a detected musical key
 */
export async function getPrimaryScaleForKey(keyName: string): Promise<ScaleModeCompatibility | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn('Supabase client not available');
    return null;
  }

  const musicalKey = await getMusicalKeyByName(keyName);

  if (!musicalKey) {
    return null;
  }

  const { data, error } = await supabase
    .from('scale_mode_compatibility')
    .select('*')
    .eq('musical_key_id', musicalKey.id)
    .eq('is_primary', true)
    .single();

  if (error) {
    // If no primary scale found, get the highest rated one
    const { data: fallbackData } = await supabase
      .from('scale_mode_compatibility')
      .select('*')
      .eq('musical_key_id', musicalKey.id)
      .order('compatibility_rating', { ascending: false })
      .limit(1)
      .single();

    return fallbackData || null;
  }

  return data;
}

/**
 * Record a detected key in history (for analytics)
 */
export async function recordDetectedKey(
  detectedKey: string,
  confidenceScore: number,
  sessionId?: string,
  audioSource?: string
): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    // Silently return - database not configured
    return;
  }

  const { error } = await supabase
    .from('detected_key_history')
    .insert({
      detected_key: detectedKey,
      confidence_score: confidenceScore,
      session_id: sessionId,
      audio_source: audioSource,
    });

  if (error) {
    // Silently ignore - database not configured
    return;
  }
}

/**
 * Get recent detected keys for a session
 */
export async function getRecentDetectedKeys(
  sessionId: string,
  limit: number = 10
): Promise<DetectedKeyHistory[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn('Supabase client not available');
    return [];
  }

  const { data, error } = await supabase
    .from('detected_key_history')
    .select('*')
    .eq('session_id', sessionId)
    .order('detected_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent detected keys:', error);
    return [];
  }

  return data || [];
}

/**
 * Get detection statistics for analytics
 */
export async function getDetectionStats(sessionId?: string) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn('Supabase client not available');
    return null;
  }

  let query = supabase
    .from('detected_key_history')
    .select('detected_key, confidence_score');

  if (sessionId) {
    query = query.eq('session_id', sessionId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching detection stats:', error);
    return null;
  }

  // Calculate statistics
  const keyFrequency: Record<string, number> = {};
  let totalConfidence = 0;
  let count = 0;

  data?.forEach(record => {
    keyFrequency[record.detected_key] = (keyFrequency[record.detected_key] || 0) + 1;
    totalConfidence += record.confidence_score;
    count++;
  });

  const mostCommonKey = Object.entries(keyFrequency)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || null;

  return {
    totalDetections: count,
    averageConfidence: count > 0 ? totalConfidence / count : 0,
    mostCommonKey,
    keyFrequency,
  };
}

