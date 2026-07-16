'use client';

/**
 * Scale/Mode track component with drag and resize support
 */

import { useRef } from 'react';
import { ChordInstance, ScaleModeInstance } from '@/lib/chord-progression/types';
import ScaleModeCard from './ScaleModeCard';
import { useScaleModeDragOptimized } from '@/hooks/chord-progression/useScaleModeDragOptimized';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ScaleModeTrackProps {
  scaleModes: ScaleModeInstance[];
  chords: ChordInstance[];
  pixelsPerBeat: number;
  onScaleModesUpdate: (scaleModes: ScaleModeInstance[]) => void;
  onAddScaleModeClick?: () => void;
  onEditScaleMode?: (scaleMode: ScaleModeInstance) => void;
  /** Shared cross-track selection state from useTimelineSelection */
  selectedScaleModeIds: Set<string>;
  onScaleModeSelect: (scaleModeId: string, isMultiSelect: boolean) => void;
  onSetScaleModeSelection: (ids: Set<string>) => void;
  onClearAllSelections: () => void;
}

export default function ScaleModeTrack({
  scaleModes,
  chords,
  pixelsPerBeat,
  onScaleModesUpdate,
  onAddScaleModeClick,
  onEditScaleMode,
  selectedScaleModeIds,
  onScaleModeSelect,
  onSetScaleModeSelection,
  onClearAllSelections,
}: ScaleModeTrackProps) {
  const {
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
  } = useScaleModeDragOptimized(
    scaleModes,
    onScaleModesUpdate,
    pixelsPerBeat,
    selectedScaleModeIds,
    onSetScaleModeSelection,
    onClearAllSelections,
  );

  const trackRef = useRef<HTMLDivElement>(null);

  const handleDeleteScaleMode = (id: string) => {
    onScaleModesUpdate(scaleModes.filter(sm => sm.id !== id));
    clearSelection();
  };

  // Calculate position for the "+ Add Scale/Mode" button - always after the rightmost scale mode
  const getAddButtonPosition = () => {
    if (scaleModes.length === 0) return 16; // Start position if no scale modes

    // Find the rightmost scale mode considering both position and width
    let maxEndPosition = 0;
    scaleModes.forEach(scaleMode => {
      const transform = getScaleModeTransform(scaleMode.id);
      const visualPosition = scaleMode.position + transform.deltaX;
      const visualWidth = scaleMode.width + transform.deltaWidth;
      const endPosition = visualPosition + visualWidth;
      maxEndPosition = Math.max(maxEndPosition, endPosition);
    });

    return maxEndPosition + 16; // 16px gap after rightmost scale mode
  };

  return (
    <div
      ref={trackRef}
      className="relative bg-[#1a1a1a] border-b border-[#333333]"
      style={{ height: 88 }}
      onMouseDown={(e) => {
        // Start selection box if clicking on empty space (not on a scale mode)
        if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('py-3')) {
          const isMultiSelect = e.shiftKey || e.ctrlKey || e.metaKey;
          startSelectionBox(e.clientX, e.clientY, isMultiSelect);
        }
      }}
      onMouseMove={(e) => {
        if (dragState.isDragging) {
          handleDragMove(e.clientX);
        } else if (selectionBox.isSelecting && trackRef.current) {
          updateSelectionBox(e.clientX, e.clientY, trackRef.current.getBoundingClientRect());
        }
      }}
      onMouseUp={() => {
        if (dragState.isDragging) {
          handleDragEnd();
        } else if (selectionBox.isSelecting) {
          endSelectionBox();
        }
      }}
      onMouseLeave={() => {
        if (dragState.isDragging) {
          handleDragEnd();
        } else if (selectionBox.isSelecting) {
          endSelectionBox();
        }
      }}
    >
      {/* Track Content */}
      <div className="py-3 relative" style={{ height: '100%' }}>
        {scaleModes.map(scaleMode => (
          <ScaleModeCard
            key={scaleMode.id}
            scaleMode={scaleMode}
            isDragging={dragState.isDragging && dragState.scaleModeId === scaleMode.id}
            isSelected={selectedScaleModeIds.has(scaleMode.id)}
            transform={getScaleModeTransform(scaleMode.id)}
            onDragStart={handleDragStart}
            onDelete={() => handleDeleteScaleMode(scaleMode.id)}
            onEdit={onEditScaleMode ? () => onEditScaleMode(scaleMode) : undefined}
            onClick={(e: React.MouseEvent) => {
              // Shift OR Ctrl/Cmd → multi-select (works across chord + scale tracks)
              const isMultiSelect = e.shiftKey || e.ctrlKey || e.metaKey;
              onScaleModeSelect(scaleMode.id, isMultiSelect);
            }}
          />
        ))}

        {/* Insertion Preview Line - Shows where block will be placed when moving */}
        {insertionPreview.show && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-yellow-400 pointer-events-none z-50"
            style={{
              left: `${insertionPreview.position}px`,
              boxShadow: '0 0 12px rgba(250, 204, 21, 0.8), 0 0 24px rgba(250, 204, 21, 0.4)',
              filter: 'drop-shadow(0 0 8px rgba(250, 204, 21, 0.6))',
            }}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 w-2 -left-0.5 bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent blur-md" />
          </div>
        )}

        {/* Snap Indicator - Visual guide when aligning with other blocks */}
        {snapIndicator.show && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#3b82f6] pointer-events-none z-50 animate-pulse"
            style={{
              left: `${snapIndicator.position}px`,
              boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)',
            }}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 w-1 -left-0.25 bg-gradient-to-r from-transparent via-[#3b82f6]/50 to-transparent blur-sm" />
          </div>
        )}

        {/* Add Scale/Mode Button after last scale mode */}
        {onAddScaleModeClick && (
          <Button
            onClick={onAddScaleModeClick}
            variant="outline"
            size="sm"
            className="absolute top-1/2 -translate-y-1/2 h-12 px-4 border-2 border-dashed border-[#3a3a3a] hover:border-[#8b5cf6] hover:bg-gradient-to-b hover:from-[#8b5cf6]/20 hover:to-[#7c3aed]/10 hover:text-white hover:shadow-lg hover:shadow-[#8b5cf6]/30 transition-all duration-200 flex items-center gap-2 bg-[#0a0a0a]/50 backdrop-blur-sm"
            style={{ left: `${getAddButtonPosition()}px` }}
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-semibold">Add Scale/Mode</span>
          </Button>
        )}

        {/* Selection Box */}
        {selectionBox.isSelecting && trackRef.current && (
          <div
            className="absolute pointer-events-none z-[60] border-2 border-[#8b5cf6] bg-[#8b5cf6]/10"
            style={{
              left: `${Math.min(selectionBox.startX, selectionBox.currentX) - trackRef.current.getBoundingClientRect().left}px`,
              top: `${Math.min(selectionBox.startY, selectionBox.currentY) - trackRef.current.getBoundingClientRect().top}px`,
              width: `${Math.abs(selectionBox.currentX - selectionBox.startX)}px`,
              height: `${Math.abs(selectionBox.currentY - selectionBox.startY)}px`,
            }}
          />
        )}

        {scaleModes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-[#666666] pointer-events-none">
            <p className="text-sm">Click + to add scales/modes to chords</p>
          </div>
        )}
      </div>
    </div>
  );
}

