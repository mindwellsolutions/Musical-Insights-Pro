'use client';

import { useMemo } from 'react';
import { AIChordRecommendation } from '@/lib/ai-assistant/types';
import { ThemeConfig } from '@/lib/themes';
import { getDifficultyColor, getDifficultyLabel } from '@/lib/ai-assistant/scale-parser';
import { Music } from 'lucide-react';
import ChordDiagram from '@/components/ChordDiagram';
import { calculateChordVoicings } from '@/lib/chord-voicings';

interface ChordRecommendationCardProps {
  chord: AIChordRecommendation;
  theme: ThemeConfig;
  tuning: string[];
  stringCount: number;
}

export default function ChordRecommendationCard({
  chord,
  theme,
  tuning,
  stringCount
}: ChordRecommendationCardProps) {
  const difficultyColor = getDifficultyColor(chord.difficulty);
  const difficultyLabel = getDifficultyLabel(chord.difficulty);

  // Calculate chord voicings - show all by default
  const voicings = useMemo(() => {
    if (!chord.notes || chord.notes.length === 0) {
      return [];
    }
    return calculateChordVoicings(chord.notes, chord.rootNote, tuning, 12);
  }, [chord.notes, chord.rootNote, tuning]);

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
              {chord.chordName}
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
            {chord.genreContext && (
              <span className="text-xs" style={{ color: theme.textSecondary }}>
                {chord.genreContext}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Chord Diagram(s) - All voicings in 3-column grid */}
      {voicings.length > 0 && (
        <div className="mb-3">
          <div className="grid grid-cols-3 gap-2">
            {voicings.map((voicing, idx) => (
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

      {/* Chord Tones */}
      {chord.notes && chord.notes.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold mb-1" style={{ color: theme.textSecondary }}>
            Chord Tones:
          </p>
          <div className="flex flex-wrap gap-1">
            {chord.notes.map((note, index) => (
              <span
                key={index}
                className="text-xs px-2 py-0.5 rounded font-medium"
                style={{
                  background: theme.accentPrimary + '20',
                  color: theme.accentPrimary,
                }}
              >
                {note}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rationale */}
      <p className="text-sm" style={{ color: theme.textSecondary }}>
        {chord.rationale}
      </p>
    </div>
  );
}

