'use client';

/**
 * Key Selector Component
 * Allows selection of key, mode, and chord quality
 */

import React from 'react';
import { useTriadSystem } from '../TriadSystemContext';
import { createNote, NOTES_SHARP } from '@/lib/music-theory';
import type { ThemeConfig } from '@/lib/themes';
import type { PitchClass, ScaleMode, TriadQuality } from '@/lib/music-theory/types';

interface KeySelectorProps {
  theme: ThemeConfig;
}

export function KeySelector({ theme }: KeySelectorProps) {
  const { state, setSelectedKey, setSelectedMode, setSelectedQuality } = useTriadSystem();

  const handleKeyChange = (pitchClass: PitchClass) => {
    setSelectedKey(createNote(pitchClass));
  };

  const handleModeChange = (mode: ScaleMode) => {
    setSelectedMode(mode);
  };

  const handleQualityChange = (quality: TriadQuality) => {
    setSelectedQuality(quality);
  };

  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: theme.bgTertiary,
        border: `1px solid ${theme.border}`
      }}
    >
      <h3 
        className="text-sm font-semibold mb-3"
        style={{ color: theme.textPrimary }}
      >
        Key & Chord Selection
      </h3>

      {/* Key Selection */}
      <div className="mb-3">
        <label 
          className="text-xs font-medium mb-2 block"
          style={{ color: theme.textSecondary }}
        >
          Key
        </label>
        <div className="grid grid-cols-6 gap-1">
          {NOTES_SHARP.map((note, index) => {
            const pitchClass = index as PitchClass;
            const isSelected = state.selectedKey.pitchClass === pitchClass;
            
            return (
              <button
                key={note}
                onClick={() => handleKeyChange(pitchClass)}
                className="px-2 py-1.5 rounded text-xs font-semibold transition-all"
                style={{
                  background: isSelected ? theme.accentPrimary : theme.bgSecondary,
                  color: isSelected ? '#FFFFFF' : theme.textPrimary,
                  border: `1px solid ${isSelected ? theme.accentPrimary : theme.border}`,
                  opacity: isSelected ? 1 : 0.7
                }}
              >
                {note}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode Selection */}
      <div className="mb-3">
        <label 
          className="text-xs font-medium mb-2 block"
          style={{ color: theme.textSecondary }}
        >
          Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['major', 'minor'] as ScaleMode[]).map(mode => {
            const isSelected = state.selectedMode === mode;
            
            return (
              <button
                key={mode}
                onClick={() => handleModeChange(mode)}
                className="px-3 py-2 rounded text-sm font-semibold capitalize transition-all"
                style={{
                  background: isSelected ? theme.accentPrimary : theme.bgSecondary,
                  color: isSelected ? '#FFFFFF' : theme.textPrimary,
                  border: `1px solid ${isSelected ? theme.accentPrimary : theme.border}`
                }}
              >
                {mode}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chord Quality Selection */}
      <div>
        <label 
          className="text-xs font-medium mb-2 block"
          style={{ color: theme.textSecondary }}
        >
          Chord Quality
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['major', 'minor', 'diminished', 'augmented'] as TriadQuality[]).map(quality => {
            const isSelected = state.selectedQuality === quality;
            const displayName = quality === 'diminished' ? 'dim' : quality === 'augmented' ? 'aug' : quality;
            
            return (
              <button
                key={quality}
                onClick={() => handleQualityChange(quality)}
                className="px-3 py-2 rounded text-sm font-semibold capitalize transition-all"
                style={{
                  background: isSelected ? theme.accentPrimary : theme.bgSecondary,
                  color: isSelected ? '#FFFFFF' : theme.textPrimary,
                  border: `1px solid ${isSelected ? theme.accentPrimary : theme.border}`
                }}
              >
                {displayName}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

