'use client';

/**
 * Song Chord Diagram Sidebar
 * Displays chord diagrams for chords in the song progression
 * Similar to the Triads & CAGED mode's chord diagram sidebar
 */

import { useMemo, useState, useRef, useEffect } from 'react';
import { ChordInstance } from '@/lib/chord-progression/types';
import { ThemeConfig } from '@/lib/themes';
import { TriadPosition } from '@/lib/triad-positions';
import ChordDiagram from '@/components/ChordDiagram';
import { ChordVoicing, FingerPosition, calculateChordVoicings } from '@/lib/chord-voicings';
import { X, Music, ChevronRight } from 'lucide-react';
import { NOTE_COLORS } from '@/lib/musicTheory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverlappingChord } from '@/lib/music-theory/overlapping-chords/types';
import { findOverlappingChordsFromVisibleNotes } from '@/lib/music-theory/overlapping-chords/song-builder-finder';
import OverlappingChordCard from './OverlappingChordCard';

interface ChordInZone {
  chord: ChordInstance;
  isPlayableInZone: boolean;
  positionsInZone: TriadPosition[];
  allPositions: TriadPosition[];
}

/**
 * Convert TriadPosition to ChordVoicing format for ChordDiagram component
 */
function convertTriadPositionToChordVoicing(triadPos: TriadPosition, tuning: string[]): ChordVoicing {
  // Create a full array of positions for all strings (6 strings)
  // Initialize all strings as muted (-1)
  const positions: FingerPosition[] = tuning.map((_, stringIndex) => ({
    stringIndex,
    fret: -1,
    note: '',
    finger: undefined,
    isRoot: false,
  }));

  // Fill in the actual triad positions
  triadPos.stringPositions.forEach((sp) => {
    const isRoot = sp.note === triadPos.rootNote;
    positions[sp.stringIndex] = {
      stringIndex: sp.stringIndex,
      fret: sp.fret,
      note: sp.note,
      finger: sp.fret > 0 ? undefined : 0,
      isRoot,
    };
  });

  const playedFrets = triadPos.stringPositions.map(sp => sp.fret).filter(f => f > 0);
  const startFret = playedFrets.length > 0 ? Math.min(...playedFrets) : 0;
  const endFret = playedFrets.length > 0 ? Math.max(...playedFrets) : 0;

  let commonName = '';
  if (startFret === 0) {
    commonName = 'Open Position';
  } else if (triadPos.inversion === 'root') {
    commonName = `Root Position (Fret ${startFret})`;
  } else if (triadPos.inversion === 'first') {
    commonName = `1st Inversion (Fret ${startFret})`;
  } else if (triadPos.inversion === 'second') {
    commonName = `2nd Inversion (Fret ${startFret})`;
  }

  return {
    name: `${triadPos.rootNote} ${triadPos.triadType}`,
    positions,
    startFret,
    endFret,
    difficulty: startFret === 0 ? 1 : Math.min(5, Math.floor(startFret / 3) + 2),
    commonName,
  };
}

interface SongChordDiagramSidebarProps {
  theme: ThemeConfig;
  chordsInZone: ChordInZone[];
  selectedTriadPosition: TriadPosition | null;
  isVisible?: boolean;
  onClose?: () => void;
  tuning?: string[];
  stringCount?: number;
  onNavigatePrevious?: () => void;
  onNavigateNext?: () => void;
  // Overlapping Chords props
  visibleScaleNotes?: string[];
  allowedChords?: Array<{ rootNote: string; chordQuality: string }>;
  activeTab?: 'triads' | 'chords' | 'overlapping';
  onTabChange?: (tab: 'triads' | 'chords' | 'overlapping') => void;
  // Hover preview: called when user hovers over a chord diagram card
  onHoverVoicing?: (data: { voicing: ChordVoicing; chord: ChordInstance } | null) => void;
}

