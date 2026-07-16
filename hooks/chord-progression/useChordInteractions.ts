/**
 * Robust chord card interaction hook with drag-to-reorder and resize
 * Uses industry-standard drag-and-drop patterns
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { ChordInstance } from '@/lib/chord-progression/types';

export type DragMode = 'move' | 'resize-left' | 'resize-right' | 'resize-left-push' | 'resize-right-push';

interface DragState {
  isDragging: boolean;
  mode: DragMode | null;
  chordId: string | null;
  startX: number;
  startPosition: number;
  startWidth: number;
  originalChords: ChordInstance[];
}

interface SnapIndicator {
  show: boolean;
  position: number;
  type: 'start' | 'end';
  targetChordId: string | null;
}

export function useChordInteractions(
  chords: ChordInstance[],
  onChordsUpdate: (chords: ChordInstance[]) => void,
  pixelsPerBeat: number
) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    mode: null,
    chordId: null,
    startX: 0,
    startPosition: 0,
    startWidth: 0,
    originalChords: [],
  });

  const [snapIndicator, setSnapIndicator] = useState<SnapIndicator>({
    show: false,
    position: 0,
    type: 'start',
    targetChordId: null,
  });

  const rafRef = useRef<number | null>(null);

  /**
   * Snap to grid (quarter beats) - only for move operations
   */
  const snapToGrid = useCallback((value: number): number => {
    const gridSize = pixelsPerBeat / 4; // Snap to 1/4 beat
    return Math.round(value / gridSize) * gridSize;
  }, [pixelsPerBeat]);

  /**
   * Check if a value is close to another value (for snap-to-align)
   */
  const isNearby = useCallback((value: number, target: number, threshold: number = 8): boolean => {
    return Math.abs(value - target) <= threshold;
  }, []);

  /**
   * Find snap target for resize operations
   */
  const findSnapTarget = useCallback((
    currentChordId: string,
    position: number,
    isStart: boolean
  ): { snapPosition: number; targetChordId: string | null } | null => {
    const SNAP_THRESHOLD = 8; // pixels

    for (const chord of chords) {
      if (chord.id === currentChordId) continue;

      const chordStart = chord.position;
      const chordEnd = chord.position + chord.width;

      if (isStart) {
        // Snapping start edge to other chord's start or end
        if (isNearby(position, chordStart, SNAP_THRESHOLD)) {
          return { snapPosition: chordStart, targetChordId: chord.id };
        }
        if (isNearby(position, chordEnd, SNAP_THRESHOLD)) {
          return { snapPosition: chordEnd, targetChordId: chord.id };
        }
      } else {
        // Snapping end edge to other chord's start or end
        if (isNearby(position, chordStart, SNAP_THRESHOLD)) {
          return { snapPosition: chordStart, targetChordId: chord.id };
        }
        if (isNearby(position, chordEnd, SNAP_THRESHOLD)) {
          return { snapPosition: chordEnd, targetChordId: chord.id };
        }
      }
    }

    return null;
  }, [chords, isNearby]);

  /**
   * Start dragging
   */
  const startDrag = useCallback((chordId: string, mode: DragMode, clientX: number) => {
    const chord = chords.find(c => c.id === chordId);
    if (!chord) return;

    setDragState({
      isDragging: true,
      mode,
      chordId,
      startX: clientX,
      startPosition: chord.position,
      startWidth: chord.width,
      originalChords: JSON.parse(JSON.stringify(chords)), // Deep copy
    });
  }, [chords]);

  /**
   * Handle drag movement - Optimized: only updates state, RAF handled by React
   */
  const handleDrag = useCallback((clientX: number) => {
    if (!dragState.isDragging || !dragState.chordId || !dragState.mode) return;

    // Cancel any pending animation frame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // Use requestAnimationFrame for smooth, 60fps updates
    rafRef.current = requestAnimationFrame(() => {
      const deltaX = clientX - dragState.startX;
      const updatedChords = [...dragState.originalChords];
      const chordIndex = updatedChords.findIndex(c => c.id === dragState.chordId);

      if (chordIndex === -1) return;

      const chord = updatedChords[chordIndex];

      if (dragState.mode === 'move') {
        // DRAG TO REORDER - Reorder chords by swapping positions
        const newPosition = snapToGrid(Math.max(0, dragState.startPosition + deltaX));

        // Update dragged chord's visual position (for smooth dragging)
        updatedChords[chordIndex] = {
          ...chord,
          position: newPosition,
          startTime: newPosition / pixelsPerBeat,
        };

        // Find the insertion point based on the center of the dragged chord
        const draggedCenter = newPosition + chord.width / 2;

        // Get all other chords sorted by their original position
        const otherChords = updatedChords
          .map((c, i) => ({ chord: c, originalIndex: i }))
          .filter((_, i) => i !== chordIndex)
          .sort((a, b) => a.chord.position - b.chord.position);

        // Find where to insert the dragged chord
        let insertIndex = 0;
        for (let i = 0; i < otherChords.length; i++) {
          const otherCenter = otherChords[i].chord.position + otherChords[i].chord.width / 2;
          if (draggedCenter > otherCenter) {
            insertIndex = i + 1;
          }
        }

        // Rebuild the chord array in the new order
        const reorderedChords = [...otherChords];
        reorderedChords.splice(insertIndex, 0, { chord: updatedChords[chordIndex], originalIndex: chordIndex });

        // Recalculate positions to place chords sequentially without gaps
        let currentPosition = 0;
        const finalChords = reorderedChords.map(({ chord: c }) => {
          const updatedChord = {
            ...c,
            position: currentPosition,
            startTime: currentPosition / pixelsPerBeat,
          };
          currentPosition += c.width;
          return updatedChord;
        });

        // Update the chords array
        updatedChords.splice(0, updatedChords.length, ...finalChords);

        // Clear snap indicator for move operations
        setSnapIndicator({ show: false, position: 0, type: 'start', targetChordId: null });
      }
      else if (dragState.mode === 'resize-left') {
        // Resize from left edge - SMOOTH with snap-to-align
        let newPosition = Math.max(0, dragState.startPosition + deltaX);
        let newWidth = Math.max(pixelsPerBeat / 4, dragState.startWidth - deltaX);

        // Check for snap targets
        const snapTarget = dragState.chordId ? findSnapTarget(dragState.chordId, newPosition, true) : null;
        if (snapTarget) {
          newPosition = snapTarget.snapPosition;
          newWidth = dragState.startPosition + dragState.startWidth - newPosition;
          setSnapIndicator({
            show: true,
            position: newPosition,
            type: 'start',
            targetChordId: snapTarget.targetChordId || '',
          });
        } else {
          setSnapIndicator({ show: false, position: 0, type: 'start', targetChordId: null });
        }

        updatedChords[chordIndex] = {
          ...chord,
          position: newPosition,
          width: newWidth,
          startTime: newPosition / pixelsPerBeat,
          duration: newWidth / pixelsPerBeat,
        };
      }
      else if (dragState.mode === 'resize-right') {
        // Resize from right edge - SMOOTH with snap-to-align
        let newWidth = Math.max(pixelsPerBeat / 4, dragState.startWidth + deltaX);
        const newEndPosition = dragState.startPosition + newWidth;

        // Check for snap targets
        const snapTarget = dragState.chordId ? findSnapTarget(dragState.chordId, newEndPosition, false) : null;
        if (snapTarget) {
          newWidth = snapTarget.snapPosition - dragState.startPosition;
          setSnapIndicator({
            show: true,
            position: snapTarget.snapPosition,
            type: 'end',
            targetChordId: snapTarget.targetChordId || '',
          });
        } else {
          setSnapIndicator({ show: false, position: 0, type: 'start', targetChordId: null });
        }

        updatedChords[chordIndex] = {
          ...chord,
          width: newWidth,
          duration: newWidth / pixelsPerBeat,
        };
      }
      else if (dragState.mode === 'resize-left-push') {
        // Resize left and push other chords
        const newPosition = snapToGrid(Math.max(0, dragState.startPosition + deltaX));
        const newWidth = snapToGrid(Math.max(pixelsPerBeat / 4, dragState.startWidth - deltaX));
        const pushAmount = newPosition - dragState.startPosition;

        updatedChords[chordIndex] = {
          ...chord,
          position: newPosition,
          width: newWidth,
          startTime: newPosition / pixelsPerBeat,
          duration: newWidth / pixelsPerBeat,
        };

        // Push chords to the left
        updatedChords.forEach((c, i) => {
          if (i !== chordIndex && c.position + c.width <= dragState.startPosition) {
            updatedChords[i] = {
              ...c,
              position: Math.max(0, c.position + pushAmount),
              startTime: Math.max(0, c.position + pushAmount) / pixelsPerBeat,
            };
          }
        });
      }
      else if (dragState.mode === 'resize-right-push') {
        // Resize right and push other chords
        const newWidth = snapToGrid(Math.max(pixelsPerBeat / 4, dragState.startWidth + deltaX));
        const pushAmount = newWidth - dragState.startWidth;

        updatedChords[chordIndex] = {
          ...chord,
          width: newWidth,
          duration: newWidth / pixelsPerBeat,
        };

        // Push chords to the right
        const currentEndPosition = dragState.startPosition + dragState.startWidth;
        updatedChords.forEach((c, i) => {
          if (i !== chordIndex && c.position >= currentEndPosition) {
            updatedChords[i] = {
              ...c,
              position: c.position + pushAmount,
              startTime: (c.position + pushAmount) / pixelsPerBeat,
            };
          }
        });
      }

      // Update chords - React will batch this efficiently
      onChordsUpdate(updatedChords);
    });
  }, [dragState, pixelsPerBeat, snapToGrid, onChordsUpdate, findSnapTarget]);

  /**
   * End dragging
   */
  const endDrag = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    setDragState({
      isDragging: false,
      mode: null,
      chordId: null,
      startX: 0,
      startPosition: 0,
      startWidth: 0,
      originalChords: [],
    });

    // Clear snap indicator
    setSnapIndicator({ show: false, position: 0, type: 'start', targetChordId: null });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    dragState,
    snapIndicator,
    startDrag,
    handleDrag,
    endDrag,
  };
}

