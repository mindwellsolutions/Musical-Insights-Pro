/**
 * Overlap Type Selector Component
 * Radio buttons to select overlap type (Complete vs Partial)
 */

'use client';

import { ThemeConfig } from '@/lib/themes';
import { OverlapType } from '@/lib/music-theory/overlapping-chords/types';

interface OverlapTypeSelectorProps {
  theme: ThemeConfig;
  overlapType: OverlapType;
  onSetOverlapType: (type: OverlapType) => void;
}

export default function OverlapTypeSelector({
  theme,
  overlapType,
  onSetOverlapType,
}: OverlapTypeSelectorProps) {
  return (
    <div>
      <label
        className="block text-sm font-medium mb-2"
        style={{ color: theme.textSecondary }}
      >
        Overlap Type
      </label>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="complete"
            name="overlapType"
            value="complete"
            checked={overlapType === 'complete'}
            onChange={() => onSetOverlapType('complete')}
            className="w-4 h-4 cursor-pointer"
            style={{ accentColor: theme.accentPrimary }}
          />
          <label
            htmlFor="complete"
            className="text-sm cursor-pointer"
            style={{ color: theme.textPrimary }}
          >
            Complete Overlap (all notes match)
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id="partial"
            name="overlapType"
            value="partial"
            checked={overlapType === 'partial'}
            onChange={() => onSetOverlapType('partial')}
            className="w-4 h-4 cursor-pointer"
            style={{ accentColor: theme.accentPrimary }}
          />
          <label
            htmlFor="partial"
            className="text-sm cursor-pointer"
            style={{ color: theme.textPrimary }}
          >
            Partial Overlap (2+ notes match)
          </label>
        </div>
      </div>
    </div>
  );
}

