'use client';

/**
 * Nearby Chord Legend
 * Displays color-coded legend for nearby chords when "Show All" is enabled
 */

import React, { useState } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { NearbyChord } from '@/lib/music-theory/neighborhood';
import { getChordSymbol } from '@/lib/music-theory/neighborhood/diatonic';
import { Settings } from 'lucide-react';

interface NearbyChordLegendProps {
  theme: ThemeConfig;
  nearbyChords: NearbyChord[];
  colors: string[];
  ringOpacity?: number;
  onRingOpacityChange?: (opacity: number) => void;
}

export default function NearbyChordLegend({
  theme,
  nearbyChords,
  colors,
  ringOpacity = 60,
  onRingOpacityChange,
}: NearbyChordLegendProps) {
  const [showOpacityControl, setShowOpacityControl] = useState(false);

  if (nearbyChords.length === 0) return null;

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded"
      style={{
        background: theme.bgTertiary,
        border: `1px solid ${theme.border}`,
      }}
    >
      <span className="text-sm font-semibold" style={{ color: theme.textSecondary }}>
        Legend:
      </span>
      <div className="flex items-center gap-3 flex-wrap">
        {nearbyChords.map((chord, index) => {
          const color = colors[index % colors.length];
          const chordSymbol = getChordSymbol(chord.rootNote, chord.quality);

          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  background: color,
                  boxShadow: `0 0 6px ${color}`,
                }}
              />
              <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                {chord.degree} - {chordSymbol}
              </span>
            </div>
          );
        })}
      </div>

      {/* Opacity Control */}
      {onRingOpacityChange && (
        <div className="relative ml-2">
          <button
            onClick={() => setShowOpacityControl(!showOpacityControl)}
            className="p-2 rounded transition-all hover:opacity-80"
            style={{
              background: theme.bgSecondary,
              border: `1px solid ${theme.border}`,
              color: theme.textSecondary,
            }}
            title="Adjust ring opacity"
          >
            <Settings className="w-4 h-4" />
          </button>

          {showOpacityControl && (
            <div
              className="absolute top-full right-0 mt-2 p-3 rounded shadow-lg z-50"
              style={{
                background: theme.bgPrimary,
                border: `1px solid ${theme.border}`,
                minWidth: '200px',
              }}
            >
              <div className="mb-2">
                <label className="text-xs font-semibold" style={{ color: theme.textSecondary }}>
                  Ring Opacity: {ringOpacity}%
                </label>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={ringOpacity}
                onChange={(e) => onRingOpacityChange(parseInt(e.target.value))}
                className="w-full"
                style={{
                  accentColor: theme.accentPrimary,
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

