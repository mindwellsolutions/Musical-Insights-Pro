'use client';

/**
 * Dual Fretboard Display Component
 * Container coordinating both fretboards (triads and scales)
 */

import { useMemo, useEffect, useState } from 'react';
import { ChordInstance, ScaleModeInstance, ChordQuality } from '@/lib/chord-progression/types';
import { TriadPosition } from '@/lib/triad-positions';
import { ChordVoicing } from '@/lib/chord-voicings';
import { ThemeConfig } from '@/lib/themes';
import { ShapeRegion, CAGEDShapeName, NoteName } from '@/lib/caged';
import { useCAGED } from '@/lib/caged/useCAGED';
import {
  getTriadPositionsForChord,
  filterScaleNotesByCAGEDRegions,
  getNearbyChordsSongProgression,
} from '@/lib/chord-progression/song-progression-utils';
import { convertToAnchorVoicing } from '@/lib/music-theory/neighborhood/voicing-generator';
import { getCAGEDRegionsForVoicing } from '@/lib/music-theory/neighborhood/caged-detection';
import TriadFretboard from './TriadFretboard';
import ScaleFretboard from './ScaleFretboard';

/**
 * Helper to check if a chord quality is minor
 */
const isMinorQuality = (quality: ChordQuality): boolean => {
  return ['min', 'min7', 'min9', 'min11', 'min13', 'min6', 'min-add9', 'min7b5'].includes(quality);
};

interface DualFretboardDisplayProps {
  selectedChord: ChordInstance | null;
  selectedScale: ScaleModeInstance | null;
  selectedTriadPosition: TriadPosition | null;
  onTriadPositionSelect: (position: TriadPosition, allPositions: TriadPosition[]) => void;
  customVoicing?: ChordVoicing;
  theme: ThemeConfig;
  tuning: string[];
  stringCount: 6 | 7;
  showCAGEDGuide: boolean;
  selectedCAGEDShapes: string[];
  currentKey: string;
  currentCAGEDZone: string;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  allChords: ChordInstance[]; // Full chord progression from timeline
  selectedChordIndex: number;
  onChordSelect: (index: number) => void;
  onVoicingChange: (chordIndex: number, voicing: ChordVoicing) => void;
  customVoicings: Map<string, ChordVoicing>;
  currentTime: number;
  isPlaying: boolean;
  onShowChordDiagrams?: () => void;
  onGenerateProgression?: () => void;
  showColorfulStrings?: boolean;
  stringBrightness?: number;
  onFilteredScaleNotesChange?: (notes: string[]) => void; // Callback for visible scale notes
  onAllowedChordsChange?: (chords: Array<{ rootNote: string; chordQuality: string }>) => void; // Callback for allowed chords
  hoveredSidebarVoicing?: { voicing: ChordVoicing; chord: ChordInstance } | null;
}

