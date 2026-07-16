/**
 * Scale Mode Controls Component
 * Controls for Scale mode (scale selection, positions, overlap type)
 */

'use client';

import { useEffect } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { OverlapType } from '@/lib/music-theory/overlapping-chords/types';
import OverlapTypeSelector from './OverlapTypeSelector';

interface ScaleModeControlsProps {
  theme: ThemeConfig;
  currentKey: string;
  currentScale: string;
  selectedScale: { key: string; mode: string } | null;
  selectedPositions: number[];
  overlapType: OverlapType;
  onSetScale: (key: string, mode: string) => void;
  onTogglePosition: (position: number) => void;
  onSetOverlapType: (type: OverlapType) => void;
}

const SCALE_POSITIONS = [0, 2, 4, 7, 9]; // Typical 5 positions for most scales

export default function ScaleModeControls({
  theme,
  currentKey,
  currentScale,
  selectedScale,
  selectedPositions,
  overlapType,
  onSetScale,
  onTogglePosition,
  onSetOverlapType,
}: ScaleModeControlsProps) {
  // Auto-select current scale if none selected
  useEffect(() => {
    if (!selectedScale && currentKey && currentScale) {
      onSetScale(currentKey, currentScale);
    }
  }, [currentKey, currentScale, selectedScale, onSetScale]);

  return (
    <div className="space-y-4">
      {/* Scale Display (read-only, uses current key/scale) */}
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: theme.textSecondary }}
        >
          Scale
        </label>
        <div
          className="px-3 py-2 rounded text-sm font-medium"
          style={{
            background: theme.bgTertiary,
            color: theme.textPrimary,
            border: `1px solid ${theme.border}`,
          }}
        >
          {selectedScale ? `${selectedScale.key} ${selectedScale.mode}` : 'No scale selected'}
        </div>
      </div>

      {/* Position Selection */}
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: theme.textSecondary }}
        >
          Scale Positions
        </label>
        <div className="flex flex-wrap gap-3">
          {SCALE_POSITIONS.map((position, index) => (
            <div key={position} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`position-${position}`}
                checked={selectedPositions.includes(position)}
                onChange={() => onTogglePosition(position)}
                className="w-4 h-4 cursor-pointer rounded"
                style={{ accentColor: theme.accentPrimary }}
              />
              <label
                htmlFor={`position-${position}`}
                className="text-sm font-medium cursor-pointer"
                style={{ color: theme.textPrimary }}
              >
                Position {index + 1} (Fret {position})
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Overlap Type */}
      <OverlapTypeSelector
        theme={theme}
        overlapType={overlapType}
        onSetOverlapType={onSetOverlapType}
      />
    </div>
  );
}

