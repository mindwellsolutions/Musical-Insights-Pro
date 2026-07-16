'use client';

import React, { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';
import { IntervalStep } from '@/lib/custom-progressions/types';
import { DiatonicTriad } from '@/lib/music-theory/triad-membership/types';
import { DegreePickerPopover } from './DegreePickerPopover';

interface IntervalStepCardProps {
  theme: ThemeConfig;
  step: IntervalStep;
  index: number;
  diatonicDegrees: DiatonicTriad[];
  isDragging: boolean;
  style?: React.CSSProperties;
  cardRef: React.RefObject<HTMLDivElement | null>;
  onDragStart: (index: number, clientX: number) => void;
  onRemove: (index: number) => void;
  onEdit: (index: number, updated: IntervalStep) => void;
}

export function IntervalStepCard({
  theme, step, index, diatonicDegrees, isDragging, style, cardRef,
  onDragStart, onRemove, onEdit,
}: IntervalStepCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const color = step.color;

  const handleCardBodyClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-drag-handle]')) return;
    if ((e.target as HTMLElement).closest('[data-remove-btn]')) return;
    setIsEditing(true);
  };

  const handleDegreeSelect = (deg: DiatonicTriad) => {
    onEdit(index, { ...step, degree: deg.degree, degreeIndex: deg.degreeIndex, rootNote: deg.rootNote, color: deg.color, quality: deg.quality });
    setIsEditing(false);
  };

  const borderStyle = isEditing
    ? '2px solid rgba(255,255,255,0.8)'
    : isHovered && !isDragging
    ? `1px solid ${color}`
    : `1px solid ${color}99`;

  const boxShadow = isEditing
    ? `0 0 0 3px ${color}, 0 4px 20px ${color}88`
    : isHovered && !isDragging
    ? `0 4px 16px ${color}66`
    : `0 2px 8px ${color}33`;

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div
        ref={cardRef}
        onClick={handleCardBodyClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: 68,
          height: 78,
          borderRadius: 10,
          background: `linear-gradient(160deg, ${color}dd, ${color}99)`,
          border: borderStyle,
          boxShadow,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '6px 6px 4px',
          position: 'relative',
          cursor: isDragging ? 'grabbing' : 'pointer',
          userSelect: 'none',
          ...style,
        }}
      >
        {/* Step number badge */}
        <div style={{
          position: 'absolute', top: 4, right: 4,
          width: 16, height: 16, borderRadius: '50%',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 700, color: 'white',
        }}>
          {index + 1}
        </div>

        {/* Drag handle */}
        <div
          data-drag-handle
          onMouseDown={(e) => { e.stopPropagation(); onDragStart(index, e.clientX); }}
          onTouchStart={(e) => { e.preventDefault(); onDragStart(index, e.touches[0].clientX); }}
          style={{
            fontSize: 10, color: 'rgba(255,255,255,0.45)', cursor: 'grab',
            letterSpacing: 2, lineHeight: 1, paddingTop: 2,
            userSelect: 'none',
          }}
        >
          ⠿ ⠿ ⠿
        </div>

        {/* Degree label */}
        <span style={{ fontSize: 13, fontWeight: 700, color: 'white', marginTop: 2 }}>
          {step.degree}
        </span>

        {/* Note name */}
        <span style={{ fontSize: 18, fontWeight: 700, color: 'white', lineHeight: 1 }}>
          {step.rootNote}
        </span>

        {/* Remove button */}
        <button
          data-remove-btn
          onClick={(e) => { e.stopPropagation(); onRemove(index); }}
          style={{
            position: 'absolute', bottom: 4, right: 4,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.45)', padding: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'color 120ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
        >
          <X size={12} />
        </button>
      </div>

      <DegreePickerPopover
        theme={theme}
        isOpen={isEditing}
        anchorRef={cardRef}
        diatonicDegrees={diatonicDegrees}
        currentDegreeIndex={step.degreeIndex}
        onSelect={handleDegreeSelect}
        onClose={() => setIsEditing(false)}
      />
    </div>
  );
}
