'use client';

/**
 * Enhanced chord card component with robust drag-and-drop
 * Supports drag-to-reorder and resize operations
 * Shows interval-colored chord tone badges at the bottom of each block
 */

import { useState, memo, useRef, useEffect, useMemo } from 'react';
import { ChordInstance } from '@/lib/chord-progression/types';
import { NOTE_COLORS } from '@/lib/musicTheory';
import { ChevronsLeft, ChevronsRight, MoveHorizontal, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DragMode } from '@/hooks/chord-progression/useChordDragOptimized';
import { computeChordTones } from '@/lib/chord-progression/chord-tones-utils';

interface ChordCardProps {
  chord: ChordInstance;
  isDragging: boolean;
  isSelected?: boolean;
  onDragStart: (chordId: string, mode: DragMode, clientX: number) => void;
  onDelete: () => void;
  onEdit?: () => void;
  onClick?: (e: React.MouseEvent) => void;
  transform?: { deltaX: number; deltaWidth: number }; // CSS transform for smooth dragging
}

const ChordCard = memo(function ChordCard({
  chord,
  isDragging,
  isSelected = false,
  onDragStart,
  onDelete,
  onEdit,
  onClick,
  transform = { deltaX: 0, deltaWidth: 0 },
}: ChordCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  // Get root note color
  const rootNote = chord.rootNote || chord.chordSymbol.replace(/[^A-G#b]/g, '');
  const rootNoteColor = NOTE_COLORS[rootNote] || '#3b82f6';

  // Calculate visual position and width with transform
  const visualLeft = chord.position + transform.deltaX;
  const visualWidth = Math.max(chord.width + transform.deltaWidth, 100);

  // Compute tone badges for the horizontal centered row.
  // Each badge is ~44px (14px font + padding + gap). Reserve ~80px for chord name + divider + margins.
  const chordToneBadges = useMemo(() => {
    const available = visualWidth - 80;
    if (available < 44) return [];
    const all = computeChordTones(chord.chordSymbol);
    const max = Math.max(1, Math.floor(available / 44));
    return all.slice(0, max);
  }, [chord.chordSymbol, visualWidth]);

  /**
   * Handle mouse down for drag operations
   */
  const handleMouseDown = (e: React.MouseEvent, mode: DragMode) => {
    e.preventDefault();
    e.stopPropagation();

    isDraggingRef.current = true;
    onDragStart(chord.id, mode, e.clientX);
  };

  /**
   * Handle context menu
   */
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  // Close context menu when clicking outside
  useEffect(() => {
    if (showContextMenu) {
      const handleClick = () => setShowContextMenu(false);
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showContextMenu]);

  return (
    <>
      <div
        className={`
          absolute top-1/2 -translate-y-1/2 rounded-lg
          ${isDragging ? 'opacity-90 scale-105 cursor-grabbing shadow-2xl transition-none' : 'cursor-pointer transition-all duration-150'}
        `}
        style={{
          left: `${visualLeft}px`,
          width: `${visualWidth}px`,
          height: '72px',
          background: `linear-gradient(135deg, ${rootNoteColor} 0%, color-mix(in srgb, ${rootNoteColor} 65%, black) 100%)`,
          border: isSelected
            ? '2px solid #3b82f6'
            : isHovered
              ? '2px solid rgba(255, 255, 255, 0.28)'
              : '2px solid transparent',
          boxShadow: isSelected
            ? `0 0 0 2px rgba(59, 130, 246, 0.3), 0 6px 14px rgba(0, 0, 0, 0.4), 0 0 16px rgba(59, 130, 246, 0.45)`
            : isDragging
              ? '0 10px 20px rgba(0, 0, 0, 0.5)'
              : isHovered
                ? `0 6px 14px rgba(0, 0, 0, 0.4), 0 0 16px ${rootNoteColor}70, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                : '0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          zIndex: isSelected ? 150 : isDragging ? 1000 : isHovered ? 100 : 10,
          pointerEvents: 'auto',
          userSelect: 'none',
          willChange: isDragging ? 'transform' : 'auto',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onContextMenu={handleContextMenu}
        onClick={(e) => {
          if (!isDraggingRef.current && onClick) {
            e.stopPropagation();
            onClick(e);
          }
        }}
      >
        {/* Drag Handle — compact dots at top center */}
        <div
          className={`absolute top-1.5 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing transition-opacity duration-200 z-20 ${
            isHovered ? 'opacity-75' : 'opacity-25'
          }`}
          onMouseDown={(e) => handleMouseDown(e, 'move')}
          title="Drag to reorder"
        >
          <div className="flex gap-[2px] px-1.5 py-0.5 hover:bg-white/10 rounded">
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className="w-1 h-1 bg-white rounded-full shadow-sm" />
            ))}
          </div>
        </div>

        {/* Edit / Delete — top-right, hover only */}
        {isHovered && (
          <div className="absolute top-1.5 right-1.5 flex gap-0.5 z-20">
            {onEdit && (
              <Button
                size="sm"
                variant="ghost"
                className="h-5 w-5 p-0 bg-black/30 hover:bg-black/50 transition-all"
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
              >
                <Edit2 className="w-2.5 h-2.5 text-white" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-5 w-5 p-0 bg-red-900/40 hover:bg-red-900/70 transition-all"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
              <Trash2 className="w-2.5 h-2.5 text-red-300" />
            </Button>
          </div>
        )}

        {/* Main content row — true X+Y center of the block */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 px-2 overflow-hidden pointer-events-none">
          {/* Chord Name */}
          <span
            className="text-base font-bold text-white select-none shrink-0 leading-none"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
          >
            {chord.chordSymbol}
          </span>

          {/* Vertical divider — only when tones are present */}
          {chordToneBadges.length > 0 && (
            <div className="w-px h-5 bg-white/30 shrink-0" />
          )}

          {/* Chord Tone badges — original size, horizontal */}
          {chordToneBadges.length > 0 && (
            <div className="flex gap-[5px]">
              {chordToneBadges.map((tone, i) => (
                <div
                  key={i}
                  className="rounded-md shrink-0 text-white font-bold leading-none"
                  style={{
                    fontSize: '14px',
                    padding: '5px 10px',
                    backgroundColor: tone.noteColor,
                    border: `1px solid ${tone.intervalColor}90`,
                    boxShadow: `0 0 8px ${tone.intervalColor}70`,
                  }}
                  title={`${tone.note} (${tone.intervalLabel})`}
                >
                  {tone.note}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resize handles — bottom corners, hover only */}
        {isHovered && (
          <>
            <div className="absolute left-1 bottom-1 flex gap-0.5 z-20">
              <button
                className="h-5 w-5 p-0 bg-black/50 hover:bg-black/70 transition-all rounded flex items-center justify-center cursor-ew-resize"
                title="Resize left (overwrite)"
                onMouseDown={(e) => handleMouseDown(e, 'resize-left')}
              >
                <ChevronsLeft className="w-3 h-3 text-white" />
              </button>
              <button
                className="h-5 w-5 p-0 bg-black/50 hover:bg-black/70 transition-all rounded flex items-center justify-center cursor-ew-resize"
                title="Resize left (push)"
                onMouseDown={(e) => handleMouseDown(e, 'resize-left-push')}
              >
                <MoveHorizontal className="w-3 h-3 text-white" />
              </button>
            </div>
            <div className="absolute right-1 bottom-1 flex gap-0.5 z-20">
              <button
                className="h-5 w-5 p-0 bg-black/50 hover:bg-black/70 transition-all rounded flex items-center justify-center cursor-ew-resize"
                title="Resize right (push)"
                onMouseDown={(e) => handleMouseDown(e, 'resize-right-push')}
              >
                <MoveHorizontal className="w-3 h-3 text-white" />
              </button>
              <button
                className="h-5 w-5 p-0 bg-black/50 hover:bg-black/70 transition-all rounded flex items-center justify-center cursor-ew-resize"
                title="Resize right (overwrite)"
                onMouseDown={(e) => handleMouseDown(e, 'resize-right')}
              >
                <ChevronsRight className="w-3 h-3 text-white" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Simple Context Menu */}
      {showContextMenu && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setShowContextMenu(false)}
          />
          <div
            className="fixed z-[9999] bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg shadow-xl py-1 min-w-[160px]"
            style={{
              left: contextMenuPos.x,
              top: contextMenuPos.y,
            }}
          >
            {onEdit && (
              <button
                className="w-full px-3 py-2 text-left text-sm text-white hover:bg-[#2a2a2a] flex items-center gap-2"
                onClick={() => {
                  onEdit();
                  setShowContextMenu(false);
                }}
              >
                <Edit2 className="w-4 h-4" />
                Edit Chord
              </button>
            )}
            <button
              className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-[#2a2a2a] flex items-center gap-2"
              onClick={() => {
                onDelete();
                setShowContextMenu(false);
              }}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </>
  );
});

export default ChordCard;
