/**
 * Chord Display Section Component
 * Main section for displaying and filtering available chords
 */

'use client';

import { useState } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { OverlappingChord, ChordQuality } from '@/lib/music-theory/overlapping-chords/types';
import ChordList from './ChordList';

interface ChordDisplaySectionProps {
  theme: ThemeConfig;
  availableChords: OverlappingChord[];
  selectedChords: OverlappingChord[];
  onToggleChord: (chord: OverlappingChord) => void;
  onClearAll: () => void;
}

type FilterCategory = ChordQuality | 'all';

const FILTER_CATEGORIES: { value: FilterCategory; label: string }[] = [
  { value: 'all', label: 'All Chords' },
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' },
  { value: 'diminished', label: 'Diminished' },
  { value: 'augmented', label: 'Augmented' },
  { value: 'dominant7', label: '7th Chords' },
];

export default function ChordDisplaySection({
  theme,
  availableChords,
  selectedChords,
  onToggleChord,
  onClearAll,
}: ChordDisplaySectionProps) {
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');

  if (availableChords.length === 0) {
    return (
      <div 
        className="mt-4 p-4 rounded-lg text-center"
        style={{
          background: theme.bgTertiary,
          border: `1px solid ${theme.border}`,
          color: theme.textSecondary,
        }}
      >
        <p className="text-sm">
          Select CAGED shapes or scale positions to find overlapping chords
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Header with count and clear button */}
      <div className="flex items-center justify-between mb-3">
        <h4 
          className="text-sm font-semibold"
          style={{ color: theme.textPrimary }}
        >
          {availableChords.length} Chords Found
        </h4>
        {selectedChords.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs px-3 py-1 rounded transition-colors"
            style={{
              background: theme.bgTertiary,
              color: theme.textSecondary,
              border: `1px solid ${theme.border}`,
            }}
          >
            Clear All ({selectedChords.length})
          </button>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
        {FILTER_CATEGORIES.map((category) => (
          <button
            key={category.value}
            onClick={() => setFilterCategory(category.value)}
            className="px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors"
            style={{
              background: filterCategory === category.value ? theme.accentPrimary : theme.bgTertiary,
              color: filterCategory === category.value ? '#ffffff' : theme.textPrimary,
              border: `1px solid ${filterCategory === category.value ? theme.accentPrimary : theme.border}`,
            }}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Chord List */}
      <ChordList
        theme={theme}
        chords={availableChords}
        selectedChords={selectedChords}
        onToggleChord={onToggleChord}
        filterCategory={filterCategory}
      />
    </div>
  );
}

