'use client';

/**
 * Play Song Panel - Dual fretboard system with triads and CAGED integration
 */

import { useState, useEffect, useMemo } from 'react';
import { ChordInstance, ScaleModeInstance } from '@/lib/chord-progression/types';
import { ThemeConfig } from '@/lib/themes';
import { TriadPosition } from '@/lib/triad-positions';
import { ChordVoicing } from '@/lib/chord-voicings';
import { getCurrentChordAndScale, getTriadPositionsForChord } from '@/lib/chord-progression/song-progression-utils';
import DualFretboardDisplay from './DualFretboardDisplay';
import SongChordDiagramSidebar from './SongChordDiagramSidebar';
import SongOverlappingChordsSidebar from './SongOverlappingChordsSidebar';

interface PlaySongPanelProps {
  currentChords: ChordInstance[];
  currentScales: ScaleModeInstance[];
  currentKey: string;
  isPlaying: boolean;
  currentTime: number;
  tuning: string[];
  stringCount: 6 | 7;
  theme: ThemeConfig;
  showColorfulStrings?: boolean;
  onShowColorfulStringsChange?: (enabled: boolean) => void;
  stringBrightness?: number;
  onStringBrightnessChange?: (brightness: number) => void;
  onGenerateProgression?: () => void;
}

export default function PlaySongPanel({
  currentChords,
  currentScales,
  currentKey,
  isPlaying,
  currentTime,
  tuning,
  stringCount,
  theme,
  showColorfulStrings = false,
  onShowColorfulStringsChange,
  stringBrightness = 100,
  onStringBrightnessChange,
  onGenerateProgression,
}: PlaySongPanelProps) {
  // State for selected chord from progression
  const [selectedChordIndex, setSelectedChordIndex] = useState<number>(0);

  // State for selected triad position
  const [selectedTriadPosition, setSelectedTriadPosition] = useState<TriadPosition | null>(null);

  // State for custom voicings (per chord)
  const [customVoicings, setCustomVoicings] = useState<Map<string, ChordVoicing>>(new Map());

  // State for CAGED guide
  const [showCAGEDGuide, setShowCAGEDGuide] = useState<boolean>(true);
  const [selectedCAGEDShapes, setSelectedCAGEDShapes] = useState<string[]>(['C', 'A', 'G', 'E', 'D']);

  // State for CAGED zone navigation
  const [currentCAGEDZone, setCurrentCAGEDZone] = useState<string>('E'); // Default to E shape
  const CAGED_SHAPES = ['C', 'A', 'G', 'E', 'D'] as const;

  // State for position navigation (like triads & CAGED screen)
  const [allTriadPositions, setAllTriadPositions] = useState<TriadPosition[]>([]);
  const [currentPositionIndex, setCurrentPositionIndex] = useState<number>(0);

  // State for unified chord diagram sidebar
  const [showChordDiagramSidebar, setShowChordDiagramSidebar] = useState<boolean>(false);
  const [sidebarActiveTab, setSidebarActiveTab] = useState<'triads' | 'chords' | 'overlapping'>('triads');

  // State for sidebar hover preview on 1st fretboard
  const [hoveredSidebarVoicing, setHoveredSidebarVoicing] = useState<{ voicing: ChordVoicing; chord: any } | null>(null);

  // State for visible scale notes from 2nd fretboard (for overlapping chords)
  const [visibleScaleNotes, setVisibleScaleNotes] = useState<string[]>([]);

  // State for allowed chords from chord progression (for overlapping chords)
  const [allowedChords, setAllowedChords] = useState<Array<{ rootNote: string; chordQuality: string }>>([]);

  // Get current chord and scale based on playback time
  const { chord: currentChord, scale: currentScale } = useMemo(() => {
    return getCurrentChordAndScale(currentChords, currentScales, currentTime);
  }, [currentChords, currentScales, currentTime]);

  // Update selected chord index when playback changes
  useEffect(() => {
    if (isPlaying && currentChord) {
      const index = currentChords.findIndex(c => c.id === currentChord.id);
      if (index !== -1) {
        setSelectedChordIndex(index);
      }
    }
  }, [isPlaying, currentChord, currentChords]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setSelectedChordIndex(prev => Math.max(0, prev - 1));
          setSelectedTriadPosition(null);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setSelectedChordIndex(prev => Math.min(currentChords.length - 1, prev + 1));
          setSelectedTriadPosition(null);
          break;
        case 'Home':
          e.preventDefault();
          setSelectedChordIndex(0);
          setSelectedTriadPosition(null);
          break;
        case 'End':
          e.preventDefault();
          setSelectedChordIndex(currentChords.length - 1);
          setSelectedTriadPosition(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentChords.length]);

  // Get selected chord (either from user selection or playback)
  const selectedChord = useMemo(() => {
    if (isPlaying && currentChord) {
      return currentChord;
    }
    return currentChords[selectedChordIndex] || null;
  }, [isPlaying, currentChord, currentChords, selectedChordIndex]);

  // Get selected scale (either from user selection or playback)
  const selectedScale = useMemo(() => {
    if (isPlaying && currentScale) {
      return currentScale;
    }
    // Find scale matching selected chord
    const chordStartTime = selectedChord?.startTime || 0;
    return currentScales.find(scale =>
      chordStartTime >= scale.startTime &&
      chordStartTime < scale.startTime + scale.duration
    ) || null;
  }, [isPlaying, currentScale, currentScales, selectedChord]);

  // Handle chord selection from progression
  const handleChordSelect = (index: number) => {
    setSelectedChordIndex(index);
    setSelectedTriadPosition(null); // Reset triad position when changing chords
  };

  // Handle voicing change from voicing selector
  const handleVoicingChange = (chordIndex: number, voicing: ChordVoicing) => {
    const chord = currentChords[chordIndex];
    if (chord) {
      const newVoicings = new Map(customVoicings);
      newVoicings.set(chord.id, voicing);
      setCustomVoicings(newVoicings);
    }
  };

  // Handle triad position selection
  const handleTriadPositionSelect = (position: TriadPosition, allPositions: TriadPosition[]) => {
    setSelectedTriadPosition(position);
    // Update current zone to match selected position
    if (position.cagedShape) {
      setCurrentCAGEDZone(position.cagedShape);
    }

    // Store all positions and find the index of the selected position
    setAllTriadPositions(allPositions);
    const index = allPositions.findIndex(p =>
      p.fretPosition === position.fretPosition &&
      p.stringPositions.every((sp, i) =>
        sp.stringIndex === position.stringPositions[i]?.stringIndex &&
        sp.fret === position.stringPositions[i]?.fret
      )
    );
    setCurrentPositionIndex(index >= 0 ? index : 0);
  };

  // Handle position navigation (like triads & CAGED screen)
  const handleNavigatePrevious = () => {
    if (allTriadPositions.length === 0) return;

    const newIndex = currentPositionIndex <= 0
      ? allTriadPositions.length - 1
      : currentPositionIndex - 1;

    setCurrentPositionIndex(newIndex);
    const newPosition = allTriadPositions[newIndex];
    setSelectedTriadPosition(newPosition);

    // Update CAGED zone to match new position
    if (newPosition.cagedShape) {
      setCurrentCAGEDZone(newPosition.cagedShape);
    }
  };

  const handleNavigateNext = () => {
    if (allTriadPositions.length === 0) return;

    const newIndex = currentPositionIndex >= allTriadPositions.length - 1
      ? 0
      : currentPositionIndex + 1;

    setCurrentPositionIndex(newIndex);
    const newPosition = allTriadPositions[newIndex];
    setSelectedTriadPosition(newPosition);

    // Update CAGED zone to match new position
    if (newPosition.cagedShape) {
      setCurrentCAGEDZone(newPosition.cagedShape);
    }
  };

  // Get custom voicing for selected chord
  const customVoicing = useMemo(() => {
    if (!selectedChord) return undefined;
    return customVoicings.get(selectedChord.id);
  }, [selectedChord, customVoicings]);

  // Filter chords that are playable in the current CAGED zone
  const chordsInZone = useMemo(() => {
    return currentChords.map(chord => {
      const positions = getTriadPositionsForChord(chord, 24, undefined);
      const positionsInZone = positions.filter(pos => pos.cagedShape === currentCAGEDZone);

      return {
        chord,
        isPlayableInZone: positionsInZone.length > 0,
        positionsInZone,
        allPositions: positions, // Include all positions for reference
      };
    });
  }, [currentChords, currentCAGEDZone]);

  // Handle empty chord progression
  if (currentChords.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div
          className="text-center p-12 rounded-lg border-2 border-dashed"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.bgPrimary + '40'
          }}
        >
          <div className="text-6xl mb-4">🎸</div>
          <h3 className="text-xl font-bold mb-2" style={{ color: theme.textPrimary }}>
            No Chord Progression
          </h3>
          <p className="text-sm mb-4" style={{ color: theme.textSecondary }}>
            Create a chord progression in the "Chord Progressions" tab to get started
          </p>
          <p className="text-xs" style={{ color: theme.textSecondary }}>
            Keyboard shortcuts: ← → to navigate chords
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden relative">
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {/* Dual Fretboard Display */}
        <DualFretboardDisplay
          selectedChord={selectedChord}
          selectedScale={selectedScale}
          selectedTriadPosition={selectedTriadPosition}
          onTriadPositionSelect={handleTriadPositionSelect}
          customVoicing={customVoicing}
          theme={theme}
          tuning={tuning}
          stringCount={stringCount}
          showCAGEDGuide={showCAGEDGuide}
          selectedCAGEDShapes={selectedCAGEDShapes}
          currentKey={currentKey}
          currentCAGEDZone={currentCAGEDZone}
          onNavigatePrevious={handleNavigatePrevious}
          onNavigateNext={handleNavigateNext}
          allChords={currentChords}
          selectedChordIndex={selectedChordIndex}
          onChordSelect={handleChordSelect}
          onVoicingChange={handleVoicingChange}
          customVoicings={customVoicings}
          currentTime={currentTime}
          isPlaying={isPlaying}
          onShowChordDiagrams={() => {
            setSidebarActiveTab('triads');
            setShowChordDiagramSidebar(true);
          }}
          onGenerateProgression={onGenerateProgression}
          showColorfulStrings={showColorfulStrings}
          stringBrightness={stringBrightness}
          onFilteredScaleNotesChange={setVisibleScaleNotes}
          onAllowedChordsChange={setAllowedChords}
          hoveredSidebarVoicing={hoveredSidebarVoicing}
        />
      </div>

      {/* Unified Chord Diagram Sidebar with Tabs */}
      <SongChordDiagramSidebar
        theme={theme}
        chordsInZone={chordsInZone}
        selectedTriadPosition={selectedTriadPosition}
        isVisible={showChordDiagramSidebar}
        onClose={() => setShowChordDiagramSidebar(false)}
        tuning={tuning}
        stringCount={stringCount}
        onNavigatePrevious={handleNavigatePrevious}
        onNavigateNext={handleNavigateNext}
        visibleScaleNotes={visibleScaleNotes}
        allowedChords={allowedChords}
        activeTab={sidebarActiveTab}
        onTabChange={setSidebarActiveTab}
        onHoverVoicing={setHoveredSidebarVoicing}
      />
    </div>
  );
}

