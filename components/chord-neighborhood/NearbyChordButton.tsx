'use client';

/**
 * Nearby Chord Button
 * Displays a single nearby chord with distance and common tone info
 */

import React from 'react';
import { ThemeConfig } from '@/lib/themes';
import { NearbyChord } from '@/lib/music-theory/neighborhood';
import { getChordSymbol } from '@/lib/music-theory/neighborhood/diatonic';
import CommonToneIndicator from './CommonToneIndicator';

interface NearbyChordButtonProps {
  theme: ThemeConfig;
  chord: NearbyChord;
  isSelected: boolean;
  onClick: () => void;
  chordColor?: string; // Color from the legend palette
}

export default function NearbyChordButton({
  theme,
  chord,
  isSelected,
  onClick,
  chordColor,
}: NearbyChordButtonProps) {
  const chordSymbol = getChordSymbol(chord.rootNote, chord.quality);

  return (
    <button
      onClick={onClick}
      className="w-full p-3 rounded-lg transition-all hover:scale-[1.02]"
      style={{
        background: isSelected ? theme.accentPrimary : theme.bgTertiary,
        border: `1px solid ${isSelected ? theme.accentPrimary : theme.border}`,
        color: isSelected ? '#ffffff' : theme.textPrimary,
      }}
    >
      <div className="flex items-center justify-between">
        {/* Left: Chord Info */}
        <div className="flex items-center gap-3">
          {/* Roman Numeral - Color-coded with chord color */}
          <div
            className="px-2 py-1 rounded font-bold text-sm"
            style={{
              background: chordColor || (isSelected ? 'rgba(255,255,255,0.2)' : theme.bgSecondary),
              color: '#ffffff',
              boxShadow: chordColor ? `0 0 8px ${chordColor}` : 'none',
            }}
          >
            {chord.degree}
          </div>

          {/* Chord Symbol and Function */}
          <div className="text-left">
            <div className="font-bold text-base">{chordSymbol}</div>
            <div
              className="text-xs"
              style={{
                color: isSelected ? 'rgba(255,255,255,0.8)' : theme.textSecondary,
              }}
            >
              {chord.function}
            </div>
          </div>
        </div>

        {/* Right: Distance and Common Tones */}
        <div className="flex items-center gap-3">
          {/* Common Tones */}
          <CommonToneIndicator
            theme={theme}
            commonTones={chord.commonTones}
            isSelected={isSelected}
          />

          {/* Distance */}
          <div
            className="px-2 py-1 rounded text-xs font-semibold"
            style={{
              background: isSelected ? 'rgba(255,255,255,0.2)' : theme.bgSecondary,
              color: isSelected ? '#ffffff' : theme.textSecondary,
            }}
          >
            {chord.distance} frets
          </div>
        </div>
      </div>
    </button>
  );
}

