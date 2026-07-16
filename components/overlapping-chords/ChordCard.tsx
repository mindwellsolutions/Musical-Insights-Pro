/**
 * Chord Card Component
 * Displays an individual chord with selection capability
 */

'use client';

import { ThemeConfig } from '@/lib/themes';
import { OverlappingChord } from '@/lib/music-theory/overlapping-chords/types';
import { Check } from 'lucide-react';

interface ChordCardProps {
  theme: ThemeConfig;
  chord: OverlappingChord;
  isSelected: boolean;
  isHovered: boolean;
  onHover: () => void;
  onHoverEnd: () => void;
  onClick: () => void;
}

// Map quality to display name
const QUALITY_DISPLAY_NAMES: Record<string, string> = {
  major: 'Major',
  minor: 'Minor',
  diminished: 'Diminished',
  augmented: 'Augmented',
  dominant7: 'Dominant 7th',
  major7: 'Major 7th',
  minor7: 'Minor 7th',
};

export default function ChordCard({
  theme,
  chord,
  isSelected,
  isHovered,
  onHover,
  onHoverEnd,
  onClick,
}: ChordCardProps) {
  return (
    <div
      className="rounded-lg p-3 cursor-pointer transition-all duration-200"
      style={{
        background: isSelected ? theme.accentPrimary : theme.bgTertiary,
        border: `1px solid ${isHovered ? theme.accentPrimary : theme.border}`,
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isHovered ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
      }}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      onClick={onClick}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-lg font-bold"
          style={{
            color: isSelected ? '#ffffff' : theme.textPrimary,
          }}
        >
          {chord.chordSymbol}
        </span>
        {isSelected && (
          <Check
            size={18}
            style={{ color: '#ffffff' }}
          />
        )}
      </div>

      {/* Quality */}
      <div
        className="text-xs font-medium mb-2"
        style={{
          color: isSelected ? 'rgba(255, 255, 255, 0.9)' : theme.textSecondary,
        }}
      >
        {QUALITY_DISPLAY_NAMES[chord.quality] || chord.quality}
      </div>

      {/* Info */}
      <div
        className="text-xs flex items-center gap-2"
        style={{
          color: isSelected ? 'rgba(255, 255, 255, 0.8)' : theme.textSecondary,
        }}
      >
        <span>{chord.notes.length} notes</span>
        <span>•</span>
        <span>Frets {chord.fretRange[0]}-{chord.fretRange[1]}</span>
      </div>

      {/* Overlap Info */}
      <div
        className="text-xs mt-2 pt-2"
        style={{
          borderTop: `1px solid ${isSelected ? 'rgba(255, 255, 255, 0.2)' : theme.border}`,
          color: isSelected ? 'rgba(255, 255, 255, 0.8)' : theme.textSecondary,
        }}
      >
        {chord.overlapPercentage === 100 ? (
          <span>100% overlap (all notes)</span>
        ) : (
          <span>{chord.overlapCount} of {chord.notes.length} notes overlap</span>
        )}
      </div>

      {/* Color Indicator */}
      {isSelected && chord.color && (
        <div className="mt-2">
          <div
            className="h-1 rounded-full"
            style={{ backgroundColor: chord.color }}
          />
        </div>
      )}
    </div>
  );
}