export default function DualFretboardDisplay({
  selectedChord,
  selectedScale,
  selectedTriadPosition,
  onTriadPositionSelect,
  customVoicing,
  theme,
  tuning,
  stringCount,
  showCAGEDGuide,
  selectedCAGEDShapes,
  currentKey,
  currentCAGEDZone,
  onNavigatePrevious,
  onNavigateNext,
  allChords,
  selectedChordIndex,
  onChordSelect,
  onVoicingChange,
  customVoicings,
  currentTime,
  isPlaying,
  onShowChordDiagrams,
  onGenerateProgression,
  showColorfulStrings = false,
  stringBrightness = 100,
  onFilteredScaleNotesChange,
  onAllowedChordsChange,
  hoveredSidebarVoicing = null,
}: DualFretboardDisplayProps) {
  // State for selected compatible scale index (shared between both fretboards)
  const [selectedScaleIndex, setSelectedScaleIndex] = useState(0);

  // Reset selected scale index when chord changes
  useEffect(() => {
    setSelectedScaleIndex(0);
  }, [selectedChord]);

  // Determine chord quality for CAGED system
  const cagedQuality = useMemo(() => {
    if (!selectedChord) return 'major';

    const quality = selectedChord.chordQuality;
    return isMinorQuality(quality) ? 'minor' : 'major';
  }, [selectedChord]);

  // Use CAGED hook to get all regions with proper colors and transparency
  const cagedData = useCAGED({
    rootNote: (selectedChord?.rootNote || 'C') as NoteName,
    quality: cagedQuality,
    maxFret: 24,
    enabledShapes: selectedCAGEDShapes as CAGEDShapeName[],
  });

  // Calculate triad positions for selected chord
  // Show ALL positions, not just current zone
  const triadPositions = useMemo(() => {
    if (!selectedChord) return [];

    const allPositions = getTriadPositionsForChord(
      selectedChord,
      24,
      undefined
    );

    // Return ALL positions - don't filter by zone
    return allPositions;
  }, [selectedChord]);

  // Filter chords that are playable in the current CAGED zone
  const chordsInZone = useMemo(() => {
    return allChords.map(chord => {
      const positions = getTriadPositionsForChord(chord, 24, undefined);
      const positionsInZone = positions.filter(pos => pos.cagedShape === currentCAGEDZone);

      return {
        chord,
        isPlayableInZone: positionsInZone.length > 0,
        positionsInZone,
        allPositions: positions, // Include all positions for reference
      };
    });
  }, [allChords, currentCAGEDZone]);

  // Get CAGED regions from useCAGED hook - shows ALL shapes with proper colors
  const cagedRegions = useMemo((): ShapeRegion[] => {
    if (!showCAGEDGuide) return [];
    return cagedData.filteredRegions;
  }, [showCAGEDGuide, cagedData.filteredRegions]);

  // Calculate ALL nearby chord notes (same logic as TriadFretboard)
  // This includes all chord positions within ±4 frets of the selected position
  const nearbyChordNotes = useMemo(() => {
    if (!selectedTriadPosition) return [];

    const playableChords = chordsInZone.filter(item => item.isPlayableInZone);
    if (playableChords.length === 0) return [];

    const selectedFretPosition = selectedTriadPosition.fretPosition;
    const allNotes: { stringIndex: number; fret: number; note: string }[] = [];

    playableChords.forEach((item) => {
      // Find ALL positions for this chord that match the selected fret position
      const matchingPositions = item.allPositions.filter(triadPos =>
        Math.abs(triadPos.fretPosition - selectedFretPosition) <= 4
      );

      if (matchingPositions.length === 0) return;

      // Find the position closest to the selected triad position
      const closestPosition = matchingPositions.reduce((closest, current) => {
        const closestDistance = Math.abs(closest.fretPosition - selectedFretPosition);
        const currentDistance = Math.abs(current.fretPosition - selectedFretPosition);
        return currentDistance < closestDistance ? current : closest;
      });

      // Add all notes from this position
      closestPosition.stringPositions.forEach(sp => {
        allNotes.push({
          stringIndex: sp.stringIndex,
          fret: sp.fret,
          note: sp.note,
        });
      });
    });

    return allNotes;
  }, [selectedTriadPosition, chordsInZone]);

  // Get CAGED regions from nearby chord positions (like triads & CAGED screen)
  // This filters scale notes to only show those within the CAGED shape areas that contain the current triad position
  const scaleFilterRegions = useMemo((): ShapeRegion[] => {
    if (!selectedTriadPosition || !cagedRegions.length || nearbyChordNotes.length === 0) return [];

    console.log('🎯 scaleFilterRegions - Nearby chord notes count:', nearbyChordNotes.length);
    console.log('🎯 scaleFilterRegions - All CAGED regions (visible overlays):', cagedRegions.map(r => `${r.shapeName} (frets ${r.startFret}-${r.endFret}, strings ${r.topString}-${r.bottomString})`));

    // Filter the visible CAGED regions to only include those that contain actual chord notes
    // from ALL nearby chord positions
    const regionsWithChordNotes = cagedRegions.filter(region => {
      // Check if ANY of the nearby chord notes fall within this CAGED region
      const hasChordNote = nearbyChordNotes.some(notePos => {
        const isInRegion =
          notePos.fret >= region.startFret &&
          notePos.fret <= region.endFret &&
          notePos.stringIndex >= region.topString &&
          notePos.stringIndex <= region.bottomString;

        if (isInRegion) {
          console.log(`✅ Found chord note in ${region.shapeName}: string ${notePos.stringIndex}, fret ${notePos.fret}, note ${notePos.note}`);
        }

        return isInRegion;
      });

      if (!hasChordNote) {
        console.log(`❌ NO chord notes in ${region.shapeName} (frets ${region.startFret}-${region.endFret}, strings ${region.topString}-${region.bottomString})`);
      }

      return hasChordNote;
    });

    console.log('🎯 scaleFilterRegions - FINAL Regions with chord notes:', regionsWithChordNotes.map(r => `${r.shapeName} (frets ${r.startFret}-${r.endFret}, strings ${r.topString}-${r.bottomString})`));

    return regionsWithChordNotes;
  }, [selectedTriadPosition, cagedRegions, nearbyChordNotes]);

  // Filter scale notes by CAGED regions from nearby chord positions
  const filteredScaleNotes = useMemo(() => {
    if (!selectedScale) return [];

    const filtered = filterScaleNotesByCAGEDRegions(selectedScale, scaleFilterRegions, tuning);

    console.log('🎵 Filtered scale notes count:', filtered.length);
    console.log('🎵 Scale notes by CAGED shape:',
      scaleFilterRegions.map(r => ({
        shape: r.shapeName,
        count: filtered.filter(n => n.cagedShape === r.shapeName).length
      }))
    );

    return filtered;
  }, [selectedScale, scaleFilterRegions, tuning]);

  // Notify parent of filtered scale notes changes (for overlapping chords)
  useEffect(() => {
    if (onFilteredScaleNotesChange) {
      const uniqueNotes = Array.from(new Set(filteredScaleNotes.map(n => n.note)));
      onFilteredScaleNotesChange(uniqueNotes);
    }
  }, [filteredScaleNotes, onFilteredScaleNotesChange]);

  // Notify parent of allowed chords from chord progression (for overlapping chords)
  useEffect(() => {
    if (onAllowedChordsChange && allChords.length > 0) {
      // Get unique chord types (remove duplicates)
      const uniqueChordMap = new Map<string, { rootNote: string; chordQuality: string }>();

      allChords.forEach(chord => {
        const key = `${chord.rootNote}-${chord.chordQuality}`;
        if (!uniqueChordMap.has(key)) {
          uniqueChordMap.set(key, {
            rootNote: chord.rootNote,
            chordQuality: chord.chordQuality
          });
        }
      });

      const allowedChords = Array.from(uniqueChordMap.values());
      console.log('🎸 Allowed chords for overlapping:', allowedChords);
      onAllowedChordsChange(allowedChords);
    }
  }, [allChords, onAllowedChordsChange]);

  // Auto-select default triad position when chord or zone changes
  // Prefer positions around frets 7-10 in the current CAGED zone
  useEffect(() => {
    if (!selectedChord || triadPositions.length === 0) return;

    // Don't auto-select if user has already selected a position in this zone
    if (selectedTriadPosition && selectedTriadPosition.cagedShape === currentCAGEDZone) return;

    // Filter positions to only those in the current CAGED zone
    const positionsInZone = triadPositions.filter(pos => pos.cagedShape === currentCAGEDZone);

    if (positionsInZone.length === 0) {
      // No positions in this zone, try any zone
      const preferredPosition = triadPositions.find(
        pos => pos.fretPosition >= 7 && pos.fretPosition <= 10
      );
      if (preferredPosition) {
        onTriadPositionSelect(preferredPosition, triadPositions);
      } else if (triadPositions.length > 0) {
        onTriadPositionSelect(triadPositions[0], triadPositions);
      }
      return;
    }

    // Try to find position around frets 7-10 in current zone
    const preferredPosition = positionsInZone.find(
      pos => pos.fretPosition >= 7 && pos.fretPosition <= 10
    );

    if (preferredPosition) {
      onTriadPositionSelect(preferredPosition, triadPositions);
    } else {
      // Fallback: select first available position in current zone
      onTriadPositionSelect(positionsInZone[0], triadPositions);
    }
  }, [selectedChord, triadPositions, selectedTriadPosition, currentCAGEDZone, onTriadPositionSelect]);

  return (
    <div className="flex flex-col gap-4">
      {/* 1st Fretboard - Triads & Song Progression */}
      <TriadFretboard
        selectedChord={selectedChord}
        triadPositions={triadPositions}
        allChords={allChords}
        chordsInZone={chordsInZone}
        selectedTriadPosition={selectedTriadPosition}
        onTriadPositionSelect={onTriadPositionSelect}
        cagedRegions={cagedRegions}
        theme={theme}
        tuning={tuning}
        stringCount={stringCount}
        showCAGEDGuide={showCAGEDGuide}
        currentCAGEDZone={currentCAGEDZone}
        onNavigatePrevious={onNavigatePrevious}
        onNavigateNext={onNavigateNext}
        cagedBrightness={100}
        selectedChordIndex={selectedChordIndex}
        onChordSelect={onChordSelect}
        onVoicingChange={onVoicingChange}
        customVoicings={customVoicings}
        currentTime={currentTime}
        isPlaying={isPlaying}
        onShowChordDiagrams={onShowChordDiagrams}
        onGenerateProgression={onGenerateProgression}
        showColorfulStrings={showColorfulStrings}
        stringBrightness={stringBrightness}
        hoveredSidebarVoicing={hoveredSidebarVoicing}
      />

      {/* 2nd Fretboard - Associated Scales (CAGED Filtered) */}
      <ScaleFretboard
        selectedScale={selectedScale}
        filteredScaleNotes={filteredScaleNotes}
        cagedRegions={cagedRegions}
        scaleFilterRegions={scaleFilterRegions}
        theme={theme}
        tuning={tuning}
        stringCount={stringCount}
        showCAGEDGuide={showCAGEDGuide}
        cagedBrightness={100}
        showColorfulStrings={showColorfulStrings}
        stringBrightness={stringBrightness}
        selectedChord={selectedChord ? { rootNote: selectedChord.rootNote, chordQuality: selectedChord.chordQuality } : null}
        selectedScaleIndex={selectedScaleIndex}
        onScaleIndexChange={setSelectedScaleIndex}
      />
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

