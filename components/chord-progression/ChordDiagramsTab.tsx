'use client';

/**
 * Chord Diagrams Tab - Displays all voicings for the selected or currently playing chord
 */

import { useMemo } from 'react';
import { ChordInstance } from '@/lib/chord-progression/types';
import { calculateChordVoicings } from '@/lib/chord-voicings';
import ChordDiagram from '@/components/ChordDiagram';
import { Music } from 'lucide-react';

interface ChordDiagramsTabProps {
  selectedChord: ChordInstance | null;
  tuning: string[];
  stringCount: number;
}

export default function ChordDiagramsTab({
  selectedChord,
  tuning,
  stringCount,
}: ChordDiagramsTabProps) {
  // Calculate all voicings for the selected chord
  const voicings = useMemo(() => {
    if (!selectedChord || !selectedChord.notes || selectedChord.notes.length === 0) {
      return [];
    }

    // Use the same parameter order as ChordRecommendations: (notes, rootNote, tuning, maxFret)
    return calculateChordVoicings(
      selectedChord.notes,
      selectedChord.rootNote,
      tuning,
      15 // maxFret - same as ChordRecommendations
    );
  }, [selectedChord, tuning, stringCount]);

  // Theme configuration (matching the dark theme of the builder)
  const theme = {
    name: 'Dark',
    bgPrimary: '#0a0a0a',
    bgSecondary: '#141414',
    bgTertiary: '#1a1a1a',
    textPrimary: '#ffffff',
    textSecondary: '#a0a0a0',
    border: '#333333',
    fretboardBg: '#1e1e1e',
    fretboardFret: '#444444',
    fretboardString: '#666666',
    fretMarker: '#888888',
    sidebarBg: '#141414',
    buttonPrimary: '#2563eb',
    buttonSecondary: '#374151',
    buttonHover: '#3b82f6',
    accentPrimary: '#3b82f6',
    accentSecondary: '#60a5fa',
  };

  if (!selectedChord) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <Music className="w-16 h-16 mx-auto mb-4" style={{ color: theme.textSecondary }} />
          <p className="text-lg font-semibold mb-2" style={{ color: theme.textPrimary }}>
            No Chord Selected
          </p>
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            Click on a chord block in the timeline or press play to see chord diagrams
          </p>
        </div>
      </div>
    );
  }

  if (voicings.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <Music className="w-16 h-16 mx-auto mb-4" style={{ color: theme.textSecondary }} />
          <p className="text-lg font-semibold mb-2" style={{ color: theme.textPrimary }}>
            No Voicings Available
          </p>
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            Unable to generate chord diagrams for {selectedChord.chordSymbol}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#1a1a1a] to-[#141414]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#333333]">
        <h3 className="text-xl font-bold" style={{ color: theme.textPrimary }}>
          {selectedChord.chordSymbol}
        </h3>
        <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>
          {voicings.length} voicing{voicings.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Chord Diagrams - Horizontal Scroll */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex gap-6 h-full items-start">
          {voicings.map((voicing, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 rounded-lg p-4"
              style={{
                background: theme.bgTertiary,
                border: `1px solid ${theme.border}`,
              }}
            >
              {/* Position Label */}
              <div className="text-center mb-3">
                <p className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                  {voicing.commonName || `Position ${idx + 1}`}
                </p>
                <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>
                  {voicing.startFret === 0 ? 'Open' : `Fret ${voicing.startFret}`}
                </p>
              </div>

              {/* Chord Diagram */}
              <ChordDiagram
                voicing={voicing}
                theme={theme}
                stringCount={stringCount}
                compact={false}
              />

              {/* Difficulty Indicator */}
              <div className="text-center mt-3">
                <div className="flex justify-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: i < voicing.difficulty ? theme.accentPrimary : theme.border,
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>
                  Difficulty
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