export default function SongChordDiagramSidebar({
  theme,
  chordsInZone,
  selectedTriadPosition,
  isVisible = true,
  onClose,
  tuning = ['E', 'A', 'D', 'G', 'B', 'E'],
  stringCount = 6,
  onNavigatePrevious,
  onNavigateNext,
  visibleScaleNotes = [],
  allowedChords = [],
  activeTab: externalActiveTab,
  onTabChange,
  onHoverVoicing,
}: SongChordDiagramSidebarProps) {
  // Drag and position state
  const [sidebarPosition, setSidebarPosition] = useState(0); // 0 = docked at right edge
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartPosition = useRef(0);

  // Tab state - use external control if provided, otherwise internal state
  const [internalActiveTab, setInternalActiveTab] = useState<'triads' | 'chords' | 'overlapping'>('triads');
  const activeTab = externalActiveTab || internalActiveTab;
  const handleTabChange = (tab: 'triads' | 'chords' | 'overlapping') => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartPosition.current = sidebarPosition;
  };

  // Handle drag move
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = dragStartX.current - e.clientX; // Reversed: dragging left increases position
      const newPosition = Math.max(0, dragStartPosition.current + deltaX); // Prevent negative values
      setSidebarPosition(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, sidebarPosition]);

  // Redock to right edge
  const handleRedock = () => {
    setSidebarPosition(0);
  };

  // Calculate TRIAD voicings for chords in the current position
  // Only show chords from the timeline that are playable in the current zone
  // For each chord, find the triad position closest to the selected position
  const triadVoicings = useMemo(() => {
    if (!selectedTriadPosition) {
      return [];
    }

    const selectedFretPosition = selectedTriadPosition.fretPosition;
    const playableChords = chordsInZone.filter(item => item.isPlayableInZone);

    return playableChords.map((item) => {
      const chord = item.chord;

      // Find positions within the same CAGED zone (within ~4 frets of selected position)
      const matchingPositions = item.allPositions.filter(triadPos =>
        Math.abs(triadPos.fretPosition - selectedFretPosition) <= 4
      );

      if (matchingPositions.length === 0) {
        return null;
      }

      // Find the position closest to the selected triad position
      const closestPosition = matchingPositions.reduce((closest, current) => {
        const closestDistance = Math.abs(closest.fretPosition - selectedFretPosition);
        const currentDistance = Math.abs(current.fretPosition - selectedFretPosition);
        return currentDistance < closestDistance ? current : closest;
      });

      // Convert the triad position to a chord voicing for display
      const voicing = convertTriadPositionToChordVoicing(closestPosition, tuning);

      return {
        chord,
        voicing,
        triadPosition: closestPosition,
      };
    }).filter(item => item !== null) as Array<{
      chord: ChordInstance;
      voicing: ChordVoicing;
      triadPosition: TriadPosition;
    }>;
  }, [chordsInZone, selectedTriadPosition, tuning]);

  // Calculate overlapping chords from visible scale notes
  const overlappingChords = useMemo(() => {
    if (!selectedTriadPosition || !visibleScaleNotes || visibleScaleNotes.length === 0) {
      return [];
    }

    console.log('🎸 SongChordDiagramSidebar - Calculating overlapping chords:');
    console.log('  - visibleScaleNotes:', visibleScaleNotes);
    console.log('  - allowedChords:', allowedChords);
    console.log('  - selectedTriadPosition:', selectedTriadPosition);

    const chords = findOverlappingChordsFromVisibleNotes(
      visibleScaleNotes,
      selectedTriadPosition,
      allowedChords,
      tuning,
      stringCount
    );

    console.log('🎸 Found overlapping chords:', chords);
    return chords;
  }, [visibleScaleNotes, selectedTriadPosition, allowedChords, tuning, stringCount]);

  // Calculate FULL CHORD voicings (not just triads) for chords in the timeline
  // This shows the actual chord extensions (7ths, 9ths, etc.) instead of just triads
  const fullChordVoicings = useMemo(() => {
    if (!selectedTriadPosition) {
      return [];
    }

    const selectedFretPosition = selectedTriadPosition.fretPosition;
    const playableChords = chordsInZone.filter(item => item.isPlayableInZone);

    return playableChords.map((item) => {
      const chord = item.chord;

      // Calculate all voicings for the FULL chord (with extensions)
      if (!chord.notes || chord.notes.length === 0) {
        return null;
      }

      const allVoicings = calculateChordVoicings(
        chord.notes,
        chord.rootNote,
        tuning,
        24 // maxFret - full fretboard range to include all CAGED shapes including octave positions (fret 12+)
      );

      // Filter voicings to those near the selected position (within ~4 frets)
      const nearbyVoicings = allVoicings.filter(voicing => {
        const voicingFretPosition = voicing.startFret;
        return Math.abs(voicingFretPosition - selectedFretPosition) <= 4;
      });

      if (nearbyVoicings.length === 0) {
        return null;
      }

      // Find the voicing closest to the selected position
      const closestVoicing = nearbyVoicings.reduce((closest, current) => {
        const closestDistance = Math.abs(closest.startFret - selectedFretPosition);
        const currentDistance = Math.abs(current.startFret - selectedFretPosition);
        return currentDistance < closestDistance ? current : closest;
      });

      return {
        chord,
        voicing: closestVoicing,
      };
    }).filter(item => item !== null) as Array<{
      chord: ChordInstance;
      voicing: ChordVoicing;
    }>;
  }, [chordsInZone, selectedTriadPosition, tuning]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed flex flex-col shadow-2xl"
      style={{
        width: '420px', // Increased width to prevent horizontal scrollbar
        top: '64px', // Start immediately below header (h-16 = 64px)
        bottom: '48px', // End above playback controls (h-12 = 48px)
        height: 'auto', // Let top and bottom define the height
        background: 'linear-gradient(to bottom, #1a1a1a, #0f0f0f)', // Dark gradient matching theme
        borderLeft: `2px solid ${theme.border}`,
        right: `${sidebarPosition}px`,
        transition: isDragging ? 'none' : 'right 0.3s ease',
        zIndex: 'var(--cpb-z-right-sidebar)',
      }}
    >
      {/* Drag Handle and Redock Button - Left side */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full flex flex-col items-center gap-1"
        style={{
          background: theme.bgSecondary,
          borderLeft: `1px solid ${theme.border}`,
          borderTop: `1px solid ${theme.border}`,
          borderBottom: `1px solid ${theme.border}`,
          borderRadius: '8px 0 0 8px',
          padding: '8px 4px',
        }}
      >
        {/* 6-Dot Drag Handle */}
        <div
          onMouseDown={handleDragStart}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-opacity-80 transition-all"
          style={{
            color: theme.textPrimary,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '3px',
          }}
          title="Drag to reposition sidebar"
        >
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: theme.textSecondary,
                opacity: 0.6,
              }}
            />
          ))}
        </div>

        {/* Redock Button */}
        <button
          onClick={handleRedock}
          className="p-1.5 rounded hover:bg-opacity-80 transition-all mt-1"
          style={{
            color: theme.textPrimary,
            background: sidebarPosition > 0 ? theme.bgTertiary : 'transparent',
          }}
          title="Redock sidebar to right edge"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: theme.border }}
      >
        <div>
          <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
            Nearby Chord Diagrams
          </h3>
          <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>
            {activeTab === 'triads' ? triadVoicings.length : fullChordVoicings.length} chord{(activeTab === 'triads' ? triadVoicings.length : fullChordVoicings.length) !== 1 ? 's' : ''} in position
          </p>
        </div>

        {/* Navigation Arrows and Close Button */}
        <div className="flex items-center gap-2">
          {/* Navigation Arrows */}
          {onNavigatePrevious && onNavigateNext && (
            <div className="flex gap-1">
              <button
                onClick={onNavigatePrevious}
                className="p-2 rounded-lg hover:opacity-70 transition-all"
                style={{
                  backgroundColor: theme.bgPrimary,
                  color: theme.textPrimary,
                  border: `1px solid ${theme.border}`,
                }}
                title="Previous position"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={onNavigateNext}
                className="p-2 rounded-lg hover:opacity-70 transition-all"
                style={{
                  backgroundColor: theme.bgPrimary,
                  color: theme.textPrimary,
                  border: `1px solid ${theme.border}`,
                }}
                title="Next position"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:opacity-70 transition-opacity"
              style={{ color: theme.textSecondary }}
              title="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as 'triads' | 'chords' | 'overlapping')} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full grid grid-cols-3 rounded-none border-b" style={{ borderColor: theme.border, background: theme.bgSecondary }}>
          <TabsTrigger
            value="triads"
            className="rounded-none data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3b82f6] data-[state=active]:to-[#60a5fa] data-[state=active]:text-white"
            style={{ color: activeTab === 'triads' ? '#ffffff' : theme.textSecondary }}
          >
            🎸 Triads
          </TabsTrigger>
          <TabsTrigger
            value="chords"
            className="rounded-none data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#8b5cf6] data-[state=active]:to-[#a78bfa] data-[state=active]:text-white"
            style={{ color: activeTab === 'chords' ? '#ffffff' : theme.textSecondary }}
          >
            🎵 Chords
          </TabsTrigger>
          <TabsTrigger
            value="overlapping"
            className="rounded-none data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#10b981] data-[state=active]:to-[#34d399] data-[state=active]:text-white"
            style={{ color: activeTab === 'overlapping' ? '#ffffff' : theme.textSecondary }}
          >
            🎹 Overlapping
          </TabsTrigger>
        </TabsList>

        {/* Triads Tab Content */}
        <TabsContent value="triads" className="flex-1 overflow-y-auto p-4 mt-0">
          {triadVoicings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Music className="w-12 h-12 mb-3" style={{ color: theme.textSecondary }} />
              <p className="text-sm text-center" style={{ color: theme.textSecondary }}>
                No position selected
              </p>
              <p className="text-xs text-center mt-2" style={{ color: theme.textSecondary }}>
                Select a chord and position to see nearby triad diagrams
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {triadVoicings.map(({ chord, voicing, triadPosition }, index) => {
                // Get color from chord root note
                const chordColor = NOTE_COLORS[chord.rootNote] || '#6b7280';

                return (
                  <div
                    key={`triad-${chord.id}-${index}`}
                    className="rounded-lg p-4 flex flex-col items-center gap-2 overflow-hidden transition-all duration-150"
                    style={{
                      background: theme.bgTertiary,
                      border: `1px solid ${theme.border}`,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={() => voicing && onHoverVoicing?.({ voicing, chord })}
                    onMouseLeave={() => onHoverVoicing?.(null)}
                  >
                    {/* Chord Symbol - Rounded Rectangle UI */}
                    <div
                      className="w-full rounded-lg px-3 py-2 flex items-center justify-center gap-2"
                      style={{
                        background: chordColor,
                        boxShadow: `0 0 8px ${chordColor}66`,
                      }}
                    >
                      <span className="text-sm font-bold text-white">
                        {chord.chordSymbol}
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

                    {/* Position Info */}
                    {voicing && (
                      <div
                        className="w-full rounded-lg px-2 py-1 text-center"
                        style={{
                          background: theme.bgSecondary,
                          border: `1px solid ${theme.border}`,
                        }}
                      >
                        <p className="text-xs font-medium" style={{ color: theme.textPrimary }}>
                          {voicing.commonName || `Fret ${voicing.startFret}`}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Chords Tab Content */}
        <TabsContent value="chords" className="flex-1 overflow-y-auto p-4 mt-0">
          {fullChordVoicings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Music className="w-12 h-12 mb-3" style={{ color: theme.textSecondary }} />
              <p className="text-sm text-center" style={{ color: theme.textSecondary }}>
                No position selected
              </p>
              <p className="text-xs text-center mt-2" style={{ color: theme.textSecondary }}>
                Select a chord and position to see nearby chord diagrams
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {fullChordVoicings.map(({ chord, voicing }, index) => {
                // Get color from chord root note
                const chordColor = NOTE_COLORS[chord.rootNote] || '#6b7280';

                return (
                  <div
                    key={`chord-${chord.id}-${index}`}
                    className="rounded-lg p-4 flex flex-col items-center gap-2 overflow-hidden transition-all duration-150"
                    style={{
                      background: theme.bgTertiary,
                      border: `1px solid ${theme.border}`,
                      cursor: 'pointer',
                    }}
                    onMouseEnter={() => voicing && onHoverVoicing?.({ voicing, chord })}
                    onMouseLeave={() => onHoverVoicing?.(null)}
                  >
                    {/* Chord Symbol - Rounded Rectangle UI */}
                    <div
                      className="w-full rounded-lg px-3 py-2 flex items-center justify-center gap-2"
                      style={{
                        background: chordColor,
                        boxShadow: `0 0 8px ${chordColor}66`,
                      }}
                    >
                      <span className="text-sm font-bold text-white">
                        {chord.chordSymbol}
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

                    {/* Position Info */}
                    {voicing && (
                      <div
                        className="w-full rounded-lg px-2 py-1 text-center"
                        style={{
                          background: theme.bgSecondary,
                          border: `1px solid ${theme.border}`,
                        }}
                      >
                        <p className="text-xs font-medium" style={{ color: theme.textPrimary }}>
                          {voicing.commonName || `Fret ${voicing.startFret}`}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Overlapping Chords Tab Content */}
        <TabsContent value="overlapping" className="flex-1 overflow-y-auto p-4 mt-0">
          {overlappingChords.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Music className="w-12 h-12 mb-3" style={{ color: theme.textSecondary }} />
              <p className="text-sm text-center" style={{ color: theme.textSecondary }}>
                No overlapping chords found
              </p>
              <p className="text-xs text-center mt-2" style={{ color: theme.textSecondary }}>
                Play a scale on the 2nd fretboard to see overlapping chords
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {overlappingChords.map((chord, index) => (
                <OverlappingChordCard
                  key={`${chord.rootNote}-${chord.quality}-${index}`}
                  chord={chord}
                  theme={theme}
                  tuning={tuning}
                  stringCount={stringCount}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

