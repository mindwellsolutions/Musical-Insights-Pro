'use client';

import { useState, useEffect, memo, useMemo } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { ChevronDown, ChevronUp, ListMusic, Music, CheckCircle } from 'lucide-react';
import { ChordProgression } from '@/lib/progression-analyzer/types';
import { ProgressionChordSelections } from '@/lib/music-theory/progression-interval-chords/types';
import ProgressionIntervalChordSelector from '@/components/progression-chords/ProgressionIntervalChordSelector';

interface ChordProgressionRecommendationsProps {
  theme: ThemeConfig;
  currentKey: string;
  onProgressionSelect?: (progression: ChordProgression | null) => void;
  onChordSelectionsChange?: (selections: ProgressionChordSelections, viewMode: 'step' | 'all', currentSlot: number) => void;
  selectedProgressionId?: string | null;
  hideContainer?: boolean;
}

const ChordProgressionRecommendations = memo(function ChordProgressionRecommendations({
  theme,
  currentKey,
  onProgressionSelect,
  onChordSelectionsChange,
  selectedProgressionId = null,
  hideContainer = false,
}: ChordProgressionRecommendationsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [progressions, setProgressions] = useState<ChordProgression[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [genreFilter, setGenreFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);

  useEffect(() => {
    if (!currentKey) {
      return;
    }

    const fetchProgressions = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ key: currentKey });
        if (genreFilter) params.append('genre', genreFilter);
        if (difficultyFilter) params.append('difficulty', difficultyFilter.toString());

        const response = await fetch(`/api/progression-recommendations?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch progression recommendations');
        }

        const data = await response.json();
        setProgressions(data.progressions || []);
      } catch (err) {
        console.error('Error fetching progression recommendations:', err);
        setError('Failed to load progression recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchProgressions();
  }, [currentKey, genreFilter, difficultyFilter]);

  const allGenres = useMemo(() =>
    Array.from(new Set(progressions.flatMap(p => p.genre))).sort(),
    [progressions]
  );

  const content = (
    <>
      {!hideContainer && (
        <div
          className="flex items-center justify-between cursor-pointer mb-4"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <ListMusic size={24} style={{ color: theme.accentPrimary }} />
            <h2 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
              Common Progressions in {currentKey}
            </h2>
          </div>
          {isExpanded ? (
            <ChevronUp size={24} style={{ color: theme.textSecondary }} />
          ) : (
            <ChevronDown size={24} style={{ color: theme.textSecondary }} />
          )}
        </div>
      )}

      {(hideContainer || isExpanded) && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            {/* Genre Filter */}
            <select
              value={genreFilter || ''}
              onChange={(e) => setGenreFilter(e.target.value || null)}
              className="px-4 py-2 rounded-lg"
              style={{
                background: theme.bgTertiary,
                color: theme.textPrimary,
                border: `1px solid ${theme.border}`,
              }}
            >
              <option value="">All Genres</option>
              {allGenres.map(genre => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={difficultyFilter || ''}
              onChange={(e) => setDifficultyFilter(e.target.value ? parseInt(e.target.value) : null)}
              className="px-4 py-2 rounded-lg"
              style={{
                background: theme.bgTertiary,
                color: theme.textPrimary,
                border: `1px solid ${theme.border}`,
              }}
            >
              <option value="">All Difficulties</option>
              {[1, 2, 3, 4, 5].map(level => (
                <option key={level} value={level}>
                  Difficulty {level}
                </option>
              ))}
            </select>
          </div>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, idx) => (
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
                  <div className="flex gap-2 mb-3">
                    <div className="h-8 w-16 rounded" style={{ background: theme.border }} />
                    <div className="h-8 w-16 rounded" style={{ background: theme.border }} />
                    <div className="h-8 w-16 rounded" style={{ background: theme.border }} />
                  </div>
                  <div className="h-3 rounded mb-2" style={{ background: theme.border, width: '60%' }} />
                  <div className="h-3 rounded" style={{ background: theme.border, width: '80%' }} />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-8" style={{ color: theme.accentSecondary }}>
              {error}
            </div>
          )}

          {!loading && !error && progressions.length === 0 && (
            <div className="text-center py-8" style={{ color: theme.textSecondary }}>
              No progressions found for the selected filters.
            </div>
          )}

          {!loading && !error && progressions.length > 0 && (
            <div className="space-y-4">
              {/* Active filter indicator */}
              {selectedProgressionId && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: `${theme.accentPrimary}18`, border: `1px solid ${theme.accentPrimary}40`, color: theme.accentPrimary }}>
                  <CheckCircle size={13} />
                  Progression active on fretboard — highlighted notes are from this progression. Click the card again to deselect.
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {progressions.map((progression) => {
                  const isSelected = selectedProgressionId === progression.id;
                  return (
                    <div key={progression.id} className="flex flex-col">
                      <div
                        onClick={() => onProgressionSelect?.(isSelected ? null : progression)}
                        className="rounded-xl p-4 cursor-pointer relative transition-all duration-200"
                        style={{
                          background: isSelected
                            ? `linear-gradient(135deg, ${theme.accentPrimary}22, ${theme.bgTertiary} 60%)`
                            : theme.bgTertiary,
                          border: `2px solid ${isSelected ? theme.accentPrimary : theme.border}`,
                          boxShadow: isSelected
                            ? `0 0 0 3px ${theme.accentPrimary}25, 0 6px 24px ${theme.accentPrimary}30`
                            : 'none',
                          transform: isSelected ? 'translateY(-2px) scale(1.01)' : 'translateY(0) scale(1)',
                        }}
                      >
                        {/* Selected badge */}
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ background: theme.accentPrimary, color: '#fff' }}>
                            <CheckCircle size={10} />
                            Active
                          </div>
                        )}

                        {/* Click hint when not selected */}
                        {!isSelected && (
                          <div className="absolute top-2.5 right-2.5 text-[9px] font-medium opacity-40"
                            style={{ color: theme.textSecondary }}>
                            Click to highlight
                          </div>
                        )}

                        {/* Name & Difficulty */}
                        <div className="flex items-start justify-between mb-2 pr-16">
                          <h3 className="text-base font-bold flex-1" style={{ color: theme.textPrimary }}>
                            {progression.name}
                          </h3>
                        </div>

                        {/* Chords in sequence with → arrows */}
                        <div className="flex flex-wrap items-center gap-1 mb-2">
                          {progression.chords.map((chord, idx) => (
                            <span key={idx} className="flex items-center gap-1">
                              <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                                style={{
                                  background: isSelected
                                    ? `${theme.accentPrimary}30`
                                    : theme.buttonPrimary,
                                  color: '#ffffff',
                                  border: isSelected ? `1px solid ${theme.accentPrimary}60` : 'none',
                                }}>
                                {chord}
                              </span>
                              {idx < progression.chords.length - 1 && (
                                <span className="text-xs font-bold opacity-40" style={{ color: theme.textSecondary }}>→</span>
                              )}
                            </span>
                          ))}
                        </div>

                        {/* Roman numerals */}
                        <div className="text-[10px] mb-2 font-mono" style={{ color: theme.textSecondary }}>
                          {progression.romanNumerals.join(' → ')}
                        </div>

                        <div className="flex flex-wrap gap-1 mb-2">
                          {progression.genre.map((g, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded text-[10px]"
                              style={{ background: theme.border, color: theme.textPrimary }}>
                              {g}
                            </span>
                          ))}
                          {/* Difficulty dots inline */}
                          <div className="flex gap-0.5 items-center ml-auto">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="w-1.5 h-1.5 rounded-full"
                                style={{ background: i < progression.difficulty ? theme.accentPrimary : theme.border }} />
                            ))}
                          </div>
                        </div>

                        {progression.famousSongs.length > 0 && (
                          <div className="text-[10px]" style={{ color: theme.textSecondary }}>
                            <Music size={10} className="inline mr-1" />
                            {progression.famousSongs.slice(0, 2).join(', ')}
                            {progression.famousSongs.length > 2 && '...'}
                          </div>
                        )}
                      </div>

                      {/* Inline Chord Selector — expands below the selected card */}
                      {isSelected && onChordSelectionsChange && (
                        <ProgressionIntervalChordSelector
                          progression={progression}
                          currentKey={currentKey}
                          theme={theme}
                          onChordSelectionsChange={onChordSelectionsChange}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );

  if (hideContainer) {
    return content;
  }

  return (
    <div
      className="rounded-xl p-6 mb-6"
      style={{
        background: theme.bgSecondary,
        border: `2px solid ${theme.border}`,
      }}
    >
      {content}
    </div>
  );
});

export default ChordProgressionRecommendations;
