'use client';

import React from 'react';
import { ThemeConfig } from '@/lib/themes';
import { TriadType, TRIAD_DISPLAY_NAMES, getAllTriadTypes } from '@/lib/triad-theory';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface TriadSelectorProps {
  theme: ThemeConfig;
  selectedRoot: string;
  selectedType: TriadType;
  onTypeChange: (type: TriadType) => void;
  onClose?: () => void;
}

export default function TriadSelector({
  theme,
  selectedRoot,
  selectedType,
  onTypeChange,
  onClose,
}: TriadSelectorProps) {
  const triadTypes = getAllTriadTypes();

  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: theme.bgTertiary,
        border: `1px solid ${theme.border}`,
      }}
    >
      {/* Header with Title and Close Button */}
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-sm font-semibold"
          style={{ color: theme.textPrimary }}
        >
          Triad Settings
        </h3>

        <div className="flex items-center gap-2">
          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded transition-all hover:opacity-80"
              style={{
                background: 'transparent',
                color: theme.textSecondary,
                border: `1px solid ${theme.border}`,
              }}
              title="Close Triad Mode"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Triad Type Selector - Single Row */}
      <div>
        <label
          className="text-xs font-medium mb-2 block"
          style={{ color: theme.textSecondary }}
        >
          Triad Type
        </label>
        <div className="flex gap-2">
          {triadTypes.map((type) => (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className="px-3 py-1.5 rounded text-xs font-semibold transition-all hover:opacity-80 whitespace-nowrap"
              style={{
                background: selectedType === type ? theme.buttonPrimary : theme.bgSecondary,
                color: selectedType === type ? '#ffffff' : theme.textPrimary,
                border: `1px solid ${selectedType === type ? theme.buttonPrimary : theme.border}`,
              }}
            >
              {TRIAD_DISPLAY_NAMES[type]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

