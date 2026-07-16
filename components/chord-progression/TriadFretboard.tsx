'use client';

/**
 * Triad Fretboard Component
 * First fretboard showing triad positions and nearby neighborhood
 */

import { useMemo, useState, useEffect } from 'react';
import { ChordInstance } from '@/lib/chord-progression/types';
import { TriadPosition } from '@/lib/triad-positions';
import { ChordVoicing, calculateChordVoicings } from '@/lib/chord-voicings';
import { ThemeConfig } from '@/lib/themes';
import { ShapeRegion } from '@/lib/caged';
import { NotePosition, NOTE_COLORS } from '@/lib/musicTheory';

import { Layers } from 'lucide-react';
import Fretboard from '@/components/Fretboard';
import NearbyProgressionChords from './NearbyProgressionChords';

interface ChordInZone {
  chord: ChordInstance;
  isPlayableInZone: boolean;
  positionsInZone: TriadPosition[];
  allPositions: TriadPosition[];
}

interface TriadFretboardProps {
  selectedChord: ChordInstance | null;
  triadPositions: TriadPosition[];
  allChords: ChordInstance[];
  chordsInZone: ChordInZone[];
  selectedTriadPosition: TriadPosition | null;
  onTriadPositionSelect: (position: TriadPosition, allPositions: TriadPosition[]) => void;
  cagedRegions: ShapeRegion[];
  theme: ThemeConfig;
  tuning: string[];
  stringCount: 6 | 7;
  showCAGEDGuide: boolean;
  currentCAGEDZone: string;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  onShowAllZones?: () => void;
  onBackToTriads?: () => void;
  onShowChordDiagrams?: () => void;
  onGenerateProgression?: () => void;
  onRecommendProgressions?: () => void;
  cagedBrightness?: number;
  selectedChordIndex: number;
  onChordSelect: (index: number) => void;
  onVoicingChange: (chordIndex: number, voicing: ChordVoicing) => void;
  customVoicings: Map<string, ChordVoicing>;
  currentTime: number;
  isPlaying: boolean;
  showColorfulStrings?: boolean;
  stringBrightness?: number;
  // Sidebar hover preview: override 1st fretboard with this voicing on hover
  hoveredSidebarVoicing?: { voicing: ChordVoicing; chord: ChordInstance } | null;
}

