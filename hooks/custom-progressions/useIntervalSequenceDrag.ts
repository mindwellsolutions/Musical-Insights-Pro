'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { IntervalStep } from '@/lib/custom-progressions/types';

interface SequenceDragState {
  isDragging: boolean;
  dragIndex: number | null;
  hoverIndex: number | null;
  startX: number;
}

export function useIntervalSequenceDrag(
  steps: IntervalStep[],
  cardRefs: (React.RefObject<HTMLDivElement | null>)[],
  onSequenceChange: (reordered: IntervalStep[]) => void,
) {
  const [dragState, setDragState] = useState<SequenceDragState>({
    isDragging: false,
    dragIndex: null,
    hoverIndex: null,
    startX: 0,
  });

  const originalStepsRef = useRef<IntervalStep[]>([]);
  const currentXRef = useRef<number>(0);
  const hoverIndexRef = useRef<number | null>(null);

  const computeHoverIndex = useCallback((clientX: number): number => {
    let idx = steps.length; // default: after last
    for (let i = 0; i < cardRefs.length; i++) {
      const el = cardRefs[i]?.current;
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const mid = rect.left + rect.width / 2;
      if (clientX < mid) { idx = i; break; }
    }
    return idx;
  }, [cardRefs, steps.length]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    e.preventDefault();
    currentXRef.current = e.clientX;
    const hi = computeHoverIndex(e.clientX);
    if (hi !== hoverIndexRef.current) {
      hoverIndexRef.current = hi;
      setDragState(prev => ({ ...prev, hoverIndex: hi }));
    }
  }, [computeHoverIndex]);

  const handleMouseUp = useCallback(() => {
    const di = dragState.dragIndex;
    const hi = hoverIndexRef.current;
    if (di !== null && hi !== null && hi !== di && hi !== di + 1) {
      const arr = [...originalStepsRef.current];
      const [moved] = arr.splice(di, 1);
      const insertAt = hi > di ? hi - 1 : hi;
      arr.splice(insertAt, 0, moved);
      onSequenceChange(arr);
    }
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    window.removeEventListener('touchmove', handleTouchMove as any);
    window.removeEventListener('touchend', handleTouchEnd as any);
    setDragState({ isDragging: false, dragIndex: null, hoverIndex: null, startX: 0 });
    hoverIndexRef.current = null;
  }, [dragState.dragIndex, handleMouseMove, onSequenceChange]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const clientX = e.touches[0].clientX;
    currentXRef.current = clientX;
    const hi = computeHoverIndex(clientX);
    if (hi !== hoverIndexRef.current) {
      hoverIndexRef.current = hi;
      setDragState(prev => ({ ...prev, hoverIndex: hi }));
    }
  }, [computeHoverIndex]);

  const handleTouchEnd = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  const onDragStart = useCallback((index: number, clientX: number) => {
    originalStepsRef.current = [...steps];
    hoverIndexRef.current = index;
    currentXRef.current = clientX;
    setDragState({ isDragging: true, dragIndex: index, hoverIndex: index, startX: clientX });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove as any, { passive: false });
    window.addEventListener('touchend', handleTouchEnd as any);
  }, [steps, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove as any);
      window.removeEventListener('touchend', handleTouchEnd as any);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const getCardStyle = useCallback((index: number): React.CSSProperties => {
    if (index === dragState.dragIndex) {
      return { opacity: 0.45, transform: 'scale(0.97)', transition: 'none' };
    }
    return { opacity: 1, transform: 'translateX(0)', transition: 'transform 120ms ease-out' };
  }, [dragState.dragIndex]);

  return {
    dragState,
    onDragStart,
    getCardStyle,
    insertionGhostIndex: dragState.hoverIndex,
  };
}
