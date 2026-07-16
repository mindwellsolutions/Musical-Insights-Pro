/**
 * Scale Enrichment Tests
 * 
 * Tests for the token optimization system that enriches slim AI responses
 * with full scale data from our database.
 */

import { enrichScaleRecommendation, enrichScaleRecommendations } from '../scale-enrichment';
import { AIScaleRecommendationSlim } from '../types';

describe('Scale Enrichment', () => {
  describe('enrichScaleRecommendation', () => {
    it('should enrich a valid Dorian scale recommendation', () => {
      const slim: AIScaleRecommendationSlim = {
        scaleName: 'Dorian',
        rootNote: 'D',
        rationale: 'Perfect for jazz and funk with minor quality and raised 6th degree.',
        genreContext: 'Jazz, Funk',
        difficulty: 3,
      };

      const enriched = enrichScaleRecommendation(slim);

      expect(enriched).not.toBeNull();
      expect(enriched?.scaleName).toBe('Dorian');
      expect(enriched?.rootNote).toBe('D');
      expect(enriched?.intervals).toEqual([0, 2, 3, 5, 7, 9, 10]);
      expect(enriched?.noteDegrees).toHaveLength(7);
      expect(enriched?.chordTones).toContain('D');
      expect(enriched?.chordTones).toContain('F');
      expect(enriched?.chordTones).toContain('A');
      expect(enriched?.chordTones).toContain('C');
      expect(enriched?.rationale).toBe(slim.rationale);
      expect(enriched?.genreContext).toBe(slim.genreContext);
      expect(enriched?.difficulty).toBe(3);
    });

    it('should enrich Pentatonic Minor scale', () => {
      const slim: AIScaleRecommendationSlim = {
        scaleName: 'Pentatonic Minor',
        rootNote: 'A',
        rationale: 'Essential for blues and rock soloing.',
        genreContext: 'Blues, Rock',
        difficulty: 1,
      };

      const enriched = enrichScaleRecommendation(slim);

      expect(enriched).not.toBeNull();
      expect(enriched?.intervals).toEqual([0, 3, 5, 7, 10]);
      expect(enriched?.noteDegrees).toHaveLength(5);
    });

    it('should enrich Harmonic Minor scale', () => {
      const slim: AIScaleRecommendationSlim = {
        scaleName: 'Harmonic Minor',
        rootNote: 'E',
        rationale: 'Creates exotic, Middle Eastern sound.',
        genreContext: 'Metal, Classical',
        difficulty: 5,
      };

      const enriched = enrichScaleRecommendation(slim);

      expect(enriched).not.toBeNull();
      expect(enriched?.intervals).toEqual([0, 2, 3, 5, 7, 8, 11]);
    });

    it('should handle unknown scale names gracefully', () => {
      const slim: AIScaleRecommendationSlim = {
        scaleName: 'Unknown Scale',
        rootNote: 'C',
        rationale: 'Test unknown scale',
        genreContext: 'Test',
        difficulty: 5,
      };

      const enriched = enrichScaleRecommendation(slim);

      expect(enriched).toBeNull();
    });

    it('should handle invalid root notes gracefully', () => {
      const slim: AIScaleRecommendationSlim = {
        scaleName: 'Dorian',
        rootNote: 'X', // Invalid note
        rationale: 'Test invalid root',
        genreContext: 'Test',
        difficulty: 5,
      };

      const enriched = enrichScaleRecommendation(slim);

      expect(enriched).toBeNull();
    });
  });

  describe('enrichScaleRecommendations', () => {
    it('should enrich multiple recommendations', () => {
      const slimRecommendations: AIScaleRecommendationSlim[] = [
        {
          scaleName: 'Dorian',
          rootNote: 'D',
          rationale: 'Jazz scale',
          genreContext: 'Jazz',
          difficulty: 3,
        },
        {
          scaleName: 'Pentatonic Minor',
          rootNote: 'A',
          rationale: 'Blues scale',
          genreContext: 'Blues',
          difficulty: 1,
        },
      ];

      const enriched = enrichScaleRecommendations(slimRecommendations);

      expect(enriched).toHaveLength(2);
      expect(enriched[0].intervals).toBeDefined();
      expect(enriched[1].intervals).toBeDefined();
    });

    it('should filter out failed enrichments', () => {
      const slimRecommendations: AIScaleRecommendationSlim[] = [
        {
          scaleName: 'Dorian',
          rootNote: 'D',
          rationale: 'Valid scale',
          genreContext: 'Jazz',
          difficulty: 3,
        },
        {
          scaleName: 'Unknown Scale',
          rootNote: 'C',
          rationale: 'Invalid scale',
          genreContext: 'Test',
          difficulty: 5,
        },
      ];

      const enriched = enrichScaleRecommendations(slimRecommendations);

      expect(enriched).toHaveLength(1);
      expect(enriched[0].scaleName).toBe('Dorian');
    });
  });
});

