/**
 * Hook for managing scale/mode card drag and resize interactions
 */

import { useState, useCallback } from 'react';
import { ScaleModeInstance } from '@/lib/chord-progression/types';
import { ScaleModeDragMode } from '@/components/chord-progression/ScaleModeCard';
import { snapToGrid } from '@/lib/chord-progression/timeline-utils';

interface ScaleModeDragState {
  isDragging: boolean;
  dragType: ScaleModeDragMode | null;
  scaleModeId: string | null;
  startX: number;
  startTime: number;
  startDuration: number;
}

interface SnapIndicator {
  show: boolean;
  position: number;
  type: 'start' | 'end';
  targetScaleModeId: string | null;
}

export function useScaleModeInteractions(
  scaleModes: ScaleModeInstance[],
  onScaleModesUpdate: (scaleModes: ScaleModeInstance[]) => void,
  pixelsPerBeat: number,
  snapEnabled: boolean = true
) {
  const [dragState, setDragState] = useState<ScaleModeDragState>({
    isDragging: false,
    dragType: null,
    scaleModeId: null,
    startX: 0,
    startTime: 0,
    startDuration: 0,
  });

  const [snapIndicator, setSnapIndicator] = useState<SnapIndicator>({
    show: false,
    position: 0,
    type: 'start',
    targetScaleModeId: null,
  });

  /**
   * Snap value to nearest grid point - only for move operations
   */
  const snapValue = useCallback((value: number, gridSize: number): number => {
    if (!snapEnabled) return value;
    return snapToGrid(value, gridSize, true);
  }, [snapEnabled]);

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
    currentScaleModeId: string,
    position: number,
    isStart: boolean
  ): { snapPosition: number; targetScaleModeId: string | null } | null => {
    const SNAP_THRESHOLD = 8; // pixels

    for (const scaleMode of scaleModes) {
      if (scaleMode.id === currentScaleModeId) continue;

      const scaleModeStart = scaleMode.position;
      const scaleModeEnd = scaleMode.position + scaleMode.width;

      if (isStart) {
        // Snapping start edge to other scale mode's start or end
        if (isNearby(position, scaleModeStart, SNAP_THRESHOLD)) {
          return { snapPosition: scaleModeStart, targetScaleModeId: scaleMode.id };
        }
        if (isNearby(position, scaleModeEnd, SNAP_THRESHOLD)) {
          return { snapPosition: scaleModeEnd, targetScaleModeId: scaleMode.id };
        }
      } else {
        // Snapping end edge to other scale mode's start or end
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
   * Start drag operation
   */
  const handleDragStart = useCallback((
    scaleModeId: string,
    dragType: ScaleModeDragMode,
    startX: number
  ) => {
    const scaleMode = scaleModes.find(sm => sm.id === scaleModeId);
    if (!scaleMode) return;

    setDragState({
      isDragging: true,
      dragType,
      scaleModeId,
      startX,
      startTime: scaleMode.startTime,
      startDuration: scaleMode.duration,
    });
  }, [scaleModes]);

  /**
   * Handle drag move - Optimized for smooth performance
   */
  const handleDragMove = useCallback((clientX: number) => {
    if (!dragState.isDragging || !dragState.scaleModeId) return;

    // Use requestAnimationFrame for smooth 60fps updates
    requestAnimationFrame(() => {
      const deltaX = clientX - dragState.startX;
      const deltaBeats = deltaX / pixelsPerBeat;

      const scaleModeIndex = scaleModes.findIndex(sm => sm.id === dragState.scaleModeId);
      if (scaleModeIndex === -1) return;

      const scaleMode = scaleModes[scaleModeIndex];
      let updatedScaleModes = [...scaleModes];

    switch (dragState.dragType) {
      case 'move': {
        // DRAG TO REORDER - Reorder scale modes by swapping positions
        const newStartTime = Math.max(0, snapValue(dragState.startTime + deltaBeats, 1));
        const newPosition = newStartTime * pixelsPerBeat;

        // Update dragged scale mode's visual position
        updatedScaleModes[scaleModeIndex] = {
          ...scaleMode,
          startTime: newStartTime,
          position: newPosition,
        };

        // Find the insertion point based on the center of the dragged scale mode
        const draggedCenter = newPosition + scaleMode.width / 2;

        // Get all other scale modes sorted by their original position
        const otherScaleModes = updatedScaleModes
          .map((sm, i) => ({ scaleMode: sm, originalIndex: i }))
          .filter((_, i) => i !== scaleModeIndex)
          .sort((a, b) => a.scaleMode.position - b.scaleMode.position);

        // Find where to insert the dragged scale mode
        let insertIndex = 0;
        for (let i = 0; i < otherScaleModes.length; i++) {
          const otherCenter = otherScaleModes[i].scaleMode.position + otherScaleModes[i].scaleMode.width / 2;
          if (draggedCenter > otherCenter) {
            insertIndex = i + 1;
          }
        }

        // Rebuild the scale mode array in the new order
        const reorderedScaleModes = [...otherScaleModes];
        reorderedScaleModes.splice(insertIndex, 0, { scaleMode: updatedScaleModes[scaleModeIndex], originalIndex: scaleModeIndex });

        // Recalculate positions to place scale modes sequentially without gaps
        let currentPosition = 0;
        const finalScaleModes = reorderedScaleModes.map(({ scaleMode: sm }) => {
          const updatedScaleMode = {
            ...sm,
            position: currentPosition,
            startTime: currentPosition / pixelsPerBeat,
          };
          currentPosition += sm.width;
          return updatedScaleMode;
        });

        updatedScaleModes = finalScaleModes;

        // Clear snap indicator for move operations
        setSnapIndicator({ show: false, position: 0, type: 'start', targetScaleModeId: null });
        break;
      }

      case 'resize-left':
      case 'resize-left-push': {
        // SMOOTH resize with snap-to-align
        let newStart = Math.max(0, dragState.startTime + deltaBeats);
        let newDuration = Math.max(1, dragState.startDuration - (newStart - dragState.startTime));
        const newPosition = newStart * pixelsPerBeat;

        // Check for snap targets
        const snapTarget = findSnapTarget(dragState.scaleModeId!, newPosition, true);
        if (snapTarget) {
          newStart = snapTarget.snapPosition / pixelsPerBeat;
          newDuration = dragState.startTime + dragState.startDuration - newStart;
          setSnapIndicator({
            show: true,
            position: snapTarget.snapPosition,
            type: 'start',
            targetScaleModeId: snapTarget.targetScaleModeId,
          });
        } else {
          setSnapIndicator({ show: false, position: 0, type: 'start', targetScaleModeId: null });
        }

        updatedScaleModes[scaleModeIndex] = {
          ...scaleMode,
          startTime: newStart,
          duration: newDuration,
          position: newStart * pixelsPerBeat,
          width: newDuration * pixelsPerBeat,
        };
        break;
      }

      case 'resize-right':
      case 'resize-right-push': {
        // SMOOTH resize with snap-to-align
        let newDuration = Math.max(1, dragState.startDuration + deltaBeats);
        const newEndPosition = (dragState.startTime + newDuration) * pixelsPerBeat;

        // Check for snap targets
        const snapTarget = findSnapTarget(dragState.scaleModeId!, newEndPosition, false);
        if (snapTarget) {
          newDuration = (snapTarget.snapPosition / pixelsPerBeat) - dragState.startTime;
          setSnapIndicator({
            show: true,
            position: snapTarget.snapPosition,
            type: 'end',
            targetScaleModeId: snapTarget.targetScaleModeId,
          });
        } else {
          setSnapIndicator({ show: false, position: 0, type: 'start', targetScaleModeId: null });
        }

        updatedScaleModes[scaleModeIndex] = {
          ...scaleMode,
          duration: newDuration,
          width: newDuration * pixelsPerBeat,
        };
        break;
      }
    }

      onScaleModesUpdate(updatedScaleModes);
    });
  }, [dragState, scaleModes, pixelsPerBeat, snapValue, onScaleModesUpdate, findSnapTarget]);

  /**
   * End drag operation
   */
  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      dragType: null,
      scaleModeId: null,
      startX: 0,
      startTime: 0,
      startDuration: 0,
    });

    // Clear snap indicator
    setSnapIndicator({ show: false, position: 0, type: 'start', targetScaleModeId: null });
  }, []);

  return {
    dragState,
    snapIndicator,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
}

