'use client';

/**
 * Hook for displaying notes with the user's preferred notation (sharp/flat)
 */

import { useNoteNotation } from '@/contexts/NoteNotationContext';
import { getNoteDisplayName as baseGetNoteDisplayName, getNotesDisplay as baseGetNotesDisplay } from '@/lib/musicTheory';

export function useNoteDisplay() {
  const { notation } = useNoteNotation();

  /**
   * Get the display name for a note based on user preference
   */
  const getNoteDisplayName = (internalNote: string): string => {
    return baseGetNoteDisplayName(internalNote, notation);
  };

  /**
   * Get the array of display notes based on user preference
   */
  const getNotesDisplay = (): string[] => {
    return baseGetNotesDisplay(notation);
  };

  return {
    notation,
    getNoteDisplayName,
    getNotesDisplay,
  };
}

