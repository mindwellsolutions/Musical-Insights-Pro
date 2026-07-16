/**
 * Overlapping Chords Feature - State Management Hook
 * Manages all state for the overlapping chords feature with localStorage persistence
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { 
  OverlappingChordsState, 
  OverlappingChord, 
  CAGEDShape, 
  OverlapType 
} from '@/lib/music-theory/overlapping-chords/types';
import { 
  findChordsInCagedArea, 
  findChordsInScale 
} from '@/lib/music-theory/overlapping-chords/chord-finder';
import { assignChordColors } from '@/lib/music-theory/overlapping-chords/color-manager';

const INITIAL_STATE: OverlappingChordsState = {
  enabled: false,
  mode: 'caged',
  overlapType: 'complete',
  selectedCagedShapes: [],
  cagedPositions: { C: 0, A: 0, G: 0, E: 0, D: 0 },
  selectedScale: null,
  selectedScalePositions: [],
  selectedChords: [],
  savedFretboardState: null,
};

/**
 * Custom hook for managing overlapping chords state
 * @param currentKey Current key from the app
 * @param currentScale Current scale/mode from the app
 * @param stringCount Number of strings on the guitar
 * @param tuning Guitar tuning
 * @returns State and actions for overlapping chords
 */
export function useOverlappingChords(
  currentKey: string,
  currentScale: string,
  stringCount: number = 6,
  tuning: string[] = ['E', 'A', 'D', 'G', 'B', 'E']
) {
  const [state, setState] = useLocalStorage<OverlappingChordsState>(
    'overlapping-chords-state',
    INITIAL_STATE
  );

  // Calculate available chords based on current mode and selections
  const availableChords = useMemo(() => {
    if (!state.enabled) return [];

    if (state.mode === 'caged') {
      if (state.selectedCagedShapes.length === 0) return [];
      return findChordsInCagedArea(
        state.selectedCagedShapes,
        state.cagedPositions,
        state.overlapType,
        stringCount
      );
    } else {
      // Scale mode
      if (!state.selectedScale || state.selectedScalePositions.length === 0) return [];
      return findChordsInScale(
        state.selectedScale.key,
        state.selectedScale.mode,
        state.selectedScalePositions,
        state.overlapType,
        stringCount,
        tuning
      );
    }
  }, [
    state.enabled,
    state.mode,
    state.selectedCagedShapes,
    state.cagedPositions,
    state.selectedScale,
    state.selectedScalePositions,
    state.overlapType,
    stringCount,
    tuning,
  ]);

  // Actions
  const toggleEnabled = useCallback((fretboardState?: any) => {
    setState({
      ...state,
      enabled: !state.enabled,
      savedFretboardState: !state.enabled ? fretboardState : null,
      selectedChords: !state.enabled ? [] : state.selectedChords,
    });
  }, [state, setState]);

  const setMode = useCallback((mode: 'caged' | 'scale') => {
    setState({
      ...state,
      mode,
      selectedChords: [], // Clear selections when switching modes
    });
  }, [state, setState]);

  const setOverlapType = useCallback((overlapType: OverlapType) => {
    setState({ ...state, overlapType });
  }, [state, setState]);

  const toggleCagedShape = useCallback((shape: CAGEDShape) => {
    setState({
      ...state,
      selectedCagedShapes: state.selectedCagedShapes.includes(shape)
        ? state.selectedCagedShapes.filter((s: CAGEDShape) => s !== shape)
        : [...state.selectedCagedShapes, shape],
    });
  }, [state, setState]);

  const setCagedPosition = useCallback((shape: CAGEDShape, position: number) => {
    setState({
      ...state,
      cagedPositions: { ...state.cagedPositions, [shape]: position },
    });
  }, [state, setState]);

  const setScale = useCallback((key: string, mode: string) => {
    setState({
      ...state,
      selectedScale: { key, mode },
    });
  }, [state, setState]);

  const toggleScalePosition = useCallback((position: number) => {
    setState({
      ...state,
      selectedScalePositions: state.selectedScalePositions.includes(position)
        ? state.selectedScalePositions.filter((p: number) => p !== position)
        : [...state.selectedScalePositions, position],
    });
  }, [state, setState]);

  const toggleChordSelection = useCallback((chord: OverlappingChord) => {
    const isSelected = state.selectedChords.some(
      (c: OverlappingChord) => c.rootNote === chord.rootNote && c.quality === chord.quality
    );

    let newSelectedChords: OverlappingChord[];
    if (isSelected) {
      newSelectedChords = state.selectedChords.filter(
        (c: OverlappingChord) => !(c.rootNote === chord.rootNote && c.quality === chord.quality)
      );
    } else {
      newSelectedChords = [...state.selectedChords, { ...chord, isSelected: true }];
    }

    // Assign colors to selected chords
    const colorAssignments = assignChordColors(newSelectedChords);
    newSelectedChords = newSelectedChords.map((c: OverlappingChord, i: number) => ({
      ...c,
      color: colorAssignments[i].color,
    }));

    setState({ ...state, selectedChords: newSelectedChords });
  }, [state, setState]);

  const clearAllSelections = useCallback(() => {
    setState({ ...state, selectedChords: [] });
  }, [state, setState]);

  return {
    state,
    availableChords,
    actions: {
      toggleEnabled,
      setMode,
      setOverlapType,
      toggleCagedShape,
      setCagedPosition,
      setScale,
      toggleScalePosition,
      toggleChordSelection,
      clearAllSelections,
    },
  };
}