export default function TriadFretboard({
  selectedChord,
  triadPositions,
  allChords,
  chordsInZone,
  selectedTriadPosition,
  onTriadPositionSelect,
  cagedRegions,
  theme,
  tuning,
  stringCount,
  showCAGEDGuide,
  currentCAGEDZone,
  onNavigatePrevious,
  onNavigateNext,
  onShowAllZones,
  onBackToTriads,
  onShowChordDiagrams,
  onGenerateProgression,
  onRecommendProgressions,
  cagedBrightness = 100,
  selectedChordIndex,
  onChordSelect,
  onVoicingChange,
  customVoicings,
  currentTime,
  isPlaying,
  showColorfulStrings = false,
  stringBrightness = 100,
  hoveredSidebarVoicing = null,
}: TriadFretboardProps) {
  // State for "Show All" toggle - shows all triad positions across entire fretboard
  const [showAllPositions, setShowAllPositions] = useState(false);

  // State for display mode: 'triads' | 'chords'
  const [displayMode, setDisplayMode] = useState<'triads' | 'chords'>('triads');

  // State for voicing outlines toggle
  const [showVoicingOutlines, setShowVoicingOutlines] = useState(false);

  // Sidebar hover override: when a sidebar chord card is hovered, show only its voicing
  // (injected from parent via prop — see interface below)

  // Build reverse map: chord root-note color → chord index, for click-to-select-chord in Chords mode
  const colorToChordIndex = useMemo(() => {
    const map = new Map<string, number>();
    allChords.forEach((chord, index) => {
      const color = NOTE_COLORS[chord.rootNote] || '#6b7280';
      // Only set if not already mapped (first chord with this color wins)
      if (!map.has(color)) map.set(color, index);
    });
    return map;
  }, [allChords]);

  // State for chord visibility toggles - tracks which chords are visible when Show All is enabled
  // Initialize with all chords visible by default
  const [visibleChordIds, setVisibleChordIds] = useState<Set<string>>(new Set());

  // Initialize visible chords when allChords changes
  useEffect(() => {
    setVisibleChordIds(new Set(allChords.map(chord => chord.id)));
  }, [allChords]);

  // Toggle visibility for a specific chord
  const toggleChordVisibility = (chordId: string) => {
    setVisibleChordIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chordId)) {
        newSet.delete(chordId);
      } else {
        newSet.add(chordId);
      }
      return newSet;
    });
  };

  // Calculate all nearby chord positions with color coding (like triads & CAGED screen)
  // BUT only for the SELECTED triad position (single position at a time)
  // UNLESS showAllPositions is enabled, then show ALL positions
  const allNearbyChordPositions = useMemo((): NotePosition[] => {
    // Get all chords that are playable in the current zone
    const playableChords = chordsInZone.filter(item => item.isPlayableInZone);

    if (playableChords.length === 0 || !selectedTriadPosition) {
      return [];
    }

    // Create a map to track positions and their associated chord colors
    const positionMap = new Map<string, { position: NotePosition; colors: string[] }>();

    if (showAllPositions) {
      // SHOW ALL MODE: Display ALL triad positions for all chords across the entire fretboard
      // Filter by visible chords only
      playableChords.forEach((item) => {
        const chord = item.chord;

        // Skip if this chord is not visible
        if (!visibleChordIds.has(chord.id)) {
          return;
        }

        const color = NOTE_COLORS[chord.rootNote] || '#6b7280';

        // Add ALL positions for this chord (no filtering by zone)
        item.allPositions.forEach((triadPos: TriadPosition) => {
          triadPos.stringPositions.forEach((sp: any) => {
            const key = `${sp.stringIndex}-${sp.fret}-${sp.note}`;

            if (positionMap.has(key)) {
              const existing = positionMap.get(key)!;
              if (!existing.colors.includes(color)) {
                existing.colors.push(color);
              }
            } else {
              positionMap.set(key, {
                position: {
                  stringIndex: sp.stringIndex,
                  fretNumber: sp.fret,
                  note: sp.note,
                  isRoot: sp.chordTone === 'root',
                },
                colors: [color],
              });
            }
          });
        });
      });
    } else {
      // SINGLE POSITION MODE: Only show positions near the selected triad position
      const selectedFretPosition = selectedTriadPosition.fretPosition;

      playableChords.forEach((item) => {
        const chord = item.chord;
        const color = NOTE_COLORS[chord.rootNote] || '#6b7280';

        // Find ALL positions for this chord that match the selected fret position
        // Look for positions within the same CAGED zone (within ~4 frets)
        const matchingPositions = item.allPositions.filter((triadPos: TriadPosition) =>
          Math.abs(triadPos.fretPosition - selectedFretPosition) <= 4
        );

        // KEY FIX: Select only ONE position per chord - the closest one to the selected position
        if (matchingPositions.length === 0) return;

        // Find the position closest to the selected triad position
        const closestPosition = matchingPositions.reduce((closest: TriadPosition, current: TriadPosition) => {
          const closestDistance = Math.abs(closest.fretPosition - selectedFretPosition);
          const currentDistance = Math.abs(current.fretPosition - selectedFretPosition);
          return currentDistance < closestDistance ? current : closest;
        });

        // Only add notes from the SINGLE closest position
        closestPosition.stringPositions.forEach((sp: any) => {
          // Create a unique key for this position
          const key = `${sp.stringIndex}-${sp.fret}-${sp.note}`;

          if (positionMap.has(key)) {
            // This position already exists - add this chord's color to the array
            const existing = positionMap.get(key)!;
            if (!existing.colors.includes(color)) {
              existing.colors.push(color);
            }
          } else {
            // New position - create entry with this chord's color
            positionMap.set(key, {
              position: {
                stringIndex: sp.stringIndex,
                fretNumber: sp.fret,
                note: sp.note,
                isRoot: sp.chordTone === 'root',
              },
              colors: [color],
            });
          }
        });
      });
    }

    // Convert map to array, setting sharedChordColors for each position
    const positions: NotePosition[] = [];
    positionMap.forEach(({ position, colors }) => {
      positions.push({
        ...position,
        sharedChordColors: colors,
        // Keep customColor for backward compatibility (use first color)
        customColor: colors[0],
      });
    });

    return positions;
  }, [chordsInZone, selectedTriadPosition, showAllPositions, visibleChordIds]);

  // Extract unique triad notes from all nearby chords for Fretboard's triad mode
  const triadNotes = useMemo((): string[] => {
    if (allNearbyChordPositions.length === 0) return [];

    const uniqueNotes = new Set<string>();
    allNearbyChordPositions.forEach((pos) => {
      uniqueNotes.add(pos.note);
    });

    return Array.from(uniqueNotes);
  }, [allNearbyChordPositions]);

  // (notePositions resolved below after chord-mode and hover computations)

  // Collect all triad positions from all nearby chords for the Fretboard's triadFullPositions prop
  // BUT only ONE position per chord - the closest one to the selected position
  // UNLESS showAllPositions is enabled, then show ALL positions
  const allTriadPositions = useMemo((): TriadPosition[] => {
    const playableChords = chordsInZone.filter(item => item.isPlayableInZone);

    if (playableChords.length === 0 || !selectedTriadPosition) {
      return [];
    }

    if (showAllPositions) {
      // SHOW ALL MODE: Return ALL positions for all chords
      // Filter by visible chords only
      const allPositions: TriadPosition[] = [];
      playableChords.forEach(item => {
        // Skip if this chord is not visible
        if (!visibleChordIds.has(item.chord.id)) {
          return;
        }
        allPositions.push(...item.allPositions);
      });
      return allPositions;
    } else {
      // SINGLE POSITION MODE: Only show closest position per chord
      const selectedFretPosition = selectedTriadPosition.fretPosition;

      // Collect only ONE position per chord - the closest one
      const closestPositions: TriadPosition[] = [];
      playableChords.forEach(item => {
        const matching = item.allPositions.filter((triadPos: TriadPosition) =>
          Math.abs(triadPos.fretPosition - selectedFretPosition) <= 4
        );

        if (matching.length > 0) {
          // Find the position closest to the selected triad position
          const closestPosition = matching.reduce((closest: TriadPosition, current: TriadPosition) => {
            const closestDistance = Math.abs(closest.fretPosition - selectedFretPosition);
            const currentDistance = Math.abs(current.fretPosition - selectedFretPosition);
            return currentDistance < closestDistance ? current : closest;
          });
          closestPositions.push(closestPosition);
        }
      });

      return closestPositions;
    }
  }, [chordsInZone, selectedTriadPosition, showAllPositions, visibleChordIds]);

  // ── CHORDS MODE: compute NotePositions from CustomVoicings ──────────────────
  const chordModeNotePositions = useMemo((): NotePosition[] => {
    if (displayMode !== 'chords') return [];

    // Always show ALL chords from the timeline in Chords mode (regardless of showAllPositions)
    const chordsToShow = allChords.filter(c => visibleChordIds.has(c.id));

    const positionMap = new Map<string, { position: NotePosition; colors: string[] }>();

    chordsToShow.forEach((chord) => {
      const color = NOTE_COLORS[chord.rootNote] || '#6b7280';
      // Prefer user-defined voicing, then use chord.voicingIndex to pick from computed list
      let voicing: ChordVoicing | undefined = customVoicings.get(chord.id);
      if (!voicing && chord.notes && chord.notes.length > 0) {
        const computed = calculateChordVoicings(chord.notes, chord.rootNote, tuning, 24);
        const idx = Math.min(chord.voicingIndex ?? 0, computed.length - 1);
        voicing = computed[Math.max(0, idx)];
      }
      if (!voicing) return;

      voicing.positions.forEach(fp => {
        if (fp.fret < 0) return; // muted
        const key = `${fp.stringIndex}-${fp.fret}-${fp.note}`;
        if (positionMap.has(key)) {
          const existing = positionMap.get(key)!;
          if (!existing.colors.includes(color)) existing.colors.push(color);
        } else {
          positionMap.set(key, {
            position: {
              stringIndex: fp.stringIndex,
              fretNumber: fp.fret,
              note: fp.note,
              isRoot: fp.isRoot ?? false,
            },
            colors: [color],
          });
        }
      });
    });

    return Array.from(positionMap.values()).map(({ position, colors }) => ({
      ...position,
      sharedChordColors: colors,
      customColor: colors[0],
    }));
  }, [displayMode, allChords, selectedChord, customVoicings, tuning, showAllPositions, visibleChordIds]);

  // ── VOICING OUTLINE GROUPS for SVG overlay ───────────────────────────────────
  const voicingOutlineGroups = useMemo(() => {
    if (!showVoicingOutlines || displayMode !== 'chords') return [];

    // Always show outlines for ALL chords in Chords mode
    const chordsToShow = allChords.filter(c => visibleChordIds.has(c.id));

    return chordsToShow.map((chord) => {
      const color = NOTE_COLORS[chord.rootNote] || '#6b7280';
      let voicing: ChordVoicing | undefined = customVoicings.get(chord.id);
      if (!voicing && chord.notes && chord.notes.length > 0) {
        const computed = calculateChordVoicings(chord.notes, chord.rootNote, tuning, 24);
        const idx = Math.min(chord.voicingIndex ?? 0, computed.length - 1);
        voicing = computed[Math.max(0, idx)];
      }
      if (!voicing) return null;

      const positions = voicing.positions
        .filter(fp => fp.fret >= 0)
        .map(fp => ({ stringIndex: fp.stringIndex, fretIndex: fp.fret }));

      return { color, label: chord.chordSymbol, positions };
    }).filter(Boolean) as { color: string; label: string; positions: { stringIndex: number; fretIndex: number }[] }[];
  }, [showVoicingOutlines, displayMode, allChords, selectedChord, customVoicings, tuning, showAllPositions, visibleChordIds]);

  // ── SIDEBAR HOVER PREVIEW: override notePositions ───────────────────────────
  const hoveredSidebarNotePositions = useMemo((): NotePosition[] => {
    if (!hoveredSidebarVoicing) return [];
    const { voicing, chord } = hoveredSidebarVoicing;
    const color = NOTE_COLORS[chord.rootNote] || '#6b7280';
    return voicing.positions
      .filter(fp => fp.fret >= 0)
      .map(fp => ({
        stringIndex: fp.stringIndex,
        fretNumber: fp.fret,
        note: fp.note,
        isRoot: fp.isRoot ?? false,
        customColor: color,
        sharedChordColors: [color],
      }));
  }, [hoveredSidebarVoicing]);

  // ── Resolved notePositions (respects hover override & display mode) ──────────
  const resolvedNotePositions = useMemo((): NotePosition[] => {
    if (hoveredSidebarVoicing) return hoveredSidebarNotePositions;
    if (displayMode === 'chords') return chordModeNotePositions;
    return allNearbyChordPositions;
  }, [hoveredSidebarVoicing, hoveredSidebarNotePositions, displayMode, chordModeNotePositions, allNearbyChordPositions]);

  // Calculate anchor chord positions for navigation arrows
  const anchorChordPositions = useMemo(() => {
    if (!selectedTriadPosition) return [];

    return selectedTriadPosition.stringPositions.map(sp => ({
      string: sp.stringIndex + 1, // Convert to 1-based
      fret: sp.fret,
      note: sp.note,
    }));
  }, [selectedTriadPosition]);

  // Handle clicking on triad positions
  const handleTriadClick = (position: TriadPosition) => {
    onTriadPositionSelect(position, triadPositions);
  };

  // Handle clicking a chord note in Chords mode → select that chord
  const handleChordNoteClick = (notePos: NotePosition) => {
    if (!notePos.customColor) return;
    const chordIndex = colorToChordIndex.get(notePos.customColor);
    if (chordIndex !== undefined) {
      onChordSelect(chordIndex);
    }
  };

  // Calculate fret range for current zone
  const fretRange = useMemo(() => {
    if (triadPositions.length === 0) return null;

    const frets = triadPositions.flatMap(pos =>
      pos.stringPositions.map(sp => sp.fret)
    );

    const minFret = Math.min(...frets);
    const maxFret = Math.max(...frets);

    return { min: minFret, max: maxFret };
  }, [triadPositions]);

  return (
    <div className="w-full" role="region" aria-label="Triad Fretboard">
      {/* Nearby Chords in Progression - Moved to Top */}
      {chordsInZone.length > 0 && (
        <NearbyProgressionChords
          theme={theme}
          allChords={allChords}
          chordsInZone={chordsInZone}
          selectedChord={selectedChord}
          selectedTriadPosition={selectedTriadPosition}
          currentCAGEDZone={currentCAGEDZone}
          onChordSelect={(chord, position) => {
            onTriadPositionSelect(position, triadPositions);
          }}
        />
      )}

      {/* Header with Action Buttons */}
      <div className="mb-1">
        {/* Title and Action Buttons Row */}
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: theme.textPrimary }}>
            Chord Progression
          </h3>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Navigation Arrows */}
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

            {/* ── Triads ↔ Chords Toggle ── */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{
              backgroundColor: theme.bgPrimary,
              border: `1px solid ${theme.border}`,
            }}>
              <span className="text-sm font-semibold" style={{
                color: displayMode === 'triads' ? theme.textPrimary : theme.textSecondary,
                transition: 'color 0.2s',
              }}>
                Triads
              </span>
              <button
                onClick={() => setDisplayMode(prev => prev === 'triads' ? 'chords' : 'triads')}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none"
                style={{ backgroundColor: displayMode === 'chords' ? '#8b5cf6' : '#6b7280' }}
                role="switch"
                aria-checked={displayMode === 'chords'}
                title={displayMode === 'chords' ? 'Switch to Triads display' : 'Switch to Chords display'}
              >
                <span
                  className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
                  style={{ transform: displayMode === 'chords' ? 'translateX(1.5rem)' : 'translateX(0.25rem)' }}
                />
              </button>
              <span className="text-sm font-semibold" style={{
                color: displayMode === 'chords' ? theme.textPrimary : theme.textSecondary,
                transition: 'color 0.2s',
              }}>
                Chords
              </span>
            </div>

            {/* ── Voicing Outlines Toggle ── */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{
                backgroundColor: theme.bgPrimary,
                border: `1px solid ${showVoicingOutlines && displayMode === 'chords' ? '#8b5cf6' : theme.border}`,
                opacity: displayMode === 'chords' ? 1 : 0.45,
                transition: 'opacity 0.2s, border-color 0.2s',
              }}
              title="Draw outlines around chord voicing positions"
            >
              <Layers size={15} style={{ color: showVoicingOutlines && displayMode === 'chords' ? '#8b5cf6' : theme.textSecondary }} />
              <button
                onClick={() => displayMode === 'chords' && setShowVoicingOutlines(prev => !prev)}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none"
                style={{
                  backgroundColor: showVoicingOutlines && displayMode === 'chords' ? '#8b5cf6' : '#6b7280',
                  cursor: displayMode === 'chords' ? 'pointer' : 'not-allowed',
                }}
                role="switch"
                aria-checked={showVoicingOutlines}
                title="Toggle voicing outlines"
              >
                <span
                  className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
                  style={{ transform: showVoicingOutlines ? 'translateX(1.5rem)' : 'translateX(0.25rem)' }}
                />
              </button>
            </div>

            {/* ── Show All Positions Toggle ── */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{
              backgroundColor: theme.bgPrimary,
              border: `1px solid ${theme.border}`,
            }}>
              <label htmlFor="show-all-toggle" className="text-sm font-medium cursor-pointer" style={{ color: theme.textPrimary }}>
                🔍 Show All Positions
              </label>
              <button
                id="show-all-toggle"
                onClick={() => setShowAllPositions(!showAllPositions)}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: showAllPositions ? '#10b981' : '#6b7280',
                  outlineColor: '#10b981',
                }}
                role="switch"
                aria-checked={showAllPositions}
                title={showAllPositions ? "Showing all positions across entire fretboard" : "Showing only current position"}
              >
                <span
                  className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
                  style={{
                    transform: showAllPositions ? 'translateX(1.5rem)' : 'translateX(0.25rem)',
                  }}
                />
              </button>
            </div>

            {onShowChordDiagrams && (
              <button
                onClick={onShowChordDiagrams}
                className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105 hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
                  border: 'none',
                }}
                title="Show chord diagrams"
              >
                📊 Chord Diagrams
              </button>
            )}

            {onGenerateProgression && (
              <button
                onClick={onGenerateProgression}
                className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105 hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                  border: 'none',
                }}
                title="Generate chord progression"
              >
                🎵 Generate Progression
              </button>
            )}

            {/* Chord Filter Toggles - Only show when Show All Positions is enabled */}
            {showAllPositions && allChords.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{
                backgroundColor: theme.bgPrimary,
                border: `1px solid ${theme.border}`,
              }}>
                <span className="text-xs font-medium" style={{ color: theme.textSecondary }}>
                  Filter Chords:
                </span>
                <div className="flex flex-wrap gap-2">
                  {allChords.map((chord) => {
                    const isVisible = visibleChordIds.has(chord.id);
                    const chordColor = NOTE_COLORS[chord.rootNote] || '#6b7280';

                    return (
                      <div
                        key={chord.id}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md transition-all"
                        style={{
                          backgroundColor: isVisible ? `${chordColor}20` : theme.bgSecondary,
                          border: `1px solid ${isVisible ? chordColor : theme.border}`,
                        }}
                      >
                        <span className="text-xs font-medium" style={{
                          color: isVisible ? chordColor : theme.textSecondary
                        }}>
                          {chord.chordSymbol}
                        </span>
                        <button
                          onClick={() => toggleChordVisibility(chord.id)}
                          className="relative inline-flex h-4 w-7 items-center rounded-full transition-colors duration-200"
                          style={{
                            backgroundColor: isVisible ? chordColor : '#6b7280',
                          }}
                          role="switch"
                          aria-checked={isVisible}
                          title={isVisible ? `Hide ${chord.chordSymbol} triads` : `Show ${chord.chordSymbol} triads`}
                        >
                          <span
                            className="inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 shadow-sm"
                            style={{
                              transform: isVisible ? 'translateX(0.875rem)' : 'translateX(0.125rem)',
                            }}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fretboard */}
      <div className="relative">
        <Fretboard
          stringCount={stringCount}
          tuning={tuning}
          notePositions={resolvedNotePositions}
          theme={theme}
          showCAGEDOverlay={showCAGEDGuide}
          cagedRegions={cagedRegions}
          cagedBrightness={cagedBrightness}
          fretCount={24}
          showTriadMode={displayMode === 'triads' && !hoveredSidebarVoicing}
          triadNotes={displayMode === 'triads' && !hoveredSidebarVoicing ? triadNotes : []}
          triadFullPositions={displayMode === 'triads' && !hoveredSidebarVoicing ? allTriadPositions : []}
          onTriadVoicingClick={displayMode === 'triads' ? handleTriadClick : undefined}
          onNoteClick={displayMode === 'chords' && !hoveredSidebarVoicing ? handleChordNoteClick : undefined}
          showNavigationArrows={true}
          anchorChordPositions={anchorChordPositions}
          onNavigatePrevious={onNavigatePrevious}
          onNavigateNext={onNavigateNext}
          showColorfulStrings={showColorfulStrings}
          stringBrightness={stringBrightness}
          showTopFretNumbers={false}
          voicingOutlineGroups={voicingOutlineGroups}
        />
      </div>

      {/* Empty State */}
      {!selectedChord && (
        <div className="text-center py-8" style={{ color: theme.textSecondary }}>
          <p>Select a chord from the progression above to see triad positions</p>
        </div>
      )}
    </div>
  );
}

/**
 * Get color for CAGED shape
 */
function getCAGEDColor(shape: string): string {
  const colors: Record<string, string> = {
    'C': '#3b82f6', // Blue
    'A': '#10b981', // Green
    'G': '#f59e0b', // Amber
    'E': '#ef4444', // Red
    'D': '#8b5cf6', // Purple
  };
  return colors[shape] || '#6b7280';
}

