/**
 * Chord List Component
 * Scrollable list of chord cards
 */

'use client';

import { ThemeConfig } from '@/lib/themes';
import { OverlappingChord, ChordQuality } from '@/lib/music-theory/overlapping-chords/types';
import ChordCard from './ChordCard';

interface ChordListProps {
  theme: ThemeConfig;
  chords: OverlappingChord[];
  selectedChords: OverlappingChord[];
  onToggleChord: (chord: OverlappingChord) => void;
  filterCategory: ChordQuality | 'all';
}

export default function ChordList({
  theme,
  chords,
  selectedChords,
  onToggleChord,
  filterCategory,
}: ChordListProps) {
  // Filter chords by category
  const filteredChords = filterCategory === 'all' 
    ? chords 
    : chords.filter(chord => chord.quality === filterCategory);

  // Check if a chord is selected
  const isChordSelected = (chord: OverlappingChord) => {
    return selectedChords.some(
      c => c.rootNote === chord.rootNote && c.quality === chord.quality
    );
  };

  if (filteredChords.length === 0) {
    return (
      <div 
        className="text-center py-8 text-sm"
        style={{ color: theme.textSecondary }}
      >
        No chords found matching criteria
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
      {filteredChords.map((chord, index) => (
        <ChordCard
          key={`${chord.rootNote}-${chord.quality}-${index}`}
          theme={theme}
          chord={chord}
          isSelected={isChordSelected(chord)}
          isHovered={false}
          onHover={() => {}}
          onHoverEnd={() => {}}
          onClick={() => onToggleChord(chord)}
        />
      ))}
    </div>
  );
}

