/**
 * Drag and resize hook for chord cards
 */

import { useState, useCallback } from 'react';
import { DragState, ChordInstance } from '@/lib/chord-progression/types';
import { snapToGrid } from '@/lib/chord-progression/timeline-utils';

export function useChordDragResize(
  chords: ChordInstance[],
  onChordsUpdate: (chords: ChordInstance[]) => void,
  pixelsPerBeat: number,
  snapEnabled: boolean = true
) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragType: null,
    chordId: null,
    startX: 0,
    startTime: 0,
    startDuration: 0,
  });

  /**
   * Snap value to nearest grid point
   */
  const snapValue = useCallback((value: number, gridSize: number): number => {
    if (!snapEnabled) return value;
    return snapToGrid(value, gridSize, true);
  }, [snapEnabled]);

  /**
   * Start drag operation
   */
  const handleDragStart = useCallback((
    chordId: string,
    dragType: 'move' | 'resize-left' | 'resize-right' | 'resize-left-push' | 'resize-right-push',
    startX: number
  ) => {
    const chord = chords.find(c => c.id === chordId);
    if (!chord) return;

    setDragState({
      isDragging: true,
      dragType,
      chordId,
      startX,
      startTime: chord.startTime,
      startDuration: chord.duration,
    });
  }, [chords]);

  /**
   * Handle drag movement
   */
  const handleDragMove = useCallback((currentX: number) => {
    if (!dragState.isDragging || !dragState.chordId) return;

    const deltaX = currentX - dragState.startX;
    const deltaBeats = deltaX / pixelsPerBeat;

    const currentChord = chords.find(c => c.id === dragState.chordId);
    if (!currentChord) return;

    let updatedChords = [...chords];

    if (dragState.dragType === 'move') {
      // Move chord
      updatedChords = chords.map(chord => {
        if (chord.id !== dragState.chordId) return chord;

        const newStartTime = snapValue(
          dragState.startTime + deltaBeats,
          0.25 // Snap to 1/4 beat
        );
        return {
          ...chord,
          startTime: Math.max(0, newStartTime),
          position: Math.max(0, newStartTime) * pixelsPerBeat,
        };
      });
    } else if (dragState.dragType === 'resize-left') {
      // Resize from left - Overwrite mode (shrink only or expand over other chords)
      const newStartTime = snapValue(
        dragState.startTime + deltaBeats,
        0.25
      );
      const newDuration = snapValue(
        dragState.startDuration - deltaBeats,
        0.25
      );

      if (newDuration < 0.25) return; // Min duration: 1/4 beat

      updatedChords = chords.map(chord => {
        if (chord.id !== dragState.chordId) return chord;

        return {
          ...chord,
          startTime: newStartTime,
          duration: newDuration,
          position: newStartTime * pixelsPerBeat,
          width: newDuration * pixelsPerBeat,
        };
      });
    } else if (dragState.dragType === 'resize-right') {
      // Resize from right - Overwrite mode (expand over other chords)
      const newDuration = snapValue(
        dragState.startDuration + deltaBeats,
        0.25
      );

      if (newDuration < 0.25) return; // Min duration: 1/4 beat

      updatedChords = chords.map(chord => {
        if (chord.id !== dragState.chordId) return chord;

        return {
          ...chord,
          duration: newDuration,
          width: newDuration * pixelsPerBeat,
        };
      });
    } else if (dragState.dragType === 'resize-left-push') {
      // Resize from left - Push mode (push other chords to the left)
      const newStartTime = snapValue(
        dragState.startTime + deltaBeats,
        0.25
      );
      const newDuration = snapValue(
        dragState.startDuration - deltaBeats,
        0.25
      );

      if (newDuration < 0.25) return; // Min duration: 1/4 beat

      const pushAmount = newStartTime - dragState.startTime;

      updatedChords = chords.map(chord => {
        if (chord.id === dragState.chordId) {
          return {
            ...chord,
            startTime: newStartTime,
            duration: newDuration,
            position: newStartTime * pixelsPerBeat,
            width: newDuration * pixelsPerBeat,
          };
        }
        // Push chords that are to the left of the current chord
        if (chord.startTime + chord.duration <= dragState.startTime) {
          const newChordStartTime = chord.startTime + pushAmount;
          return {
            ...chord,
            startTime: Math.max(0, newChordStartTime),
            position: Math.max(0, newChordStartTime) * pixelsPerBeat,
          };
        }
        return chord;
      });
    } else if (dragState.dragType === 'resize-right-push') {
      // Resize from right - Push mode (push other chords to the right)
      const newDuration = snapValue(
        dragState.startDuration + deltaBeats,
        0.25
      );

      if (newDuration < 0.25) return; // Min duration: 1/4 beat

      const currentEndTime = dragState.startTime + dragState.startDuration;
      const newEndTime = dragState.startTime + newDuration;
      const pushAmount = newEndTime - currentEndTime;

      updatedChords = chords.map(chord => {
        if (chord.id === dragState.chordId) {
          return {
            ...chord,
            duration: newDuration,
            width: newDuration * pixelsPerBeat,
          };
        }
        // Push chords that are to the right of the current chord
        if (chord.startTime >= currentEndTime) {
          const newChordStartTime = chord.startTime + pushAmount;
          return {
            ...chord,
            startTime: newChordStartTime,
            position: newChordStartTime * pixelsPerBeat,
          };
        }
        return chord;
      });
    }

    onChordsUpdate(updatedChords);
  }, [dragState, chords, pixelsPerBeat, snapValue, onChordsUpdate]);

  /**
   * End drag operation
   */
  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      dragType: null,
      chordId: null,
      startX: 0,
      startTime: 0,
      startDuration: 0,
    });
  }, []);

  return {
    dragState,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
}

