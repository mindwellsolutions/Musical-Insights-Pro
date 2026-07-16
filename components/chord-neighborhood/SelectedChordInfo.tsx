'use client';

/**
 * Selected Chord Info Component
 * Displays compact information about the selected anchor chord above the fretboard
 * with navigation arrows to cycle through different chord positions
 */

import React from 'react';
import { ThemeConfig } from '@/lib/themes';
import { AnchorVoicing } from '@/lib/music-theory/neighborhood';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SelectedChordInfoProps {
  theme: ThemeConfig;
  anchorVoicing: AnchorVoicing;
  anchorSymbol: string;
  // Navigation props
  currentPositionIndex?: number;
  totalPositions?: number;
  onNavigatePrevious?: () => void;
  onNavigateNext?: () => void;
  // On-fretboard arrows toggle
  showFretboardArrows?: boolean;
  onShowFretboardArrowsChange?: (show: boolean) => void;
}

export default function SelectedChordInfo({
  theme,
  anchorVoicing,
  anchorSymbol,
  currentPositionIndex,
  totalPositions,
  onNavigatePrevious,
  onNavigateNext,
  showFretboardArrows = false,
  onShowFretboardArrowsChange,
}: SelectedChordInfoProps) {
  const showNavigation = totalPositions !== undefined && totalPositions > 1 && onNavigatePrevious && onNavigateNext;

  return (
    <div className="flex items-center gap-2">
      {/* Left Arrow */}
      {showNavigation && (
        <button
          onClick={onNavigatePrevious}
          className="p-1.5 rounded transition-all hover:scale-110"
          style={{
            background: theme.bgTertiary,
            color: theme.textPrimary,
            border: `1px solid ${theme.border}`,
          }}
          title="Previous chord position"
        >
          <ChevronLeft size={18} />
        </button>
      )}

      {/* Chord Info */}
      <div
        className="flex items-center gap-2 px-3 py-1 rounded whitespace-nowrap"
        style={{
          background: theme.bgTertiary,
          color: theme.textPrimary,
          border: `1px solid ${theme.border}`,
        }}
      >
        <span className="text-sm font-semibold">
          Selected Chord: {anchorSymbol} <span style={{ color: theme.textSecondary }}>Fret {anchorVoicing.fretPosition}</span>
          {showNavigation && currentPositionIndex !== undefined && (
            <span style={{ color: theme.textSecondary }}> ({currentPositionIndex + 1}/{totalPositions})</span>
          )}
        </span>

        {/* Checkbox for on-fretboard arrows */}
        {showNavigation && onShowFretboardArrowsChange && (
          <label className="flex items-center gap-1.5 ml-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={showFretboardArrows}
              onChange={(e) => onShowFretboardArrowsChange(e.target.checked)}
              className="w-3.5 h-3.5 rounded cursor-pointer"
              style={{
                accentColor: theme.accentPrimary,
              }}
            />
            <span
              className="text-xs transition-colors"
              style={{
                color: theme.textSecondary,
              }}
              title="Show navigation arrows on fretboard"
            >
              On-Fret Arrows
            </span>
          </label>
        )}
      </div>

      {/* Right Arrow */}
      {showNavigation && (
        <button
          onClick={onNavigateNext}
          className="p-1.5 rounded transition-all hover:scale-110"
          style={{
            background: theme.bgTertiary,
            color: theme.textPrimary,
            border: `1px solid ${theme.border}`,
          }}
          title="Next chord position"
        >
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}

