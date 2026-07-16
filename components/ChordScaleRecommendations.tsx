'use client';

import { useState, useEffect, memo } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { ChevronDown, ChevronUp, Music, Star } from 'lucide-react';
import { CompatibleScale } from '@/lib/chord-scale-compatibility/types';

interface ChordScaleRecommendationsProps {
  theme: ThemeConfig;
  selectedChord: string | null; // e.g., "Cmaj7", "Dm7", "G7"
  onScaleSelect?: (scaleName: string) => void;
}

const ChordScaleRecommendations = memo(function ChordScaleRecommendations({
  theme,
  selectedChord,
  onScaleSelect,
}: ChordScaleRecommendationsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [compatibleScales, setCompatibleScales] = useState<CompatibleScale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedChord) {
      setCompatibleScales([]);
      setError(null);
      return;
    }

    const fetchCompatibleScales = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/chord-scale-compatibility?chord=${encodeURIComponent(selectedChord)}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch compatible scales');
        }

        const data = await response.json();
        setCompatibleScales(data.compatibleScales || []);
      } catch (err) {
        console.error('Error fetching compatible scales:', err);
        setError('Failed to load scale recommendations');
        setCompatibleScales([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompatibleScales();
  }, [selectedChord]);

  if (!selectedChord) {
    return null;
  }

  return (
    <div
      className="rounded-xl p-6 mb-6"
      style={{
        background: theme.bgSecondary,
        border: `2px solid ${theme.border}`,
      }}
      role="region"
      aria-label="Chord to Scale Recommendations"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer mb-4"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? 'Collapse recommendations' : 'Expand recommendations'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="flex items-center gap-3">
          <Music size={24} style={{ color: theme.accentPrimary }} />
          <h2 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
            Compatible Scales for {selectedChord}
          </h2>
        </div>
        {isExpanded ? (
          <ChevronUp size={24} style={{ color: theme.textSecondary }} />
        ) : (
          <ChevronDown size={24} style={{ color: theme.textSecondary }} />
        )}
      </div>

      {isExpanded && (
        <>
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-lg p-4 animate-pulse"
                  style={{
                    background: theme.bgTertiary,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <div className="h-6 rounded mb-2" style={{ background: theme.border, width: '70%' }} />
                  <div className="h-4 rounded mb-3" style={{ background: theme.border, width: '90%' }} />
                  <div className="h-3 rounded" style={{ background: theme.border, width: '50%' }} />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div
              className="text-center py-8 rounded-lg"
              style={{ color: theme.accentSecondary, background: theme.bgTertiary }}
            >
              {error}
            </div>
          )}

          {!loading && !error && compatibleScales.length === 0 && (
            <div className="text-center py-8" style={{ color: theme.textSecondary }}>
              No compatible scales found for this chord.
            </div>
          )}

          {!loading && !error && compatibleScales.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {compatibleScales.map((scale, index) => (
                <div
                  key={index}
                  onClick={() => onScaleSelect?.(scale.scaleName)}
                  className="rounded-lg p-4 transition-all hover:scale-[1.02] cursor-pointer"
                  style={{
                    background: theme.bgTertiary,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  {/* Scale Name & Score */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold flex-1" style={{ color: theme.textPrimary }}>
                      {scale.scaleName}
                    </h3>
                    <div className="flex items-center gap-1 ml-2">
                      <Star size={16} style={{ color: theme.accentPrimary, fill: theme.accentPrimary }} />
                      <span className="text-sm font-bold" style={{ color: theme.accentPrimary }}>
                        {scale.compatibilityScore}
                      </span>
                    </div>
                  </div>

                  {/* Relationship */}
                  <p className="text-sm mb-3" style={{ color: theme.textSecondary }}>
                    {scale.relationship}
                  </p>

                  {/* Difficulty Level */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs" style={{ color: theme.textSecondary }}>
                      Difficulty:
                    </span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: i < scale.difficultyLevel ? theme.accentPrimary : theme.border,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Genres */}
                  {scale.musicGenreRecommendations && (
                    <div className="text-xs mt-2" style={{ color: theme.textSecondary }}>
                      🎸 {scale.musicGenreRecommendations}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default ChordScaleRecommendations;

