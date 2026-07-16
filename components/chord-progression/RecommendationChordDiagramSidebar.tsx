'use client';

import { useMemo, useState } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { X, Music } from 'lucide-react';
import ChordDiagram from '@/components/ChordDiagram';
import { ChordVoicing } from '@/lib/chord-voicings';
import { NOTE_COLORS } from '@/lib/musicTheory';
import { generateChordVoicing, parseChordSymbol } from '@/lib/chord-progression/chord-utils';
import { getStandardChordVoicings } from '@/lib/chord-database';

interface ChordProgressionRecommendation {
  id: string;
  progression: string[];
  name: string;
  rationale: string;
  musicTheoryBasis: string;
  mood: string;
  complexity: number;
}

interface RecommendationChordDiagramSidebarProps {
  theme: ThemeConfig;
  progression: ChordProgressionRecommendation | null;
  isVisible?: boolean;
  onClose?: () => void;
  tuning?: string[];
  stringCount?: number;
  maxFret?: number; // Maximum fret to show voicings for (default 24)
}

export default function RecommendationChordDiagramSidebar({
  theme,
  progression,
  isVisible = true,
  onClose,
  tuning = ['E', 'A', 'D', 'G', 'B', 'E'],
  stringCount = 6,
  maxFret = 24, // Default to 24 frets to include octave positions
}: RecommendationChordDiagramSidebarProps) {
  // State for selected chord and position
  const [selectedChordIndex, setSelectedChordIndex] = useState<number | null>(null);
  const [selectedPositionTab, setSelectedPositionTab] = useState<string>('all');

  // Helper function to organize voicings by fret position
  const organizeVoicingsByPosition = (voicings: ChordVoicing[]) => {
    // Group voicings by approximate fret position (in groups of 3 frets)
    const positionGroups: { [key: string]: ChordVoicing[] } = {};

    voicings.forEach(voicing => {
      // Only include voicings within the max fret range
      if (voicing.startFret > maxFret) return;

      const positionKey = Math.floor(voicing.startFret / 3);
      const positionName = voicing.startFret === 0
        ? 'Open'
        : `Fret ${positionKey * 3}-${(positionKey + 1) * 3}`;

      if (!positionGroups[positionName]) {
        positionGroups[positionName] = [];
      }
      positionGroups[positionName].push(voicing);
    });

    return Object.entries(positionGroups).map(([name, voicings]) => ({
      name,
      voicings: voicings.sort((a, b) => a.startFret - b.startFret),
    }));
  };

  // Calculate chord voicings organized by fret positions
  const chordVoicingsData = useMemo(() => {
    if (!progression) return [];

    return progression.progression.map((chordSymbol) => {
      const { rootNote, quality } = parseChordSymbol(chordSymbol);
      const chordNotes = generateChordVoicing(chordSymbol);

      // Get all standard voicings from the database
      const allVoicings = getStandardChordVoicings(rootNote, quality, tuning);

      // Organize voicings by fret position
      const positionGroups = organizeVoicingsByPosition(allVoicings);

      return {
        chordSymbol,
        chordNotes,
        rootNote,
        quality,
        allVoicings,
        positionGroups,
      };
    });
  }, [progression, tuning]);

  // Get the currently selected chord's voicing data
  const selectedChordData = useMemo(() => {
    if (selectedChordIndex === null || !chordVoicingsData[selectedChordIndex]) {
      return null;
    }
    return chordVoicingsData[selectedChordIndex];
  }, [selectedChordIndex, chordVoicingsData]);

  // Get voicings for the selected position tab
  const displayedVoicings = useMemo(() => {
    if (!selectedChordData) return [];

    if (selectedPositionTab === 'all') {
      // Show all voicings (limit to first 8 for performance)
      return selectedChordData.allVoicings.slice(0, 8);
    } else {
      // Show voicings for specific position group
      const positionGroup = selectedChordData.positionGroups.find(
        g => g.name === selectedPositionTab
      );
      return positionGroup?.voicings || [];
    }
  }, [selectedChordData, selectedPositionTab]);

  if (!isVisible || !progression) return null;

  return (
    <div
      className="fixed right-0 flex flex-col shadow-2xl"
      style={{
        width: '420px',
        top: '64px', // Start immediately below header (h-16 = 64px)
        bottom: '48px', // End above playback controls (h-12 = 48px)
        height: 'auto', // Let top and bottom define the height
        background: 'linear-gradient(to bottom, #1a1a1a, #0f0f0f)',
        borderLeft: `2px solid ${theme.border}`,
        zIndex: 'var(--cpb-z-right-sidebar)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: theme.border }}
      >
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5" style={{ color: theme.accentPrimary }} />
          <h3 className="text-base font-bold" style={{ color: theme.textPrimary }}>
            Chord Diagrams
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-opacity-80 transition-all"
            style={{
              color: theme.textSecondary,
              background: theme.bgTertiary,
            }}
            title="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progression Name */}
      <div className="px-4 py-3 border-b" style={{ borderColor: theme.border }}>
        <h4 className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
          {progression.name}
        </h4>
        <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>
          {progression.progression.join(' → ')}
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {chordVoicingsData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <Music className="w-12 h-12 mb-3" style={{ color: theme.textSecondary }} />
            <p className="text-sm text-center" style={{ color: theme.textSecondary }}>
              No chord diagrams available
            </p>
          </div>
        ) : selectedChordIndex === null ? (
          /* Chord Selection Grid - Initial View */
          <div className="p-4">
            <p className="text-xs mb-3" style={{ color: theme.textSecondary }}>
              Select a chord to view all positions:
            </p>
            <div className="grid grid-cols-2 gap-4">
              {chordVoicingsData.map((data, index) => {
                const chordColor = NOTE_COLORS[data.rootNote] || '#6b7280';
                const firstVoicing = data.allVoicings[0];

                return (
                  <button
                    key={`chord-${index}`}
                    onClick={() => {
                      setSelectedChordIndex(index);
                      setSelectedPositionTab('all');
                    }}
                    className="rounded-lg p-4 flex flex-col items-center gap-2 overflow-hidden hover:opacity-80 transition-opacity cursor-pointer"
                    style={{
                      background: theme.bgTertiary,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    {/* Chord Symbol */}
                    <div
                      className="w-full rounded-lg px-3 py-2 flex items-center justify-center gap-2"
                      style={{
                        background: chordColor,
                        boxShadow: `0 0 8px ${chordColor}66`,
                      }}
                    >
                      <span className="text-sm font-bold text-white">
                        {data.chordSymbol}
                      </span>
                    </div>

                    {/* Chord Diagram Preview */}
                    {firstVoicing ? (
                      <ChordDiagram
                        voicing={firstVoicing}
                        theme={theme}
                        stringCount={stringCount}
                        compact={true}
                      />
                    ) : (
                      <div className="text-xs text-center py-4" style={{ color: theme.textSecondary }}>
                        No voicing available
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Position Tabs and Diagrams - Detail View */
          <div className="flex flex-col h-full">
            {/* Back Button and Chord Title */}
            <div className="px-4 py-3 border-b" style={{ borderColor: theme.border }}>
              <button
                onClick={() => {
                  setSelectedChordIndex(null);
                  setSelectedPositionTab('all');
                }}
                className="px-3 py-2 rounded-lg mb-3 text-sm font-medium hover:opacity-90 transition-all flex items-center gap-2"
                style={{
                  background: theme.bgTertiary,
                  color: theme.accentPrimary,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <span>←</span>
                <span>Back to all chords</span>
              </button>
              <h4 className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
                {selectedChordData?.chordSymbol} - All Positions
              </h4>
            </div>

            {/* Position Tabs - Multi-row Grid Layout */}
            <div className="px-4 py-3 border-b" style={{ borderColor: theme.border }}>
              <div className="grid grid-cols-3 gap-2">
                {/* All Positions Tab */}
                <button
                  onClick={() => setSelectedPositionTab('all')}
                  className="px-3 py-2 rounded text-xs font-medium transition-all"
                  style={{
                    background: selectedPositionTab === 'all' ? theme.accentPrimary : theme.bgTertiary,
                    color: selectedPositionTab === 'all' ? '#ffffff' : theme.textSecondary,
                    border: `1px solid ${selectedPositionTab === 'all' ? theme.accentPrimary : theme.border}`,
                  }}
                >
                  All ({selectedChordData?.allVoicings.length || 0})
                </button>

                {/* Position Group Tabs */}
                {selectedChordData?.positionGroups.map((positionGroup) => (
                  <button
                    key={positionGroup.name}
                    onClick={() => setSelectedPositionTab(positionGroup.name)}
                    className="px-3 py-2 rounded text-xs font-medium transition-all"
                    style={{
                      background: selectedPositionTab === positionGroup.name ? theme.accentPrimary : theme.bgTertiary,
                      color: selectedPositionTab === positionGroup.name ? '#ffffff' : theme.textSecondary,
                      border: `1px solid ${selectedPositionTab === positionGroup.name ? theme.accentPrimary : theme.border}`,
                    }}
                  >
                    {positionGroup.name} ({positionGroup.voicings.length})
                  </button>
                ))}
              </div>
            </div>

            {/* Chord Diagrams for Selected Position */}
            <div className="flex-1 overflow-y-auto p-4">
              {displayedVoicings.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Music className="w-12 h-12 mb-3" style={{ color: theme.textSecondary }} />
                  <p className="text-sm text-center" style={{ color: theme.textSecondary }}>
                    No voicings available for this position
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {displayedVoicings.map((voicing, index) => {
                    const chordColor = NOTE_COLORS[selectedChordData?.rootNote || ''] || '#6b7280';

                    return (
                      <div
                        key={`voicing-${index}`}
                        className="rounded-lg p-4 flex flex-col items-center gap-2 overflow-hidden"
                        style={{
                          background: theme.bgTertiary,
                          border: `1px solid ${theme.border}`,
                        }}
                      >
                        {/* Position Label */}
                        <div
                          className="w-full rounded-lg px-2 py-1 text-center"
                          style={{
                            background: chordColor + '33',
                            border: `1px solid ${chordColor}66`,
                          }}
                        >
                          <span className="text-xs font-medium" style={{ color: theme.textPrimary }}>
                            {voicing.commonName || `Fret ${voicing.startFret}`}
                          </span>
                        </div>

                        {/* Chord Diagram */}
                        <ChordDiagram
                          voicing={voicing}
                          theme={theme}
                          stringCount={stringCount}
                          compact={true}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

