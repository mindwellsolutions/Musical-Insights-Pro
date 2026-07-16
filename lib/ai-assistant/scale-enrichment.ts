/**
 * AI Assistant Scale Enrichment Service
 * 
 * Enriches slim AI responses with full scale data from our database.
 * This is the core of our token optimization strategy.
 */

import { AIScaleRecommendation, AIScaleRecommendationSlim } from './types';
import {
  mapAIScaleNameToDatabase,
  getScaleIntervals,
  calculateNoteDegrees,
  extractChordTones,
} from './scale-database-mapper';

/**
 * Enrich a slim AI scale recommendation with full data from database
 * 
 * Takes: { scaleName, rootNote, rationale, genreContext, difficulty }
 * Returns: Full AIScaleRecommendation with intervals, noteDegrees, chordTones
 */
export function enrichScaleRecommendation(
  slim: AIScaleRecommendationSlim
): AIScaleRecommendation | null {
  try {
    // Validate input
    if (!slim.scaleName || !slim.rootNote) {
      return null;
    }

    // Get intervals from database
    const intervals = getScaleIntervals(slim.scaleName);
    if (!intervals) {
      return null;
    }

    // Calculate note degrees
    const noteDegrees = calculateNoteDegrees(slim.rootNote, intervals);

    // Extract chord tones
    const chordTones = extractChordTones(noteDegrees);

    // Return enriched recommendation
    const enriched: AIScaleRecommendation = {
      scaleName: slim.scaleName,
      rootNote: slim.rootNote,
      intervals,
      noteDegrees,
      chordTones,
      rationale: slim.rationale,
      genreContext: slim.genreContext,
      difficulty: slim.difficulty,
    };

    return enriched;

  } catch (error) {
    return null;
  }
}

/**
 * Enrich multiple scale recommendations
 * Filters out any that fail enrichment
 */
export function enrichScaleRecommendations(
  slimRecommendations: AIScaleRecommendationSlim[]
): AIScaleRecommendation[] {
  const enriched: AIScaleRecommendation[] = [];

  for (const slim of slimRecommendations) {
    const result = enrichScaleRecommendation(slim);
    if (result) {
      enriched.push(result);
    }
  }

  return enriched;
}

/**
 * Validate that an enriched scale has all required fields
 */
export function validateEnrichedScale(scale: AIScaleRecommendation): boolean {
  return !!(
    scale.scaleName &&
    scale.rootNote &&
    scale.intervals &&
    scale.intervals.length > 0 &&
    scale.noteDegrees &&
    scale.noteDegrees.length > 0 &&
    scale.chordTones &&
    scale.chordTones.length > 0 &&
    scale.rationale &&
    scale.genreContext &&
    typeof scale.difficulty === 'number'
  );
}

/**
 * Get enrichment statistics for monitoring
 */
export interface EnrichmentStats {
  total: number;
  successful: number;
  failed: number;
  successRate: number;
  failedScales: string[];
}

export function getEnrichmentStats(
  slimRecommendations: AIScaleRecommendationSlim[],
  enrichedRecommendations: AIScaleRecommendation[]
): EnrichmentStats {
  const total = slimRecommendations.length;
  const successful = enrichedRecommendations.length;
  const failed = total - successful;
  const successRate = total > 0 ? (successful / total) * 100 : 0;
  
  const failedScales = slimRecommendations
    .filter(slim => !enrichedRecommendations.find(e => 
      e.scaleName === slim.scaleName && e.rootNote === slim.rootNote
    ))
    .map(slim => `${slim.rootNote} ${slim.scaleName}`);

  return {
    total,
    successful,
    failed,
    successRate,
    failedScales,
  };
}

