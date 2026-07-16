'use client';

/**
 * Individual scale/mode card component with drag and resize
 * Optimized with React.memo for performance
 */

import { useState, memo } from 'react';
import { ScaleModeInstance } from '@/lib/chord-progression/types';
import { Star, Trash2, Edit2, ChevronsLeft, ChevronsRight, MoveHorizontal } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

export type ScaleModeDragMode = 'move' | 'resize-left' | 'resize-right' | 'resize-left-push' | 'resize-right-push';

interface ScaleModeCardProps {
  scaleMode: ScaleModeInstance;
  isDragging: boolean;
  isSelected?: boolean;
  onDragStart: (scaleModeId: string, mode: ScaleModeDragMode, clientX: number) => void;
  onDelete: () => void;
  onEdit?: () => void;
  onClick?: (e: React.MouseEvent) => void;
  transform?: { deltaX: number; deltaWidth: number }; // CSS transform for smooth dragging
}

const ScaleModeCard = memo(function ScaleModeCard({
  scaleMode,
  isDragging,
  isSelected = false,
  onDragStart,
  onDelete,
  onEdit,
  onClick,
  transform = { deltaX: 0, deltaWidth: 0 },
}: ScaleModeCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Determine border color based on compatibility score (purple theme)
  const getBorderColor = (score: number) => {
    if (score >= 9) return '#8b5cf6'; // Purple
    if (score >= 7) return '#a78bfa'; // Light purple
    if (score >= 5) return '#c4b5fd'; // Lighter purple
    return '#6b7280'; // Gray
  };

  const borderColor = getBorderColor(scaleMode.compatibilityScore);

  // Calculate visual position and width with transform
  const visualLeft = scaleMode.position + transform.deltaX;
  const visualWidth = Math.max(scaleMode.width + transform.deltaWidth, 120);

  // Dynamic text sizing based on block width for readability at all zoom levels
  const getTextSize = () => {
    if (visualWidth < 100) return 'text-xs'; // Very small blocks
    if (visualWidth < 150) return 'text-xs'; // Small blocks
    if (visualWidth < 220) return 'text-sm'; // Medium blocks
    if (visualWidth < 300) return 'text-sm'; // Large blocks
    return 'text-sm'; // Extra large blocks (keep readable, not too big)
  };

  const getRatingSize = () => {
    if (visualWidth < 100) return 'w-2 h-2'; // Very small
    if (visualWidth < 150) return 'w-2.5 h-2.5'; // Small
    return 'w-3 h-3'; // Normal
  };

  /**
   * Handle mouse down for drag operations
   */
  const handleMouseDown = (e: React.MouseEvent, mode: ScaleModeDragMode) => {
    e.preventDefault();
    e.stopPropagation();
    onDragStart(scaleMode.id, mode, e.clientX);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={`
            absolute top-1/2 -translate-y-1/2 rounded-lg
            ${isDragging ? 'opacity-90 scale-105 cursor-grabbing shadow-2xl transition-none' : 'cursor-default transition-all duration-150'}
          `}
          style={{
            left: `${visualLeft}px`,
            width: `${visualWidth}px`,
            height: '104px',
            background: 'linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)',
            border: isSelected
              ? '3px solid #3b82f6'
              : `2px solid ${isHovered ? borderColor : 'transparent'}`,
            boxShadow: isSelected
              ? `0 0 0 2px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 15px rgba(59, 130, 246, 0.5)`
              : isHovered
                ? `0 4px 12px rgba(0, 0, 0, 0.4), 0 0 15px ${borderColor}40`
                : '0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            zIndex: isSelected ? 150 : isDragging ? 1000 : isHovered ? 100 : 10,
            pointerEvents: 'auto',
            userSelect: 'none',
            willChange: isDragging ? 'transform' : 'auto',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={(e) => {
            if (onClick) {
              e.stopPropagation();
              onClick(e);
            }
          }}
        >
          {/* 6-Dot Drag Handle - Horizontal Top Center */}
          <div
            className={`absolute top-2 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing transition-opacity duration-200 z-20 ${
              isHovered ? 'opacity-100' : 'opacity-50'
            }`}
            onMouseDown={(e) => handleMouseDown(e, 'move')}
            title="Drag to reorder"
          >
            <div className="flex gap-[2px] p-1 hover:bg-white/10 rounded">
              <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
              <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
              <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
              <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
              <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
              <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
            </div>
          </div>

          {/* Scale Name with Rating on Same Line - Dynamic Sizing */}
          <div className="absolute inset-0 flex items-center justify-center px-3">
            <div className="flex items-center gap-2">
              <span
                className={`${getTextSize()} font-semibold text-white truncate transition-all duration-150`}
                style={{
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                }}
              >
                {scaleMode.rootNote} {scaleMode.scaleName}
              </span>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Star className={`${getRatingSize()} text-yellow-400 fill-yellow-400 transition-all duration-150`} />
                <span className={`${visualWidth < 150 ? 'text-[10px]' : 'text-xs'} text-[#b0b0b0] font-medium transition-all duration-150`}>
                  {scaleMode.compatibilityScore}/10
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons - Top Right */}
          {isHovered && !isDragging && (
            <div className="absolute top-1 right-1 flex gap-1 z-20">
              {onEdit && (
                <button
                  className="h-6 w-6 p-0 bg-black/50 hover:bg-black/70 transition-all rounded flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  title="Edit scale/mode"
                >
                  <Edit2 className="w-3 h-3 text-white" />
                </button>
              )}
              <button
                className="h-6 w-6 p-0 bg-black/50 hover:bg-red-600/70 transition-all rounded flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                title="Delete"
              >
                <Trash2 className="w-3 h-3 text-white" />
              </button>
            </div>
          )}

          {/* Resize Buttons - Bottom */}
          {isHovered && !isDragging && (
            <>
              {/* Left Resize Buttons */}
              <div className="absolute left-1 bottom-1 flex gap-1 z-20">
                <button
                  className="h-7 w-7 p-0 bg-black/50 hover:bg-black/70 transition-all rounded flex items-center justify-center cursor-ew-resize"
                  title="Resize left (overwrite)"
                  onMouseDown={(e) => handleMouseDown(e, 'resize-left')}
                >
                  <ChevronsLeft className="w-3.5 h-3.5 text-white" />
                </button>
                <button
                  className="h-7 w-7 p-0 bg-black/50 hover:bg-black/70 transition-all rounded flex items-center justify-center cursor-ew-resize"
                  title="Resize left (push others)"
                  onMouseDown={(e) => handleMouseDown(e, 'resize-left-push')}
                >
                  <MoveHorizontal className="w-3.5 h-3.5 text-white" />
                </button>
              </div>

              {/* Right Resize Buttons */}
              <div className="absolute right-1 bottom-1 flex gap-1 z-20">
                <button
                  className="h-7 w-7 p-0 bg-black/50 hover:bg-black/70 transition-all rounded flex items-center justify-center cursor-ew-resize"
                  title="Resize right (push others)"
                  onMouseDown={(e) => handleMouseDown(e, 'resize-right-push')}
                >
                  <MoveHorizontal className="w-3.5 h-3.5 text-white" />
                </button>
                <button
                  className="h-7 w-7 p-0 bg-black/50 hover:bg-black/70 transition-all rounded flex items-center justify-center cursor-ew-resize"
                  title="Resize right (overwrite)"
                  onMouseDown={(e) => handleMouseDown(e, 'resize-right')}
                >
                  <ChevronsRight className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </>
          )}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        {onEdit && (
          <ContextMenuItem onClick={onEdit}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Scale/Mode
          </ContextMenuItem>
        )}
        <ContextMenuItem onClick={onDelete} className="text-red-500">
          <Trash2 className="w-4 h-4 mr-2" />
          Remove
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
});

export default ScaleModeCard;
