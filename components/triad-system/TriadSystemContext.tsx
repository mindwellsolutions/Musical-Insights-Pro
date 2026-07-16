'use client';

/**
 * Triad System Context Provider
 * Manages state for the Pentatonic Triad Anchor System
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type {
  TriadSystemState,
  Note,
  ScaleMode,
  TriadQuality,
  StringSet,
  Inversion,
  Zone,
  TwoNoteMode,
  ViewToggles,
  TriadVoicing,
  ChordProgression,
  PitchClass,
  CAGEDShape
} from '@/lib/music-theory/types';
import { createNote } from '@/lib/music-theory';

// ============================================================================
// Context Type
// ============================================================================

interface TriadSystemContextType {
  state: TriadSystemState;
  setSelectedKey: (key: Note) => void;
  setSelectedMode: (mode: ScaleMode) => void;
  setSelectedQuality: (quality: TriadQuality) => void;
  setSelectedStringSets: (sets: StringSet[]) => void;
  setSelectedInversions: (inversions: Inversion[]) => void;
  setCurrentZone: (zone: Zone | null) => void;
  setTwoNoteMode: (mode: TwoNoteMode) => void;
  setViewToggles: (toggles: Partial<ViewToggles>) => void;
  setSelectedVoicing: (voicing: TriadVoicing | null) => void;
  setCurrentProgression: (progression: ChordProgression | null) => void;
  setSelectedCAGEDShapes: (shapes: CAGEDShape[]) => void;
}

// ============================================================================
// Context Creation
// ============================================================================

const TriadSystemContext = createContext<TriadSystemContextType | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

export function TriadSystemProvider({ children }: { children: React.ReactNode }) {
  // Initialize state with defaults
  const [state, setState] = useState<TriadSystemState>({
    selectedKey: createNote(0 as PitchClass), // C major
    selectedMode: 'major',
    selectedQuality: 'major',
    selectedStringSets: ['123', '234', '345', '456'],
    selectedInversions: ['root', 'first', 'second'],
    currentZone: null,
    twoNoteMode: 'off',
    viewToggles: {
      showPentatonic: true,
      showBarChord: false,
      showEmbellishments: false,
      showVoiceLeading: false,
      showNeighborhood: false,
      showCAGEDShapes: false
    },
    selectedVoicing: null,
    currentProgression: null,
    selectedCAGEDShapes: ['C', 'A', 'G', 'E', 'D']
  });

  // State setters
  const setSelectedKey = useCallback((key: Note) => {
    setState(prev => ({ ...prev, selectedKey: key }));
  }, []);

  const setSelectedMode = useCallback((mode: ScaleMode) => {
    setState(prev => ({ ...prev, selectedMode: mode }));
  }, []);

  const setSelectedQuality = useCallback((quality: TriadQuality) => {
    setState(prev => ({ ...prev, selectedQuality: quality }));
  }, []);

  const setSelectedStringSets = useCallback((sets: StringSet[]) => {
    setState(prev => ({ ...prev, selectedStringSets: sets }));
  }, []);

  const setSelectedInversions = useCallback((inversions: Inversion[]) => {
    setState(prev => ({ ...prev, selectedInversions: inversions }));
  }, []);

  const setCurrentZone = useCallback((zone: Zone | null) => {
    setState(prev => ({ ...prev, currentZone: zone }));
  }, []);

  const setTwoNoteMode = useCallback((mode: TwoNoteMode) => {
    setState(prev => ({ ...prev, twoNoteMode: mode }));
  }, []);

  const setViewToggles = useCallback((toggles: Partial<ViewToggles>) => {
    setState(prev => ({
      ...prev,
      viewToggles: { ...prev.viewToggles, ...toggles }
    }));
  }, []);

  const setSelectedVoicing = useCallback((voicing: TriadVoicing | null) => {
    setState(prev => ({ ...prev, selectedVoicing: voicing }));
  }, []);

  const setCurrentProgression = useCallback((progression: ChordProgression | null) => {
    setState(prev => ({ ...prev, currentProgression: progression }));
  }, []);

  const setSelectedCAGEDShapes = useCallback((shapes: CAGEDShape[]) => {
    setState(prev => ({ ...prev, selectedCAGEDShapes: shapes }));
  }, []);

  // Context value
  const value = useMemo(() => ({
    state,
    setSelectedKey,
    setSelectedMode,
    setSelectedQuality,
    setSelectedStringSets,
    setSelectedInversions,
    setCurrentZone,
    setTwoNoteMode,
    setViewToggles,
    setSelectedVoicing,
    setCurrentProgression,
    setSelectedCAGEDShapes
  }), [
    state,
    setSelectedKey,
    setSelectedMode,
    setSelectedQuality,
    setSelectedStringSets,
    setSelectedInversions,
    setCurrentZone,
    setTwoNoteMode,
    setViewToggles,
    setSelectedVoicing,
    setCurrentProgression,
    setSelectedCAGEDShapes
  ]);

  return (
    <TriadSystemContext.Provider value={value}>
      {children}
    </TriadSystemContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useTriadSystem() {
  const context = useContext(TriadSystemContext);
  if (!context) {
    throw new Error('useTriadSystem must be used within TriadSystemProvider');
  }
  return context;
}

