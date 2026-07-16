'use client';

/**
 * Song Progression Display Component
 * Displays chord progression from timeline as interactive buttons with voicing selection
 */

import { useMemo, useState } from 'react';
import { ChordInstance } from '@/lib/chord-progression/types';
import { ChordVoicing } from '@/lib/chord-voicings';
import { ThemeConfig } from '@/lib/themes';
import { NOTE_COLORS } from '@/lib/musicTheory';
import { ChevronDown } from 'lucide-react';
import ChordVoicingSelector from '@/components/chord-neighborhood/ChordVoicingSelector';

interface SongProgressionDisplayProps {
  chords: ChordInstance[];
  selectedChordIndex: number;
  onChordSelect: (index: number) => void;
  onVoicingChange: (chordIndex: number, voicing: ChordVoicing) => void;
  customVoicings: Map<string, ChordVoicing>;
  theme: ThemeConfig;
  tuning: string[];
  stringCount: 6 | 7;
  currentTime?: number;
  isPlaying?: boolean;
}

export default function SongProgressionDisplay({
  chords,
  selectedChordIndex,
  onChordSelect,
  onVoicingChange,
  customVoicings,
  theme,
  tuning,
  stringCount,
  currentTime = 0,
  isPlaying = false,
}: SongProgressionDisplayProps) {
  const [voicingSelectorOpen, setVoicingSelectorOpen] = useState(false);
  const [selectedChordForVoicing, setSelectedChordForVoicing] = useState<{
    chord: ChordInstance;
    index: number;
  } | null>(null);

  // Determine currently playing chord index
  const playingChordIndex = useMemo(() => {
    if (!isPlaying) return -1;
    return chords.findIndex(chord =>
      currentTime >= chord.startTime &&
      currentTime < chord.startTime + chord.duration
    );
  }, [chords, currentTime, isPlaying]);

  const handleChordClick = (index: number) => {
    onChordSelect(index);
  };

  const handleDropdownClick = (e: React.MouseEvent, chord: ChordInstance, index: number) => {
    e.stopPropagation();
    setSelectedChordForVoicing({ chord, index });
    setVoicingSelectorOpen(true);
  };

  const handleVoicingSelect = (voicingIndex: number, voicing: ChordVoicing) => {
    if (selectedChordForVoicing) {
      onVoicingChange(selectedChordForVoicing.index, voicing);
    }
    setVoicingSelectorOpen(false);
    setSelectedChordForVoicing(null);
  };

  const getChordColor = (rootNote: string): string => {
    return NOTE_COLORS[rootNote] || '#3b82f6';
  };

  return (
    <div className="w-full">
      {/* Song Chord Progression Header */}
      <div className="mb-3">
        <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
          Song Chord Progression
        </h3>
      </div>

      {/* Chord Buttons */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {chords.map((chord, index) => {
          const isSelected = index === selectedChordIndex;
          const isPlaying = index === playingChordIndex;
          const color = getChordColor(chord.rootNote);

          return (
            <div key={chord.id} className="flex flex-col items-center">
              {/* Chord Button */}
              <button
                onClick={() => handleChordClick(index)}
                className="relative group transition-all duration-200"
                title={`${chord.chordSymbol} - ${chord.chordQuality}\nNotes: ${chord.notes.join(', ')}\nDuration: ${chord.duration} beats\nClick to select, dropdown for voicing`}
                aria-label={`Chord ${index + 1}: ${chord.chordSymbol}, ${isSelected ? 'selected' : 'not selected'}, ${isPlaying ? 'currently playing' : ''}`}
                aria-pressed={isSelected}
                role="button"
                tabIndex={0}
                style={{
                  width: '80px',
                  height: '60px',
                  background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                  border: isSelected ? `3px solid ${color}` : '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  boxShadow: isSelected
                    ? `0 0 20px ${color}80, 0 4px 6px rgba(0,0,0,0.3)`
                    : `0 0 10px ${color}40, 0 2px 4px rgba(0,0,0,0.2)`,
                  transform: isSelected ? 'scale(1.1)' : isPlaying ? 'scale(1.05)' : 'scale(1)',
                  animation: isPlaying ? 'pulse 1s ease-in-out infinite' : 'none',
                }}
              >
                {/* Chord Symbol */}
                <div className="text-white font-bold text-lg">
                  {chord.chordSymbol}
                </div>

                {/* Dropdown Arrow */}
                <button
                  onClick={(e) => handleDropdownClick(e, chord, index)}
                  className="absolute bottom-1 right-1 p-1 rounded-full transition-all hover:scale-110"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(4px)',
                  }}
                  title="Select voicing"
                  aria-label={`Select voicing for ${chord.chordSymbol}`}
                  tabIndex={0}
                >
                  <ChevronDown className="w-3 h-3 text-white" />
                </button>
              </button>

              {/* Duration Display */}
              <div className="text-xs mt-1" style={{ color: '#888' }}>
                {chord.duration} {chord.duration === 1 ? 'beat' : 'beats'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Voicing Selector Modal */}
      {selectedChordForVoicing && (
        <ChordVoicingSelector
          open={voicingSelectorOpen}
          onOpenChange={setVoicingSelectorOpen}
          chordSymbol={selectedChordForVoicing.chord.chordSymbol}
          rootNote={selectedChordForVoicing.chord.rootNote}
          chordNotes={selectedChordForVoicing.chord.notes}
          currentVoicingIndex={0}
          currentFretPosition={0}
          onVoicingSelect={handleVoicingSelect}
          tuning={tuning}
          stringCount={stringCount}
          theme={theme}
        />
      )}
    </div>
  );
}

