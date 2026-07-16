/**
 * Hook for analyzing chord progression compatibility with the current key
 * Triggers API calls when chords are added, removed, or reordered
 */

import { useState, useEffect, useRef } from 'react';
import { ChordInstance } from '@/lib/chord-progression/types';

interface CompatibilityResult {
  score: number;
  rationale: string;
  recommendations: string;
}

interface UseChordProgressionCompatibilityReturn {
  compatibility: CompatibilityResult | null;
  isLoading: boolean;
  error: string | null;
}

export function useChordProgressionCompatibility(
  chords: ChordInstance[],
  currentKey: string
): UseChordProgressionCompatibilityReturn {
  const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track previous chord progression to detect changes
  const prevChordsRef = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Create a string representation of the chord progression for comparison
    const currentChordString = chords.map(c => c.chordSymbol).join(',');
    
    // Only analyze if:
    // 1. There are chords in the progression
    // 2. The progression has changed (added, removed, or reordered)
    // 3. We have a valid key
    if (
      chords.length === 0 ||
      currentChordString === prevChordsRef.current ||
      !currentKey
    ) {
      // If no chords, clear the compatibility result
      if (chords.length === 0 && compatibility !== null) {
        setCompatibility(null);
      }
      return;
    }

    // Update the previous chords reference
    prevChordsRef.current = currentChordString;

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    const analyzeCompatibility = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const chordProgression = chords.map(c => c.chordSymbol);

        const response = await fetch('/api/chord-progression/analyze-compatibility', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: currentKey,
            chordProgression,
          }),
          signal: abortControllerRef.current?.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to analyze compatibility');
        }

        const result: CompatibilityResult = await response.json();
        setCompatibility(result);
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        
        console.error('Error analyzing chord progression compatibility:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    analyzeCompatibility();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [chords, currentKey]); // Re-run when chords or key changes

  return {
    compatibility,
    isLoading,
    error,
  };
}

