'use client';

import { useState, useMemo } from 'react';
import { AIChordProgressionRecommendation } from '@/lib/ai-assistant/types';
import { ThemeConfig } from '@/lib/themes';
import { getDifficultyColor, getDifficultyLabel } from '@/lib/ai-assistant/scale-parser';
import { Music } from 'lucide-react';
import ChordDiagram from '@/components/ChordDiagram';
import { calculateChordVoicings } from '@/lib/chord-voicings';
import { parseChordName, calculateChordTones } from '@/lib/ai-assistant/chord-enrichment';

interface ProgressionRecommendationCardProps {
  progression: AIChordProgressionRecommendation;
  theme: ThemeConfig;
  tuning: string[];
  stringCount: number;
}

export default function ProgressionRecommendationCard({
  progression,
  theme,
  tuning,
  stringCount,
}: ProgressionRecommendationCardProps) {
  const difficultyColor = getDifficultyColor(progression.difficulty);
  const difficultyLabel = getDifficultyLabel(progression.difficulty);
  const [selectedChord, setSelectedChord] = useState<string | null>(null);

  // Calculate voicings for the selected chord
  const selectedChordVoicings = useMemo(() => {
    if (!selectedChord) return [];

    const parsed = parseChordName(selectedChord);
    if (!parsed) return [];

    const { root, quality } = parsed;
    const notes = calculateChordTones(root, quality);
    return calculateChordVoicings(notes, root, tuning, 12);
  }, [selectedChord, tuning]);

  return (
    <div
      className="rounded-lg p-4 border"
      style={{
        background: theme.bgTertiary,
        borderColor: theme.border,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Music className="w-4 h-4" style={{ color: theme.accentPrimary }} />
            <h3 className="font-semibold" style={{ color: theme.textPrimary }}>
              {progression.name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: difficultyColor + '20',
                color: difficultyColor,
              }}
            >
              {difficultyLabel}
            </span>
            {progression.genreContext && (
              <span className="text-xs" style={{ color: theme.textSecondary }}>
                {progression.genreContext}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chord Progression */}
      <div className="mb-3">
        <p className="text-xs font-semibold mb-2" style={{ color: theme.textSecondary }}>
          Progression:
        </p>
        <div className="flex flex-wrap gap-2">
          {progression.chords.map((chord, index) => (
            <button
              key={index}
              onClick={() => setSelectedChord(selectedChord === chord ? null : chord)}
              className="px-4 py-2.5 rounded-lg font-bold text-sm transition-all hover:scale-105 hover:shadow-lg relative group"
              style={{
                background: selectedChord === chord
                  ? theme.accentPrimary
                  : `${theme.accentPrimary}20`,
                color: selectedChord === chord
                  ? '#ffffff'
                  : theme.accentPrimary,
                border: `2px solid ${theme.accentPrimary}`,
                cursor: 'pointer',
                boxShadow: selectedChord === chord
                  ? `0 4px 12px ${theme.accentPrimary}40`
                  : 'none',
              }}
            >
              <div className="text-center">
                <div>{chord}</div>
                {progression.romanNumerals && progression.romanNumerals[index] && (
                  <div className="text-xs opacity-70 mt-0.5">
                    {progression.romanNumerals[index]}
                  </div>
                )}
              </div>
              {/* Hover indicator */}
              <div
                className="absolute -top-1 -right-1 w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: theme.accentPrimary }}
              />
            </button>
          ))}
        </div>
        <p className="text-xs mt-2" style={{ color: theme.textSecondary }}>
          Click any chord to view voicings below
        </p>
      </div>

      {/* Chord Voicings - Inline Display */}
      {selectedChord && selectedChordVoicings.length > 0 && (
        <div className="mb-3 p-3 rounded-lg" style={{ background: theme.bgSecondary }}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
              {selectedChord} Voicings
            </h4>
            <button
              onClick={() => setSelectedChord(null)}
              className="text-xs px-2 py-1 rounded hover:bg-opacity-10 hover:bg-white transition-colors"
              style={{ color: theme.accentPrimary }}
            >
              Hide
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {selectedChordVoicings.map((voicing, idx) => (
              <div key={idx} className="flex justify-center">
                <ChordDiagram
                  voicing={voicing}
                  theme={theme}
                  stringCount={stringCount}
                  compact={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rationale */}
      <p className="text-sm" style={{ color: theme.textSecondary }}>
        {progression.rationale}
      </p>
    </div>
  );
}

