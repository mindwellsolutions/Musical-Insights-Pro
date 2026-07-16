'use client';

/**
 * Main Triad System Component
 * Replaces the old TriadTab with the new Pentatonic Triad Anchor System
 */

import React from 'react';
import { TriadSystemProvider, useTriadSystem } from './TriadSystemContext';
import { useVoicings } from './hooks/useVoicings';
import { useFretboardData } from './hooks/useFretboardData';
import { KeySelector } from './ControlPanel/KeySelector';
import { StringSetFilter } from './ControlPanel/StringSetFilter';
import { InversionFilter } from './ControlPanel/InversionFilter';
import { ViewToggles } from './ControlPanel/ViewToggles';
import { TwoNoteMode } from './ControlPanel/TwoNoteMode';
import { CAGEDShapeSelector } from './ControlPanel/CAGEDShapeSelector';
import { CAGEDOverlay } from './CAGEDOverlay';
import { ZoneNavigator } from './ZoneNavigator/ZoneNavigator';
import { InfoButton } from './InfoButton';
import type { ThemeConfig } from '@/lib/themes';

interface TriadSystemMainProps {
  theme: ThemeConfig;
  onTriadDataChange?: (data: any) => void;
  onFretboardDataChange?: (data: any) => void;
}

function TriadSystemContent({ theme, onTriadDataChange, onFretboardDataChange }: TriadSystemMainProps) {
  const { state } = useTriadSystem();

  // Get voicings data
  const voicingsData = useVoicings({
    key: state.selectedKey.pitchClass,
    mode: state.selectedMode,
    quality: state.selectedQuality,
    stringSets: state.selectedStringSets,
    inversions: state.selectedInversions,
    currentZone: state.currentZone,
    selectedCAGEDShapes: state.selectedCAGEDShapes,
    showCAGEDShapes: state.viewToggles.showCAGEDShapes
  });

  // Get fretboard display data
  const fretboardData = useFretboardData();

  // Use refs to track previous values and prevent unnecessary updates
  const prevTriadDataRef = React.useRef<string>('');
  const prevFretboardDataRef = React.useRef<string>('');

  // Notify parent of triad data changes only when data actually changes
  React.useEffect(() => {
    if (onTriadDataChange) {
      const currentData = {
        triad: voicingsData.triad,
        voicings: voicingsData.filteredVoicings,
        pentatonicScale: voicingsData.pentatonicScale,
        currentZone: state.currentZone
      };

      // Serialize to compare deep equality
      const currentDataStr = JSON.stringify(currentData);

      if (currentDataStr !== prevTriadDataRef.current) {
        prevTriadDataRef.current = currentDataStr;
        onTriadDataChange(currentData);
      }
    }
  }, [
    voicingsData.triad,
    voicingsData.filteredVoicings,
    voicingsData.pentatonicScale,
    state.currentZone,
    onTriadDataChange
  ]);

  // Notify parent of fretboard data changes only when data actually changes
  React.useEffect(() => {
    if (onFretboardDataChange) {
      const currentDataStr = JSON.stringify(fretboardData);

      if (currentDataStr !== prevFretboardDataRef.current) {
        prevFretboardDataRef.current = currentDataStr;
        onFretboardDataChange(fretboardData);
      }
    }
  }, [fretboardData, onFretboardDataChange]);

  return (
    <div 
      className="rounded-lg p-4"
      style={{
        background: theme.bgSecondary,
        border: `1px solid ${theme.border}`
      }}
    >
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <h2
            className="text-xl font-bold"
            style={{ color: theme.textPrimary }}
          >
            Pentatonic Triad Anchor System
          </h2>
          <InfoButton theme={theme} />
        </div>
        <p
          className="text-sm"
          style={{ color: theme.textSecondary }}
        >
          Visualize triads within pentatonic scale boxes across the fretboard
        </p>
      </div>

      {/* CAGED Overlay Display */}
      {state.viewToggles.showCAGEDShapes && fretboardData.cagedOverlayZones.length > 0 && (
        <CAGEDOverlay
          theme={theme}
          overlayZones={fretboardData.cagedOverlayZones}
        />
      )}

      {/* Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          <KeySelector theme={theme} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StringSetFilter theme={theme} />
            <TwoNoteMode theme={theme} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <ViewToggles theme={theme} />
          {state.viewToggles.showCAGEDShapes && (
            <CAGEDShapeSelector theme={theme} />
          )}
          <InversionFilter theme={theme} />
          <ZoneNavigator theme={theme} />
        </div>
      </div>
    </div>
  );
}

export default function TriadSystemMain(props: TriadSystemMainProps) {
  return (
    <TriadSystemProvider>
      <TriadSystemContent {...props} />
    </TriadSystemProvider>
  );
}

