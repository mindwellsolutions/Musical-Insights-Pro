/**
 * Main state management hook for Chord Progression Builder
 */

import { useState, useCallback, useEffect } from 'react';
import { VerseData, ChordInstance, ScaleModeInstance } from '@/lib/chord-progression/types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'chord-progression-builder-state';

interface ChordProgressionState {
  verses: VerseData[];
  activeVerseId: string | null;
}

export function useChordProgressionState() {
  const [state, setState] = useState<ChordProgressionState>({
    verses: [],
    activeVerseId: null,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setState(parsed);
      } catch (error) {
        console.error('Failed to parse stored state:', error);
      }
    } else {
      // Create default verse if none exists
      const defaultVerse = createDefaultVerse();
      setState({
        verses: [defaultVerse],
        activeVerseId: defaultVerse.id,
      });
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (state.verses.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  // Get active verse
  const activeVerse = state.verses.find(v => v.id === state.activeVerseId) || state.verses[0];

  // Add new verse
  const addVerse = useCallback((name?: string, key?: string) => {
    const newVerse = createDefaultVerse(name, key);
    setState(prev => ({
      verses: [...prev.verses, newVerse],
      activeVerseId: newVerse.id,
    }));
    return newVerse;
  }, []);

  // Update verse
  const updateVerse = useCallback((verseId: string, updates: Partial<VerseData>) => {
    setState(prev => ({
      ...prev,
      verses: prev.verses.map(v =>
        v.id === verseId
          ? { ...v, ...updates, updatedAt: new Date().toISOString() }
          : v
      ),
    }));
  }, []);

  // Delete verse
  const deleteVerse = useCallback((verseId: string) => {
    setState(prev => {
      const newVerses = prev.verses.filter(v => v.id !== verseId);
      const newActiveId = prev.activeVerseId === verseId
        ? (newVerses[0]?.id || null)
        : prev.activeVerseId;
      
      return {
        verses: newVerses,
        activeVerseId: newActiveId,
      };
    });
  }, []);

  // Set active verse
  const setActiveVerse = useCallback((verseId: string) => {
    setState(prev => ({ ...prev, activeVerseId: verseId }));
  }, []);

  // Update chords in active verse
  const updateChords = useCallback((chords: ChordInstance[]) => {
    if (!state.activeVerseId) return;
    
    setState(prev => ({
      ...prev,
      verses: prev.verses.map(v =>
        v.id === state.activeVerseId
          ? { ...v, chordProgression: chords, updatedAt: new Date().toISOString() }
          : v
      ),
    }));
  }, [state.activeVerseId]);

  // Update scale/mode assignments in active verse
  const updateScaleModes = useCallback((scaleModes: ScaleModeInstance[]) => {
    if (!state.activeVerseId) return;
    
    setState(prev => ({
      ...prev,
      verses: prev.verses.map(v =>
        v.id === state.activeVerseId
          ? { ...v, scaleModeAssignments: scaleModes, updatedAt: new Date().toISOString() }
          : v
      ),
    }));
  }, [state.activeVerseId]);

  // Clear all data
  const clearAll = useCallback(() => {
    const defaultVerse = createDefaultVerse();
    setState({
      verses: [defaultVerse],
      activeVerseId: defaultVerse.id,
    });
  }, []);

  // Set all verses (for loading projects)
  const setVerses = useCallback((newVerses: VerseData[]) => {
    setState({
      verses: newVerses,
      activeVerseId: newVerses.length > 0 ? newVerses[0].id : null,
    });
  }, []);

  return {
    verses: state.verses,
    activeVerse,
    activeVerseId: state.activeVerseId,
    addVerse,
    updateVerse,
    deleteVerse,
    setActiveVerse,
    updateChords,
    updateScaleModes,
    clearAll,
    setVerses,
  };
}

/**
 * Create a default verse
 */
function createDefaultVerse(name?: string, key?: string): VerseData {
  return {
    id: uuidv4(),
    name: name || 'Verse 1',
    key: key || 'C',
    bpm: 120,
    timeSignature: {
      numerator: 4,
      denominator: 4,
    },
    chordProgression: [],
    scaleModeAssignments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

