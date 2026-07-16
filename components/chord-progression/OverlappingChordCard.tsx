'use client';

/**
 * Overlapping Chord Card Component
 * Displays an overlapping chord with expandable chord diagram
 */

import { useState } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { OverlappingChord } from '@/lib/music-theory/overlapping-chords/types';
import { ChevronDown, ChevronRight } from 'lucide-react';
import ChordDiagram from '@/components/ChordDiagram';
import { ChordVoicing, FingerPosition } from '@/lib/chord-voicings';
import { NOTE_COLORS } from '@/lib/musicTheory';

interface OverlappingChordCardProps {
  theme: ThemeConfig;
  chord: OverlappingChord;
  tuning: string[];
  stringCount: number;
}

// Map quality to display name
const QUALITY_DISPLAY_NAMES: Record<string, string> = {
  major: 'Major',
  minor: 'Minor',
  diminished: 'Diminished',
  augmented: 'Augmented',
  dominant7: 'Dominant 7th',
  major7: 'Major 7th',
  minor7: 'Minor 7th',
};

/**
 * Convert OverlappingChord to ChordVoicing format for ChordDiagram component
 */
function convertToChordVoicing(chord: OverlappingChord, tuning: string[]): ChordVoicing {
  // Create a full array of positions for all strings
  // Initialize all strings as muted (-1)
  const positions: FingerPosition[] = tuning.map((_, stringIndex) => ({
    stringIndex,
    fret: -1,
    note: '',
    finger: undefined,
    isRoot: false,
  }));

  // Fill in the actual chord positions
  chord.notes.forEach((note) => {
    const isRoot = note.note === chord.rootNote;
    positions[note.string] = {
      stringIndex: note.string,
      fret: note.fret,
      note: note.note,
      finger: note.fret > 0 ? undefined : 0,
      isRoot,
    };
  });

  const playedFrets = chord.notes.map(n => n.fret).filter(f => f > 0);
  const startFret = playedFrets.length > 0 ? Math.min(...playedFrets) : 0;
  const endFret = playedFrets.length > 0 ? Math.max(...playedFrets) : 0;

  let commonName = '';
  if (startFret === 0) {
    commonName = 'Open Position';
  } else {
    commonName = `Position (Fret ${startFret})`;
  }

  return {
    name: chord.chordSymbol,
    positions,
    startFret,
    endFret,
    difficulty: startFret === 0 ? 1 : Math.min(5, Math.floor(startFret / 3) + 2),
    commonName,
  };
}

export default function OverlappingChordCard({
  theme,
  chord,
  tuning,
  stringCount,
}: OverlappingChordCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const chordColor = NOTE_COLORS[chord.rootNote] || '#3b82f6';
  const voicing = convertToChordVoicing(chord, tuning);

  return (
    <div
      className="rounded-lg overflow-hidden transition-all duration-200"
      style={{
        background: theme.bgTertiary,
        border: `1px solid ${theme.border}`,
      }}
    >
      {/* Header - Clickable to expand/collapse */}
      <div
        className="p-3 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          {/* Chord Symbol */}
          <div className="flex items-center gap-2 flex-1">
            <div
              className="rounded-lg px-3 py-1.5 flex items-center justify-center"
              style={{
                background: chordColor,
                boxShadow: `0 0 8px ${chordColor}66`,
              }}
            >
              <span className="text-sm font-bold text-white">
                {chord.chordSymbol}
              </span>
            </div>
            
            {/* Quality */}
            <span className="text-xs font-medium" style={{ color: theme.textSecondary }}>
              {QUALITY_DISPLAY_NAMES[chord.quality] || chord.quality}
            </span>
          </div>

          {/* Expand/Collapse Icon */}
          <div style={{ color: theme.textSecondary }}>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
        </div>

        {/* Info Row */}
        <div
          className="text-xs mt-2 flex items-center gap-2"
          style={{ color: theme.textSecondary }}
        >
          <span>{chord.notes.length} notes</span>
          <span>•</span>
          <span>Frets {chord.fretRange[0]}-{chord.fretRange[1]}</span>
          <span>•</span>
          <span>
            {chord.overlapPercentage === 100 ? (
              '100% overlap'
            ) : (
              `${chord.overlapCount}/${chord.notes.length} overlap`
            )}
          </span>
        </div>
      </div>

      {/* Expandable Chord Diagram */}
      {isExpanded && (
        <div
          className="px-3 pb-3 pt-2"
          style={{
            borderTop: `1px solid ${theme.border}`,
            background: theme.bgSecondary,
          }}
        >
          <ChordDiagram
            voicing={voicing}
            theme={theme}
            stringCount={stringCount}
            compact={true}
          />
        </div>
      )}
    </div>
  );
}

