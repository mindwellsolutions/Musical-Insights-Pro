'use client';

/**
 * Chord progression track with robust drag-and-drop
 */

import { useEffect, useRef } from 'react';
import { ChordInstance } from '@/lib/chord-progression/types';
import { useChordDragOptimized } from '@/hooks/chord-progression/useChordDragOptimized';
import ChordCard from './ChordCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ChordProgressionTrackProps {
  chords: ChordInstance[];
  pixelsPerBeat: number;
  onChordsUpdate: (chords: ChordInstance[]) => void;
  onEditChord?: (chord: ChordInstance) => void;
  onAddChordClick?: () => void;
  onChordClick?: (chord: ChordInstance) => void;
  /** Shared cross-track selection state from useTimelineSelection */
  selectedChordIds: Set<string>;
  onChordSelect: (chordId: string, isMultiSelect: boolean) => void;
  onSetChordSelection: (ids: Set<string>) => void;
  onClearAllSelections: () => void;
}

export default function ChordProgressionTrack({
  chords,
  pixelsPerBeat,
  onChordsUpdate,
  onEditChord,
  onAddChordClick,
  onChordClick,
  selectedChordIds,
  onChordSelect,
  onSetChordSelection,
  onClearAllSelections,
}: ChordProgressionTrackProps) {
  const {
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
  } = useChordDragOptimized(
    chords,
    onChordsUpdate,
    pixelsPerBeat,
    selectedChordIds,
    onSetChordSelection,
    onClearAllSelections,
  );

  const trackRef = useRef<HTMLDivElement>(null);

  // Calculate position for the "+ Add Chord" button - always after the rightmost chord
  const getAddButtonPosition = () => {
    if (chords.length === 0) return 16; // Start position if no chords

    // Find the rightmost chord considering both position and width
    let maxEndPosition = 0;
    chords.forEach(chord => {
      const transform = getChordTransform(chord.id);
      const visualPosition = chord.position + transform.deltaX;
      const visualWidth = chord.width + transform.deltaWidth;
      const endPosition = visualPosition + visualWidth;
      maxEndPosition = Math.max(maxEndPosition, endPosition);
    });

    return maxEndPosition + 16; // 16px gap after rightmost chord
  };

  // Global mouse move and mouse up handlers
  useEffect(() => {
    if (!dragState.isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleDrag(e.clientX);
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      endDrag();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState.isDragging, handleDrag, endDrag]);

  return (
    <div
      ref={trackRef}
      className="relative bg-[#1a1a1a] border-b border-[#333333]"
      style={{ height: 88, minHeight: 88 }}
      onMouseDown={(e) => {
        // Start selection box if clicking on empty space (not on a chord)
        if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('py-3')) {
          const isMultiSelect = e.shiftKey || e.ctrlKey || e.metaKey;
          startSelectionBox(e.clientX, e.clientY, isMultiSelect);
        }
      }}
      onMouseMove={(e) => {
        if (selectionBox.isSelecting && trackRef.current) {
          updateSelectionBox(e.clientX, e.clientY, trackRef.current.getBoundingClientRect());
        }
      }}
      onMouseUp={() => {
        if (selectionBox.isSelecting) {
          endSelectionBox();
        }
      }}
      onMouseLeave={() => {
        if (selectionBox.isSelecting) {
          endSelectionBox();
        }
      }}
    >
      {/* Track Content */}
      <div className="py-3 relative" style={{ height: '100%', position: 'relative' }}>
        {chords.map(chord => (
          <ChordCard
            key={chord.id}
            chord={chord}
            isDragging={dragState.isDragging && dragState.chordId === chord.id}
            isSelected={selectedChordIds.has(chord.id)}
            transform={getChordTransform(chord.id)}
            onDragStart={startDrag}
            onDelete={() => {
              onChordsUpdate(chords.filter(c => c.id !== chord.id));
              clearSelection();
            }}
            onEdit={onEditChord ? () => onEditChord(chord) : undefined}
            onClick={(e: React.MouseEvent) => {
              // Shift OR Ctrl/Cmd → multi-select (works across chord + scale tracks)
              const isMultiSelect = e.shiftKey || e.ctrlKey || e.metaKey;
              onChordSelect(chord.id, isMultiSelect);

              if (onChordClick) {
                onChordClick(chord);
              }
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

        {/* Add Chord Button after last chord */}
        {onAddChordClick && (
          <Button
            onClick={onAddChordClick}
            variant="outline"
            size="sm"
            className="absolute top-1/2 -translate-y-1/2 h-12 px-4 border-2 border-dashed border-[#3a3a3a] hover:border-[#3b82f6] hover:bg-gradient-to-b hover:from-[#3b82f6]/20 hover:to-[#2563eb]/10 hover:text-white hover:shadow-lg hover:shadow-[#3b82f6]/30 transition-all duration-200 flex items-center gap-2 bg-[#0a0a0a]/50 backdrop-blur-sm"
            style={{ left: `${getAddButtonPosition()}px` }}
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-semibold">Add Chord</span>
          </Button>
        )}

        {/* Selection Box */}
        {selectionBox.isSelecting && trackRef.current && (
          <div
            className="absolute pointer-events-none z-[60] border-2 border-[#3b82f6] bg-[#3b82f6]/10"
            style={{
              left: `${Math.min(selectionBox.startX, selectionBox.currentX) - trackRef.current.getBoundingClientRect().left}px`,
              top: `${Math.min(selectionBox.startY, selectionBox.currentY) - trackRef.current.getBoundingClientRect().top}px`,
              width: `${Math.abs(selectionBox.currentX - selectionBox.startX)}px`,
              height: `${Math.abs(selectionBox.currentY - selectionBox.startY)}px`,
            }}
          />
        )}

        {/* Empty state message when no chords */}
        {chords.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-[#666666] pointer-events-none">
            <p className="text-sm">Click + to add chords</p>
          </div>
        )}
      </div>
    </div>
  );
}

