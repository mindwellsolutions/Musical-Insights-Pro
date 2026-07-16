'use client';

/**
 * Chord Diagram Sidebar
 * Displays chord diagrams for selected nearby diatonic chords
 */

import { useMemo } from 'react';
import { NearbyChord, AnchorVoicing } from '@/lib/music-theory/neighborhood';
import { ThemeConfig } from '@/lib/themes';
import ChordDiagram from '@/components/ChordDiagram';
import { calculateChordVoicings, ChordVoicing, FingerPosition } from '@/lib/chord-voicings';
import { getChordSymbol } from '@/lib/music-theory/neighborhood/diatonic';
import { X, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Convert AnchorVoicing to ChordVoicing format for ChordDiagram component
 */
function convertAnchorToChordVoicing(anchor: AnchorVoicing, tuning: string[]): ChordVoicing {
  // Convert frets and notes to FingerPosition format
  const positions: FingerPosition[] = anchor.frets.map((fret, index) => {
    const stringIndex = tuning.length - 1 - (anchor.stringSet[index] - 1); // Convert to 0-based from bottom
    const note = anchor.notes[index];
    const isRoot = note === anchor.rootNote;

    return {
      stringIndex,
      fret,
      note,
      finger: fret > 0 ? undefined : 0, // 0 for open strings
      isRoot,
    };
  });

  // Calculate start and end frets
  const playedFrets = anchor.frets.filter(f => f > 0);
  const startFret = playedFrets.length > 0 ? Math.min(...playedFrets) : 0;
  const endFret = playedFrets.length > 0 ? Math.max(...playedFrets) : 0;

  // Determine common name based on inversion and position
  let commonName = '';
  if (startFret === 0) {
    commonName = 'Open Position';
  } else if (anchor.inversion === 'root') {
    commonName = `Root Position (Fret ${startFret})`;
  } else if (anchor.inversion === 'first') {
    commonName = `1st Inversion (Fret ${startFret})`;
  } else if (anchor.inversion === 'second') {
    commonName = `2nd Inversion (Fret ${startFret})`;
  }

  return {
    name: `${anchor.rootNote} ${anchor.quality}`,
    positions,
    startFret,
    endFret,
    difficulty: startFret === 0 ? 1 : Math.min(5, Math.floor(startFret / 3) + 2),
    commonName,
  };
}

interface ChordDiagramSidebarProps {
  theme: ThemeConfig;
  chords: NearbyChord[];
  isVisible?: boolean;
  onClose?: () => void;
  tuning?: string[];
  stringCount?: number;
  inline?: boolean; // If true, renders without fixed positioning (for use inside UnifiedRightSidebar)
}

export default function ChordDiagramSidebar({
  theme,
  chords,
  isVisible = true,
  onClose,
  tuning = ['E', 'A', 'D', 'G', 'B', 'E'],
  stringCount = 6,
  inline = false,
}: ChordDiagramSidebarProps) {
  // Calculate voicings for each chord
  const chordVoicings = useMemo(() => {
    return chords.map((chord, index) => {
      const chordSymbol = chord.chordSymbol || getChordSymbol(chord.rootNote, chord.quality);

      // Priority 1: If user has selected a specific voicing, use that
      if (chord.selectedVoicing) {
        return {
          chord,
          chordSymbol,
          voicing: chord.selectedVoicing,
        };
      }

      // Priority 2: Use the nearestVoicing (the actual voicing displayed on the fretboard)
      // Convert AnchorVoicing to ChordVoicing format
      if (chord.nearestVoicing) {
        const convertedVoicing = convertAnchorToChordVoicing(chord.nearestVoicing, tuning);
        return {
          chord,
          chordSymbol,
          voicing: convertedVoicing,
        };
      }

      // Priority 3: Fallback - calculate voicings and use the first one
      const notes = chord.chordNotes || [];
      const voicings = chord.chordVoicings || calculateChordVoicings(notes, chord.rootNote, tuning, 15);
      const selectedVoicing = voicings[0];

      return {
        chord,
        chordSymbol,
        voicing: selectedVoicing,
      };
    });
  }, [chords, tuning]);

  if (!isVisible) return null;

  const containerClasses = inline
    ? "flex flex-col h-full"
    : "fixed right-0 top-0 h-full shadow-2xl z-40 flex flex-col";

  const containerWidth = inline ? undefined : '420px';

  const containerStyles = inline
    ? {}
    : {
        width: containerWidth,
        background: 'linear-gradient(to bottom, #1a1a1a, #0f0f0f)',
        borderLeft: `1px solid ${theme.border}`,
      };

  return (
    <div className={containerClasses} style={containerStyles}>
      {/* Header - Only show if not inline */}
      {!inline && (
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: theme.border }}
        >
          <div>
            <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
              Chord Diagrams
            </h3>
            <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>
              {chords.length} chord{chords.length !== 1 ? 's' : ''} selected
            </p>
          </div>
          {onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              style={{ color: theme.textSecondary }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Chord Diagrams - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        {chordVoicings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Music className="w-12 h-12 mb-3" style={{ color: theme.textSecondary }} />
            <p className="text-sm text-center" style={{ color: theme.textSecondary }}>
              No chords selected
            </p>
            <p className="text-xs text-center mt-2" style={{ color: theme.textSecondary }}>
              Toggle chords in the progression to see their diagrams
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {chordVoicings.map(({ chord, chordSymbol, voicing }, index) => {
              // Get color from chord colors array (cycling through colors)
              const chordColor = index < 7 ?
                ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6'][index] :
                '#6b7280';

              return (
                <div
                  key={`${chord.rootNote}-${chord.quality}-${index}`}
                  className="rounded-lg p-4 flex flex-col items-center gap-2 overflow-hidden"
                  style={{
                    background: theme.bgTertiary,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  {/* Chord Symbol - Rounded Rectangle UI like colorful buttons */}
                  <div
                    className="w-full rounded-lg px-3 py-2 flex items-center justify-center gap-2"
                    style={{
                      background: chordColor,
                      boxShadow: `0 0 8px ${chordColor}66`,
                    }}
                  >
                    <span className="text-sm font-bold text-white">
                      {chord.degree}
                    </span>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                      style={{
                        background: 'rgba(255, 255, 255, 0.25)',
                      }}
                    >
                      {chordSymbol}
                    </span>
                  </div>

                  {/* Chord Diagram */}
                  {voicing ? (
                    <ChordDiagram
                      voicing={voicing}
                      theme={theme}
                      stringCount={stringCount}
                      compact={true}
                    />
                  ) : (
                    <div className="text-xs text-center py-4" style={{ color: theme.textSecondary }}>
                      No voicing available
                    </div>
                  )}

                  {/* Position Info - Rounded Rectangle UI */}
                  {voicing && (
                    <div
                      className="w-full rounded-lg px-2 py-1 text-center"
                      style={{
                        background: theme.bgSecondary,
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      <p className="text-xs font-medium" style={{ color: theme.textPrimary }}>
                        {voicing.commonName || `Position ${index + 1}`}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="p-3 border-t text-center"
        style={{ borderColor: theme.border }}
      >
        <p className="text-xs" style={{ color: theme.textSecondary }}>
          Click the down arrow on chord buttons to change voicings
        </p>
      </div>
    </div>
  );
}

