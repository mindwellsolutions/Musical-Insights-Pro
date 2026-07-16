/**
 * Overlapping Chords Container Component
 * Main container that orchestrates all sub-components
 */

'use client';

import { useEffect } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { useOverlappingChords } from '@/hooks/use-overlapping-chords';
import OverlappingChordsToggle from './OverlappingChordsToggle';
import ModeSelector from './ModeSelector';
import CagedModeControls from './CagedModeControls';
import ScaleModeControls from './ScaleModeControls';
import ChordDisplaySection from './ChordDisplaySection';

interface OverlappingChordsContainerProps {
  theme: ThemeConfig;
  currentKey: string;
  currentScale: string;
  stringCount: number;
  tuning: string[];
  onFretboardDataChange: (data: any) => void;
}

export default function OverlappingChordsContainer({
  theme,
  currentKey,
  currentScale,
  stringCount,
  tuning,
  onFretboardDataChange,
}: OverlappingChordsContainerProps) {
  const { state, availableChords, actions } = useOverlappingChords(
    currentKey,
    currentScale,
    stringCount,
    tuning
  );

  // Update fretboard when selected chords change
  useEffect(() => {
    if (state.enabled && state.selectedChords.length > 0) {
      onFretboardDataChange({
        type: 'overlapping-chords',
        chords: state.selectedChords,
        mode: state.mode,
        cagedShapes: state.selectedCagedShapes,
        cagedPositions: state.cagedPositions,
        scalePositions: state.selectedScalePositions,
      });
    } else if (!state.enabled && state.savedFretboardState) {
      // Restore saved fretboard state
      onFretboardDataChange(state.savedFretboardState);
    }
  }, [state.enabled, state.selectedChords, state.mode, onFretboardDataChange]);

  return (
    <div
      className="p-4 rounded-lg"
      style={{
        background: theme.bgSecondary,
        border: `1px solid ${theme.border}`,
      }}
    >
      {/* Toggle */}
      <OverlappingChordsToggle
        theme={theme}
        enabled={state.enabled}
        onToggle={actions.toggleEnabled}
      />

      {/* Show controls only when enabled */}
      {state.enabled && (
        <>
          {/* Mode Selector */}
          <ModeSelector
            theme={theme}
            mode={state.mode}
            onModeChange={actions.setMode}
          />

          {/* CAGED Mode Controls */}
          {state.mode === 'caged' && (
            <CagedModeControls
              theme={theme}
              selectedShapes={state.selectedCagedShapes}
              positions={state.cagedPositions}
              overlapType={state.overlapType}
              onToggleShape={actions.toggleCagedShape}
              onSetPosition={actions.setCagedPosition}
              onSetOverlapType={actions.setOverlapType}
            />
          )}

          {/* Scale Mode Controls */}
          {state.mode === 'scale' && (
            <ScaleModeControls
              theme={theme}
              currentKey={currentKey}
              currentScale={currentScale}
              selectedScale={state.selectedScale}
              selectedPositions={state.selectedScalePositions}
              overlapType={state.overlapType}
              onSetScale={actions.setScale}
              onTogglePosition={actions.toggleScalePosition}
              onSetOverlapType={actions.setOverlapType}
            />
          )}

          {/* Chord Display Section */}
          <ChordDisplaySection
            theme={theme}
            availableChords={availableChords}
            selectedChords={state.selectedChords}
            onToggleChord={actions.toggleChordSelection}
            onClearAll={actions.clearAllSelections}
          />
        </>
      )}
    </div>
  );
}

