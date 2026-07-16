'use client';

import { AIScaleRecommendation } from '@/lib/ai-assistant/types';
import { ThemeConfig } from '@/lib/themes';
import { getDifficultyColor, getDifficultyLabel } from '@/lib/ai-assistant/scale-parser';
import { Music, Check, Download } from 'lucide-react';

interface ScaleCardProps {
  scale: AIScaleRecommendation;
  theme: ThemeConfig;
  isLoaded: boolean;
  onLoad: () => void;
}

export default function ScaleCard({ scale, theme, isLoaded, onLoad }: ScaleCardProps) {
  const difficultyColor = getDifficultyColor(scale.difficulty);
  const difficultyLabel = getDifficultyLabel(scale.difficulty);

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
              {scale.rootNote} {scale.scaleName}
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
            {scale.genreContext && (
              <span className="text-xs" style={{ color: theme.textSecondary }}>
                {scale.genreContext}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Intervals */}
      <div className="mb-3">
        <p className="text-xs font-semibold mb-1" style={{ color: theme.textSecondary }}>
          Intervals:
        </p>
        <div className="flex flex-wrap gap-1">
          {scale.intervals.map((interval, index) => (
            <span
              key={index}
              className="text-xs px-2 py-0.5 rounded"
              style={{
                background: theme.bgSecondary,
                color: theme.textPrimary,
              }}
            >
              {interval}
            </span>
          ))}
        </div>
      </div>

      {/* Chord Tones */}
      {scale.chordTones && scale.chordTones.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold mb-1" style={{ color: theme.textSecondary }}>
            Chord Tones:
          </p>
          <div className="flex flex-wrap gap-1">
            {scale.chordTones.map((note, index) => (
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
      <p className="text-sm mb-3" style={{ color: theme.textSecondary }}>
        {scale.rationale}
      </p>

      {/* Load Button */}
      <button
        onClick={onLoad}
        disabled={isLoaded}
        className="w-1/2 py-2 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
        style={{
          background: isLoaded ? theme.bgSecondary : theme.accentPrimary,
          color: isLoaded ? theme.textSecondary : '#ffffff',
          cursor: isLoaded ? 'default' : 'pointer',
          opacity: isLoaded ? 0.7 : 1,
        }}
      >
        {isLoaded ? (
          <>
            <Check className="w-4 h-4" />
            Loaded on Fretboard
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Load on Fretboard
          </>
        )}
      </button>
    </div>
  );
}

