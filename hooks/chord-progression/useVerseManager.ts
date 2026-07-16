/**
 * Verse management hook for CRUD operations
 */

import { useCallback } from 'react';
import { VerseData } from '@/lib/chord-progression/types';
import { v4 as uuidv4 } from 'uuid';

export function useVerseManager(
  verses: VerseData[],
  onUpdate: (verses: VerseData[]) => void
) {
  // Create new verse
  const createVerse = useCallback((name: string, key: string) => {
    const newVerse: VerseData = {
      id: uuidv4(),
      name,
      key,
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
    
    onUpdate([...verses, newVerse]);
    return newVerse;
  }, [verses, onUpdate]);

  // Rename verse
  const renameVerse = useCallback((verseId: string, newName: string) => {
    const updated = verses.map(v =>
      v.id === verseId
        ? { ...v, name: newName, updatedAt: new Date().toISOString() }
        : v
    );
    onUpdate(updated);
  }, [verses, onUpdate]);

  // Duplicate verse
  const duplicateVerse = useCallback((verseId: string) => {
    const verse = verses.find(v => v.id === verseId);
    if (!verse) return null;
    
    const duplicated: VerseData = {
      ...verse,
      id: uuidv4(),
      name: `${verse.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    onUpdate([...verses, duplicated]);
    return duplicated;
  }, [verses, onUpdate]);

  // Delete verse
  const deleteVerse = useCallback((verseId: string) => {
    const updated = verses.filter(v => v.id !== verseId);
    onUpdate(updated);
  }, [verses, onUpdate]);

  // Update verse key
  const updateVerseKey = useCallback((verseId: string, newKey: string) => {
    const updated = verses.map(v =>
      v.id === verseId
        ? { ...v, key: newKey, updatedAt: new Date().toISOString() }
        : v
    );
    onUpdate(updated);
  }, [verses, onUpdate]);

  // Update verse BPM
  const updateVerseBPM = useCallback((verseId: string, newBPM: number) => {
    const updated = verses.map(v =>
      v.id === verseId
        ? { ...v, bpm: newBPM, updatedAt: new Date().toISOString() }
        : v
    );
    onUpdate(updated);
  }, [verses, onUpdate]);

  // Reorder verses
  const reorderVerses = useCallback((startIndex: number, endIndex: number) => {
    const result = Array.from(verses);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    onUpdate(result);
  }, [verses, onUpdate]);

  return {
    createVerse,
    renameVerse,
    duplicateVerse,
    deleteVerse,
    updateVerseKey,
    updateVerseBPM,
    reorderVerses,
  };
}

