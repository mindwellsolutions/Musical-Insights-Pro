/**
 * Optimized scale mode drag hook using CSS transforms for instant visual feedback
 * Only updates React state on drag end for maximum performance
 */

import { useState, useCallback, useRef } from 'react';
import { ScaleModeInstance } from '@/lib/chord-progression/types';
import { ScaleModeDragMode } from '@/components/chord-progression/ScaleModeCard';

interface ScaleModeDragState {
  isDragging: boolean;
  dragType: ScaleModeDragMode | null;
  scaleModeId: string | null;
  startX: number;
  currentX: number;
  startTime: number;
  startDuration: number;
}

interface SnapIndicator {
  show: boolean;
  position: number;
  type: 'start' | 'end';
  targetScaleModeId: string | null;
}

interface InsertionPreview {
  show: boolean;
  position: number;
}

export function useScaleModeDragOptimized(
  scaleModes: ScaleModeInstance[],
  onScaleModesUpdate: (scaleModes: ScaleModeInstance[]) => void,
  pixelsPerBeat: number,
  /** Lifted from parent — shared across chord + scale tracks */
  selectedScaleModeIds: Set<string>,
  setSelectedScaleModeIds: (ids: Set<string>) => void,
  /** Clears the full cross-track selection (chord + scale) */
  clearAllSelections: () => void,
) {
  const [dragState, setDragState] = useState<ScaleModeDragState>({
    isDragging: false,
    dragType: null,
    scaleModeId: null,
    startX: 0,
    currentX: 0,
    startTime: 0,
    startDuration: 0,
  });

  const [snapIndicator, setSnapIndicator] = useState<SnapIndicator>({
    show: false,
    position: 0,
    type: 'start',
    targetScaleModeId: null,
  });

  const [insertionPreview, setInsertionPreview] = useState<InsertionPreview>({
    show: false,
    position: 0,
  });

  // selectedScaleModeIds is now managed externally (see useTimelineSelection)

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

  const originalScaleModesRef = useRef<ScaleModeInstance[]>([]);
  const currentXRef = useRef<number>(0); // Track currentX synchronously for immediate visual feedback

  /**
   * Check if near another scale mode for snapping
   */
  const isNearby = useCallback((value: number, target: number, threshold: number = 8): boolean => {
    return Math.abs(value - target) <= threshold;
  }, []);

  /**
   * Find snap target for resize operations
   */
  const findSnapTarget = useCallback((
    currentScaleModeId: string,
    position: number,
    isStart: boolean
  ): { snapPosition: number; targetScaleModeId: string | null } | null => {
    const SNAP_THRESHOLD = 8;

    for (const scaleMode of scaleModes) {
      if (scaleMode.id === currentScaleModeId) continue;

      const scaleModeStart = scaleMode.position;
      const scaleModeEnd = scaleMode.position + scaleMode.width;

      if (isStart) {
        if (isNearby(position, scaleModeStart, SNAP_THRESHOLD)) {
          return { snapPosition: scaleModeStart, targetScaleModeId: scaleMode.id };
        }
        if (isNearby(position, scaleModeEnd, SNAP_THRESHOLD)) {
          return { snapPosition: scaleModeEnd, targetScaleModeId: scaleMode.id };
        }
      } else {
        if (isNearby(position, scaleModeStart, SNAP_THRESHOLD)) {
          return { snapPosition: scaleModeStart, targetScaleModeId: scaleMode.id };
        }
        if (isNearby(position, scaleModeEnd, SNAP_THRESHOLD)) {
          return { snapPosition: scaleModeEnd, targetScaleModeId: scaleMode.id };
        }
      }
    }

    return null;
  }, [scaleModes, isNearby]);

  /**
   * Start dragging
   */
  const handleDragStart = useCallback((
    scaleModeId: string,
    dragType: ScaleModeDragMode,
    startX: number
  ) => {
    const scaleMode = scaleModes.find(sm => sm.id === scaleModeId);
    if (!scaleMode) return;

    originalScaleModesRef.current = JSON.parse(JSON.stringify(scaleModes));
    currentXRef.current = startX; // Initialize ref

    // Store start positions for all selected scale modes for multi-select drag
    if (dragType === 'move' && selectedScaleModeIds.has(scaleModeId)) {
      scaleModes.forEach(sm => {
        if (selectedScaleModeIds.has(sm.id)) {
          // Store initial positions for group drag
        }
      });
    }

    setDragState({
      isDragging: true,
      dragType,
      scaleModeId,
      startX,
      currentX: startX,
      startTime: scaleMode.startTime,
      startDuration: scaleMode.duration,
    });
  }, [scaleModes, selectedScaleModeIds]);

  /**
   * Handle drag - update currentX and calculate insertion preview for move operations
   */
  const handleDragMove = useCallback((clientX: number) => {
    if (!dragState.isDragging) return;

    // Update ref immediately for synchronous access in getScaleModeTransform
    currentXRef.current = clientX;

    setDragState(prev => ({
      ...prev,
      currentX: clientX,
    }));

    // Show insertion preview line for move operations
    if (dragState.dragType === 'move' && dragState.scaleModeId) {
      const deltaX = clientX - dragState.startX;
      const deltaBeats = deltaX / pixelsPerBeat;
      const newStart = Math.max(0, dragState.startTime + deltaBeats);
      const newPosition = newStart * pixelsPerBeat;

      setInsertionPreview({
        show: true,
        position: newPosition,
      });
    } else {
      setInsertionPreview({ show: false, position: 0 });
    }
  }, [dragState.isDragging, dragState.dragType, dragState.scaleModeId, dragState.startX, dragState.startTime, pixelsPerBeat]);

  /**
   * Detect collision and calculate push offset for other blocks
   */
  const getCollisionPushOffset = useCallback((scaleModeId: string): number => {
    if (!dragState.isDragging || dragState.dragType !== 'move' || !dragState.scaleModeId) {
      return 0;
    }

    // Don't push the dragged scale mode itself
    if (scaleModeId === dragState.scaleModeId) {
      return 0;
    }

    const deltaX = dragState.currentX - dragState.startX;
    const draggedScaleMode = scaleModes.find(sm => sm.id === dragState.scaleModeId);
    const targetScaleMode = scaleModes.find(sm => sm.id === scaleModeId);

    if (!draggedScaleMode || !targetScaleMode) return 0;

    // Calculate new position of dragged scale mode
    const deltaBeats = deltaX / pixelsPerBeat;
    const newDraggedStart = Math.max(0, dragState.startTime + deltaBeats);
    const newDraggedPosition = newDraggedStart * pixelsPerBeat;
    const newDraggedEnd = newDraggedPosition + draggedScaleMode.width;

    // Check if dragged scale mode overlaps with target scale mode
    const targetStart = targetScaleMode.position;
    const targetEnd = targetScaleMode.position + targetScaleMode.width;

    // If dragged scale mode overlaps target, push target to the right
    if (newDraggedPosition < targetEnd && newDraggedEnd > targetStart) {
      // Push target so its start aligns with dragged scale mode's end
      const pushOffset = newDraggedEnd - targetStart;
      return pushOffset;
    }

    return 0;
  }, [dragState, scaleModes, pixelsPerBeat]);

  /**
   * Get visual transform for a scale mode during drag
   * Uses currentXRef for synchronous access to avoid render delays
   */
  const getScaleModeTransform = useCallback((scaleModeId: string): { deltaX: number; deltaWidth: number } => {
    if (!dragState.isDragging) {
      return { deltaX: 0, deltaWidth: 0 };
    }

    // Use ref for immediate synchronous access to currentX
    const deltaX = currentXRef.current - dragState.startX;
    const isSelected = selectedScaleModeIds.has(scaleModeId);
    const isDraggedScaleMode = dragState.scaleModeId === scaleModeId;
    const isMultiSelect = selectedScaleModeIds.size > 1 && selectedScaleModeIds.has(dragState.scaleModeId || '');

    // For move operations
    if (dragState.dragType === 'move') {
      // If multi-select is active and this scale mode is selected, move it with the group
      if (isMultiSelect && isSelected) {
        return { deltaX: deltaX, deltaWidth: 0 };
      }

      // If single select and this is the dragged scale mode, move it
      if (!isMultiSelect && isDraggedScaleMode) {
        return { deltaX: deltaX, deltaWidth: 0 };
      }

      // Don't animate collision pushing during drag - only show glow line
      // The actual pushing happens on drag end
      return { deltaX: 0, deltaWidth: 0 };
    }

    // Handle resize operations (only for the dragged scale mode, not multi-select)
    if (!isDraggedScaleMode) {
      return { deltaX: 0, deltaWidth: 0 };
    }

    if (dragState.dragType === 'resize-right' || dragState.dragType === 'resize-right-push') {
      return { deltaX: 0, deltaWidth: deltaX };
    } else if (dragState.dragType === 'resize-left' || dragState.dragType === 'resize-left-push') {
      return { deltaX: deltaX, deltaWidth: -deltaX };
    }

    return { deltaX: 0, deltaWidth: 0 };
  }, [dragState, selectedScaleModeIds]);

  /**
   * End drag - apply all changes to actual state
   */
  const handleDragEnd = useCallback(() => {
    if (!dragState.isDragging || !dragState.scaleModeId || !dragState.dragType) {
      setDragState({
        isDragging: false,
        dragType: null,
        scaleModeId: null,
        startX: 0,
        currentX: 0,
        startTime: 0,
        startDuration: 0,
      });
      setSnapIndicator({ show: false, position: 0, type: 'start', targetScaleModeId: null });
      setInsertionPreview({ show: false, position: 0 });
      return;
    }

    const deltaX = dragState.currentX - dragState.startX;
    const deltaBeats = deltaX / pixelsPerBeat;
    const scaleModeIndex = originalScaleModesRef.current.findIndex(sm => sm.id === dragState.scaleModeId);

    if (scaleModeIndex === -1) {
      setDragState({
        isDragging: false,
        dragType: null,
        scaleModeId: null,
        startX: 0,
        currentX: 0,
        startTime: 0,
        startDuration: 0,
      });
      return;
    }

    const updatedScaleModes = [...originalScaleModesRef.current];
    const scaleMode = updatedScaleModes[scaleModeIndex];

    // Apply the drag changes based on type
    if (dragState.dragType === 'move') {
      // Check if we're moving multiple selected scale modes
      const isMultiSelect = selectedScaleModeIds.size > 1 && selectedScaleModeIds.has(dragState.scaleModeId);

      if (isMultiSelect) {
        // Move all selected scale modes together
        const timeDelta = deltaBeats;

        // Find the rightmost edge of all selected scale modes after moving
        let maxEndPosition = 0;

        updatedScaleModes.forEach((sm, i) => {
          if (selectedScaleModeIds.has(sm.id)) {
            const newStart = Math.max(0, sm.startTime + timeDelta);
            const newPos = newStart * pixelsPerBeat;
            const newEnd = newPos + sm.width;
            maxEndPosition = Math.max(maxEndPosition, newEnd);

            updatedScaleModes[i] = {
              ...sm,
              startTime: newStart,
              position: newPos,
            };
          }
        });

        // Apply collision pushing to non-selected scale modes with cascading
        // Sort scale modes by position to handle cascading pushes correctly
        const sortedIndices = updatedScaleModes
          .map((sm, i) => ({ scaleMode: sm, index: i }))
          .sort((a, b) => a.scaleMode.position - b.scaleMode.position);

        // Track which scale modes have been pushed and need to cascade
        const pushedScaleModes = new Map<number, number>(); // index -> new position

        sortedIndices.forEach(({ scaleMode: sm, index: i }) => {
          if (!selectedScaleModeIds.has(sm.id)) {
            let currentPosition = pushedScaleModes.get(i) ?? sm.position;
            const targetEnd = currentPosition + sm.width;

            // Check if any selected scale mode overlaps with this scale mode
            let maxPushPosition = currentPosition;

            updatedScaleModes.forEach((selectedSM) => {
              if (selectedScaleModeIds.has(selectedSM.id)) {
                const selectedStart = selectedSM.position;
                const selectedEnd = selectedSM.position + selectedSM.width;

                // If selected scale mode overlaps, push this scale mode to the right
                if (selectedStart < targetEnd && selectedEnd > currentPosition) {
                  maxPushPosition = Math.max(maxPushPosition, selectedEnd);
                }
              }
            });

            // Check if any previously pushed scale mode overlaps with this scale mode
            pushedScaleModes.forEach((pushedPos, pushedIndex) => {
              const pushedSM = updatedScaleModes[pushedIndex];
              const pushedEnd = pushedPos + pushedSM.width;

              if (pushedPos < targetEnd && pushedEnd > currentPosition) {
                maxPushPosition = Math.max(maxPushPosition, pushedEnd);
              }
            });

            if (maxPushPosition > currentPosition) {
              pushedScaleModes.set(i, maxPushPosition);
              const pushedStartTime = maxPushPosition / pixelsPerBeat;
              updatedScaleModes[i] = {
                ...sm,
                position: maxPushPosition,
                startTime: pushedStartTime,
              };
            }
          }
        });
      } else {
        // Single scale mode move
        const newStart = Math.max(0, dragState.startTime + deltaBeats);
        const newPosition = newStart * pixelsPerBeat;

        // Check for snap targets at the new position
        const snapTargetStart = findSnapTarget(dragState.scaleModeId, newPosition, true);
        const finalStart = snapTargetStart ? snapTargetStart.snapPosition / pixelsPerBeat : newStart;
        const finalPosition = finalStart * pixelsPerBeat;

        updatedScaleModes[scaleModeIndex] = {
          ...scaleMode,
          startTime: finalStart,
          position: finalPosition,
        };

        // Apply collision pushing to other scale modes
        const newDraggedEnd = finalPosition + scaleMode.width;

        updatedScaleModes.forEach((sm, i) => {
          if (i === scaleModeIndex) return; // Skip the dragged scale mode

          const targetStart = sm.position;
          const targetEnd = sm.position + sm.width;

          // If dragged scale mode overlaps with this scale mode, push it to the right
          if (finalPosition < targetEnd && newDraggedEnd > targetStart) {
            const pushedPosition = newDraggedEnd;
            const pushedStartTime = pushedPosition / pixelsPerBeat;
            updatedScaleModes[i] = {
              ...sm,
              position: pushedPosition,
              startTime: pushedStartTime,
            };
          }
        });
      }
    } else if (dragState.dragType === 'resize-left' || dragState.dragType === 'resize-left-push') {
      let newStart = Math.max(0, dragState.startTime + deltaBeats);
      let newDuration = Math.max(1, dragState.startDuration - (newStart - dragState.startTime));
      const newPosition = newStart * pixelsPerBeat;

      const snapTarget = findSnapTarget(dragState.scaleModeId, newPosition, true);
      if (snapTarget) {
        newStart = snapTarget.snapPosition / pixelsPerBeat;
        newDuration = dragState.startTime + dragState.startDuration - newStart;
      }

      updatedScaleModes[scaleModeIndex] = {
        ...scaleMode,
        startTime: newStart,
        duration: newDuration,
        position: newStart * pixelsPerBeat,
        width: newDuration * pixelsPerBeat,
      };
    } else if (dragState.dragType === 'resize-right' || dragState.dragType === 'resize-right-push') {
      let newDuration = Math.max(1, dragState.startDuration + deltaBeats);
      const newEndPosition = (dragState.startTime + newDuration) * pixelsPerBeat;

      const snapTarget = findSnapTarget(dragState.scaleModeId, newEndPosition, false);
      if (snapTarget) {
        newDuration = (snapTarget.snapPosition / pixelsPerBeat) - dragState.startTime;
      }

      updatedScaleModes[scaleModeIndex] = {
        ...scaleMode,
        duration: newDuration,
        width: newDuration * pixelsPerBeat,
      };
    }

    onScaleModesUpdate(updatedScaleModes);

    setDragState({
      isDragging: false,
      dragType: null,
      scaleModeId: null,
      startX: 0,
      currentX: 0,
      startTime: 0,
      startDuration: 0,
    });

    setSnapIndicator({ show: false, position: 0, type: 'start', targetScaleModeId: null });
    setInsertionPreview({ show: false, position: 0 });
  }, [dragState, pixelsPerBeat, findSnapTarget, onScaleModesUpdate]);

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

    // Find scale modes that intersect with selection box
    const newSelectedIds = new Set<string>();
    scaleModes.forEach(scaleMode => {
      const scaleModeLeft = scaleMode.position;
      const scaleModeRight = scaleMode.position + scaleMode.width;
      const scaleModeTop = 0;
      const scaleModeBottom = 120; // Track height

      // Check if scale mode intersects with selection box
      if (
        scaleModeLeft < boxRight &&
        scaleModeRight > boxLeft &&
        scaleModeTop < boxBottom &&
        scaleModeBottom > boxTop
      ) {
        newSelectedIds.add(scaleMode.id);
      }
    });

    setSelectedScaleModeIds(newSelectedIds);
  }, [selectionBox, scaleModes, setSelectedScaleModeIds]);

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
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    getScaleModeTransform,
    clearSelection,
    startSelectionBox,
    updateSelectionBox,
    endSelectionBox,
  };
}


