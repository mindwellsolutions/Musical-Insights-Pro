'use client';

import { useState, useMemo } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { OverlappingChord, ChordQuality } from '@/lib/music-theory/overlapping-chords/types';
import ChordCard from './ChordCard';

interface ChordBrowserSidebarProps {
  theme: ThemeConfig;
  availableChords: OverlappingChord[];
  selectedChords: OverlappingChord[];
  hoveredChord: OverlappingChord | null;
  onChordHover: (chord: OverlappingChord | null) => void;
  onChordClick: (chord: OverlappingChord) => void;
  onClearAll: () => void;
}

type FilterOption = 'all' | 'major' | 'minor' | 'diminished' | 'augmented' | '7th' | '9th' | 'extended';

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'All Chords' },
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' },
  { value: 'diminished', label: 'Diminished' },
  { value: 'augmented', label: 'Augmented' },
  { value: '7th', label: '7th Chords' },
  { value: '9th', label: '9th Chords' },
  { value: 'extended', label: 'Extended' },
];

export default function ChordBrowserSidebar({
  theme,
  availableChords,
  selectedChords,
  hoveredChord,
  onChordHover,
  onChordClick,
  onClearAll,
}: ChordBrowserSidebarProps) {
  const [currentFilter, setCurrentFilter] = useState<FilterOption>('all');

  // Filter chords based on selected filter
  const filteredChords = useMemo(() => {
    if (currentFilter === 'all') return availableChords;

    return availableChords.filter(chord => {
      switch (currentFilter) {
        case 'major':
          return chord.quality === 'major' || chord.quality === 'major7';
        case 'minor':
          return chord.quality === 'minor' || chord.quality === 'minor7';
        case 'diminished':
          return chord.quality === 'diminished';
        case 'augmented':
          return chord.quality === 'augmented';
        case '7th':
          return chord.quality === 'dominant7' || chord.quality === 'major7' || chord.quality === 'minor7';
        case '9th':
          // For now, no 9th chords in the system
          return false;
        case 'extended':
          // For now, no extended chords beyond 7th
          return false;
        default:
          return true;
      }
    });
  }, [availableChords, currentFilter]);

  // Check if a chord is selected
  const isChordSelected = (chord: OverlappingChord) => {
    return selectedChords.some(
      c => c.rootNote === chord.rootNote && c.quality === chord.quality
    );
  };

  return (
    <div
      className="fixed right-0 top-0 h-screen flex flex-col"
      style={{
        width: '320px',
        background: theme.bgSecondary,
        borderLeft: `1px solid ${theme.border}`,
        zIndex: 40,
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-4 border-b"
        style={{
          borderColor: theme.border,
          background: theme.bgPrimary,
        }}
      >
        <h3 className="text-lg font-bold mb-1" style={{ color: theme.textPrimary }}>
          Overlapping Chords
        </h3>
        <span className="text-sm" style={{ color: theme.textSecondary }}>
          {filteredChords.length} chord{filteredChords.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Filter Dropdown */}
      <div className="px-4 py-3 border-b" style={{ borderColor: theme.border }}>
        <select
          value={currentFilter}
          onChange={(e) => setCurrentFilter(e.target.value as FilterOption)}
          className="w-full px-3 py-2 rounded text-sm font-medium transition-colors"
          style={{
            background: theme.bgTertiary,
            color: theme.textPrimary,
            border: `1px solid ${theme.border}`,
          }}
        >
          {FILTER_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Chord List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {filteredChords.length === 0 ? (
          <div
            className="text-center py-8 text-sm"
            style={{ color: theme.textSecondary }}
          >
            No chords found matching the current criteria
          </div>
        ) : (
          filteredChords.map((chord, index) => (
            <ChordCard
              key={`${chord.rootNote}-${chord.quality}-${index}`}
              theme={theme}
              chord={chord}
              isSelected={isChordSelected(chord)}
              isHovered={hoveredChord?.rootNote === chord.rootNote && hoveredChord?.quality === chord.quality}
              onHover={() => onChordHover(chord)}
              onHoverEnd={() => onChordHover(null)}
              onClick={() => onChordClick(chord)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {selectedChords.length > 0 && (
        <div
          className="px-4 py-3 border-t"
          style={{
            borderColor: theme.border,
            background: theme.bgPrimary,
          }}
        >
          <button
            onClick={onClearAll}
            className="w-full px-4 py-2 rounded font-medium text-sm transition-all"
            style={{
              background: theme.accentPrimary,
              color: '#ffffff',
            }}
          >
            Clear All ({selectedChords.length} selected)
          </button>
        </div>
      )}
    </div>
  );
}

