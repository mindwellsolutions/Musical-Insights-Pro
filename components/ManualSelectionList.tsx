'use client';

/**
 * Manual Selection List Component
 * Manages a list of manual key/scale selections for song progressions
 * Allows adding, removing, reordering, and navigating through selections
 */

import React from 'react';
import { ThemeConfig } from '@/lib/themes';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';

export interface ManualSelection {
  id: string;
  key: string;
  scaleName: string;
  // Optional chord data for chord-based selections
  chord?: {
    symbol: string; // e.g., "Cmaj7", "Dm7"
    notes: string[];
    guideTones?: string[];
  };
  // Type of selection: 'scale' or 'chord'
  type?: 'scale' | 'chord';
}

interface ManualSelectionListProps {
  selections: ManualSelection[];
  currentIndex: number;
  theme: ThemeConfig;
  onSelectionClick: (index: number) => void;
  onRemoveSelection: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  onClearAll?: () => void;
}

export default function ManualSelectionList({
  selections,
  currentIndex,
  theme,
  onSelectionClick,
  onRemoveSelection,
  onMoveUp,
  onMoveDown,
  onNavigatePrevious,
  onNavigateNext,
  onClearAll,
}: ManualSelectionListProps) {
  const { getNoteDisplayName } = useNoteDisplay();

  if (selections.length === 0) {
    return (
      <div
        className="text-xs text-center py-4"
        style={{ color: theme.textSecondary }}
      >
        No keys have been added to song
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Navigation Controls */}
      <div className="flex items-center justify-between mb-1">
        <button
          onClick={onNavigatePrevious}
          disabled={selections.length === 0}
          className="px-2 py-1 rounded text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: theme.bgSecondary,
            color: theme.textPrimary,
            border: `1px solid ${theme.border}`,
          }}
          title="Previous (Up Arrow)"
        >
          Prev
        </button>

        <div className="text-xs font-medium" style={{ color: theme.textSecondary }}>
          {selections.length > 0 ? `${currentIndex + 1} / ${selections.length}` : '0 / 0'}
        </div>

        <button
          onClick={onNavigateNext}
          disabled={selections.length === 0}
          className="px-2 py-1 rounded text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: theme.bgSecondary,
            color: theme.textPrimary,
            border: `1px solid ${theme.border}`,
          }}
          title="Next (Down Arrow)"
        >
          Next
        </button>

        {onClearAll && selections.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Clear all selections?')) {
                onClearAll();
              }
            }}
            className="px-2 py-1 rounded text-xs font-medium transition-all hover:opacity-70"
            style={{
              background: theme.bgTertiary,
              color: theme.textSecondary,
              border: `1px solid ${theme.border}`,
            }}
            title="Clear all selections"
          >
            Clear
          </button>
        )}
      </div>

      {/* Selection List */}
      <div
        className="flex flex-col gap-1 overflow-y-auto"
        style={{
          maxHeight: '200px',
          border: `1px solid ${theme.border}`,
          borderRadius: '6px',
          padding: '4px',
          background: theme.bgSecondary,
        }}
      >
        {selections.map((selection, index) => {
          const isActive = index === currentIndex;
          
          return (
            <div
              key={selection.id}
              className="flex items-center gap-2 p-2 rounded transition-all cursor-pointer group"
              style={{
                background: isActive ? theme.bgTertiary : 'transparent',
                border: `1px solid ${isActive ? theme.border : 'transparent'}`,
              }}
              onClick={() => onSelectionClick(index)}
            >
              {/* Selection Display */}
              <div
                className="flex-1 text-xs font-medium truncate"
                style={{
                  color: isActive ? theme.textPrimary : theme.textSecondary,
                }}
              >
                {getNoteDisplayName(selection.key)} {selection.scaleName}
              </div>

              {/* Control Buttons */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Move Up */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveUp(index);
                  }}
                  disabled={index === 0}
                  className="px-1 py-0.5 rounded text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-opacity-80"
                  style={{
                    background: theme.bgPrimary,
                    color: theme.textPrimary,
                    border: `1px solid ${theme.border}`,
                  }}
                  title="Move Up"
                >
                  ▲
                </button>

                {/* Move Down */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveDown(index);
                  }}
                  disabled={index === selections.length - 1}
                  className="px-1 py-0.5 rounded text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-opacity-80"
                  style={{
                    background: theme.bgPrimary,
                    color: theme.textPrimary,
                    border: `1px solid ${theme.border}`,
                  }}
                  title="Move Down"
                >
                  ▼
                </button>

                {/* Remove */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSelection(index);
                  }}
                  className="px-1 py-0.5 rounded text-xs transition-all hover:bg-red-600 hover:border-red-700"
                  style={{
                    background: '#dc2626',
                    color: '#ffffff',
                    border: '1px solid #b91c1c',
                  }}
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

