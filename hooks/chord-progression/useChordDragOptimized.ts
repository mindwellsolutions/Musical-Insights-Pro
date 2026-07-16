/**
 * Optimized chord drag hook using CSS transforms for instant visual feedback
 * Only updates React state on drag end for maximum performance
 */

import { useState, useCallback, useRef } from 'react';
import { ChordInstance } from '@/lib/chord-progression/types';

export type DragMode = 'move' | 'resize-left' | 'resize-right' | 'resize-left-push' | 'resize-right-push';

interface DragState {
  isDragging: boolean;
  mode: DragMode | null;
  chordId: string | null;
  startX: number;
  currentX: number;
  startPosition: number;
  startWidth: number;
}

interface SnapIndicator {
  show: boolean;
  position: number;
  type: 'start' | 'end';
  targetChordId: string | null;
}

interface InsertionPreview {
  show: boolean;
  position: number;
}

export function useChordDragOptimized(
  chords: ChordInstance[],
  onChordsUpdate: (chords: ChordInstance[]) => void,
  pixelsPerBeat: number,
  /** Lifted from parent — shared across chord + scale tracks */
  selectedChordIds: Set<string>,
  setSelectedChordIds: (ids: Set<string>) => void,
  /** Clears the full cross-track selection (chord + scale) */
  clearAllSelections: () => void,
) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    mode: null,
    chordId: null,
    startX: 0,
    currentX: 0,
    startPosition: 0,
    startWidth: 0,
  });

  const [snapIndicator, setSnapIndicator] = useState<SnapIndicator>({
    show: false,
    position: 0,
    type: 'start',
    targetChordId: null,
  });

  const [insertionPreview, setInsertionPreview] = useState<InsertionPreview>({
    show: false,
    position: 0,
  });

  // selectedChordIds is now managed externally (see useTimelineSelection)

  // Selection box state for drag-to-select
  const [selectionBox, setSelectionBox] = useState<{
    isSelecting: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  }>({
    isSelecting: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  const originalChordsRef = useRef<ChordInstance[]>([]);
  const selectedChordsStartPositions = useRef<Map<string, number>>(new Map());
  const currentXRef = useRef<number>(0); // Track currentX synchronously for immediate visual feedback

  /**
   * Snap to grid (quarter beats)
   */
  const snapToGrid = useCallback((value: number): number => {
    const gridSize = pixelsPerBeat / 4;
    return Math.round(value / gridSize) * gridSize;
  }, [pixelsPerBeat]);

  /**
   * Check if near another chord for snapping
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
    const SNAP_THRESHOLD = 8;

    for (const chord of chords) {
      if (chord.id === currentChordId) continue;

      const chordStart = chord.position;
      const chordEnd = chord.position + chord.width;

      if (isStart) {
        if (isNearby(position, chordStart, SNAP_THRESHOLD)) {
          return { snapPosition: chordStart, targetChordId: chord.id };
        }
        if (isNearby(position, chordEnd, SNAP_THRESHOLD)) {
          return { snapPosition: chordEnd, targetChordId: chord.id };
        }
      } else {
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
   * Start dragging - no state updates, just track initial values
   */
  const startDrag = useCallback((chordId: string, mode: DragMode, clientX: number) => {
    const chord = chords.find(c => c.id === chordId);
    if (!chord) return;

    originalChordsRef.current = JSON.parse(JSON.stringify(chords));
    currentXRef.current = clientX; // Initialize ref

    // Store start positions for all selected chords for multi-select drag
    if (mode === 'move' && selectedChordIds.has(chordId)) {
      selectedChordsStartPositions.current.clear();
      chords.forEach(c => {
        if (selectedChordIds.has(c.id)) {
          selectedChordsStartPositions.current.set(c.id, c.position);
        }
      });
    }

    setDragState({
      isDragging: true,
      mode,
      chordId,
      startX: clientX,
      currentX: clientX,
      startPosition: chord.position,
      startWidth: chord.width,
    });
  }, [chords, selectedChordIds]);

  /**
   * Handle drag - update currentX and calculate insertion preview for move operations
   */
  const handleDrag = useCallback((clientX: number) => {
    if (!dragState.isDragging) return;

    // Update ref immediately for synchronous access in getChordTransform
    currentXRef.current = clientX;

    setDragState(prev => ({
      ...prev,
      currentX: clientX,
    }));

    // Show insertion preview line for move operations
    if (dragState.mode === 'move' && dragState.chordId) {
      const deltaX = clientX - dragState.startX;

      // Check if we're dragging multiple selected chords
      const isMultiSelect = selectedChordIds.size > 1 && selectedChordIds.has(dragState.chordId);

      if (isMultiSelect) {
        // For multi-select, show the preview at the start of where the group will be placed
        const draggedChordOriginal = originalChordsRef.current.find(c => c.id === dragState.chordId);
        if (draggedChordOriginal) {
          const draggedTargetPosition = snapToGrid(Math.max(0, draggedChordOriginal.position + deltaX));

          // Find all selected chords and sort by original position
          const selectedChords = originalChordsRef.current
            .filter(c => selectedChordIds.has(c.id))
            .sort((a, b) => a.position - b.position);

          // Calculate offset from dragged chord to the start of the group
          const groupStartOffset = draggedChordOriginal.position - selectedChords[0].position;
          const groupTargetStartPosition = Math.max(0, draggedTargetPosition - groupStartOffset);

          setInsertionPreview({
            show: true,
            position: groupTargetStartPosition,
          });
        }
      } else {
        // Single chord - show preview at the dragged chord's position
        const newPosition = snapToGrid(Math.max(0, dragState.startPosition + deltaX));
        setInsertionPreview({
          show: true,
          position: newPosition,
        });
      }
    } else {
      setInsertionPreview({ show: false, position: 0 });
    }
  }, [dragState.isDragging, dragState.mode, dragState.chordId, dragState.startX, dragState.startPosition, snapToGrid, selectedChordIds]);

  /**
   * Detect collision and calculate push offset for other blocks
   */
  const getCollisionPushOffset = useCallback((chordId: string): number => {
    if (!dragState.isDragging || dragState.mode !== 'move' || !dragState.chordId) {
      return 0;
    }

    // Don't push the dragged chord itself
    if (chordId === dragState.chordId) {
      return 0;
    }

    const deltaX = dragState.currentX - dragState.startX;
    const draggedChord = chords.find(c => c.id === dragState.chordId);
    const targetChord = chords.find(c => c.id === chordId);

    if (!draggedChord || !targetChord) return 0;

    // Calculate new position of dragged chord
    const newDraggedPosition = Math.max(0, dragState.startPosition + deltaX);
    const newDraggedEnd = newDraggedPosition + draggedChord.width;

    // Check if dragged chord overlaps with target chord
    const targetStart = targetChord.position;
    const targetEnd = targetChord.position + targetChord.width;

    // If dragged chord overlaps target, push target to the right
    if (newDraggedPosition < targetEnd && newDraggedEnd > targetStart) {
      // Push target so its start aligns with dragged chord's end
      const pushOffset = newDraggedEnd - targetStart;
      return pushOffset;
    }

    return 0;
  }, [dragState, chords]);

  /**
   * Get visual transform for a chord during drag
   * This is used by the ChordCard to apply CSS transforms
   * Uses currentXRef for synchronous access to avoid render delays
   */
  const getChordTransform = useCallback((chordId: string): { deltaX: number; deltaWidth: number } => {
    if (!dragState.isDragging) {
      return { deltaX: 0, deltaWidth: 0 };
    }

    // Use ref for immediate synchronous access to currentX
    const deltaX = currentXRef.current - dragState.startX;
    const isSelected = selectedChordIds.has(chordId);
    const isDraggedChord = dragState.chordId === chordId;
    const isDraggingSelectedChord = dragState.chordId && selectedChordIds.has(dragState.chordId);

    // For move operations with multi-select
    if (dragState.mode === 'move') {
      // If this chord is selected and we're dragging any selected chord, move it together
      if (isSelected && isDraggingSelectedChord) {
        return { deltaX: deltaX, deltaWidth: 0 };
      }

      // Don't animate collision pushing during drag - only show glow line
      // The actual pushing happens on drag end
      return { deltaX: 0, deltaWidth: 0 };
    }

    // Handle the dragged chord itself for resize operations
    if (!isDraggedChord) {
      return { deltaX: 0, deltaWidth: 0 };
    }

    if (dragState.mode === 'resize-right' || dragState.mode === 'resize-right-push') {
      return { deltaX: 0, deltaWidth: deltaX };
    } else if (dragState.mode === 'resize-left' || dragState.mode === 'resize-left-push') {
      return { deltaX: deltaX, deltaWidth: -deltaX };
    }

    return { deltaX: 0, deltaWidth: 0 };
  }, [dragState, selectedChordIds]);

  /**
   * End drag - apply all changes to actual state
   */
  const endDrag = useCallback(() => {
    if (!dragState.isDragging || !dragState.chordId || !dragState.mode) {
      setDragState({
        isDragging: false,
        mode: null,
        chordId: null,
        startX: 0,
        currentX: 0,
        startPosition: 0,
        startWidth: 0,
      });
      setSnapIndicator({ show: false, position: 0, type: 'start', targetChordId: null });
      setInsertionPreview({ show: false, position: 0 });
      return;
    }

    const deltaX = dragState.currentX - dragState.startX;
    const updatedChords = [...originalChordsRef.current];
    const chordIndex = updatedChords.findIndex(c => c.id === dragState.chordId);

    if (chordIndex === -1) {
      setDragState({
        isDragging: false,
        mode: null,
        chordId: null,
        startX: 0,
        currentX: 0,
        startPosition: 0,
        startWidth: 0,
      });
      return;
    }

    const chord = updatedChords[chordIndex];

    // Apply the drag changes based on mode
    if (dragState.mode === 'move') {
      // Check if we're moving multiple selected chords
      const isMultiSelect = selectedChordIds.size > 1 && selectedChordIds.has(dragState.chordId);

      if (isMultiSelect) {
        // Move all selected chords together with proper reordering
        const positionDelta = deltaX;

        // Find the dragged chord to use as the reference for the group's target position
        const draggedChordOriginal = originalChordsRef.current.find(c => c.id === dragState.chordId);
        if (!draggedChordOriginal) return;

        // Calculate the target position for the dragged chord (this is where the yellow line shows)
        const draggedTargetPosition = snapToGrid(Math.max(0, draggedChordOriginal.position + positionDelta));

        // Separate selected and non-selected chords, preserving their original relative positions
        const selectedChords: Array<{ chord: ChordInstance; originalIndex: number; originalPosition: number }> = [];
        const nonSelectedChords: Array<{ chord: ChordInstance; originalIndex: number }> = [];

        originalChordsRef.current.forEach((c, i) => {
          if (selectedChordIds.has(c.id)) {
            selectedChords.push({
              chord: c,
              originalIndex: i,
              originalPosition: c.position,
            });
          } else {
            nonSelectedChords.push({ chord: c, originalIndex: i });
          }
        });

        // Sort selected chords by their original position to maintain relative order
        selectedChords.sort((a, b) => a.originalPosition - b.originalPosition);

        // Calculate the offset from the dragged chord to the start of the selected group
        const draggedChordInGroup = selectedChords.find(sc => sc.chord.id === dragState.chordId);
        if (!draggedChordInGroup) return;

        const groupStartOffset = draggedChordInGroup.originalPosition - selectedChords[0].originalPosition;

        // The group should start at: draggedTargetPosition - groupStartOffset
        const groupTargetStartPosition = Math.max(0, draggedTargetPosition - groupStartOffset);

        // Calculate total width of the selected group
        let totalGroupWidth = 0;
        selectedChords.forEach(({ chord }) => {
          totalGroupWidth += chord.width;
        });
        const groupTargetEndPosition = groupTargetStartPosition + totalGroupWidth;

        // Find insertion point: where should the selected group be inserted among non-selected chords?
        // Use the start position of the group to determine insertion
        let insertionIndex = 0;
        for (let i = 0; i < nonSelectedChords.length; i++) {
          const nonSelectedStart = nonSelectedChords[i].chord.position;
          if (groupTargetStartPosition >= nonSelectedStart + nonSelectedChords[i].chord.width) {
            insertionIndex = i + 1;
          }
        }

        // Build the final chord order: non-selected before insertion + selected group + non-selected after insertion
        const reorderedChords: ChordInstance[] = [];

        // Add non-selected chords before the insertion point
        for (let i = 0; i < insertionIndex; i++) {
          reorderedChords.push(nonSelectedChords[i].chord);
        }

        // Add all selected chords in their relative order
        selectedChords.forEach(({ chord }) => {
          reorderedChords.push(chord);
        });

        // Add non-selected chords after the insertion point
        for (let i = insertionIndex; i < nonSelectedChords.length; i++) {
          reorderedChords.push(nonSelectedChords[i].chord);
        }

        // Recalculate positions to place chords sequentially without gaps or overlaps
        let currentPosition = 0;
        const finalChords = reorderedChords.map((c) => {
          const updatedChord = {
            ...c,
            position: currentPosition,
            startTime: currentPosition / pixelsPerBeat,
          };
          currentPosition += c.width;
          return updatedChord;
        });

        // Update the chords array with the reordered and repositioned chords
        updatedChords.splice(0, updatedChords.length, ...finalChords);
      } else {
        // Single chord move
        let newPosition = snapToGrid(Math.max(0, dragState.startPosition + deltaX));

        // Check for snap targets at the new position
        const snapTargetStart = findSnapTarget(dragState.chordId, newPosition, true);
        if (snapTargetStart) {
          newPosition = snapTargetStart.snapPosition;
        }

        updatedChords[chordIndex] = {
          ...chord,
          position: newPosition,
          startTime: newPosition / pixelsPerBeat,
        };

        // Apply collision pushing to other chords
        const newDraggedEnd = newPosition + chord.width;

        updatedChords.forEach((c, i) => {
          if (i === chordIndex) return; // Skip the dragged chord

          const targetStart = c.position;
          const targetEnd = c.position + c.width;

          // If dragged chord overlaps with this chord, push it to the right
          if (newPosition < targetEnd && newDraggedEnd > targetStart) {
            const pushedPosition = newDraggedEnd;
            updatedChords[i] = {
              ...c,
              position: pushedPosition,
              startTime: pushedPosition / pixelsPerBeat,
            };
          }
        });
      }
    } else if (dragState.mode === 'resize-left') {
      let newPosition = Math.max(0, dragState.startPosition + deltaX);
      let newWidth = Math.max(pixelsPerBeat / 4, dragState.startWidth - deltaX);

      const snapTarget = findSnapTarget(dragState.chordId, newPosition, true);
      if (snapTarget) {
        newPosition = snapTarget.snapPosition;
        newWidth = dragState.startPosition + dragState.startWidth - newPosition;
      }

      updatedChords[chordIndex] = {
        ...chord,
        position: newPosition,
        width: newWidth,
        startTime: newPosition / pixelsPerBeat,
        duration: newWidth / pixelsPerBeat,
      };
    } else if (dragState.mode === 'resize-right') {
      let newWidth = Math.max(pixelsPerBeat / 4, dragState.startWidth + deltaX);
      const newEndPosition = dragState.startPosition + newWidth;

      const snapTarget = findSnapTarget(dragState.chordId, newEndPosition, false);
      if (snapTarget) {
        newWidth = snapTarget.snapPosition - dragState.startPosition;
      }

      updatedChords[chordIndex] = {
        ...chord,
        width: newWidth,
        duration: newWidth / pixelsPerBeat,
      };
    } else if (dragState.mode === 'resize-left-push') {
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

      updatedChords.forEach((c, i) => {
        if (i !== chordIndex && c.position + c.width <= dragState.startPosition) {
          updatedChords[i] = {
            ...c,
            position: Math.max(0, c.position + pushAmount),
            startTime: Math.max(0, c.position + pushAmount) / pixelsPerBeat,
          };
        }
      });
    } else if (dragState.mode === 'resize-right-push') {
      const newWidth = snapToGrid(Math.max(pixelsPerBeat / 4, dragState.startWidth + deltaX));
      const pushAmount = newWidth - dragState.startWidth;

      updatedChords[chordIndex] = {
        ...chord,
        width: newWidth,
        duration: newWidth / pixelsPerBeat,
      };

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

    onChordsUpdate(updatedChords);

    setDragState({
      isDragging: false,
      mode: null,
      chordId: null,
      startX: 0,
      currentX: 0,
      startPosition: 0,
      startWidth: 0,
    });

    setSnapIndicator({ show: false, position: 0, type: 'start', targetChordId: null });
    setInsertionPreview({ show: false, position: 0 });
  }, [dragState, pixelsPerBeat, snapToGrid, findSnapTarget, onChordsUpdate]);

  /**
   * Clear all cross-track selections (delegates to parent)
   */
  const clearSelection = useCallback(() => {
    clearAllSelections();
  }, [clearAllSelections]);

  /**
   * Start selection box drag
   */
  const startSelectionBox = useCallback((clientX: number, clientY: number, isMultiSelect: boolean) => {
    if (!isMultiSelect) {
      // Clear the full cross-track selection when starting a fresh box-select
      clearAllSelections();
    }
    setSelectionBox({
      isSelecting: true,
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
    });
  }, [clearAllSelections]);

  /**
   * Update selection box during drag
   */
  const updateSelectionBox = useCallback((clientX: number, clientY: number, trackRect: DOMRect) => {
    if (!selectionBox.isSelecting) return;

    setSelectionBox(prev => ({
      ...prev,
      currentX: clientX,
      currentY: clientY,
    }));

    // Calculate selection box bounds relative to track
    const boxLeft = Math.min(selectionBox.startX, clientX) - trackRect.left;
    const boxRight = Math.max(selectionBox.startX, clientX) - trackRect.left;
    const boxTop = Math.min(selectionBox.startY, clientY) - trackRect.top;
    const boxBottom = Math.max(selectionBox.startY, clientY) - trackRect.top;

    // Find chords that intersect with selection box
    const newSelectedIds = new Set<string>();
    chords.forEach(chord => {
      const chordLeft = chord.position;
      const chordRight = chord.position + chord.width;
      const chordTop = 0;
      const chordBottom = 120; // Track height

      // Check if chord intersects with selection box
      if (
        chordLeft < boxRight &&
        chordRight > boxLeft &&
        chordTop < boxBottom &&
        chordBottom > boxTop
      ) {
        newSelectedIds.add(chord.id);
      }
    });

    setSelectedChordIds(newSelectedIds);
  }, [selectionBox, chords, setSelectedChordIds]);

  /**
   * End selection box drag
   */
  const endSelectionBox = useCallback(() => {
    setSelectionBox({
      isSelecting: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
    });
  }, []);

  return {
    dragState,
    snapIndicator,
    insertionPreview,
    selectionBox,
    startDrag,
    handleDrag,
    endDrag,
    getChordTransform,
    clearSelection,
    startSelectionBox,
    updateSelectionBox,
    endSelectionBox,
  };
}


